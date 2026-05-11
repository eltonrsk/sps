import express from 'express';
import { User } from '../models/User.js';
import { authenticateToken, authorizeRoles } from '../middleware/auth.js';
import { validateUser, handleValidationErrors } from '../middleware/validation.js';

const router = express.Router();

// Get all users (admin only)
router.get('/', authenticateToken, authorizeRoles('admin'), async (req, res) => {
  try {
    const { role } = req.query;
    const users = await User.findAll(role);
    res.json(users);
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// Get current user profile
router.get('/profile', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
});

// Get user by ID (admin only)
router.get('/:id', authenticateToken, authorizeRoles('admin'), async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Failed to fetch user' });
  }
});

// Create new user (admin only)
router.post('/', authenticateToken, authorizeRoles('admin'), validateUser, handleValidationErrors, async (req, res) => {
  try {
    const { email, full_name, role, phone_number, password } = req.body;
    
    // Check if user already exists
    const existingUser = await User.findByEmail(email);
    if (existingUser) {
      return res.status(400).json({ error: 'User with this email already exists' });
    }
    
    const userId = await User.create({
      email,
      full_name,
      role,
      phone_number,
      password
    });
    
    res.status(201).json({
      message: 'User created successfully',
      userId
    });
  } catch (error) {
    console.error('Create user error:', error);
    res.status(500).json({ error: 'Failed to create user' });
  }
});

// Update user (admin only or own profile)
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { full_name, role, phone_number, is_active } = req.body;
    
    // Check if user is admin or updating own profile
    if (req.user.role !== 'admin' && req.user.id !== id) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }
    
    // Non-admin users can't change role or is_active status
    const updateData = { full_name, phone_number };
    if (req.user.role === 'admin') {
      updateData.role = role;
      updateData.is_active = is_active;
    }
    
    await User.update(id, updateData);
    
    res.json({ message: 'User updated successfully' });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ error: 'Failed to update user' });
  }
});

// Delete user (admin only - soft delete)
router.delete('/:id', authenticateToken, authorizeRoles('admin'), async (req, res) => {
  try {
    await User.delete(req.params.id);
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ error: 'Failed to delete user' });
  }
});

export default router;
