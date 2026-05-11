import api from './api';

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: string;
  is_read: boolean;
  created_at: string;
  user_name?: string;
}

export interface CreateNotificationData {
  user_id: string;
  title: string;
  message: string;
  type: string;
}

export const notificationService = {
  // Get notifications for current user
  async getUserNotifications(includeRead = false, limit = 50): Promise<Notification[]> {
    const params = {
      include_read: includeRead ? 'true' : 'false',
      limit: limit.toString()
    };
    const response = await api.get('/notifications', { params });
    return response.data;
  },

  // Get notification by ID
  async getNotificationById(id: string): Promise<Notification> {
    const response = await api.get(`/notifications/${id}`);
    return response.data;
  },

  // Get unread count for current user
  async getUnreadCount(): Promise<{ unread_count: number }> {
    const response = await api.get('/notifications/unread/count');
    return response.data;
  },

  // Mark notification as read
  async markAsRead(id: string): Promise<{ message: string }> {
    const response = await api.patch(`/notifications/${id}/read`);
    return response.data;
  },

  // Mark all notifications as read for current user
  async markAllAsRead(): Promise<{ message: string }> {
    const response = await api.patch('/notifications/all/read');
    return response.data;
  },

  // Delete notification
  async deleteNotification(id: string): Promise<{ message: string }> {
    const response = await api.delete(`/notifications/${id}`);
    return response.data;
  },

  // Create custom notification (admin only)
  async createNotification(notificationData: CreateNotificationData): Promise<{ message: string; notificationId: string }> {
    const response = await api.post('/notifications', notificationData);
    return response.data;
  },

  // Get all notifications (admin only)
  async getAllNotifications(filters?: {
    user_id?: string;
    type?: string;
    is_read?: boolean;
    date_from?: string;
    date_to?: string;
    limit?: number;
  }): Promise<Notification[]> {
    const params = filters || {};
    const response = await api.get('/notifications/admin/all', { params });
    return response.data;
  },

  // Get notification statistics (admin only)
  async getNotificationStatistics(dateFrom?: string, dateTo?: string): Promise<any[]> {
    const params = {};
    if (dateFrom) params.date_from = dateFrom;
    if (dateTo) params.date_to = dateTo;
    
    const response = await api.get('/notifications/admin/statistics', { params });
    return response.data;
  }
};
