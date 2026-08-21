import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

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
    <main className="login-page">
      <h1>HelpDesk</h1>
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
    </main>
  );
}
