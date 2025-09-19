const express = require('express');
const { body, validationResult } = require('express-validator');

const app = express();
app.use(express.json());

// Test Promise.all approach
const testPromiseAll = async (req, res) => {
  console.log('=== Testing Promise.all Approach ===');
  console.log('Request body:', req.body);
  
  try {
    const validations = [
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
    
    console.log('Running validations with Promise.all...');
    await Promise.all(validations.map(validation => validation.run(req)));
    console.log('Promise.all completed');
    
    const errors = validationResult(req);
    console.log('Validation errors:', errors.array());
    
    if (errors.isEmpty()) {
      res.json({
        success: true,
        message: 'Promise.all validations passed',
        data: req.body
      });
    } else {
      res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }
    
  } catch (error) {
    console.error('Promise.all validation error:', error);
    res.status(500).json({
      success: false,
      message: 'Validation error',
      error: error.message
    });
  }
};

// Test route
app.post('/test-promise-all', testPromiseAll);

// Start server
app.listen(3002, () => {
  console.log('Promise.all validation test server running on port 3002');
});
