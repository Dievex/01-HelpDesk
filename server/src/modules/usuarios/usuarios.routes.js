import { Router } from 'express';
import * as usuariosController from './usuarios.controller.js';
import { requireAuth, requireRole } from '../../middleware/auth.js';

export const usuariosRouter = Router();

// UC-36 a UC-40: todo el CRUD de Usuario es exclusivo del Administrador.
usuariosRouter.use(requireAuth, requireRole('ADMINISTRADOR'));

usuariosRouter.get('/', usuariosController.listar);
usuariosRouter.get('/:id', usuariosController.obtener);
usuariosRouter.post('/', usuariosController.crear);
usuariosRouter.put('/:id', usuariosController.editar);
usuariosRouter.delete('/:id', usuariosController.eliminar);
