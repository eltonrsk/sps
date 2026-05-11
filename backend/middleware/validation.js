import { body, validationResult } from 'express-validator';

// Handle validation errors
export const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: 'Validation failed',
      details: errors.array()
    });
  }
  next();
};

// User validation rules
export const validateUser = [
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('full_name').trim().isLength({ min: 2, max: 255 }).withMessage('Full name must be 2-255 characters'),
  body('role').isIn(['admin', 'parent', 'teacher', 'security']).withMessage('Invalid role'),
  body('phone_number').optional().isMobilePhone().withMessage('Invalid phone number format')
];

// Student validation rules
export const validateStudent = [
  body('first_name').trim().isLength({ min: 2, max: 100 }).withMessage('First name must be 2-100 characters'),
  body('last_name').trim().isLength({ min: 2, max: 100 }).withMessage('Last name must be 2-100 characters'),
  body('grade').trim().isLength({ min: 1, max: 50 }).withMessage('Grade is required'),
  body('class_name').optional().trim().isLength({ max: 50 }).withMessage('Class name max 50 characters'),
  body('photo_url').optional().isURL().withMessage('Photo URL must be a valid URL')
];

// Guardian validation rules
export const validateGuardian = [
  body('user_id').isUUID().withMessage('Valid user ID is required'),
  body('student_id').isUUID().withMessage('Valid student ID is required'),
  body('relationship').trim().isLength({ min: 2, max: 50 }).withMessage('Relationship must be 2-50 characters')
];

// QR Code validation rules
export const validateQRCode = [
  body('user_id').isUUID().withMessage('Valid user ID is required'),
  body('student_id').optional().isUUID().withMessage('Valid student ID is required'),
  body('expires_at').optional().isISO8601().withMessage('expires_at must be a valid ISO date')
];

// Pickup validation rules
export const validatePickup = [
  body('student_id').isUUID().withMessage('Valid student ID is required'),
  body('picked_by_user_id').isUUID().withMessage('Valid picker user ID is required'),
  body('verified_by_user_id').isUUID().withMessage('Valid verifier user ID is required'),
  body('qr_code_id').optional().isUUID().withMessage('Valid QR code ID is required'),
  body('notes').optional().trim().isLength({ max: 1000 }).withMessage('Notes max 1000 characters')
];

// Login validation rules
export const validateLogin = [
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
];
