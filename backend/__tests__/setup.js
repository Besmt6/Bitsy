import { jest } from '@jest/globals';

// Set test environment
process.env.NODE_ENV = 'test';
process.env.MONGO_URL = process.env.MONGO_URL || 'mongodb://localhost:27017';
process.env.DB_NAME = 'bitsy_test';
process.env.JWT_SECRET = 'test-secret-key';

// Mock console methods to reduce test output noise
global.console = {
  ...console,
  log: jest.fn(),
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
};
