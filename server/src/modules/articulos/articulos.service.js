import { prisma } from '../../db/prisma.js';
import { AppError } from '../../utils/AppError.js';

const ROLES_VE_INTERNO = ['AGENTE', 'SUPERVISOR', 'ADMINISTRADOR'];
const AUTOR_SELECT = { select: { id: true, nombre: true } };

export async function listar(actorRol, busqueda) {
  return prisma.articuloConocimiento.findMany({
    where: {
      visibilidad: { in: visibilidadesAccesibles(actorRol) },
      ...(busqueda?.trim() && {
        OR: [
          { titulo: { contains: busqueda.trim(), mode: 'insensitive' } },
          { contenido: { contains: busqueda.trim(), mode: 'insensitive' } },
        ],
      }),
    },
    select: { id: true, titulo: true, visibilidad: true },
    orderBy: { titulo: 'asc' },
  });
}

export async function obtener(id, actorRol) {
  const articulo = await prisma.articuloConocimiento.findUnique({
    where: { id },
    include: { autor: AUTOR_SELECT },
  });
  if (!articulo) {
    throw new AppError('Artículo no encontrado', 404);
  }
  // FA-1 de UC-09: Interno visto por un Solicitante puro -- denegado sin revelar contenido.
  if (!visibilidadesAccesibles(actorRol).includes(articulo.visibilidad)) {
    throw new AppError('No tienes acceso a este artículo', 403);
  }
  return articulo;
}

export async function crear({ titulo, contenido, visibilidad, autorId }) {
  validarDatos(titulo, contenido, visibilidad);
  return prisma.articuloConocimiento.create({
    data: { titulo, contenido: contenido.trim(), visibilidad, autorId },
    include: { autor: AUTOR_SELECT },
  });
}

// Sin EventoAuditoria ni historial de versiones (decisión de UC-15/UC-16): solo
// se conserva el autor original.
export async function editar(id, { titulo, contenido, visibilidad }) {
  const existente = await prisma.articuloConocimiento.findUnique({ where: { id } });
  if (!existente) {
    throw new AppError('Artículo no encontrado', 404);
  }
  validarDatos(titulo, contenido, visibilidad);

  return prisma.articuloConocimiento.update({
    where: { id },
    data: { titulo, contenido: contenido.trim(), visibilidad },
    include: { autor: AUTOR_SELECT },
  });
}

// UC-17: la asociación con Tickets se elimina en cascada (relación M:N implícita
// de Prisma), sin dejar referencias colgantes; el EventoAuditoria de "Vinculación"
// en cada ticket queda intacto.
export async function eliminar(id) {
  const existente = await prisma.articuloConocimiento.findUnique({ where: { id } });
  if (!existente) {
    throw new AppError('Artículo no encontrado', 404);
  }
  await prisma.articuloConocimiento.delete({ where: { id } });
}

function visibilidadesAccesibles(rol) {
  return ROLES_VE_INTERNO.includes(rol) ? ['PUBLICO', 'INTERNO'] : ['PUBLICO'];
}

function validarDatos(titulo, contenido, visibilidad) {
  if (!titulo?.trim()) {
    throw new AppError('El título es obligatorio', 400);
  }
  if (!contenido?.trim()) {
    throw new AppError('El contenido es obligatorio', 400);
  }
  if (!['PUBLICO', 'INTERNO'].includes(visibilidad)) {
    throw new AppError('La visibilidad no es válida', 400);
  }
}
