const request = require('supertest');
const jwt = require('jsonwebtoken');

// Import the actual server
const app = require('../server');

describe('Task CRUD Integration Tests', () => {
  let authToken;
  let userId;
  let createdTaskId;

  beforeAll(async () => {
    // Register a test user and get auth token
    const registerResponse = await request(app)
      .post('/api/auth/register')
      .send({
        email: 'crudtest@example.com',
        password: 'TestPassword123'
      });

    expect(registerResponse.status).toBe(201);
    authToken = registerResponse.body.data.tokens.accessToken;
    userId = registerResponse.body.data.user.id;
  });

  describe('CREATE - Task Creation Integration', () => {
    test('should create a new task with all fields', async () => {
      const taskData = {
        title: 'Integration Test Task',
        description: 'This is a test task for integration testing',
        priority: 'high',
        status: 'pending'
      };

      const response = await request(app)
        .post('/api/tasks')
        .set('Authorization', `Bearer ${authToken}`)
        .send(taskData);

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Task created successfully');
      expect(response.body.data).toBeDefined();
      expect(response.body.data.title).toBe(taskData.title);
      expect(response.body.data.description).toBe(taskData.description);
      expect(response.body.data.priority).toBe(taskData.priority);
      expect(response.body.data.status).toBe(taskData.status);
      expect(response.body.data.userId).toBe(userId);
      expect(response.body.data.id).toBeDefined();

      createdTaskId = response.body.data.id;
    });

    test('should create a task with minimal data', async () => {
      const taskData = {
        title: 'Minimal Task'
      };

      const response = await request(app)
        .post('/api/tasks')
        .set('Authorization', `Bearer ${authToken}`)
        .send(taskData);

      expect(response.status).toBe(201);
      expect(response.body.data.title).toBe(taskData.title);
      expect(response.body.data.priority).toBe('medium'); // Default value
      expect(response.body.data.status).toBe('pending'); // Default value
    });

    test('should reject task creation with invalid data', async () => {
      const invalidTaskData = {
        title: '', // Empty title
        priority: 'invalid', // Invalid priority
        status: 'invalid' // Invalid status
      };

      const response = await request(app)
        .post('/api/tasks')
        .set('Authorization', `Bearer ${authToken}`)
        .send(invalidTaskData);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Validation failed');
      expect(response.body.errors).toBeDefined();
      expect(response.body.errors.length).toBeGreaterThan(0);
    });

    test('should require authentication for task creation', async () => {
      const response = await request(app)
        .post('/api/tasks')
        .send({ title: 'Unauthorized Task' });

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Access token required');
    });
  });

  describe('READ - Task Retrieval Integration', () => {
    test('should retrieve all tasks for user', async () => {
      const response = await request(app)
        .get('/api/tasks')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBeGreaterThan(0);
      expect(response.body.pagination).toBeDefined();
    });

    test('should retrieve tasks with pagination', async () => {
      const response = await request(app)
        .get('/api/tasks?page=1&limit=5')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.pagination).toBeDefined();
      // Note: The actual pagination structure may vary
    });

    test('should retrieve tasks with status filter', async () => {
      const response = await request(app)
        .get('/api/tasks?status=pending')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      if (response.body.data.length > 0) {
        response.body.data.forEach(task => {
          expect(task.status).toBe('pending');
        });
      }
    });

    test('should retrieve tasks with priority filter', async () => {
      const response = await request(app)
        .get('/api/tasks?priority=high')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      if (response.body.data.length > 0) {
        response.body.data.forEach(task => {
          expect(task.priority).toBe('high');
        });
      }
    });

    test('should retrieve single task by ID', async () => {
      if (!createdTaskId) {
        // Create a task first if none exists
        const createResponse = await request(app)
          .post('/api/tasks')
          .set('Authorization', `Bearer ${authToken}`)
          .send({ title: 'Test Task for Retrieval' });

        createdTaskId = createResponse.body.data.id;
      }

      const response = await request(app)
        .get(`/api/tasks/${createdTaskId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
      expect(response.body.data.id).toBe(createdTaskId);
    });

    test('should return 404 for non-existent task', async () => {
      const response = await request(app)
        .get('/api/tasks/99999')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Task not found');
    });

    test('should require authentication for task retrieval', async () => {
      const response = await request(app)
        .get('/api/tasks');

      expect(response.status).toBe(401);
      expect(response.body.message).toBe('Access token required');
    });
  });

  describe('UPDATE - Task Modification Integration', () => {
    test('should update task successfully', async () => {
      if (!createdTaskId) {
        // Create a task first if none exists
        const createResponse = await request(app)
          .post('/api/tasks')
          .set('Authorization', `Bearer ${authToken}`)
          .send({ title: 'Test Task for Update' });

        createdTaskId = createResponse.body.data.id;
      }

      const updateData = {
        title: 'Updated Task Title',
        description: 'Updated description',
        status: 'completed',
        priority: 'low'
      };

      const response = await request(app)
        .put(`/api/tasks/${createdTaskId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Task updated successfully');
      expect(response.body.data.title).toBe(updateData.title);
      expect(response.body.data.description).toBe(updateData.description);
      expect(response.body.data.status).toBe(updateData.status);
      expect(response.body.data.priority).toBe(updateData.priority);
    });

    test('should update partial task data', async () => {
      if (!createdTaskId) {
        const createResponse = await request(app)
          .post('/api/tasks')
          .set('Authorization', `Bearer ${authToken}`)
          .send({ title: 'Test Task for Partial Update' });

        createdTaskId = createResponse.body.data.id;
      }

      const updateData = { status: 'completed' };

      const response = await request(app)
        .put(`/api/tasks/${createdTaskId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData);

      expect(response.status).toBe(200);
      expect(response.body.data.status).toBe('completed');
    });

    test('should reject update with invalid data', async () => {
      if (!createdTaskId) {
        const createResponse = await request(app)
          .post('/api/tasks')
          .set('Authorization', `Bearer ${authToken}`)
          .send({ title: 'Test Task for Invalid Update' });

        createdTaskId = createResponse.body.data.id;
      }

      const invalidUpdateData = {
        title: '', // Empty title
        priority: 'invalid' // Invalid priority
      };

      const response = await request(app)
        .put(`/api/tasks/${createdTaskId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(invalidUpdateData);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Validation failed');
    });

    test('should return 404 for non-existent task update', async () => {
      const response = await request(app)
        .put('/api/tasks/99999')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ title: 'Updated Title' });

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Task not found');
    });

    test('should require authentication for task update', async () => {
      const response = await request(app)
        .put('/api/tasks/1')
        .send({ title: 'Unauthorized Update' });

      expect(response.status).toBe(401);
      expect(response.body.message).toBe('Access token required');
    });
  });

  describe('DELETE - Task Removal Integration', () => {
    let taskToDeleteId;

    beforeEach(async () => {
      // Create a task to delete
      const createResponse = await request(app)
        .post('/api/tasks')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ title: 'Task to Delete' });

      taskToDeleteId = createResponse.body.data.id;
    });

    test('should delete task successfully', async () => {
      const response = await request(app)
        .delete(`/api/tasks/${taskToDeleteId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Task deleted successfully');
    });

    test('should return 404 for non-existent task deletion', async () => {
      const response = await request(app)
        .delete('/api/tasks/99999')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Task not found');
    });

    test('should require authentication for task deletion', async () => {
      const response = await request(app)
        .delete(`/api/tasks/${taskToDeleteId}`);

      expect(response.status).toBe(401);
      expect(response.body.message).toBe('Access token required');
    });
  });

  describe('STATISTICS - Task Analytics Integration', () => {
    test('should retrieve task statistics', async () => {
      const response = await request(app)
        .get('/api/tasks/stats')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Statistics retrieved successfully');
      expect(response.body.data).toBeDefined();
      expect(response.body.data.totalTasks).toBeDefined();
      expect(response.body.data.pendingTasks).toBeDefined();
      expect(response.body.data.completedTasks).toBeDefined();
      expect(response.body.data.highPriorityTasks).toBeDefined();
      expect(response.body.data.mediumPriorityTasks).toBeDefined();
      expect(response.body.data.lowPriorityTasks).toBeDefined();
      expect(response.body.data.completionRate).toBeDefined();
    });

    test('should require authentication for statistics', async () => {
      const response = await request(app)
        .get('/api/tasks/stats');

      expect(response.status).toBe(401);
      expect(response.body.message).toBe('Access token required');
    });
  });

  describe('USER ISOLATION - Security Tests', () => {
    let otherUserToken;
    let otherUserId;

    beforeAll(async () => {
      // Create another user
      const registerResponse = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'otheruser@example.com',
          password: 'TestPassword123'
        });

      otherUserToken = registerResponse.body.data.tokens.accessToken;
      otherUserId = registerResponse.body.data.user.id;
    });

    test('should not allow user to access other user\'s tasks', async () => {
      if (!createdTaskId) {
        const createResponse = await request(app)
          .post('/api/tasks')
          .set('Authorization', `Bearer ${authToken}`)
          .send({ title: 'Original User Task' });

        createdTaskId = createResponse.body.data.id;
      }

      const response = await request(app)
        .get(`/api/tasks/${createdTaskId}`)
        .set('Authorization', `Bearer ${otherUserToken}`);

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Task not found');
    });

    test('should not allow user to update other user\'s tasks', async () => {
      if (!createdTaskId) {
        const createResponse = await request(app)
          .post('/api/tasks')
          .set('Authorization', `Bearer ${authToken}`)
          .send({ title: 'Original User Task for Update' });

        createdTaskId = createResponse.body.data.id;
      }

      const response = await request(app)
        .put(`/api/tasks/${createdTaskId}`)
        .set('Authorization', `Bearer ${otherUserToken}`)
        .send({ title: 'Unauthorized Update' });

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Task not found');
    });

    test('should not allow user to delete other user\'s tasks', async () => {
      if (!createdTaskId) {
        const createResponse = await request(app)
          .post('/api/tasks')
          .set('Authorization', `Bearer ${authToken}`)
          .send({ title: 'Original User Task for Delete' });

        createdTaskId = createResponse.body.data.id;
      }

      const response = await request(app)
        .delete(`/api/tasks/${createdTaskId}`)
        .set('Authorization', `Bearer ${otherUserToken}`);

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Task not found');
    });

    test('should only show user\'s own tasks in list', async () => {
      // Create a task for the other user
      await request(app)
        .post('/api/tasks')
        .set('Authorization', `Bearer ${otherUserToken}`)
        .send({ title: 'Other User Task' });

      // Get tasks for original user
      const response = await request(app)
        .get('/api/tasks')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      response.body.data.forEach(task => {
        expect(task.userId).toBe(userId);
      });
    });
  });

  describe('EDGE CASES', () => {
    test('should handle very long task titles', async () => {
      const longTitle = 'a'.repeat(255); // Maximum allowed length

      const response = await request(app)
        .post('/api/tasks')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ title: longTitle });

      expect(response.status).toBe(201);
      expect(response.body.data.title).toBe(longTitle);
    });

    test('should reject task titles that are too long', async () => {
      const tooLongTitle = 'a'.repeat(256); // Exceeds maximum length

      const response = await request(app)
        .post('/api/tasks')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ title: tooLongTitle });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    test('should handle empty task lists', async () => {
      // Create a new user with no tasks
      const registerResponse = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'emptytasks@example.com',
          password: 'TestPassword123'
        });

      const emptyUserToken = registerResponse.body.data.tokens.accessToken;

      const response = await request(app)
        .get('/api/tasks')
        .set('Authorization', `Bearer ${emptyUserToken}`);

      expect(response.status).toBe(200);
      expect(response.body.data).toHaveLength(0);
      expect(response.body.pagination).toBeDefined();
    });

    test('should handle malformed JSON requests', async () => {
      const response = await request(app)
        .post('/api/tasks')
        .set('Authorization', `Bearer ${authToken}`)
        .set('Content-Type', 'application/json')
        .send('{"invalid": json}');

      expect(response.status).toBe(400);
    });
  });
});
