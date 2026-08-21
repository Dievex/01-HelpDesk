import bcrypt from 'bcryptjs';
import request from 'supertest';
import { createApp } from '../src/app.js';
import { prisma } from '../src/db/prisma.js';

export const app = createApp();

// Coste bajo (4) para no pagar el precio de bcrypt real en cada test -- no es
// código de producción, solo fixtures.
const CONTRASENA_POR_DEFECTO = 'clave123';

export async function crearUsuario({
  nombre = 'Usuario Test',
  correo,
  contrasena = CONTRASENA_POR_DEFECTO,
  rol = 'SOLICITANTE',
  nivel = null,
  equipoId = null,
} = {}) {
  const contrasenaHash = await bcrypt.hash(contrasena, 4);
  return prisma.usuario.create({
    data: { nombre, correo: correo ?? `${rol.toLowerCase()}-${Date.now()}-${Math.random()}@test.local`, contrasenaHash, rol, nivel, equipoId },
  });
}

// Devuelve un agente de supertest con la cookie de sesión ya guardada -- las
// siguientes peticiones con ese agente van autenticadas como este usuario.
export async function loginComo(usuario, contrasena = CONTRASENA_POR_DEFECTO) {
  const agent = request.agent(app);
  await agent.post('/api/auth/login').send({ correo: usuario.correo, contrasena }).expect(200);
  return agent;
}

export async function crearEquipo(nombre = `Equipo ${Date.now()}-${Math.random()}`) {
  return prisma.equipo.create({ data: { nombre } });
}

export async function crearCategoria(nombre = `Categoria ${Date.now()}-${Math.random()}`, equipoId = null) {
  return prisma.categoria.create({ data: { nombre, equipoId } });
}

export async function crearPrioridad(
  nombre = `Prioridad ${Date.now()}-${Math.random()}`,
  tiempoPrimeraRespuesta = 60,
  tiempoResolucion = 480,
) {
  return prisma.prioridad.create({
    data: { nombre, sla: { create: { tiempoPrimeraRespuesta, tiempoResolucion } } },
  });
}

// Escenario base para los tests de Ticket: un Equipo con una Categoría y una
// Prioridad "Baja" (UC-03 la exige por nombre exacto al crear un ticket).
export async function crearEscenarioTicket() {
  const equipo = await crearEquipo();
  const categoria = await crearCategoria(undefined, equipo.id);
  const prioridadBaja = await crearPrioridad('Baja', 240, 2880);
  return { equipo, categoria, prioridadBaja };
}
