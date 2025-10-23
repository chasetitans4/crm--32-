// ***********************************************************
// This example support/e2e.ts is processed and
// loaded automatically before your test files.
//
// This is a great place to put global configuration and
// behavior that modifies Cypress.
//
// You can change the location of this file or turn off
// automatically serving support files with the
// 'supportFile' configuration option.
//
// You can read more here:
// https://on.cypress.io/configuration
// ***********************************************************

// Import commands.js using ES2015 syntax:
import './commands';

// Alternatively you can use CommonJS syntax:
// require('./commands')

// Import Cypress plugins
import 'cypress-real-events/support';

// Global configuration
Cypress.on('uncaught:exception', (err, runnable) => {
  // Returning false here prevents Cypress from
  // failing the test on uncaught exceptions
  if (err.message.includes('ResizeObserver loop limit exceeded')) {
    return false;
  }
  if (err.message.includes('Non-Error promise rejection captured')) {
    return false;
  }
  return true;
});

// Custom assertions
Chai.use((chai, utils) => {
  chai.Assertion.addMethod('beVisible', function () {
    const obj = this._obj;
    
    new chai.Assertion(obj).to.exist;
    new chai.Assertion(obj).to.be.visible;
  });
  
  chai.Assertion.addMethod('haveValidEmail', function () {
    const obj = this._obj;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    
    this.assert(
      emailRegex.test(obj),
      'expected #{this} to be a valid email',
      'expected #{this} not to be a valid email',
      true,
      emailRegex.test(obj)
    );
  });
});

// Global hooks
beforeEach(() => {
  // Clear application state
  cy.clearLocalStorage();
  cy.clearCookies();
  
  // Set viewport
  cy.viewport(1280, 720);
  
  // Intercept common API calls
  cy.intercept('GET', '/api/auth/me', { fixture: 'user.json' }).as('getUser');
  cy.intercept('GET', '/api/users', { fixture: 'users.json' }).as('getUsers');
  cy.intercept('GET', '/api/contacts', { fixture: 'contacts.json' }).as('getContacts');
  cy.intercept('GET', '/api/deals', { fixture: 'deals.json' }).as('getDeals');
});

afterEach(() => {
  // Clean up after each test
  cy.task('log', `Test completed: ${Cypress.currentTest.title}`);
});

// Global commands for test data
Cypress.Commands.add('seedTestData', () => {
  cy.task('seedDatabase');
});

Cypress.Commands.add('cleanTestData', () => {
  cy.task('clearDatabase');
});

// Performance monitoring
Cypress.Commands.add('measurePageLoad', (url: string) => {
  cy.visit(url, {
    onBeforeLoad: (win) => {
      win.performance.mark('page-start');
    },
    onLoad: (win) => {
      win.performance.mark('page-end');
      win.performance.measure('page-load', 'page-start', 'page-end');
    },
  });
});

// Accessibility testing
Cypress.Commands.add('checkA11y', (context?: string, options?: any) => {
  cy.injectAxe();
  cy.checkA11y(context, options);
});

// Visual regression testing
Cypress.Commands.add('compareSnapshot', (name: string) => {
  cy.matchImageSnapshot(name);
});

// Network testing
Cypress.Commands.add('simulateSlowNetwork', () => {
  cy.intercept('**', (req) => {
    req.reply((res) => {
      res.delay(2000); // 2 second delay
    });
  });
});

Cypress.Commands.add('simulateOffline', () => {
  cy.intercept('**', { forceNetworkError: true });
});

// Error simulation
Cypress.Commands.add('simulateServerError', (endpoint: string) => {
  cy.intercept('GET', endpoint, {
    statusCode: 500,
    body: { error: 'Internal Server Error' },
  });
});

// Mobile testing helpers
Cypress.Commands.add('setMobileViewport', () => {
  cy.viewport('iphone-x');
});

Cypress.Commands.add('setTabletViewport', () => {
  cy.viewport('ipad-2');
});

// Database helpers
Cypress.Commands.add('resetDatabase', () => {
  cy.task('clearDatabase');
  cy.task('seedDatabase');
});

// File upload helpers
Cypress.Commands.add('uploadFile', (selector: string, fileName: string) => {
  cy.get(selector).selectFile(`cypress/fixtures/${fileName}`);
});

// Wait for application to be ready
Cypress.Commands.add('waitForApp', () => {
  cy.get('[data-testid="app-ready"]', { timeout: 10000 }).should('exist');
});

// Custom wait commands
Cypress.Commands.add('waitForLoadingToFinish', () => {
  cy.get('[data-testid="loading"]').should('not.exist');
  cy.get('[data-testid="spinner"]').should('not.exist');
});

// Form helpers
Cypress.Commands.add('fillForm', (formData: Record<string, string>) => {
  Object.entries(formData).forEach(([field, value]) => {
    cy.get(`[name="${field}"]`).clear().type(value);
  });
});

// Table helpers
Cypress.Commands.add('sortTableBy', (column: string) => {
  cy.get(`[data-testid="sort-${column}"]`).click();
});

Cypress.Commands.add('filterTableBy', (filter: string, value: string) => {
  cy.get(`[data-testid="filter-${filter}"]`).select(value);
});

// Modal helpers
Cypress.Commands.add('openModal', (modalTrigger: string) => {
  cy.get(`[data-testid="${modalTrigger}"]`).click();
  cy.get('[data-testid="modal"]').should('be.visible');
});

Cypress.Commands.add('closeModal', () => {
  cy.get('[data-testid="modal-close"]').click();
  cy.get('[data-testid="modal"]').should('not.exist');
});

