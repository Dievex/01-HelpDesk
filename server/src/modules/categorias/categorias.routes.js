import { Router } from 'express';
import * as categoriasController from './categorias.controller.js';
import { requireAuth, requireRole } from '../../middleware/auth.js';

export const categoriasRouter = Router();

categoriasRouter.use(requireAuth);

// Lectura abierta a cualquier autenticado: UC-03 Crear Ticket necesita el catálogo
// para su selector de Categoría, sin importar el rol de quien crea el ticket.
categoriasRouter.get('/', categoriasController.listar);
categoriasRouter.get('/:id', categoriasController.obtener);

categoriasRouter.post('/', requireRole('ADMINISTRADOR'), categoriasController.crear);
categoriasRouter.put('/:id', requireRole('ADMINISTRADOR'), categoriasController.editar);
categoriasRouter.delete('/:id', requireRole('ADMINISTRADOR'), categoriasController.eliminar);
