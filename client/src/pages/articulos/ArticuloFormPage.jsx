import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { articulosApi } from '../../api/articulos.js';
import { useAuth } from '../../context/AuthContext.jsx';

const ROLES_ESCRITURA = ['AGENTE', 'SUPERVISOR'];
const FORM_VACIO = { titulo: '', contenido: '', visibilidad: 'PUBLICO' };

// UC-09 Ver, UC-15 Crear, UC-16 Editar, UC-17 Eliminar Artículo de Conocimiento.
// Ver es de cualquier actor con acceso (visibilidad); Crear/Editar/Eliminar son
// de Agente de Soporte -- el propio componente decide mostrar formulario o solo
// lectura según el rol, ya que UC-09 y UC-16 comparten la misma pantalla.
export default function ArticuloFormPage() {
  const { id } = useParams();
  const editando = Boolean(id);
  const navigate = useNavigate();
  const { usuario } = useAuth();
  const puedeEscribir = ROLES_ESCRITURA.includes(usuario.rol);

  const [form, setForm] = useState(FORM_VACIO);
  const [cargando, setCargando] = useState(editando);
  const [error, setError] = useState(null);
  const [enviando, setEnviando] = useState(false);

  useEffect(() => {
    if (!editando) return;
    articulosApi
      .obtener(id)
      .then(({ articulo }) => setForm(articulo))
      .catch((err) => setError(err.message))
      .finally(() => setCargando(false));
  }, [id, editando]);

  function actualizarCampo(campo, valor) {
    setForm((prev) => ({ ...prev, [campo]: valor }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setEnviando(true);
    try {
      const datos = { titulo: form.titulo, contenido: form.contenido, visibilidad: form.visibilidad };
      if (editando) {
        await articulosApi.editar(id, datos);
        navigate(`/base-conocimiento/${id}`);
      } else {
        const { articulo } = await articulosApi.crear(datos);
        navigate(`/base-conocimiento/${articulo.id}`);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setEnviando(false);
    }
  }

  async function handleEliminar() {
    if (!window.confirm(`¿Eliminar el artículo "${form.titulo}"?`)) return;
    setError(null);
    try {
      await articulosApi.eliminar(id);
      navigate('/base-conocimiento');
    } catch (err) {
      setError(err.message);
    }
  }

  if (cargando) return <p>Cargando…</p>;
  if (error && !form.titulo) return <p className="error">{error}</p>;

  // UC-09: cualquier actor sin permiso de escritura ve solo lectura.
  if (editando && !puedeEscribir) {
    return (
      <section className="ticket-detail">
        <h1>{form.titulo}</h1>
        <p className="article-visibility">{form.visibilidad === 'PUBLICO' ? 'Público' : 'Interno'}</p>
        <p>{form.contenido}</p>
      </section>
    );
  }

  return (
    <section className="form-page">
      <h1>{editando ? 'Editar artículo' : 'Crear artículo'}</h1>
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
          Contenido
          <textarea
            value={form.contenido}
            onChange={(e) => actualizarCampo('contenido', e.target.value)}
            rows={8}
            required
          />
        </label>
        <label>
          Visibilidad
          <select value={form.visibilidad} onChange={(e) => actualizarCampo('visibilidad', e.target.value)}>
            <option value="PUBLICO">Público</option>
            <option value="INTERNO">Interno (solo personal técnico)</option>
          </select>
        </label>

        {error && <p className="error">{error}</p>}

        <div className="form-actions">
          <button type="submit" disabled={enviando}>
            {enviando ? 'Guardando…' : 'Guardar'}
          </button>
          {editando && (
            <button type="button" className="danger" onClick={handleEliminar}>
              Eliminar
            </button>
          )}
        </div>
      </form>
    </section>
  );
}
