const express = require('express');
const { body, validationResult } = require('express-validator');

const app = express();
app.use(express.json());

// Test individual validation rules
const testValidation = async (req, res) => {
  console.log('=== Testing Individual Validation Rules ===');
  console.log('Request body:', req.body);
  
  try {
    // Test title validation
    console.log('Testing title validation...');
    const titleValidation = body('title')
      .trim()
      .isLength({ min: 1, max: 255 })
      .withMessage('Title must be between 1 and 255 characters');
    
    await titleValidation.run(req);
    console.log('Title validation completed');
    
    // Test description validation
    console.log('Testing description validation...');
    const descriptionValidation = body('description')
      .optional()
      .trim()
      .isLength({ max: 1000 })
      .withMessage('Description must be less than 1000 characters');
    
    await descriptionValidation.run(req);
    console.log('Description validation completed');
    
    // Test priority validation
    console.log('Testing priority validation...');
    const priorityValidation = body('priority')
      .isIn(['low', 'medium', 'high'])
      .withMessage('Priority must be one of: low, medium, high');
    
    await priorityValidation.run(req);
    console.log('Priority validation completed');
    
    // Check results
    const errors = validationResult(req);
    console.log('Validation errors:', errors.array());
    
    if (errors.isEmpty()) {
      res.json({
        success: true,
        message: 'All validations passed',
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
    console.error('Validation error:', error);
    res.status(500).json({
      success: false,
      message: 'Validation error',
      error: error.message
    });
  }
};

// Test route
app.post('/test-individual', testValidation);

// Start server
app.listen(3002, () => {
  console.log('Individual validation test server running on port 3002');
});
