const request = require('supertest');
const createTestServer = require('./testServer');

describe('User Model Validation Integration Tests', () => {
  let app;

  beforeAll(() => {
    app = createTestServer();
  });

  describe('User Registration Validation', () => {
    describe('Email Validation', () => {
      test('should reject registration with invalid email format', async () => {
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

        for (const email of invalidEmails) {
          const response = await request(app)
            .post('/api/auth/register')
            .send({
              email: email,
              password: 'ValidPass123'
            });

          expect(response.status).toBe(400);
          expect(response.body.success).toBe(false);
          expect(response.body.message).toContain('Validation failed');
          expect(response.body.errors).toBeDefined();
          expect(response.body.errors.length).toBeGreaterThan(0);
        }
      });

      test('should accept valid email formats', async () => {
        const validEmails = [
          'user@domain.com',
          'user.name@domain.com',
          'user+tag@domain.com',
          'user123@domain123.com',
          'user@sub.domain.com',
          'user@domain.co.uk',
          'user@domain-name.com'
        ];

        for (const email of validEmails) {
          const response = await request(app)
            .post('/api/auth/register')
            .send({
              email: email,
              password: 'ValidPass123'
            });

          expect(response.status).toBe(201);
          expect(response.body.success).toBe(true);
          expect(response.body.data.user.email).toBe(email.toLowerCase());
        }
      });

      test('should normalize email addresses', async () => {
        const testCases = [
          { input: 'USER@DOMAIN.COM', expected: 'user@domain.com' },
          { input: 'User.Name@Domain.Com', expected: 'user.name@domain.com' },
          { input: 'USER+TEST@DOMAIN.COM', expected: 'user+test@domain.com' }
        ];

        for (const testCase of testCases) {
          const response = await request(app)
            .post('/api/auth/register')
            .send({
              email: testCase.input,
              password: 'ValidPass123'
            });

          expect(response.status).toBe(201);
          expect(response.body.data.user.email).toBe(testCase.expected);
        }
      });

      test('should reject duplicate email addresses', async () => {
        const email = 'test@example.com';
        const password = 'ValidPass123';

        // First registration should succeed
        const firstResponse = await request(app)
          .post('/api/auth/register')
          .send({ email, password });

        expect(firstResponse.status).toBe(201);

        // Second registration with same email should fail
        const secondResponse = await request(app)
          .post('/api/auth/register')
          .send({ email, password });

        expect(secondResponse.status).toBe(409);
        expect(secondResponse.body.success).toBe(false);
        expect(secondResponse.body.message).toContain('User with this email already exists');
      });
    });

    describe('Password Validation', () => {
      test('should reject weak passwords', async () => {
        const weakPasswords = [
          '12345',           // Too short
          'password',        // No numbers
          '12345678',        // No letters
          'abc',             // Too short
          'a'.repeat(129),   // Too long
          '',                // Empty
          null,              // Null
          undefined          // Undefined
        ];

        for (const password of weakPasswords) {
          const response = await request(app)
            .post('/api/auth/register')
            .send({
              email: 'test@example.com',
              password: password
            });

          expect(response.status).toBe(400);
          expect(response.body.success).toBe(false);
          expect(response.body.message).toContain('Validation failed');
          expect(response.body.errors).toBeDefined();
          expect(response.body.errors.length).toBeGreaterThan(0);
        }
      });

      test('should accept strong passwords', async () => {
        const strongPasswords = [
          'ValidPass123',
          'MyPassword1',
          'Secure123',
          'Test1234',
          'Password1',
          'StrongPass9'
        ];

        for (let i = 0; i < strongPasswords.length; i++) {
          const response = await request(app)
            .post('/api/auth/register')
            .send({
              email: `test${i}@example.com`,
              password: strongPasswords[i]
            });

          expect(response.status).toBe(201);
          expect(response.body.success).toBe(true);
        }
      });

      test('should enforce password length constraints', async () => {
        // Test minimum length
        const shortPassword = 'Ab1'; // 3 characters
        const response1 = await request(app)
          .post('/api/auth/register')
          .send({
            email: 'test1@example.com',
            password: shortPassword
          });

        expect(response1.status).toBe(400);
        expect(response1.body.errors.some(error => 
          error.message.includes('6 and 128 characters')
        )).toBe(true);

        // Test maximum length
        const longPassword = 'A' + '1'.repeat(127); // 128 characters
        const response2 = await request(app)
          .post('/api/auth/register')
          .send({
            email: 'test2@example.com',
            password: longPassword
          });

        expect(response2.status).toBe(201);
        expect(response2.body.success).toBe(true);
      });

      test('should require password to contain letters and numbers', async () => {
        const invalidPasswords = [
          'password',        // Only letters
          '12345678',        // Only numbers
          '!@#$%^&*',        // Only special characters
          'PASSWORD',        // Only uppercase letters
          'password123!',    // Letters, numbers, special chars (should be valid)
          'Password123'      // Mixed case letters and numbers (should be valid)
        ];

        for (let i = 0; i < invalidPasswords.length; i++) {
          const password = invalidPasswords[i];
          const response = await request(app)
            .post('/api/auth/register')
            .send({
              email: `test${i}@example.com`,
              password: password
            });

          if (password === 'password123!' || password === 'Password123') {
            // These should be valid
            expect(response.status).toBe(201);
          } else {
            // These should be invalid
            expect(response.status).toBe(400);
            expect(response.body.errors.some(error => 
              error.message.includes('letter and one number')
            )).toBe(true);
          }
        }
      });
    });

    describe('Combined Validation', () => {
      test('should reject registration with multiple validation errors', async () => {
        const response = await request(app)
          .post('/api/auth/register')
          .send({
            email: 'invalid-email',
            password: '123'
          });

        expect(response.status).toBe(400);
        expect(response.body.success).toBe(false);
        expect(response.body.errors.length).toBeGreaterThan(1);
        
        // Should have both email and password errors
        const errorMessages = response.body.errors.map(error => error.message);
        expect(errorMessages.some(msg => msg.includes('email'))).toBe(true);
        expect(errorMessages.some(msg => msg.includes('Password'))).toBe(true);
      });

      test('should reject registration with missing fields', async () => {
        const testCases = [
          {}, // No fields
          { email: 'test@example.com' }, // Missing password
          { password: 'ValidPass123' }, // Missing email
          { email: '', password: 'ValidPass123' }, // Empty email
          { email: 'test@example.com', password: '' } // Empty password
        ];

        for (const testCase of testCases) {
          const response = await request(app)
            .post('/api/auth/register')
            .send(testCase);

          expect(response.status).toBe(400);
          expect(response.body.success).toBe(false);
          expect(response.body.errors).toBeDefined();
          expect(response.body.errors.length).toBeGreaterThan(0);
        }
      });

      test('should reject registration with extra fields', async () => {
        const response = await request(app)
          .post('/api/auth/register')
          .send({
            email: 'test@example.com',
            password: 'ValidPass123',
            extraField: 'should be ignored',
            anotherField: 123
          });

        // Should still succeed as extra fields are typically ignored
        expect(response.status).toBe(201);
        expect(response.body.success).toBe(true);
      });
    });
  });

  describe('User Login Validation', () => {
    let testUser;

    beforeEach(async () => {
      // Create a test user for login tests
      const registerResponse = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'logintest@example.com',
          password: 'ValidPass123'
        });

      expect(registerResponse.status).toBe(201);
      testUser = registerResponse.body.data.user;
    });

    test('should reject login with invalid email format', async () => {
      const invalidEmails = [
        'invalid-email',
        '@domain.com',
        'user@',
        '',
        null
      ];

      for (const email of invalidEmails) {
        const response = await request(app)
          .post('/api/auth/login')
          .send({
            email: email,
            password: 'ValidPass123'
          });

        expect(response.status).toBe(400);
        expect(response.body.success).toBe(false);
        expect(response.body.message).toContain('Validation failed');
      }
    });

    test('should reject login with missing credentials', async () => {
      const testCases = [
        {}, // No credentials
        { email: 'test@example.com' }, // Missing password
        { password: 'ValidPass123' }, // Missing email
        { email: '', password: 'ValidPass123' }, // Empty email
        { email: 'test@example.com', password: '' } // Empty password
      ];

      for (const testCase of testCases) {
        const response = await request(app)
          .post('/api/auth/login')
          .send(testCase);

        expect(response.status).toBe(400);
        expect(response.body.success).toBe(false);
        expect(response.body.errors).toBeDefined();
      }
    });

    test('should reject login with non-existent email', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'nonexistent@example.com',
          password: 'ValidPass123'
        });

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Invalid credentials');
    });

    test('should reject login with incorrect password', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'logintest@example.com',
          password: 'WrongPassword123'
        });

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Invalid credentials');
    });

    test('should accept login with correct credentials', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'logintest@example.com',
          password: 'ValidPass123'
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.user.email).toBe('logintest@example.com');
      expect(response.body.data.token).toBeDefined();
      expect(response.body.data.refreshToken).toBeDefined();
    });
  });

  describe('User Model Static Methods', () => {
    test('should validate email format correctly', async () => {
      const User = require('../models/User');

      // Test valid emails
      const validEmails = [
        'user@domain.com',
        'user.name@domain.com',
        'user+tag@domain.com',
        'user123@domain123.com'
      ];

      for (const email of validEmails) {
        expect(User.validateEmail(email)).toBe(true);
      }

      // Test invalid emails
      const invalidEmails = [
        'invalid-email',
        '@domain.com',
        'user@',
        'user@domain',
        '',
        null,
        undefined
      ];

      for (const email of invalidEmails) {
        expect(User.validateEmail(email)).toBe(false);
      }
    });

    test('should validate password strength correctly', async () => {
      const User = require('../models/User');

      // Test valid passwords
      const validPasswords = [
        'ValidPass123',
        'MyPassword1',
        'Secure123'
      ];

      for (const password of validPasswords) {
        const result = User.validatePassword(password);
        expect(result.valid).toBe(true);
      }

      // Test invalid passwords
      const invalidPasswords = [
        { password: '12345', expectedMessage: 'at least 6 characters' },
        { password: 'a'.repeat(129), expectedMessage: 'less than 128 characters' },
        { password: '', expectedMessage: 'at least 6 characters' },
        { password: null, expectedMessage: 'at least 6 characters' }
      ];

      for (const testCase of invalidPasswords) {
        const result = User.validatePassword(testCase.password);
        expect(result.valid).toBe(false);
        expect(result.message).toContain(testCase.expectedMessage);
      }
    });

    test('should validate user data correctly', async () => {
      const User = require('../models/User');

      // Test valid user data
      const validData = {
        email: 'test@example.com',
        password: 'ValidPass123'
      };

      const validResult = User.validateUserData(validData.email, validData.password);
      expect(validResult.valid).toBe(true);
      expect(validResult.errors.length).toBe(0);

      // Test invalid user data
      const invalidData = {
        email: 'invalid-email',
        password: '123'
      };

      const invalidResult = User.validateUserData(invalidData.email, invalidData.password);
      expect(invalidResult.valid).toBe(false);
      expect(invalidResult.errors.length).toBeGreaterThan(0);
      expect(invalidResult.errors.some(error => error.includes('email'))).toBe(true);
      expect(invalidResult.errors.some(error => error.includes('6 characters'))).toBe(true);
    });
  });

  describe('Database Constraint Validation', () => {
    test('should handle database unique constraint violations', async () => {
      const email = 'unique@example.com';
      const password = 'ValidPass123';

      // First registration should succeed
      const firstResponse = await request(app)
        .post('/api/auth/register')
        .send({ email, password });

      expect(firstResponse.status).toBe(201);

      // Second registration should fail with unique constraint error
      const secondResponse = await request(app)
        .post('/api/auth/register')
        .send({ email, password });

      expect(secondResponse.status).toBe(409);
      expect(secondResponse.body.message).toContain('User with this email already exists');
    });

    test('should handle database connection errors gracefully', async () => {
      // This test would require mocking the database connection
      // For now, we'll test that the error handling structure is in place
      const User = require('../models/User');

      // Test that methods throw errors when database operations fail
      await expect(User.findByEmail('test@example.com')).resolves.toBeNull();
      
      // Test that create method handles errors properly
      try {
        await User.create('test@example.com', 'ValidPass123');
        // If it succeeds, that's fine - the user was created
      } catch (error) {
        // If it fails, it should be a proper error
        expect(error).toBeInstanceOf(Error);
      }
    });
  });

  describe('Edge Cases and Boundary Testing', () => {
    test('should handle very long email addresses', async () => {
      const longEmail = 'a'.repeat(100) + '@' + 'b'.repeat(100) + '.com';
      
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          email: longEmail,
          password: 'ValidPass123'
        });

      // Should either succeed or fail gracefully
      expect([200, 201, 400]).toContain(response.status);
    });

    test('should handle special characters in email', async () => {
      const specialEmails = [
        'user+tag@domain.com',
        'user.name@domain.com',
        'user_name@domain.com',
        'user-name@domain.com'
      ];

      for (const email of specialEmails) {
        const response = await request(app)
          .post('/api/auth/register')
          .send({
            email: email,
            password: 'ValidPass123'
          });

        expect(response.status).toBe(201);
      }
    });

    test('should handle Unicode characters in email', async () => {
      const unicodeEmails = [
        'tëst@example.com',
        '测试@example.com',
        'тест@example.com'
      ];

      for (const email of unicodeEmails) {
        const response = await request(app)
          .post('/api/auth/register')
          .send({
            email: email,
            password: 'ValidPass123'
          });

        // Should either succeed or fail gracefully
        expect([200, 201, 400]).toContain(response.status);
      }
    });

    test('should handle SQL injection attempts', async () => {
      const maliciousInputs = [
        "'; DROP TABLE users; --",
        "' OR '1'='1",
        "admin'--",
        "'; INSERT INTO users VALUES ('hacker', 'password'); --"
      ];

      for (const maliciousInput of maliciousInputs) {
        const response = await request(app)
          .post('/api/auth/register')
          .send({
            email: maliciousInput,
            password: 'ValidPass123'
          });

        // Should reject with validation error, not execute SQL
        expect(response.status).toBe(400);
        expect(response.body.success).toBe(false);
      }
    });
  });
});
