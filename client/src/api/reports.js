import { http } from './http.js';

export const reportsApi = {
  obtenerMetricas: (desde, hasta) => http.get(`/reports/metricas?desde=${desde}&hasta=${hasta}`),
};
