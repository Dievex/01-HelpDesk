import { prisma } from '../../db/prisma.js';
import { env } from '../../config/env.js';
import { AppError } from '../../utils/AppError.js';

const ROLES_CON_EQUIPO = ['AGENTE', 'SUPERVISOR'];
const ESTADOS_TOMABLES = { ABIERTO: 'ASIGNADO', ESCALADO: 'EN_PROGRESO' };
// Reabierto->EnProgreso no tiene caso de uso propio (Diagrama de Estados): resolver
// desde Reabierto asume implícitamente esa transición, igual que Tomar ya asume
// Escalado->EnProgreso.
const ESTADOS_RESOLUBLES = ['ASIGNADO', 'EN_PROGRESO', 'REABIERTO'];
const ESTADOS_ESCALABLES = ['ASIGNADO', 'EN_PROGRESO'];
const ESTADOS_REASIGNABLES = ['ASIGNADO', 'EN_PROGRESO', 'REABIERTO'];

const AUTOR_SELECT = { select: { id: true, nombre: true } };

const INCLUDE_RESUMEN = { categoria: true, prioridad: true };

const INCLUDE_DETALLE = {
  categoria: true,
  prioridad: { include: { sla: true } },
  solicitante: AUTOR_SELECT,
  agente: AUTOR_SELECT,
  comentarios: { include: { autor: AUTOR_SELECT }, orderBy: { fecha: 'asc' } },
  adjuntos: { include: { autor: AUTOR_SELECT }, orderBy: { fecha: 'asc' } },
  eventosAuditoria: { include: { autor: AUTOR_SELECT }, orderBy: { fecha: 'asc' } },
};

// UC-03: Prioridad "Baja" por defecto -- el Solicitante no la elige.
export async function crear({ solicitanteId, titulo, descripcion, categoriaId }) {
  validarTexto(titulo, 'El título');
  validarTexto(descripcion, 'La descripción');

  const categoria = await prisma.categoria.findUnique({ where: { id: categoriaId } });
  if (!categoria) {
    throw new AppError('La categoría indicada no existe', 400);
  }

  const prioridadBaja = await prisma.prioridad.findUnique({ where: { nombre: 'Baja' } });
  if (!prioridadBaja) {
    throw new AppError('No existe la Prioridad "Baja" por defecto -- créala antes de crear tickets', 500);
  }

  const ticket = await prisma.ticket.create({
    data: { titulo, descripcion, solicitanteId, categoriaId, prioridadId: prioridadBaja.id },
  });

  const evento = await registrarEvento(ticket.id, 'CREACION', solicitanteId);
  // FA-2: si la Categoría no tiene Equipo asignado, el ticket queda sin enrutar.
  await notificarSupervisoresDeCategoria(categoriaId, `Nuevo ticket: "${titulo}"`, evento.id);

  return cargarConDetalle(ticket.id);
}

export async function verDetalle(ticketId, actorId) {
  const ticket = await cargarConDetalle(ticketId);
  const actor = await prisma.usuario.findUnique({ where: { id: actorId } });
  if (!tieneAcceso(actor, ticket)) {
    throw new AppError('No tienes acceso a este ticket', 403);
  }
  return ticket;
}

export async function listarPropios(solicitanteId) {
  return prisma.ticket.findMany({
    where: { solicitanteId },
    include: INCLUDE_RESUMEN,
    orderBy: { fechaCreacion: 'desc' },
  });
}

// UC-14: tickets sin asignar del Equipo del actor + los que el actor tiene asignados.
export async function listarCola(actorId) {
  const actor = await prisma.usuario.findUnique({ where: { id: actorId } });
  if (!actor.equipoId) {
    return { sinAsignar: [], asignadosAMi: [] };
  }

  const [sinAsignar, asignadosAMi] = await Promise.all([
    prisma.ticket.findMany({
      where: {
        agenteId: null,
        estado: { in: Object.keys(ESTADOS_TOMABLES) },
        categoria: { equipoId: actor.equipoId },
      },
      include: INCLUDE_RESUMEN,
      orderBy: { fechaCreacion: 'asc' },
    }),
    prisma.ticket.findMany({
      where: { agenteId: actorId, estado: { not: 'CERRADO' } },
      include: INCLUDE_RESUMEN,
      orderBy: { fechaCreacion: 'asc' },
    }),
  ]);

  return { sinAsignar, asignadosAMi };
}

