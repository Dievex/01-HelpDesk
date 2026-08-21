import { prisma } from '../../db/prisma.js';
import { AppError } from '../../utils/AppError.js';

const INCLUDE_SLA = { sla: true };

export async function listar() {
  return prisma.prioridad.findMany({ include: INCLUDE_SLA, orderBy: { nombre: 'asc' } });
}

export async function obtener(id) {
  const prioridad = await prisma.prioridad.findUnique({ where: { id }, include: INCLUDE_SLA });
  if (!prioridad) {
    throw new AppError('Prioridad no encontrada', 404);
  }
  return prioridad;
}

// SLA no tiene CRUD propio: se crea y edita siempre junto con su Prioridad.
export async function crear({ nombre, tiempoPrimeraRespuesta, tiempoResolucion }) {
  validarNombre(nombre);
  await validarNombreDisponible(nombre);
  validarSla(tiempoPrimeraRespuesta, tiempoResolucion);

  return prisma.prioridad.create({
    data: {
      nombre,
      sla: { create: { tiempoPrimeraRespuesta, tiempoResolucion } },
    },
    include: INCLUDE_SLA,
  });
}

export async function editar(id, { nombre, tiempoPrimeraRespuesta, tiempoResolucion }) {
  await obtener(id);
  validarNombre(nombre);
  await validarNombreDisponible(nombre, id);
  validarSla(tiempoPrimeraRespuesta, tiempoResolucion);

  return prisma.prioridad.update({
    where: { id },
    data: {
      nombre,
      sla: { update: { tiempoPrimeraRespuesta, tiempoResolucion } },
    },
    include: INCLUDE_SLA,
  });
}

export async function eliminar(id) {
  await obtener(id);

  const ticketsEnUso = await prisma.ticket.count({ where: { prioridadId: id } });
  if (ticketsEnUso > 0) {
    throw new AppError(`No se puede eliminar: la prioridad tiene ${ticketsEnUso} ticket(s) asociado(s)`, 409);
  }

  // El SLA se elimina en cascada (schema.prisma: SLA.prioridad onDelete: Cascade).
  await prisma.prioridad.delete({ where: { id } });
}

function validarNombre(nombre) {
  if (!nombre?.trim()) {
    throw new AppError('El nombre es obligatorio', 400);
  }
}

async function validarNombreDisponible(nombre, idAExcluir) {
  const existente = await prisma.prioridad.findUnique({ where: { nombre } });
  if (existente && existente.id !== idAExcluir) {
    throw new AppError('Ya existe una prioridad con ese nombre', 409);
  }
}

function validarSla(tiempoPrimeraRespuesta, tiempoResolucion) {
  if (!esEnteroPositivo(tiempoPrimeraRespuesta) || !esEnteroPositivo(tiempoResolucion)) {
    throw new AppError('Los tiempos de SLA deben ser minutos, en números enteros mayores que 0', 400);
  }
}

function esEnteroPositivo(valor) {
  return Number.isInteger(valor) && valor > 0;
}
