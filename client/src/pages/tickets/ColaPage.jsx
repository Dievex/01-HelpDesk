import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ticketsApi } from '../../api/tickets.js';
import EstadoBadge from '../../components/EstadoBadge.jsx';

// UC-14 Listar Cola de Tickets
export default function ColaPage() {
  const [cola, setCola] = useState({ sinAsignar: [], asignadosAMi: [] });
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  const [tomandoId, setTomandoId] = useState(null);

  useEffect(() => {
    cargar();
  }, []);

  async function cargar() {
    setCargando(true);
    setError(null);
    try {
      setCola(await ticketsApi.listarCola());
    } catch (err) {
      setError(err.message);
    } finally {
      setCargando(false);
    }
  }

  async function handleTomar(ticketId) {
    setError(null);
    setTomandoId(ticketId);
    try {
      await ticketsApi.tomar(ticketId);
      await cargar();
    } catch (err) {
      // FA-1: condición de carrera, otro agente lo tomó primero -- se recarga la cola.
      setError(err.message);
      await cargar();
    } finally {
      setTomandoId(null);
    }
  }

  if (cargando) return <p>Cargando…</p>;

  return (
    <section>
      <h1>Mi Cola</h1>
      {error && <p className="error">{error}</p>}

      <h2>Sin asignar</h2>
      {cola.sinAsignar.length === 0 ? (
        <p>No hay tickets sin asignar en tu equipo.</p>
      ) : (
        <table className="table">
          <thead>
            <tr>
              <th>Título</th>
              <th>Categoría</th>
              <th>Prioridad</th>
              <th>Estado</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {cola.sinAsignar.map((t) => (
              <tr key={t.id}>
                <td>
                  <Link to={`/tickets/${t.id}`}>{t.titulo}</Link>
                </td>
                <td>{t.categoria.nombre}</td>
                <td>{t.prioridad.nombre}</td>
                <td>
                  <EstadoBadge estado={t.estado} />
                </td>
                <td>
                  <button type="button" onClick={() => handleTomar(t.id)} disabled={tomandoId === t.id}>
                    {tomandoId === t.id ? 'Tomando…' : 'Tomar'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <h2>Asignados a mí</h2>
      {cola.asignadosAMi.length === 0 ? (
        <p>No tienes tickets asignados.</p>
      ) : (
        <table className="table">
          <thead>
            <tr>
              <th>Título</th>
              <th>Categoría</th>
              <th>Prioridad</th>
              <th>Estado</th>
            </tr>
          </thead>
          <tbody>
            {cola.asignadosAMi.map((t) => (
              <tr key={t.id}>
                <td>
                  <Link to={`/tickets/${t.id}`}>{t.titulo}</Link>
                </td>
                <td>{t.categoria.nombre}</td>
                <td>{t.prioridad.nombre}</td>
                <td>
                  <EstadoBadge estado={t.estado} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </section>
  );
}
