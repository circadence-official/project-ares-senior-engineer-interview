# Database Setup Guide

This guide explains how the pg-mem in-memory database works in the Task Management Application.

## Overview

The application uses **pg-mem** (in-memory PostgreSQL) which provides:
- **Zero Configuration** - No database server installation required
- **Automatic Schema Creation** - Tables and indexes created on startup
- **Development Friendly** - Perfect for development and testing
- **PostgreSQL Compatibility** - Uses real PostgreSQL SQL syntax

## ⚠️ Important Notes

- **Data Persistence**: Data is **lost when the server restarts** (by design)
- **Development Only**: pg-mem is intended for development/testing environments
- **Production**: Replace with real PostgreSQL for production deployments

## Prerequisites

- Node.js 16+ installed
- No additional database software required
- pg-mem is automatically installed with the application

## Database Initialization

### Automatic Initialization

The database is automatically initialized when the server starts:

```bash
# Start the server (database initializes automatically)
npm start
# or
npm run dev
```

### Manual Database Commands

```bash
# Initialize database manually
npm run db:init

# Check database setup
npm run db:check

# Test authentication middleware
npm run auth:test
```

## Database Schema

### Users Table
```sql
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Tasks Table
```sql
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
```

## Indexes

The following indexes are automatically created for optimal performance:

- `idx_tasks_user_id` - For user-specific task queries
- `idx_tasks_status` - For filtering by status
- `idx_tasks_priority` - For filtering by priority
- `idx_tasks_created_at` - For sorting by creation date
- `idx_users_email` - For email-based user lookups

## Triggers

An automatic trigger updates the `updated_at` timestamp whenever a task is modified:

```sql
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_tasks_updated_at 
    BEFORE UPDATE ON tasks 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();
```

## Models

### User Model (`models/User.js`)
- Password hashing with bcrypt (12 salt rounds)
- Email validation and uniqueness
- Password strength validation
- CRUD operations with pg-mem

### Task Model (`models/Task.js`)
- Pagination support
- Status and priority validation
- User ownership validation
- Statistics calculation
- CRUD operations with pg-mem

## Database Utilities

### Database Connection (`utils/database.js`)

```javascript
const { newDb } = require('pg-mem');
const db = newDb();

// Initialize database with schema
async function initializeDatabase() {
  // Create tables, indexes, and triggers
  // Seed initial data if needed
}
```

### Key Functions

- `initializeDatabase()` - Creates schema and initializes database
- `checkDatabaseSetup()` - Verifies database is properly configured
- `query(sql, params)` - Execute SQL queries
- `getDatabaseInstance()` - Get pg-mem database instance

## Testing with pg-mem

### Integration Tests

The integration tests use pg-mem for realistic testing:

```bash
# Run integration tests (uses pg-mem)
npm run test:integration

# Run with coverage
npm run test:integration:coverage
```

### Test Database Management

```javascript
// TestDatabaseManager.js
class TestDatabaseManager {
  async initializeTestDatabase() {
    // Create fresh database for each test
  }
  
  async cleanupTestData() {
    // Clean up test data
  }
}
```

## Environment Configuration

### Development Environment

No database environment variables needed for pg-mem:

```env
# Optional: Database logging
NODE_ENV=development

# JWT Configuration
JWT_SECRET=your_jwt_secret_here
JWT_EXPIRES_IN=24h
```

### Production Migration

For production, replace pg-mem with real PostgreSQL:

```env
# PostgreSQL Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=task_management_db
DB_USER=your_db_user
DB_PASSWORD=your_db_password
```

## Database Operations

### Creating Users

```javascript
const user = await User.create({
  email: 'user@example.com',
  password: 'hashedPassword'
});
```

### Creating Tasks

```javascript
const task = await Task.create({
  title: 'Complete project',
  description: 'Finish the task management app',
  priority: 'high',
  userId: user.id
});
```

### Querying Tasks

```javascript
// Get user's tasks with pagination
const tasks = await Task.findByUserId(userId, {
  page: 1,
  limit: 10,
  status: 'pending'
});

// Get task statistics
const stats = await Task.getUserStats(userId);
```

## Performance Considerations

### pg-mem Limitations

- **Memory Usage**: All data stored in memory
- **Concurrent Access**: Limited concurrent user support
- **Data Persistence**: Data lost on restart
- **Production Scale**: Not suitable for production workloads

### Optimization Tips

- **Index Usage**: Proper indexes improve query performance
- **Query Optimization**: Use efficient SQL queries
- **Connection Pooling**: pg-mem handles connections automatically
- **Memory Management**: Monitor memory usage in development

## Troubleshooting

### Common Issues

1. **Database Not Initialized**
   ```bash
   # Check database setup
   npm run db:check
   
   # Reinitialize if needed
   npm run db:init
   ```

2. **Schema Errors**
   - Check server logs for initialization messages
   - Verify database schema creation
   - Restart server to reinitialize

3. **Data Loss**
   - This is expected behavior with pg-mem
   - Data is lost on server restart
   - Use real PostgreSQL for data persistence

4. **Performance Issues**
   - Monitor memory usage
   - Check query performance
   - Consider data cleanup for large datasets

### Debug Commands

```bash
# Test database connection
node -e "const db = require('./utils/database'); console.log('Database connected');"

# Check database schema
npm run db:check

# Test authentication
npm run auth:test
```

## Migration to Production

### Step 1: Install PostgreSQL

```bash
# Install PostgreSQL
# macOS
brew install postgresql

# Ubuntu/Debian
sudo apt-get install postgresql postgresql-contrib

# Windows
# Download from https://www.postgresql.org/download/windows/
```

### Step 2: Create Production Database

```sql
CREATE DATABASE task_management_db;
CREATE USER task_user WITH PASSWORD 'secure_password';
GRANT ALL PRIVILEGES ON DATABASE task_management_db TO task_user;
```

### Step 3: Update Environment Variables

```env
# Production Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=task_management_db
DB_USER=task_user
DB_PASSWORD=secure_password

# JWT Configuration
JWT_SECRET=your_production_jwt_secret
JWT_EXPIRES_IN=24h
NODE_ENV=production
```

### Step 4: Update Database Utilities

Replace pg-mem with pg (PostgreSQL client) in `utils/database.js`:

```javascript
const { Pool } = require('pg');

const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
});
```

## Security Notes

- **Password Hashing**: All passwords hashed with bcrypt (12 salt rounds)
- **SQL Injection**: Parameterized queries prevent SQL injection
- **Input Validation**: All inputs validated before database operations
- **Environment Variables**: Sensitive data stored in environment variables
- **Connection Security**: Use SSL connections in production

## Best Practices

1. **Development**: Use pg-mem for fast development and testing
2. **Testing**: Integration tests use pg-mem for consistency
3. **Production**: Always use real PostgreSQL for production
4. **Backups**: Implement regular backups for production data
5. **Monitoring**: Monitor database performance and memory usage
6. **Security**: Use strong passwords and secure connections

---

**Note**: pg-mem is perfect for development and testing, but always use a real PostgreSQL database for production deployments.