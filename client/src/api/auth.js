import { http } from './http.js';

export const authApi = {
  login: (correo, contrasena) => http.post('/auth/login', { correo, contrasena }),
  logout: () => http.post('/auth/logout'),
  me: () => http.get('/auth/me'),
};
