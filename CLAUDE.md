# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Backend Commands
- `npm start` - Start production server on port 3000
- `npm run dev` - Start development server with auto-restart (nodemon)
- `npm test` - Run unit tests
- `npm run test:watch` - Run tests in watch mode
- `npm run test:coverage` - Run tests with coverage report
- `npm run test:integration` - Run integration tests
- `npm run test:all` - Run both unit and integration tests

### Testing Single Components
- `npm test -- --testNamePattern="auth"` - Run auth-related tests only
- `npm test -- --testNamePattern="tasks"` - Run task-related tests only

## Architecture Overview

### Technology Stack
- **Backend**: Express.js with pg-mem (in-memory PostgreSQL database)
- **Authentication**: JWT with bcrypt password hashing
- **Testing**: Jest with supertest for API testing

### Database Architecture (pg-mem)
The application uses pg-mem, an in-memory PostgreSQL implementation:
- **Data is ephemeral** - lost on server restart (by design for development)
- Database automatically initializes on startup with schema creation
- Located in `utils/database.js` with singleton pattern
- Schema includes users and tasks tables with proper foreign key relationships

### Authentication Flow
1. Users register/login via `/api/auth` endpoints
2. JWT tokens issued with configurable expiration (default 24h)
3. Protected routes use `authenticateToken` middleware

### Backend Architecture
- **Entry Point**: `server.js` - Express app with comprehensive middleware stack
- **Routes**: Modular route handlers in `routes/` directory
  - `auth.js` - Registration and login endpoints
  - `tasks.js` - CRUD operations for tasks
- **Models**: Database abstraction layer in `models/` directory
  - `User.js` - User model with password hashing
  - `Task.js` - Task model with validation and ownership checks
- **Middleware**: Security and authentication in `middleware/`
  - `auth.js` - JWT token verification
  - `security.js` - Security headers, rate limiting, input sanitization
- **Utils**: Shared utilities in `utils/`
  - `database.js` - pg-mem database singleton and query functions
  - `validation.js` - Input validation helpers
  - `errors.js` - Centralized error handling classes


### Security Implementation
- Comprehensive security middleware stack applied to all requests
- Rate limiting (100 requests per 15 minutes by default)
- Input sanitization and request size limiting
- Security headers (helmet.js)
- JWT token expiration and proper error handling
- User-specific data isolation (tasks belong to users)

## Development Patterns

### Error Handling
- Custom error classes in `utils/errors.js` (AppError, ValidationError)
- Global error handler in `server.js` with specific error type handling
- Consistent error response format across all endpoints

### Database Patterns
- All database operations use parameterized queries to prevent SQL injection
- Models handle data validation and business logic
- Static methods for database operations, instance methods for object manipulation
- Proper foreign key relationships with CASCADE delete

### Testing Strategy
- **Unit Tests**: Individual component/function testing
- **Integration Tests**: Full API endpoint testing with database
- **Separation**: Different Jest configs for unit vs integration tests
- **Coverage**: Comprehensive coverage reporting enabled

### Code Organization
- Feature-based organization for backend
- Separation of concerns with dedicated layers (routes, models, middleware)
- Consistent naming conventions (camelCase for JS, kebab-case for files)

## Important Notes

### Database Behavior
- pg-mem creates a fresh database on each server start
- No migrations needed - schema is created programmatically
- Perfect for development/testing but not suitable for production data persistence

### Environment Configuration
The app expects these environment variables:
- `JWT_SECRET` - Secret for JWT signing
- `JWT_EXPIRES_IN` - Token expiration (default: 24h)
- `PORT` - Server port (default: 3000)
- `CORS_ORIGIN` - Allowed origin (default: * for development)

### Adding New Features
1. Backend: Create route → model methods → add tests
2. Always run tests before committing changes
3. Follow existing patterns for consistency