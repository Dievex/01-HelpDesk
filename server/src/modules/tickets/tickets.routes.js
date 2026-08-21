import { Router } from 'express';
import * as ticketsController from './tickets.controller.js';
import { requireAuth, requireRole } from '../../middleware/auth.js';

export const ticketsRouter = Router();

ticketsRouter.use(requireAuth);

// Todo actor autenticado hereda estas acciones de Solicitante.
ticketsRouter.post('/', ticketsController.crear);
ticketsRouter.get('/propios', ticketsController.listarPropios);

// Exclusivas de Agente de Soporte / Supervisor -- Administrador no hereda de AgenteSoporte.
ticketsRouter.get('/cola', requireRole('AGENTE', 'SUPERVISOR'), ticketsController.listarCola);
ticketsRouter.post('/:id/tomar', requireRole('AGENTE', 'SUPERVISOR'), ticketsController.tomar);
ticketsRouter.post('/:id/resolver', requireRole('AGENTE', 'SUPERVISOR'), ticketsController.resolver);
ticketsRouter.post('/:id/escalar', requireRole('AGENTE', 'SUPERVISOR'), ticketsController.escalar);

// Exclusivas de Supervisor.
ticketsRouter.post('/:id/asignar', requireRole('SUPERVISOR'), ticketsController.asignar);
ticketsRouter.post('/:id/reasignar', requireRole('SUPERVISOR'), ticketsController.reasignar);
ticketsRouter.post('/:id/priorizar', requireRole('SUPERVISOR'), ticketsController.priorizar);

// De Solicitante (el control de que sea quien reportó el ticket vive en el servicio).
ticketsRouter.post('/:id/confirmar-cierre', ticketsController.confirmarCierre);
ticketsRouter.post('/:id/reabrir', ticketsController.reabrir);

// El control de acceso fino (solicitante/agente/equipo) vive en el servicio.
ticketsRouter.get('/:id', ticketsController.obtener);
