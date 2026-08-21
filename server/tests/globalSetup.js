import { execSync } from 'node:child_process';
import path from 'node:path';
import { PrismaClient } from '@prisma/client';
import { testDatabaseUrl } from './testDbUrl.js';

// Corre una única vez para toda la corrida de tests (a diferencia de setup.js, que
// corre por archivo): crea "helpdesk_test" si no existe y aplica las migraciones,
// para que "npm test" funcione solo con el entorno de Docker ya levantado -- sin
// pasos manuales previos, mismo criterio de reproducibilidad que el resto del proyecto.
export async function setup() {
  const baseUrl = process.env.DATABASE_URL;
  const testUrl = testDatabaseUrl(baseUrl);

  const admin = new PrismaClient({ datasources: { db: { url: baseUrl } } });
  try {
    await admin.$executeRawUnsafe('CREATE DATABASE helpdesk_test');
  } catch (err) {
    if (!String(err.message ?? err).includes('already exists')) {
      throw err;
    }
  } finally {
    await admin.$disconnect();
  }

  execSync('npx prisma migrate deploy --schema=../prisma/schema.prisma', {
    cwd: path.resolve(import.meta.dirname, '..'),
    env: { ...process.env, DATABASE_URL: testUrl },
    stdio: 'inherit',
  });
}
