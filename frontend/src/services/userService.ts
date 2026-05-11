import api from './api';

export interface User {
  id: string;
  email: string;
  full_name: string;
  role: 'admin' | 'parent' | 'teacher' | 'security';
  phone_number?: string;
  is_active: boolean;
  created_at: string;
}

export interface CreateUserData {
  email: string;
  full_name: string;
  role: 'admin' | 'parent' | 'teacher' | 'security';
  phone_number?: string;
  password: string;
}

export const userService = {
  // Get all users (admin only)
  async getAllUsers(role?: string): Promise<User[]> {
    const params = role ? { role } : {};
    const response = await api.get('/users', { params });
    return response.data;
  },

  // Get current user profile
  async getProfile(): Promise<User> {
    const response = await api.get('/users/profile');
    return response.data;
  },

  // Get security staff count (accessible by security and admin roles)
  async getSecurityStaffCount(): Promise<number> {
    const response = await api.get('/users/security/count');
    return response.data.count;
  },

  // Get user by ID (admin only)
  async getUserById(id: string): Promise<User> {
    const response = await api.get(`/users/${id}`);
    return response.data;
  },

  // Create new user (admin only)
  async createUser(userData: CreateUserData): Promise<{ message: string; userId: string }> {
    const response = await api.post('/users', userData);
    return response.data;
  },

  // Update user
  async updateUser(id: string, userData: Partial<User>): Promise<{ message: string }> {
    const response = await api.put(`/users/${id}`, userData);
    return response.data;
  },

  // Delete user (admin only - soft delete)
  async deleteUser(id: string): Promise<{ message: string }> {
    const response = await api.delete(`/users/${id}`);
    return response.data;
  }
};
