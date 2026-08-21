import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext.jsx';
import { ProtectedRoute } from './routes/ProtectedRoute.jsx';
import AppLayout from './components/AppLayout.jsx';
import LoginPage from './pages/LoginPage.jsx';
import HomePage from './pages/HomePage.jsx';
import UsuariosListPage from './pages/usuarios/UsuariosListPage.jsx';
import UsuarioFormPage from './pages/usuarios/UsuarioFormPage.jsx';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<LoginPage />} />

          <Route element={<ProtectedRoute />}>
            <Route element={<AppLayout />}>
              <Route index element={<HomePage />} />

              <Route path="usuarios" element={<ProtectedRoute roles={['ADMINISTRADOR']} />}>
                <Route index element={<UsuariosListPage />} />
                <Route path="nuevo" element={<UsuarioFormPage />} />
                <Route path=":id" element={<UsuarioFormPage />} />
              </Route>
            </Route>
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
