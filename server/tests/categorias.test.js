import { describe, expect, it } from 'vitest';
import { crearCategoria, crearEquipo, crearPrioridad, crearUsuario, loginComo } from './helpers.js';
import { prisma } from '../src/db/prisma.js';

describe('CRUD de Categoría', () => {
  it('lectura abierta a cualquier rol autenticado, escritura exclusiva de Administrador', async () => {
    const solicitante = await crearUsuario({ rol: 'SOLICITANTE' });
    const agent = await loginComo(solicitante);

    await agent.get('/api/categorias').expect(200);
    await agent.post('/api/categorias').send({ nombre: 'Nueva' }).expect(403);
  });

  it('el Administrador crea, edita y no puede repetir nombre', async () => {
    const admin = await crearUsuario({ rol: 'ADMINISTRADOR' });
    const agent = await loginComo(admin);
    const equipo = await crearEquipo();

    const creada = await agent.post('/api/categorias').send({ nombre: 'Redes', equipoId: equipo.id }).expect(201);
    expect(creada.body.categoria).toMatchObject({ nombre: 'Redes', equipoId: equipo.id });

    await agent.post('/api/categorias').send({ nombre: 'Redes' }).expect(409);

    const editada = await agent
      .put(`/api/categorias/${creada.body.categoria.id}`)
      .send({ nombre: 'Redes y Comunicaciones', equipoId: null })
      .expect(200);
    expect(editada.body.categoria.equipoId).toBeNull();
  });

  it('bloquea eliminar una Categoría con tickets asociados (UC-25 FA-1)', async () => {
    const admin = await crearUsuario({ rol: 'ADMINISTRADOR' });
    const agent = await loginComo(admin);
    const equipo = await crearEquipo();
    const categoria = await crearCategoria('En uso', equipo.id);
    const prioridad = await crearPrioridad('Baja', 240, 2880);
    const solicitante = await crearUsuario({ rol: 'SOLICITANTE' });
    await prisma.ticket.create({
      data: { titulo: 'T', descripcion: 'D', solicitanteId: solicitante.id, categoriaId: categoria.id, prioridadId: prioridad.id },
    });

    await agent.delete(`/api/categorias/${categoria.id}`).expect(409);
  });

  it('al eliminar el Equipo de una Categoría, esta pasa a equipoId null (SetNull en cascada)', async () => {
    const admin = await crearUsuario({ rol: 'ADMINISTRADOR' });
    const agent = await loginComo(admin);
    const equipo = await crearEquipo();
    const categoria = await crearCategoria('Sin tickets', equipo.id);

    await agent.delete(`/api/equipos/${equipo.id}`).expect(204);

    const actualizada = await prisma.categoria.findUnique({ where: { id: categoria.id } });
    expect(actualizada.equipoId).toBeNull();
  });
});
