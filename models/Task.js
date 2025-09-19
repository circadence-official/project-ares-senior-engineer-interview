const { query } = require('../utils/database');

class Task {
  constructor(data) {
    this.id = data.id;
    this.title = data.title;
    this.description = data.description;
    this.status = data.status;
    this.priority = data.priority;
    this.userId = data.user_id;
    this.createdAt = data.created_at;
    this.updatedAt = data.updated_at;
  }

  // Create a new task
  static async create({ title, description, status = 'pending', priority = 'medium', userId }) {
    try {
      const result = await query(
        'INSERT INTO tasks (title, description, status, priority, user_id) VALUES ($1, $2, $3, $4, $5) RETURNING *',
        [title, description, status, priority, userId]
      );

      return new Task(result.rows[0]);
    } catch (error) {
      throw error;
    }
  }

  // Find task by ID
  static async findById(id, userId = null) {
    try {
      let queryText = 'SELECT * FROM tasks WHERE id = $1';
      let params = [id];
      
      if (userId) {
        queryText += ' AND user_id = $2';
        params.push(userId);
      }
      
      const result = await query(queryText, params);

      if (result.rows.length === 0) {
        return null;
      }

      return new Task(result.rows[0]);
    } catch (error) {
      throw error;
    }
  }

  // Find tasks by user ID with pagination
  static async findByUserId(userId, page = 1, limit = 10, status = null, priority = null) {
    try {
      let whereClause = 'WHERE user_id = $1';
      const params = [userId];
      let paramIndex = 2;

      if (status) {
        whereClause += ` AND status = $${paramIndex}`;
        params.push(status);
        paramIndex++;
      }

      if (priority) {
        whereClause += ` AND priority = $${paramIndex}`;
        params.push(priority);
        paramIndex++;
      }

      const offset = (page - 1) * limit;
      
      // Get total count
      const countResult = await query(
        `SELECT COUNT(*) FROM tasks ${whereClause}`,
        params
      );
      const totalCount = parseInt(countResult.rows[0].count);

      // Get tasks with pagination
      const result = await query(
        `SELECT * FROM tasks ${whereClause} ORDER BY created_at DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`,
        [...params, limit, offset]
      );

      const tasks = result.rows.map(row => new Task(row));

      return {
        tasks,
        pagination: {
          page,
          limit,
          totalCount,
          totalPages: Math.ceil(totalCount / limit),
          hasNextPage: page < Math.ceil(totalCount / limit),
          hasPrevPage: page > 1
        }
      };
    } catch (error) {
      throw error;
    }
  }

  // Update task
  async update(updateData) {
    try {
      const allowedFields = ['title', 'description', 'status', 'priority'];
      const updates = [];
      const values = [];
      let paramIndex = 1;

      for (const [key, value] of Object.entries(updateData)) {
        if (allowedFields.includes(key) && value !== undefined) {
          updates.push(`${key} = $${paramIndex}`);
          values.push(value);
          paramIndex++;
        }
      }

      if (updates.length === 0) {
        throw new Error('No valid fields to update');
      }

      updates.push(`updated_at = CURRENT_TIMESTAMP`);
      values.push(this.id);

      const result = await query(
        `UPDATE tasks SET ${updates.join(', ')} WHERE id = $${paramIndex} RETURNING *`,
        values
      );

      // Update instance properties
      const updatedTask = result.rows[0];
      this.title = updatedTask.title;
      this.description = updatedTask.description;
      this.status = updatedTask.status;
      this.priority = updatedTask.priority;
      this.updatedAt = updatedTask.updated_at;

      return this;
    } catch (error) {
      throw error;
    }
  }

  // Delete task
  async delete() {
    try {
      await query('DELETE FROM tasks WHERE id = $1', [this.id]);
      return true;
    } catch (error) {
      throw error;
    }
  }

