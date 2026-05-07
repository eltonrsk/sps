import { executeQuery } from '../config/database.js';

export class Notification {
  // Create new notification
  static async create(notificationData) {
    const { user_id, title, message, type } = notificationData;
    
    const query = `
      INSERT INTO notifications (user_id, title, message, type)
      VALUES (?, ?, ?, ?)
    `;
    
    const result = await executeQuery(query, [user_id, title, message, type]);
    return result.insertId;
  }

  // Find notification by ID
  static async findById(id) {
    const query = `
      SELECT n.*, u.full_name as user_name
      FROM notifications n
      LEFT JOIN user_profiles u ON n.user_id = u.id
      WHERE n.id = ?
    `;
    
    const notifications = await executeQuery(query, [id]);
    return notifications[0] || null;
  }

  // Get notifications for user
  static async findByUser(userId, includeRead = false, limit = 50) {
    let query = `
      SELECT n.*, u.full_name as user_name
      FROM notifications n
      LEFT JOIN user_profiles u ON n.user_id = u.id
      WHERE n.user_id = ?
    `;
    let params = [userId];
    
    if (!includeRead) {
      query += ' AND n.is_read = FALSE';
    }
    
    query += ' ORDER BY n.created_at DESC LIMIT ?';
    params.push(limit);
    
    return await executeQuery(query, params);
  }

  // Get unread count for user
  static async getUnreadCount(userId) {
    const query = 'SELECT COUNT(*) as count FROM notifications WHERE user_id = ? AND is_read = FALSE';
    const result = await executeQuery(query, [userId]);
    return result[0].count;
  }

  // Mark notification as read
  static async markAsRead(id) {
    const query = 'UPDATE notifications SET is_read = TRUE WHERE id = ?';
    await executeQuery(query, [id]);
  }

  // Mark all notifications as read for user
  static async markAllAsRead(userId) {
    const query = 'UPDATE notifications SET is_read = TRUE WHERE user_id = ? AND is_read = FALSE';
    await executeQuery(query, [userId]);
  }

  // Delete notification
  static async delete(id) {
    const query = 'DELETE FROM notifications WHERE id = ?';
    await executeQuery(query, [id]);
  }

  // Create pickup notification
  static async createPickupNotification(studentId, pickupData) {
    // Get guardians of the student
    const guardiansQuery = `
      SELECT u.id, u.full_name
      FROM user_profiles u
      JOIN guardians g ON u.id = g.user_id
      WHERE g.student_id = ? AND g.is_authorized = TRUE AND u.is_active = TRUE
    `;
    
    const guardians = await executeQuery(guardiansQuery, [studentId]);
    
    // Get student details
    const studentQuery = 'SELECT first_name, last_name FROM students WHERE id = ?';
    const students = await executeQuery(studentQuery, [studentId]);
    const student = students[0];
    
    if (!student || guardians.length === 0) {
      return;
    }

    const studentName = `${student.first_name} ${student.last_name}`;
    const title = 'Student Pickup Alert';
    const message = `${studentName} has been picked up. Please check your pickup records.`;
    const type = 'pickup';

    // Create notification for each guardian
    for (const guardian of guardians) {
      await this.create({
        user_id: guardian.id,
        title,
        message,
        type
      });
    }
  }

  // Create QR code notification
  static async createQRNotification(userId, qrCodeData) {
    const { action, code, student_name } = qrCodeData;
    
    let title, message;
    
    if (action === 'generated') {
      title = 'QR Code Generated';
      message = student_name 
        ? `New QR code generated for ${student_name}.`
        : 'New QR code generated for your account.';
    } else if (action === 'used') {
      title = 'QR Code Used';
      message = student_name 
        ? `QR code used for pickup of ${student_name}.`
        : 'Your QR code has been used for pickup.';
    } else if (action === 'expired') {
      title = 'QR Code Expired';
      message = 'One of your QR codes has expired.';
    }

    await this.create({
      user_id: userId,
      title,
      message,
      type: 'qr_code'
    });
  }

  // Get all notifications (admin)
  static async findAll(filters = {}) {
    const { user_id, type, is_read, date_from, date_to, limit = 100 } = filters;
    
    let query = `
      SELECT n.*, u.full_name as user_name, u.email
      FROM notifications n
      LEFT JOIN user_profiles u ON n.user_id = u.id
      WHERE 1=1
    `;
    let params = [];
    
    if (user_id) {
      query += ' AND n.user_id = ?';
      params.push(user_id);
    }
    
    if (type) {
      query += ' AND n.type = ?';
      params.push(type);
    }
    
    if (is_read !== undefined) {
      query += ' AND n.is_read = ?';
      params.push(is_read);
    }
    
    if (date_from) {
      query += ' AND DATE(n.created_at) >= ?';
      params.push(date_from);
    }
    
    if (date_to) {
      query += ' AND DATE(n.created_at) <= ?';
      params.push(date_to);
    }
    
    query += ' ORDER BY n.created_at DESC LIMIT ?';
    params.push(limit);
    
    return await executeQuery(query, params);
  }

  // Get notification statistics
  static async getStatistics(dateFrom = null, dateTo = null) {
    let query = `
      SELECT 
        COUNT(*) as total_notifications,
        COUNT(CASE WHEN is_read = FALSE THEN 1 END) as unread_notifications,
        type,
        DATE(created_at) as notification_date
      FROM notifications
      WHERE 1=1
    `;
    let params = [];
    
    if (dateFrom) {
      query += ' AND DATE(created_at) >= ?';
      params.push(dateFrom);
    }
    
    if (dateTo) {
      query += ' AND DATE(created_at) <= ?';
      params.push(dateTo);
    }
    
    query += ' GROUP BY type, DATE(created_at) ORDER BY notification_date DESC';
    
    return await executeQuery(query, params);
  }
}
