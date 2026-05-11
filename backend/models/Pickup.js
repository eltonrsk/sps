import { executeQuery } from '../config/database.js';

export class Pickup {
  // Create new pickup record
  static async create(pickupData) {
    const { student_id, picked_by_user_id, verified_by_user_id, qr_code_id, notes } = pickupData;
    
    const query = `
      INSERT INTO pickups (student_id, picked_by_user_id, verified_by_user_id, qr_code_id, notes)
      VALUES (?, ?, ?, ?, ?)
    `;
    
    const result = await executeQuery(query, [student_id, picked_by_user_id, verified_by_user_id, qr_code_id, notes]);
    return result.insertId;
  }

  // Find pickup by ID
  static async findById(id) {
    const query = `
      SELECT p.*, 
             s.first_name, s.last_name, s.grade, s.class_name,
             picker.full_name as picked_by_name, picker.role as picked_by_role,
             verifier.full_name as verified_by_name, verifier.role as verified_by_role,
             qr.code as qr_code
      FROM pickups p
      LEFT JOIN students s ON p.student_id = s.id
      LEFT JOIN user_profiles picker ON p.picked_by_user_id = picker.id
      LEFT JOIN user_profiles verifier ON p.verified_by_user_id = verifier.id
      LEFT JOIN qr_codes qr ON p.qr_code_id = qr.id
      WHERE p.id = ?
    `;
    
    const pickups = await executeQuery(query, [id]);
    return pickups[0] || null;
  }

  // Get all pickups with filters
  static async findAll(filters = {}) {
    const { student_id, picked_by_user_id, verified_by_user_id, date_from, date_to, limit = 100 } = filters;
    
    let query = `
      SELECT p.*, 
             s.first_name, s.last_name, s.grade, s.class_name,
             picker.full_name as picked_by_name, picker.role as picked_by_role,
             verifier.full_name as verified_by_name, verifier.role as verified_by_role,
             qr.code as qr_code
      FROM pickups p
      LEFT JOIN students s ON p.student_id = s.id
      LEFT JOIN user_profiles picker ON p.picked_by_user_id = picker.id
      LEFT JOIN user_profiles verifier ON p.verified_by_user_id = verifier.id
      LEFT JOIN qr_codes qr ON p.qr_code_id = qr.id
      WHERE 1=1
    `;
    let params = [];
    
    if (student_id) {
      query += ' AND p.student_id = ?';
      params.push(student_id);
    }
    
    if (picked_by_user_id) {
      query += ' AND p.picked_by_user_id = ?';
      params.push(picked_by_user_id);
    }
    
    if (verified_by_user_id) {
      query += ' AND p.verified_by_user_id = ?';
      params.push(verified_by_user_id);
    }
    
    if (date_from) {
      query += ' AND DATE(p.pickup_time) >= ?';
      params.push(date_from);
    }
    
    if (date_to) {
      query += ' AND DATE(p.pickup_time) <= ?';
      params.push(date_to);
    }
    
    query += ' ORDER BY p.pickup_time DESC LIMIT ?';
    params.push(limit);
    
    return await executeQuery(query, params);
  }

  // Get today's pickups
  static async getTodayPickups() {
    const query = `
      SELECT p.*, 
             s.first_name, s.last_name, s.grade, s.class_name,
             picker.full_name as picked_by_name,
             verifier.full_name as verified_by_name
      FROM pickups p
      LEFT JOIN students s ON p.student_id = s.id
      LEFT JOIN user_profiles picker ON p.picked_by_user_id = picker.id
      LEFT JOIN user_profiles verifier ON p.verified_by_user_id = verifier.id
      WHERE DATE(p.pickup_time) = CURDATE()
      ORDER BY p.pickup_time DESC
    `;
    
    return await executeQuery(query);
  }

  // Get pickup statistics
  static async getStatistics(dateFrom = null, dateTo = null) {
    let query = `
      SELECT 
        COUNT(*) as total_pickups,
        COUNT(DISTINCT student_id) as unique_students,
        COUNT(DISTINCT picked_by_user_id) as unique_pickers,
        DATE(pickup_time) as pickup_date
      FROM pickups
      WHERE 1=1
    `;
    let params = [];
    
    if (dateFrom) {
      query += ' AND DATE(pickup_time) >= ?';
      params.push(dateFrom);
    }
    
    if (dateTo) {
      query += ' AND DATE(pickup_time) <= ?';
      params.push(dateTo);
    }
    
    query += ' GROUP BY DATE(pickup_time) ORDER BY pickup_date DESC';
    
    return await executeQuery(query, params);
  }

  // Get pickups by guardian
  static async findByGuardian(guardianId, limit = 50) {
    const query = `
      SELECT p.*, 
             s.first_name, s.last_name, s.grade, s.class_name,
             verifier.full_name as verified_by_name
      FROM pickups p
      LEFT JOIN students s ON p.student_id = s.id
      LEFT JOIN user_profiles verifier ON p.verified_by_user_id = verifier.id
      WHERE p.picked_by_user_id = ?
      ORDER BY p.pickup_time DESC
      LIMIT ?
    `;
    
    return await executeQuery(query, [guardianId, limit]);
  }

  // Update pickup notes
  static async updateNotes(id, notes) {
    const query = 'UPDATE pickups SET notes = ? WHERE id = ?';
    await executeQuery(query, [notes, id]);
  }

  // Delete pickup (admin only - for data correction)
  static async delete(id) {
    const query = 'DELETE FROM pickups WHERE id = ?';
    await executeQuery(query, [id]);
  }

  // Get recent pickups for dashboard
  static async getRecentPickups(limit = 10) {
    const query = `
      SELECT p.*, 
             s.first_name, s.last_name, s.grade,
             picker.full_name as picked_by_name,
             verifier.full_name as verified_by_name
      FROM pickups p
      LEFT JOIN students s ON p.student_id = s.id
      LEFT JOIN user_profiles picker ON p.picked_by_user_id = picker.id
      LEFT JOIN user_profiles verifier ON p.verified_by_user_id = verifier.id
      ORDER BY p.pickup_time DESC
      LIMIT ?
    `;
    
    return await executeQuery(query, [limit]);
  }
}
