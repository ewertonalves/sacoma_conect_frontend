import axios, { AxiosError } from 'axios';
import type { AxiosInstance, InternalAxiosRequestConfig } from 'axios';
import type { ApiError } from '../types';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';

export const apiClient: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Não adiciona token para endpoints de autenticação
    const isAuthEndpoint = config.url?.includes('/auth/login') || config.url?.includes('/auth/cadastro') || config.url?.endsWith('/auth/login') || config.url?.endsWith('/auth/cadastro');
    
    if (!isAuthEndpoint) {
      const token = localStorage.getItem('auth_token');
      
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error: AxiosError) => {
    // Ignora erros de requisições canceladas
    if (error.name === 'AbortError' || error.name === 'CanceledError' || error.code === 'ERR_CANCELED') {
      return Promise.reject(error);
    }

    const apiError: ApiError = {
      message: 'Erro ao processar requisição',
      status: error.response?.status || 500,
      errors: error.response?.data as Record<string, string[]>,
    };

    if (error.response?.data && typeof error.response.data === 'object') {
      const data = error.response.data as any;
      if (data.message) {
        apiError.message = data.message;
      }
    }

    if (error.response?.status === 401) {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }

    if (error.response?.status === 403) {
      const errorData = error.response.data as any;
      apiError.message = errorData?.message || 'Você não tem permissão para realizar esta ação';
    }

    if (error.response?.status === 500) {
      apiError.message = 'Erro interno do servidor. Tente novamente mais tarde.';
    }

    if (!error.response) {
      apiError.message = 'Erro de conexão. Verifique sua internet.';
    }

    return Promise.reject(apiError);
  }
);

export default apiClient;

