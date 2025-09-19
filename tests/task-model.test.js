const Task = require('../models/Task');

// Mock the database
jest.mock('../utils/database', () => ({
  query: jest.fn()
}));

const { query } = require('../utils/database');

describe('Task Model Unit Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Task.create()', () => {
    test('should create a new task successfully', async () => {
      const mockTaskData = {
        id: 1,
        title: 'Test Task',
        description: 'Test Description',
        status: 'pending',
        priority: 'medium',
        user_id: 1,
        created_at: new Date(),
        updated_at: new Date()
      };

      query.mockResolvedValueOnce({ rows: [mockTaskData] });

      const taskData = {
        title: 'Test Task',
        description: 'Test Description',
        priority: 'medium',
        userId: 1
      };

      const result = await Task.create(taskData);

      expect(query).toHaveBeenCalledWith(
        'INSERT INTO tasks (title, description, status, priority, user_id) VALUES ($1, $2, $3, $4, $5) RETURNING *',
        ['Test Task', 'Test Description', 'pending', 'medium', 1]
      );

      expect(result).toBeInstanceOf(Task);
      expect(result.title).toBe('Test Task');
      expect(result.description).toBe('Test Description');
      expect(result.status).toBe('pending');
      expect(result.priority).toBe('medium');
      expect(result.userId).toBe(1);
    });

    test('should create task with default values', async () => {
      const mockTaskData = {
        id: 1,
        title: 'Minimal Task',
        description: null,
        status: 'pending',
        priority: 'medium',
        user_id: 1,
        created_at: new Date(),
        updated_at: new Date()
      };

      query.mockResolvedValueOnce({ rows: [mockTaskData] });

      const taskData = {
        title: 'Minimal Task',
        userId: 1
      };

      const result = await Task.create(taskData);

      expect(query).toHaveBeenCalledWith(
        'INSERT INTO tasks (title, description, status, priority, user_id) VALUES ($1, $2, $3, $4, $5) RETURNING *',
        ['Minimal Task', undefined, 'pending', 'medium', 1]
      );

      expect(result.title).toBe('Minimal Task');
      expect(result.status).toBe('pending');
      expect(result.priority).toBe('medium');
    });

    test('should handle database errors', async () => {
      const dbError = new Error('Database connection failed');
      query.mockRejectedValueOnce(dbError);

      const taskData = {
        title: 'Error Task',
        userId: 1
      };

      await expect(Task.create(taskData)).rejects.toThrow('Database connection failed');
    });
  });

  describe('Task.findById()', () => {
    test('should find task by ID successfully', async () => {
      const mockTaskData = {
        id: 1,
        title: 'Found Task',
        description: 'Found Description',
        status: 'pending',
        priority: 'high',
        user_id: 1,
        created_at: new Date(),
        updated_at: new Date()
      };

      query.mockResolvedValueOnce({ rows: [mockTaskData] });

      const result = await Task.findById(1);

      expect(query).toHaveBeenCalledWith(
        'SELECT * FROM tasks WHERE id = $1',
        [1]
      );

      expect(result).toBeInstanceOf(Task);
      expect(result.id).toBe(1);
      expect(result.title).toBe('Found Task');
    });

    test('should return null for non-existent task', async () => {
      query.mockResolvedValueOnce({ rows: [] });

      const result = await Task.findById(999);

      expect(result).toBeNull();
    });

    test('should handle database errors', async () => {
      const dbError = new Error('Database error');
      query.mockRejectedValueOnce(dbError);

      await expect(Task.findById(1)).rejects.toThrow('Database error');
    });
  });

  describe('Task.findByUserId()', () => {
    test('should find tasks by user ID with pagination', async () => {
      const mockTasks = [
        {
          id: 1,
          title: 'Task 1',
          description: 'Description 1',
          status: 'pending',
          priority: 'high',
          user_id: 1,
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          id: 2,
          title: 'Task 2',
          description: 'Description 2',
          status: 'completed',
          priority: 'medium',
          user_id: 1,
          created_at: new Date(),
          updated_at: new Date()
        }
      ];

      query
        .mockResolvedValueOnce({ rows: [{ count: '2' }] }) // Count query
        .mockResolvedValueOnce({ rows: mockTasks }); // Tasks query

      const result = await Task.findByUserId(1, 1, 10);

      expect(query).toHaveBeenCalledWith(
        'SELECT COUNT(*) FROM tasks WHERE user_id = $1',
        [1]
      );

      expect(query).toHaveBeenCalledWith(
        'SELECT * FROM tasks WHERE user_id = $1 ORDER BY created_at DESC LIMIT $2 OFFSET $3',
        [1, 10, 0]
      );

      expect(result.tasks).toHaveLength(2);
      expect(result.tasks[0]).toBeInstanceOf(Task);
      expect(result.pagination).toEqual({
        page: 1,
        limit: 10,
        totalCount: 2,
        totalPages: 1,
        hasNextPage: false,
        hasPrevPage: false
      });
    });

    test('should find tasks with status filter', async () => {
      query
        .mockResolvedValueOnce({ rows: [{ count: '1' }] })
        .mockResolvedValueOnce({ rows: [{
          id: 1,
          title: 'Pending Task',
          status: 'pending',
          priority: 'medium',
          user_id: 1,
          created_at: new Date(),
          updated_at: new Date()
        }] });

      const result = await Task.findByUserId(1, 1, 10, 'pending');

      expect(query).toHaveBeenCalledWith(
        'SELECT COUNT(*) FROM tasks WHERE user_id = $1 AND status = $2',
        [1, 'pending']
      );

      expect(query).toHaveBeenCalledWith(
        'SELECT * FROM tasks WHERE user_id = $1 AND status = $2 ORDER BY created_at DESC LIMIT $3 OFFSET $4',
        [1, 'pending', 10, 0]
      );
    });

    test('should find tasks with priority filter', async () => {
      query
        .mockResolvedValueOnce({ rows: [{ count: '1' }] })
        .mockResolvedValueOnce({ rows: [{
          id: 1,
          title: 'High Priority Task',
          status: 'pending',
          priority: 'high',
          user_id: 1,
          created_at: new Date(),
          updated_at: new Date()
        }] });

      const result = await Task.findByUserId(1, 1, 10, null, 'high');

      expect(query).toHaveBeenCalledWith(
        'SELECT COUNT(*) FROM tasks WHERE user_id = $1 AND priority = $2',
        [1, 'high']
      );
    });

    test('should find tasks with both status and priority filters', async () => {
      query
        .mockResolvedValueOnce({ rows: [{ count: '1' }] })
        .mockResolvedValueOnce({ rows: [{
          id: 1,
          title: 'High Priority Pending Task',
          status: 'pending',
          priority: 'high',
          user_id: 1,
          created_at: new Date(),
          updated_at: new Date()
        }] });

      const result = await Task.findByUserId(1, 1, 10, 'pending', 'high');

      expect(query).toHaveBeenCalledWith(
        'SELECT COUNT(*) FROM tasks WHERE user_id = $1 AND status = $2 AND priority = $3',
        [1, 'pending', 'high']
      );
    });
  });

  describe('Task.update()', () => {
    test('should update task successfully', async () => {
      const mockUpdatedTask = {
        id: 1,
        title: 'Updated Task',
        description: 'Updated Description',
        status: 'completed',
        priority: 'high',
        user_id: 1,
        created_at: new Date(),
        updated_at: new Date()
      };

      query.mockResolvedValueOnce({ rows: [mockUpdatedTask] });

      const updateData = {
        title: 'Updated Task',
        description: 'Updated Description',
        status: 'completed',
        priority: 'high'
      };

      const result = await Task.update(1, 1, updateData);

      expect(query).toHaveBeenCalledWith(
        'UPDATE tasks SET title = $1, description = $2, status = $3, priority = $4, updated_at = CURRENT_TIMESTAMP WHERE id = $5 AND user_id = $6 RETURNING *',
        ['Updated Task', 'Updated Description', 'completed', 'high', 1, 1]
      );

      expect(result).toBeInstanceOf(Task);
      expect(result.title).toBe('Updated Task');
      expect(result.status).toBe('completed');
    });

    test('should update partial task data', async () => {
      const mockUpdatedTask = {
        id: 1,
        title: 'Original Task',
        description: 'Original Description',
        status: 'completed',
        priority: 'medium',
        user_id: 1,
        created_at: new Date(),
        updated_at: new Date()
      };

      query.mockResolvedValueOnce({ rows: [mockUpdatedTask] });

      const updateData = { status: 'completed' };

      const result = await Task.update(1, 1, updateData);

      expect(query).toHaveBeenCalledWith(
        'UPDATE tasks SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 AND user_id = $3 RETURNING *',
        ['completed', 1, 1]
      );

      expect(result.status).toBe('completed');
    });

    test('should throw error for no valid fields', async () => {
      const updateData = { invalidField: 'value' };

      await expect(Task.update(1, 1, updateData)).rejects.toThrow('No valid fields to update');
    });

    test('should throw error for non-existent task', async () => {
      query.mockResolvedValueOnce({ rows: [] });

      const updateData = { title: 'Updated Title' };

      await expect(Task.update(999, 1, updateData)).rejects.toThrow('Task not found or not owned by user');
    });

    test('should handle database errors', async () => {
      const dbError = new Error('Database error');
      query.mockRejectedValueOnce(dbError);

      const updateData = { title: 'Updated Title' };

      await expect(Task.update(1, 1, updateData)).rejects.toThrow('Database error');
    });
  });

  describe('Task.getStats()', () => {
    test('should get task statistics successfully', async () => {
      const mockStats = {
        total_tasks: '5',
        pending_tasks: '3',
        completed_tasks: '2',
        high_priority_tasks: '1',
        medium_priority_tasks: '2',
        low_priority_tasks: '2'
      };

      query.mockResolvedValueOnce({ rows: [mockStats] });

      const result = await Task.getStats(1);

      expect(query).toHaveBeenCalledWith(
        `SELECT 
          COUNT(*) as total_tasks,
          COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_tasks,
          COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_tasks,
          COUNT(CASE WHEN priority = 'high' THEN 1 END) as high_priority_tasks,
          COUNT(CASE WHEN priority = 'medium' THEN 1 END) as medium_priority_tasks,
          COUNT(CASE WHEN priority = 'low' THEN 1 END) as low_priority_tasks
        FROM tasks 
        WHERE user_id = $1`,
        [1]
      );

      expect(result).toEqual({
        totalTasks: 5,
        pendingTasks: 3,
        completedTasks: 2,
        highPriorityTasks: 1,
        mediumPriorityTasks: 2,
        lowPriorityTasks: 2,
        completionRate: 40
      });
    });

    test('should handle zero tasks', async () => {
      const mockStats = {
        total_tasks: '0',
        pending_tasks: '0',
        completed_tasks: '0',
        high_priority_tasks: '0',
        medium_priority_tasks: '0',
        low_priority_tasks: '0'
      };

      query.mockResolvedValueOnce({ rows: [mockStats] });

      const result = await Task.getStats(1);

      expect(result.completionRate).toBe(0);
    });

    test('should handle database errors', async () => {
      const dbError = new Error('Database error');
      query.mockRejectedValueOnce(dbError);

      await expect(Task.getStats(1)).rejects.toThrow('Database error');
    });
  });

  describe('Task instance methods', () => {
    let task;

    beforeEach(() => {
      task = new Task({
        id: 1,
        title: 'Test Task',
        description: 'Test Description',
        status: 'pending',
        priority: 'medium',
        user_id: 1,
        created_at: new Date(),
        updated_at: new Date()
      });
    });

    describe('task.update()', () => {
      test('should update task instance', async () => {
        const mockUpdatedTask = {
          id: 1,
          title: 'Updated Task',
          description: 'Updated Description',
          status: 'completed',
          priority: 'high',
          user_id: 1,
          created_at: new Date(),
          updated_at: new Date()
        };

        query.mockResolvedValueOnce({ rows: [mockUpdatedTask] });

        const updateData = {
          title: 'Updated Task',
          status: 'completed'
        };

        const result = await task.update(updateData);

        expect(query).toHaveBeenCalledWith(
          'UPDATE tasks SET title = $1, status = $2, updated_at = CURRENT_TIMESTAMP WHERE id = $3 RETURNING *',
          ['Updated Task', 'completed', 1]
        );

        expect(result).toBe(task);
        expect(task.title).toBe('Updated Task');
        expect(task.status).toBe('completed');
      });

      test('should throw error for no valid fields', async () => {
        const updateData = { invalidField: 'value' };

        await expect(task.update(updateData)).rejects.toThrow('No valid fields to update');
      });
    });

    describe('task.delete()', () => {
      test('should delete task successfully', async () => {
        query.mockResolvedValueOnce({ rows: [] });

        const result = await task.delete();

        expect(query).toHaveBeenCalledWith(
          'DELETE FROM tasks WHERE id = $1',
          [1]
        );

        expect(result).toBe(true);
      });

      test('should handle database errors', async () => {
        const dbError = new Error('Database error');
        query.mockRejectedValueOnce(dbError);

        await expect(task.delete()).rejects.toThrow('Database error');
      });
    });

    describe('task.isOwnedBy()', () => {
      test('should return true for correct owner', async () => {
        const result = await task.isOwnedBy(1);
        expect(result).toBe(true);
      });

      test('should return false for different owner', async () => {
        const result = await task.isOwnedBy(2);
        expect(result).toBe(false);
      });
    });

    describe('task.toJSON()', () => {
      test('should return JSON representation', () => {
        const json = task.toJSON();

        expect(json).toEqual({
          id: 1,
          title: 'Test Task',
          description: 'Test Description',
          status: 'pending',
          priority: 'medium',
          userId: 1,
          createdAt: task.createdAt,
          updatedAt: task.updatedAt
        });
      });
    });
  });

  describe('Task.validateTaskData()', () => {
    test('should validate correct task data', () => {
      const result = Task.validateTaskData(
        'Valid Title',
        'Valid Description',
        'high',
        'pending'
      );

      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    test('should reject empty title', () => {
      const result = Task.validateTaskData('', 'Description', 'medium');

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Title is required and must be a non-empty string');
    });

    test('should reject title too long', () => {
      const longTitle = 'a'.repeat(256);
      const result = Task.validateTaskData(longTitle, 'Description', 'medium');

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Title must be less than 255 characters');
    });

    test('should reject invalid priority', () => {
      const result = Task.validateTaskData('Title', 'Description', 'invalid');

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Priority must be one of: low, medium, high');
    });

    test('should reject invalid status', () => {
      const result = Task.validateTaskData('Title', 'Description', 'medium', 'invalid');

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Status must be one of: pending, completed');
    });

    test('should reject description too long', () => {
      const longDescription = 'a'.repeat(1001);
      const result = Task.validateTaskData('Title', longDescription, 'medium');

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Description must be less than 1000 characters');
    });

    test('should handle multiple validation errors', () => {
      const result = Task.validateTaskData('', 'a'.repeat(1001), 'invalid', 'invalid');

      expect(result.valid).toBe(false);
      expect(result.errors).toHaveLength(4);
    });
  });
});
