import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { categoriasApi } from '../../api/categorias.js';
import { equiposApi } from '../../api/equipos.js';

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
        <h1>Categorías</h1>
        <Link to="/categorias/nueva">+ Crear categoría</Link>
      </div>

      {error && <p className="error">{error}</p>}
      {cargando ? (
        <p>Cargando…</p>
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
