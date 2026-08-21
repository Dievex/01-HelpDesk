// Error de dominio con status HTTP explícito -- lo captura errorHandler.js.
export class AppError extends Error {
  constructor(message, status = 400) {
    super(message);
    this.name = 'AppError';
    this.status = status;
  }
}
