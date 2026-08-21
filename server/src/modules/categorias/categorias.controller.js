import * as categoriasService from './categorias.service.js';

export async function listar(req, res, next) {
  try {
    res.json({ categorias: await categoriasService.listar() });
  } catch (err) {
    next(err);
  }
}

export async function obtener(req, res, next) {
  try {
    res.json({ categoria: await categoriasService.obtener(req.params.id) });
  } catch (err) {
    next(err);
  }
}

export async function crear(req, res, next) {
  try {
    const categoria = await categoriasService.crear(req.body ?? {});
    res.status(201).json({ categoria });
  } catch (err) {
    next(err);
  }
}

export async function editar(req, res, next) {
  try {
    const categoria = await categoriasService.editar(req.params.id, req.body ?? {});
    res.json({ categoria });
  } catch (err) {
    next(err);
  }
}

export async function eliminar(req, res, next) {
  try {
    await categoriasService.eliminar(req.params.id);
    res.status(204).end();
  } catch (err) {
    next(err);
  }
}
