import { Router } from 'express';
import * as equiposController from './equipos.controller.js';
import { requireAuth, requireRole } from '../../middleware/auth.js';

export const equiposRouter = Router();

equiposRouter.use(requireAuth, requireRole('ADMINISTRADOR'));

equiposRouter.get('/', equiposController.listar);
equiposRouter.get('/:id', equiposController.obtener);
equiposRouter.post('/', equiposController.crear);
equiposRouter.put('/:id', equiposController.editar);
equiposRouter.delete('/:id', equiposController.eliminar);
