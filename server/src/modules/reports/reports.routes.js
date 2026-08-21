import { Router } from 'express';
import * as reportsController from './reports.controller.js';
import { requireAuth, requireRole } from '../../middleware/auth.js';

export const reportsRouter = Router();

reportsRouter.use(requireAuth);

// UC-20: exclusivo de Supervisor, no hay vista global de todos los equipos.
reportsRouter.get('/metricas', requireRole('SUPERVISOR'), reportsController.obtenerMetricas);
