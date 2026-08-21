import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    globalSetup: ['./tests/globalSetup.js'],
    setupFiles: ['./tests/setup.js'],
    // Todos los archivos comparten una única base de datos de test -- correrlos en
    // paralelo produciría condiciones de carrera entre el TRUNCATE de un archivo y
    // las queries de otro.
    fileParallelism: false,
    testTimeout: 15000,
    hookTimeout: 30000,
  },
});
