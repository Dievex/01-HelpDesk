import * as articulosService from './articulos.service.js';

export async function listar(req, res, next) {
  try {
    const articulos = await articulosService.listar(req.usuario.rol, req.query.q);
    res.json({ articulos });
  } catch (err) {
    next(err);
  }
}

export async function obtener(req, res, next) {
  try {
    const articulo = await articulosService.obtener(req.params.id, req.usuario.rol);
    res.json({ articulo });
  } catch (err) {
    next(err);
  }
}

export async function crear(req, res, next) {
  try {
    const articulo = await articulosService.crear({ ...req.body, autorId: req.usuario.sub });
    res.status(201).json({ articulo });
  } catch (err) {
    next(err);
  }
}

export async function editar(req, res, next) {
  try {
    const articulo = await articulosService.editar(req.params.id, req.body ?? {});
    res.json({ articulo });
  } catch (err) {
    next(err);
  }
}

export async function eliminar(req, res, next) {
  try {
    await articulosService.eliminar(req.params.id);
    res.status(204).end();
  } catch (err) {
    next(err);
  }
}
