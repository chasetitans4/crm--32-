/**
 * Global Jest teardown file
 * Runs once after all test suites
 */

// const { server } = require('../mocks/server');

module.exports = async () => {
  // Close MSW server
  // server.close();
  
  // Clean up any global resources
  if (global.gc) {
    global.gc();
  }
  
  // Reset environment variables
  delete process.env.NODE_ENV;
  delete process.env.NEXT_PUBLIC_API_URL;
  
  console.log('🧹 Global test teardown completed');
};