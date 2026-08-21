import fs from 'node:fs';
import { createApp } from './app.js';
import { env } from './config/env.js';
import { iniciarCierreAutomatico } from './jobs/cierreAutomatico.js';

fs.mkdirSync(env.uploadsDir, { recursive: true });

const app = createApp();

iniciarCierreAutomatico();

app.listen(env.port, () => {
  console.log(`[server] escuchando en :${env.port} (${env.nodeEnv})`);
});
