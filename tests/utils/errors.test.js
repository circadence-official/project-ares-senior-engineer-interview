const {
  AppError,
  ValidationError,
  AuthenticationError,
  AuthorizationError,
  NotFoundError,
  ConflictError,
  DatabaseError,
  ServiceUnavailableError,
  handleCastErrorDB,
  handleDuplicateFieldsDB,
  handleValidationErrorDB,
  handleJWTError,
  handleJWTExpiredError,
  handlePostgresError,
  formatErrorResponse
} = require('../../utils/errors');

describe('Error Utilities', () => {
  describe('AppError', () => {
    test('should create AppError with correct properties', () => {
      const error = new AppError('Test error', 400);
      
      expect(error.message).toBe('Test error');
      expect(error.statusCode).toBe(400);
      expect(error.isOperational).toBe(true);
      expect(error.status).toBe('fail');
      expect(error.name).toBe('AppError');
    });

    test('should set status to "error" for 5xx status codes', () => {
      const error = new AppError('Server error', 500);
      expect(error.status).toBe('error');
    });

    test('should set status to "fail" for 4xx status codes', () => {
      const error = new AppError('Client error', 400);
      expect(error.status).toBe('fail');
    });

    test('should allow custom isOperational flag', () => {
      const error = new AppError('Test error', 400, false);
      expect(error.isOperational).toBe(false);
    });

    test('should capture stack trace', () => {
      const error = new AppError('Test error', 400);
      expect(error.stack).toBeDefined();
      expect(error.stack).toContain('AppError');
    });
  });

  describe('ValidationError', () => {
    test('should create ValidationError with correct properties', () => {
      const errors = [{ field: 'email', message: 'Invalid email' }];
      const error = new ValidationError('Validation failed', errors);
      
      expect(error.message).toBe('Validation failed');
      expect(error.statusCode).toBe(400);
      expect(error.errors).toEqual(errors);
      expect(error.name).toBe('ValidationError');
      expect(error.status).toBe('fail');
    });

    test('should create ValidationError with empty errors array by default', () => {
      const error = new ValidationError('Validation failed');
      expect(error.errors).toEqual([]);
    });

    test('should inherit from AppError', () => {
      const error = new ValidationError('Test');
      expect(error).toBeInstanceOf(AppError);
    });
  });

  describe('AuthenticationError', () => {
    test('should create AuthenticationError with default message', () => {
      const error = new AuthenticationError();
      
      expect(error.message).toBe('Authentication failed');
      expect(error.statusCode).toBe(401);
      expect(error.name).toBe('AuthenticationError');
      expect(error.status).toBe('fail');
    });

    test('should create AuthenticationError with custom message', () => {
      const error = new AuthenticationError('Custom auth error');
      
      expect(error.message).toBe('Custom auth error');
      expect(error.statusCode).toBe(401);
    });

    test('should inherit from AppError', () => {
      const error = new AuthenticationError();
      expect(error).toBeInstanceOf(AppError);
    });
  });

  describe('AuthorizationError', () => {
    test('should create AuthorizationError with default message', () => {
      const error = new AuthorizationError();
      
      expect(error.message).toBe('Access denied');
      expect(error.statusCode).toBe(403);
      expect(error.name).toBe('AuthorizationError');
      expect(error.status).toBe('fail');
    });

    test('should create AuthorizationError with custom message', () => {
      const error = new AuthorizationError('Custom authz error');
      
      expect(error.message).toBe('Custom authz error');
      expect(error.statusCode).toBe(403);
    });

    test('should inherit from AppError', () => {
      const error = new AuthorizationError();
      expect(error).toBeInstanceOf(AppError);
    });
  });

  describe('NotFoundError', () => {
    test('should create NotFoundError with default resource', () => {
      const error = new NotFoundError();
      
      expect(error.message).toBe('Resource not found');
      expect(error.statusCode).toBe(404);
      expect(error.name).toBe('NotFoundError');
      expect(error.status).toBe('fail');
    });

    test('should create NotFoundError with custom resource', () => {
      const error = new NotFoundError('User');
      
      expect(error.message).toBe('User not found');
      expect(error.statusCode).toBe(404);
    });

    test('should inherit from AppError', () => {
      const error = new NotFoundError();
      expect(error).toBeInstanceOf(AppError);
    });
  });

  describe('ConflictError', () => {
    test('should create ConflictError with default message', () => {
      const error = new ConflictError();
      
      expect(error.message).toBe('Resource already exists');
      expect(error.statusCode).toBe(409);
      expect(error.name).toBe('ConflictError');
      expect(error.status).toBe('fail');
    });

    test('should create ConflictError with custom message', () => {
      const error = new ConflictError('Custom conflict error');
      
      expect(error.message).toBe('Custom conflict error');
      expect(error.statusCode).toBe(409);
    });

    test('should inherit from AppError', () => {
      const error = new ConflictError();
      expect(error).toBeInstanceOf(AppError);
    });
  });

  describe('DatabaseError', () => {
    test('should create DatabaseError with default message', () => {
      const error = new DatabaseError();
      
      expect(error.message).toBe('Database operation failed');
      expect(error.statusCode).toBe(500);
      expect(error.name).toBe('DatabaseError');
      expect(error.status).toBe('error');
    });

    test('should create DatabaseError with custom message', () => {
      const error = new DatabaseError('Custom database error');
      
      expect(error.message).toBe('Custom database error');
      expect(error.statusCode).toBe(500);
    });

    test('should inherit from AppError', () => {
      const error = new DatabaseError();
      expect(error).toBeInstanceOf(AppError);
    });
  });

  describe('ServiceUnavailableError', () => {
    test('should create ServiceUnavailableError with default message', () => {
      const error = new ServiceUnavailableError();
      
      expect(error.message).toBe('Service temporarily unavailable');
      expect(error.statusCode).toBe(503);
      expect(error.name).toBe('ServiceUnavailableError');
      expect(error.status).toBe('error');
    });

    test('should create ServiceUnavailableError with custom message', () => {
      const error = new ServiceUnavailableError('Custom service error');
      
      expect(error.message).toBe('Custom service error');
      expect(error.statusCode).toBe(503);
    });

    test('should inherit from AppError', () => {
      const error = new ServiceUnavailableError();
      expect(error).toBeInstanceOf(AppError);
    });
  });

  describe('Error handling utilities', () => {
    describe('handleCastErrorDB', () => {
      test('should handle cast error correctly', () => {
        const castError = {
          path: 'age',
          value: 'invalid'
        };
        
        const error = handleCastErrorDB(castError);
        
        expect(error).toBeInstanceOf(ValidationError);
        expect(error.message).toBe('Invalid age: invalid');
        expect(error.statusCode).toBe(400);
      });

      test('should handle cast error with different field names', () => {
        const castError = {
          path: 'userId',
          value: 'not-a-number'
        };
        
        const error = handleCastErrorDB(castError);
        
        expect(error.message).toBe('Invalid userId: not-a-number');
      });
    });

    describe('handleDuplicateFieldsDB', () => {
      test('should handle duplicate field error correctly', () => {
        const duplicateError = {
          errmsg: 'E11000 duplicate key error collection: users index: email_1 dup key: { email: "test@example.com" }'
        };
        
        const error = handleDuplicateFieldsDB(duplicateError);
        
        expect(error).toBeInstanceOf(ConflictError);
        expect(error.message).toBe('Duplicate field value: "test@example.com". Please use another value!');
        expect(error.statusCode).toBe(409);
      });

      test('should handle duplicate field error with different values', () => {
        const duplicateError = {
          errmsg: 'E11000 duplicate key error collection: users index: username_1 dup key: { username: "admin" }'
        };
        
        const error = handleDuplicateFieldsDB(duplicateError);
        
        expect(error.message).toBe('Duplicate field value: "admin". Please use another value!');
      });
    });

    describe('handleValidationErrorDB', () => {
      test('should handle validation error correctly', () => {
        const validationError = {
          errors: {
            email: {
              path: 'email',
              message: 'Email is required',
              value: ''
            },
            password: {
              path: 'password',
              message: 'Password must be at least 6 characters',
              value: '123'
            }
          }
        };
        
        const error = handleValidationErrorDB(validationError);
        
        expect(error).toBeInstanceOf(ValidationError);
        expect(error.message).toBe('Invalid input data');
        expect(error.errors).toHaveLength(2);
        expect(error.errors[0]).toEqual({
          field: 'email',
          message: 'Email is required',
          value: ''
        });
        expect(error.errors[1]).toEqual({
          field: 'password',
          message: 'Password must be at least 6 characters',
          value: '123'
        });
      });

      test('should handle validation error with single field', () => {
        const validationError = {
          errors: {
            email: {
              path: 'email',
              message: 'Email is required',
              value: ''
            }
          }
        };
        
        const error = handleValidationErrorDB(validationError);
        
        expect(error.errors).toHaveLength(1);
        expect(error.errors[0].field).toBe('email');
      });
    });

    describe('handleJWTError', () => {
      test('should handle JWT error correctly', () => {
        const error = handleJWTError();
        
        expect(error).toBeInstanceOf(AuthenticationError);
        expect(error.message).toBe('Invalid token. Please log in again!');
        expect(error.statusCode).toBe(401);
      });
    });

    describe('handleJWTExpiredError', () => {
      test('should handle JWT expired error correctly', () => {
        const error = handleJWTExpiredError();
        
        expect(error).toBeInstanceOf(AuthenticationError);
        expect(error.message).toBe('Your token has expired! Please log in again.');
        expect(error.statusCode).toBe(401);
      });
    });

    describe('handlePostgresError', () => {
      test('should handle unique violation error', () => {
        const pgError = { code: '23505' };
        const error = handlePostgresError(pgError);
        
        expect(error).toBeInstanceOf(ConflictError);
        expect(error.message).toBe('Resource already exists');
        expect(error.statusCode).toBe(409);
      });

      test('should handle foreign key violation error', () => {
        const pgError = { code: '23503' };
        const error = handlePostgresError(pgError);
        
        expect(error).toBeInstanceOf(ValidationError);
        expect(error.message).toBe('Invalid reference to related resource');
        expect(error.statusCode).toBe(400);
      });

      test('should handle not null violation error', () => {
        const pgError = { code: '23502' };
        const error = handlePostgresError(pgError);
        
        expect(error).toBeInstanceOf(ValidationError);
        expect(error.message).toBe('Required field is missing');
        expect(error.statusCode).toBe(400);
      });

      test('should handle check violation error', () => {
        const pgError = { code: '23514' };
        const error = handlePostgresError(pgError);
        
        expect(error).toBeInstanceOf(ValidationError);
        expect(error.message).toBe('Field value violates constraint');
        expect(error.statusCode).toBe(400);
      });

      test('should handle undefined table error', () => {
        const pgError = { code: '42P01' };
        const error = handlePostgresError(pgError);
        
        expect(error).toBeInstanceOf(DatabaseError);
        expect(error.message).toBe('Database table not found');
        expect(error.statusCode).toBe(500);
      });

      test('should handle duplicate table error', () => {
        const pgError = { code: '42P07' };
        const error = handlePostgresError(pgError);
        
        expect(error).toBeInstanceOf(DatabaseError);
        expect(error.message).toBe('Database table already exists');
        expect(error.statusCode).toBe(500);
      });

      test('should handle unknown PostgreSQL error', () => {
        const pgError = { code: '99999' };
        const error = handlePostgresError(pgError);
        
        expect(error).toBeInstanceOf(DatabaseError);
        expect(error.message).toBe('Database operation failed');
        expect(error.statusCode).toBe(500);
      });

      test('should handle PostgreSQL error without code', () => {
        const pgError = {};
        const error = handlePostgresError(pgError);
        
        expect(error).toBeInstanceOf(DatabaseError);
        expect(error.message).toBe('Database operation failed');
        expect(error.statusCode).toBe(500);
      });
    });
  });

  describe('formatErrorResponse', () => {
    let mockReq;

    beforeEach(() => {
      mockReq = {
        method: 'POST',
        originalUrl: '/api/users',
        headers: { 'content-type': 'application/json' },
        body: { email: 'test@example.com' },
        params: { id: '123' },
        query: { page: '1' }
      };
    });

    test('should format basic error response', () => {
      const error = new AppError('Test error', 400);
      const response = formatErrorResponse(error, mockReq);
      
      expect(response).toEqual({
        success: false,
        message: 'Test error'
      });
    });

    test('should include stack trace in development', () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'development';
      
      const error = new AppError('Test error', 400);
      const response = formatErrorResponse(error, mockReq);
      
      expect(response.stack).toBeDefined();
      expect(response.error).toBeDefined();
      
      process.env.NODE_ENV = originalEnv;
    });

    test('should include validation errors', () => {
      const errors = [
        { field: 'email', message: 'Invalid email', value: 'invalid' }
      ];
      const error = new ValidationError('Validation failed', errors);
      const response = formatErrorResponse(error, mockReq);
      
      expect(response.errors).toEqual(errors);
    });

    test('should include request information in development', () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'development';
      
      const error = new AppError('Test error', 400);
      const response = formatErrorResponse(error, mockReq);
      
      expect(response.request).toEqual({
        method: 'POST',
        url: '/api/users',
        headers: { 'content-type': 'application/json' },
        body: { email: 'test@example.com' },
        params: { id: '123' },
        query: { page: '1' }
      });
      
      process.env.NODE_ENV = originalEnv;
    });

    test('should not include request information in production', () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'production';
      
      const error = new AppError('Test error', 400);
      const response = formatErrorResponse(error, mockReq);
      
      expect(response.request).toBeUndefined();
      expect(response.stack).toBeUndefined();
      expect(response.error).toBeUndefined();
      
      process.env.NODE_ENV = originalEnv;
    });

    test('should handle error without errors array', () => {
      const error = new AppError('Test error', 400);
      const response = formatErrorResponse(error, mockReq);
      
      expect(response.errors).toBeUndefined();
    });

    test('should handle error with non-array errors', () => {
      const error = {
        message: 'Test error',
        errors: 'Not an array'
      };
      const response = formatErrorResponse(error, mockReq);
      
      expect(response.errors).toBeUndefined();
    });
  });

  describe('Error inheritance chain', () => {
    test('all custom errors should inherit from AppError', () => {
      const errors = [
        new ValidationError('test'),
        new AuthenticationError('test'),
        new AuthorizationError('test'),
        new NotFoundError('test'),
        new ConflictError('test'),
        new DatabaseError('test'),
        new ServiceUnavailableError('test')
      ];

      errors.forEach(error => {
        expect(error).toBeInstanceOf(AppError);
        expect(error).toBeInstanceOf(Error);
      });
    });

    test('all custom errors should have correct status codes', () => {
      expect(new ValidationError('test').statusCode).toBe(400);
      expect(new AuthenticationError('test').statusCode).toBe(401);
      expect(new AuthorizationError('test').statusCode).toBe(403);
      expect(new NotFoundError('test').statusCode).toBe(404);
      expect(new ConflictError('test').statusCode).toBe(409);
      expect(new DatabaseError('test').statusCode).toBe(500);
      expect(new ServiceUnavailableError('test').statusCode).toBe(503);
    });

    test('all custom errors should have correct status', () => {
      expect(new ValidationError('test').status).toBe('fail');
      expect(new AuthenticationError('test').status).toBe('fail');
      expect(new AuthorizationError('test').status).toBe('fail');
      expect(new NotFoundError('test').status).toBe('fail');
      expect(new ConflictError('test').status).toBe('fail');
      expect(new DatabaseError('test').status).toBe('error');
      expect(new ServiceUnavailableError('test').status).toBe('error');
    });
  });
});
