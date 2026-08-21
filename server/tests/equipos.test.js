import { describe, expect, it } from 'vitest';
import { crearEquipo, crearUsuario, loginComo } from './helpers.js';

describe('CRUD de Equipo (exclusivo de Administrador)', () => {
  it('un no-administrador no puede acceder, ni siquiera para leer', async () => {
    const solicitante = await crearUsuario({ rol: 'SOLICITANTE' });
    const agent = await loginComo(solicitante);

    await agent.get('/api/equipos').expect(403);
  });

  it('el Administrador crea un Equipo y no puede repetir nombre', async () => {
    const admin = await crearUsuario({ rol: 'ADMINISTRADOR' });
    const agent = await loginComo(admin);

    const creado = await agent.post('/api/equipos').send({ nombre: 'Soporte N2' }).expect(201);
    expect(creado.body.equipo.nombre).toBe('Soporte N2');

    await agent.post('/api/equipos').send({ nombre: 'Soporte N2' }).expect(409);
  });

  it('rechaza nombre vacío con 400', async () => {
    const admin = await crearUsuario({ rol: 'ADMINISTRADOR' });
    const agent = await loginComo(admin);

    await agent.post('/api/equipos').send({ nombre: '  ' }).expect(400);
  });

  it('eliminar un Equipo sin uso no da error', async () => {
    const admin = await crearUsuario({ rol: 'ADMINISTRADOR' });
    const agent = await loginComo(admin);
    const equipo = await crearEquipo();

    await agent.delete(`/api/equipos/${equipo.id}`).expect(204);
  });
});