// Notification helpers
Cypress.Commands.add('expectNotification', (message: string, type: 'success' | 'error' | 'warning' | 'info' = 'success') => {
  cy.get(`[data-testid="notification-${type}"]`)
    .should('be.visible')
    .and('contain.text', message);
});

// Search helpers
Cypress.Commands.add('searchFor', (query: string) => {
  cy.get('[data-testid="search-input"]').clear().type(query);
  cy.get('[data-testid="search-button"]').click();
});

// Navigation helpers
Cypress.Commands.add('navigateToPage', (page: string) => {
  cy.get(`[data-testid="nav-${page}"]`).click();
  cy.url().should('include', `/${page}`);
});

// Theme helpers
Cypress.Commands.add('toggleTheme', () => {
  cy.get('[data-testid="theme-toggle"]').click();
});

Cypress.Commands.add('setTheme', (theme: 'light' | 'dark') => {
  cy.get('html').then(($html) => {
    const currentTheme = $html.hasClass('dark') ? 'dark' : 'light';
    if (currentTheme !== theme) {
      cy.toggleTheme();
    }
  });
});

// Local storage helpers
Cypress.Commands.add('setLocalStorage', (key: string, value: string) => {
  cy.window().then((win) => {
    win.localStorage.setItem(key, value);
  });
});

Cypress.Commands.add('getLocalStorage', (key: string) => {
  return cy.window().then((win) => {
    return win.localStorage.getItem(key);
  });
});

// Session storage helpers
Cypress.Commands.add('setSessionStorage', (key: string, value: string) => {
  cy.window().then((win) => {
    win.sessionStorage.setItem(key, value);
  });
});

// Cookie helpers
Cypress.Commands.add('setAuthCookie', (token: string) => {
  cy.setCookie('auth-token', token, {
    httpOnly: false,
    secure: false,
    sameSite: 'lax',
  });
});

// API helpers
Cypress.Commands.add('apiLogin', (email: string, password: string) => {
  cy.request({
    method: 'POST',
    url: '/api/auth/login',
    body: { email, password },
  }).then((response) => {
    expect(response.status).to.eq(200);
    cy.setLocalStorage('auth-token', response.body.token);
    cy.setLocalStorage('user', JSON.stringify(response.body.user));
  });
});

Cypress.Commands.add('apiLogout', () => {
  cy.request({
    method: 'POST',
    url: '/api/auth/logout',
    failOnStatusCode: false,
  });
  cy.clearLocalStorage();
});

// Drag and drop helpers
Cypress.Commands.add('dragAndDrop', (source: string, target: string) => {
  cy.get(source).trigger('mousedown', { which: 1 });
  cy.get(target).trigger('mousemove').trigger('mouseup');
});

// Scroll helpers
Cypress.Commands.add('scrollToBottom', () => {
  cy.scrollTo('bottom');
});

Cypress.Commands.add('scrollToTop', () => {
  cy.scrollTo('top');
});

// Date picker helpers
Cypress.Commands.add('selectDate', (date: string) => {
  cy.get('[data-testid="date-picker"]').click();
  cy.get(`[data-date="${date}"]`).click();
});

// Multi-select helpers
Cypress.Commands.add('selectMultiple', (selector: string, values: string[]) => {
  values.forEach((value) => {
    cy.get(selector).select(value, { force: true });
  });
});

// Keyboard shortcuts
Cypress.Commands.add('pressShortcut', (shortcut: string) => {
  cy.get('body').type(shortcut);
});

// Wait for animations
Cypress.Commands.add('waitForAnimation', () => {
  cy.wait(300); // Wait for CSS animations to complete
});

// Custom matchers for better assertions
declare global {
  namespace Cypress {
    interface Chainable {
      seedTestData(): Chainable<void>;
      cleanTestData(): Chainable<void>;
      measurePageLoad(url: string): Chainable<void>;
      checkA11y(context?: string, options?: any): Chainable<void>;
      compareSnapshot(name: string): Chainable<void>;
      simulateSlowNetwork(): Chainable<void>;
      simulateOffline(): Chainable<void>;
      simulateServerError(endpoint: string): Chainable<void>;
      setMobileViewport(): Chainable<void>;
      setTabletViewport(): Chainable<void>;
      resetDatabase(): Chainable<void>;
      uploadFile(selector: string, fileName: string): Chainable<void>;
      waitForApp(): Chainable<void>;
      waitForLoadingToFinish(): Chainable<void>;
      fillForm(formData: Record<string, string>): Chainable<void>;
      sortTableBy(column: string): Chainable<void>;
      filterTableBy(filter: string, value: string): Chainable<void>;
      openModal(modalTrigger: string): Chainable<void>;
      closeModal(): Chainable<void>;
      expectNotification(message: string, type?: 'success' | 'error' | 'warning' | 'info'): Chainable<void>;
      searchFor(query: string): Chainable<void>;
      navigateToPage(page: string): Chainable<void>;
      toggleTheme(): Chainable<void>;
      setTheme(theme: 'light' | 'dark'): Chainable<void>;
      setLocalStorage(key: string, value: string): Chainable<void>;
      getLocalStorage(key: string): Chainable<string | null>;
      setSessionStorage(key: string, value: string): Chainable<void>;
      setAuthCookie(token: string): Chainable<void>;
      apiLogin(email: string, password: string): Chainable<void>;
      apiLogout(): Chainable<void>;
      dragAndDrop(source: string, target: string): Chainable<void>;
      scrollToBottom(): Chainable<void>;
      scrollToTop(): Chainable<void>;
      selectDate(date: string): Chainable<void>;
      selectMultiple(selector: string, values: string[]): Chainable<void>;
      pressShortcut(shortcut: string): Chainable<void>;
      waitForAnimation(): Chainable<void>;
    }
  }
}