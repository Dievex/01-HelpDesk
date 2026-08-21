import { describe, expect, it } from 'vitest';
import { crearPrioridad, crearUsuario, loginComo } from './helpers.js';
import { prisma } from '../src/db/prisma.js';

describe('CRUD de Prioridad + SLA (SLA sin ruta propia, anidado en Prioridad)', () => {
  it('lectura abierta a cualquier rol autenticado, escritura exclusiva de Administrador', async () => {
    const agente = await crearUsuario({ rol: 'AGENTE', nivel: 'N1' });
    const agent = await loginComo(agente);

    await agent.get('/api/prioridades').expect(200);
    await agent.post('/api/prioridades').send({ nombre: 'Urgente', tiempoPrimeraRespuesta: 5, tiempoResolucion: 30 }).expect(403);
  });

  it('el Administrador crea una Prioridad con su SLA anidado', async () => {
    const admin = await crearUsuario({ rol: 'ADMINISTRADOR' });
    const agent = await loginComo(admin);

    const res = await agent
      .post('/api/prioridades')
      .send({ nombre: 'Urgente', tiempoPrimeraRespuesta: 5, tiempoResolucion: 30 })
      .expect(201);

    expect(res.body.prioridad.sla).toMatchObject({ tiempoPrimeraRespuesta: 5, tiempoResolucion: 30 });
  });

  it('rechaza tiempos de SLA no enteros o no positivos', async () => {
    const admin = await crearUsuario({ rol: 'ADMINISTRADOR' });
    const agent = await loginComo(admin);

    await agent.post('/api/prioridades').send({ nombre: 'X', tiempoPrimeraRespuesta: 0, tiempoResolucion: 30 }).expect(400);
    await agent.post('/api/prioridades').send({ nombre: 'Y', tiempoPrimeraRespuesta: 5.5, tiempoResolucion: 30 }).expect(400);
  });

  it('editar actualiza el SLA anidado', async () => {
    const admin = await crearUsuario({ rol: 'ADMINISTRADOR' });
    const agent = await loginComo(admin);
    const prioridad = await crearPrioridad('Media', 60, 480);

    const res = await agent
      .put(`/api/prioridades/${prioridad.id}`)
      .send({ nombre: 'Media', tiempoPrimeraRespuesta: 90, tiempoResolucion: 600 })
      .expect(200);

    expect(res.body.prioridad.sla).toMatchObject({ tiempoPrimeraRespuesta: 90, tiempoResolucion: 600 });
  });

  it('al eliminar la Prioridad, su SLA se elimina en cascada', async () => {
    const admin = await crearUsuario({ rol: 'ADMINISTRADOR' });
    const agent = await loginComo(admin);
    const prioridad = await crearPrioridad('Baja uso', 240, 2880);
    const slaId = (await prisma.sLA.findUniqueOrThrow({ where: { prioridadId: prioridad.id } })).id;

    await agent.delete(`/api/prioridades/${prioridad.id}`).expect(204);

    expect(await prisma.sLA.findUnique({ where: { id: slaId } })).toBeNull();
  });
});
