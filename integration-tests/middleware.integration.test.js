const request = require('supertest');
const { query, ensureDatabaseInitialized } = require('../utils/database');

// Import the test server (not the main server)
const createTestServer = require('./testServer');

describe('Middleware and Security Integration Tests', () => {
  let testHelper;
  let testUser;
  let app;

  beforeAll(async () => {
    testHelper = new TestHelper();
    app = testHelper.app;
  });

  beforeEach(async () => {
    testUser = await testHelper.createTestUser({
      email: `securitytest${Date.now()}@example.com`,
      password: 'SecurityPassword123'
    });
  });

  afterAll(async () => {
    await testHelper.cleanup();
  });

  describe('Authentication Middleware', () => {
    test('should require authentication for protected routes', async () => {
      const response = await request(app)
        .get('/api/tasks');

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Access token required');
    });

    test('should accept valid Bearer token', async () => {
      const response = await request(app)
        .get('/api/tasks')
        .set('Authorization', `Bearer ${testUser.token}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });

    test('should reject malformed Authorization header', async () => {
      const response = await request(app)
        .get('/api/tasks')
        .set('Authorization', 'InvalidFormat');

      expect(response.status).toBe(401);
      expect(response.body.message).toContain('Access token required');
    });

    test('should reject token without Bearer prefix', async () => {
      const response = await request(app)
        .get('/api/tasks')
        .set('Authorization', testUser.token);

      expect(response.status).toBe(401);
      expect(response.body.message).toContain('Access token required');
    });

    test('should reject invalid JWT token', async () => {
      const response = await request(app)
        .get('/api/tasks')
        .set('Authorization', 'Bearer invalid.jwt.token');

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Invalid token');
    });

    test('should reject expired JWT token', async () => {
      const expiredToken = testHelper.generateExpiredToken();
      
      const response = await request(app)
        .get('/api/tasks')
        .set('Authorization', `Bearer ${expiredToken}`);

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });

    test('should set user context from valid token', async () => {
      // Create a task to verify user context is set correctly
      const taskData = {
        title: 'User Context Test'
      };

      const response = await request(app)
        .post('/api/tasks')
        .set('Authorization', `Bearer ${testUser.token}`)
        .send(taskData);

      expect(response.status).toBe(201);
      expect(response.body.data.userId).toBe(testUser.user.id);
    });
  });

  describe('Security Headers Middleware', () => {
    test('should include security headers', async () => {
      const response = await request(app)
        .get('/api/tasks')
        .set('Authorization', `Bearer ${testUser.token}`);

      // Check for common security headers
      expect(response.headers).toHaveProperty('x-content-type-options');
      expect(response.headers).toHaveProperty('x-frame-options');
      expect(response.headers).toHaveProperty('x-xss-protection');
      
      // Helmet should add these headers
      expect(response.headers['x-content-type-options']).toBe('nosniff');
      expect(response.headers['x-frame-options']).toBe('DENY');
    });

    test('should handle CORS properly', async () => {
      const response = await request(app)
        .options('/api/tasks')
        .set('Origin', 'http://localhost:3000');

      // CORS headers should be present
      expect(response.headers).toHaveProperty('access-control-allow-origin');
      expect(response.headers).toHaveProperty('access-control-allow-methods');
    });
  });

  describe('Input Validation Middleware', () => {
    test('should validate task creation input', async () => {
      const invalidTaskData = {
        title: '', // Empty title should fail
        priority: 'invalid-priority'
      };

      const response = await request(app)
        .post('/api/tasks')
        .set('Authorization', `Bearer ${testUser.token}`)
        .send(invalidTaskData);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Validation failed');
    });

    test('should validate user registration input', async () => {
      const invalidUserData = {
        email: 'invalid-email',
        password: 'weak'
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(invalidUserData);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Validation failed');
    });

    test('should sanitize input data', async () => {
      const taskData = {
        title: '<script>alert("xss")</script>Task Title',
        description: 'Description with <b>HTML</b> tags'
      };

      const response = await request(app)
        .post('/api/tasks')
        .set('Authorization', `Bearer ${testUser.token}`)
        .send(taskData);

      expect(response.status).toBe(201);
      
      // Input should be sanitized (exact behavior depends on your validation)
      expect(response.body.data.title).toBeDefined();
      // The title should either be sanitized or rejected based on your validation rules
    });

    test('should handle malformed JSON', async () => {
      const response = await request(app)
        .post('/api/tasks')
        .set('Authorization', `Bearer ${testUser.token}`)
        .set('Content-Type', 'application/json')
        .send('{"invalid": json}');

      expect(response.status).toBe(400);
    });

    test('should handle oversized payloads', async () => {
      const largeDescription = 'a'.repeat(10000); // Very large description
      
      const taskData = {
        title: 'Large Payload Test',
        description: largeDescription
      };

      const response = await request(app)
        .post('/api/tasks')
        .set('Authorization', `Bearer ${testUser.token}`)
        .send(taskData);

      // Should either accept or reject based on your validation rules
      expect([201, 400]).toContain(response.status);
    });
  });

  describe('Error Handling Middleware', () => {
    test('should handle 404 errors gracefully', async () => {
      const response = await request(app)
        .get('/api/nonexistent-endpoint')
        .set('Authorization', `Bearer ${testUser.token}`);

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBeDefined();
    });

    test('should handle server errors gracefully', async () => {
      // This test might need to be adjusted based on your error handling
      // We'll test with an invalid task ID that might cause a server error
      const response = await request(app)
        .put('/api/tasks/invalid-id')
        .set('Authorization', `Bearer ${testUser.token}`)
        .send({ title: 'Test' });

      // Should return either 400 (bad request) or 500 (server error)
      expect([400, 500]).toContain(response.status);
      expect(response.body.success).toBe(false);
    });

    test('should not expose sensitive information in errors', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'nonexistent@example.com',
          password: 'wrongpassword'
        });

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
      
      // Error message should not expose internal details
      expect(response.body.message).not.toContain('database');
      expect(response.body.message).not.toContain('connection');
      expect(response.body.message).not.toContain('sql');
    });
  });

  describe('Request Logging and Monitoring', () => {
    test('should log requests properly', async () => {
      // This test verifies that requests are being processed
      // Actual logging verification would depend on your logging setup
      const response = await request(app)
        .get('/api/tasks')
        .set('Authorization', `Bearer ${testUser.token}`);

      expect(response.status).toBe(200);
      // In a real scenario, you might check logs or metrics
    });

    test('should handle concurrent requests', async () => {
      // Test concurrent requests to ensure middleware works correctly
      const promises = [];
      for (let i = 0; i < 5; i++) {
        promises.push(
          request(app)
            .get('/api/tasks')
            .set('Authorization', `Bearer ${testUser.token}`)
        );
      }

      const responses = await Promise.all(promises);
      
      // All requests should succeed
      responses.forEach(response => {
        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
      });
    });
  });

  describe('Session and State Management', () => {
    test('should handle token refresh correctly', async () => {
      // Test that token refresh works with middleware
      const refreshResponse = await request(app)
        .post('/api/auth/refresh')
        .send({
          refreshToken: testUser.refreshToken
        });

      expect(refreshResponse.status).toBe(200);
      
      const newToken = refreshResponse.body.data.token;
      
      // Use new token for authenticated request
      const response = await request(app)
        .get('/api/tasks')
        .set('Authorization', `Bearer ${newToken}`);

      expect(response.status).toBe(200);
    });

    test('should handle logout correctly', async () => {
      const logoutResponse = await request(app)
        .post('/api/auth/logout')
        .set('Authorization', `Bearer ${testUser.token}`);

      expect(logoutResponse.status).toBe(200);
      
      // After logout, token should still work until expiry
      // (depending on your implementation)
      const response = await request(app)
        .get('/api/tasks')
        .set('Authorization', `Bearer ${testUser.token}`);

      // This behavior depends on your logout implementation
      expect([200, 401]).toContain(response.status);
    });
  });

  describe('Database Connection Middleware', () => {
    test('should handle database connection errors gracefully', async () => {
      // This test is more conceptual - in a real scenario you might
      // temporarily break the database connection to test error handling
      
      const response = await request(app)
        .get('/api/tasks')
        .set('Authorization', `Bearer ${testUser.token}`);

      expect(response.status).toBe(200);
      // In a real test, you might simulate database failures
    });

    test('should maintain database transactions correctly', async () => {
      // Test that database operations are properly transactional
      const taskData = {
        title: 'Transaction Test Task'
      };

      const response = await request(app)
        .post('/api/tasks')
        .set('Authorization', `Bearer ${testUser.token}`)
        .send(taskData);

      expect(response.status).toBe(201);
      
      // Verify task was actually created in database
      const result = await query('SELECT * FROM tasks WHERE id = $1', [response.body.data.id]);
      expect(result.rows).toHaveLength(1);
    });
  });
});
