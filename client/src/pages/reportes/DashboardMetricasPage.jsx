import { useEffect, useState } from 'react';
import { reportsApi } from '../../api/reports.js';
import { ESTADO_LABEL } from '../tickets/estados.js';
import { Icono, ICONOS } from '../../components/icons.jsx';

// UC-20: mes actual (día 1 hasta hoy) como rango por defecto.
function rangoMesActual() {
  const hoy = new Date();
  const primerDia = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
  return { desde: aFecha(primerDia), hasta: aFecha(hoy) };
}

function aFecha(date) {
  return date.toISOString().slice(0, 10);
}

function formatoMinutos(minutos) {
  if (minutos === null) return '—';
  if (minutos < 60) return `${Math.round(minutos)} min`;
  return `${(minutos / 60).toFixed(1)} h`;
}

function formatoPorcentaje(valor) {
  return valor === null ? '—' : `${Math.round(valor)}%`;
}

export default function DashboardMetricasPage() {
  const [rango, setRango] = useState(rangoMesActual());
  const [metricas, setMetricas] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    cargar(rango.desde, rango.hasta);
  }, []);

  async function cargar(desde, hasta) {
    setCargando(true);
    setError(null);
    try {
      const { metricas } = await reportsApi.obtenerMetricas(desde, hasta);
      setMetricas(metricas);
    } catch (err) {
      setError(err.message);
      setMetricas(null);
    } finally {
      setCargando(false);
    }
  }

  function onSubmit(e) {
    e.preventDefault();
    cargar(rango.desde, rango.hasta);
  }

  return (
    <section>
      <div className="section-header">
        <div className="section-header-title">
          <span className="page-header-icon">
            <Icono path={ICONOS.dashboard} />
          </span>
          <h1>Dashboard de Métricas</h1>
        </div>
      </div>

      <form className="form" onSubmit={onSubmit} style={{ flexDirection: 'row', alignItems: 'flex-end', gap: '1rem' }}>
        <label>
          Desde
          <input
            type="date"
            value={rango.desde}
            max={rango.hasta}
            onChange={(e) => setRango({ ...rango, desde: e.target.value })}
            required
          />
        </label>
        <label>
          Hasta
          <input
            type="date"
            value={rango.hasta}
            min={rango.desde}
            onChange={(e) => setRango({ ...rango, hasta: e.target.value })}
            required
          />
        </label>
        <button type="submit">Aplicar</button>
      </form>

      {error && <p className="error">{error}</p>}
      {cargando && <p className="estado-vacio">Cargando…</p>}

      {!cargando && metricas && metricas.volumen.total === 0 && (
        <p className="estado-vacio">No hay tickets creados en el rango seleccionado.</p>
      )}

      {!cargando && metricas && metricas.volumen.total > 0 && (
        <>
          <div className="stat-grid">
            <div className="stat-card">
              <div className="stat-card-label">Tickets en el rango</div>
              <div className="stat-card-value">{metricas.volumen.total}</div>
            </div>
            <div className="stat-card">
              <div className="stat-card-label">1ª respuesta promedio</div>
              <div className="stat-card-value">{formatoMinutos(metricas.tiempos.primeraRespuestaMinutos)}</div>
            </div>
            <div className="stat-card">
              <div className="stat-card-label">Resolución promedio</div>
              <div className="stat-card-value">{formatoMinutos(metricas.tiempos.resolucionMinutos)}</div>
            </div>
            <div className="stat-card">
              <div className="stat-card-label">SLA de resolución</div>
              <div className="stat-card-value">{formatoPorcentaje(metricas.cumplimientoSla.resolucionPorcentaje)}</div>
              <div className="stat-card-hint">
                1ª respuesta: {formatoPorcentaje(metricas.cumplimientoSla.primeraRespuestaPorcentaje)}
              </div>
            </div>
          </div>

          <h2>Volumen</h2>
          <table className="table">
            <thead>
              <tr>
                <th>Total</th>
                {Object.keys(metricas.volumen.porEstado).map((estado) => (
                  <th key={estado}>{ESTADO_LABEL[estado] ?? estado}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>{metricas.volumen.total}</td>
                {Object.values(metricas.volumen.porEstado).map((cantidad, i) => (
                  <td key={i}>{cantidad}</td>
                ))}
              </tr>
            </tbody>
          </table>

          <h2>Tiempos promedio</h2>
          <table className="table">
            <thead>
              <tr>
                <th>1ª respuesta</th>
                <th>Resolución</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>{formatoMinutos(metricas.tiempos.primeraRespuestaMinutos)}</td>
                <td>{formatoMinutos(metricas.tiempos.resolucionMinutos)}</td>
              </tr>
            </tbody>
          </table>

          <h2>Cumplimiento de SLA</h2>
          <table className="table">
            <thead>
              <tr>
                <th>1ª respuesta</th>
                <th>Resolución</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>{formatoPorcentaje(metricas.cumplimientoSla.primeraRespuestaPorcentaje)}</td>
                <td>{formatoPorcentaje(metricas.cumplimientoSla.resolucionPorcentaje)}</td>
              </tr>
            </tbody>
          </table>
        </>
      )}
    </section>
  );
}
