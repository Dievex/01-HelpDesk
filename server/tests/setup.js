import { beforeEach } from 'vitest';
import { testDatabaseUrl } from './testDbUrl.js';

// Debe ejecutarse antes de que cualquier módulo de la app importe prisma.js
// (setupFiles corre antes que el archivo de test) para que PrismaClient se
// construya ya apuntando a la base de datos de test.
process.env.DATABASE_URL = testDatabaseUrl(process.env.DATABASE_URL);
process.env.NODE_ENV = 'test';

const { prisma } = await import('../src/db/prisma.js');

// Orden irrelevante -- CASCADE arrastra las FK (incluida la tabla implícita M:N
// Ticket<->ArticuloConocimiento). Se trunca antes de cada test, no solo por archivo,
// para que ningún test dependa del orden de ejecución de otro.
const TABLAS = [
  'Notificacion',
  'EventoAuditoria',
  'Adjunto',
  'Comentario',
  'Ticket',
  'ArticuloConocimiento',
  'SLA',
  'Prioridad',
  'Categoria',
  'Usuario',
  'Equipo',
];

beforeEach(async () => {
  await prisma.$executeRawUnsafe(
    `TRUNCATE TABLE ${TABLAS.map((t) => `"${t}"`).join(', ')} RESTART IDENTITY CASCADE`,
  );
});
