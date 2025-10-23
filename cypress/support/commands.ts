/// <reference types="cypress" />

// ***********************************************
// This example commands.ts shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************

// Authentication Commands
Cypress.Commands.add('login', (email?: string, password?: string) => {
  const testEmail = email || Cypress.env('testUser').email;
  const testPassword = password || Cypress.env('testUser').password;
  
  cy.visit('/login');
  cy.get('[data-testid="email-input"]').type(testEmail);
  cy.get('[data-testid="password-input"]').type(testPassword);
  cy.get('[data-testid="login-button"]').click();
  
  // Wait for successful login
  cy.url().should('not.include', '/login');
  cy.get('[data-testid="user-menu"]').should('be.visible');
});

Cypress.Commands.add('loginAsAdmin', () => {
  const adminUser = Cypress.env('adminUser');
  cy.login(adminUser.email, adminUser.password);
});

Cypress.Commands.add('logout', () => {
  cy.get('[data-testid="user-menu"]').click();
  cy.get('[data-testid="logout-button"]').click();
  cy.url().should('include', '/login');
});

// Data Creation Commands
Cypress.Commands.add('createContact', (contactData?: any) => {
  const defaultContact = {
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@example.com',
    phone: '+1234567890',
    company: 'Test Company',
  };
  
  const contact = { ...defaultContact, ...contactData };
  
  cy.visit('/contacts');
  cy.get('[data-testid="add-contact-button"]').click();
  
  cy.get('[data-testid="firstName-input"]').type(contact.firstName);
  cy.get('[data-testid="lastName-input"]').type(contact.lastName);
  cy.get('[data-testid="email-input"]').type(contact.email);
  cy.get('[data-testid="phone-input"]').type(contact.phone);
  cy.get('[data-testid="company-input"]').type(contact.company);
  
  cy.get('[data-testid="save-contact-button"]').click();
  cy.expectNotification('Contact created successfully');
  
  return cy.wrap(contact);
});

Cypress.Commands.add('createDeal', (dealData?: any) => {
  const defaultDeal = {
    title: 'Test Deal',
    amount: '10000',
    stage: 'proposal',
    probability: '75',
  };
  
  const deal = { ...defaultDeal, ...dealData };
  
  cy.visit('/deals');
  cy.get('[data-testid="add-deal-button"]').click();
  
  cy.get('[data-testid="title-input"]').type(deal.title);
  cy.get('[data-testid="amount-input"]').type(deal.amount);
  cy.get('[data-testid="stage-select"]').select(deal.stage);
  cy.get('[data-testid="probability-input"]').type(deal.probability);
  
  cy.get('[data-testid="save-deal-button"]').click();
  cy.expectNotification('Deal created successfully');
  
  return cy.wrap(deal);
});

Cypress.Commands.add('createUser', (userData?: any) => {
  const defaultUser = {
    firstName: 'Test',
    lastName: 'User',
    email: 'testuser@example.com',
    role: 'user',
  };
  
  const user = { ...defaultUser, ...userData };
  
  cy.visit('/admin/users');
  cy.get('[data-testid="add-user-button"]').click();
  
  cy.get('[data-testid="firstName-input"]').type(user.firstName);
  cy.get('[data-testid="lastName-input"]').type(user.lastName);
  cy.get('[data-testid="email-input"]').type(user.email);
  cy.get('[data-testid="role-select"]').select(user.role);
  
  cy.get('[data-testid="save-user-button"]').click();
  cy.expectNotification('User created successfully');
  
  return cy.wrap(user);
});

// Data Deletion Commands
Cypress.Commands.add('deleteContact', (contactEmail: string) => {
  cy.visit('/contacts');
  cy.searchFor(contactEmail);
  cy.get(`[data-testid="contact-${contactEmail}"]`).within(() => {
    cy.get('[data-testid="delete-button"]').click();
  });
  cy.get('[data-testid="confirm-delete"]').click();
  cy.expectNotification('Contact deleted successfully');
});

