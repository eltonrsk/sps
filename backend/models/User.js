import { executeQuery } from '../config/database.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export class User {
  // Create new user
  static async create(userData) {
    const { email, full_name, role, phone_number, password } = userData;
    
    // Hash password
    const hashedPassword = await bcrypt.hash(password || 'default123', 10);
    
    const query = `
      INSERT INTO user_profiles (email, full_name, role, phone_number, password_hash)
      VALUES (?, ?, ?, ?, ?)
    `;
    
    const result = await executeQuery(query, [email, full_name, role, phone_number, hashedPassword]);
    return result.insertId;
  }

  // Find user by email
  static async findByEmail(email) {
    const query = 'SELECT * FROM user_profiles WHERE email = ?';
    const users = await executeQuery(query, [email]);
    return users[0] || null;
  }

  // Find user by ID
  static async findById(id) {
    const query = 'SELECT id, role, full_name, phone_number, email, is_active, created_at FROM user_profiles WHERE id = ?';
    const users = await executeQuery(query, [id]);
    return users[0] || null;
  }

  // Get all users
  static async findAll(role = null) {
    let query = 'SELECT id, role, full_name, phone_number, email, is_active, created_at FROM user_profiles';
    let params = [];
    
    if (role) {
      query += ' WHERE role = ?';
      params.push(role);
    }
    
    query += ' ORDER BY created_at DESC';
    
    return await executeQuery(query, params);
  }

  // Update user
  static async update(id, userData) {
    const { full_name, role, phone_number, is_active } = userData;
    
    const query = `
      UPDATE user_profiles 
      SET full_name = ?, role = ?, phone_number = ?, is_active = ?
      WHERE id = ?
    `;
    
    await executeQuery(query, [full_name, role, phone_number, is_active, id]);
  }

  // Delete user (soft delete by setting is_active to false)
  static async delete(id) {
    const query = 'UPDATE user_profiles SET is_active = FALSE WHERE id = ?';
    await executeQuery(query, [id]);
  }

  // Authenticate user
  static async authenticate(email, password) {
    const user = await this.findByEmail(email);
    
    if (!user || !user.is_active) {
      return null;
    }

    const isPasswordValid = await bcrypt.compare(password, user.password_hash);
    
    if (!isPasswordValid) {
      return null;
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );

    // Remove password from user object
    const { password_hash, ...userWithoutPassword } = user;
    
    return { user: userWithoutPassword, token };
  }

  // Change password
  static async changePassword(userId, oldPassword, newPassword) {
    const user = await executeQuery('SELECT password_hash FROM user_profiles WHERE id = ?', [userId]);
    
    if (!user[0]) {
      throw new Error('User not found');
    }

    const isOldPasswordValid = await bcrypt.compare(oldPassword, user[0].password_hash);
    
    if (!isOldPasswordValid) {
      throw new Error('Invalid old password');
    }

    const hashedNewPassword = await bcrypt.hash(newPassword, 10);
    await executeQuery('UPDATE user_profiles SET password_hash = ? WHERE id = ?', [hashedNewPassword, userId]);
  }
}
