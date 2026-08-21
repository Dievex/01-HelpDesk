import path from 'node:path';
import express from 'express';
import cookieParser from 'cookie-parser';
import { errorHandler } from './middleware/errorHandler.js';
import { authRouter } from './modules/auth/auth.routes.js';
import { usuariosRouter } from './modules/usuarios/usuarios.routes.js';

export function createApp() {
  const app = express();

  app.use(express.json());
  app.use(cookieParser());

  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok' });
  });

  app.use('/api/auth', authRouter);
  app.use('/api/usuarios', usuariosRouter);

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

