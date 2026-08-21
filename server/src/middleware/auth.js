import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { AppError } from '../utils/AppError.js';

export const COOKIE_NAME = 'token';

// Sin revocación server-side de JWT (ver docs/03-fase-construccion/decisiones-tecnicas.md).
export function requireAuth(req, res, next) {
  const token = req.cookies?.[COOKIE_NAME];
  if (!token) {
    return next(new AppError('No autenticado', 401));
  }
  try {
    req.usuario = jwt.verify(token, env.jwtSecret);
    next();
  } catch {
    next(new AppError('Sesión inválida o expirada', 401));
  }
}

// Uso: router.get('/', requireAuth, requireRole('ADMINISTRADOR'), handler)
export function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.usuario || !roles.includes(req.usuario.rol)) {
      return next(new AppError('No tienes permiso para esta acción', 403));
    }
    next();
  };
}
