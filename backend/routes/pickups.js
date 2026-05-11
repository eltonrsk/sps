import express from 'express';
import { Pickup } from '../models/Pickup.js';
import { QRCode } from '../models/QRCode.js';
import { Notification } from '../models/Notification.js';
import { authenticateToken, authorizeRoles } from '../middleware/auth.js';
import { validatePickup, handleValidationErrors } from '../middleware/validation.js';

const router = express.Router();

// Create new pickup record
router.post('/', authenticateToken, validatePickup, handleValidationErrors, async (req, res) => {
  try {
    const { student_id, picked_by_user_id, verified_by_user_id, qr_code_id, notes } = req.body;
    
    // Verify that the current user is either the picker or verifier
    if (req.user.id !== picked_by_user_id && req.user.id !== verified_by_user_id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }
    
    const pickupId = await Pickup.create({
      student_id,
      picked_by_user_id,
      verified_by_user_id,
      qr_code_id,
      notes: notes || null
    });
    
    // Mark QR code as used if provided
    if (qr_code_id) {
      await QRCode.markAsUsed(qr_code_id);
    }
    
    // Create notifications for guardians
    await Notification.createPickupNotification(student_id, {
      picked_by: picked_by_user_id,
      verified_by: verified_by_user_id,
      pickup_time: new Date()
    });
    
    res.status(201).json({
      message: 'Pickup recorded successfully',
      pickupId
    });
  } catch (error) {
    console.error('Create pickup error:', error);
    res.status(500).json({ error: 'Failed to record pickup' });
  }
});

// Process pickup with QR code
router.post('/qr', authenticateToken, async (req, res) => {
  try {
    const { qr_code, student_id, notes } = req.body;
    
    // Validate QR code
    const validation = await QRCode.validate(qr_code);
    if (!validation.valid) {
      return res.status(400).json({ error: validation.error });
    }
    
    const qrCode = validation.qrCode;
    
    // Verify that the QR code belongs to the current user or they're security/admin
    if (req.user.role !== 'admin' && req.user.role !== 'security' && req.user.id !== qrCode.user_id) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }
    
    // Use the student from QR code if not provided
    const finalStudentId = student_id || qrCode.student_id;
    
    if (!finalStudentId) {
      return res.status(400).json({ error: 'Student ID is required' });
    }
    
    // Create pickup record
    const pickupId = await Pickup.create({
      student_id: finalStudentId,
      picked_by_user_id: qrCode.user_id,
      verified_by_user_id: req.user.id,
      qr_code_id: qrCode.id,
      notes: notes || null
    });
    
    // Mark QR code as used
    await QRCode.markAsUsed(qrCode.id);
    
    // Create notifications for guardians
    await Notification.createPickupNotification(finalStudentId, {
      picked_by: qrCode.user_id,
      verified_by: req.user.id,
      pickup_time: new Date()
    });
    
    res.status(201).json({
      message: 'Pickup processed successfully',
      pickupId
    });
  } catch (error) {
    console.error('Process QR pickup error:', error);
    res.status(500).json({ error: 'Failed to process pickup' });
  }
});

// Get all pickups with filters
router.get('/', authenticateToken, async (req, res) => {
  try {
    const filters = {
      student_id: req.query.student_id,
      picked_by_user_id: req.query.picked_by_user_id,
      verified_by_user_id: req.query.verified_by_user_id,
      date_from: req.query.date_from,
      date_to: req.query.date_to,
      limit: parseInt(req.query.limit) || 100
    };
    
    // Non-admin users can only see pickups they're involved in
    if (req.user.role !== 'admin') {
      filters.picked_by_user_id = req.user.id;
    }
    
    const pickups = await Pickup.findAll(filters);
    res.json(pickups);
  } catch (error) {
    console.error('Get pickups error:', error);
    res.status(500).json({ error: 'Failed to fetch pickups' });
  }
});

// Get pickup by ID
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const pickup = await Pickup.findById(req.params.id);
    if (!pickup) {
      return res.status(404).json({ error: 'Pickup not found' });
    }
    
    // Users can only view pickups they're involved in unless they're admin
    if (req.user.role !== 'admin' && 
        req.user.id !== pickup.picked_by_user_id && 
        req.user.id !== pickup.verified_by_user_id) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }
    
    res.json(pickup);
  } catch (error) {
    console.error('Get pickup error:', error);
    res.status(500).json({ error: 'Failed to fetch pickup' });
  }
});

// Get today's pickups
router.get('/today/list', authenticateToken, async (req, res) => {
  try {
    const pickups = await Pickup.getTodayPickups();
    res.json(pickups);
  } catch (error) {
    console.error('Get today pickups error:', error);
    res.status(500).json({ error: 'Failed to fetch today pickups' });
  }
});

// Get pickup statistics
router.get('/statistics/data', authenticateToken, authorizeRoles('admin'), async (req, res) => {
  try {
    const { date_from, date_to } = req.query;
    const statistics = await Pickup.getStatistics(date_from, date_to);
    res.json(statistics);
  } catch (error) {
    console.error('Get pickup statistics error:', error);
    res.status(500).json({ error: 'Failed to fetch pickup statistics' });
  }
});

// Get pickups by guardian
router.get('/guardian/:guardianId', authenticateToken, async (req, res) => {
  try {
    // Users can only view their own pickups unless they're admin
    if (req.user.role !== 'admin' && req.user.id !== req.params.guardianId) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }
    
    const { limit = 50 } = req.query;
    const pickups = await Pickup.findByGuardian(req.params.guardianId, parseInt(limit));
    res.json(pickups);
  } catch (error) {
    console.error('Get guardian pickups error:', error);
    res.status(500).json({ error: 'Failed to fetch guardian pickups' });
  }
});

// Update pickup notes
router.patch('/:id/notes', authenticateToken, async (req, res) => {
  try {
    const { notes } = req.body;
    
    const pickup = await Pickup.findById(req.params.id);
    if (!pickup) {
      return res.status(404).json({ error: 'Pickup not found' });
    }
    
    // Users can only update pickups they're involved in unless they're admin
    if (req.user.role !== 'admin' && 
        req.user.id !== pickup.picked_by_user_id && 
        req.user.id !== pickup.verified_by_user_id) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }
    
    await Pickup.updateNotes(req.params.id, notes);
    res.json({ message: 'Pickup notes updated successfully' });
  } catch (error) {
    console.error('Update pickup notes error:', error);
    res.status(500).json({ error: 'Failed to update pickup notes' });
  }
});

// Delete pickup (admin only)
router.delete('/:id', authenticateToken, authorizeRoles('admin'), async (req, res) => {
  try {
    await Pickup.delete(req.params.id);
    res.json({ message: 'Pickup deleted successfully' });
  } catch (error) {
    console.error('Delete pickup error:', error);
    res.status(500).json({ error: 'Failed to delete pickup' });
  }
});

// Get recent pickups for dashboard
router.get('/recent/list', authenticateToken, async (req, res) => {
  try {
    const { limit = 10 } = req.query;
    const pickups = await Pickup.getRecentPickups(parseInt(limit));
    res.json(pickups);
  } catch (error) {
    console.error('Get recent pickups error:', error);
    res.status(500).json({ error: 'Failed to fetch recent pickups' });
  }
});

export default router;
