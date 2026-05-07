import { executeQuery } from '../config/database.js';
import { v4 as uuidv4 } from 'uuid';

export class QRCode {
  // Generate new QR code
  static async generate(qrData) {
    const { user_id, student_id, expires_at } = qrData;
    
    // Generate unique code
    const code = uuidv4().replace(/-/g, '').substring(0, 16).toUpperCase();
    
    const query = `
      INSERT INTO qr_codes (user_id, student_id, code, expires_at)
      VALUES (?, ?, ?, ?)
    `;
    
    await executeQuery(query, [user_id, student_id, code, expires_at]);
    const created = await this.findByCode(code);
    return { id: created?.id, code };
  }

  // Find QR code by code
  static async findByCode(code) {
    const query = `
      SELECT qr.*, u.full_name as user_name, u.role as user_role,
             s.first_name, s.last_name, s.grade, s.class_name
      FROM qr_codes qr
      LEFT JOIN user_profiles u ON qr.user_id = u.id
      LEFT JOIN students s ON qr.student_id = s.id
      WHERE qr.code = ? AND qr.is_active = TRUE
    `;
    
    const qrCodes = await executeQuery(query, [code]);
    return qrCodes[0] || null;
  }

  // Find QR code by ID
  static async findById(id) {
    const query = `
      SELECT qr.*, u.full_name as user_name, u.role as user_role,
             s.first_name, s.last_name, s.grade, s.class_name
      FROM qr_codes qr
      LEFT JOIN user_profiles u ON qr.user_id = u.id
      LEFT JOIN students s ON qr.student_id = s.id
      WHERE qr.id = ?
    `;
    
    const qrCodes = await executeQuery(query, [id]);
    return qrCodes[0] || null;
  }

  // Get QR codes for user
  static async findByUser(userId, includeExpired = false) {
    let query = `
      SELECT qr.*, s.first_name, s.last_name, s.grade, s.class_name
      FROM qr_codes qr
      LEFT JOIN students s ON qr.student_id = s.id
      WHERE qr.user_id = ?
    `;
    let params = [userId];
    
    if (!includeExpired) {
      query += ' AND (qr.expires_at IS NULL OR qr.expires_at > NOW()) AND qr.is_active = TRUE';
    }
    
    query += ' ORDER BY qr.created_at DESC';
    
    return await executeQuery(query, params);
  }

  // Get QR codes for student
  static async findByStudent(studentId, includeExpired = false) {
    let query = `
      SELECT qr.*, u.full_name as user_name, u.role as user_role
      FROM qr_codes qr
      LEFT JOIN user_profiles u ON qr.user_id = u.id
      WHERE qr.student_id = ?
    `;
    let params = [studentId];
    
    if (!includeExpired) {
      query += ' AND (qr.expires_at IS NULL OR qr.expires_at > NOW()) AND qr.is_active = TRUE';
    }
    
    query += ' ORDER BY qr.created_at DESC';
    
    return await executeQuery(query, params);
  }

  // Validate QR code
  static async validate(code) {
    const qrCode = await this.findByCode(code);
    
    if (!qrCode) {
      return { valid: false, error: 'QR code not found or inactive' };
    }

    // Check if expired
    if (qrCode.expires_at && new Date(qrCode.expires_at) < new Date()) {
      return { valid: false, error: 'QR code expired' };
    }

    return { valid: true, qrCode };
  }

  // Mark QR code as used
  static async markAsUsed(id) {
    const query = `
      UPDATE qr_codes 
      SET last_used_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `;
    
    await executeQuery(query, [id]);
  }

  // Deactivate QR code
  static async deactivate(id) {
    const query = 'UPDATE qr_codes SET is_active = FALSE WHERE id = ?';
    await executeQuery(query, [id]);
  }

  // Update expiry
  static async updateExpiry(id, expires_at) {
    const query = 'UPDATE qr_codes SET expires_at = ? WHERE id = ?';
    await executeQuery(query, [expires_at, id]);
  }

  // Get all QR codes (admin)
  static async findAll(includeExpired = false) {
    let query = `
      SELECT qr.*, u.full_name as user_name, u.role as user_role,
             s.first_name, s.last_name, s.grade, s.class_name
      FROM qr_codes qr
      LEFT JOIN user_profiles u ON qr.user_id = u.id
      LEFT JOIN students s ON qr.student_id = s.id
    `;
    
    if (!includeExpired) {
      query += ' WHERE (qr.expires_at IS NULL OR qr.expires_at > NOW()) AND qr.is_active = TRUE';
    }
    
    query += ' ORDER BY qr.created_at DESC';
    
    return await executeQuery(query);
  }
}
