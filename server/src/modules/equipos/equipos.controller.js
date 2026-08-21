import * as equiposService from './equipos.service.js';

export async function listar(req, res, next) {
  try {
    res.json({ equipos: await equiposService.listar() });
  } catch (err) {
    next(err);
  }
}

export async function obtener(req, res, next) {
  try {
    res.json({ equipo: await equiposService.obtener(req.params.id) });
  } catch (err) {
    next(err);
  }
}

export async function crear(req, res, next) {
  try {
    const equipo = await equiposService.crear(req.body ?? {});
    res.status(201).json({ equipo });
  } catch (err) {
    next(err);
  }
}

export async function editar(req, res, next) {
  try {
    const equipo = await equiposService.editar(req.params.id, req.body ?? {});
    res.json({ equipo });
  } catch (err) {
    next(err);
  }
}

export async function eliminar(req, res, next) {
  try {
    await equiposService.eliminar(req.params.id);
    res.status(204).end();
  } catch (err) {
    next(err);
  }
}
