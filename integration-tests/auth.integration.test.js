const request = require('supertest');
const { query, ensureDatabaseInitialized } = require('../utils/database');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

// Import the test server (not the main server)
const createTestServer = require('./testServer');

describe('Authentication Integration Tests', () => {
  let testHelper;
  let app;

  beforeAll(() => {
    testHelper = new TestHelper();
    app = testHelper.app;
  });

  afterAll(async () => {
    await testHelper.cleanup();
  });

  describe('POST /api/auth/register', () => {
    test('should register a new user successfully', async () => {
      const userData = {
        email: 'newuser@example.com',
        password: 'SecurePassword123'
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData);

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('User registered successfully');
      expect(response.body.data).toBeDefined();
      expect(response.body.data.user).toBeDefined();
      expect(response.body.data.user.email).toBe(userData.email);
      expect(response.body.data.user.id).toBeDefined();
      expect(response.body.data.user.password).toBeUndefined(); // Password should not be returned
    });

    test('should reject registration with invalid email', async () => {
      const userData = {
        email: 'invalid-email',
        password: 'SecurePassword123'
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Validation failed');
    });

    test('should reject registration with weak password', async () => {
      const userData = {
        email: 'test@example.com',
        password: 'weak'
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Validation failed');
    });

    test('should reject duplicate email registration', async () => {
      const userData = {
        email: 'duplicate@example.com',
        password: 'SecurePassword123'
      };

      // First registration should succeed
      const firstResponse = await request(app)
        .post('/api/auth/register')
        .send(userData);

      expect(firstResponse.status).toBe(201);

      // Second registration with same email should fail
      const secondResponse = await request(app)
        .post('/api/auth/register')
        .send(userData);

      expect(secondResponse.status).toBe(409);
      expect(secondResponse.body.success).toBe(false);
      expect(secondResponse.body.message).toContain('already exists');
    });

    test('should hash password securely', async () => {
      const userData = {
        email: 'passwordtest@example.com',
        password: 'TestPassword123'
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData);

      expect(response.status).toBe(201);

      // Verify password is hashed in database
      const result = await query('SELECT password FROM users WHERE email = $1', [userData.email]);
      
      expect(result.rows).toHaveLength(1);
      const storedPassword = result.rows[0].password;
      
      // Password should be hashed (not plain text)
      expect(storedPassword).not.toBe(userData.password);
      expect(storedPassword.length).toBeGreaterThan(50); // bcrypt hashes are long
      
      // Verify password can be verified
      const isValid = await bcrypt.compare(userData.password, storedPassword);
      expect(isValid).toBe(true);
    });
  });

  describe('POST /api/auth/login', () => {
    let testUser;

    beforeEach(async () => {
      // Create a test user for login tests
      testUser = await testHelper.createTestUser({
        email: 'logintest@example.com',
        password: 'LoginPassword123'
      });
    });

    test('should login with valid credentials', async () => {
      const loginData = {
        email: 'logintest@example.com',
        password: 'LoginPassword123'
      };

      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Login successful');
      expect(response.body.data).toBeDefined();
      expect(response.body.data.user).toBeDefined();
      expect(response.body.data.token).toBeDefined();
      expect(response.body.data.refreshToken).toBeDefined();
      
      // Verify token is valid
      const decoded = jwt.verify(response.body.data.token, process.env.JWT_SECRET || 'test-secret');
      expect(decoded.userId).toBe(testUser.user.id);
    });

    test('should reject login with invalid email', async () => {
      const loginData = {
        email: 'nonexistent@example.com',
        password: 'LoginPassword123'
      };

      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData);

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Invalid credentials');
    });

    test('should reject login with invalid password', async () => {
      const loginData = {
        email: 'logintest@example.com',
        password: 'WrongPassword123'
      };

      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData);

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Invalid credentials');
    });

    test('should reject login with missing fields', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({});

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Validation failed');
    });
  });

  describe('POST /api/auth/refresh', () => {
    let testUser;

    beforeEach(async () => {
      testUser = await testHelper.createTestUser({
        email: 'refreshtest@example.com',
        password: 'RefreshPassword123'
      });
    });

    test('should refresh token with valid refresh token', async () => {
      const response = await request(app)
        .post('/api/auth/refresh')
        .send({
          refreshToken: testUser.refreshToken
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Token refreshed successfully');
      expect(response.body.data.token).toBeDefined();
      expect(response.body.data.refreshToken).toBeDefined();
      
      // New token should be different from original
      expect(response.body.data.token).not.toBe(testUser.token);
    });

    test('should reject refresh with invalid token', async () => {
      const response = await request(app)
        .post('/api/auth/refresh')
        .send({
          refreshToken: 'invalid-refresh-token'
        });

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Invalid refresh token');
    });

    test('should reject refresh with expired token', async () => {
      const expiredToken = testHelper.generateExpiredToken();
      
      const response = await request(app)
        .post('/api/auth/refresh')
        .send({
          refreshToken: expiredToken
        });

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });
  });

  describe('POST /api/auth/logout', () => {
    let testUser;

    beforeEach(async () => {
      testUser = await testHelper.createTestUser({
        email: 'logouttest@example.com',
        password: 'LogoutPassword123'
      });
    });

    test('should logout successfully with valid token', async () => {
      const response = await request(app)
        .post('/api/auth/logout')
        .set('Authorization', `Bearer ${testUser.token}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Logout successful');
    });

    test('should reject logout without token', async () => {
      const response = await request(app)
        .post('/api/auth/logout');

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Access token required');
    });

    test('should reject logout with invalid token', async () => {
      const response = await request(app)
        .post('/api/auth/logout')
        .set('Authorization', 'Bearer invalid-token');

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Invalid token');
    });
  });

  describe('JWT Token Validation', () => {
    test('should validate JWT token structure', () => {
      const token = testHelper.generateTestToken({ userId: 123 });
      
      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
      
      // JWT tokens have 3 parts separated by dots
      const parts = token.split('.');
      expect(parts).toHaveLength(3);
    });

    test('should decode JWT token correctly', () => {
      const payload = { userId: 456, email: 'test@example.com' };
      const token = testHelper.generateTestToken(payload);
      
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'test-secret');
      expect(decoded.userId).toBe(payload.userId);
      expect(decoded.email).toBe(payload.email);
    });

    test('should handle expired tokens', () => {
      const expiredToken = testHelper.generateExpiredToken();
      
      expect(() => {
        jwt.verify(expiredToken, process.env.JWT_SECRET || 'test-secret');
      }).toThrow();
    });
  });

  describe('Password Security', () => {
    test('should use different salts for same password', async () => {
      const password = 'SamePassword123';
      
      const user1Data = {
        email: 'user1@example.com',
        password: password
      };
      
      const user2Data = {
        email: 'user2@example.com',
        password: password
      };

      // Register both users
      await request(app).post('/api/auth/register').send(user1Data);
      await request(app).post('/api/auth/register').send(user2Data);

      // Get stored passwords
      const result1 = await query('SELECT password FROM users WHERE email = $1', [user1Data.email]);
      const result2 = await query('SELECT password FROM users WHERE email = $1', [user2Data.email]);

      const hash1 = result1.rows[0].password;
      const hash2 = result2.rows[0].password;

      // Same password should produce different hashes (due to salt)
      expect(hash1).not.toBe(hash2);
      
      // But both should verify correctly
      const isValid1 = await bcrypt.compare(password, hash1);
      const isValid2 = await bcrypt.compare(password, hash2);
      
      expect(isValid1).toBe(true);
      expect(isValid2).toBe(true);
    });
  });
});
