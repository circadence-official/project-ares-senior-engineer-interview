const { newDb } = require('pg-mem');
const bcrypt = require('bcrypt');

/**
 * Test Database Manager for Integration Tests
 * Provides utilities for setting up and managing test database state
 */
class TestDatabaseManager {
  constructor() {
    this.db = null;
    this.isInitialized = false;
  }

  /**
   * Initialize the test database with schema
   */
  async initialize() {
    if (this.isInitialized) {
      return this.db;
    }

    console.log('🔧 Initializing test database...');
    
    this.db = newDb();
    
    // Create tables
    await this.createTables();
    
    this.isInitialized = true;
    console.log('✅ Test database initialized');
    
    return this.db;
  }

  /**
   * Create database tables
   */
  async createTables() {
    // Users table
    await this.db.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Tasks table
    await this.db.query(`
      CREATE TABLE IF NOT EXISTS tasks (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'completed')),
        priority VARCHAR(50) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create indexes for better performance
    await this.db.query('CREATE INDEX IF NOT EXISTS idx_tasks_user_id ON tasks(user_id)');
    await this.db.query('CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status)');
    await this.db.query('CREATE INDEX IF NOT EXISTS idx_tasks_priority ON tasks(priority)');
    await this.db.query('CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)');
  }

  /**
   * Clean all data from tables
   */
  async cleanAll() {
    if (!this.db) {
      throw new Error('Database not initialized');
    }

    await this.db.query('DELETE FROM tasks');
    await this.db.query('DELETE FROM users');
    
    // Reset sequences
    await this.db.query('ALTER SEQUENCE users_id_seq RESTART WITH 1');
    await this.db.query('ALTER SEQUENCE tasks_id_seq RESTART WITH 1');
  }

  /**
   * Create a test user in the database
   */
  async createUser(userData = {}) {
    const defaultUser = {
      email: `testuser${Date.now()}@example.com`,
      password: 'TestPassword123',
      ...userData
    };

    const hashedPassword = await bcrypt.hash(defaultUser.password, 10);
    
    const result = await this.db.query(
      'INSERT INTO users (email, password) VALUES ($1, $2) RETURNING *',
      [defaultUser.email, hashedPassword]
    );

    return {
      ...result.rows[0],
      password: defaultUser.password // Return plain password for testing
    };
  }

  /**
   * Create a test task in the database
   */
  async createTask(taskData = {}) {
    const defaultTask = {
      title: 'Test Task',
      description: 'Test Description',
      status: 'pending',
      priority: 'medium',
      user_id: 1,
      ...taskData
    };

    const result = await this.db.query(
      `INSERT INTO tasks (title, description, status, priority, user_id) 
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [defaultTask.title, defaultTask.description, defaultTask.status, defaultTask.priority, defaultTask.user_id]
    );

    return result.rows[0];
  }

  /**
   * Get user by email
   */
  async getUserByEmail(email) {
    const result = await this.db.query('SELECT * FROM users WHERE email = $1', [email]);
    return result.rows[0] || null;
  }

  /**
   * Get task by ID
   */
  async getTaskById(id) {
    const result = await this.db.query('SELECT * FROM tasks WHERE id = $1', [id]);
    return result.rows[0] || null;
  }

  /**
   * Get all tasks for a user
   */
  async getTasksByUserId(userId) {
    const result = await this.db.query(
      'SELECT * FROM tasks WHERE user_id = $1 ORDER BY created_at DESC',
      [userId]
    );
    return result.rows;
  }

  /**
   * Get task statistics for a user
   */
  async getTaskStats(userId) {
    const result = await this.db.query(`
      SELECT 
        COUNT(*) as total_tasks,
        COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_tasks,
        COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_tasks,
        COUNT(CASE WHEN priority = 'high' THEN 1 END) as high_priority_tasks,
        COUNT(CASE WHEN priority = 'medium' THEN 1 END) as medium_priority_tasks,
        COUNT(CASE WHEN priority = 'low' THEN 1 END) as low_priority_tasks
      FROM tasks 
      WHERE user_id = $1
    `, [userId]);

    const stats = result.rows[0];
    return {
      totalTasks: parseInt(stats.total_tasks),
      pendingTasks: parseInt(stats.pending_tasks),
      completedTasks: parseInt(stats.completed_tasks),
      highPriorityTasks: parseInt(stats.high_priority_tasks),
      mediumPriorityTasks: parseInt(stats.medium_priority_tasks),
      lowPriorityTasks: parseInt(stats.low_priority_tasks),
      completionRate: stats.total_tasks > 0 ? 
        Math.round((parseInt(stats.completed_tasks) / parseInt(stats.total_tasks)) * 100) : 0
    };
  }

  /**
   * Update task in database
   */
  async updateTask(id, userId, updateData) {
    const validFields = ['title', 'description', 'status', 'priority'];
    const updates = [];
    const values = [];
    let paramCount = 1;

    for (const [key, value] of Object.entries(updateData)) {
      if (validFields.includes(key) && value !== undefined) {
        updates.push(`${key} = $${paramCount}`);
        values.push(value);
        paramCount++;
      }
    }

    if (updates.length === 0) {
      throw new Error('No valid fields to update');
    }

    updates.push(`updated_at = CURRENT_TIMESTAMP`);
    values.push(id, userId);

    const query = `
      UPDATE tasks 
      SET ${updates.join(', ')} 
      WHERE id = $${paramCount} AND user_id = $${paramCount + 1} 
      RETURNING *
    `;

    const result = await this.db.query(query, values);
    
    if (result.rows.length === 0) {
      throw new Error('Task not found or not owned by user');
    }

    return result.rows[0];
  }

  /**
   * Delete task from database
   */
  async deleteTask(id) {
    const result = await this.db.query('DELETE FROM tasks WHERE id = $1 RETURNING *', [id]);
    return result.rows.length > 0;
  }

  /**
   * Close database connection
   */
  async close() {
    if (this.db) {
      await this.db.close();
      this.db = null;
      this.isInitialized = false;
    }
  }

  /**
   * Get database instance
   */
  getDb() {
    if (!this.db) {
      throw new Error('Database not initialized');
    }
    return this.db;
  }

  /**
   * Execute raw query
   */
  async query(sql, params = []) {
    if (!this.db) {
      throw new Error('Database not initialized');
    }
    return await this.db.query(sql, params);
  }

  /**
   * Seed database with test data
   */
  async seedTestData() {
    await this.cleanAll();

    // Create test users
    const user1 = await this.createUser({
      email: 'user1@test.com',
      password: 'Password123'
    });

    const user2 = await this.createUser({
      email: 'user2@test.com',
      password: 'Password123'
    });

    // Create test tasks for user1
    await this.createTask({
      title: 'User 1 Task 1',
      description: 'First task for user 1',
      status: 'pending',
      priority: 'high',
      user_id: user1.id
    });

    await this.createTask({
      title: 'User 1 Task 2',
      description: 'Second task for user 1',
      status: 'completed',
      priority: 'medium',
      user_id: user1.id
    });

    // Create test tasks for user2
    await this.createTask({
      title: 'User 2 Task 1',
      description: 'First task for user 2',
      status: 'pending',
      priority: 'low',
      user_id: user2.id
    });

    return { user1, user2 };
  }
}

module.exports = TestDatabaseManager;
