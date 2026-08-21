import 'dotenv/config';
import bcrypt from 'bcryptjs';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  await seedAdministrador();
  await seedCatalogoBase();
}

// Rompe el arranque circular: sin ningún Usuario no se puede hacer login,
// sin login no se puede crear ningún Usuario desde la UI.
async function seedAdministrador() {
  const correo = process.env.ADMIN_SEED_EMAIL ?? 'admin@helpdesk.local';
  const contrasena = process.env.ADMIN_SEED_PASSWORD ?? 'admin123';

  const existente = await prisma.usuario.findUnique({ where: { correo } });
  if (existente) {
    console.log(`[seed] ya existe un Usuario con correo ${correo}, no se crea de nuevo`);
    return;
  }

  const contrasenaHash = await bcrypt.hash(contrasena, 10);

  await prisma.usuario.create({
    data: { nombre: 'Administrador', correo, contrasenaHash, rol: 'ADMINISTRADOR' },
  });

  console.log(`[seed] Administrador creado -- correo: ${correo} / contraseña: ${contrasena}`);
  console.log('[seed] cámbiala cuanto antes desde Editar Usuario.');
}

// Catálogo mínimo para poder crear un Ticket sin pasar antes por toda la UI de
// configuración. "Baja" es obligatoria: UC-03 crea todo ticket nuevo con esa
// Prioridad por defecto.
const PRIORIDADES_BASE = [
  { nombre: 'Baja', tiempoPrimeraRespuesta: 240, tiempoResolucion: 2880 },
  { nombre: 'Media', tiempoPrimeraRespuesta: 60, tiempoResolucion: 480 },
  { nombre: 'Alta', tiempoPrimeraRespuesta: 15, tiempoResolucion: 120 },
];

async function seedCatalogoBase() {
  const equipo = await prisma.equipo.upsert({
    where: { nombre: 'Soporte General' },
    update: {},
    create: { nombre: 'Soporte General' },
  });

  await prisma.categoria.upsert({
    where: { nombre: 'General' },
    update: {},
    create: { nombre: 'General', equipoId: equipo.id },
  });

  for (const { nombre, tiempoPrimeraRespuesta, tiempoResolucion } of PRIORIDADES_BASE) {
    await prisma.prioridad.upsert({
      where: { nombre },
      update: {},
      create: { nombre, sla: { create: { tiempoPrimeraRespuesta, tiempoResolucion } } },
    });
  }

  console.log('[seed] catálogo base: Equipo "Soporte General", Categoría "General", Prioridades Baja/Media/Alta.');
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
