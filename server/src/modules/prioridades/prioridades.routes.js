import { Router } from 'express';
import * as prioridadesController from './prioridades.controller.js';
import { requireAuth, requireRole } from '../../middleware/auth.js';

export const prioridadesRouter = Router();

prioridadesRouter.use(requireAuth);

// Lectura abierta a cualquier autenticado: UC-41 Priorizar Ticket (Supervisor)
// necesita el catálogo para elegir, sin ser el Administrador que lo mantiene.
prioridadesRouter.get('/', prioridadesController.listar);
prioridadesRouter.get('/:id', prioridadesController.obtener);

prioridadesRouter.post('/', requireRole('ADMINISTRADOR'), prioridadesController.crear);
prioridadesRouter.put('/:id', requireRole('ADMINISTRADOR'), prioridadesController.editar);
prioridadesRouter.delete('/:id', requireRole('ADMINISTRADOR'), prioridadesController.eliminar);
