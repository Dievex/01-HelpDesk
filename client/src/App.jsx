import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext.jsx';
import { ProtectedRoute } from './routes/ProtectedRoute.jsx';
import AppLayout from './components/AppLayout.jsx';
import LoginPage from './pages/LoginPage.jsx';
import TicketsPropiosPage from './pages/tickets/TicketsPropiosPage.jsx';
import TicketNuevoPage from './pages/tickets/TicketNuevoPage.jsx';
import TicketDetailPage from './pages/tickets/TicketDetailPage.jsx';
import ColaPage from './pages/tickets/ColaPage.jsx';
import UsuariosListPage from './pages/usuarios/UsuariosListPage.jsx';
import UsuarioFormPage from './pages/usuarios/UsuarioFormPage.jsx';
import CategoriasListPage from './pages/categorias/CategoriasListPage.jsx';
import CategoriaFormPage from './pages/categorias/CategoriaFormPage.jsx';
import EquiposListPage from './pages/equipos/EquiposListPage.jsx';
import EquipoFormPage from './pages/equipos/EquipoFormPage.jsx';
import PrioridadesListPage from './pages/prioridades/PrioridadesListPage.jsx';
import PrioridadFormPage from './pages/prioridades/PrioridadFormPage.jsx';
import ArticulosListPage from './pages/articulos/ArticulosListPage.jsx';
import ArticuloFormPage from './pages/articulos/ArticuloFormPage.jsx';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<LoginPage />} />

          <Route element={<ProtectedRoute />}>
            <Route element={<AppLayout />}>
              <Route index element={<TicketsPropiosPage />} />
              <Route path="tickets/nuevo" element={<TicketNuevoPage />} />
              <Route path="tickets/:id" element={<TicketDetailPage />} />

              <Route element={<ProtectedRoute roles={['AGENTE', 'SUPERVISOR']} />}>
                <Route path="cola" element={<ColaPage />} />
              </Route>

              {/* UC-09/UC-10: lectura abierta a cualquier autenticado. */}
              <Route path="base-conocimiento">
                <Route index element={<ArticulosListPage />} />
                <Route path=":id" element={<ArticuloFormPage />} />
              </Route>
              {/* UC-15 Crear Artículo: exclusivo de Agente de Soporte / Supervisor. */}
              <Route element={<ProtectedRoute roles={['AGENTE', 'SUPERVISOR']} />}>
                <Route path="base-conocimiento/nuevo" element={<ArticuloFormPage />} />
              </Route>

              <Route element={<ProtectedRoute roles={['ADMINISTRADOR']} />}>
                <Route path="usuarios">
                  <Route index element={<UsuariosListPage />} />
                  <Route path="nuevo" element={<UsuarioFormPage />} />
                  <Route path=":id" element={<UsuarioFormPage />} />
                </Route>
                <Route path="categorias">
                  <Route index element={<CategoriasListPage />} />
                  <Route path="nueva" element={<CategoriaFormPage />} />
                  <Route path=":id" element={<CategoriaFormPage />} />
                </Route>
                <Route path="equipos">
                  <Route index element={<EquiposListPage />} />
                  <Route path="nuevo" element={<EquipoFormPage />} />
                  <Route path=":id" element={<EquipoFormPage />} />
                </Route>
                <Route path="prioridades">
                  <Route index element={<PrioridadesListPage />} />
                  <Route path="nueva" element={<PrioridadFormPage />} />
                  <Route path=":id" element={<PrioridadFormPage />} />
                </Route>
              </Route>
            </Route>
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
