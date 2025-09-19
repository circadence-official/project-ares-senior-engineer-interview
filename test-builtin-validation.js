const express = require('express');
const { body, validationResult } = require('express-validator');

const app = express();
app.use(express.json());

// Use express-validator's built-in validation middleware
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

// Test route using express-validator's built-in middleware
app.post('/test-builtin', validateTaskCreation, (req, res) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    });
  }
  
  res.json({
    success: true,
    message: 'Built-in validation passed',
    data: req.body
  });
});

// Start server
app.listen(3002, () => {
  console.log('Built-in validation test server running on port 3002');
});
