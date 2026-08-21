import { Router } from 'express';
import * as usuariosController from './usuarios.controller.js';
import { requireAuth, requireRole } from '../../middleware/auth.js';

export const usuariosRouter = Router();

usuariosRouter.use(requireAuth);

// UC-18/UC-19: el Supervisor ve a los Agentes de su propio Equipo, sin acceso al
// CRUD completo. Va antes del guard de Administrador y de "/:id" para no chocar.
usuariosRouter.get(
  '/mi-equipo',
  requireRole('AGENTE', 'SUPERVISOR'),
  usuariosController.listarDeMiEquipo,
);

// UC-36 a UC-40: el resto del CRUD de Usuario es exclusivo del Administrador.
usuariosRouter.use(requireRole('ADMINISTRADOR'));

usuariosRouter.get('/', usuariosController.listar);
usuariosRouter.get('/:id', usuariosController.obtener);
usuariosRouter.post('/', usuariosController.crear);
usuariosRouter.put('/:id', usuariosController.editar);
usuariosRouter.delete('/:id', usuariosController.eliminar);
