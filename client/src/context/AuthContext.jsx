import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { authApi } from '../api/auth.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(null);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    authApi
      .me()
      .then(({ usuario }) => setUsuario(usuario))
      .catch(() => setUsuario(null))
      .finally(() => setCargando(false));
  }, []);

  const login = useCallback(async (correo, contrasena) => {
    const { usuario } = await authApi.login(correo, contrasena);
    setUsuario(usuario);
    return usuario;
  }, []);

  const logout = useCallback(async () => {
    await authApi.logout();
    setUsuario(null);
  }, []);

  return (
    <AuthContext.Provider value={{ usuario, cargando, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth debe usarse dentro de <AuthProvider>');
  }
  return ctx;
}
