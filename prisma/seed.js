import 'dotenv/config';
import bcrypt from 'bcryptjs';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Rompe el arranque circular: sin ningún Usuario no se puede hacer login,
// sin login no se puede crear ningún Usuario desde la UI (Iteración 1).
async function main() {
  const correo = process.env.ADMIN_SEED_EMAIL ?? 'admin@helpdesk.local';
  const contrasena = process.env.ADMIN_SEED_PASSWORD ?? 'admin123';

  const existente = await prisma.usuario.findUnique({ where: { correo } });
  if (existente) {
    console.log(`[seed] ya existe un Usuario con correo ${correo}, no se crea de nuevo`);
    return;
  }

  const contrasenaHash = await bcrypt.hash(contrasena, 10);

  await prisma.usuario.create({
    data: {
      nombre: 'Administrador',
      correo,
      contrasenaHash,
      rol: 'ADMINISTRADOR',
    },
  });

  console.log(`[seed] Administrador creado -- correo: ${correo} / contraseña: ${contrasena}`);
  console.log('[seed] cámbiala en cuanto tengas Editar Usuario (Iteración 1) disponible.');
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
