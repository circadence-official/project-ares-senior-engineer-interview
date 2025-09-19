# Authentication System Documentation

This document describes the JWT-based authentication system implemented for the Task Management Application using pg-mem database.

## Overview

The authentication system uses JSON Web Tokens (JWT) for stateless authentication with pg-mem in-memory database, providing secure user registration, login, and token management.

## Features

- **JWT Token Authentication**: Stateless authentication using signed tokens
- **Password Security**: bcrypt hashing with 12 salt rounds
- **Token Refresh**: Refresh token mechanism for extended sessions
- **Input Validation**: Comprehensive validation using express-validator
- **Error Handling**: Structured error responses with appropriate HTTP status codes
- **Security Middleware**: Protection against common authentication vulnerabilities
- **pg-mem Integration**: User data stored in pg-mem in-memory database

## Authentication Flow

### 1. User Registration
```
POST /api/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securepassword123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "id": 1,
      "email": "user@example.com",
      "createdAt": "2024-01-01T00:00:00.000Z"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "tokens": {
      "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "expiresIn": "24h"
    }
  }
}
```

### 2. User Login
```
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securepassword123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": 1,
      "email": "user@example.com",
      "createdAt": "2024-01-01T00:00:00.000Z"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "tokens": {
      "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "expiresIn": "24h"
    }
  }
}
```

### 3. Token Refresh
```
POST /api/auth/refresh
Content-Type: application/json

{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response:**
```json
{
  "success": true,
  "message": "Token refreshed successfully",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "tokens": {
      "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "expiresIn": "24h"
    }
  }
}
```

### 4. Get Current User Info
```
GET /api/auth/me
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Response:**
```json
{
  "success": true,
  "message": "User information retrieved successfully",
  "data": {
    "user": {
      "id": 1,
      "email": "user@example.com",
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  }
}
```

### 5. Change Password
```
POST /api/auth/change-password
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json

{
  "currentPassword": "oldpassword123",
  "newPassword": "newpassword456"
}
```

### 6. Logout
```
POST /api/auth/logout
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Response:**
```json
{
  "success": true,
  "message": "Logged out successfully",
  "data": {
    "message": "Please remove the token from client storage"
  }
}
```

## API Endpoints

### Authentication Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/auth/register` | Register new user | No |
| POST | `/api/auth/login` | User login | No |
| POST | `/api/auth/refresh` | Refresh access token | No |
| GET | `/api/auth/me` | Get current user info | Yes |
| POST | `/api/auth/logout` | Logout user | Yes |
| POST | `/api/auth/change-password` | Change user password | Yes |

## JWT Token Structure

### Access Token Payload
```json
{
  "userId": 123,
  "iat": 1640995200,
  "exp": 1641081600
}
```

### Refresh Token Payload
```json
{
  "userId": 123,
  "type": "refresh",
  "iat": 1640995200,
  "exp": 1641600000
}
```

## Security Features

### Password Security
- **Hashing Algorithm**: bcrypt with 12 salt rounds
- **Minimum Length**: 6 characters
- **Maximum Length**: 128 characters
- **Requirements**: Must contain at least one letter and one number

### Token Security
- **Algorithm**: HMAC SHA256 (HS256)
- **Access Token Expiry**: 24 hours (configurable)
- **Refresh Token Expiry**: 7 days
- **Secret**: Stored in environment variables

### Input Validation
- **Email**: RFC-compliant email format validation
- **Password**: Strength requirements and length limits
- **Sanitization**: Automatic input sanitization and normalization

## Database Integration (pg-mem)

### User Storage
Users are stored in pg-mem in-memory database:

```sql
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Key Features
- **Automatic Schema**: Database schema created on server startup
- **Data Persistence**: Data lost on server restart (development only)
- **Real SQL**: Uses actual PostgreSQL SQL syntax
- **Zero Configuration**: No database server installation required

## Middleware Functions

### `authenticateToken`
Protects routes requiring authentication. Validates JWT token and adds user info to request object.

```javascript
app.get('/protected', authenticateToken, (req, res) => {
  // req.user contains { id, email }
  res.json({ user: req.user });
});
```

### `optionalAuth`
Optional authentication middleware that doesn't fail if no token is provided.

```javascript
app.get('/public', optionalAuth, (req, res) => {
  // req.user may or may not be present
  res.json({ user: req.user || null });
});
```

## Error Handling

### Authentication Errors

| Status Code | Error Type | Description |
|-------------|------------|-------------|
| 401 | `TOKEN_EXPIRED` | Access token has expired |
| 401 | `INVALID_TOKEN` | Invalid or malformed token |
| 401 | `INVALID_CREDENTIALS` | Wrong email or password |
| 401 | `INVALID_REFRESH_TOKEN` | Invalid or expired refresh token |
| 403 | `ACCESS_DENIED` | Insufficient permissions |
| 409 | `EMAIL_EXISTS` | Email already registered |
| 400 | `VALIDATION_ERROR` | Input validation failed |

### Error Response Format
```json
{
  "success": false,
  "message": "Error description",
  "errors": [
    {
      "field": "email",
      "message": "Valid email is required"
    }
  ]
}
```

## Environment Variables

```env
# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key_here
JWT_EXPIRES_IN=24h

