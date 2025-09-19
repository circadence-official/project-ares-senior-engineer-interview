const express = require('express');
const { body, validationResult } = require('express-validator');

const app = express();
app.use(express.json());

// Test the exact validation middleware from the project
const validate = (validations) => {
  return async (req, res, next) => {
    console.log('Validation middleware called');
    console.log('Request body:', req.body);
    console.log('Validations:', validations.length);
    
    try {
      // Run all validations in parallel
      console.log('Running validations...');
      await Promise.all(validations.map(validation => validation.run(req)));
      console.log('Validations completed');

      const errors = validationResult(req);
      console.log('Validation errors:', errors.array());
      
      if (errors.isEmpty()) {
        console.log('No validation errors, calling next()');
        return next();
      }

      // Format errors for consistent response
      const formattedErrors = errors.array().map(error => ({
        field: error.path || error.param,
        message: error.msg,
        value: error.value
      }));

      console.log('Validation failed, returning error response');
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

// Test validation rules (same as in the project)
const validateTaskCreation = [
  body('title')
    .trim()
    .isLength({ min: 1, max: 255 })
    .withMessage('Title must be between 1 and 255 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Description must be less than 1000 characters'),
  body('priority')
    .isIn(['low', 'medium', 'high'])
    .withMessage('Priority must be one of: low, medium, high')
];

// Test route
app.post('/test-validation', validateTaskCreation, validate, (req, res) => {
  console.log('Route handler called');
  res.json({
    success: true,
    message: 'Validation passed',
    data: req.body
  });
});

// Start server
app.listen(3002, () => {
  console.log('Validation test server running on port 3002');
});
