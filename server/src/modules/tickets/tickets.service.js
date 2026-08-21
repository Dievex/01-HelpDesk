import { prisma } from '../../db/prisma.js';
import { env } from '../../config/env.js';
import { AppError } from '../../utils/AppError.js';

const ROLES_CON_EQUIPO = ['AGENTE', 'SUPERVISOR'];
const ESTADOS_TOMABLES = { ABIERTO: 'ASIGNADO', ESCALADO: 'EN_PROGRESO' };
const ESTADOS_RESOLUBLES = ['ASIGNADO', 'EN_PROGRESO'];

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
  if (categoria.equipoId) {
    const supervisores = await prisma.usuario.findMany({
      where: { equipoId: categoria.equipoId, rol: 'SUPERVISOR' },
    });
    await Promise.all(
      supervisores.map((s) => notificar(s.id, `Nuevo ticket: "${titulo}"`, evento.id)),
    );
  }

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