  // Get task statistics for a user
  static async getStats(userId) {
    try {
      const result = await query(
        `SELECT 
          COUNT(*) as total_tasks,
          COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_tasks,
          COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_tasks,
          COUNT(CASE WHEN priority = 'high' THEN 1 END) as high_priority_tasks,
          COUNT(CASE WHEN priority = 'medium' THEN 1 END) as medium_priority_tasks,
          COUNT(CASE WHEN priority = 'low' THEN 1 END) as low_priority_tasks
        FROM tasks 
        WHERE user_id = $1`,
        [userId]
      );

      const stats = result.rows[0];
      return {
        totalTasks: parseInt(stats.total_tasks),
        pendingTasks: parseInt(stats.pending_tasks),
        completedTasks: parseInt(stats.completed_tasks),
        highPriorityTasks: parseInt(stats.high_priority_tasks),
        mediumPriorityTasks: parseInt(stats.medium_priority_tasks),
        lowPriorityTasks: parseInt(stats.low_priority_tasks),
        completionRate: stats.total_tasks > 0 ? 
          Math.round((stats.completed_tasks / stats.total_tasks) * 100) : 0
      };
    } catch (error) {
      throw error;
    }
  }

  // Alias for getStats for backward compatibility
  static async getStatsByUserId(userId) {
    return Task.getStats(userId);
  }

  // Static method to update a task by ID
  static async update(id, userId, updateData) {
    try {
      const allowedFields = ['title', 'description', 'status', 'priority'];
      const updates = [];
      const values = [];
      let paramIndex = 1;

      for (const [key, value] of Object.entries(updateData)) {
        if (allowedFields.includes(key) && value !== undefined) {
          updates.push(`${key} = $${paramIndex}`);
          values.push(value);
          paramIndex++;
        }
      }

      if (updates.length === 0) {
        throw new Error('No valid fields to update');
      }

      updates.push(`updated_at = CURRENT_TIMESTAMP`);
      values.push(id, userId);

      const result = await query(
        `UPDATE tasks SET ${updates.join(', ')} WHERE id = $${paramIndex} AND user_id = $${paramIndex + 1} RETURNING *`,
        values
      );

      if (result.rows.length === 0) {
        throw new Error('Task not found or not owned by user');
      }

      return new Task(result.rows[0]);
    } catch (error) {
      throw error;
    }
  }

  // Delete task by ID
  static async delete(id, userId) {
    try {
      const result = await query(
        'DELETE FROM tasks WHERE id = $1 AND user_id = $2 RETURNING *',
        [id, userId]
      );

      if (result.rows.length === 0) {
        throw new Error('Task not found or not owned by user');
      }

      return true;
    } catch (error) {
      throw error;
    }
  }

  // Get task data as JSON
  toJSON() {
    return {
      id: this.id,
      title: this.title,
      description: this.description,
      status: this.status,
      priority: this.priority,
      userId: this.userId,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    };
  }

  // Validate task data
  static validateTaskData(title, description, priority, status = null) {
    const errors = [];

    // Validate title
    if (!title || typeof title !== 'string' || title.trim().length === 0) {
      errors.push('Title is required and must be a non-empty string');
    } else if (title.length > 255) {
      errors.push('Title must be less than 255 characters');
    }

    // Validate description
    if (description && typeof description !== 'string') {
      errors.push('Description must be a string');
    } else if (description && description.length > 1000) {
      errors.push('Description must be less than 1000 characters');
    }

    // Validate priority
    const validPriorities = ['low', 'medium', 'high'];
    if (!priority || !validPriorities.includes(priority)) {
      errors.push('Priority must be one of: low, medium, high');
    }

    // Validate status if provided
    if (status !== null) {
      const validStatuses = ['pending', 'completed'];
      if (!validStatuses.includes(status)) {
        errors.push('Status must be one of: pending, completed');
      }
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  // Validate task ownership
  async isOwnedBy(userId) {
    return this.userId === userId;
  }
}

module.exports = Task;
