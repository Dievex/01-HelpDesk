import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    port: 5173,
    proxy: {
      // Ambos procesos (Vite y Express) corren en el mismo contenedor en dev
      // (ver docker-compose.yml + package.json "dev"), así que localhost resuelve.
      '/api': 'http://localhost:3000',
    },
  },
});
