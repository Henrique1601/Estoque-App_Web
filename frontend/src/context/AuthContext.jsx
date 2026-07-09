import { createContext, useContext, useEffect, useState } from 'react';
import { api, setOnUnauthorized } from '../api.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(() => {
    const salvo = localStorage.getItem('usuario');
    return salvo ? JSON.parse(salvo) : null;
  });

  useEffect(() => {
    setOnUnauthorized(() => {
      localStorage.removeItem('token');
      localStorage.removeItem('usuario');
      setUsuario(null);
      window.location.href = '/login';
    });
    return () => setOnUnauthorized(null);
  }, []);

  async function login(email, senha) {
    const { token, usuario } = await api.login(email, senha);
    localStorage.setItem('token', token);
    localStorage.setItem('usuario', JSON.stringify(usuario));
    setUsuario(usuario);
  }

  function logout() {
    api.logout().catch(() => {});
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
    setUsuario(null);
  }

  function setAuth({ token, usuario }) {
    localStorage.setItem('token', token);
    localStorage.setItem('usuario', JSON.stringify(usuario));
    setUsuario(usuario);
  }

  return (
    <AuthContext.Provider value={{ usuario, login, logout, setAuth }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