// FA-1: condición de carrera -- el guard va en el `where` del update, no en un
// check-then-act, para que dos agentes tomando el mismo ticket a la vez no puedan
// pisarse (solo uno de los dos updateMany afecta una fila).
export async function tomar(ticketId, agenteId) {
  const existente = await prisma.ticket.findUnique({ where: { id: ticketId }, select: { id: true } });
  if (!existente) {
    throw new AppError('Ticket no encontrado', 404);
  }

  let tomado = false;
  for (const [estadoOrigen, estadoDestino] of Object.entries(ESTADOS_TOMABLES)) {
    const resultado = await prisma.ticket.updateMany({
      where: { id: ticketId, agenteId: null, estado: estadoOrigen },
      data: { agenteId, estado: estadoDestino },
    });
    if (resultado.count > 0) {
      tomado = true;
      break;
    }
  }

  if (!tomado) {
    throw new AppError('El ticket ya no está disponible (lo tomó otro agente o cambió de estado)', 409);
  }

  await registrarEvento(ticketId, 'ASIGNACION', agenteId);
  return cargarConDetalle(ticketId);
}

export async function resolver(ticketId, agenteId, { comentario }) {
  const ticket = await prisma.ticket.findUnique({ where: { id: ticketId } });
  if (!ticket) {
    throw new AppError('Ticket no encontrado', 404);
  }
  if (ticket.agenteId !== agenteId) {
    throw new AppError('Solo el agente asignado puede resolver este ticket', 403);
  }
  if (!ESTADOS_RESOLUBLES.includes(ticket.estado)) {
    throw new AppError('El ticket no está en un estado que permita resolverlo', 409);
  }

  if (comentario?.trim()) {
    await prisma.comentario.create({ data: { ticketId, autorId: agenteId, texto: comentario.trim() } });
  }

  const fechaResolucion = new Date();
  const fechaLimiteReapertura = new Date(fechaResolucion.getTime() + env.plazoReaperturaMinutos * 60_000);

  await prisma.ticket.update({
    where: { id: ticketId },
    data: { estado: 'RESUELTO', fechaResolucion, fechaLimiteReapertura },
  });

  const evento = await registrarEvento(ticketId, 'RESOLUCION', agenteId);
  await notificar(ticket.solicitanteId, `Tu ticket "${ticket.titulo}" fue resuelto`, evento.id);

  return cargarConDetalle(ticketId);
}

// UC-13: libera la asignación (vuelve a la cola vía UC-11), no la transfiere a un
// agente concreto. El motivo se guarda como Comentario -- EventoAuditoria no tiene
// campo de texto propio, mismo mecanismo que el comentario opcional de UC-12.
export async function escalar(ticketId, agenteId, { motivo }) {
  validarTexto(motivo, 'El motivo');

  const ticket = await prisma.ticket.findUnique({ where: { id: ticketId } });
  if (!ticket) {
    throw new AppError('Ticket no encontrado', 404);
  }
  if (ticket.agenteId !== agenteId || !ESTADOS_ESCALABLES.includes(ticket.estado)) {
    throw new AppError('Solo puedes escalar un ticket que tengas asignado y en curso', 409);
  }

  await prisma.ticket.update({ where: { id: ticketId }, data: { estado: 'ESCALADO', agenteId: null } });
  await prisma.comentario.create({ data: { ticketId, autorId: agenteId, texto: motivo.trim() } });

  const evento = await registrarEvento(ticketId, 'ESCALAMIENTO', agenteId);
  await notificarSupervisoresDeCategoria(ticket.categoriaId, `Ticket escalado: "${ticket.titulo}"`, evento.id);

  return cargarConDetalle(ticketId);
}

