# Integration Tests

This directory contains comprehensive integration tests that test the actual application code end-to-end, unlike the unit tests which use mocks.

## Overview

The integration tests:
- Use real database connections (pg-mem in-memory database)
- Execute actual application code paths
- Test complete request/response cycles
- Verify database persistence
- Test middleware and security features
- Provide real test coverage metrics

## Test Structure

### Configuration Files
- `jest.integration.config.js` - Jest configuration for integration tests
- `globalSetup.js` - Global setup that runs once before all tests
- `globalTeardown.js` - Global cleanup that runs once after all tests
- `setup.js` - Setup that runs before each test file
- `TestDatabaseManager.js` - Database utilities for test management

### Test Files
- `auth.integration.test.js` - Authentication endpoints and JWT handling
- `tasks.integration.test.js` - Task CRUD operations and business logic
- `middleware.integration.test.js` - Middleware, security, and error handling

## Running Tests

### Separate Commands
```bash
# Run only unit tests (with mocks)
npm run test:unit

# Run only integration tests (real code)
npm run test:integration

# Run both unit and integration tests
npm run test:all
```

### Coverage Reports
```bash
# Unit test coverage
npm run test:unit:coverage

# Integration test coverage
npm run test:integration:coverage

# Combined coverage
npm run test:all:coverage
```

### Watch Mode
```bash
# Watch unit tests
npm run test:unit:watch

# Watch integration tests
npm run test:integration:watch
```

## Test Features

### Authentication Tests
- User registration with validation
- Login with JWT token generation
- Token refresh functionality
- Logout and token invalidation
- Password hashing and security
- JWT token validation and expiration

### Task Management Tests
- Create tasks with validation
- Retrieve tasks with pagination and filtering
- Update tasks with ownership verification
- Delete tasks with proper authorization
- Task statistics and analytics
- Database persistence verification

### Middleware and Security Tests
- Authentication middleware
- Rate limiting
- Security headers (Helmet)
- CORS handling
- Input validation and sanitization
- Error handling and logging
- Request/response processing

### Database Integration
- Real database operations
- Transaction handling
- Data persistence
- Referential integrity
- Performance under load

## Test Utilities

### TestHelper Class
Provides utilities for:
- Creating test users and authentication tokens
- Creating test tasks
- Database cleanup
- Token generation and validation

### TestDatabaseManager Class
Manages test database:
- Schema creation and initialization
- Data seeding and cleanup
- User and task creation
- Statistics and analytics
- Raw query execution

## Coverage Metrics

Integration tests provide real coverage metrics by:
- Executing actual application code
- Testing all code paths and branches
- Verifying database interactions
- Testing error handling scenarios
- Validating middleware functionality

## Best Practices

1. **Isolation**: Each test cleans up after itself
2. **Real Data**: Tests use real database operations
3. **Comprehensive**: Tests cover happy paths and error cases
4. **Performance**: Tests run efficiently with proper setup/teardown
5. **Maintainable**: Clear test structure and utilities

## Troubleshooting

### Common Issues
1. **Database Connection**: Ensure pg-mem is properly initialized
2. **Token Expiration**: Use fresh tokens for each test
3. **Data Cleanup**: Verify cleanup between tests
4. **Port Conflicts**: Ensure test server runs on different port

### Debugging
- Use `--verbose` flag for detailed output
- Check database state with TestDatabaseManager
- Verify token validity with TestHelper
- Monitor coverage reports for gaps
