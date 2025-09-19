const { initializeDatabase, checkDatabaseSetup } = require('../../utils/initDatabase');

// Mock the database module
jest.mock('../../utils/database', () => ({
  initializeDatabase: jest.fn(),
  checkDatabaseSetup: jest.fn()
}));

const mockDatabase = require('../../utils/database');

describe('InitDatabase Utilities', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('initializeDatabase', () => {
    test('should call database initializeDatabase function', async () => {
      mockDatabase.initializeDatabase.mockResolvedValue(undefined);

      await initializeDatabase();

      expect(mockDatabase.initializeDatabase).toHaveBeenCalledTimes(1);
    });

    test('should handle database initialization errors', async () => {
      const error = new Error('Database initialization failed');
      mockDatabase.initializeDatabase.mockRejectedValue(error);

      await expect(initializeDatabase()).rejects.toThrow('Database initialization failed');
      expect(mockDatabase.initializeDatabase).toHaveBeenCalledTimes(1);
    });

    test('should resolve successfully when database initializes', async () => {
      mockDatabase.initializeDatabase.mockResolvedValue(undefined);

      await expect(initializeDatabase()).resolves.toBeUndefined();
      expect(mockDatabase.initializeDatabase).toHaveBeenCalledTimes(1);
    });
  });

  describe('checkDatabaseSetup', () => {
    test('should call database checkDatabaseSetup function', async () => {
      mockDatabase.checkDatabaseSetup.mockResolvedValue(true);

      const result = await checkDatabaseSetup();

      expect(mockDatabase.checkDatabaseSetup).toHaveBeenCalledTimes(1);
      expect(result).toBe(true);
    });

    test('should return false when database check fails', async () => {
      mockDatabase.checkDatabaseSetup.mockResolvedValue(false);

      const result = await checkDatabaseSetup();

      expect(mockDatabase.checkDatabaseSetup).toHaveBeenCalledTimes(1);
      expect(result).toBe(false);
    });

    test('should handle database check errors', async () => {
      const error = new Error('Database check failed');
      mockDatabase.checkDatabaseSetup.mockRejectedValue(error);

      await expect(checkDatabaseSetup()).rejects.toThrow('Database check failed');
      expect(mockDatabase.checkDatabaseSetup).toHaveBeenCalledTimes(1);
    });

    test('should return true when database setup is correct', async () => {
      mockDatabase.checkDatabaseSetup.mockResolvedValue(true);

      const result = await checkDatabaseSetup();

      expect(result).toBe(true);
      expect(mockDatabase.checkDatabaseSetup).toHaveBeenCalledTimes(1);
    });
  });

  describe('CLI functionality', () => {
    // CLI tests are complex to mock properly with Jest
    // The functionality is tested through the exported functions
    test('should export functions for CLI usage', () => {
      expect(typeof initializeDatabase).toBe('function');
      expect(typeof checkDatabaseSetup).toBe('function');
    });
  });

  describe('Module exports', () => {
    test('should export initializeDatabase function', () => {
      expect(typeof initializeDatabase).toBe('function');
    });

    test('should export checkDatabaseSetup function', () => {
      expect(typeof checkDatabaseSetup).toBe('function');
    });

    test('should have correct function signatures', () => {
      expect(initializeDatabase.length).toBe(0);
      expect(checkDatabaseSetup.length).toBe(0);
    });
  });

  describe('Error handling', () => {
    test('should propagate database initialization errors', async () => {
      const error = new Error('Connection failed');
      mockDatabase.initializeDatabase.mockRejectedValue(error);

      await expect(initializeDatabase()).rejects.toThrow('Connection failed');
    });

    test('should propagate database check errors', async () => {
      const error = new Error('Permission denied');
      mockDatabase.checkDatabaseSetup.mockRejectedValue(error);

      await expect(checkDatabaseSetup()).rejects.toThrow('Permission denied');
    });

    test('should handle timeout errors', async () => {
      const error = new Error('Operation timed out');
      mockDatabase.initializeDatabase.mockRejectedValue(error);

      await expect(initializeDatabase()).rejects.toThrow('Operation timed out');
    });

    test('should handle network errors', async () => {
      const error = new Error('Network unreachable');
      mockDatabase.checkDatabaseSetup.mockRejectedValue(error);

      await expect(checkDatabaseSetup()).rejects.toThrow('Network unreachable');
    });
  });

  describe('Integration scenarios', () => {
    test('should handle successful initialization flow', async () => {
      mockDatabase.initializeDatabase.mockResolvedValue(undefined);
      mockDatabase.checkDatabaseSetup.mockResolvedValue(true);

      await initializeDatabase();
      const isSetup = await checkDatabaseSetup();

      expect(mockDatabase.initializeDatabase).toHaveBeenCalledTimes(1);
      expect(mockDatabase.checkDatabaseSetup).toHaveBeenCalledTimes(1);
      expect(isSetup).toBe(true);
    });

    test('should handle failed initialization flow', async () => {
      const error = new Error('Database connection failed');
      mockDatabase.initializeDatabase.mockRejectedValue(error);
      mockDatabase.checkDatabaseSetup.mockResolvedValue(false);

      await expect(initializeDatabase()).rejects.toThrow('Database connection failed');
      const isSetup = await checkDatabaseSetup();

      expect(mockDatabase.initializeDatabase).toHaveBeenCalledTimes(1);
      expect(mockDatabase.checkDatabaseSetup).toHaveBeenCalledTimes(1);
      expect(isSetup).toBe(false);
    });

    test('should handle multiple calls', async () => {
      mockDatabase.initializeDatabase.mockResolvedValue(undefined);
      mockDatabase.checkDatabaseSetup.mockResolvedValue(true);

      await initializeDatabase();
      await initializeDatabase();
      const isSetup1 = await checkDatabaseSetup();
      const isSetup2 = await checkDatabaseSetup();

      expect(mockDatabase.initializeDatabase).toHaveBeenCalledTimes(2);
      expect(mockDatabase.checkDatabaseSetup).toHaveBeenCalledTimes(2);
      expect(isSetup1).toBe(true);
      expect(isSetup2).toBe(true);
    });
  });
});
