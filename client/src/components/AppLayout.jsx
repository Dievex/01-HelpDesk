import { NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import ThemeToggle from './ThemeToggle.jsx';
import { Icono, ICONOS } from './icons.jsx';

const ROLES_AGENTE = ['AGENTE', 'SUPERVISOR'];

function inicialesDe(nombre) {
  if (!nombre) return '?';
  return nombre
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((parte) => parte[0]?.toUpperCase())
    .join('');
}

const NAV_PRINCIPAL = [
  { to: '/', fin: true, icono: ICONOS.tickets, label: 'Mis Tickets' },
  { to: '/cola', icono: ICONOS.cola, label: 'Mi Cola', roles: ROLES_AGENTE },
  { to: '/dashboard', icono: ICONOS.dashboard, label: 'Dashboard', roles: ['SUPERVISOR'] },
  { to: '/base-conocimiento', icono: ICONOS.libro, label: 'Base de Conocimiento' },
];

const NAV_ADMIN = [
  { to: '/usuarios', icono: ICONOS.usuarios, label: 'Usuarios' },
  { to: '/categorias', icono: ICONOS.etiqueta, label: 'Categorías' },
  { to: '/equipos', icono: ICONOS.equipos, label: 'Equipos' },
  { to: '/prioridades', icono: ICONOS.bandera, label: 'Prioridades' },
];

function ItemNav({ item }) {
  return (
    <NavLink to={item.to} end={item.fin}>
      <Icono path={item.icono} />
      {item.label}
    </NavLink>
  );
}

export default function AppLayout() {
  const { usuario, logout } = useAuth();

  return (
    <div className="app-shell">
      <aside className="app-sidebar">
        <div className="app-sidebar-brand">
          <span className="app-brand-mark">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 12.5L9 17.5L20 6" />
            </svg>
          </span>
          <strong>HelpDesk</strong>
        </div>

        <nav className="app-sidebar-nav">
          <span className="app-nav-label">General</span>
          {NAV_PRINCIPAL.filter((item) => !item.roles || item.roles.includes(usuario?.rol)).map((item) => (
            <ItemNav key={item.to} item={item} />
          ))}

          {usuario?.rol === 'ADMINISTRADOR' && (
            <>
              <span className="app-nav-label">Administración</span>
              {NAV_ADMIN.map((item) => (
                <ItemNav key={item.to} item={item} />
              ))}
            </>
          )}
        </nav>

        <div className="app-sidebar-footer">
          <div className="app-user-chip">
            <span className="app-user-avatar">{inicialesDe(usuario?.nombre)}</span>
            <span className="app-user-meta">
              <span className="app-user-name">{usuario?.nombre}</span>
              <span className="app-user-role">{usuario?.rol}</span>
            </span>
          </div>
          <div className="app-sidebar-footer-actions">
            <ThemeToggle />
            <button type="button" onClick={logout}>
              Cerrar sesión
            </button>
          </div>
        </div>
      </aside>

      <div className="app-content">
        <main className="app-main">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
