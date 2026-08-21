import { describe, expect, it } from 'vitest';
import { crearUsuario, loginComo } from './helpers.js';

describe('Base de Conocimiento (UC-09/10/15/16/17)', () => {
  it('un Solicitante puro solo ve artículos Públicos, no Internos', async () => {
    const autor = await crearUsuario({ rol: 'AGENTE', nivel: 'N1', correo: 'autor@test.local' });
    const autorAgent = await loginComo(autor);
    await autorAgent.post('/api/articulos').send({ titulo: 'Público', contenido: 'x', visibilidad: 'PUBLICO' });
    await autorAgent.post('/api/articulos').send({ titulo: 'Interno', contenido: 'x', visibilidad: 'INTERNO' });

    const solicitante = await loginComo(await crearUsuario({ rol: 'SOLICITANTE' }));
    const res = await solicitante.get('/api/articulos').expect(200);

    expect(res.body.articulos.map((a) => a.titulo)).toEqual(['Público']);
  });

  it('FA-1: el acceso directo por id a un artículo Interno como Solicitante da 403', async () => {
    const autor = await loginComo(await crearUsuario({ rol: 'SUPERVISOR', nivel: 'N3', correo: 'autor@test.local' }));
    const creado = await autor.post('/api/articulos').send({ titulo: 'Interno', contenido: 'x', visibilidad: 'INTERNO' });

    const solicitante = await loginComo(await crearUsuario({ rol: 'SOLICITANTE' }));
    await solicitante.get(`/api/articulos/${creado.body.articulo.id}`).expect(403);
  });

  it('crear/editar/eliminar es exclusivo de Agente de Soporte/Supervisor -- el Administrador no hereda ese permiso', async () => {
    const admin = await loginComo(await crearUsuario({ rol: 'ADMINISTRADOR' }));
    await admin.post('/api/articulos').send({ titulo: 'X', contenido: 'x', visibilidad: 'PUBLICO' }).expect(403);
  });

  it('la búsqueda por texto es insensible a mayúsculas y busca en título y contenido', async () => {
    const autor = await loginComo(await crearUsuario({ rol: 'AGENTE', nivel: 'N1' }));
    await autor.post('/api/articulos').send({ titulo: 'Reiniciar impresora', contenido: 'pasos', visibilidad: 'PUBLICO' });
    await autor.post('/api/articulos').send({ titulo: 'Wifi', contenido: 'configurar RED inalámbrica', visibilidad: 'PUBLICO' });

    const res = await autor.get('/api/articulos').query({ q: 'red' }).expect(200);
    expect(res.body.articulos.map((a) => a.titulo)).toEqual(['Wifi']);
  });
});
