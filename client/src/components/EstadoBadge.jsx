import { ESTADO_LABEL } from '../pages/tickets/estados.js';

// El color por estado vive en index.css (.badge-<slug>), no aquí -- este
// componente solo traduce el enum de Prisma al nombre de clase.
export default function EstadoBadge({ estado }) {
  const slug = estado.toLowerCase().replace(/_/g, '-');
  return <span className={`badge badge-${slug}`}>{ESTADO_LABEL[estado]}</span>;
}
