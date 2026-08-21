import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

// Sin `roles`: solo exige sesión iniciada. Con `roles`: además exige que el rol
// del actor esté en la lista (p.ej. UC-36 a UC-40, exclusivos de Administrador).
export function ProtectedRoute({ roles }) {
  const { usuario, cargando } = useAuth();
  const location = useLocation();

  if (cargando) {
    return <p>Cargando…</p>;
  }

  if (!usuario) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (roles && !roles.includes(usuario.rol)) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}
