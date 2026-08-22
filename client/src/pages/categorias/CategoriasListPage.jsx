import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { categoriasApi } from '../../api/categorias.js';
import { equiposApi } from '../../api/equipos.js';
import { Icono, ICONOS } from '../../components/icons.jsx';

export default function CategoriasListPage() {
  const [categorias, setCategorias] = useState([]);
  const [equiposPorId, setEquiposPorId] = useState({});
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    cargar();
  }, []);

  async function cargar() {
    setCargando(true);
    setError(null);
    try {
      const [{ categorias }, { equipos }] = await Promise.all([
        categoriasApi.listar(),
        equiposApi.listar(),
      ]);
      setCategorias(categorias);
      setEquiposPorId(Object.fromEntries(equipos.map((e) => [e.id, e.nombre])));
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
            <Icono path={ICONOS.etiqueta} />
          </span>
          <h1>Categorías</h1>
        </div>
        <Link to="/categorias/nueva">+ Crear categoría</Link>
      </div>

      {error && <p className="error">{error}</p>}
      {cargando ? (
        <p className="estado-vacio">Cargando…</p>
      ) : (
        <table className="table">
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Equipo</th>
            </tr>
          </thead>
          <tbody>
            {categorias.map((c) => (
              <tr key={c.id}>
                <td>
                  <Link to={`/categorias/${c.id}`}>{c.nombre}</Link>
                </td>
                <td>{c.equipoId ? equiposPorId[c.equipoId] : '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </section>
  );
}
