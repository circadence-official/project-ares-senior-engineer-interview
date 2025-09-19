const {
  validateObjectId,
  validateEmail,
  validatePassword,
  formatErrorResponse,
  formatSuccessResponse
} = require('../../utils/validation');

describe('Validation Utilities', () => {
  describe('validateObjectId', () => {
    test('should return true for valid positive integer', () => {
      expect(validateObjectId('123')).toBe(true);
      expect(validateObjectId('1')).toBe(true);
      expect(validateObjectId('999999')).toBe(true);
    });

    test('should throw error for invalid ID format', () => {
      expect(() => validateObjectId('0')).toThrow('Invalid ID format');
      expect(() => validateObjectId('-1')).toThrow('Invalid ID format');
      expect(() => validateObjectId('abc')).toThrow('Invalid ID format');
      expect(() => validateObjectId('12.5')).toThrow('Invalid ID format');
      expect(() => validateObjectId('1.0')).toThrow('Invalid ID format');
      expect(() => validateObjectId('')).toThrow('Invalid ID format');
      expect(() => validateObjectId(null)).toThrow('Invalid ID format');
      expect(() => validateObjectId(undefined)).toThrow('Invalid ID format');
    });

    test('should handle edge cases', () => {
      expect(() => validateObjectId('0')).toThrow('Invalid ID format');
      expect(() => validateObjectId('-123')).toThrow('Invalid ID format');
      expect(() => validateObjectId('1.0')).toThrow('Invalid ID format');
    });
  });

  describe('validateEmail', () => {
    test('should return true for valid emails', () => {
      const validEmails = [
        'test@example.com',
        'user.name@domain.com',
        'user+tag@domain.com',
        'user123@domain123.com',
        'user@sub.domain.com',
        'user@domain.co.uk',
        'user@domain-name.com'
      ];

      validEmails.forEach(email => {
        expect(validateEmail(email)).toBe(true);
      });
    });

    test('should return false for invalid emails', () => {
      const invalidEmails = [
        'invalid-email',
        '@domain.com',
        'user@',
        'user@domain',
        'user..name@domain.com',
        'user@domain..com',
        'user name@domain.com',
        'user@domain com',
        '',
        null,
        undefined
      ];

      invalidEmails.forEach(email => {
        expect(validateEmail(email)).toBe(false);
      });
    });

    test('should handle edge cases', () => {
      expect(validateEmail('a@b.c')).toBe(true);
      expect(validateEmail('a@b.co')).toBe(true);
      expect(validateEmail('a@b.com')).toBe(true);
      expect(validateEmail('a@b.cd')).toBe(true);
    });
  });

  describe('validatePassword', () => {
    test('should return valid for strong passwords', () => {
      const strongPasswords = [
        'ValidPass123',
        'MyPassword1',
        'Secure123',
        'Test1234',
        'Password1',
        'StrongPass9'
      ];

      strongPasswords.forEach(password => {
        const result = validatePassword(password);
        expect(result.valid).toBe(true);
      });
    });

    test('should return invalid for weak passwords', () => {
      const weakPasswords = [
        { password: '12345', expectedMessage: 'at least 6 characters' },
        { password: 'password', expectedMessage: 'letter and one number' },
        { password: '12345678', expectedMessage: 'letter and one number' },
        { password: 'abc', expectedMessage: 'at least 6 characters' },
        { password: 'a'.repeat(129), expectedMessage: 'less than 128 characters' },
        { password: '', expectedMessage: 'at least 6 characters' },
        { password: null, expectedMessage: 'at least 6 characters' }
      ];

      weakPasswords.forEach(testCase => {
        const result = validatePassword(testCase.password);
        expect(result.valid).toBe(false);
        expect(result.message).toContain(testCase.expectedMessage);
      });
    });

    test('should handle boundary cases', () => {
      // Exactly 6 characters with letter and number
      const result1 = validatePassword('Abc123');
      expect(result1.valid).toBe(true);

      // Exactly 128 characters with letter and number
      const result2 = validatePassword('A' + '1'.repeat(127));
      expect(result2.valid).toBe(true);

      // 5 characters (too short)
      const result3 = validatePassword('Abc12');
      expect(result3.valid).toBe(false);
      expect(result3.message).toContain('at least 6 characters');

      // 129 characters (too long)
      const result4 = validatePassword('A' + '1'.repeat(128));
      expect(result4.valid).toBe(false);
      expect(result4.message).toContain('less than 128 characters');
    });

    test('should require both letters and numbers', () => {
      // Only letters
      const result1 = validatePassword('password');
      expect(result1.valid).toBe(false);
      expect(result1.message).toContain('letter and one number');

      // Only numbers
      const result2 = validatePassword('123456');
      expect(result2.valid).toBe(false);
      expect(result2.message).toContain('letter and one number');

      // Mixed case letters and numbers
      const result3 = validatePassword('Password123');
      expect(result3.valid).toBe(true);
    });
  });

  describe('formatErrorResponse', () => {
    test('should format error response with message', () => {
      const response = formatErrorResponse('Test error');
      
      expect(response).toEqual({
        success: false,
        message: 'Test error',
        errors: []
      });
    });

    test('should format error response with message and errors', () => {
      const errors = [
        { field: 'email', message: 'Invalid email' },
        { field: 'password', message: 'Too short' }
      ];
      const response = formatErrorResponse('Validation failed', errors);
      
      expect(response).toEqual({
        success: false,
        message: 'Validation failed',
        errors: errors
      });
    });

    test('should handle single error as array', () => {
      const singleError = { field: 'email', message: 'Invalid email' };
      const response = formatErrorResponse('Validation failed', singleError);
      
      expect(response).toEqual({
        success: false,
        message: 'Validation failed',
        errors: [singleError]
      });
    });

    test('should handle non-array errors', () => {
      const response = formatErrorResponse('Test error', 'not an array');
      
      expect(response).toEqual({
        success: false,
        message: 'Test error',
        errors: ['not an array']
      });
    });

    test('should handle null errors', () => {
      const response = formatErrorResponse('Test error', null);
      
      expect(response).toEqual({
        success: false,
        message: 'Test error',
        errors: [null]
      });
    });
  });

  describe('formatSuccessResponse', () => {
    test('should format success response with message only', () => {
      const response = formatSuccessResponse('Operation successful');
      
      expect(response).toEqual({
        success: true,
        message: 'Operation successful'
      });
    });

    test('should format success response with message and data', () => {
      const data = { id: 1, name: 'Test' };
      const response = formatSuccessResponse('Operation successful', data);
      
      expect(response).toEqual({
        success: true,
        message: 'Operation successful',
        data: data
      });
    });

    test('should format success response with null data', () => {
      const response = formatSuccessResponse('Operation successful', null);
      
      expect(response).toEqual({
        success: true,
        message: 'Operation successful',
        data: null
      });
    });

    test('should format success response with undefined data', () => {
      const response = formatSuccessResponse('Operation successful', undefined);
      
      expect(response).toEqual({
        success: true,
        message: 'Operation successful',
        data: undefined
      });
    });

    test('should format success response with complex data', () => {
      const data = {
        user: { id: 1, email: 'test@example.com' },
        tasks: [
          { id: 1, title: 'Task 1' },
          { id: 2, title: 'Task 2' }
        ],
        pagination: { page: 1, limit: 10, total: 2 }
      };
      const response = formatSuccessResponse('Data retrieved successfully', data);
      
      expect(response).toEqual({
        success: true,
        message: 'Data retrieved successfully',
        data: data
      });
    });
  });
});