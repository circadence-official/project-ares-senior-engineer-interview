// Set environment variables for integration tests
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-jwt-secret-key-for-integration-tests';
process.env.JWT_EXPIRES_IN = '24h';
process.env.CORS_ORIGIN = '*';

console.log('🔧 Test environment variables set');
console.log('JWT_SECRET:', process.env.JWT_SECRET ? 'Set' : 'Not set');
console.log('NODE_ENV:', process.env.NODE_ENV);
