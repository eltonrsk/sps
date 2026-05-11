import express from 'express';
import { QRCode } from '../models/QRCode.js';
import { authenticateToken, authorizeRoles } from '../middleware/auth.js';
import { validateQRCode, handleValidationErrors } from '../middleware/validation.js';

const router = express.Router();

// Generate new QR code
router.post('/', authenticateToken, validateQRCode, handleValidationErrors, async (req, res) => {
  try {
    const { user_id, student_id, expires_at } = req.body;
    
    // Users can only generate QR codes for themselves unless they're admin
    if (req.user.role !== 'admin' && req.user.id !== user_id) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }
    
    const result = await QRCode.generate({
      user_id,
      student_id,
      expires_at
    });
    
    res.status(201).json({
      message: 'QR code generated successfully',
      qrCode: result
    });
  } catch (error) {
    console.error('Generate QR code error:', error);
    if (error.code === 'ER_NO_REFERENCED_ROW_2') {
      return res.status(400).json({ error: 'Invalid user_id or student_id' });
    }
    res.status(500).json({ error: 'Failed to generate QR code' });
  }
});

// Get QR code by code (for validation)
router.get('/validate/:code', authenticateToken, async (req, res) => {
  try {
    const { code } = req.params;
    const validation = await QRCode.validate(code);
    
    if (!validation.valid) {
      return res.status(400).json({ error: validation.error });
    }
    
    res.json({
      message: 'QR code is valid',
      qrCode: validation.qrCode
    });
  } catch (error) {
    console.error('Validate QR code error:', error);
    res.status(500).json({ error: 'Failed to validate QR code' });
  }
});

// Get QR codes for user
router.get('/user/:userId', authenticateToken, async (req, res) => {
  try {
    const { userId } = req.params;
    const { include_expired } = req.query;
    
    // Users can only view their own QR codes unless they're admin
    if (req.user.role !== 'admin' && req.user.id !== userId) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }
    
    const qrCodes = await QRCode.findByUser(userId, include_expired === 'true');
    res.json(qrCodes);
  } catch (error) {
    console.error('Get user QR codes error:', error);
    res.status(500).json({ error: 'Failed to fetch user QR codes' });
  }
});

// Get QR codes for student
router.get('/student/:studentId', authenticateToken, async (req, res) => {
  try {
    const { studentId } = req.params;
    const { include_expired } = req.query;
    
    const qrCodes = await QRCode.findByStudent(studentId, include_expired === 'true');
    res.json(qrCodes);
  } catch (error) {
    console.error('Get student QR codes error:', error);
    res.status(500).json({ error: 'Failed to fetch student QR codes' });
  }
});

// Get QR code by ID
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const qrCode = await QRCode.findById(req.params.id);
    if (!qrCode) {
      return res.status(404).json({ error: 'QR code not found' });
    }
    
    // Users can only view their own QR codes unless they're admin
    if (req.user.role !== 'admin' && req.user.id !== qrCode.user_id) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }
    
    res.json(qrCode);
  } catch (error) {
    console.error('Get QR code error:', error);
    res.status(500).json({ error: 'Failed to fetch QR code' });
  }
});

// Get all QR codes (admin only)
router.get('/', authenticateToken, authorizeRoles('admin'), async (req, res) => {
  try {
    const { include_expired } = req.query;
    const qrCodes = await QRCode.findAll(include_expired === 'true');
    res.json(qrCodes);
  } catch (error) {
    console.error('Get all QR codes error:', error);
    res.status(500).json({ error: 'Failed to fetch QR codes' });
  }
});

// Deactivate QR code
router.patch('/:id/deactivate', authenticateToken, async (req, res) => {
  try {
    const qrCode = await QRCode.findById(req.params.id);
    if (!qrCode) {
      return res.status(404).json({ error: 'QR code not found' });
    }
    
    // Users can only deactivate their own QR codes unless they're admin
    if (req.user.role !== 'admin' && req.user.id !== qrCode.user_id) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }
    
    await QRCode.deactivate(req.params.id);
    res.json({ message: 'QR code deactivated successfully' });
  } catch (error) {
    console.error('Deactivate QR code error:', error);
    res.status(500).json({ error: 'Failed to deactivate QR code' });
  }
});

// Update QR code expiry
router.patch('/:id/expiry', authenticateToken, async (req, res) => {
  try {
    const { expires_at } = req.body;
    
    const qrCode = await QRCode.findById(req.params.id);
    if (!qrCode) {
      return res.status(404).json({ error: 'QR code not found' });
    }
    
    // Users can only update their own QR codes unless they're admin
    if (req.user.role !== 'admin' && req.user.id !== qrCode.user_id) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }
    
    await QRCode.updateExpiry(req.params.id, expires_at);
    res.json({ message: 'QR code expiry updated successfully' });
  } catch (error) {
    console.error('Update QR code expiry error:', error);
    res.status(500).json({ error: 'Failed to update QR code expiry' });
  }
});

// Mark QR code as used
router.patch('/:id/used', authenticateToken, async (req, res) => {
  try {
    await QRCode.markAsUsed(req.params.id);
    res.json({ message: 'QR code marked as used successfully' });
  } catch (error) {
    console.error('Mark QR code as used error:', error);
    res.status(500).json({ error: 'Failed to mark QR code as used' });
  }
});

export default router;