Cypress.Commands.add('deleteDeal', (dealTitle: string) => {
  cy.visit('/deals');
  cy.searchFor(dealTitle);
  cy.get(`[data-testid="deal-${dealTitle}"]`).within(() => {
    cy.get('[data-testid="delete-button"]').click();
  });
  cy.get('[data-testid="confirm-delete"]').click();
  cy.expectNotification('Deal deleted successfully');
});

// Navigation Commands
Cypress.Commands.add('visitDashboard', () => {
  cy.visit('/dashboard');
  cy.get('[data-testid="dashboard-content"]').should('be.visible');
});

Cypress.Commands.add('visitContacts', () => {
  cy.visit('/contacts');
  cy.get('[data-testid="contacts-table"]').should('be.visible');
});

Cypress.Commands.add('visitDeals', () => {
  cy.visit('/deals');
  cy.get('[data-testid="deals-table"]').should('be.visible');
});

Cypress.Commands.add('visitReports', () => {
  cy.visit('/reports');
  cy.get('[data-testid="reports-content"]').should('be.visible');
});

// Form Validation Commands
Cypress.Commands.add('expectFormError', (fieldName: string, errorMessage: string) => {
  cy.get(`[data-testid="${fieldName}-error"]`)
    .should('be.visible')
    .and('contain.text', errorMessage);
});

Cypress.Commands.add('expectFormValid', (fieldName: string) => {
  cy.get(`[data-testid="${fieldName}-error"]`).should('not.exist');
  cy.get(`[data-testid="${fieldName}-input"]`).should('not.have.class', 'error');
});

// Table Commands
Cypress.Commands.add('expectTableRow', (rowData: Record<string, string>) => {
  Object.entries(rowData).forEach(([column, value]) => {
    cy.get(`[data-testid="table-cell-${column}"]`)
      .should('be.visible')
      .and('contain.text', value);
  });
});

Cypress.Commands.add('clickTableRow', (rowIndex: number) => {
  cy.get(`[data-testid="table-row-${rowIndex}"]`).click();
});

Cypress.Commands.add('expectTableEmpty', () => {
  cy.get('[data-testid="empty-table"]')
    .should('be.visible')
    .and('contain.text', 'No data available');
});

// Modal Commands
Cypress.Commands.add('expectModalOpen', (modalTitle?: string) => {
  cy.get('[data-testid="modal"]').should('be.visible');
  if (modalTitle) {
    cy.get('[data-testid="modal-title"]').should('contain.text', modalTitle);
  }
});

Cypress.Commands.add('expectModalClosed', () => {
  cy.get('[data-testid="modal"]').should('not.exist');
});

// Loading Commands
Cypress.Commands.add('expectLoading', () => {
  cy.get('[data-testid="loading"]').should('be.visible');
});

Cypress.Commands.add('expectNotLoading', () => {
  cy.get('[data-testid="loading"]').should('not.exist');
});

// Error Commands
Cypress.Commands.add('expectError', (errorMessage: string) => {
  cy.get('[data-testid="error-message"]')
    .should('be.visible')
    .and('contain.text', errorMessage);
});

Cypress.Commands.add('expectNoError', () => {
  cy.get('[data-testid="error-message"]').should('not.exist');
});

// File Upload Commands
Cypress.Commands.add('uploadCSV', (fileName: string) => {
  cy.get('[data-testid="file-upload"]').selectFile(`cypress/fixtures/${fileName}`);
  cy.get('[data-testid="upload-button"]').click();
});

Cypress.Commands.add('uploadImage', (fileName: string) => {
  cy.get('[data-testid="image-upload"]').selectFile(`cypress/fixtures/${fileName}`);
});

// Export Commands
Cypress.Commands.add('exportData', (format: 'csv' | 'pdf' | 'excel') => {
  cy.get('[data-testid="export-button"]').click();
  cy.get(`[data-testid="export-${format}"]`).click();
});

