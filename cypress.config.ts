import { defineConfig } from 'cypress';

// Helper function to get secure URL based on environment
const getSecureUrl = (defaultUrl: string): string => {
  // In production or CI, use HTTPS
  if (process.env.NODE_ENV === 'production' || process.env.CI) {
    return defaultUrl.replace('http://', 'https://')
  }
  // In development, allow HTTP for localhost
  return defaultUrl
}

export default defineConfig({
  e2e: {
    baseUrl: getSecureUrl('http://localhost:3000'),
    viewportWidth: 1280,
    viewportHeight: 720,
    video: true,
    screenshotOnRunFailure: true,
    defaultCommandTimeout: 10000,
    requestTimeout: 10000,
    responseTimeout: 10000,
    pageLoadTimeout: 30000,
    
    // Test files
    specPattern: 'cypress/e2e/**/*.cy.{js,jsx,ts,tsx}',
    supportFile: 'cypress/support/e2e.ts',
    fixturesFolder: 'cypress/fixtures',
    screenshotsFolder: 'cypress/screenshots',
    videosFolder: 'cypress/videos',
    downloadsFolder: 'cypress/downloads',
    
    // Browser settings
    chromeWebSecurity: false,
    modifyObstructiveCode: false,
    
    // Retry settings
    retries: {
      runMode: 2,
      openMode: 0,
    },
    
    // Environment variables
    env: {
      apiUrl: getSecureUrl('http://localhost:3000/api'),
      testUser: {
        email: 'test@example.com',
        password: 'password123',
      },
      adminUser: {
        email: 'admin@example.com',
        password: 'admin123',
      },
    },
    
    setupNodeEvents(on, config) {
      // Task definitions
      on('task', {
        // Database seeding
        seedDatabase() {
          // Implementation would depend on your database setup
          console.log('Seeding database for tests...');
          return null;
        },
        
        // Clear database
        clearDatabase() {
          console.log('Clearing database after tests...');
          return null;
        },
        
        // Log messages
        log(message) {
          console.log(message);
          return null;
        },
        
        // File operations
        readFile(filename) {
          const fs = require('fs');
          const path = require('path');
          return fs.readFileSync(path.resolve(filename), 'utf8');
        },
        
        // Generate test data
        generateTestData(type) {
          const faker = require('@faker-js/faker');
          
          switch (type) {
            case 'user':
              return {
                firstName: faker.person.firstName(),
                lastName: faker.person.lastName(),
                email: faker.internet.email(),
                phone: faker.phone.number(),
              };
            case 'contact':
              return {
                firstName: faker.person.firstName(),
                lastName: faker.person.lastName(),
                email: faker.internet.email(),
                phone: faker.phone.number(),
                company: faker.company.name(),
              };
            case 'deal':
              return {
                title: faker.commerce.productName(),
                amount: faker.number.int({ min: 1000, max: 100000 }),
                stage: faker.helpers.arrayElement(['lead', 'proposal', 'negotiation', 'closed']),
                probability: faker.number.int({ min: 0, max: 100 }),
              };
            default:
              return {};
          }
        },
      });
      
      // Plugin configurations
      on('before:browser:launch', (browser, launchOptions) => {
        if (browser.name === 'chrome') {
          launchOptions.args.push('--disable-dev-shm-usage');
          launchOptions.args.push('--no-sandbox');
        }
        return launchOptions;
      });
      
      // Code coverage (if using @cypress/code-coverage)
      // require('@cypress/code-coverage/task')(on, config);
      
      return config;
    },
  },
  
  component: {
    devServer: {
      framework: 'next',
      bundler: 'webpack',
    },
    specPattern: 'cypress/component/**/*.cy.{js,jsx,ts,tsx}',
    supportFile: 'cypress/support/component.ts',
    indexHtmlFile: 'cypress/support/component-index.html',
  },
  
  // Global settings
  watchForFileChanges: true,
  numTestsKeptInMemory: 50,
  experimentalStudio: true,
  experimentalWebKitSupport: false,
  
  // Reporter settings
  reporter: 'cypress-multi-reporters',
  reporterOptions: {
    configFile: 'cypress/reporter-config.json',
  },
});