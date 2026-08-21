import { prisma } from '../../db/prisma.js';
import { AppError } from '../../utils/AppError.js';

export async function listar() {
  return prisma.equipo.findMany({ orderBy: { nombre: 'asc' } });
}

export async function obtener(id) {
  const equipo = await prisma.equipo.findUnique({ where: { id } });
  if (!equipo) {
    throw new AppError('Equipo no encontrado', 404);
  }
  return equipo;
}

export async function crear({ nombre }) {
  validarNombre(nombre);
  await validarNombreDisponible(nombre);
  return prisma.equipo.create({ data: { nombre } });
}

export async function editar(id, { nombre }) {
  await obtener(id);
  validarNombre(nombre);
  await validarNombreDisponible(nombre, id);
  return prisma.equipo.update({ where: { id }, data: { nombre } });
}

// Sin bloqueo: Categoria.equipoId y Usuario.equipoId son opcionales, quedan en null.
export async function eliminar(id) {
  await obtener(id);
  await prisma.equipo.delete({ where: { id } });
}

function validarNombre(nombre) {
  if (!nombre?.trim()) {
    throw new AppError('El nombre es obligatorio', 400);
  }
}

async function validarNombreDisponible(nombre, idAExcluir) {
  const existente = await prisma.equipo.findUnique({ where: { nombre } });
  if (existente && existente.id !== idAExcluir) {
    throw new AppError('Ya existe un equipo con ese nombre', 409);
  }
}
