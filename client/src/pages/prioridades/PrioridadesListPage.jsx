import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { prioridadesApi } from '../../api/prioridades.js';

export default function PrioridadesListPage() {
  const [prioridades, setPrioridades] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    cargar();
  }, []);

  async function cargar() {
    setCargando(true);
    setError(null);
    try {
      const { prioridades } = await prioridadesApi.listar();
      setPrioridades(prioridades);
    } catch (err) {
      setError(err.message);
    } finally {
      setCargando(false);
    }
  }

  return (
    <section>
      <div className="section-header">
        <h1>Prioridades</h1>
        <Link to="/prioridades/nueva">+ Crear prioridad</Link>
      </div>

      {error && <p className="error">{error}</p>}
      {cargando ? (
        <p>Cargando…</p>
      ) : (
        <table className="table">
          <thead>
            <tr>
              <th>Nombre</th>
              <th>1ª respuesta (min)</th>
              <th>Resolución (min)</th>
            </tr>
          </thead>
          <tbody>
            {prioridades.map((p) => (
              <tr key={p.id}>
                <td>
                  <Link to={`/prioridades/${p.id}`}>{p.nombre}</Link>
                </td>
                <td>{p.sla.tiempoPrimeraRespuesta}</td>
                <td>{p.sla.tiempoResolucion}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </section>
  );
}
