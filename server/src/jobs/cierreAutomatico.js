import cron from 'node-cron';
import { cerrarPorVencimiento } from '../modules/tickets/tickets.service.js';

const INTERVALO_CRON = process.env.CIERRE_AUTOMATICO_CRON ?? '*/5 * * * *';

export function iniciarCierreAutomatico() {
  cron.schedule(INTERVALO_CRON, async () => {
    const cerrados = await cerrarPorVencimiento();
    if (cerrados > 0) {
      console.log(`[cierre-automatico] ${cerrados} ticket(s) cerrado(s) por vencimiento del Plazo de Reapertura`);
    }
  });
}
