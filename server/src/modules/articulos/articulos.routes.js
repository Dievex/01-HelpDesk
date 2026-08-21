import { Router } from 'express';
import * as articulosController from './articulos.controller.js';
import { requireAuth, requireRole } from '../../middleware/auth.js';

export const articulosRouter = Router();

articulosRouter.use(requireAuth);

// UC-09/UC-10: lectura abierta a cualquier autenticado -- el filtro de
// visibilidad Público/Interno por rol vive en el servicio.
articulosRouter.get('/', articulosController.listar);
articulosRouter.get('/:id', articulosController.obtener);

// UC-15/16/17: Agente de Soporte (y Supervisor, por herencia) -- Administrador
// no hereda de AgenteSoporte, así que no puede escribir en la Base de Conocimiento.
articulosRouter.post('/', requireRole('AGENTE', 'SUPERVISOR'), articulosController.crear);
articulosRouter.put('/:id', requireRole('AGENTE', 'SUPERVISOR'), articulosController.editar);
articulosRouter.delete('/:id', requireRole('AGENTE', 'SUPERVISOR'), articulosController.eliminar);
