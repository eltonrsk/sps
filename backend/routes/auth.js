import express from 'express';
import { User } from '../models/User.js';
import { validateLogin, handleValidationErrors } from '../middleware/validation.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Login route
router.post('/login', validateLogin, handleValidationErrors, async (req, res) => {
  try {
    const { email, password } = req.body;
    
    const result = await User.authenticate(email, password);
    
    if (!result) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }
    
    res.json({
      message: 'Login successful',
      user: result.user,
      token: result.token
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

// Register route (for admins only)
router.post('/register', async (req, res) => {
  try {
    const { email, full_name, role, phone_number, password } = req.body;
    
    // Check if user already exists
    const existingUser = await User.findByEmail(email);
    if (existingUser) {
      return res.status(400).json({ error: 'User with this email already exists' });
    }
    
    // Create new user
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
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Registration failed' });
  }
});

// Change password
router.post('/change-password', async (req, res) => {
  try {
    const { userId, oldPassword, newPassword } = req.body;
    
    if (!userId || !oldPassword || !newPassword) {
      return res.status(400).json({ error: 'All fields are required' });
    }
    
    if (newPassword.length < 6) {
      return res.status(400).json({ error: 'New password must be at least 6 characters' });
    }
    
    await User.changePassword(userId, oldPassword, newPassword);
    
    res.json({ message: 'Password changed successfully' });
  } catch (error) {
    console.error('Password change error:', error);
    if (error.message === 'User not found') {
      return res.status(404).json({ error: 'User not found' });
    }
    if (error.message === 'Invalid old password') {
      return res.status(400).json({ error: 'Invalid old password' });
    }
    res.status(500).json({ error: 'Password change failed' });
  }
});

// Verify token (for frontend to check if token is still valid)
router.get('/verify', authenticateToken, async (req, res) => {
  res.json({ valid: true, user: req.user });
});

// Return authenticated user's profile
router.get('/me', authenticateToken, async (req, res) => {
  res.json({ user: req.user });
});

export default router;
