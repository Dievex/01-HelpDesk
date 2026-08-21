import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { usuariosApi } from '../../api/usuarios.js';

// UC-38 Listar Usuarios
export default function UsuariosListPage() {
  const [usuarios, setUsuarios] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    cargar();
  }, []);

  async function cargar() {
    setCargando(true);
    setError(null);
    try {
      const { usuarios } = await usuariosApi.listar();
      setUsuarios(usuarios);
    } catch (err) {
      setError(err.message);
    } finally {
      setCargando(false);
    }
  }

  return (
    <section>
      <div className="section-header">
        <h1>Usuarios</h1>
        <Link to="/usuarios/nuevo">+ Crear usuario</Link>
      </div>

      {error && <p className="error">{error}</p>}
      {cargando ? (
        <p>Cargando…</p>
      ) : (
        <table className="table">
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Correo</th>
              <th>Rol</th>
              <th>Nivel</th>
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
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </section>
  );
}
