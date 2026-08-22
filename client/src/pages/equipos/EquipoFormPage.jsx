import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { equiposApi } from '../../api/equipos.js';
import { Icono, ICONOS } from '../../components/icons.jsx';

export default function EquipoFormPage() {
  const { id } = useParams();
  const editando = Boolean(id);
  const navigate = useNavigate();

  const [nombre, setNombre] = useState('');
  const [cargando, setCargando] = useState(editando);
  const [error, setError] = useState(null);
  const [enviando, setEnviando] = useState(false);

  useEffect(() => {
    if (!editando) return;
    equiposApi
      .obtener(id)
      .then(({ equipo }) => setNombre(equipo.nombre))
      .catch((err) => setError(err.message))
      .finally(() => setCargando(false));
  }, [id, editando]);

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setEnviando(true);
    try {
      if (editando) {
        await equiposApi.editar(id, { nombre });
      } else {
        await equiposApi.crear({ nombre });
      }
      navigate('/equipos');
    } catch (err) {
      setError(err.message);
    } finally {
      setEnviando(false);
    }
  }

  async function handleEliminar() {
    if (!window.confirm(`¿Eliminar el equipo "${nombre}"?`)) return;
    setError(null);
    try {
      await equiposApi.eliminar(id);
      navigate('/equipos');
    } catch (err) {
      setError(err.message);
    }
  }

  if (cargando) return <p>Cargando…</p>;

  return (
    <section className="form-page">
      <div className="section-header">
        <div className="section-header-title">
          <span className="page-header-icon">
            <Icono path={ICONOS.equipos} />
          </span>
          <h1>{editando ? 'Editar equipo' : 'Crear equipo'}</h1>
        </div>
      </div>
      <form onSubmit={handleSubmit} className="form">
        <label>
          Nombre
          <input value={nombre} onChange={(e) => setNombre(e.target.value)} required />
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
