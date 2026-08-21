import path from 'node:path';
import express from 'express';
import cookieParser from 'cookie-parser';
import { errorHandler } from './middleware/errorHandler.js';
import { authRouter } from './modules/auth/auth.routes.js';
import { usuariosRouter } from './modules/usuarios/usuarios.routes.js';
import { categoriasRouter } from './modules/categorias/categorias.routes.js';
import { equiposRouter } from './modules/equipos/equipos.routes.js';
import { prioridadesRouter } from './modules/prioridades/prioridades.routes.js';
import { ticketsRouter } from './modules/tickets/tickets.routes.js';
import { articulosRouter } from './modules/articulos/articulos.routes.js';

export function createApp() {
  const app = express();

  app.use(express.json());
  app.use(cookieParser());

  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok' });
  });

  app.use('/api/auth', authRouter);
  app.use('/api/usuarios', usuariosRouter);
  app.use('/api/categorias', categoriasRouter);
  app.use('/api/equipos', equiposRouter);
  app.use('/api/prioridades', prioridadesRouter);
  app.use('/api/tickets', ticketsRouter);
  app.use('/api/articulos', articulosRouter);

  // En producción, Express sirve también el build estático de React (ver Dockerfile,
  // stage "prod") -- en desarrollo el cliente corre aparte en el servidor de Vite.
  if (process.env.NODE_ENV === 'production') {
    const clientDist = path.resolve(import.meta.dirname, '../../client/dist');
    app.use(express.static(clientDist));
    app.get('*', (req, res) => {
      res.sendFile(path.join(clientDist, 'index.html'));
    });
  }

  app.use(errorHandler);

  return app;
}

