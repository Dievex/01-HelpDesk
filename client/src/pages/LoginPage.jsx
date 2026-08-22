import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import ThemeToggle from '../components/ThemeToggle.jsx';

// UC-01 Iniciar Sesión
export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [correo, setCorreo] = useState('');
  const [contrasena, setContrasena] = useState('');
  const [error, setError] = useState(null);
  const [enviando, setEnviando] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setEnviando(true);
    try {
      await login(correo, contrasena);
      const destino = location.state?.from?.pathname ?? '/';
      navigate(destino, { replace: true });
    } catch (err) {
      // FA-1 de UC-01: credenciales inválidas -- se queda en esta misma pantalla.
      setError(err.message);
    } finally {
      setEnviando(false);
    }
  }

  return (
    <div className="login-shell">
      <aside className="login-brand">
        <div className="login-brand-mark">
          <span>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 12.5L9 17.5L20 6" />
            </svg>
          </span>
          HelpDesk
        </div>
        <div className="login-brand-copy">
          <h2>La gestión de soporte, sin fricción.</h2>
          <p>
            Centraliza tickets, base de conocimiento y métricas de tu equipo en un único
            lugar, con trazabilidad completa de cada caso.
          </p>
        </div>
        <p className="login-brand-foot">Mesa de Ayuda interna</p>
      </aside>

      <main className="login-form-side">
        <ThemeToggle />
        <section className="login-page">
          <h1>Bienvenido</h1>
          <p className="login-subtitle">Inicia sesión para continuar</p>
          <form onSubmit={handleSubmit} className="form">
            <label>
              Correo
              <input
                type="email"
                value={correo}
                onChange={(e) => setCorreo(e.target.value)}
                autoFocus
                required
              />
            </label>
            <label>
              Contraseña
              <input
                type="password"
                value={contrasena}
                onChange={(e) => setContrasena(e.target.value)}
                required
              />
            </label>
            {error && <p className="error">{error}</p>}
            <button type="submit" disabled={enviando}>
              {enviando ? 'Entrando…' : 'Iniciar sesión'}
            </button>
          </form>
        </section>
      </main>
    </div>
  );
}
