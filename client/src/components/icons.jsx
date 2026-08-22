export function Icono({ path, className }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      {path}
    </svg>
  );
}

export const ICONOS = {
  tickets: <path d="M4 8a2 2 0 012-2h12a2 2 0 012 2v2a2 2 0 000 4v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2a2 2 0 000-4V8z" />,
  cola: <path d="M3 7l3-4h12l3 4M3 7v11a2 2 0 002 2h14a2 2 0 002-2V7M3 7h18M9 12h6" />,
  dashboard: <path d="M4 20V10M12 20V4M20 20v-7" />,
  libro: <path d="M4 5a2 2 0 012-2h11a1 1 0 011 1v14a1 1 0 01-1 1H6a2 2 0 00-2 2V5zM4 19a2 2 0 012-2h12" />,
  usuarios: <path d="M9 11a3 3 0 100-6 3 3 0 000 6zM3 20c0-3 2.5-5.5 6-5.5S15 17 15 20M17 8a2.5 2.5 0 010 5M19.5 20c0-2.3-1.6-4.2-3.8-4.9" />,
  etiqueta: <path d="M20 12l-8 8-9-9V4h7l10 10a1.4 1.4 0 000-2M7 7h.01" />,
  equipos: <path d="M17 20v-1a4 4 0 00-4-4H7a4 4 0 00-4 4v1M10 11a3.5 3.5 0 100-7 3.5 3.5 0 000 7zM20 20v-1a3.5 3.5 0 00-2.5-3.36M15 4.13a3.5 3.5 0 010 6.75" />,
  bandera: <path d="M6 21V4M6 4h12l-3 4 3 4H6" />,
};
