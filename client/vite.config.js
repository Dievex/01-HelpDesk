import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    port: 5173,
    watch: {
      usePolling: true, // el bind-mount de Docker en Windows no siempre avisa de cambios
    },
    proxy: {
      '/api': 'http://localhost:3000', // ambos procesos corren en el mismo contenedor
    },
  },
});
