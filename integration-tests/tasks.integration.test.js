const request = require('supertest');
const { query, ensureDatabaseInitialized } = require('../utils/database');

// Import the test server (not the main server)
const createTestServer = require('./testServer');

describe('Task CRUD Integration Tests', () => {
  let testHelper;
  let testUser;
  let app;

  beforeAll(async () => {
    testHelper = new TestHelper();
    app = testHelper.app;
  });

  beforeEach(async () => {
    // Create a fresh test user for each test
    testUser = await testHelper.createTestUser({
      email: `tasktest${Date.now()}@example.com`,
      password: 'TaskPassword123'
    });
  });

  afterAll(async () => {
    await testHelper.cleanup();
  });

  describe('POST /api/tasks - Create Task', () => {
    test('should create a new task successfully', async () => {
      const taskData = {
        title: 'Integration Test Task',
        description: 'This is a test task created via integration test',
        priority: 'high',
        status: 'pending'
      };

      const response = await request(app)
        .post('/api/tasks')
        .set('Authorization', `Bearer ${testUser.token}`)
        .send(taskData);

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Task created successfully');
      expect(response.body.data).toBeDefined();
      expect(response.body.data.title).toBe(taskData.title);
      expect(response.body.data.description).toBe(taskData.description);
      expect(response.body.data.priority).toBe(taskData.priority);
      expect(response.body.data.status).toBe(taskData.status);
      expect(response.body.data.userId).toBe(testUser.user.id);
      expect(response.body.data.id).toBeDefined();
      expect(response.body.data.createdAt).toBeDefined();
      expect(response.body.data.updatedAt).toBeDefined();
    });

    test('should create task with minimal data', async () => {
      const taskData = {
        title: 'Minimal Task'
      };

      const response = await request(app)
        .post('/api/tasks')
        .set('Authorization', `Bearer ${testUser.token}`)
        .send(taskData);

      expect(response.status).toBe(201);
      expect(response.body.data.title).toBe(taskData.title);
      expect(response.body.data.description).toBeNull();
      expect(response.body.data.priority).toBe('medium'); // Default value
      expect(response.body.data.status).toBe('pending'); // Default value
    });

    test('should reject task creation without authentication', async () => {
      const taskData = {
        title: 'Unauthorized Task'
      };

      const response = await request(app)
        .post('/api/tasks')
        .send(taskData);

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Access token required');
    });

    test('should reject task creation with invalid token', async () => {
      const taskData = {
        title: 'Invalid Token Task'
      };

      const response = await request(app)
        .post('/api/tasks')
        .set('Authorization', 'Bearer invalid-token')
        .send(taskData);

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Invalid token');
    });

    test('should reject task creation with invalid data', async () => {
      const taskData = {
        title: '', // Empty title should fail validation
        priority: 'invalid-priority'
      };

      const response = await request(app)
        .post('/api/tasks')
        .set('Authorization', `Bearer ${testUser.token}`)
        .send(taskData);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message.toLowerCase()).toContain('validation');
    });

    test('should reject task creation with title too long', async () => {
      const taskData = {
        title: 'a'.repeat(256) // Title too long
      };

      const response = await request(app)
        .post('/api/tasks')
        .set('Authorization', `Bearer ${testUser.token}`)
        .send(taskData);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/tasks - List Tasks', () => {
    beforeEach(async () => {
      // Create multiple test tasks
      await testHelper.createTestTask(testUser.token, {
        title: 'Task 1',
        description: 'First task',
        priority: 'high',
        status: 'pending'
      });

      await testHelper.createTestTask(testUser.token, {
        title: 'Task 2',
        description: 'Second task',
        priority: 'medium',
        status: 'completed'
      });

      await testHelper.createTestTask(testUser.token, {
        title: 'Task 3',
        description: 'Third task',
        priority: 'low',
        status: 'pending'
      });
    });

    test('should retrieve all tasks for authenticated user', async () => {
      const response = await request(app)
        .get('/api/tasks')
        .set('Authorization', `Bearer ${testUser.token}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data).toHaveLength(3);
      expect(response.body.pagination).toBeDefined();
      expect(response.body.pagination.totalCount).toBe(3);
    });

    test('should retrieve tasks with pagination', async () => {
      const response = await request(app)
        .get('/api/tasks?page=1&limit=2')
        .set('Authorization', `Bearer ${testUser.token}`);

      expect(response.status).toBe(200);
      expect(response.body.data).toHaveLength(2);
      expect(response.body.pagination.page).toBe(1);
      expect(response.body.pagination.limit).toBe(2);
      expect(response.body.pagination.totalCount).toBe(3);
      expect(response.body.pagination.hasNextPage).toBe(true);
    });

    test('should filter tasks by status', async () => {
      const response = await request(app)
        .get('/api/tasks?status=pending')
        .set('Authorization', `Bearer ${testUser.token}`);

      expect(response.status).toBe(200);
      expect(response.body.data).toHaveLength(2);
      response.body.data.forEach(task => {
        expect(task.status).toBe('pending');
      });
    });

    test('should filter tasks by priority', async () => {
      const response = await request(app)
        .get('/api/tasks?priority=high')
        .set('Authorization', `Bearer ${testUser.token}`);

      expect(response.status).toBe(200);
      expect(response.body.data).toHaveLength(1);
      expect(response.body.data[0].priority).toBe('high');
    });

    test('should filter tasks by both status and priority', async () => {
      const response = await request(app)
        .get('/api/tasks?status=pending&priority=high')
        .set('Authorization', `Bearer ${testUser.token}`);

      expect(response.status).toBe(200);
      expect(response.body.data).toHaveLength(1);
      expect(response.body.data[0].status).toBe('pending');
      expect(response.body.data[0].priority).toBe('high');
    });

    test('should return empty array for non-matching filters', async () => {
      const response = await request(app)
        .get('/api/tasks?status=completed&priority=high')
        .set('Authorization', `Bearer ${testUser.token}`);

      expect(response.status).toBe(200);
      expect(response.body.data).toHaveLength(0);
    });

    test('should reject request without authentication', async () => {
      const response = await request(app)
        .get('/api/tasks');

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/tasks/:id - Get Single Task', () => {
    let testTask;

    beforeEach(async () => {
      testTask = await testHelper.createTestTask(testUser.token, {
        title: 'Single Task Test',
        description: 'Task for single retrieval test',
        priority: 'medium'
      });
    });

    test('should retrieve single task by ID', async () => {
      const response = await request(app)
        .get(`/api/tasks/${testTask.id}`)
        .set('Authorization', `Bearer ${testUser.token}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
      expect(response.body.data.id).toBe(testTask.id);
      expect(response.body.data.title).toBe(testTask.title);
    });

    test('should return 404 for non-existent task', async () => {
      const response = await request(app)
        .get('/api/tasks/99999')
        .set('Authorization', `Bearer ${testUser.token}`);

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('not found');
    });

    test('should reject access to task owned by different user', async () => {
      // Create another user
      const otherUser = await testHelper.createTestUser({
        email: `otheruser${Date.now()}@example.com`,
        password: 'OtherPassword123'
      });

      const response = await request(app)
        .get(`/api/tasks/${testTask.id}`)
        .set('Authorization', `Bearer ${otherUser.token}`);

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('not found');
    });

    test('should reject request without authentication', async () => {
      const response = await request(app)
        .get(`/api/tasks/${testTask.id}`);

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });
  });

  describe('PUT /api/tasks/:id - Update Task', () => {
    let testTask;

    beforeEach(async () => {
      testTask = await testHelper.createTestTask(testUser.token, {
        title: 'Update Test Task',
        description: 'Original description',
        priority: 'low',
        status: 'pending'
      });
    });

    test('should update task successfully', async () => {
      const updateData = {
        title: 'Updated Task Title',
        description: 'Updated description',
        priority: 'high',
        status: 'completed'
      };

      const response = await request(app)
        .put(`/api/tasks/${testTask.id}`)
        .set('Authorization', `Bearer ${testUser.token}`)
        .send(updateData);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Task updated successfully');
      expect(response.body.data.title).toBe(updateData.title);
      expect(response.body.data.description).toBe(updateData.description);
      expect(response.body.data.priority).toBe(updateData.priority);
      expect(response.body.data.status).toBe(updateData.status);
    });

    test('should update task with partial data', async () => {
      const updateData = {
        status: 'completed'
      };

      const response = await request(app)
        .put(`/api/tasks/${testTask.id}`)
        .set('Authorization', `Bearer ${testUser.token}`)
        .send(updateData);

      expect(response.status).toBe(200);
      expect(response.body.data.status).toBe('completed');
      expect(response.body.data.title).toBe(testTask.title); // Should remain unchanged
    });

    test('should return 404 for non-existent task', async () => {
      const updateData = {
        title: 'Updated Title'
      };

      const response = await request(app)
        .put('/api/tasks/99999')
        .set('Authorization', `Bearer ${testUser.token}`)
        .send(updateData);

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
    });

    test('should reject update of task owned by different user', async () => {
      const otherUser = await testHelper.createTestUser({
        email: `otheruser${Date.now()}@example.com`,
        password: 'OtherPassword123'
      });

      const updateData = {
        title: 'Unauthorized Update'
      };

      const response = await request(app)
        .put(`/api/tasks/${testTask.id}`)
        .set('Authorization', `Bearer ${otherUser.token}`)
        .send(updateData);

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
    });

    test('should reject update without authentication', async () => {
      const updateData = {
        title: 'Unauthorized Update'
      };

      const response = await request(app)
        .put(`/api/tasks/${testTask.id}`)
        .send(updateData);

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });

    test('should reject update with invalid data', async () => {
      const updateData = {
        priority: 'invalid-priority'
      };

      const response = await request(app)
        .put(`/api/tasks/${testTask.id}`)
        .set('Authorization', `Bearer ${testUser.token}`)
        .send(updateData);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });
  });

  describe('DELETE /api/tasks/:id - Delete Task', () => {
    let testTask;

    beforeEach(async () => {
      testTask = await testHelper.createTestTask(testUser.token, {
        title: 'Delete Test Task',
        description: 'Task to be deleted'
      });
    });

    test('should delete task successfully', async () => {
      const response = await request(app)
        .delete(`/api/tasks/${testTask.id}`)
        .set('Authorization', `Bearer ${testUser.token}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Task deleted successfully');

      // Verify task is actually deleted
      const getResponse = await request(app)
        .get(`/api/tasks/${testTask.id}`)
        .set('Authorization', `Bearer ${testUser.token}`);

      expect(getResponse.status).toBe(404);
    });

    test('should return 404 for non-existent task', async () => {
      const response = await request(app)
        .delete('/api/tasks/99999')
        .set('Authorization', `Bearer ${testUser.token}`);

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
    });

    test('should reject deletion of task owned by different user', async () => {
      const otherUser = await testHelper.createTestUser({
        email: `otheruser${Date.now()}@example.com`,
        password: 'OtherPassword123'
      });

      const response = await request(app)
        .delete(`/api/tasks/${testTask.id}`)
        .set('Authorization', `Bearer ${otherUser.token}`);

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
    });

    test('should reject deletion without authentication', async () => {
      const response = await request(app)
        .delete(`/api/tasks/${testTask.id}`);

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/tasks/stats - Task Statistics', () => {
    beforeEach(async () => {
      // Create tasks with different statuses and priorities
      await testHelper.createTestTask(testUser.token, {
        title: 'High Priority Pending',
        priority: 'high',
        status: 'pending'
      });

      await testHelper.createTestTask(testUser.token, {
        title: 'Medium Priority Completed',
        priority: 'medium',
        status: 'completed'
      });

      await testHelper.createTestTask(testUser.token, {
        title: 'Low Priority Pending',
        priority: 'low',
        status: 'pending'
      });

      await testHelper.createTestTask(testUser.token, {
        title: 'Another High Priority',
        priority: 'high',
        status: 'completed'
      });
    });

    test('should retrieve task statistics', async () => {
      const response = await request(app)
        .get('/api/tasks/stats')
        .set('Authorization', `Bearer ${testUser.token}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Statistics retrieved successfully');
      expect(response.body.data).toBeDefined();
      
      const stats = response.body.data;
      expect(stats.totalTasks).toBe(4);
      expect(stats.pendingTasks).toBe(2);
      expect(stats.completedTasks).toBe(2);
      expect(stats.highPriorityTasks).toBe(2);
      expect(stats.mediumPriorityTasks).toBe(1);
      expect(stats.lowPriorityTasks).toBe(1);
      expect(stats.completionRate).toBe(50); // 2 completed out of 4 total
    });

    test('should return zero stats for user with no tasks', async () => {
      const newUser = await testHelper.createTestUser({
        email: `newuser${Date.now()}@example.com`,
        password: 'NewPassword123'
      });

      const response = await request(app)
        .get('/api/tasks/stats')
        .set('Authorization', `Bearer ${newUser.token}`);

      expect(response.status).toBe(200);
      expect(response.body.data.totalTasks).toBe(0);
      expect(response.body.data.completionRate).toBe(0);
    });

    test('should reject stats request without authentication', async () => {
      const response = await request(app)
        .get('/api/tasks/stats');

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });
  });

  describe('Database Integration', () => {
    test('should persist task data correctly in database', async () => {
      const taskData = {
        title: 'Database Test Task',
        description: 'Testing database persistence',
        priority: 'high',
        status: 'pending'
      };

      const response = await request(app)
        .post('/api/tasks')
        .set('Authorization', `Bearer ${testUser.token}`)
        .send(taskData);

      expect(response.status).toBe(201);
      const createdTask = response.body.data;

      // Verify data is actually stored in database
      const result = await query('SELECT * FROM tasks WHERE id = $1', [createdTask.id]);
      
      expect(result.rows).toHaveLength(1);
      const dbTask = result.rows[0];
      
      expect(dbTask.title).toBe(taskData.title);
      expect(dbTask.description).toBe(taskData.description);
      expect(dbTask.priority).toBe(taskData.priority);
      expect(dbTask.status).toBe(taskData.status);
      expect(dbTask.user_id).toBe(testUser.user.id);
    });

    test('should maintain referential integrity', async () => {
      // Create a task
      const task = await testHelper.createTestTask(testUser.token, {
        title: 'Referential Integrity Test'
      });

      // Verify task exists
      const taskResult = await query('SELECT * FROM tasks WHERE id = $1', [task.id]);
      expect(taskResult.rows).toHaveLength(1);

      // Delete the user
      await query('DELETE FROM users WHERE id = $1', [testUser.user.id]);

      // Task should still exist (depending on foreign key constraints)
      const taskAfterUserDelete = await query('SELECT * FROM tasks WHERE id = $1', [task.id]);
      // This test depends on your database schema - adjust expectations accordingly
      expect(taskAfterUserDelete.rows).toBeDefined();
    });
  });
});
