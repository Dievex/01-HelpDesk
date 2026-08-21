import { useEffect, useState } from 'react';

// Esqueleto de Iteración 0: solo prueba que el pipeline completo
// (Vite -> proxy -> Express -> respuesta) funciona dentro de Docker.
// Las pantallas reales llegan en las iteraciones 1 en adelante.
export default function App() {
  const [apiStatus, setApiStatus] = useState('comprobando...');

  useEffect(() => {
    fetch('/api/health')
      .then((res) => res.json())
      .then((data) => setApiStatus(data.status))
      .catch(() => setApiStatus('sin conexión con el servidor'));
  }, []);

  return (
    <main style={{ fontFamily: 'system-ui, sans-serif', padding: '2rem' }}>
      <h1>HelpDesk</h1>
      <p>Fase de Construcción — Iteración 0 (entorno y esqueleto).</p>
      <p>
        Estado de la API: <strong>{apiStatus}</strong>
      </p>
    </main>
  );
}
