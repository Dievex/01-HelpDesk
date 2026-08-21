import * as reportsService from './reports.service.js';

export async function obtenerMetricas(req, res, next) {
  try {
    const metricas = await reportsService.obtenerMetricas(req.usuario.sub, req.query);
    res.json({ metricas });
  } catch (err) {
    next(err);
  }
}
