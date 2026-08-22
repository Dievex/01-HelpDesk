import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { categoriasApi } from '../../api/categorias.js';
import { equiposApi } from '../../api/equipos.js';
import { Icono, ICONOS } from '../../components/icons.jsx';

const FORM_VACIO = { nombre: '', equipoId: '' };

export default function CategoriaFormPage() {
  const { id } = useParams();
  const editando = Boolean(id);
  const navigate = useNavigate();

  const [form, setForm] = useState(FORM_VACIO);
  const [equipos, setEquipos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  const [enviando, setEnviando] = useState(false);

  useEffect(() => {
    const cargas = [equiposApi.listar()];
    if (editando) cargas.push(categoriasApi.obtener(id));

    Promise.all(cargas)
      .then(([{ equipos }, categoriaRes]) => {
        setEquipos(equipos);
        if (categoriaRes) {
          setForm({ ...categoriaRes.categoria, equipoId: categoriaRes.categoria.equipoId ?? '' });
        }
      })
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
      const datos = { nombre: form.nombre, equipoId: form.equipoId || null };
      if (editando) {
        await categoriasApi.editar(id, datos);
      } else {
        await categoriasApi.crear(datos);
      }
      navigate('/categorias');
    } catch (err) {
      setError(err.message);
    } finally {
      setEnviando(false);
    }
  }

  async function handleEliminar() {
    if (!window.confirm(`¿Eliminar la categoría "${form.nombre}"?`)) return;
    setError(null);
    try {
      await categoriasApi.eliminar(id);
      navigate('/categorias');
    } catch (err) {
      // FA-1 de UC-25: categoría en uso -- bloqueada, se queda aquí.
      setError(err.message);
    }
  }

  if (cargando) return <p>Cargando…</p>;

  return (
    <section className="form-page">
      <div className="section-header">
        <div className="section-header-title">
          <span className="page-header-icon">
            <Icono path={ICONOS.etiqueta} />
          </span>
          <h1>{editando ? 'Editar categoría' : 'Crear categoría'}</h1>
        </div>
      </div>
      <form onSubmit={handleSubmit} className="form">
        <label>
          Nombre
          <input
            value={form.nombre}
            onChange={(e) => actualizarCampo('nombre', e.target.value)}
            required
          />
        </label>
        <label>
          Equipo que la atiende
          <select value={form.equipoId} onChange={(e) => actualizarCampo('equipoId', e.target.value)}>
            <option value="">Sin equipo</option>
            {equipos.map((eq) => (
              <option key={eq.id} value={eq.id}>
                {eq.nombre}
              </option>
            ))}
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
