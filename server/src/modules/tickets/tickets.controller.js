import path from 'node:path';
import * as ticketsService from './tickets.service.js';
import { env } from '../../config/env.js';
import { AppError } from '../../utils/AppError.js';

export async function crear(req, res, next) {
  try {
    const ticket = await ticketsService.crear({ ...req.body, solicitanteId: req.usuario.sub });
    res.status(201).json({ ticket });
  } catch (err) {
    next(err);
  }
}

export async function obtener(req, res, next) {
  try {
    const ticket = await ticketsService.verDetalle(req.params.id, req.usuario.sub);
    res.json({ ticket });
  } catch (err) {
    next(err);
  }
}

export async function listarPropios(req, res, next) {
  try {
    const tickets = await ticketsService.listarPropios(req.usuario.sub);
    res.json({ tickets });
  } catch (err) {
    next(err);
  }
}

export async function listarCola(req, res, next) {
  try {
    const cola = await ticketsService.listarCola(req.usuario.sub);
    res.json(cola);
  } catch (err) {
    next(err);
  }
}

export async function tomar(req, res, next) {
  try {
    const ticket = await ticketsService.tomar(req.params.id, req.usuario.sub);
    res.json({ ticket });
  } catch (err) {
    next(err);
  }
}

export async function resolver(req, res, next) {
  try {
    const ticket = await ticketsService.resolver(req.params.id, req.usuario.sub, req.body ?? {});
    res.json({ ticket });
  } catch (err) {
    next(err);
  }
}

export async function escalar(req, res, next) {
  try {
    const ticket = await ticketsService.escalar(req.params.id, req.usuario.sub, req.body ?? {});
    res.json({ ticket });
  } catch (err) {
    next(err);
  }
}

export async function asignar(req, res, next) {
  try {
    const ticket = await ticketsService.asignar(req.params.id, req.usuario.sub, req.body ?? {});
    res.json({ ticket });
  } catch (err) {
    next(err);
  }
}

export async function reasignar(req, res, next) {
  try {
    const ticket = await ticketsService.reasignar(req.params.id, req.usuario.sub, req.body ?? {});
    res.json({ ticket });
  } catch (err) {
    next(err);
  }
}

export async function priorizar(req, res, next) {
  try {
    const ticket = await ticketsService.priorizar(req.params.id, req.usuario.sub, req.body ?? {});
    res.json({ ticket });
  } catch (err) {
    next(err);
  }
}

export async function confirmarCierre(req, res, next) {
  try {
    const ticket = await ticketsService.confirmarCierre(req.params.id, req.usuario.sub);
    res.json({ ticket });
  } catch (err) {
    next(err);
  }
}

export async function reabrir(req, res, next) {
  try {
    const ticket = await ticketsService.reabrir(req.params.id, req.usuario.sub, req.body ?? {});
    res.json({ ticket });
  } catch (err) {
    next(err);
  }
}

export async function comentar(req, res, next) {
  try {
    const ticket = await ticketsService.comentar(req.params.id, req.usuario.sub, req.body ?? {});
    res.json({ ticket });
  } catch (err) {
    next(err);
  }
}

export async function adjuntar(req, res, next) {
  try {
    if (!req.file) {
      throw new AppError('Selecciona un archivo', 400);
    }
    const ticket = await ticketsService.adjuntar(req.params.id, req.usuario.sub, req.file);
    res.status(201).json({ ticket });
  } catch (err) {
    next(err);
  }
}

export async function descargarAdjunto(req, res, next) {
  try {
    const adjunto = await ticketsService.obtenerAdjuntoParaDescarga(
      req.params.id,
      req.params.adjuntoId,
      req.usuario.sub,
    );
    res.download(path.join(env.uploadsDir, adjunto.nombreFisico), adjunto.nombreArchivo);
  } catch (err) {
    next(err);
  }
}

export async function vincularArticulo(req, res, next) {
  try {
    const ticket = await ticketsService.vincularArticulo(req.params.id, req.usuario.sub, req.body ?? {});
    res.json({ ticket });
  } catch (err) {
    next(err);
  }
}
