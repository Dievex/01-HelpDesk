import { describe, expect, it } from 'vitest';
import { crearCategoria, crearEquipo, crearPrioridad, crearUsuario, loginComo } from './helpers.js';
import { prisma } from '../src/db/prisma.js';

describe('CRUD de Usuario (UC-36 a UC-40, exclusivo de Administrador)', () => {
  it('un no-administrador no puede listar usuarios', async () => {
    const solicitante = await crearUsuario({ rol: 'SOLICITANTE' });
    const agent = await loginComo(solicitante);

    await agent.get('/api/usuarios').expect(403);
  });

  it('el Administrador crea un Agente -- exige Nivel (N1/N2/N3)', async () => {
    const admin = await crearUsuario({ rol: 'ADMINISTRADOR' });
    const agent = await loginComo(admin);
    const equipo = await crearEquipo();

    const sinNivel = await agent
      .post('/api/usuarios')
      .send({ nombre: 'Alex', correo: 'alex@test.local', contrasena: 'clave123', rol: 'AGENTE', equipoId: equipo.id })
      .expect(400);
    expect(sinNivel.body.error).toMatch(/nivel/i);

    const res = await agent
      .post('/api/usuarios')
      .send({
        nombre: 'Alex',
        correo: 'alex@test.local',
        contrasena: 'clave123',
        rol: 'AGENTE',
        nivel: 'N1',
        equipoId: equipo.id,
      })
      .expect(201);

    expect(res.body.usuario).toMatchObject({ rol: 'AGENTE', nivel: 'N1', equipoId: equipo.id });
  });

  it('rechaza un correo ya usado por otro usuario con 409', async () => {
    const admin = await crearUsuario({ rol: 'ADMINISTRADOR' });
    const agent = await loginComo(admin);
    await crearUsuario({ correo: 'dup@test.local' });

    await agent
      .post('/api/usuarios')
      .send({ nombre: 'Otro', correo: 'dup@test.local', contrasena: 'clave123', rol: 'SOLICITANTE' })
      .expect(409);
  });

  it('UC-40 FA-1: no permite eliminar un usuario con tickets asociados', async () => {
    const admin = await crearUsuario({ rol: 'ADMINISTRADOR' });
    const agent = await loginComo(admin);
    const equipo = await crearEquipo();
    const solicitanteConTicket = await crearUsuario({ rol: 'SOLICITANTE' });
    const categoria = await crearCategoria('Cat con ticket', equipo.id);
    const prioridad = await crearPrioridad('Baja', 240, 2880);
    await prisma.ticket.create({
      data: {
        titulo: 'T',
        descripcion: 'D',
        solicitanteId: solicitanteConTicket.id,
        categoriaId: categoria.id,
        prioridadId: prioridad.id,
      },
    });

    const res = await agent.delete(`/api/usuarios/${solicitanteConTicket.id}`).expect(409);
    expect(res.body.error).toMatch(/ticket/i);
  });

  it('elimina un usuario sin tickets asociados', async () => {
    const admin = await crearUsuario({ rol: 'ADMINISTRADOR' });
    const agent = await loginComo(admin);
    const solicitante = await crearUsuario({ rol: 'SOLICITANTE' });

    await agent.delete(`/api/usuarios/${solicitante.id}`).expect(204);
  });

  it('GET /usuarios/mi-equipo: Supervisor ve Agentes/Supervisores de su propio Equipo (incluido él mismo), no los de otro', async () => {
    const equipoA = await crearEquipo();
    const equipoB = await crearEquipo();
    const supervisor = await crearUsuario({ rol: 'SUPERVISOR', nivel: 'N3', equipoId: equipoA.id, correo: 'supervisor@test.local' });
    await crearUsuario({ rol: 'AGENTE', nivel: 'N1', equipoId: equipoA.id, correo: 'propio@test.local' });
    await crearUsuario({ rol: 'AGENTE', nivel: 'N1', equipoId: equipoB.id, correo: 'ajeno@test.local' });

    const agent = await loginComo(supervisor);
    const res = await agent.get('/api/usuarios/mi-equipo').expect(200);

    const correos = res.body.usuarios.map((u) => u.correo);
    expect(correos).toEqual(expect.arrayContaining(['supervisor@test.local', 'propio@test.local']));
    expect(correos).not.toContain('ajeno@test.local');
  });
});
