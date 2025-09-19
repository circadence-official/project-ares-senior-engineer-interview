const jwt = require('jsonwebtoken');
const User = require('../models/User');

// JWT Authentication Middleware
const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access token required'
      });
    }

    // Verify the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Get user from database to ensure they still exist
    const user = await User.findById(decoded.userId);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid token - user not found'
      });
    }

    // Add user info to request object
    req.user = {
      id: user.id,
      email: user.email
    };

    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token has expired',
        code: 'TOKEN_EXPIRED'
      });
    } else if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Invalid token',
        code: 'INVALID_TOKEN'
      });
    } else {
      console.error('Authentication error:', error);
      return res.status(500).json({
        success: false,
        message: 'Authentication failed'
      });
    }
  }
};

// Optional authentication middleware (doesn't fail if no token)
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.userId);
      
      if (user) {
        req.user = {
          id: user.id,
          email: user.email
        };
      }
    }

    next();
  } catch (error) {
    // Continue without authentication if token is invalid
    next();
  }
};

// Generate JWT token
const generateToken = (userId) => {
  const payload = {
    userId: userId,
    iat: Math.floor(Date.now() / 1000),
    jti: `${userId}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}` // Unique token ID
  };

  const options = {
    expiresIn: process.env.JWT_EXPIRES_IN || '24h',
    issuer: 'task-management-api',
    audience: 'task-management-client'
  };

  return jwt.sign(payload, process.env.JWT_SECRET, options);
};

// Generate refresh token (for future implementation)
const generateRefreshToken = (userId) => {
  const payload = {
    userId: userId,
    type: 'refresh',
    iat: Math.floor(Date.now() / 1000),
    jti: `refresh-${userId}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}` // Unique refresh token ID
  };

  const options = {
    expiresIn: '7d', // Refresh tokens last longer
    issuer: 'task-management-api',
    audience: 'task-management-client'
  };

  return jwt.sign(payload, process.env.JWT_SECRET, options);
};

// Verify refresh token
const verifyRefreshToken = (token) => {
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    if (decoded.type !== 'refresh') {
      throw new Error('Invalid token type');
    }
    
    return decoded;
  } catch (error) {
    throw error;
  }
};

// Extract token from request
const extractToken = (req) => {
  const authHeader = req.headers['authorization'];
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }
  return null;
};

// Check if user owns resource
const checkOwnership = (req, res, next) => {
  const resourceUserId = req.params.userId || req.body.userId || req.query.userId;
  
  if (resourceUserId && resourceUserId !== req.user.id.toString()) {
    return res.status(403).json({
      success: false,
      message: 'Access denied - insufficient permissions'
    });
  }
  
  next();
};

module.exports = {
  authenticateToken,
  optionalAuth,
  generateToken,
  generateRefreshToken,
  verifyRefreshToken,
  extractToken,
  checkOwnership
};