// UC-18: mismo resultado sobre el Ticket que UC-11 Tomar, solo cambia quién lo dispara.
export async function asignar(ticketId, supervisorId, { agenteId }) {
  const { ticket, supervisor } = await cargarTicketDelEquipoSupervisor(ticketId, supervisorId);
  await validarAgenteDelEquipo(agenteId, supervisor.equipoId);

  let asignado = false;
  for (const [estadoOrigen, estadoDestino] of Object.entries(ESTADOS_TOMABLES)) {
    const resultado = await prisma.ticket.updateMany({
      where: { id: ticketId, agenteId: null, estado: estadoOrigen },
      data: { agenteId, estado: estadoDestino },
    });
    if (resultado.count > 0) {
      asignado = true;
      break;
    }
  }
  if (!asignado) {
    throw new AppError('El ticket ya no está disponible (lo tomaron o asignaron primero)', 409);
  }

  const evento = await registrarEvento(ticketId, 'ASIGNACION', supervisorId);
  await notificar(agenteId, `Se te asignó el ticket: "${ticket.titulo}"`, evento.id);

  return cargarConDetalle(ticketId);
}

// UC-19: cambia el Agente sin tocar el estado -- distinto de Asignar.
export async function reasignar(ticketId, supervisorId, { agenteId }) {
  const { ticket, supervisor } = await cargarTicketDelEquipoSupervisor(ticketId, supervisorId);
  if (!ticket.agenteId) {
    throw new AppError('Este ticket no tiene agente asignado -- usa Asignar', 409);
  }
  await validarAgenteDelEquipo(agenteId, supervisor.equipoId);

  // FA-1: condición de carrera -- el ticket cambió de agente o de estado mientras
  // el Supervisor decidía (p.ej. el agente original ya lo resolvió o escaló).
  const resultado = await prisma.ticket.updateMany({
    where: { id: ticketId, agenteId: ticket.agenteId, estado: { in: ESTADOS_REASIGNABLES } },
    data: { agenteId },
  });
  if (resultado.count === 0) {
    throw new AppError('El ticket cambió de estado o de agente -- ya no se puede reasignar', 409);
  }

  const evento = await registrarEvento(ticketId, 'REASIGNACION', supervisorId);
  await notificar(agenteId, `Se te reasignó el ticket: "${ticket.titulo}"`, evento.id);

  return cargarConDetalle(ticketId);
}

// UC-41: el Solicitante no elige Prioridad al crear (Baja por defecto) -- el
// Supervisor la confirma o la corrige una única vez.
export async function priorizar(ticketId, supervisorId, { prioridadId }) {
  const { ticket } = await cargarTicketDelEquipoSupervisor(ticketId, supervisorId);
  if (ticket.prioridadConfirmada) {
    throw new AppError('Este ticket ya fue priorizado', 409);
  }

  const prioridad = await prisma.prioridad.findUnique({ where: { id: prioridadId } });
  if (!prioridad) {
    throw new AppError('La prioridad indicada no existe', 400);
  }

  await prisma.ticket.update({
    where: { id: ticketId },
    data: { prioridadId, prioridadConfirmada: true },
  });
  await registrarEvento(ticketId, 'PRIORIZACION', supervisorId);

  return cargarConDetalle(ticketId);
}

export async function confirmarCierre(ticketId, solicitanteId) {
  const ticket = await prisma.ticket.findUnique({ where: { id: ticketId } });
  if (!ticket) {
    throw new AppError('Ticket no encontrado', 404);
  }
  if (ticket.solicitanteId !== solicitanteId) {
    throw new AppError('Solo quien reportó el ticket puede confirmar su cierre', 403);
  }
  if (ticket.estado !== 'RESUELTO') {
    throw new AppError('El ticket no está en un estado que permita confirmar su cierre', 409);
  }

  await prisma.ticket.update({ where: { id: ticketId }, data: { estado: 'CERRADO' } });
  const evento = await registrarEvento(ticketId, 'CIERRE', solicitanteId);
  await notificarSupervisoresDeCategoria(ticket.categoriaId, `Ticket cerrado: "${ticket.titulo}"`, evento.id);

  return cargarConDetalle(ticketId);
}

