import express from 'express';
import { Notification } from '../models/Notification.js';
import { authenticateToken, authorizeRoles } from '../middleware/auth.js';

const router = express.Router();

// Get notifications for current user
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { include_read, limit = 50 } = req.query;
    const notifications = await Notification.findByUser(
      req.user.id, 
      include_read === 'true', 
      parseInt(limit)
    );
    res.json(notifications);
  } catch (error) {
    console.error('Get notifications error:', error);
    res.status(500).json({ error: 'Failed to fetch notifications' });
  }
});

// Get notification by ID
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);
    if (!notification) {
      return res.status(404).json({ error: 'Notification not found' });
    }
    
    // Users can only view their own notifications unless they're admin
    if (req.user.role !== 'admin' && req.user.id !== notification.user_id) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }
    
    res.json(notification);
  } catch (error) {
    console.error('Get notification error:', error);
    res.status(500).json({ error: 'Failed to fetch notification' });
  }
});

// Get unread count for current user
router.get('/unread/count', authenticateToken, async (req, res) => {
  try {
    const count = await Notification.getUnreadCount(req.user.id);
    res.json({ unread_count: count });
  } catch (error) {
    console.error('Get unread count error:', error);
    res.status(500).json({ error: 'Failed to get unread count' });
  }
});

// Mark notification as read
router.patch('/:id/read', authenticateToken, async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);
    if (!notification) {
      return res.status(404).json({ error: 'Notification not found' });
    }
    
    // Users can only mark their own notifications as read unless they're admin
    if (req.user.role !== 'admin' && req.user.id !== notification.user_id) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }
    
    await Notification.markAsRead(req.params.id);
    res.json({ message: 'Notification marked as read' });
  } catch (error) {
    console.error('Mark notification as read error:', error);
    res.status(500).json({ error: 'Failed to mark notification as read' });
  }
});

// Mark all notifications as read for current user
router.patch('/all/read', authenticateToken, async (req, res) => {
  try {
    await Notification.markAllAsRead(req.user.id);
    res.json({ message: 'All notifications marked as read' });
  } catch (error) {
    console.error('Mark all notifications as read error:', error);
    res.status(500).json({ error: 'Failed to mark all notifications as read' });
  }
});

// Delete notification
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);
    if (!notification) {
      return res.status(404).json({ error: 'Notification not found' });
    }
    
    // Users can only delete their own notifications unless they're admin
    if (req.user.role !== 'admin' && req.user.id !== notification.user_id) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }
    
    await Notification.delete(req.params.id);
    res.json({ message: 'Notification deleted successfully' });
  } catch (error) {
    console.error('Delete notification error:', error);
    res.status(500).json({ error: 'Failed to delete notification' });
  }
});

// Create custom notification (admin only)
router.post('/', authenticateToken, authorizeRoles('admin'), async (req, res) => {
  try {
    const { user_id, title, message, type } = req.body;
    
    if (!user_id || !title || !message || !type) {
      return res.status(400).json({ error: 'All fields are required' });
    }
    
    const notificationId = await Notification.create({
      user_id,
      title,
      message,
      type
    });
    
    res.status(201).json({
      message: 'Notification created successfully',
      notificationId
    });
  } catch (error) {
    console.error('Create notification error:', error);
    res.status(500).json({ error: 'Failed to create notification' });
  }
});

// Get all notifications (admin only)
router.get('/admin/all', authenticateToken, authorizeRoles('admin'), async (req, res) => {
  try {
    const filters = {
      user_id: req.query.user_id,
      type: req.query.type,
      is_read: req.query.is_read,
      date_from: req.query.date_from,
      date_to: req.query.date_to,
      limit: parseInt(req.query.limit) || 100
    };
    
    const notifications = await Notification.findAll(filters);
    res.json(notifications);
  } catch (error) {
    console.error('Get all notifications error:', error);
    res.status(500).json({ error: 'Failed to fetch all notifications' });
  }
});

// Get notification statistics (admin only)
router.get('/admin/statistics', authenticateToken, authorizeRoles('admin'), async (req, res) => {
  try {
    const { date_from, date_to } = req.query;
    const statistics = await Notification.getStatistics(date_from, date_to);
    res.json(statistics);
  } catch (error) {
    console.error('Get notification statistics error:', error);
    res.status(500).json({ error: 'Failed to fetch notification statistics' });
  }
});

export default router;
