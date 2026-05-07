import api from './api';

export interface QRCode {
  id: string;
  user_id: string;
  student_id?: string;
  code: string;
  is_active: boolean;
  expires_at?: string;
  created_at: string;
  last_used_at?: string;
  user_name?: string;
  user_role?: string;
  student_name?: string;
  grade?: string;
  class_name?: string;
}

export interface CreateQRCodeData {
  user_id: string;
  student_id?: string;
  expires_at?: string;
}

export interface QRValidation {
  valid: boolean;
  qrCode?: QRCode;
  error?: string;
}

export interface ApiError {
  response?: {
    data?: {
      error?: string;
    };
  };
}

export const qrCodeService = {
  // Generate new QR code
  async generateQRCode(qrData: CreateQRCodeData): Promise<{ message: string; qrCode: { id: string; code: string } }> {
    const response = await api.post('/qrcodes', qrData);
    return response.data;
  },

  // Validate QR code
  async validateQRCode(code: string): Promise<QRValidation> {
    try {
      const response = await api.get(`/qrcodes/validate/${code}`);
      return {
        valid: true,
        qrCode: response.data.qrCode
      };
    } catch (error: unknown) {
      const apiError = error as ApiError;
      return {
        valid: false,
        error: apiError.response?.data?.error || 'Invalid QR code'
      };
    }
  },

  // Get QR codes for user
  async getUserQRCodes(userId: string, includeExpired = false): Promise<QRCode[]> {
    const params = includeExpired ? { include_expired: 'true' } : {};
    const response = await api.get(`/qrcodes/user/${userId}`, { params });
    return response.data;
  },

  // Get QR codes for student
  async getStudentQRCodes(studentId: string, includeExpired = false): Promise<QRCode[]> {
    const params = includeExpired ? { include_expired: 'true' } : {};
    const response = await api.get(`/qrcodes/student/${studentId}`, { params });
    return response.data;
  },

  // Get QR code by ID
  async getQRCodeById(id: string): Promise<QRCode> {
    const response = await api.get(`/qrcodes/${id}`);
    return response.data;
  },

  // Get all QR codes (admin only)
  async getAllQRCodes(includeExpired = false): Promise<QRCode[]> {
    const params = includeExpired ? { include_expired: 'true' } : {};
    const response = await api.get('/qrcodes', { params });
    return response.data;
  },

  // Deactivate QR code
  async deactivateQRCode(id: string): Promise<{ message: string }> {
    const response = await api.patch(`/qrcodes/${id}/deactivate`);
    return response.data;
  },

  // Update QR code expiry
  async updateQRCodeExpiry(id: string, expires_at: string): Promise<{ message: string }> {
    const response = await api.patch(`/qrcodes/${id}/expiry`, { expires_at });
    return response.data;
  },

  // Mark QR code as used
  async markQRCodeAsUsed(id: string): Promise<{ message: string }> {
    const response = await api.patch(`/qrcodes/${id}/used`);
    return response.data;
  }
};
