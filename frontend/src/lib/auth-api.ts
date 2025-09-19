import api, { tokenManager } from './api';
import type { LoginCredentials, RegisterCredentials, AuthResponse, User } from '@/types';

export const authApi = {
  // Login user
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    const response = await api.post<any>('/auth/login', credentials);
    const { token, user } = response.data.data;
    
    // Store token
    tokenManager.setToken(token);
    
    return { token, user };
  },

  // Register user
  register: async (credentials: RegisterCredentials): Promise<AuthResponse> => {
    const { confirmPassword, ...registerData } = credentials;
    const response = await api.post<any>('/auth/register', registerData);
    const { token, user } = response.data.data;
    
    // Store token
    tokenManager.setToken(token);
    
    return { token, user };
  },

  // Get current user
  getCurrentUser: async (): Promise<User> => {
    const response = await api.get<any>('/auth/me');
    return response.data.data;
  },

  // Logout user
  logout: async (): Promise<void> => {
    try {
      await api.post('/auth/logout');
    } finally {
      // Always remove token even if request fails
      tokenManager.removeToken();
    }
  },

  // Change password
  changePassword: async (currentPassword: string, newPassword: string): Promise<void> => {
    await api.post('/auth/change-password', {
      currentPassword,
      newPassword,
    });
  },
};