import * as ticketsService from './tickets.service.js';

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
