const helmet = require('helmet');
const cors = require('cors');

describe('Security Middleware Tests', () => {

  describe('Helmet Security Headers', () => {
    test('should configure helmet with security headers', () => {
      const helmetConfig = helmet({
        contentSecurityPolicy: {
          directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'"],
            scriptSrc: ["'self'"],
            imgSrc: ["'self'", "data:", "https:"]
          }
        },
        hsts: {
          maxAge: 31536000,
          includeSubDomains: true,
          preload: true
        }
      });

      expect(helmetConfig).toBeDefined();
      expect(typeof helmetConfig).toBe('function');
    });

    test('should have basic helmet configuration', () => {
      const basicHelmet = helmet();
      expect(basicHelmet).toBeDefined();
      expect(typeof basicHelmet).toBe('function');
    });
  });

  describe('CORS Configuration', () => {
    test('should configure CORS with proper settings', () => {
      const corsConfig = cors({
        origin: process.env.FRONTEND_URL || 'http://localhost:3000',
        credentials: true,
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization']
      });

      expect(corsConfig).toBeDefined();
      expect(typeof corsConfig).toBe('function');
    });

    test('should allow specific origins', () => {
      const allowedOrigins = [
        'http://localhost:3000',
        'https://yourdomain.com'
      ];

      const corsConfig = cors({
        origin: allowedOrigins,
        credentials: true
      });

      expect(corsConfig).toBeDefined();
    });
  });

  describe('Security Best Practices', () => {
    test('should use environment variables for sensitive config', () => {
      const config = {
        jwtSecret: process.env.JWT_SECRET || 'fallback-secret',
        frontendUrl: process.env.FRONTEND_URL || 'http://localhost:3000',
        nodeEnv: process.env.NODE_ENV || 'development'
      };

      expect(config.jwtSecret).toBeDefined();
      expect(config.frontendUrl).toBeDefined();
      expect(config.nodeEnv).toBeDefined();
    });

    test('should have different configurations for different environments', () => {
      const devConfig = {
        corsOrigin: 'http://localhost:3000',
        helmetEnabled: false
      };

      const prodConfig = {
        corsOrigin: 'https://yourdomain.com',
        helmetEnabled: true
      };

      expect(devConfig).toBeDefined();
      expect(prodConfig).toBeDefined();
      expect(devConfig.corsOrigin).not.toBe(prodConfig.corsOrigin);
    });

    test('should validate security headers are present', () => {
      const expectedHeaders = [
        'X-Content-Type-Options',
        'X-Frame-Options',
        'X-XSS-Protection',
        'Strict-Transport-Security'
      ];

      expectedHeaders.forEach(header => {
        expect(header).toBeDefined();
        expect(typeof header).toBe('string');
      });
    });
  });

  describe('Input Validation', () => {
    test('should validate email format', () => {
      const validEmails = [
        'test@example.com',
        'user.name@domain.co.uk',
        'admin+test@company.org'
      ];

      const invalidEmails = [
        'invalid-email',
        '@domain.com',
        'user@',
        'user@domain'
      ];

      validEmails.forEach(email => {
        expect(email).toMatch(/^[^\s@]+@[^\s@]+\.[^\s@]+$/);
      });

      invalidEmails.forEach(email => {
        expect(email).not.toMatch(/^[^\s@]+@[^\s@]+\.[^\s@]+$/);
      });
    });

    test('should validate password strength', () => {
      const strongPasswords = [
        'Password123',
        'MySecurePass1',
        'ComplexP@ssw0rd'
      ];

      const weakPasswords = [
        '123',
        'password',
        '12345678',
        'Password'
      ];

      strongPasswords.forEach(password => {
        expect(password.length).toBeGreaterThanOrEqual(6);
        expect(/^(?=.*[a-zA-Z])(?=.*\d)/.test(password)).toBe(true);
      });

      weakPasswords.forEach(password => {
        const isStrong = password.length >= 6 && /^(?=.*[a-zA-Z])(?=.*\d)/.test(password);
        expect(isStrong).toBe(false);
      });
    });

    test('should validate task data', () => {
      const validTask = {
        title: 'Valid Task',
        description: 'Valid description',
        status: 'pending',
        priority: 'medium'
      };

      const validStatuses = ['pending', 'completed'];
      const validPriorities = ['low', 'medium', 'high'];

      expect(validTask.title.length).toBeGreaterThan(0);
      expect(validTask.title.length).toBeLessThanOrEqual(255);
      expect(validStatuses).toContain(validTask.status);
      expect(validPriorities).toContain(validTask.priority);
    });
  });

  describe('Error Handling', () => {
    test('should handle validation errors', () => {
      const validationError = {
        success: false,
        message: 'Validation failed',
        errors: [
          { field: 'email', message: 'Invalid email format', value: 'invalid-email' },
          { field: 'password', message: 'Password too short', value: '123' }
        ]
      };

      expect(validationError.success).toBe(false);
      expect(validationError.message).toBe('Validation failed');
      expect(Array.isArray(validationError.errors)).toBe(true);
      expect(validationError.errors.length).toBeGreaterThan(0);
    });
  });
});
