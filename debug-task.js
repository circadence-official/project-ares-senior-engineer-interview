const express = require('express');
const Task = require('./models/Task');
const User = require('./models/User');
const { initializeDatabase } = require('./utils/database');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const app = express();
app.use(express.json());

// Simple authentication middleware
const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access token required'
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId);
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid token - user not found'
      });
    }

    req.user = { id: user.id, email: user.email };
    next();
  } catch (error) {
    console.error('Auth error:', error);
    return res.status(401).json({
      success: false,
      message: 'Invalid token'
    });
  }
};

// Simple task creation route
app.post('/test-task', authenticateToken, async (req, res) => {
  try {
    console.log('Task creation request received');
    console.log('User:', req.user);
    console.log('Body:', req.body);
    
    const { title, description, priority = 'medium' } = req.body;
    const userId = req.user.id;
    
    console.log('Creating task with:', { title, description, priority, userId });
    
    const newTask = await Task.create({
      title,
      description,
      priority,
      userId
    });
    
    console.log('Task created successfully:', newTask);
    
    res.status(201).json({
      success: true,
      message: 'Task created successfully',
      data: { task: newTask.toJSON() }
    });
  } catch (error) {
    console.error('Task creation error:', error);
    res.status(500).json({
      success: false,
      message: 'Task creation failed',
      error: error.message
    });
  }
});

// Start server
const startServer = async () => {
  try {
    await initializeDatabase();
    console.log('Database initialized');
    
    const server = app.listen(3001, () => {
      console.log('Debug server running on port 3001');
    });
    
    return server;
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
