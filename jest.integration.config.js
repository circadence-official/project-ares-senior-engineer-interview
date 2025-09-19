module.exports = {
  testEnvironment: 'node',
  testMatch: [
    '**/integration-tests/**/*.test.js',
    '**/integration-tests/**/*.spec.js'
  ],
  collectCoverageFrom: [
    'routes/**/*.js',
    'models/**/*.js',
    'middleware/**/*.js',
    'utils/**/*.js',
    'server.js',
    '!**/node_modules/**',
    '!**/coverage/**',
    '!**/integration-tests/**'
  ],
  coverageDirectory: 'coverage/integration',
  coverageReporters: ['text', 'lcov', 'html'],
  testTimeout: 30000, // Longer timeout for integration tests
  verbose: true,
  setupFilesAfterEnv: ['<rootDir>/integration-tests/setup.js'],
  globalSetup: '<rootDir>/integration-tests/globalSetup.js',
  globalTeardown: '<rootDir>/integration-tests/globalTeardown.js',
  // Don't mock any modules for integration tests
  clearMocks: true,
  restoreMocks: true,
  // Set environment variables for tests
  setupFiles: ['<rootDir>/integration-tests/testEnv.js']
};
