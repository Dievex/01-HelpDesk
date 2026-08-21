import 'dotenv/config';

function required(name) {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Falta la variable de entorno ${name} (revisa .env, ver .env.example)`);
  }
  return value;
}

export const env = {
  nodeEnv: process.env.NODE_ENV ?? 'development',
  port: Number(process.env.PORT ?? 3000),
  databaseUrl: required('DATABASE_URL'),
  jwtSecret: required('JWT_SECRET'),
  // Configuración de instancia, no un valor fijo del producto (arquitectura.md).
  plazoReaperturaMinutos: Number(process.env.REOPEN_GRACE_DAYS ?? 7) * 24 * 60,

  // UC-42: volumen de Docker (arquitectura.md), no almacenamiento de objetos externo.
  uploadsDir: process.env.UPLOADS_DIR ?? '/app/uploads',
  adjuntoTamanoMaxMB: Number(process.env.ADJUNTO_TAMANO_MAX_MB ?? 10),
  adjuntoTiposPermitidos: (
    process.env.ADJUNTO_TIPOS_PERMITIDOS ??
    'image/png,image/jpeg,image/gif,application/pdf,text/plain'
  ).split(','),
};

env.adjuntoTamanoMaxBytes = env.adjuntoTamanoMaxMB * 1024 * 1024;
