import { http } from './http.js';

export const equiposApi = {
  listar: () => http.get('/equipos'),
  obtener: (id) => http.get(`/equipos/${id}`),
  crear: (datos) => http.post('/equipos', datos),
  editar: (id, datos) => http.put(`/equipos/${id}`, datos),
  eliminar: (id) => http.delete(`/equipos/${id}`),
};
