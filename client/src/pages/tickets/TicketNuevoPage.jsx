import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ticketsApi } from '../../api/tickets.js';
import { categoriasApi } from '../../api/categorias.js';

// UC-03 Crear Ticket -- el Solicitante no elige Prioridad, la fija el Sistema (Baja
// por defecto); el Supervisor la confirma después en UC-41 (Iteración 4).
export default function TicketNuevoPage() {
  const navigate = useNavigate();

  const [form, setForm] = useState({ titulo: '', descripcion: '', categoriaId: '' });
  const [categorias, setCategorias] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  const [enviando, setEnviando] = useState(false);

  useEffect(() => {
    categoriasApi
      .listar()
      .then(({ categorias }) => setCategorias(categorias))
      .catch((err) => setError(err.message))
      .finally(() => setCargando(false));
  }, []);

  function actualizarCampo(campo, valor) {
    setForm((prev) => ({ ...prev, [campo]: valor }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setEnviando(true);
    try {
      const { ticket } = await ticketsApi.crear(form);
      navigate(`/tickets/${ticket.id}`);
    } catch (err) {
      // FA-1: validación fallida -- se queda en este mismo formulario.
      setError(err.message);
    } finally {
      setEnviando(false);
    }
  }

  if (cargando) return <p>Cargando…</p>;

  return (
    <section className="form-page">
      <h1>Crear ticket</h1>
      <form onSubmit={handleSubmit} className="form">
        <label>
          Título
          <input
            value={form.titulo}
            onChange={(e) => actualizarCampo('titulo', e.target.value)}
            required
          />
        </label>
        <label>
          Descripción
          <textarea
            value={form.descripcion}
            onChange={(e) => actualizarCampo('descripcion', e.target.value)}
            rows={5}
            required
          />
        </label>
        <label>
          Categoría
          <select
            value={form.categoriaId}
            onChange={(e) => actualizarCampo('categoriaId', e.target.value)}
            required
          >
            <option value="" disabled>
              Selecciona…
            </option>
            {categorias.map((c) => (
              <option key={c.id} value={c.id}>
                {c.nombre}
              </option>
            ))}
          </select>
        </label>

        {error && <p className="error">{error}</p>}

        <div className="form-actions">
          <button type="submit" disabled={enviando}>
            {enviando ? 'Creando…' : 'Crear ticket'}
          </button>
        </div>
      </form>
    </section>
  );
}
