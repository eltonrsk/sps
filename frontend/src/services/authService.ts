import api from './api';
import axios from 'axios';
import { authStorage } from './authStorage';

export type UserRole = 'admin' | 'parent' | 'teacher' | 'security';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  full_name: string;
  role: UserRole;
  phone_number?: string;
  password: string;
}

export interface AuthResponse {
  message: string;
  user: {
    id: string;
    email: string;
    full_name: string;
    role: UserRole;
    phone_number?: string;
    is_active: boolean;
  };
  token: string;
}

const getApiErrorMessage = (error: unknown, fallback: string) => {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as { error?: string; message?: string } | undefined;
    return data?.error || data?.message || fallback;
  }
  if (error instanceof Error) {
    return error.message;
  }
  return fallback;
};

export const authService = {
  // Login user
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      const response = await api.post('/auth/login', credentials);
      const { user, token } = response.data;

      // Store auth data in session storage (not local storage)
      authStorage.setAuth(token, user);

      return response.data;
    } catch (error) {
      throw new Error(getApiErrorMessage(error, 'Login failed'));
    }
  },

  // Register new user
  async register(userData: RegisterData): Promise<{ message: string; userId: string }> {
    try {
      const response = await api.post('/auth/register', userData);
      return response.data;
    } catch (error) {
      throw new Error(getApiErrorMessage(error, 'Registration failed'));
    }
  },

  // Logout user
  logout() {
    authStorage.clearAuth();
  },

  // Get current user from auth storage
  getCurrentUser() {
    return authStorage.getUser();
  },

  // Get auth token
  getToken() {
    return authStorage.getToken();
  },

  // Check if user is authenticated
  isAuthenticated() {
    return authStorage.isAuthenticated();
  },

  // Change password
  async changePassword(userId: string, oldPassword: string, newPassword: string) {
    try {
      const response = await api.post('/auth/change-password', {
        userId,
        oldPassword,
        newPassword
      });
      return response.data;
    } catch (error) {
      throw new Error(getApiErrorMessage(error, 'Password change failed'));
    }
  },

  // Verify token
  async verifyToken() {
    try {
      const response = await api.get('/auth/verify');
      return response.data;
    } catch (error) {
      return { valid: false };
    }
  },

  async getMyProfile() {
    const response = await api.get('/auth/me');
    return response.data as { user: AuthResponse['user'] };
  }
};
