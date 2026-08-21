import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { ticketsApi } from '../../api/tickets.js';
import { useAuth } from '../../context/AuthContext.jsx';
import { ESTADO_LABEL } from './estados.js';

const ROLES_AGENTE = ['AGENTE', 'SUPERVISOR'];
const ESTADOS_TOMABLES = ['ABIERTO', 'ESCALADO'];
const ESTADOS_RESOLUBLES = ['ASIGNADO', 'EN_PROGRESO'];

// UC-04 Ver Ticket, con las acciones de UC-11 Tomar y UC-12 Resolver embebidas
// (mismo TicketController/TicketActionsView del Patrón 02 del Modelo de Análisis/Diseño).
export default function TicketDetailPage() {
  const { id } = useParams();
  const { usuario } = useAuth();

  const [ticket, setTicket] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  const [enviando, setEnviando] = useState(false);
  const [comentarioResolucion, setComentarioResolucion] = useState('');

  useEffect(() => {
    cargar();
  }, [id]);

  async function cargar() {
    setCargando(true);
    setError(null);
    try {
      const { ticket } = await ticketsApi.obtener(id);
      setTicket(ticket);
    } catch (err) {
      setError(err.message);
    } finally {
      setCargando(false);
    }
  }

  async function handleTomar() {
    setError(null);
    setEnviando(true);
    try {
      const { ticket } = await ticketsApi.tomar(id);
      setTicket(ticket);
    } catch (err) {
      // FA-1: condición de carrera, otro agente lo tomó primero.
      setError(err.message);
    } finally {
      setEnviando(false);
    }
  }

  async function handleResolver(e) {
    e.preventDefault();
    setError(null);
    setEnviando(true);
    try {
      const { ticket } = await ticketsApi.resolver(id, { comentario: comentarioResolucion });
      setTicket(ticket);
      setComentarioResolucion('');
    } catch (err) {
      setError(err.message);
    } finally {
      setEnviando(false);
    }
  }

  if (cargando) return <p>Cargando…</p>;
  if (error && !ticket) return <p className="error">{error}</p>;
  if (!ticket) return null;

  const esAgente = ROLES_AGENTE.includes(usuario.rol);
  const puedeTomar = esAgente && !ticket.agenteId && ESTADOS_TOMABLES.includes(ticket.estado);
  const puedeResolver =
    esAgente && ticket.agenteId === usuario.id && ESTADOS_RESOLUBLES.includes(ticket.estado);

  return (
    <section className="ticket-detail">
      <h1>{ticket.titulo}</h1>

      <dl className="ticket-meta">
        <dt>Estado</dt>
        <dd>{ESTADO_LABEL[ticket.estado]}</dd>
        <dt>Categoría</dt>
        <dd>{ticket.categoria.nombre}</dd>
        <dt>Prioridad</dt>
        <dd>{ticket.prioridad.nombre}</dd>
        <dt>Solicitante</dt>
        <dd>{ticket.solicitante.nombre}</dd>
        <dt>Agente</dt>
        <dd>{ticket.agente?.nombre ?? 'Sin asignar'}</dd>
      </dl>

      <p>{ticket.descripcion}</p>

      {error && <p className="error">{error}</p>}

      {puedeTomar && (
        <button type="button" onClick={handleTomar} disabled={enviando}>
          {enviando ? 'Tomando…' : 'Tomar ticket'}
        </button>
      )}

      {puedeResolver && (
        <form onSubmit={handleResolver} className="form">
          <label>
            Comentario de solución (opcional)
            <textarea
              value={comentarioResolucion}
              onChange={(e) => setComentarioResolucion(e.target.value)}
              rows={3}
            />
          </label>
          <div className="form-actions">
            <button type="submit" disabled={enviando}>
              {enviando ? 'Resolviendo…' : 'Resolver ticket'}
            </button>
          </div>
        </form>
      )}

      <h2>Comentarios</h2>
      {ticket.comentarios.length === 0 ? (
        <p>Sin comentarios todavía.</p>
      ) : (
        <ul className="comment-list">
          {ticket.comentarios.map((c) => (
            <li key={c.id}>
              <strong>{c.autor.nombre}</strong> — {new Date(c.fecha).toLocaleString()}
              <p>{c.texto}</p>
            </li>
          ))}
        </ul>
      )}

      <h2>Historial</h2>
      <ul className="audit-list">
        {ticket.eventosAuditoria.map((ev) => (
          <li key={ev.id}>
            {new Date(ev.fecha).toLocaleString()} — {ev.autor?.nombre ?? 'Sistema'}: {ev.tipoEvento}
          </li>
        ))}
      </ul>
    </section>
  );
}
