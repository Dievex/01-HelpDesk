import { http } from './http.js';

export const articulosApi = {
  listar: (busqueda) => http.get(`/articulos${busqueda ? `?q=${encodeURIComponent(busqueda)}` : ''}`),
  obtener: (id) => http.get(`/articulos/${id}`),
  crear: (datos) => http.post('/articulos', datos),
  editar: (id, datos) => http.put(`/articulos/${id}`, datos),
  eliminar: (id) => http.delete(`/articulos/${id}`),
};
