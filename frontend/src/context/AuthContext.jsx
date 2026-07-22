import { createContext, useContext, useState, useCallback } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem('sc_user');
    return stored ? JSON.parse(stored) : null;
  });

  const loginStart = useCallback(async (email, password) => {
    const { data } = await api.post('/auth/login', { email, password });
    return data.userId;
  }, []);

  const loginVerify = useCallback(async (userId, code) => {
    const { data } = await api.post('/auth/login/verify', { userId, code });
    localStorage.setItem('sc_token', data.token);
    localStorage.setItem('sc_user', JSON.stringify(data.user));
    setUser(data.user);
    return data.user;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('sc_token');
    localStorage.removeItem('sc_user');
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, loginStart, loginVerify, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
