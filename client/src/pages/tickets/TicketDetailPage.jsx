import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ticketsApi } from '../../api/tickets.js';
import { usuariosApi } from '../../api/usuarios.js';
import { prioridadesApi } from '../../api/prioridades.js';
import { articulosApi } from '../../api/articulos.js';
import { useAuth } from '../../context/AuthContext.jsx';
import EstadoBadge from '../../components/EstadoBadge.jsx';

const ROLES_AGENTE = ['AGENTE', 'SUPERVISOR'];
const ESTADOS_TOMABLES = ['ABIERTO', 'ESCALADO'];
const ESTADOS_RESOLUBLES = ['ASIGNADO', 'EN_PROGRESO', 'REABIERTO'];
const ESTADOS_ESCALABLES = ['ASIGNADO', 'EN_PROGRESO'];
const ESTADOS_REASIGNABLES = ['ASIGNADO', 'EN_PROGRESO', 'REABIERTO'];
const ESTADOS_CON_AGENTE_ACTIVO = ['ASIGNADO', 'EN_PROGRESO', 'REABIERTO'];

// UC-04 Ver Ticket, con el resto del ciclo de vida del Patrón 02 embebido en la
// misma pantalla (mismo TicketController/TicketActionsView del Modelo de
// Análisis/Diseño): Tomar, Resolver, Escalar, Asignar, Reasignar, Priorizar,
// Confirmar Cierre y Reabrir.
export default function TicketDetailPage() {
  const { id } = useParams();
  const { usuario } = useAuth();

  const [ticket, setTicket] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  const [enviando, setEnviando] = useState(false);

  const [agentesEquipo, setAgentesEquipo] = useState([]);
  const [prioridades, setPrioridades] = useState([]);
  const [articulosDisponibles, setArticulosDisponibles] = useState([]);

  const [comentarioResolucion, setComentarioResolucion] = useState('');
  const [motivoEscalar, setMotivoEscalar] = useState('');
  const [agenteAsignar, setAgenteAsignar] = useState('');
  const [agenteReasignar, setAgenteReasignar] = useState('');
  const [prioridadElegida, setPrioridadElegida] = useState('');
  const [motivoReabrir, setMotivoReabrir] = useState('');
  const [comentarioNuevo, setComentarioNuevo] = useState('');
  const [archivoSeleccionado, setArchivoSeleccionado] = useState(null);
  const [articuloVincular, setArticuloVincular] = useState('');

  useEffect(() => {
    cargarTicket();
  }, [id]);

  useEffect(() => {
    if (usuario.rol !== 'SUPERVISOR') return;
    usuariosApi.listarDeMiEquipo().then(({ usuarios }) => setAgentesEquipo(usuarios));
    prioridadesApi.listar().then(({ prioridades }) => setPrioridades(prioridades));
  }, [usuario.rol]);

  useEffect(() => {
    if (!ROLES_AGENTE.includes(usuario.rol)) return;
    articulosApi.listar().then(({ articulos }) => setArticulosDisponibles(articulos));
  }, [usuario.rol]);

  async function cargarTicket() {
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

  // Centraliza el try/catch/enviando común a las 8 acciones -- cada handler solo
  // describe qué llamada hacer.
  async function ejecutarAccion(llamada) {
    setError(null);
    setEnviando(true);
    try {
      const { ticket } = await llamada();
      setTicket(ticket);
      return true;
    } catch (err) {
      setError(err.message);
      return false;
    } finally {
      setEnviando(false);
    }
  }

  const handleTomar = () => ejecutarAccion(() => ticketsApi.tomar(id));

  async function handleResolver(e) {
    e.preventDefault();
    const ok = await ejecutarAccion(() => ticketsApi.resolver(id, { comentario: comentarioResolucion }));
    if (ok) setComentarioResolucion('');
  }

  async function handleEscalar(e) {
    e.preventDefault();
    const ok = await ejecutarAccion(() => ticketsApi.escalar(id, { motivo: motivoEscalar }));
    if (ok) setMotivoEscalar('');
  }

  async function handleAsignar(e) {
    e.preventDefault();
    await ejecutarAccion(() => ticketsApi.asignar(id, { agenteId: agenteAsignar }));
  }

  async function handleReasignar(e) {
    e.preventDefault();
    await ejecutarAccion(() => ticketsApi.reasignar(id, { agenteId: agenteReasignar }));
  }

  async function handlePriorizar(e) {
    e.preventDefault();
    await ejecutarAccion(() => ticketsApi.priorizar(id, { prioridadId: prioridadElegida }));
  }

  const handleConfirmarCierre = () => ejecutarAccion(() => ticketsApi.confirmarCierre(id));

  async function handleReabrir(e) {
    e.preventDefault();
    const ok = await ejecutarAccion(() => ticketsApi.reabrir(id, { motivo: motivoReabrir }));
    if (ok) setMotivoReabrir('');
  }

  async function handleComentar(e) {
    e.preventDefault();
    const ok = await ejecutarAccion(() => ticketsApi.comentar(id, { texto: comentarioNuevo }));
    if (ok) setComentarioNuevo('');
  }

  async function handleAdjuntar(e) {
    e.preventDefault();
    if (!archivoSeleccionado) return;
    const formData = new FormData();
    formData.append('archivo', archivoSeleccionado);
    const ok = await ejecutarAccion(() => ticketsApi.adjuntar(id, formData));
    if (ok) setArchivoSeleccionado(null);
  }

  async function handleVincularArticulo(e) {
    e.preventDefault();
    const ok = await ejecutarAccion(() => ticketsApi.vincularArticulo(id, { articuloId: articuloVincular }));
    if (ok) setArticuloVincular('');
  }

  if (cargando) return <p>Cargando…</p>;
  if (error && !ticket) return <p className="error">{error}</p>;
  if (!ticket) return null;

  const esAgente = ROLES_AGENTE.includes(usuario.rol);
  const esSupervisor = usuario.rol === 'SUPERVISOR';
  const esMiTicket = ticket.agenteId === usuario.id;
  const esSolicitanteDelTicket = ticket.solicitante.id === usuario.id;
  const sinAsignarYTomable = !ticket.agenteId && ESTADOS_TOMABLES.includes(ticket.estado);

  const puedeTomar = esAgente && sinAsignarYTomable;
  const puedeAsignar = esSupervisor && sinAsignarYTomable;
  const puedeResolver = esAgente && esMiTicket && ESTADOS_RESOLUBLES.includes(ticket.estado);
  const puedeEscalar = esAgente && esMiTicket && ESTADOS_ESCALABLES.includes(ticket.estado);
  const puedeReasignar =
    esSupervisor && ticket.agenteId && ESTADOS_REASIGNABLES.includes(ticket.estado);
  const puedePriorizar = esSupervisor && !ticket.prioridadConfirmada;
  const puedeConfirmarCierre = esSolicitanteDelTicket && ticket.estado === 'RESUELTO';
  const puedeReabrir = esSolicitanteDelTicket && ticket.estado === 'RESUELTO';
  const puedeVincularArticulo = esAgente && esMiTicket && ESTADOS_CON_AGENTE_ACTIVO.includes(ticket.estado);
  const articulosParaVincular = articulosDisponibles.filter(
    (a) => !ticket.articulos.some((v) => v.id === a.id),
  );

  return (
    <section className="ticket-detail">
      <h1>{ticket.titulo}</h1>

      <dl className="ticket-meta">
        <dt>Estado</dt>
        <dd>
          <EstadoBadge estado={ticket.estado} />
        </dd>
        <dt>Categoría</dt>
        <dd>{ticket.categoria.nombre}</dd>
        <dt>Prioridad</dt>
        <dd>
          {ticket.prioridad.nombre}
          {!ticket.prioridadConfirmada && ' (sin confirmar)'}
        </dd>
        <dt>Solicitante</dt>
        <dd>{ticket.solicitante.nombre}</dd>
        <dt>Agente</dt>
        <dd>{ticket.agente?.nombre ?? 'Sin asignar'}</dd>
      </dl>

      <p>{ticket.descripcion}</p>

      {error && <p className="error">{error}</p>}

      <div className="ticket-actions">
        {puedeTomar && (
          <button type="button" onClick={handleTomar} disabled={enviando}>
            Tomar ticket
          </button>
        )}

        {puedeResolver && (
          <form onSubmit={handleResolver} className="form">
            <label>
              Resolver -- comentario de solución (opcional)
              <textarea
                value={comentarioResolucion}
                onChange={(e) => setComentarioResolucion(e.target.value)}
                rows={2}
              />
            </label>
            <button type="submit" disabled={enviando}>
              Resolver ticket
            </button>
          </form>
        )}

        {puedeEscalar && (
          <form onSubmit={handleEscalar} className="form">
            <label>
              Escalar -- motivo
              <textarea
                value={motivoEscalar}
                onChange={(e) => setMotivoEscalar(e.target.value)}
                rows={2}
                required
              />
            </label>
            <button type="submit" disabled={enviando}>
              Escalar ticket
            </button>
          </form>
        )}

        {puedeAsignar && (
          <form onSubmit={handleAsignar} className="form">
            <label>
              Asignar a
              <select value={agenteAsignar} onChange={(e) => setAgenteAsignar(e.target.value)} required>
                <option value="" disabled>
                  Selecciona un agente…
                </option>
                {agentesEquipo.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.nombre}
                  </option>
                ))}
              </select>
            </label>
            <button type="submit" disabled={enviando}>
              Asignar ticket
            </button>
          </form>
        )}

        {puedeReasignar && (
          <form onSubmit={handleReasignar} className="form">
            <label>
              Reasignar a
              <select value={agenteReasignar} onChange={(e) => setAgenteReasignar(e.target.value)} required>
                <option value="" disabled>
                  Selecciona un agente…
                </option>
                {agentesEquipo
                  .filter((a) => a.id !== ticket.agenteId)
                  .map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.nombre}
                    </option>
                  ))}
              </select>
            </label>
            <button type="submit" disabled={enviando}>
              Reasignar ticket
            </button>
          </form>
        )}

        {puedePriorizar && (
          <form onSubmit={handlePriorizar} className="form">
            <label>
              Confirmar Prioridad real
              <select
                value={prioridadElegida}
                onChange={(e) => setPrioridadElegida(e.target.value)}
                required
              >
                <option value="" disabled>
                  Selecciona…
                </option>
                {prioridades.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.nombre}
                  </option>
                ))}
              </select>
            </label>
            <button type="submit" disabled={enviando}>
              Confirmar Prioridad
            </button>
          </form>
        )}

        {puedeConfirmarCierre && (
          <button type="button" onClick={handleConfirmarCierre} disabled={enviando}>
            Confirmar cierre
          </button>
        )}

        {puedeReabrir && (
          <form onSubmit={handleReabrir} className="form">
            <label>
              Reabrir -- motivo
              <textarea
                value={motivoReabrir}
                onChange={(e) => setMotivoReabrir(e.target.value)}
                rows={2}
                required
              />
            </label>
            <button type="submit" disabled={enviando} className="danger">
              Reabrir ticket
            </button>
          </form>
        )}
      </div>

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
      <form onSubmit={handleComentar} className="form">
        <label>
          Añadir comentario
          <textarea
            value={comentarioNuevo}
            onChange={(e) => setComentarioNuevo(e.target.value)}
            rows={2}
            required
          />
        </label>
        <button type="submit" disabled={enviando}>
          Comentar
        </button>
      </form>

      <h2>Adjuntos</h2>
      {ticket.adjuntos.length === 0 ? (
        <p>Sin adjuntos todavía.</p>
      ) : (
        <ul className="comment-list">
          {ticket.adjuntos.map((a) => (
            <li key={a.id}>
              <a href={ticketsApi.urlDescargaAdjunto(id, a.id)} target="_blank" rel="noreferrer">
                {a.nombreArchivo}
              </a>{' '}
              — {a.autor.nombre}, {new Date(a.fecha).toLocaleString()}
            </li>
          ))}
        </ul>
      )}
      <form onSubmit={handleAdjuntar} className="form">
        <label>
          Adjuntar archivo
          <input
            type="file"
            onChange={(e) => setArchivoSeleccionado(e.target.files[0] ?? null)}
            required
          />
        </label>
        <button type="submit" disabled={enviando || !archivoSeleccionado}>
          Subir adjunto
        </button>
      </form>

      <h2>Artículos de Conocimiento vinculados</h2>
      {ticket.articulos.length === 0 ? (
        <p>Ninguno todavía.</p>
      ) : (
        <ul className="comment-list">
          {ticket.articulos.map((a) => (
            <li key={a.id}>
              <Link to={`/base-conocimiento/${a.id}`}>{a.titulo}</Link>
            </li>
          ))}
        </ul>
      )}
      {puedeVincularArticulo && (
        <form onSubmit={handleVincularArticulo} className="form">
          <label>
            Vincular artículo
            <select value={articuloVincular} onChange={(e) => setArticuloVincular(e.target.value)} required>
              <option value="" disabled>
                Selecciona…
              </option>
              {articulosParaVincular.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.titulo}
                </option>
              ))}
            </select>
          </label>
          <button type="submit" disabled={enviando}>
            Vincular
          </button>
        </form>
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