// Filter Commands
Cypress.Commands.add('applyFilter', (filterType: string, filterValue: string) => {
  cy.get('[data-testid="filter-button"]').click();
  cy.get(`[data-testid="filter-${filterType}"]`).select(filterValue);
  cy.get('[data-testid="apply-filter"]').click();
});

Cypress.Commands.add('clearFilters', () => {
  cy.get('[data-testid="clear-filters"]').click();
});

// Pagination Commands
Cypress.Commands.add('goToPage', (pageNumber: number) => {
  cy.get(`[data-testid="page-${pageNumber}"]`).click();
});

Cypress.Commands.add('goToNextPage', () => {
  cy.get('[data-testid="next-page"]').click();
});

Cypress.Commands.add('goToPreviousPage', () => {
  cy.get('[data-testid="previous-page"]').click();
});

// Settings Commands
Cypress.Commands.add('updateProfile', (profileData: any) => {
  cy.visit('/profile');
  
  if (profileData.firstName) {
    cy.get('[data-testid="firstName-input"]').clear().type(profileData.firstName);
  }
  if (profileData.lastName) {
    cy.get('[data-testid="lastName-input"]').clear().type(profileData.lastName);
  }
  if (profileData.email) {
    cy.get('[data-testid="email-input"]').clear().type(profileData.email);
  }
  
  cy.get('[data-testid="save-profile"]').click();
  cy.expectNotification('Profile updated successfully');
});

Cypress.Commands.add('changePassword', (currentPassword: string, newPassword: string) => {
  cy.visit('/profile/security');
  
  cy.get('[data-testid="current-password"]').type(currentPassword);
  cy.get('[data-testid="new-password"]').type(newPassword);
  cy.get('[data-testid="confirm-password"]').type(newPassword);
  
  cy.get('[data-testid="change-password"]').click();
  cy.expectNotification('Password changed successfully');
});

// Dashboard Commands
Cypress.Commands.add('expectDashboardMetric', (metricName: string, value: string) => {
  cy.get(`[data-testid="metric-${metricName}"]`)
    .should('be.visible')
    .and('contain.text', value);
});

Cypress.Commands.add('expectChartVisible', (chartName: string) => {
  cy.get(`[data-testid="chart-${chartName}"]`).should('be.visible');
});

// Search Commands
Cypress.Commands.add('expectSearchResults', (expectedCount: number) => {
  cy.get('[data-testid="search-results"]')
    .should('be.visible')
    .find('[data-testid^="result-"]')
    .should('have.length', expectedCount);
});

Cypress.Commands.add('expectNoSearchResults', () => {
  cy.get('[data-testid="no-results"]')
    .should('be.visible')
    .and('contain.text', 'No results found');
});

// Bulk Actions Commands
Cypress.Commands.add('selectAllItems', () => {
  cy.get('[data-testid="select-all"]').check();
});

Cypress.Commands.add('selectItems', (itemIds: string[]) => {
  itemIds.forEach(id => {
    cy.get(`[data-testid="select-${id}"]`).check();
  });
});

Cypress.Commands.add('bulkDelete', () => {
  cy.get('[data-testid="bulk-delete"]').click();
  cy.get('[data-testid="confirm-bulk-delete"]').click();
});

Cypress.Commands.add('bulkExport', () => {
  cy.get('[data-testid="bulk-export"]').click();
});

// Keyboard Navigation Commands
Cypress.Commands.add('pressEscape', () => {
  cy.get('body').type('{esc}');
});

Cypress.Commands.add('pressEnter', () => {
  cy.get('body').type('{enter}');
});

Cypress.Commands.add('pressTab', () => {
  cy.get('body').type('{tab}');
});

// Responsive Testing Commands
Cypress.Commands.add('testMobileLayout', () => {
  cy.setMobileViewport();
  cy.get('[data-testid="mobile-menu"]').should('be.visible');
  cy.get('[data-testid="desktop-menu"]').should('not.be.visible');
});

Cypress.Commands.add('testDesktopLayout', () => {
  cy.viewport(1280, 720);
  cy.get('[data-testid="desktop-menu"]').should('be.visible');
  cy.get('[data-testid="mobile-menu"]').should('not.be.visible');
});

