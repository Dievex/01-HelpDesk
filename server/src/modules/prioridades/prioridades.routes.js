import { Router } from 'express';
import * as prioridadesController from './prioridades.controller.js';
import { requireAuth, requireRole } from '../../middleware/auth.js';

export const prioridadesRouter = Router();

prioridadesRouter.use(requireAuth, requireRole('ADMINISTRADOR'));

prioridadesRouter.get('/', prioridadesController.listar);
prioridadesRouter.get('/:id', prioridadesController.obtener);
prioridadesRouter.post('/', prioridadesController.crear);
prioridadesRouter.put('/:id', prioridadesController.editar);
prioridadesRouter.delete('/:id', prioridadesController.eliminar);
