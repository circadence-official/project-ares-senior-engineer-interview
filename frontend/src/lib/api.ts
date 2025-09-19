import axios, { AxiosError, type AxiosResponse } from 'axios';
import type { ApiError } from '@/types';

// Create axios instance
const api = axios.create({
  baseURL: '/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Token management
export const tokenManager = {
  getToken: (): string | null => {
    return localStorage.getItem('authToken');
  },
  
  setToken: (token: string): void => {
    localStorage.setItem('authToken', token);
  },
  
  removeToken: (): void => {
    localStorage.removeItem('authToken');
  },
  
  hasToken: (): boolean => {
    return !!localStorage.getItem('authToken');
  },
};

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = tokenManager.getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for handling errors
api.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  (error: AxiosError) => {
    const apiError: ApiError = {
      message: 'An error occurred',
      status: error.response?.status || 500,
    };

    if (error.response?.data) {
      const data = error.response.data as any;
      apiError.message = data.message || data.error || 'An error occurred';
      apiError.errors = data.errors;
    }

    // Handle 401 errors by clearing token and redirecting to login
    if (error.response?.status === 401) {
      tokenManager.removeToken();
      // Redirect to login page
      window.location.href = '/login';
    }

    return Promise.reject(apiError);
  }
);

export default api;