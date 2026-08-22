import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { articulosApi } from '../../api/articulos.js';
import { useAuth } from '../../context/AuthContext.jsx';
import { Icono, ICONOS } from '../../components/icons.jsx';

const ROLES_ESCRITURA = ['AGENTE', 'SUPERVISOR'];

// UC-10 Listar Artículos de Conocimiento
export default function ArticulosListPage() {
  const { usuario } = useAuth();
  const [articulos, setArticulos] = useState([]);
  const [busqueda, setBusqueda] = useState('');
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    cargar(busqueda);
  }, [busqueda]);

  async function cargar(texto) {
    setCargando(true);
    setError(null);
    try {
      const { articulos } = await articulosApi.listar(texto);
      setArticulos(articulos);
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
            <Icono path={ICONOS.libro} />
          </span>
          <h1>Base de Conocimiento</h1>
        </div>
        {ROLES_ESCRITURA.includes(usuario.rol) && <Link to="/base-conocimiento/nuevo">+ Crear artículo</Link>}
      </div>

      <input
        type="search"
        placeholder="Buscar por título o contenido…"
        value={busqueda}
        onChange={(e) => setBusqueda(e.target.value)}
        className="search-input"
      />

      {error && <p className="error">{error}</p>}
      {cargando ? (
        <p className="estado-vacio">Cargando…</p>
      ) : articulos.length === 0 ? (
        <p className="estado-vacio">No se encontraron artículos.</p>
      ) : (
        <table className="table">
          <thead>
            <tr>
              <th>Título</th>
              <th>Visibilidad</th>
            </tr>
          </thead>
          <tbody>
            {articulos.map((a) => (
              <tr key={a.id}>
                <td>
                  <Link to={`/base-conocimiento/${a.id}`}>{a.titulo}</Link>
                </td>
                <td>{a.visibilidad === 'PUBLICO' ? 'Público' : 'Interno'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </section>
  );
}
