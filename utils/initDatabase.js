const { initializeDatabase, checkDatabaseSetup } = require('./database');

// Run initialization if this file is executed directly
if (require.main === module) {
  const command = process.argv[2];
  
  if (command === 'check') {
    checkDatabaseSetup()
      .then(success => process.exit(success ? 0 : 1))
      .catch(error => {
        console.error('Check failed:', error);
        process.exit(1);
      });
  } else {
    initializeDatabase()
      .then(() => process.exit(0))
      .catch(error => {
        console.error('Initialization failed:', error);
        process.exit(1);
      });
  }
}

module.exports = {
  initializeDatabase,
  checkDatabaseSetup
};