// UC-08: conserva el mismo Agente -- a diferencia de Escalar, reabrir continúa el
// mismo trabajo en curso, no lo devuelve a la cola.
export async function reabrir(ticketId, solicitanteId, { motivo }) {
  validarTexto(motivo, 'El motivo');

  const ticket = await prisma.ticket.findUnique({ where: { id: ticketId } });
  if (!ticket) {
    throw new AppError('Ticket no encontrado', 404);
  }
  if (ticket.solicitanteId !== solicitanteId) {
    throw new AppError('Solo quien reportó el ticket puede reabrirlo', 403);
  }
  if (ticket.estado !== 'RESUELTO') {
    throw new AppError('El ticket no está en un estado que permita reabrirlo', 409);
  }

  await prisma.ticket.update({ where: { id: ticketId }, data: { estado: 'REABIERTO' } });
  await prisma.comentario.create({ data: { ticketId, autorId: solicitanteId, texto: motivo.trim() } });

  const evento = await registrarEvento(ticketId, 'REAPERTURA', solicitanteId);
  if (ticket.agenteId) {
    await notificar(ticket.agenteId, `Reabrieron el ticket: "${ticket.titulo}"`, evento.id);
  }

  return cargarConDetalle(ticketId);
}

// FA-1 de UC-07: cierre automático disparado por el Sistema al vencer el Plazo de
// Reapertura -- mismo resultado que Confirmar Cierre, pero con autor = ninguno.
export async function cerrarPorVencimiento() {
  const vencidos = await prisma.ticket.findMany({
    where: { estado: 'RESUELTO', fechaLimiteReapertura: { lte: new Date() } },
  });

  for (const ticket of vencidos) {
    await prisma.ticket.update({ where: { id: ticket.id }, data: { estado: 'CERRADO' } });
    const evento = await registrarEvento(ticket.id, 'CIERRE', null);
    await notificarSupervisoresDeCategoria(
      ticket.categoriaId,
      `Ticket cerrado automáticamente: "${ticket.titulo}"`,
      evento.id,
    );
  }

  return vencidos.length;
}

async function cargarTicketDelEquipoSupervisor(ticketId, supervisorId) {
  const supervisor = await prisma.usuario.findUnique({ where: { id: supervisorId } });
  const ticket = await prisma.ticket.findUnique({ where: { id: ticketId }, include: { categoria: true } });
  if (!ticket) {
    throw new AppError('Ticket no encontrado', 404);
  }
  if (!supervisor.equipoId || ticket.categoria.equipoId !== supervisor.equipoId) {
    throw new AppError('Solo puedes operar sobre tickets de tu propio Equipo', 403);
  }
  return { ticket, supervisor };
}

async function validarAgenteDelEquipo(agenteId, equipoId) {
  const agente = await prisma.usuario.findUnique({ where: { id: agenteId } });
  if (!agente || agente.equipoId !== equipoId || !ROLES_CON_EQUIPO.includes(agente.rol)) {
    throw new AppError('El agente indicado no pertenece a tu Equipo', 400);
  }
}

async function notificarSupervisoresDeCategoria(categoriaId, mensaje, eventoId) {
  const categoria = await prisma.categoria.findUnique({ where: { id: categoriaId } });
  if (!categoria?.equipoId) return;
  const supervisores = await prisma.usuario.findMany({
    where: { equipoId: categoria.equipoId, rol: 'SUPERVISOR' },
  });
  await Promise.all(supervisores.map((s) => notificar(s.id, mensaje, eventoId)));
}

function tieneAcceso(actor, ticket) {
  if (ticket.solicitanteId === actor.id) return true;
  if (ticket.agenteId === actor.id) return true;
  return ROLES_CON_EQUIPO.includes(actor.rol) && actor.equipoId != null && actor.equipoId === ticket.categoria.equipoId;
}

function cargarConDetalle(ticketId) {
  return prisma.ticket.findUniqueOrThrow({ where: { id: ticketId }, include: INCLUDE_DETALLE }).catch(() => {
    throw new AppError('Ticket no encontrado', 404);
  });
}

function registrarEvento(ticketId, tipoEvento, autorId) {
  return prisma.eventoAuditoria.create({ data: { ticketId, tipoEvento, autorId } });
}

function notificar(destinatarioId, mensaje, eventoId) {
  return prisma.notificacion.create({ data: { destinatarioId, mensaje, eventoId } });
}

function validarTexto(valor, etiqueta) {
  if (!valor?.trim()) {
    throw new AppError(`${etiqueta} es obligatorio`, 400);
  }
}
