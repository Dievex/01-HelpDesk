import bcrypt from 'bcryptjs';
import { prisma } from '../../db/prisma.js';
import { AppError } from '../../utils/AppError.js';

const ROLES = ['SOLICITANTE', 'AGENTE', 'SUPERVISOR', 'ADMINISTRADOR'];
const ROLES_CON_NIVEL = ['AGENTE', 'SUPERVISOR'];
const NIVELES = ['N1', 'N2', 'N3'];
const CORREO_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const CONTRASENA_MIN = 6;

const SELECT_PUBLICO = {
  id: true,
  nombre: true,
  correo: true,
  rol: true,
  nivel: true,
  equipoId: true,
  createdAt: true,
};

export async function listar() {
  return prisma.usuario.findMany({
    select: SELECT_PUBLICO,
    orderBy: { nombre: 'asc' },
  });
}

// UC-18/UC-19: el Supervisor necesita ver a los Agentes de su propio Equipo para
// asignar/reasignar, sin el acceso completo al CRUD de Usuario (exclusivo de
// Administrador).
export async function listarDeMiEquipo(actorId) {
  const actor = await prisma.usuario.findUnique({ where: { id: actorId } });
  if (!actor.equipoId) return [];

  return prisma.usuario.findMany({
    where: { equipoId: actor.equipoId, rol: { in: ROLES_CON_NIVEL } },
    select: SELECT_PUBLICO,
    orderBy: { nombre: 'asc' },
  });
}

export async function obtener(id) {
  const usuario = await prisma.usuario.findUnique({ where: { id }, select: SELECT_PUBLICO });
  if (!usuario) {
    throw new AppError('Usuario no encontrado', 404);
  }
  return usuario;
}

export async function crear({ nombre, correo, contrasena, rol, nivel, equipoId }) {
  validarDatosBasicos({ nombre, correo, rol, nivel });
  validarContrasena(contrasena);
  await validarCorreoDisponible(correo);
  await validarEquipoExiste(equipoId);

  const contrasenaHash = await bcrypt.hash(contrasena, 10);

  const usuario = await prisma.usuario.create({
    data: {
      nombre,
      correo,
      contrasenaHash,
      rol,
      nivel: ROLES_CON_NIVEL.includes(rol) ? nivel : null,
      equipoId: ROLES_CON_NIVEL.includes(rol) ? equipoId || null : null,
    },
    select: SELECT_PUBLICO,
  });

  return usuario;
}

// La contraseña solo se actualiza si se envía una nueva.
export async function editar(id, { nombre, correo, contrasena, rol, nivel, equipoId }) {
  await obtener(id);
  validarDatosBasicos({ nombre, correo, rol, nivel });
  await validarCorreoDisponible(correo, id);
  await validarEquipoExiste(equipoId);

  const data = {
    nombre,
    correo,
    rol,
    nivel: ROLES_CON_NIVEL.includes(rol) ? nivel : null,
    equipoId: ROLES_CON_NIVEL.includes(rol) ? equipoId || null : null,
  };

  if (contrasena) {
    validarContrasena(contrasena);
    data.contrasenaHash = await bcrypt.hash(contrasena, 10);
  }

  return prisma.usuario.update({ where: { id }, data, select: SELECT_PUBLICO });
}

export async function eliminar(id) {
  await obtener(id);

  const ticketsRelacionados = await prisma.ticket.count({
    where: { OR: [{ solicitanteId: id }, { agenteId: id }] },
  });

  if (ticketsRelacionados > 0) {
    throw new AppError(
      `No se puede eliminar: el usuario tiene ${ticketsRelacionados} ticket(s) asociado(s)`,
      409,
    );
  }

  await prisma.usuario.delete({ where: { id } });
}

function validarDatosBasicos({ nombre, correo, rol, nivel }) {
  if (!nombre?.trim()) {
    throw new AppError('El nombre es obligatorio', 400);
  }
  if (!correo || !CORREO_RE.test(correo)) {
    throw new AppError('El correo no es válido', 400);
  }
  if (!ROLES.includes(rol)) {
    throw new AppError('El rol no es válido', 400);
  }
  if (ROLES_CON_NIVEL.includes(rol) && !NIVELES.includes(nivel)) {
    throw new AppError('El nivel es obligatorio para Agente y Supervisor (N1/N2/N3)', 400);
  }
}

function validarContrasena(contrasena) {
  if (!contrasena || contrasena.length < CONTRASENA_MIN) {
    throw new AppError(`La contraseña debe tener al menos ${CONTRASENA_MIN} caracteres`, 400);
  }
}

async function validarCorreoDisponible(correo, idAExcluir) {
  const existente = await prisma.usuario.findUnique({ where: { correo } });
  if (existente && existente.id !== idAExcluir) {
    throw new AppError('Ya existe un usuario con ese correo', 409);
  }
}

async function validarEquipoExiste(equipoId) {
  if (!equipoId) return;
  const equipo = await prisma.equipo.findUnique({ where: { id: equipoId } });
  if (!equipo) {
    throw new AppError('El equipo indicado no existe', 400);
  }
}
