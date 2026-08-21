import { describe, expect, it } from 'vitest';
import request from 'supertest';
import { app, crearUsuario } from './helpers.js';

describe('UC-01 Iniciar Sesión', () => {
  it('con credenciales válidas, devuelve el perfil y setea la cookie httpOnly del token', async () => {
    const usuario = await crearUsuario({ correo: 'ana@test.local', rol: 'SOLICITANTE' });

    const res = await request(app)
      .post('/api/auth/login')
      .send({ correo: usuario.correo, contrasena: 'clave123' })
      .expect(200);

    expect(res.body.usuario).toMatchObject({ correo: usuario.correo, rol: 'SOLICITANTE' });
    expect(res.body.usuario.contrasenaHash).toBeUndefined();

    const cookie = res.headers['set-cookie'][0];
    expect(cookie).toContain('token=');
    expect(cookie).toContain('HttpOnly');
  });

  it('FA-1: correo inexistente y contraseña incorrecta devuelven el mismo mensaje 401', async () => {
    const usuario = await crearUsuario({ correo: 'ana@test.local' });

    const correoInexistente = await request(app)
      .post('/api/auth/login')
      .send({ correo: 'no-existe@test.local', contrasena: 'clave123' })
      .expect(401);

    const contrasenaIncorrecta = await request(app)
      .post('/api/auth/login')
      .send({ correo: usuario.correo, contrasena: 'incorrecta' })
      .expect(401);

    expect(correoInexistente.body.error).toBe(contrasenaIncorrecta.body.error);
  });

  it('rechaza login sin correo o sin contraseña con 400', async () => {
    await request(app).post('/api/auth/login').send({ correo: 'ana@test.local' }).expect(400);
    await request(app).post('/api/auth/login').send({ contrasena: 'clave123' }).expect(400);
  });
});

describe('Sesión', () => {
  it('GET /me sin cookie devuelve 401', async () => {
    await request(app).get('/api/auth/me').expect(401);
  });

  it('GET /me con sesión iniciada devuelve el perfil del actor', async () => {
    const usuario = await crearUsuario({ correo: 'ana@test.local' });
    const agent = request.agent(app);
    await agent.post('/api/auth/login').send({ correo: usuario.correo, contrasena: 'clave123' });

    const res = await agent.get('/api/auth/me').expect(200);
    expect(res.body.usuario.id).toBe(usuario.id);
  });

  it('logout limpia la cookie -- una petición posterior vuelve a dar 401', async () => {
    const usuario = await crearUsuario({ correo: 'ana@test.local' });
    const agent = request.agent(app);
    await agent.post('/api/auth/login').send({ correo: usuario.correo, contrasena: 'clave123' });

    await agent.post('/api/auth/logout').expect(204);
    await agent.get('/api/auth/me').expect(401);
  });
});
