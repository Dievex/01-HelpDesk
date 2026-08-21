import { Router } from 'express';
import * as categoriasController from './categorias.controller.js';
import { requireAuth, requireRole } from '../../middleware/auth.js';

export const categoriasRouter = Router();

categoriasRouter.use(requireAuth, requireRole('ADMINISTRADOR'));

categoriasRouter.get('/', categoriasController.listar);
categoriasRouter.get('/:id', categoriasController.obtener);
categoriasRouter.post('/', categoriasController.crear);
categoriasRouter.put('/:id', categoriasController.editar);
categoriasRouter.delete('/:id', categoriasController.eliminar);
