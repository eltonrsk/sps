import express from 'express';
import { Student } from '../models/Student.js';
import { User } from '../models/User.js';
import { authenticateToken, authorizeRoles } from '../middleware/auth.js';
import { validateStudent, handleValidationErrors } from '../middleware/validation.js';

const router = express.Router();

// Get all students
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { grade, class_name } = req.query;
    const students = await Student.findAll(grade, class_name);
    res.json(students);
  } catch (error) {
    console.error('Get students error:', error);
    res.status(500).json({ error: 'Failed to fetch students' });
  }
});

// Get student by ID
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);
    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }
    res.json(student);
  } catch (error) {
    console.error('Get student error:', error);
    res.status(500).json({ error: 'Failed to fetch student' });
  }
});

// Create new student (admin and teacher only)
router.post('/', authenticateToken, authorizeRoles('admin', 'teacher'), validateStudent, handleValidationErrors, async (req, res) => {
  try {
    const { first_name, last_name, grade, class_name, photo_url } = req.body;
    
    const studentId = await Student.create({
      first_name,
      last_name,
      grade,
      class_name,
      photo_url,
      created_by: req.user.id
    });
    
    res.status(201).json({
      message: 'Student created successfully',
      studentId
    });
  } catch (error) {
    console.error('Create student error:', error);
    res.status(500).json({ error: 'Failed to create student' });
  }
});

// Update student (admin and teacher only)
router.put('/:id', authenticateToken, authorizeRoles('admin', 'teacher'), validateStudent, handleValidationErrors, async (req, res) => {
  try {
    const { first_name, last_name, grade, class_name, photo_url, is_active } = req.body;
    
    await Student.update(req.params.id, {
      first_name,
      last_name,
      grade,
      class_name,
      photo_url,
      is_active
    });
    
    res.json({ message: 'Student updated successfully' });
  } catch (error) {
    console.error('Update student error:', error);
    res.status(500).json({ error: 'Failed to update student' });
  }
});

// Delete student (admin only - soft delete)
router.delete('/:id', authenticateToken, authorizeRoles('admin'), async (req, res) => {
  try {
    await Student.delete(req.params.id);
    res.json({ message: 'Student deleted successfully' });
  } catch (error) {
    console.error('Delete student error:', error);
    res.status(500).json({ error: 'Failed to delete student' });
  }
});

// Get students by guardian (for parents)
router.get('/guardian/:guardianId', authenticateToken, async (req, res) => {
  try {
    // Users can only view their own guardian relationships unless they're admin
    if (req.user.role !== 'admin' && req.user.id !== req.params.guardianId) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }
    
    const students = await Student.findByGuardian(req.params.guardianId);
    res.json(students);
  } catch (error) {
    console.error('Get guardian students error:', error);
    res.status(500).json({ error: 'Failed to fetch guardian students' });
  }
});

// Get guardians for a student
router.get('/:id/guardians', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      const isLinked = await Student.isAuthorizedGuardian(req.user.id, req.params.id);
      if (!isLinked) {
        return res.status(403).json({ error: 'Insufficient permissions' });
      }
    }

    const guardians = await Student.getGuardians(req.params.id);
    res.json(guardians);
  } catch (error) {
    console.error('Get student guardians error:', error);
    res.status(500).json({ error: 'Failed to fetch student guardians' });
  }
});

// Add guardian to student (admin or linked parent)
router.post('/:id/guardians', authenticateToken, async (req, res) => {
  try {
    const { user_id, relationship, is_authorized, full_name, email, phone_number } = req.body;

    if (!relationship) {
      return res.status(400).json({ error: 'Relationship is required' });
    }

    if (req.user.role !== 'admin') {
      if (req.user.role !== 'parent') {
        return res.status(403).json({ error: 'Insufficient permissions' });
      }
      const isLinked = await Student.isAuthorizedGuardian(req.user.id, req.params.id);
      if (!isLinked) {
        return res.status(403).json({ error: 'You are not authorized to manage this student guardians' });
      }
    }

    let targetUserId = user_id;
    let createdNewUser = false;
    let temporaryPassword;

    if (!targetUserId) {
      if (!full_name || !email) {
        return res.status(400).json({ error: 'Either user_id or guardian full_name and email are required' });
      }

      const existingUser = await User.findByEmail(email);
      if (existingUser) {
        targetUserId = existingUser.id;
      } else {
        temporaryPassword = Math.random().toString(36).slice(-10);
        await User.create({
          email,
          full_name,
          role: 'parent',
          phone_number,
          password: temporaryPassword
        });
        const createdUser = await User.findByEmail(email);
        if (!createdUser) {
          return res.status(500).json({ error: 'Guardian account was created but could not be linked' });
        }
        targetUserId = createdUser.id;
        createdNewUser = true;
      }
    }

    await Student.addGuardian({
      user_id: targetUserId,
      student_id: req.params.id,
      relationship,
      is_authorized
    });
    
    res.status(201).json({
      message: 'Guardian added successfully',
      guardianUserId: targetUserId,
      createdNewUser,
      temporaryPassword
    });
  } catch (error) {
    console.error('Add guardian error:', error);
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ error: 'This guardian is already linked to the student' });
    }
    res.status(500).json({ error: 'Failed to add guardian' });
  }
});

// Remove guardian from student (admin or linked parent)
router.delete('/:id/guardians/:userId', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      if (req.user.role !== 'parent') {
        return res.status(403).json({ error: 'Insufficient permissions' });
      }
      const isLinked = await Student.isAuthorizedGuardian(req.user.id, req.params.id);
      if (!isLinked) {
        return res.status(403).json({ error: 'You are not authorized to manage this student guardians' });
      }
      if (req.user.id === req.params.userId) {
        return res.status(400).json({ error: 'You cannot remove your own access' });
      }
    }

    await Student.removeGuardian(req.params.userId, req.params.id);
    res.json({ message: 'Guardian removed successfully' });
  } catch (error) {
    console.error('Remove guardian error:', error);
    res.status(500).json({ error: 'Failed to remove guardian' });
  }
});

// Get student pickup history
router.get('/:id/pickups', authenticateToken, async (req, res) => {
  try {
    const { limit = 50 } = req.query;
    const pickups = await Student.getPickupHistory(req.params.id, parseInt(limit));
    res.json(pickups);
  } catch (error) {
    console.error('Get student pickups error:', error);
    res.status(500).json({ error: 'Failed to fetch student pickup history' });
  }
});

export default router;
