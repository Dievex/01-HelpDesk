import { http } from './http.js';

export const usuariosApi = {
  listar: () => http.get('/usuarios'),
  listarDeMiEquipo: () => http.get('/usuarios/mi-equipo'),
  obtener: (id) => http.get(`/usuarios/${id}`),
  crear: (datos) => http.post('/usuarios', datos),
  editar: (id, datos) => http.put(`/usuarios/${id}`, datos),
  eliminar: (id) => http.delete(`/usuarios/${id}`),
};
