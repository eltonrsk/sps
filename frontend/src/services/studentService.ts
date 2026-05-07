import api from './api';
import axios from 'axios';

export interface Student {
  id: string;
  first_name: string;
  last_name: string;
  grade: string;
  class_name?: string;
  photo_url?: string;
  is_active: boolean;
  created_by: string;
  created_by_name?: string;
  created_at: string;
}

export interface CreateStudentData {
  first_name: string;
  last_name: string;
  grade: string;
  class_name?: string;
  photo_url?: string;
}

export interface Guardian {
  id: string;
  full_name: string;
  phone_number?: string;
  email: string;
  relationship: string;
}

export interface AddGuardianData {
  user_id?: string;
  full_name?: string;
  email?: string;
  phone_number?: string;
  relationship: string;
  is_authorized?: boolean;
}

export const studentService = {
  // Get all students
  async getAllStudents(grade?: string, class_name?: string): Promise<Student[]> {
    const params: Record<string, string> = {};
    if (grade) params.grade = grade;
    if (class_name) params.class_name = class_name;
    
    const response = await api.get('/students', { params });
    return response.data;
  },

  // Get student by ID
  async getStudentById(id: string): Promise<Student> {
    const response = await api.get(`/students/${id}`);
    return response.data;
  },

  // Create new student (admin/teacher only)
  async createStudent(studentData: CreateStudentData): Promise<{ message: string; studentId: string }> {
    try {
      const response = await api.post('/students', studentData);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const message = error.response?.data?.error || 'Failed to create student';
        throw new Error(message);
      }
      throw error;
    }
  },

  // Update student (admin/teacher only)
  async updateStudent(id: string, studentData: Partial<Student>): Promise<{ message: string }> {
    const response = await api.put(`/students/${id}`, studentData);
    return response.data;
  },

  // Delete student (admin only - soft delete)
  async deleteStudent(id: string): Promise<{ message: string }> {
    const response = await api.delete(`/students/${id}`);
    return response.data;
  },

  // Get students by guardian
  async getStudentsByGuardian(guardianId: string): Promise<Student[]> {
    try {
      const response = await api.get(`/students/guardian/${guardianId}`);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const message = error.response?.data?.error || 'Failed to load your linked students';
        throw new Error(message);
      }
      throw error;
    }
  },

  // Get guardians for a student
  async getStudentGuardians(studentId: string): Promise<Guardian[]> {
    try {
      const response = await api.get(`/students/${studentId}/guardians`);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const message = error.response?.data?.error || 'Failed to load student guardians';
        throw new Error(message);
      }
      throw error;
    }
  },

  // Add guardian to student (admin only)
  async addGuardian(studentId: string, guardianData: AddGuardianData): Promise<{
    message: string;
    guardianUserId?: string;
    createdNewUser?: boolean;
    temporaryPassword?: string;
  }> {
    try {
      const response = await api.post(`/students/${studentId}/guardians`, guardianData);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const message = error.response?.data?.error || 'Failed to add guardian';
        throw new Error(message);
      }
      throw error;
    }
  },

  // Remove guardian from student (admin only)
  async removeGuardian(studentId: string, userId: string): Promise<{ message: string }> {
    try {
      const response = await api.delete(`/students/${studentId}/guardians/${userId}`);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const message = error.response?.data?.error || 'Failed to remove guardian';
        throw new Error(message);
      }
      throw error;
    }
  },

  // Get student pickup history
  async getStudentPickupHistory(studentId: string, limit?: number): Promise<any[]> {
    const params = limit ? { limit } : {};
    try {
      const response = await api.get(`/students/${studentId}/pickups`, { params });
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const message = error.response?.data?.error || 'Failed to load pickup history';
        throw new Error(message);
      }
      throw error;
    }
  }
};
