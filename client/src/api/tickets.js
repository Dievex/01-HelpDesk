import { http } from './http.js';

export const ticketsApi = {
  crear: (datos) => http.post('/tickets', datos),
  obtener: (id) => http.get(`/tickets/${id}`),
  listarPropios: () => http.get('/tickets/propios'),
  listarCola: () => http.get('/tickets/cola'),
  tomar: (id) => http.post(`/tickets/${id}/tomar`),
  resolver: (id, datos) => http.post(`/tickets/${id}/resolver`, datos),
};
