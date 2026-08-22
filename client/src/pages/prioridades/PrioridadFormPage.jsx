import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { prioridadesApi } from '../../api/prioridades.js';
import { Icono, ICONOS } from '../../components/icons.jsx';

const FORM_VACIO = { nombre: '', tiempoPrimeraRespuesta: '', tiempoResolucion: '' };

// SLA no tiene CRUD propio: sus dos campos viven en este mismo formulario.
export default function PrioridadFormPage() {
  const { id } = useParams();
  const editando = Boolean(id);
  const navigate = useNavigate();

  const [form, setForm] = useState(FORM_VACIO);
  const [cargando, setCargando] = useState(editando);
  const [error, setError] = useState(null);
  const [enviando, setEnviando] = useState(false);

  useEffect(() => {
    if (!editando) return;
    prioridadesApi
      .obtener(id)
      .then(({ prioridad }) =>
        setForm({
          nombre: prioridad.nombre,
          tiempoPrimeraRespuesta: prioridad.sla.tiempoPrimeraRespuesta,
          tiempoResolucion: prioridad.sla.tiempoResolucion,
        }),
      )
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
      const datos = {
        nombre: form.nombre,
        tiempoPrimeraRespuesta: Number(form.tiempoPrimeraRespuesta),
        tiempoResolucion: Number(form.tiempoResolucion),
      };
      if (editando) {
        await prioridadesApi.editar(id, datos);
      } else {
        await prioridadesApi.crear(datos);
      }
      navigate('/prioridades');
    } catch (err) {
      setError(err.message);
    } finally {
      setEnviando(false);
    }
  }

  async function handleEliminar() {
    if (!window.confirm(`¿Eliminar la prioridad "${form.nombre}"?`)) return;
    setError(null);
    try {
      await prioridadesApi.eliminar(id);
      navigate('/prioridades');
    } catch (err) {
      // FA-1 de UC-35: prioridad en uso -- bloqueada, se queda aquí.
      setError(err.message);
    }
  }

  if (cargando) return <p>Cargando…</p>;

  return (
    <section className="form-page">
      <div className="section-header">
        <div className="section-header-title">
          <span className="page-header-icon">
            <Icono path={ICONOS.bandera} />
          </span>
          <h1>{editando ? 'Editar prioridad' : 'Crear prioridad'}</h1>
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
          Tiempo de primera respuesta (minutos)
          <input
            type="number"
            min="1"
            value={form.tiempoPrimeraRespuesta}
            onChange={(e) => actualizarCampo('tiempoPrimeraRespuesta', e.target.value)}
            required
          />
        </label>
        <label>
          Tiempo de resolución (minutos)
          <input
            type="number"
            min="1"
            value={form.tiempoResolucion}
            onChange={(e) => actualizarCampo('tiempoResolucion', e.target.value)}
            required
          />
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
