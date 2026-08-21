import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../../db/prisma.js';
import { env } from '../../config/env.js';
import { AppError } from '../../utils/AppError.js';

const JWT_EXPIRES_IN = '8h';

export async function autenticar(correo, contrasena) {
  const usuario = await prisma.usuario.findUnique({ where: { correo } });
  // Mismo mensaje exista o no el correo -- no revelar si una cuenta existe (UC-01, FA-1).
  if (!usuario) {
    throw new AppError('Correo o contraseña incorrectos', 401);
  }

  const coincide = await bcrypt.compare(contrasena, usuario.contrasenaHash);
  if (!coincide) {
    throw new AppError('Correo o contraseña incorrectos', 401);
  }

  const token = jwt.sign({ sub: usuario.id, rol: usuario.rol }, env.jwtSecret, {
    expiresIn: JWT_EXPIRES_IN,
  });

  return { token, usuario: perfilPublico(usuario) };
}

export async function obtenerPerfil(usuarioId) {
  const usuario = await prisma.usuario.findUnique({ where: { id: usuarioId } });
  if (!usuario) {
    throw new AppError('Usuario no encontrado', 404);
  }
  return perfilPublico(usuario);
}

function perfilPublico(usuario) {
  const { id, nombre, correo, rol, nivel, equipoId } = usuario;
  return { id, nombre, correo, rol, nivel, equipoId };
}
