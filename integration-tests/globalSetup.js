const { initializeDatabase, checkDatabaseSetup } = require('../utils/database');

// Global setup - runs once before all tests
module.exports = async () => {
  console.log('🚀 Setting up integration test environment...');
  
  try {
    // Initialize the database using the same setup as the main application
    await initializeDatabase();
    
    // Verify the database is properly set up
    const isSetup = await checkDatabaseSetup();
    if (!isSetup) {
      throw new Error('Database setup verification failed');
    }
    
    console.log('✅ Integration test database initialized and verified');
  } catch (error) {
    console.error('❌ Failed to initialize integration test database:', error);
    throw error;
  }
};
