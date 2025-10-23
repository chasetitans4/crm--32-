/**
 * Global Jest setup file
 * Runs once before all test suites
 */

// const { server } = require('../mocks/server');

module.exports = async () => {
  // Start MSW server for API mocking
  // server.listen({
  //   onUnhandledRequest: 'warn'
  // });
  
  // Set up global test environment variables
  process.env.NODE_ENV = 'test';
  process.env.NEXT_PUBLIC_API_URL = 'http://localhost:3000/api';
  
  // Mock console methods to reduce noise in tests
  global.console = {
    ...console,
    // Uncomment to silence console.log in tests
    // log: () => {},
    debug: () => {},
    info: () => {},
    warn: () => {},
    error: () => {},
  };
  
  // Set up global test utilities
  global.testTimeout = 10000;
  
  console.log('🧪 Global test setup completed');
};