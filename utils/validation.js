const { body, query, validationResult } = require('express-validator');

// Custom validation middleware
const validate = (validations) => {
  return async (req, res, next) => {
    try {
      // Run all validations in parallel
      await Promise.all(validations.map(validation => validation.run(req)));

      const errors = validationResult(req);
      if (errors.isEmpty()) {
        return next();
      }

      // Format errors for consistent response
      const formattedErrors = errors.array().map(error => ({
        field: error.path || error.param,
        message: error.msg,
        value: error.value
      }));

      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: formattedErrors
      });
    } catch (error) {
      console.error('Validation middleware error:', error);
      return res.status(500).json({
        success: false,
        message: 'Validation error',
        error: error.message
      });
    }
  };
};

// User validation rules
const validateUserRegistration = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
  body('password')
    .isLength({ min: 6, max: 128 })
    .withMessage('Password must be between 6 and 128 characters')
    .matches(/^(?=.*[a-zA-Z])(?=.*\d)/)
    .withMessage('Password must contain at least one letter and one number')
];

const validateUserLogin = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
  body('password')
    .notEmpty()
    .withMessage('Password is required')
];

// Task validation rules
const validateTaskCreation = [
  body('title')
    .trim()
    .isLength({ min: 1, max: 255 })
    .withMessage('Title is required and must be between 1 and 255 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Description must be less than 1000 characters'),
  body('status')
    .optional()
    .isIn(['pending', 'completed'])
    .withMessage('Status must be either "pending" or "completed"'),
  body('priority')
    .optional()
    .isIn(['low', 'medium', 'high'])
    .withMessage('Priority must be either "low", "medium", or "high"')
];

const validateTaskUpdate = [
  body('title')
    .optional()
    .trim()
    .isLength({ min: 1, max: 255 })
    .withMessage('Title must be between 1 and 255 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Description must be less than 1000 characters'),
  body('status')
    .optional()
    .isIn(['pending', 'completed'])
    .withMessage('Status must be either "pending" or "completed"'),
  body('priority')
    .optional()
    .isIn(['low', 'medium', 'high'])
    .withMessage('Priority must be either "low", "medium", or "high"')
];

// Query parameter validation
const validatePagination = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100')
];

// Custom validation functions
const validateObjectId = (value) => {
  const id = parseInt(value);
  if (isNaN(id) || id <= 0 || !Number.isInteger(parseFloat(value)) || value.toString().includes('.')) {
    throw new Error('Invalid ID format');
  }
  return true;
};

const validateEmail = (email) => {
  if (!email || typeof email !== 'string') {
    return false;
  }
  // Check for common invalid patterns first
  if (email.includes(' ') || email.startsWith('.') || email.endsWith('.') || email.includes('..')) {
    return false;
  }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const validatePassword = (password) => {
  if (!password || password.length < 6) {
    return { valid: false, message: 'Password must be at least 6 characters long' };
  }
  
  if (password.length > 128) {
    return { valid: false, message: 'Password must be less than 128 characters' };
  }

  if (!/^(?=.*[a-zA-Z])(?=.*\d)/.test(password)) {
    return { valid: false, message: 'Password must contain at least one letter and one number' };
  }

  return { valid: true };
};

// Error response formatter
const formatErrorResponse = (message, errors = []) => {
  return {
    success: false,
    message,
    errors: Array.isArray(errors) ? errors : [errors]
  };
};

// Success response formatter
const formatSuccessResponse = (message, data) => {
  const response = {
    success: true,
    message
  };
  
  if (data !== undefined) {
    response.data = data;
  }
  
  return response;
};

module.exports = {
  validate,
  validateUserRegistration,
  validateUserLogin,
  validateTaskCreation,
  validateTaskUpdate,
  validatePagination,
  validateObjectId,
  validateEmail,
  validatePassword,
  formatErrorResponse,
  formatSuccessResponse
};
