const express = require('express');
const cors = require('cors');

// Import routes
const authRoutes = require('../routes/auth');
const taskRoutes = require('../routes/tasks');

// Import middleware
const { authenticateToken } = require('../middleware/auth');
const { 
  securityHeaders, 
  additionalSecurityHeaders, 
  requestSizeLimiter, 
  inputSanitizer, 
  securityLogger 
} = require('../middleware/security');
const { 
  AppError, 
  ValidationError,
  formatErrorResponse, 
  handleJWTError, 
  handleJWTExpiredError, 
  handlePostgresError,
  handleCastErrorDB,
  handleDuplicateFieldsDB
} = require('../utils/errors');

/**
 * Create test server instance
 * This is a simplified version of the main server for integration testing
 */
function createTestServer() {
  const app = express();

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

  // Body parsing middleware
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // Request size limiting
  app.use(requestSizeLimiter);

  // Input sanitization
  app.use(inputSanitizer);

  // Health check endpoint
  app.get('/api/health', (req, res) => {
    res.json({
      success: true,
      message: 'Server is healthy',
      timestamp: new Date().toISOString(),
      environment: 'test'
    });
  });

  // API Routes
  app.use('/api/auth', authRoutes);
  app.use('/api/tasks', authenticateToken, taskRoutes);

  // 404 handler
  app.use('*', (req, res) => {
    res.status(404).json({
      success: false,
      message: `Route ${req.originalUrl} not found`
    });
  });

  // Global error handling middleware
  app.use((err, req, res, next) => {
    let error = { ...err };
    error.message = err.message;

    // Log error
    console.error('Error:', err);

    // Handle specific error types
    if (err.name === 'JsonWebTokenError') {
      error = handleJWTError();
    } else if (err.name === 'TokenExpiredError') {
      error = handleJWTExpiredError();
    } else if (err.type === 'entity.parse.failed') {
      // Handle JSON parsing errors from body-parser
      error = new AppError('Invalid JSON format', 400);
    } else if (err.code === '23505') { // PostgreSQL unique violation
      error = handleDuplicateFieldsDB(err);
    } else if (err.code === '22P02') { // PostgreSQL invalid input syntax
      error = handleCastErrorDB(err);
    } else if (err.code && err.code.startsWith('23')) { // PostgreSQL foreign key, check constraint violations
      error = handlePostgresError(err);
    }

    // Format and send error response
    const errorResponse = formatErrorResponse(error, req);
    res.status(error.statusCode || errorResponse.statusCode || 500).json(errorResponse);
  });

  return app;
}

module.exports = createTestServer;
