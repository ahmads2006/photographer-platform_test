'use client';

import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import api, { setAuthToken } from '@/src/lib/api';
import { connectSocket, disconnectSocket } from '@/src/lib/socket';

const AuthContext = createContext(null);

const writeTokenCookie = (token) => {
  if (!token) {
    document.cookie = 'token=; Max-Age=0; path=/';
    return;
  }

  const maxAge = 60 * 60 * 24 * 7;
  document.cookie = `token=${token}; Max-Age=${maxAge}; path=/; SameSite=Lax`;
};

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    if (!storedToken) {
      setLoading(false);
      return;
    }

    setToken(storedToken);
    setAuthToken(storedToken);

    api
      .get('/auth/me')
      .then((res) => {
        setUser(res.data.user);
        connectSocket(storedToken);
      })
      .catch(() => {
        localStorage.removeItem('token');
        writeTokenCookie(null);
      })
      .finally(() => setLoading(false));
  }, []);

  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    const nextToken = res.data.token;

    setToken(nextToken);
    setUser(res.data.user);
    setAuthToken(nextToken);
    localStorage.setItem('token', nextToken);
    writeTokenCookie(nextToken);
    connectSocket(nextToken);
  };

  const register = async (payload) => {
    const res = await api.post('/auth/register', payload);
    const nextToken = res.data.token;

    setToken(nextToken);
    setUser(res.data.user);
    setAuthToken(nextToken);
    localStorage.setItem('token', nextToken);
    writeTokenCookie(nextToken);
    connectSocket(nextToken);
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('token');
    writeTokenCookie(null);
    setAuthToken(null);
    disconnectSocket();
  };

  const value = useMemo(
    () => ({
      token,
      user,
      loading,
      login,
      register,
      logout,
      setUser,
    }),
    [token, user, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return ctx;
};
