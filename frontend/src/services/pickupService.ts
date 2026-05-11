import api from './api';

export interface Pickup {
  id: string;
  student_id: string;
  picked_by_user_id: string;
  verified_by_user_id: string;
  qr_code_id?: string;
  pickup_time: string;
  notes?: string;
  created_at: string;
  student_name?: string;
  grade?: string;
  class_name?: string;
  picked_by_name?: string;
  picked_by_role?: string;
  verified_by_name?: string;
  verified_by_role?: string;
  qr_code?: string;
}

export interface CreatePickupData {
  student_id: string;
  picked_by_user_id: string;
  verified_by_user_id: string;
  qr_code_id?: string;
  notes?: string;
}

export interface QRPickupData {
  qr_code: string;
  student_id?: string;
  notes?: string;
}

export const pickupService = {
  // Create new pickup record
  async createPickup(pickupData: CreatePickupData): Promise<{ message: string; pickupId: string }> {
    const response = await api.post('/pickups', pickupData);
    return response.data;
  },

  // Process pickup with QR code
  async processQRPickup(qrData: QRPickupData): Promise<{ message: string; pickupId: string }> {
    const response = await api.post('/pickups/qr', qrData);
    return response.data;
  },

  // Get all pickups with filters
  async getAllPickups(filters?: {
    student_id?: string;
    picked_by_user_id?: string;
    verified_by_user_id?: string;
    date_from?: string;
    date_to?: string;
    limit?: number;
  }): Promise<Pickup[]> {
    const params = filters || {};
    const response = await api.get('/pickups', { params });
    return response.data;
  },

  // Get pickup by ID
  async getPickupById(id: string): Promise<Pickup> {
    const response = await api.get(`/pickups/${id}`);
    return response.data;
  },

  // Get today's pickups
  async getTodayPickups(): Promise<Pickup[]> {
    const response = await api.get('/pickups/today/list');
    return response.data;
  },

  // Get pickup statistics (admin only)
  async getPickupStatistics(dateFrom?: string, dateTo?: string): Promise<any[]> {
    const params = {};
    if (dateFrom) params.date_from = dateFrom;
    if (dateTo) params.date_to = dateTo;
    
    const response = await api.get('/pickups/statistics/data', { params });
    return response.data;
  },

  // Get pickups by guardian
  async getPickupsByGuardian(guardianId: string, limit = 50): Promise<Pickup[]> {
    const params = { limit };
    const response = await api.get(`/pickups/guardian/${guardianId}`, { params });
    return response.data;
  },

  // Update pickup notes
  async updatePickupNotes(id: string, notes: string): Promise<{ message: string }> {
    const response = await api.patch(`/pickups/${id}/notes`, { notes });
    return response.data;
  },

  // Delete pickup (admin only)
  async deletePickup(id: string): Promise<{ message: string }> {
    const response = await api.delete(`/pickups/${id}`);
    return response.data;
  },

  // Get recent pickups for dashboard
  async getRecentPickups(limit = 10): Promise<Pickup[]> {
    const params = { limit };
    const response = await api.get('/pickups/recent/list', { params });
    return response.data;
  }
};
