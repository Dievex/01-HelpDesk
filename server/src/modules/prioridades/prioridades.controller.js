import * as prioridadesService from './prioridades.service.js';

export async function listar(req, res, next) {
  try {
    res.json({ prioridades: await prioridadesService.listar() });
  } catch (err) {
    next(err);
  }
}

export async function obtener(req, res, next) {
  try {
    res.json({ prioridad: await prioridadesService.obtener(req.params.id) });
  } catch (err) {
    next(err);
  }
}

export async function crear(req, res, next) {
  try {
    const prioridad = await prioridadesService.crear(req.body ?? {});
    res.status(201).json({ prioridad });
  } catch (err) {
    next(err);
  }
}

export async function editar(req, res, next) {
  try {
    const prioridad = await prioridadesService.editar(req.params.id, req.body ?? {});
    res.json({ prioridad });
  } catch (err) {
    next(err);
  }
}

export async function eliminar(req, res, next) {
  try {
    await prioridadesService.eliminar(req.params.id);
    res.status(204).end();
  } catch (err) {
    next(err);
  }
}
