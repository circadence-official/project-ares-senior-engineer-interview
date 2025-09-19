// Database configuration for integration tests
// This module allows overriding the database instance for testing

let testDbInstance = null;

/**
 * Set the test database instance
 * This should be called during test setup
 */
function setTestDatabase(dbInstance) {
  testDbInstance = dbInstance;
}

/**
 * Get the current database instance
 * Returns test database if set, otherwise returns null
 */
function getTestDatabase() {
  return testDbInstance;
}

/**
 * Clear the test database instance
 * This should be called during test teardown
 */
function clearTestDatabase() {
  testDbInstance = null;
}

module.exports = {
  setTestDatabase,
  getTestDatabase,
  clearTestDatabase
};
