import * as usuariosService from './usuarios.service.js';

export async function listar(req, res, next) {
  try {
    res.json({ usuarios: await usuariosService.listar() });
  } catch (err) {
    next(err);
  }
}

export async function obtener(req, res, next) {
  try {
    res.json({ usuario: await usuariosService.obtener(req.params.id) });
  } catch (err) {
    next(err);
  }
}

export async function crear(req, res, next) {
  try {
    const usuario = await usuariosService.crear(req.body ?? {});
    res.status(201).json({ usuario });
  } catch (err) {
    next(err);
  }
}

export async function editar(req, res, next) {
  try {
    const usuario = await usuariosService.editar(req.params.id, req.body ?? {});
    res.json({ usuario });
  } catch (err) {
    next(err);
  }
}

export async function eliminar(req, res, next) {
  try {
    await usuariosService.eliminar(req.params.id);
    res.status(204).end();
  } catch (err) {
    next(err);
  }
}
