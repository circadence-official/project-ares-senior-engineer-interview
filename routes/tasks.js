const express = require('express');
const router = express.Router();
const Task = require('../models/Task');
const { authenticateToken } = require('../middleware/auth');
const { validate, validateTaskCreation, validateTaskUpdate, validatePagination } = require('../utils/validation');
const { query } = require('express-validator');


// GET /api/tasks - Get all tasks for authenticated user with pagination
router.get('/', authenticateToken, validate(validatePagination), async (req, res) => {
  try {
    const { page = 1, limit = 10, status, priority } = req.query;
    const userId = req.user.id;

    const result = await Task.findByUserId(userId, parseInt(page), parseInt(limit), status, priority);

    res.json({
      success: true,
      data: result.tasks,
      pagination: {
        page: result.pagination.page,
        limit: result.pagination.limit,
        totalCount: result.pagination.totalCount,
        totalPages: result.pagination.totalPages,
        hasNextPage: result.pagination.hasNextPage,
        hasPrevPage: result.pagination.hasPrevPage
      }
    });
  } catch (error) {
    console.error('Get tasks error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve tasks',
      error: error.message
    });
  }
});

// GET /api/tasks/stats - Get task statistics for authenticated user
router.get('/stats', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const stats = await Task.getStats(userId);

    res.json({
      success: true,
      message: 'Statistics retrieved successfully',
      data: stats
    });
  } catch (error) {
    console.error('Get task stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve task statistics',
      error: error.message
    });
  }
});

// GET /api/tasks/:id - Get specific task by ID
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Validate task ID
    if (!id || isNaN(parseInt(id))) {
      return res.status(400).json({
        success: false,
        message: 'Valid task ID is required'
      });
    }

    const task = await Task.findById(parseInt(id), userId);

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }

    res.json({
      success: true,
      data: task
    });
  } catch (error) {
    console.error('Get task error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve task',
      error: error.message
    });
  }
});

// POST /api/tasks - Create new task
router.post('/', authenticateToken, validate(validateTaskCreation), async (req, res) => {
  try {
    const { title, description, status = 'pending', priority = 'medium' } = req.body;
    const userId = req.user.id;

    const newTask = await Task.create({
      title,
      description,
      status,
      priority,
      userId
    });

    res.status(201).json({
      success: true,
      message: 'Task created successfully',
      data: newTask
    });
  } catch (error) {
    console.error('Create task error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create task',
      error: error.message
    });
  }
});

// PUT /api/tasks/:id - Update existing task
router.put('/:id', authenticateToken, validate(validateTaskUpdate), async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const updateData = req.body;

    // Validate task ID
    if (!id || isNaN(parseInt(id))) {
      return res.status(400).json({
        success: false,
        message: 'Valid task ID is required'
      });
    }

    // Check if task exists and belongs to user
    const existingTask = await Task.findById(parseInt(id), userId);
    if (!existingTask) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }

    // Remove empty strings and undefined values
    const cleanUpdateData = {};
    Object.keys(updateData).forEach(key => {
      if (updateData[key] !== undefined && updateData[key] !== '') {
        cleanUpdateData[key] = updateData[key];
      }
    });

    // Check if there's anything to update
    if (Object.keys(cleanUpdateData).length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No valid fields to update'
      });
    }

    const updatedTask = await Task.update(parseInt(id), userId, cleanUpdateData);

    res.json({
      success: true,
      message: 'Task updated successfully',
      data: updatedTask
    });
  } catch (error) {
    console.error('Update task error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update task',
      error: error.message
    });
  }
});

// DELETE /api/tasks/:id - Delete task
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Validate task ID
    if (!id || isNaN(parseInt(id))) {
      return res.status(400).json({
        success: false,
        message: 'Valid task ID is required'
      });
    }

    // Check if task exists and belongs to user
    const existingTask = await Task.findById(parseInt(id), userId);
    if (!existingTask) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }

    await existingTask.delete();

    res.json({
      success: true,
      message: 'Task deleted successfully'
    });
  } catch (error) {
    console.error('Delete task error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete task',
      error: error.message
    });
  }
});

module.exports = router;
