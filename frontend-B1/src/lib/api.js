'use client';

import axios from 'axios';

const normalizeApiUrl = (rawUrl) => {
  const fallback = 'http://localhost:5000/api';
  if (!rawUrl) return fallback;

  const value = String(rawUrl).trim();
  if (!value) return fallback;

  if (value.startsWith(':')) {
    return `http://localhost${value}`;
  }

  if (value.startsWith('http://') || value.startsWith('https://')) {
    return value;
  }

  if (value.startsWith('//')) {
    return `http:${value}`;
  }

  return `http://${value}`;
};

const api = axios.create({
  baseURL: normalizeApiUrl(process.env.NEXT_PUBLIC_API_URL),
  withCredentials: false,
});

export const setAuthToken = (token) => {
  if (token) {
    api.defaults.headers.common.Authorization = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common.Authorization;
  }
};

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (typeof window !== 'undefined' && error?.response?.status === 401) {
      localStorage.removeItem('token');
      document.cookie = 'token=; Max-Age=0; path=/';
      if (!window.location.pathname.startsWith('/login')) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
