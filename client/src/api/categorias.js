import { http } from './http.js';

export const categoriasApi = {
  listar: () => http.get('/categorias'),
  obtener: (id) => http.get(`/categorias/${id}`),
  crear: (datos) => http.post('/categorias', datos),
  editar: (id, datos) => http.put(`/categorias/${id}`, datos),
  eliminar: (id) => http.delete(`/categorias/${id}`),
};