// Performance Commands
Cypress.Commands.add('measureLoadTime', (expectedMaxTime: number) => {
  cy.window().then((win) => {
    const loadTime = win.performance.timing.loadEventEnd - win.performance.timing.navigationStart;
    expect(loadTime).to.be.lessThan(expectedMaxTime);
  });
});

// Accessibility Commands
Cypress.Commands.add('testKeyboardNavigation', () => {
  cy.get('body').tab();
  cy.focused().should('be.visible');
});

Cypress.Commands.add('testScreenReader', () => {
  cy.get('[aria-label]').should('exist');
  cy.get('[role]').should('exist');
});

// Custom Assertions
Cypress.Commands.add('shouldBeAccessible', () => {
  cy.checkA11y();
});

Cypress.Commands.add('shouldLoadFast', () => {
  cy.measureLoadTime(3000); // 3 seconds max
});

Cypress.Commands.add('shouldBeResponsive', () => {
  cy.testMobileLayout();
  cy.testDesktopLayout();
});

// Type definitions for custom commands
declare global {
  namespace Cypress {
    interface Chainable {
      login(email?: string, password?: string): Chainable<void>;
      loginAsAdmin(): Chainable<void>;
      logout(): Chainable<void>;
      createContact(contactData?: any): Chainable<any>;
      createDeal(dealData?: any): Chainable<any>;
      createUser(userData?: any): Chainable<any>;
      deleteContact(contactEmail: string): Chainable<void>;
      deleteDeal(dealTitle: string): Chainable<void>;
      visitDashboard(): Chainable<void>;
      visitContacts(): Chainable<void>;
      visitDeals(): Chainable<void>;
      visitReports(): Chainable<void>;
      expectFormError(fieldName: string, errorMessage: string): Chainable<void>;
      expectFormValid(fieldName: string): Chainable<void>;
      expectTableRow(rowData: Record<string, string>): Chainable<void>;
      clickTableRow(rowIndex: number): Chainable<void>;
      expectTableEmpty(): Chainable<void>;
      expectModalOpen(modalTitle?: string): Chainable<void>;
      expectModalClosed(): Chainable<void>;
      expectLoading(): Chainable<void>;
      expectNotLoading(): Chainable<void>;
      expectError(errorMessage: string): Chainable<void>;
      expectNoError(): Chainable<void>;
      uploadCSV(fileName: string): Chainable<void>;
      uploadImage(fileName: string): Chainable<void>;
      exportData(format: 'csv' | 'pdf' | 'excel'): Chainable<void>;
      applyFilter(filterType: string, filterValue: string): Chainable<void>;
      clearFilters(): Chainable<void>;
      goToPage(pageNumber: number): Chainable<void>;
      goToNextPage(): Chainable<void>;
      goToPreviousPage(): Chainable<void>;
      updateProfile(profileData: any): Chainable<void>;
      changePassword(currentPassword: string, newPassword: string): Chainable<void>;
      expectDashboardMetric(metricName: string, value: string): Chainable<void>;
      expectChartVisible(chartName: string): Chainable<void>;
      expectSearchResults(expectedCount: number): Chainable<void>;
      expectNoSearchResults(): Chainable<void>;
      selectAllItems(): Chainable<void>;
      selectItems(itemIds: string[]): Chainable<void>;
      bulkDelete(): Chainable<void>;
      bulkExport(): Chainable<void>;
      pressEscape(): Chainable<void>;
      pressEnter(): Chainable<void>;
      pressTab(): Chainable<void>;
      testMobileLayout(): Chainable<void>;
      testDesktopLayout(): Chainable<void>;
      measureLoadTime(expectedMaxTime: number): Chainable<void>;
      testKeyboardNavigation(): Chainable<void>;
      testScreenReader(): Chainable<void>;
      shouldBeAccessible(): Chainable<void>;
      shouldLoadFast(): Chainable<void>;
      shouldBeResponsive(): Chainable<void>;
    }
  }
}