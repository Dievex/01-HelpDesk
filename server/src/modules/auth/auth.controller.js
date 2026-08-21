import { autenticar, obtenerPerfil } from './auth.service.js';
import { COOKIE_NAME } from '../../middleware/auth.js';
import { env } from '../../config/env.js';
import { AppError } from '../../utils/AppError.js';

const cookieOptions = {
  httpOnly: true,
  sameSite: 'lax',
  secure: env.nodeEnv === 'production',
  maxAge: 8 * 60 * 60 * 1000, // 8h, igual que la expiración del JWT
};

export async function login(req, res, next) {
  try {
    const { correo, contrasena } = req.body ?? {};
    if (!correo || !contrasena) {
      throw new AppError('Correo y contraseña son obligatorios', 400);
    }

    const { token, usuario } = await autenticar(correo, contrasena);
    res.cookie(COOKIE_NAME, token, cookieOptions);
    res.json({ usuario });
  } catch (err) {
    next(err);
  }
}

export function logout(req, res) {
  res.clearCookie(COOKIE_NAME, cookieOptions);
  res.status(204).end();
}

export async function me(req, res, next) {
  try {
    const usuario = await obtenerPerfil(req.usuario.sub);
    res.json({ usuario });
  } catch (err) {
    next(err);
  }
}
