require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { query, initializeDatabase } = require('./utils/database');

// Import routes
const authRoutes = require('./routes/auth');
const taskRoutes = require('./routes/tasks');

// Import middleware
const { authenticateToken } = require('./middleware/auth');
const { 
  securityHeaders, 
  additionalSecurityHeaders, 
  requestSizeLimiter, 
  inputSanitizer, 
  securityLogger 
} = require('./middleware/security');
const { 
  AppError, 
  ValidationError,
  formatErrorResponse, 
  handleJWTError, 
  handleJWTExpiredError, 
  handlePostgresError,
  handleCastErrorDB,
  handleDuplicateFieldsDB
} = require('./utils/errors');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
// Security headers (must be first)
app.use(securityHeaders);
app.use(additionalSecurityHeaders);

// Request logging and security monitoring
app.use(securityLogger);

// CORS configuration
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Request size limiting
app.use(requestSizeLimiter);

// Body parsing with size limits
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Input sanitization
app.use(inputSanitizer);

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path} - IP: ${req.ip}`);
  next();
});

// Health check endpoint
app.get('/health', async (req, res) => {
  try {
    // Test database connection
    await query('SELECT 1');
    res.status(200).json({
      success: true,
      message: 'Server is healthy',
      timestamp: new Date().toISOString(),
      database: 'connected',
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      version: process.version
    });
  } catch (error) {
    res.status(503).json({
      success: false,
      message: 'Server health check failed',
      timestamp: new Date().toISOString(),
      database: 'disconnected',
      error: error.message
    });
  }
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/tasks', taskRoutes);

// Protected route example
app.get('/api/protected', authenticateToken, (req, res) => {
  res.json({
    success: true,
    message: 'This is a protected route',
    user: req.user,
    timestamp: new Date().toISOString()
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Task Management API',
    version: '1.0.0',
    endpoints: {
      health: '/health',
      auth: '/api/auth',
      tasks: '/api/tasks',
      protected: '/api/protected'
    }
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
    path: req.originalUrl
  });
});

// Global error handler
app.use((error, req, res, next) => {
  console.error('Global error handler:', error);
  
  let err = { ...error };
  err.message = error.message;
  
  // Handle specific error types
  if (error.name === 'ValidationError') {
    err = new ValidationError('Validation failed', error.errors || []);
  } else if (error.name === 'CastError') {
    err = handleCastErrorDB(error);
  } else if (error.code === 11000) {
    err = handleDuplicateFieldsDB(error);
  } else if (error.name === 'JsonWebTokenError') {
    err = handleJWTError();
  } else if (error.name === 'TokenExpiredError') {
    err = handleJWTExpiredError();
  } else if (error.code && error.code.startsWith('23')) {
    err = handlePostgresError(error);
  } else if (error.type === 'entity.parse.failed') {
    // Handle JSON parsing errors from body-parser
    err = new AppError('Invalid JSON format', 400);
  } else if (!(error instanceof AppError)) {
    err = new AppError('Internal server error', 500);
  }
  
  // Format error response
  const errorResponse = formatErrorResponse(err, req);
  
  // Log error details
  console.error('Error Details:', {
    message: err.message,
    statusCode: err.statusCode,
    stack: err.stack,
    request: {
      method: req.method,
      url: req.originalUrl,
      ip: req.ip,
      userAgent: req.get('User-Agent')
    }
  });
  
  res.status(err.statusCode || 500).json(errorResponse);
});

// Graceful shutdown handling
const gracefulShutdown = (server) => (signal) => {
  console.log(`\n${signal} received. Starting graceful shutdown...`);
  
  server.close(() => {
    console.log('HTTP server closed.');
    process.exit(0);
  });
  
  // Force close after 10 seconds
  setTimeout(() => {
    console.error('Could not close connections in time, forcefully shutting down');
    process.exit(1);
  }, 10000);
};

// Start server
const startServer = async () => {
  try {
    // Initialize pg-mem database
    console.log('Initializing pg-mem database...');
    await initializeDatabase();
    console.log('✅ Database initialized successfully');
    
    const server = app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`📊 Health check: http://localhost:${PORT}/health`);
      console.log(`🔐 Auth endpoints: http://localhost:${PORT}/api/auth`);
      console.log(`📝 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`💾 Database: pg-mem (in-memory)`);
    });

    // Handle graceful shutdown
    process.on('SIGTERM', gracefulShutdown(server));
    process.on('SIGINT', gracefulShutdown(server));

    // Handle uncaught exceptions
    process.on('uncaughtException', (error) => {
      console.error('Uncaught Exception:', error);
      process.exit(1);
    });

    process.on('unhandledRejection', (reason, promise) => {
      console.error('Unhandled Rejection at:', promise, 'reason:', reason);
      process.exit(1);
    });

    return server;
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

// Start the server
startServer();

module.exports = app;
