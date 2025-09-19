// Global teardown - runs once after all tests
module.exports = async () => {
  console.log('🧹 Cleaning up integration test environment...');
  
  // No explicit cleanup needed for pg-mem
  // The database will be garbage collected when the process ends
  
  console.log('✅ Integration test cleanup completed');
};
