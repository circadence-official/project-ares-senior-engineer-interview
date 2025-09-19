const { newDb } = require('pg-mem');
require('dotenv').config();

// Create in-memory database instance (singleton pattern)
let dbInstance = null;
let poolInstance = null;

function getDatabaseInstance() {
  if (!dbInstance) {
    dbInstance = newDb();
    // Get the pg adapter for better compatibility
    const { Pool } = dbInstance.adapters.createPg();
    
    // Create connection pool using pg-mem's pg adapter
    poolInstance = new Pool({
      // pg-mem doesn't need connection details
    });
  }
  return { db: dbInstance, pool: poolInstance };
}

// Initialize the database instance
const { db, pool } = getDatabaseInstance();

// Initialize database with schema
async function initializeDatabase() {
  try {
    console.log('Initializing pg-mem database...');
    
    // Check if tables already exist
    let tablesExist = false;
    try {
      await pool.query('SELECT 1 FROM users LIMIT 1');
      await pool.query('SELECT 1 FROM tasks LIMIT 1');
      tablesExist = true;
      console.log('✅ Database tables already exist, skipping initialization');
    } catch (error) {
      // Tables don't exist, proceed with creation
    }
    
    if (!tablesExist) {
      // Create tables
      await pool.query(`
        -- Create users table
        CREATE TABLE users (
            id SERIAL PRIMARY KEY,
            email VARCHAR(255) UNIQUE NOT NULL,
            password VARCHAR(255) NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );

        -- Create tasks table
        CREATE TABLE tasks (
            id SERIAL PRIMARY KEY,
            title VARCHAR(255) NOT NULL,
            description TEXT,
            status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'completed')),
            priority VARCHAR(10) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
            user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );

        -- Create indexes for better performance
        CREATE INDEX idx_tasks_user_id ON tasks(user_id);
        CREATE INDEX idx_tasks_status ON tasks(status);
        CREATE INDEX idx_tasks_priority ON tasks(priority);
        CREATE INDEX idx_tasks_created_at ON tasks(created_at);
        CREATE INDEX idx_users_email ON users(email);
      `);

      console.log('✅ pg-mem database initialized successfully!');
      console.log('Tables created:');
      console.log('- users (id, email, password, created_at)');
      console.log('- tasks (id, title, description, status, priority, user_id, created_at, updated_at)');
      console.log('Indexes created for better performance');
    }
    
  } catch (error) {
    console.error('❌ Database initialization failed:', error);
    throw error;
  }
}

// Query function for executing SQL queries
const query = async (text, params) => {
  const start = Date.now();
  try {
    // Ensure database is initialized before querying
    await ensureDatabaseInitialized();
    
    const res = await pool.query(text, params);
    const duration = Date.now() - start;
    console.log('Executed query', { text, duration, rows: res.rowCount });
    return res;
  } catch (error) {
    console.error('Database query error:', error);
    throw error;
  }
};

// Ensure database is initialized
async function ensureDatabaseInitialized() {
  try {
    // Check if tables exist
    await pool.query('SELECT 1 FROM users LIMIT 1');
    await pool.query('SELECT 1 FROM tasks LIMIT 1');
  } catch (error) {
    // Tables don't exist, initialize them
    console.log('Database not initialized, initializing now...');
    await initializeDatabase();
  }
}

// Get client from database (for transactions)
const getClient = async () => {
  await ensureDatabaseInitialized();
  return pool.connect();
};

// Close the database (no-op for pg-mem)
const closePool = async () => {
  // pg-mem doesn't require explicit closing
  console.log('pg-mem database cleanup completed');
};

// Check if database is properly set up
const checkDatabaseSetup = async () => {
  try {
    // Ensure database is initialized first
    await ensureDatabaseInitialized();
    
    // Check if tables exist by trying to query them
    let tableNames = [];
    
    try {
      await pool.query('SELECT 1 FROM users LIMIT 1');
      tableNames.push('users');
    } catch (error) {
      // users table doesn't exist
    }
    
    try {
      await pool.query('SELECT 1 FROM tasks LIMIT 1');
      tableNames.push('tasks');
    } catch (error) {
      // tasks table doesn't exist
    }
    
    if (tableNames.length === 2) {
      console.log('✅ Database setup is correct');
      console.log('✅ Tables found:', tableNames.join(', '));
      return true;
    } else {
      console.log('❌ Database setup is incomplete');
      console.log('❌ Expected tables: users, tasks');
      console.log('❌ Found tables:', tableNames.join(', '));
      return false;
    }
    
  } catch (error) {
    console.error('❌ Database check failed:', error.message);
    return false;
  }
};

module.exports = {
  db,
  query,
  getClient,
  closePool,
  initializeDatabase,
  checkDatabaseSetup,
  ensureDatabaseInitialized
};
