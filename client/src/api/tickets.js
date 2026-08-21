import { http } from './http.js';

export const ticketsApi = {
  crear: (datos) => http.post('/tickets', datos),
  obtener: (id) => http.get(`/tickets/${id}`),
  listarPropios: () => http.get('/tickets/propios'),
  listarCola: () => http.get('/tickets/cola'),
  tomar: (id) => http.post(`/tickets/${id}/tomar`),
  resolver: (id, datos) => http.post(`/tickets/${id}/resolver`, datos),
  escalar: (id, datos) => http.post(`/tickets/${id}/escalar`, datos),
  asignar: (id, datos) => http.post(`/tickets/${id}/asignar`, datos),
  reasignar: (id, datos) => http.post(`/tickets/${id}/reasignar`, datos),
  priorizar: (id, datos) => http.post(`/tickets/${id}/priorizar`, datos),
  confirmarCierre: (id) => http.post(`/tickets/${id}/confirmar-cierre`),
  reabrir: (id, datos) => http.post(`/tickets/${id}/reabrir`, datos),
  comentar: (id, datos) => http.post(`/tickets/${id}/comentarios`, datos),
  adjuntar: (id, formData) => http.postForm(`/tickets/${id}/adjuntos`, formData),
  urlDescargaAdjunto: (id, adjuntoId) => `/api/tickets/${id}/adjuntos/${adjuntoId}`,
  vincularArticulo: (id, datos) => http.post(`/tickets/${id}/vincular-articulo`, datos),
};
