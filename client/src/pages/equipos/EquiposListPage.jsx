import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { equiposApi } from '../../api/equipos.js';

export default function EquiposListPage() {
  const [equipos, setEquipos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    cargar();
  }, []);

  async function cargar() {
    setCargando(true);
    setError(null);
    try {
      const { equipos } = await equiposApi.listar();
      setEquipos(equipos);
    } catch (err) {
      setError(err.message);
    } finally {
      setCargando(false);
    }
  }

  return (
    <section>
      <div className="section-header">
        <h1>Equipos</h1>
        <Link to="/equipos/nuevo">+ Crear equipo</Link>
      </div>

      {error && <p className="error">{error}</p>}
      {cargando ? (
        <p>Cargando…</p>
      ) : (
        <table className="table">
          <thead>
            <tr>
              <th>Nombre</th>
            </tr>
          </thead>
          <tbody>
            {equipos.map((e) => (
              <tr key={e.id}>
                <td>
                  <Link to={`/equipos/${e.id}`}>{e.nombre}</Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </section>
  );
}
