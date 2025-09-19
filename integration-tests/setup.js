const request = require('supertest');
const jwt = require('jsonwebtoken');
const createTestServer = require('./testServer');
const { query, ensureDatabaseInitialized } = require('../utils/database');

// Test utilities for integration tests
class TestHelper {
  constructor() {
    this.app = createTestServer();
    this.baseUrl = 'http://localhost:3000';
  }

  // Create a test user and return auth token
  async createTestUser(userData = {}) {
    const defaultUser = {
      email: 'test@example.com',
      password: 'TestPassword123',
      ...userData
    };

    // Register user
    const response = await request(this.app)
      .post('/api/auth/register')
      .send(defaultUser);

    if (response.status !== 201) {
      throw new Error(`Failed to create test user: ${response.body.message}`);
    }

    // Login to get token
    const loginResponse = await request(this.app)
      .post('/api/auth/login')
      .send({
        email: defaultUser.email,
        password: defaultUser.password
      });

    if (loginResponse.status !== 200) {
      throw new Error(`Failed to login test user: ${loginResponse.body.message}`);
    }

    return {
      user: loginResponse.body.data.user,
      token: loginResponse.body.data.tokens.accessToken,
      refreshToken: loginResponse.body.data.tokens.refreshToken
    };
  }

  // Create a test task
  async createTestTask(authToken, taskData = {}) {
    const defaultTask = {
      title: 'Test Task',
      description: 'Test Description',
      priority: 'medium',
      status: 'pending',
      ...taskData
    };

    const response = await request(this.app)
      .post('/api/tasks')
      .set('Authorization', `Bearer ${authToken}`)
      .send(defaultTask);

    if (response.status !== 201) {
      throw new Error(`Failed to create test task: ${response.body.message}`);
    }

    return response.body.data;
  }

  // Clean up test data
  async cleanup() {
    // Ensure database is initialized before cleanup
    await ensureDatabaseInitialized();
    
    // Clear all tables
    try {
      await query('DELETE FROM tasks');
    } catch (error) {
      // Ignore if tables don't exist yet
    }
    try {
      await query('DELETE FROM users');
    } catch (error) {
      // Ignore if tables don't exist yet
    }
  }

  // Generate a valid JWT token for testing
  generateTestToken(payload = {}) {
    const defaultPayload = {
      userId: 1,
      iat: Math.floor(Date.now() / 1000),
      ...payload
    };
    
    return jwt.sign(defaultPayload, process.env.JWT_SECRET, {
      expiresIn: '1h',
      issuer: 'task-management-api',
      audience: 'task-management-client'
    });
  }

  // Generate an expired JWT token for testing
  generateExpiredToken(payload = {}) {
    const defaultPayload = {
      userId: 1,
      iat: Math.floor(Date.now() / 1000),
      ...payload
    };
    
    return jwt.sign(defaultPayload, process.env.JWT_SECRET, {
      expiresIn: '-1h', // Expired 1 hour ago
      issuer: 'task-management-api',
      audience: 'task-management-client'
    });
  }
}

// Make TestHelper available globally
global.TestHelper = TestHelper;

// Setup for each test file
beforeEach(async () => {
  // Ensure database is initialized before each test
  await ensureDatabaseInitialized();
  
  // Clean up test data
  try {
    await query('DELETE FROM tasks');
    await query('DELETE FROM users');
  } catch (error) {
    // Ignore cleanup errors
  }
});

afterEach(async () => {
  // Clean up test data after each test
  try {
    await query('DELETE FROM tasks');
    await query('DELETE FROM users');
  } catch (error) {
    // Ignore cleanup errors
  }
});
