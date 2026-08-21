import { NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export default function AppLayout() {
  const { usuario, logout } = useAuth();

  return (
    <div>
      <header className="app-header">
        <nav className="app-nav">
          <strong>HelpDesk</strong>
          {usuario?.rol === 'ADMINISTRADOR' && <NavLink to="/usuarios">Usuarios</NavLink>}
        </nav>
        <div className="app-user">
          <span>
            {usuario?.nombre} ({usuario?.rol})
          </span>
          <button type="button" onClick={logout}>
            Cerrar sesión
          </button>
        </div>
      </header>
      <main className="app-main">
        <Outlet />
      </main>
    </div>
  );
}
