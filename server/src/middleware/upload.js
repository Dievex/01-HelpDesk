import crypto from 'node:crypto';
import path from 'node:path';
import multer from 'multer';
import { env } from '../config/env.js';
import { AppError } from '../utils/AppError.js';

const storage = multer.diskStorage({
  destination: env.uploadsDir,
  filename: (req, file, cb) => {
    cb(null, `${crypto.randomUUID()}${path.extname(file.originalname)}`);
  },
});

function fileFilter(req, file, cb) {
  if (!env.adjuntoTiposPermitidos.includes(file.mimetype)) {
    // FA-2 de UC-42: lista blanca, no lista negra.
    cb(new AppError('Tipo de archivo no permitido', 400));
    return;
  }
  cb(null, true);
}

const single = multer({
  storage,
  fileFilter,
  limits: { fileSize: env.adjuntoTamanoMaxBytes },
}).single('archivo');

// UC-42, FA-1: multer lanza su propio error de tamaño excedido fuera del
// fileFilter -- se traduce aquí a un AppError legible para el errorHandler.
export function uploadAdjunto(req, res, next) {
  single(req, res, (err) => {
    if (err instanceof multer.MulterError && err.code === 'LIMIT_FILE_SIZE') {
      next(new AppError(`El archivo supera el tamaño máximo permitido (${env.adjuntoTamanoMaxMB} MB)`, 400));
      return;
    }
    next(err);
  });
}
