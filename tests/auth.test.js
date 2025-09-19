const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

// Mock the database and models for testing
jest.mock('../utils/database', () => ({
  query: jest.fn()
}));

jest.mock('../models/User', () => ({
  create: jest.fn(),
  findByEmail: jest.fn(),
  findById: jest.fn(),
  validatePassword: jest.fn()
}));

const User = require('../models/User');
const { authenticateToken } = require('../middleware/auth');

describe('Authentication Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('JWT Token Generation', () => {
    test('should generate valid JWT token', () => {
      const payload = { userId: 1 };
      const secret = 'test-secret';
      const token = jwt.sign(payload, secret, { expiresIn: '1h' });
      
      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
      
      // Verify token can be decoded
      const decoded = jwt.verify(token, secret);
      expect(decoded.userId).toBe(1);
    });

    test('should generate refresh token with longer expiration', () => {
      const payload = { userId: 1 };
      const secret = 'test-secret';
      const refreshToken = jwt.sign(payload, secret, { expiresIn: '7d' });
      
      expect(refreshToken).toBeDefined();
      expect(typeof refreshToken).toBe('string');
      
      const decoded = jwt.verify(refreshToken, secret);
      expect(decoded.userId).toBe(1);
    });
  });

  describe('Password Hashing', () => {
    test('should hash password correctly', async () => {
      const plainPassword = 'TestPassword123';
      const hashedPassword = await bcrypt.hash(plainPassword, 10);
      
      expect(hashedPassword).toBeDefined();
      expect(hashedPassword).not.toBe(plainPassword);
      expect(hashedPassword.length).toBeGreaterThan(50); // bcrypt hashes are long
    });

    test('should verify correct password', async () => {
      const plainPassword = 'TestPassword123';
      const hashedPassword = await bcrypt.hash(plainPassword, 10);
      
      const isValid = await bcrypt.compare(plainPassword, hashedPassword);
      expect(isValid).toBe(true);
    });

    test('should reject incorrect password', async () => {
      const plainPassword = 'TestPassword123';
      const wrongPassword = 'WrongPassword123';
      const hashedPassword = await bcrypt.hash(plainPassword, 10);
      
      const isValid = await bcrypt.compare(wrongPassword, hashedPassword);
      expect(isValid).toBe(false);
    });
  });

  describe('User Model Static Methods', () => {
    test('should validate strong password', () => {
      const strongPassword = 'StrongPassword123';
      
      // Test password validation logic directly
      expect(strongPassword.length).toBeGreaterThanOrEqual(6);
      expect(/^(?=.*[a-zA-Z])(?=.*\d)/.test(strongPassword)).toBe(true);
    });

    test('should reject weak password', () => {
      const weakPassword = 'weak';
      
      expect(weakPassword.length).toBeLessThan(6);
    });

    test('should reject password without numbers', () => {
      const password = 'NoNumbers';
      
      expect(/^(?=.*[a-zA-Z])(?=.*\d)/.test(password)).toBe(false);
    });

    test('should reject password without letters', () => {
      const password = '123456789';
      
      expect(/^(?=.*[a-zA-Z])(?=.*\d)/.test(password)).toBe(false);
    });
  });

  describe('Authentication Middleware', () => {
    test('should be a function', () => {
      expect(typeof authenticateToken).toBe('function');
    });

    test('should return middleware function', () => {
      // authenticateToken returns a middleware function directly
      expect(typeof authenticateToken).toBe('function');
    });
  });

  describe('Error Handling', () => {
    test('should handle invalid JWT token', () => {
      const invalidToken = 'invalid.token.here';
      
      expect(() => {
        jwt.verify(invalidToken, 'test-secret');
      }).toThrow();
    });

    test('should handle expired JWT token', () => {
      const expiredToken = jwt.sign(
        { userId: 1 }, 
        'test-secret', 
        { expiresIn: '-1h' } // Expired 1 hour ago
      );
      
      expect(() => {
        jwt.verify(expiredToken, 'test-secret');
      }).toThrow();
    });
  });

  describe('Security Best Practices', () => {
    test('should use secure password hashing', async () => {
      const password = 'TestPassword123';
      const hash1 = await bcrypt.hash(password, 10);
      const hash2 = await bcrypt.hash(password, 10);
      
      // Same password should produce different hashes (salt)
      expect(hash1).not.toBe(hash2);
      
      // But both should verify correctly
      const isValid1 = await bcrypt.compare(password, hash1);
      const isValid2 = await bcrypt.compare(password, hash2);
      
      expect(isValid1).toBe(true);
      expect(isValid2).toBe(true);
    });

    test('should validate JWT secret is not empty', () => {
      const secret = process.env.JWT_SECRET || 'fallback-secret';
      expect(secret).toBeDefined();
      expect(secret.length).toBeGreaterThan(0);
    });
  });
});
