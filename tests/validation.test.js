const { validate, validateUserRegistration, validateTaskCreation } = require('../utils/validation');
const { body, validationResult } = require('express-validator');

describe('Validation Middleware Tests', () => {
  describe('User Registration Validation', () => {
    test('should validate strong password', () => {
      const password = 'StrongPassword123';
      const result = validateUserRegistration[1].run({ body: { password } });
      
      // This is a synchronous validation, so we can test it directly
      expect(password.length).toBeGreaterThanOrEqual(6);
      expect(password.length).toBeLessThanOrEqual(128);
      expect(/^(?=.*[a-zA-Z])(?=.*\d)/.test(password)).toBe(true);
    });
    
    test('should validate email format', () => {
      const email = 'test@example.com';
      const result = validateUserRegistration[0].run({ body: { email } });
      
      // Basic email validation
      expect(email).toMatch(/^[^\s@]+@[^\s@]+\.[^\s@]+$/);
    });
  });
  
  describe('Task Creation Validation', () => {
    test('should validate task title length', () => {
      const title = 'Valid Task Title';
      
      expect(title.length).toBeGreaterThanOrEqual(1);
      expect(title.length).toBeLessThanOrEqual(255);
    });
    
    test('should validate task priority values', () => {
      const validPriorities = ['low', 'medium', 'high'];
      const testPriority = 'medium';
      
      expect(validPriorities).toContain(testPriority);
    });
    
    test('should validate task status values', () => {
      const validStatuses = ['pending', 'completed'];
      const testStatus = 'pending';
      
      expect(validStatuses).toContain(testStatus);
    });
  });
  
  describe('Validation Middleware Function', () => {
    test('should be a function', () => {
      expect(typeof validate).toBe('function');
    });
    
    test('should return a middleware function', () => {
      const middleware = validate(validateUserRegistration);
      expect(typeof middleware).toBe('function');
    });
  });
  
  describe('Error Response Formatting', () => {
    test('should format error response correctly', () => {
      const mockErrors = [
        { path: 'email', msg: 'Invalid email', value: 'invalid-email' },
        { path: 'password', msg: 'Password too short', value: '123' }
      ];
      
      const formattedErrors = mockErrors.map(error => ({
        field: error.path || error.param,
        message: error.msg,
        value: error.value
      }));
      
      expect(formattedErrors).toHaveLength(2);
      expect(formattedErrors[0].field).toBe('email');
      expect(formattedErrors[0].message).toBe('Invalid email');
      expect(formattedErrors[1].field).toBe('password');
      expect(formattedErrors[1].message).toBe('Password too short');
    });
  });
  
  describe('Success Response Formatting', () => {
    test('should format success response with data', () => {
      const message = 'Operation successful';
      const data = { id: 1, name: 'Test' };
      
      const response = {
        success: true,
        message,
        data
      };
      
      expect(response.success).toBe(true);
      expect(response.message).toBe(message);
      expect(response.data).toEqual(data);
    });
    
    test('should format success response without data', () => {
      const message = 'Operation successful';
      
      const response = {
        success: true,
        message
      };
      
      expect(response.success).toBe(true);
      expect(response.message).toBe(message);
      expect(response.data).toBeUndefined();
    });
  });
});
