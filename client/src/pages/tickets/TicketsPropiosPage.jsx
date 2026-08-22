import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ticketsApi } from '../../api/tickets.js';
import EstadoBadge from '../../components/EstadoBadge.jsx';
import { Icono, ICONOS } from '../../components/icons.jsx';

// UC-05 Listar Tickets Propios
export default function TicketsPropiosPage() {
  const [tickets, setTickets] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    cargar();
  }, []);

  async function cargar() {
    setCargando(true);
    setError(null);
    try {
      const { tickets } = await ticketsApi.listarPropios();
      setTickets(tickets);
    } catch (err) {
      setError(err.message);
    } finally {
      setCargando(false);
    }
  }

  return (
    <section>
      <div className="section-header">
        <div className="section-header-title">
          <span className="page-header-icon">
            <Icono path={ICONOS.tickets} />
          </span>
          <h1>Mis Tickets</h1>
        </div>
        <Link to="/tickets/nuevo">+ Crear ticket</Link>
      </div>

      {error && <p className="error">{error}</p>}
      {cargando ? (
        <p className="estado-vacio">Cargando…</p>
      ) : tickets.length === 0 ? (
        <p className="estado-vacio">Todavía no has reportado ningún ticket.</p>
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
            {tickets.map((t) => (
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
