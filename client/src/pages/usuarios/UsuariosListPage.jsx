import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { usuariosApi } from '../../api/usuarios.js';
import { equiposApi } from '../../api/equipos.js';
import { Icono, ICONOS } from '../../components/icons.jsx';

// UC-38 Listar Usuarios
export default function UsuariosListPage() {
  const [usuarios, setUsuarios] = useState([]);
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
      const [{ usuarios }, { equipos }] = await Promise.all([
        usuariosApi.listar(),
        equiposApi.listar(),
      ]);
      setUsuarios(usuarios);
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
            <Icono path={ICONOS.usuarios} />
          </span>
          <h1>Usuarios</h1>
        </div>
        <Link to="/usuarios/nuevo">+ Crear usuario</Link>
      </div>

      {error && <p className="error">{error}</p>}
      {cargando ? (
        <p className="estado-vacio">Cargando…</p>
      ) : (
        <table className="table">
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Correo</th>
              <th>Rol</th>
              <th>Nivel</th>
              <th>Equipo</th>
            </tr>
          </thead>
          <tbody>
            {usuarios.map((u) => (
              <tr key={u.id}>
                <td>
                  <Link to={`/usuarios/${u.id}`}>{u.nombre}</Link>
                </td>
                <td>{u.correo}</td>
                <td>{u.rol}</td>
                <td>{u.nivel ?? '—'}</td>
                <td>{u.equipoId ? equiposPorId[u.equipoId] : '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </section>
  );
}
