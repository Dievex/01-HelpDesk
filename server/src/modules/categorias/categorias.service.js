import { prisma } from '../../db/prisma.js';
import { AppError } from '../../utils/AppError.js';

export async function listar() {
  return prisma.categoria.findMany({ orderBy: { nombre: 'asc' } });
}

export async function obtener(id) {
  const categoria = await prisma.categoria.findUnique({ where: { id } });
  if (!categoria) {
    throw new AppError('Categoría no encontrada', 404);
  }
  return categoria;
}

export async function crear({ nombre, equipoId }) {
  validarNombre(nombre);
  await validarNombreDisponible(nombre);
  await validarEquipoExiste(equipoId);
  return prisma.categoria.create({ data: { nombre, equipoId: equipoId || null } });
}

export async function editar(id, { nombre, equipoId }) {
  await obtener(id);
  validarNombre(nombre);
  await validarNombreDisponible(nombre, id);
  await validarEquipoExiste(equipoId);
  return prisma.categoria.update({ where: { id }, data: { nombre, equipoId: equipoId || null } });
}

export async function eliminar(id) {
  await obtener(id);

  const ticketsEnUso = await prisma.ticket.count({ where: { categoriaId: id } });
  if (ticketsEnUso > 0) {
    throw new AppError(`No se puede eliminar: la categoría tiene ${ticketsEnUso} ticket(s) asociado(s)`, 409);
  }

  await prisma.categoria.delete({ where: { id } });
}

function validarNombre(nombre) {
  if (!nombre?.trim()) {
    throw new AppError('El nombre es obligatorio', 400);
  }
}

async function validarNombreDisponible(nombre, idAExcluir) {
  const existente = await prisma.categoria.findUnique({ where: { nombre } });
  if (existente && existente.id !== idAExcluir) {
    throw new AppError('Ya existe una categoría con ese nombre', 409);
  }
}

async function validarEquipoExiste(equipoId) {
  if (!equipoId) return;
  const equipo = await prisma.equipo.findUnique({ where: { id: equipoId } });
  if (!equipo) {
    throw new AppError('El equipo indicado no existe', 400);
  }
}
