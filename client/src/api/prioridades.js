import { http } from './http.js';

export const prioridadesApi = {
  listar: () => http.get('/prioridades'),
  obtener: (id) => http.get(`/prioridades/${id}`),
  crear: (datos) => http.post('/prioridades', datos),
  editar: (id, datos) => http.put(`/prioridades/${id}`, datos),
  eliminar: (id) => http.delete(`/prioridades/${id}`),
};
