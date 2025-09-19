const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { generateToken, generateRefreshToken } = require('../middleware/auth');
const { validate, validateUserRegistration, validateUserLogin, formatSuccessResponse, formatErrorResponse } = require('../utils/validation');

// POST /api/auth/register - Register new user
router.post('/register', validate(validateUserRegistration), async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if user already exists
    const existingUser = await User.findByEmail(email);
    if (existingUser) {
      return res.status(409).json(formatErrorResponse(
        'User with this email already exists',
        [{ field: 'email', message: 'Email is already registered' }]
      ));
    }

    // Create new user
    const user = await User.create(email, password);

    // Generate tokens
    const accessToken = generateToken(user.id);
    const refreshToken = generateRefreshToken(user.id);

    // Return success response
    res.status(201).json(formatSuccessResponse(
      'User registered successfully',
      {
        user: user.toJSON(),
        token: accessToken,
        refreshToken: refreshToken,
        tokens: {
          accessToken,
          refreshToken,
          expiresIn: process.env.JWT_EXPIRES_IN || '24h'
        }
      }
    ));

  } catch (error) {
    console.error('Registration error:', error);
    
    if (error.message === 'Email already exists') {
      return res.status(409).json(formatErrorResponse(
        'User with this email already exists',
        [{ field: 'email', message: 'Email is already registered' }]
      ));
    }

    res.status(500).json(formatErrorResponse(
      'Registration failed',
      'Internal server error'
    ));
  }
});

// POST /api/auth/login - User login
router.post('/login', validate(validateUserLogin), async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user by email
    const user = await User.findByEmail(email);
    if (!user) {
      return res.status(401).json(formatErrorResponse(
        'Invalid credentials',
        [{ field: 'email', message: 'Email or password is incorrect' }]
      ));
    }

    // Verify password
    const isValidPassword = await user.verifyPassword(password);
    if (!isValidPassword) {
      return res.status(401).json(formatErrorResponse(
        'Invalid credentials',
        [{ field: 'password', message: 'Email or password is incorrect' }]
      ));
    }

    // Generate tokens
    const accessToken = generateToken(user.id);
    const refreshToken = generateRefreshToken(user.id);

    // Return success response
    res.json(formatSuccessResponse(
      'Login successful',
      {
        user: user.toJSON(),
        token: accessToken,
        refreshToken: refreshToken,
        tokens: {
          accessToken,
          refreshToken,
          expiresIn: process.env.JWT_EXPIRES_IN || '24h'
        }
      }
    ));

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json(formatErrorResponse(
      'Login failed',
      'Internal server error'
    ));
  }
});

// POST /api/auth/refresh - Refresh access token
router.post('/refresh', async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json(formatErrorResponse(
        'Refresh token is required',
        [{ field: 'refreshToken', message: 'Refresh token is required' }]
      ));
    }

    // Verify refresh token
    const { verifyRefreshToken } = require('../middleware/auth');
    const decoded = verifyRefreshToken(refreshToken);

    // Check if user still exists
    const user = await User.findById(decoded.userId);
    if (!user) {
      return res.status(401).json(formatErrorResponse(
        'Invalid refresh token',
        [{ field: 'refreshToken', message: 'User not found' }]
      ));
    }

    // Generate new tokens
    const newAccessToken = generateToken(user.id);
    const newRefreshToken = generateRefreshToken(user.id);

    res.json(formatSuccessResponse(
      'Token refreshed successfully',
      {
        token: newAccessToken,
        refreshToken: newRefreshToken,
        tokens: {
          accessToken: newAccessToken,
          refreshToken: newRefreshToken,
          expiresIn: process.env.JWT_EXPIRES_IN || '24h'
        }
      }
    ));

  } catch (error) {
    console.error('Token refresh error:', error);
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json(formatErrorResponse(
        'Refresh token has expired',
        [{ field: 'refreshToken', message: 'Please login again' }]
      ));
    } else if (error.name === 'JsonWebTokenError') {
      return res.status(401).json(formatErrorResponse(
        'Invalid refresh token',
        [{ field: 'refreshToken', message: 'Invalid token format' }]
      ));
    }

    res.status(500).json(formatErrorResponse(
      'Token refresh failed',
      'Internal server error'
    ));
  }
});

// GET /api/auth/me - Get current user info
router.get('/me', require('../middleware/auth').authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json(formatErrorResponse(
        'User not found',
        'User account may have been deleted'
      ));
    }

    res.json(formatSuccessResponse(
      'User information retrieved successfully',
      { user: user.toJSON() }
    ));

  } catch (error) {
    console.error('Get user info error:', error);
    res.status(500).json(formatErrorResponse(
      'Failed to retrieve user information',
      'Internal server error'
    ));
  }
});

// POST /api/auth/logout - Logout (client-side token removal)
router.post('/logout', require('../middleware/auth').authenticateToken, (req, res) => {
  // Since we're using stateless JWT tokens, logout is handled client-side
  // In a production app, you might want to implement token blacklisting
  res.json(formatSuccessResponse(
    'Logout successful',
    { message: 'Please remove the token from client storage' }
  ));
});

// POST /api/auth/change-password - Change user password
router.post('/change-password', require('../middleware/auth').authenticateToken, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    // Validate input
    if (!currentPassword || !newPassword) {
      return res.status(400).json(formatErrorResponse(
        'Current password and new password are required',
        [
          { field: 'currentPassword', message: 'Current password is required' },
          { field: 'newPassword', message: 'New password is required' }
        ]
      ));
    }

    // Validate new password strength
    const passwordValidation = User.validatePassword(newPassword);
    if (!passwordValidation.valid) {
      return res.status(400).json(formatErrorResponse(
        'Invalid new password',
        [{ field: 'newPassword', message: passwordValidation.message }]
      ));
    }

    // Get user and verify current password
    const user = await User.findById(req.user.id);
    const isValidPassword = await user.verifyPassword(currentPassword);
    
    if (!isValidPassword) {
      return res.status(401).json(formatErrorResponse(
        'Invalid current password',
        [{ field: 'currentPassword', message: 'Current password is incorrect' }]
      ));
    }

    // Update password
    await user.updatePassword(newPassword);

    res.json(formatSuccessResponse(
      'Password changed successfully',
      { message: 'Your password has been updated' }
    ));

  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json(formatErrorResponse(
      'Failed to change password',
      'Internal server error'
    ));
  }
});

module.exports = router;
