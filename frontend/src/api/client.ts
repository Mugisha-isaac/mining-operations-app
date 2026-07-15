import axios from 'axios';
import { useAuthStore } from '@/store/auth.store';

/**
 * The single axios client required by the brief. Every write/read to the
 * backend flows through this instance; the interceptor attaches the JWT
 * so no feature module has to think about auth headers.
 */
export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:3000',
});

apiClient.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      useAuthStore.getState().logout();
    }
    return Promise.reject(error);
  },
);