# Application Configuration
NODE_ENV=development
PORT=3000
CORS_ORIGIN=*
```

## Usage Examples

### Client-Side Implementation

```javascript
// Register new user
const registerUser = async (email, password) => {
  const response = await fetch('/api/auth/register', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password }),
  });
  
  const data = await response.json();
  
  if (data.success) {
    // Store tokens securely
    localStorage.setItem('accessToken', data.data.tokens.accessToken);
    localStorage.setItem('refreshToken', data.data.tokens.refreshToken);
  }
  
  return data;
};

// Make authenticated requests
const fetchTasks = async () => {
  const token = localStorage.getItem('accessToken');
  
  const response = await fetch('/api/tasks', {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
  
  return response.json();
};

// Refresh expired token
const refreshToken = async () => {
  const refreshToken = localStorage.getItem('refreshToken');
  
  const response = await fetch('/api/auth/refresh', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ refreshToken }),
  });
  
  const data = await response.json();
  
  if (data.success) {
    localStorage.setItem('accessToken', data.data.tokens.accessToken);
    localStorage.setItem('refreshToken', data.data.tokens.refreshToken);
  }
  
  return data;
};
```

## Security Best Practices

### Server-Side
1. **Environment Variables**: Store JWT secret in environment variables
2. **HTTPS Only**: Always use HTTPS in production
3. **Token Expiry**: Use short-lived access tokens
4. **Input Validation**: Validate all inputs on the server
5. **Error Messages**: Don't reveal sensitive information in error messages
6. **Password Hashing**: Use bcrypt with appropriate salt rounds

### Client-Side
1. **Secure Storage**: Store tokens in httpOnly cookies or secure storage
2. **Token Refresh**: Implement automatic token refresh
3. **Logout**: Clear tokens on logout
4. **HTTPS**: Always use HTTPS for API calls

## Testing

### Manual Testing
```bash
# Register a new user
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'

# Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'

# Get user info
curl -X GET http://localhost:3000/api/auth/me \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"

# Refresh token
curl -X POST http://localhost:3000/api/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{"refreshToken":"YOUR_REFRESH_TOKEN"}'
```

### Automated Testing
The authentication system includes comprehensive test coverage for:
- Token generation and validation
- User registration and login
- Password security
- Error handling
- Middleware functionality
- pg-mem database integration

## Troubleshooting

### Common Issues

1. **"Access token required"**: Missing or malformed Authorization header
2. **"Token has expired"**: Access token needs to be refreshed
3. **"Invalid credentials"**: Wrong email or password
4. **"Email already exists"**: User is already registered
5. **"Database not initialized"**: pg-mem database needs to be initialized

### Debug Mode
Set `NODE_ENV=development` to enable detailed error logging and debugging information.

### Database Issues
```bash
# Check database setup
npm run db:check

# Initialize database
npm run db:init

# Test authentication middleware
npm run auth:test
```

## Production Considerations

### Database Migration
For production, replace pg-mem with real PostgreSQL:

1. **Install PostgreSQL**: Set up PostgreSQL database server
2. **Update Environment**: Add database connection variables
3. **Update Code**: Replace pg-mem with pg client
4. **Data Migration**: Migrate existing user data

### Security Enhancements
1. **Token Blacklisting**: Implement token revocation
2. **Rate Limiting**: Add authentication rate limiting
3. **Audit Logging**: Track authentication events
4. **Multi-Factor Authentication**: Add 2FA support

## Future Enhancements

1. **OAuth Integration**: Support for social login
2. **Session Management**: Server-side session tracking
3. **Password Reset**: Email-based password reset
4. **Account Lockout**: Brute force protection
5. **Audit Trail**: Comprehensive authentication logging

---

**Note**: This authentication system uses pg-mem for development and testing. For production deployments, replace pg-mem with a real PostgreSQL database for data persistence and scalability.