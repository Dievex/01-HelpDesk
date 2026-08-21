export function errorHandler(err, req, res, next) {
  const status = err.status ?? 500;
  // Los errores de negocio esperados (400/401/403/404/409...) no ensucian el log
  // con un stack trace -- solo lo inesperado (500) merece diagnóstico completo.
  if (status >= 500) {
    console.error(err);
  }
  res.status(status).json({ error: err.message ?? 'Error interno del servidor' });
}
