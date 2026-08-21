import { prisma } from '../../db/prisma.js';
import { AppError } from '../../utils/AppError.js';

// UC-20: solo estos estados aportan a tiempos/cumplimiento -- un ticket todavía
// abierto no tiene fechaResolucion, y uno escalado o tomado sin resolver aún no
// terminó su ciclo de vida.
const ESTADOS_CON_TIEMPOS = ['RESUELTO', 'REABIERTO', 'CERRADO'];

// Supervisor hereda de AgenteSoporte en el Modelo de Dominio -- su comentario
// también cuenta como "primera respuesta de un Agente de Soporte", mismo criterio
// que ROLES_CON_EQUIPO en tickets.service.js.
const ROLES_AGENTE_SOPORTE = ['AGENTE', 'SUPERVISOR'];

export async function obtenerMetricas(supervisorId, { desde, hasta }) {
  const supervisor = await prisma.usuario.findUnique({ where: { id: supervisorId } });
  if (!supervisor.equipoId) {
    throw new AppError('No perteneces a ningún equipo', 400);
  }

  const { inicio, fin } = validarRango(desde, hasta);

  const tickets = await prisma.ticket.findMany({
    where: {
      categoria: { equipoId: supervisor.equipoId },
      fechaCreacion: { gte: inicio, lte: fin },
    },
    select: {
      estado: true,
      fechaCreacion: true,
      fechaResolucion: true,
      prioridad: { select: { sla: true } },
      comentarios: {
        select: { fecha: true, autor: { select: { rol: true } } },
        orderBy: { fecha: 'asc' },
      },
    },
  });

  return {
    rango: { desde: inicio, hasta: fin },
    volumen: calcularVolumen(tickets),
    tiempos: calcularTiempos(tickets),
    cumplimientoSla: calcularCumplimientoSla(tickets),
  };
}

// FA-2: "desde" posterior a "hasta" se rechaza. "hasta" se extiende al final del
// día (23:59:59.999) para que un rango de un solo día incluya todo lo creado ese día.
function validarRango(desde, hasta) {
  const inicio = desde ? new Date(`${desde}T00:00:00.000`) : null;
  const fin = hasta ? new Date(`${hasta}T23:59:59.999`) : null;

  if (!inicio || !fin || Number.isNaN(inicio.getTime()) || Number.isNaN(fin.getTime())) {
    throw new AppError('Indica un rango de fechas "desde" y "hasta" válido', 400);
  }
  if (inicio > fin) {
    throw new AppError('"Desde" no puede ser posterior a "hasta"', 400);
  }
  return { inicio, fin };
}

function calcularVolumen(tickets) {
  const porEstado = {};
  for (const t of tickets) {
    porEstado[t.estado] = (porEstado[t.estado] ?? 0) + 1;
  }
  return { total: tickets.length, porEstado };
}

// Tiempo de primera respuesta: no existe una columna propia -- se deriva del primer
// Comentario de un Agente de Soporte. Un ticket sin ese comentario no aporta dato,
// no cuenta como incumplimiento (UC-20, regla de negocio).
function calcularTiempos(tickets) {
  const elegibles = tickets.filter((t) => ESTADOS_CON_TIEMPOS.includes(t.estado) && t.fechaResolucion);

  const resolucionMinutos = promedio(
    elegibles.map((t) => minutosEntre(t.fechaCreacion, t.fechaResolucion)),
  );
  const primeraRespuestaMinutos = promedio(
    elegibles.map((t) => tiempoPrimeraRespuestaMinutos(t)).filter((v) => v !== null),
  );

  return { primeraRespuestaMinutos, resolucionMinutos };
}

// Cumplimiento en vivo: compara contra el SLA de la Prioridad confirmada del ticket,
// sin almacenar el resultado (cierra R-07). Igual que en tiempos, sin dato no cuenta
// como incumplimiento -- queda fuera del porcentaje.
function calcularCumplimientoSla(tickets) {
  const elegibles = tickets.filter(
    (t) => ESTADOS_CON_TIEMPOS.includes(t.estado) && t.fechaResolucion && t.prioridad.sla,
  );

  const resolucion = elegibles.map(
    (t) => minutosEntre(t.fechaCreacion, t.fechaResolucion) <= t.prioridad.sla.tiempoResolucion,
  );

  const primeraRespuesta = elegibles
    .map((t) => {
      const minutos = tiempoPrimeraRespuestaMinutos(t);
      return minutos === null ? null : minutos <= t.prioridad.sla.tiempoPrimeraRespuesta;
    })
    .filter((v) => v !== null);

  return {
    resolucionPorcentaje: porcentajeCumplido(resolucion),
    primeraRespuestaPorcentaje: porcentajeCumplido(primeraRespuesta),
  };
}

function tiempoPrimeraRespuestaMinutos(ticket) {
  const primeraDeAgente = ticket.comentarios.find((c) => ROLES_AGENTE_SOPORTE.includes(c.autor.rol));
  return primeraDeAgente ? minutosEntre(ticket.fechaCreacion, primeraDeAgente.fecha) : null;
}

function minutosEntre(desde, hasta) {
  return (hasta.getTime() - desde.getTime()) / 60_000;
}

function promedio(valores) {
  if (valores.length === 0) return null;
  return valores.reduce((suma, v) => suma + v, 0) / valores.length;
}

function porcentajeCumplido(booleanos) {
  if (booleanos.length === 0) return null;
  const cumplidos = booleanos.filter(Boolean).length;
  return (cumplidos / booleanos.length) * 100;
}
