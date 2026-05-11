import { executeQuery } from '../config/database.js';

export class Student {
  // Create new student
  static async create(studentData) {
    const { first_name, last_name, grade, class_name, photo_url, created_by } = studentData;
    
    const query = `
      INSERT INTO students (first_name, last_name, grade, class_name, photo_url, created_by)
      VALUES (?, ?, ?, ?, ?, ?)
    `;
    
    const result = await executeQuery(query, [
      first_name,
      last_name,
      grade,
      class_name ?? null,
      photo_url ?? null,
      created_by ?? null
    ]);
    return result.insertId;
  }

  // Find student by ID
  static async findById(id) {
    const query = `
      SELECT s.*, u.full_name as created_by_name
      FROM students s
      LEFT JOIN user_profiles u ON s.created_by = u.id
      WHERE s.id = ?
    `;
    const students = await executeQuery(query, [id]);
    return students[0] || null;
  }

  // Get all students
  static async findAll(grade = null, class_name = null) {
    let query = `
      SELECT s.*, u.full_name as created_by_name
      FROM students s
      LEFT JOIN user_profiles u ON s.created_by = u.id
      WHERE s.is_active = TRUE
    `;
    let params = [];
    
    if (grade) {
      query += ' AND s.grade = ?';
      params.push(grade);
    }
    
    if (class_name) {
      query += ' AND s.class_name = ?';
      params.push(class_name);
    }
    
    query += ' ORDER BY s.last_name, s.first_name';
    
    return await executeQuery(query, params);
  }

  // Update student
  static async update(id, studentData) {
    const { first_name, last_name, grade, class_name, photo_url, is_active } = studentData;
    
    const query = `
      UPDATE students 
      SET first_name = ?, last_name = ?, grade = ?, class_name = ?, photo_url = ?, is_active = ?
      WHERE id = ?
    `;
    
    await executeQuery(query, [
      first_name,
      last_name,
      grade,
      class_name ?? null,
      photo_url ?? null,
      is_active ?? true,
      id
    ]);
  }

  // Delete student (soft delete)
  static async delete(id) {
    const query = 'UPDATE students SET is_active = FALSE WHERE id = ?';
    await executeQuery(query, [id]);
  }

  // Get students by guardian
  static async findByGuardian(guardianId) {
    const query = `
      SELECT s.*, g.relationship
      FROM students s
      JOIN guardians g ON s.id = g.student_id
      WHERE g.user_id = ? AND s.is_active = TRUE AND g.is_authorized = TRUE
      ORDER BY s.last_name, s.first_name
    `;
    
    return await executeQuery(query, [guardianId]);
  }

  // Get guardians for a student
  static async getGuardians(studentId) {
    const query = `
      SELECT u.id, u.full_name, u.phone_number, u.email, g.relationship
      FROM user_profiles u
      JOIN guardians g ON u.id = g.user_id
      WHERE g.student_id = ? AND u.is_active = TRUE AND g.is_authorized = TRUE
    `;
    
    return await executeQuery(query, [studentId]);
  }

  // Add guardian to student
  static async addGuardian(guardianData) {
    const { user_id, student_id, relationship, is_authorized } = guardianData;
    
    const query = `
      INSERT INTO guardians (user_id, student_id, relationship, is_authorized)
      VALUES (?, ?, ?, ?)
    `;
    
    const result = await executeQuery(query, [user_id, student_id, relationship, is_authorized || true]);
    return result.insertId;
  }

  // Check if user is an authorized guardian for a student
  static async isAuthorizedGuardian(userId, studentId) {
    const query = `
      SELECT id
      FROM guardians
      WHERE user_id = ? AND student_id = ? AND is_authorized = TRUE
      LIMIT 1
    `;
    const rows = await executeQuery(query, [userId, studentId]);
    return rows.length > 0;
  }

  // Count authorized guardians for a student
  static async countAuthorizedGuardians(studentId) {
    const query = `
      SELECT COUNT(*) as total
      FROM guardians
      WHERE student_id = ? AND is_authorized = TRUE
    `;
    const rows = await executeQuery(query, [studentId]);
    return rows[0]?.total || 0;
  }

  // Remove guardian from student
  static async removeGuardian(userId, studentId) {
    const query = 'DELETE FROM guardians WHERE user_id = ? AND student_id = ?';
    await executeQuery(query, [userId, studentId]);
  }

  // Get student pickup history
  static async getPickupHistory(studentId, limit = 50) {
    const query = `
      SELECT p.*, 
             picker.full_name as picked_by_name,
             verifier.full_name as verified_by_name,
             qr.code as qr_code
      FROM pickups p
      LEFT JOIN user_profiles picker ON p.picked_by_user_id = picker.id
      LEFT JOIN user_profiles verifier ON p.verified_by_user_id = verifier.id
      LEFT JOIN qr_codes qr ON p.qr_code_id = qr.id
      WHERE p.student_id = ?
      ORDER BY p.pickup_time DESC
      LIMIT ?
    `;
    
    return await executeQuery(query, [studentId, limit]);
  }
}
