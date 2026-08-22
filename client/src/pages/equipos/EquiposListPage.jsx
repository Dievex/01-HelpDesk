import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { equiposApi } from '../../api/equipos.js';
import { Icono, ICONOS } from '../../components/icons.jsx';

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
        <div className="section-header-title">
          <span className="page-header-icon">
            <Icono path={ICONOS.equipos} />
          </span>
          <h1>Equipos</h1>
        </div>
        <Link to="/equipos/nuevo">+ Crear equipo</Link>
      </div>

      {error && <p className="error">{error}</p>}
      {cargando ? (
        <p className="estado-vacio">Cargando…</p>
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
