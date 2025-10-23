describe('Contact Management', () => {
  beforeEach(() => {
    cy.login();
    cy.visit('/contacts');
  });

  describe('Contact List', () => {
    it('should display contacts list', () => {
      cy.get('[data-testid="contacts-page"]').should('be.visible');
      cy.get('[data-testid="contacts-table"]').should('be.visible');
      cy.get('[data-testid="contact-row"]').should('have.length.at.least', 1);
    });

    it('should show contact information in table', () => {
      cy.get('[data-testid="contact-row"]').first().within(() => {
        cy.get('[data-testid="contact-name"]').should('be.visible');
        cy.get('[data-testid="contact-email"]').should('be.visible');
        cy.get('[data-testid="contact-phone"]').should('be.visible');
        cy.get('[data-testid="contact-company"]').should('be.visible');
        cy.get('[data-testid="contact-status"]').should('be.visible');
      });
    });

    it('should handle empty contacts list', () => {
      cy.intercept('GET', '/api/contacts', {
        statusCode: 200,
        body: { contacts: [], total: 0 }
      }).as('emptyContacts');

      cy.reload();
      cy.wait('@emptyContacts');
      
      cy.get('[data-testid="contacts-empty-state"]').should('be.visible');
      cy.get('[data-testid="empty-message"]').should('contain', 'No contacts found');
      cy.get('[data-testid="add-first-contact-button"]').should('be.visible');
    });

    it('should show loading state', () => {
      cy.intercept('GET', '/api/contacts', {
        delay: 1000,
        statusCode: 200,
        body: { contacts: [], total: 0 }
      }).as('slowContacts');

      cy.reload();
      
      cy.get('[data-testid="contacts-loading"]').should('be.visible');
      cy.get('[data-testid="loading-skeleton"]').should('be.visible');
      
      cy.wait('@slowContacts');
      cy.get('[data-testid="contacts-loading"]').should('not.exist');
    });

    it('should handle API errors', () => {
      cy.intercept('GET', '/api/contacts', {
        statusCode: 500,
        body: { error: 'Internal server error' }
      }).as('contactsError');

      cy.reload();
      cy.wait('@contactsError');
      
      cy.expectError('Failed to load contacts');
      cy.get('[data-testid="contacts-error"]').should('be.visible');
      cy.get('[data-testid="retry-button"]').should('be.visible');
    });
  });

  describe('Contact Creation', () => {
    it('should open create contact modal', () => {
      cy.get('[data-testid="add-contact-button"]').click();
      
      cy.get('[data-testid="contact-modal"]').should('be.visible');
      cy.get('[data-testid="modal-title"]').should('contain', 'Add New Contact');
      cy.get('[data-testid="contact-form"]').should('be.visible');
    });

    it('should create a new contact successfully', () => {
      const contact = cy.generateTestData('contact');
      
      cy.get('[data-testid="add-contact-button"]').click();
      
      // Fill out the form
      cy.get('[data-testid="firstName-input"]').type(contact.firstName);
      cy.get('[data-testid="lastName-input"]').type(contact.lastName);
      cy.get('[data-testid="email-input"]').type(contact.email);
      cy.get('[data-testid="phone-input"]').type(contact.phone);
      cy.get('[data-testid="company-input"]').type(contact.company);
      cy.get('[data-testid="title-input"]').type(contact.title);
      
      cy.get('[data-testid="save-contact-button"]').click();
      
      // Should show success notification
      cy.expectNotification('Contact created successfully');
      
      // Modal should close
      cy.get('[data-testid="contact-modal"]').should('not.exist');
      
      // New contact should appear in the list
      cy.get('[data-testid="contacts-table"]').should('contain', contact.firstName);
      cy.get('[data-testid="contacts-table"]').should('contain', contact.email);
    });

    it('should validate required fields', () => {
      cy.get('[data-testid="add-contact-button"]').click();
      cy.get('[data-testid="save-contact-button"]').click();
      
      cy.expectFormError('firstName', 'First name is required');
      cy.expectFormError('lastName', 'Last name is required');
      cy.expectFormError('email', 'Email is required');
    });

    it('should validate email format', () => {
      cy.get('[data-testid="add-contact-button"]').click();
      
      cy.get('[data-testid="firstName-input"]').type('John');
      cy.get('[data-testid="lastName-input"]').type('Doe');
      cy.get('[data-testid="email-input"]').type('invalid-email');
      
      cy.get('[data-testid="save-contact-button"]').click();
      
      cy.expectFormError('email', 'Please enter a valid email address');
    });

    it('should validate phone number format', () => {
      cy.get('[data-testid="add-contact-button"]').click();
      
      cy.get('[data-testid="phone-input"]').type('invalid-phone');
      cy.get('[data-testid="save-contact-button"]').click();
      
      cy.expectFormError('phone', 'Please enter a valid phone number');
    });

    it('should handle duplicate email error', () => {
      cy.intercept('POST', '/api/contacts', {
        statusCode: 409,
        body: { error: 'Email already exists' }
      }).as('duplicateEmail');
      
      const contact = cy.generateTestData('contact');
      
      cy.get('[data-testid="add-contact-button"]').click();
      
      cy.get('[data-testid="firstName-input"]').type(contact.firstName);
      cy.get('[data-testid="lastName-input"]').type(contact.lastName);
      cy.get('[data-testid="email-input"]').type(contact.email);
      
      cy.get('[data-testid="save-contact-button"]').click();
      
      cy.wait('@duplicateEmail');
      cy.expectError('A contact with this email already exists');
    });

    it('should cancel contact creation', () => {
      cy.get('[data-testid="add-contact-button"]').click();
      
      cy.get('[data-testid="firstName-input"]').type('John');
      cy.get('[data-testid="cancel-button"]').click();
      
      cy.get('[data-testid="contact-modal"]').should('not.exist');
    });

    it('should close modal on escape key', () => {
      cy.get('[data-testid="add-contact-button"]').click();
      
      cy.get('body').type('{esc}');
      
      cy.get('[data-testid="contact-modal"]').should('not.exist');
    });
  });

  describe('Contact Editing', () => {
    it('should open edit contact modal', () => {
      cy.get('[data-testid="contact-row"]').first().within(() => {
        cy.get('[data-testid="edit-contact-button"]').click();
      });
      
      cy.get('[data-testid="contact-modal"]').should('be.visible');
      cy.get('[data-testid="modal-title"]').should('contain', 'Edit Contact');
      cy.get('[data-testid="contact-form"]').should('be.visible');
    });

    it('should pre-populate form with existing data', () => {
      cy.get('[data-testid="contact-row"]').first().within(() => {
        cy.get('[data-testid="edit-contact-button"]').click();
      });
      
      // Form should be pre-populated
      cy.get('[data-testid="firstName-input"]').should('have.value');
      cy.get('[data-testid="lastName-input"]').should('have.value');
      cy.get('[data-testid="email-input"]').should('have.value');
    });

    it('should update contact successfully', () => {
      cy.get('[data-testid="contact-row"]').first().within(() => {
        cy.get('[data-testid="edit-contact-button"]').click();
      });
      
      const updatedData = {
        firstName: 'Updated',
        lastName: 'Name',
        phone: '+1-555-0199'
      };
      
      cy.get('[data-testid="firstName-input"]').clear().type(updatedData.firstName);
      cy.get('[data-testid="lastName-input"]').clear().type(updatedData.lastName);
      cy.get('[data-testid="phone-input"]').clear().type(updatedData.phone);
      
      cy.get('[data-testid="save-contact-button"]').click();
      
      cy.expectNotification('Contact updated successfully');
      cy.get('[data-testid="contact-modal"]').should('not.exist');
      
      // Updated data should appear in the list
      cy.get('[data-testid="contacts-table"]').should('contain', updatedData.firstName);
    });

    it('should handle update errors', () => {
      cy.intercept('PUT', '/api/contacts/*', {
        statusCode: 500,
        body: { error: 'Failed to update contact' }
      }).as('updateError');
      
      cy.get('[data-testid="contact-row"]').first().within(() => {
        cy.get('[data-testid="edit-contact-button"]').click();
      });
      
      cy.get('[data-testid="firstName-input"]').clear().type('Updated');
      cy.get('[data-testid="save-contact-button"]').click();
      
      cy.wait('@updateError');
      cy.expectError('Failed to update contact');
    });
  });

  describe('Contact Deletion', () => {
    it('should delete contact with confirmation', () => {
      cy.get('[data-testid="contact-row"]').first().within(() => {
        cy.get('[data-testid="delete-contact-button"]').click();
      });
      
      // Should show confirmation dialog
      cy.get('[data-testid="confirm-dialog"]').should('be.visible');
      cy.get('[data-testid="confirm-message"]')
        .should('contain', 'Are you sure you want to delete this contact?');
      
      cy.get('[data-testid="confirm-delete-button"]').click();
      
      cy.expectNotification('Contact deleted successfully');
      cy.get('[data-testid="confirm-dialog"]').should('not.exist');
    });

    it('should cancel contact deletion', () => {
      const initialRowCount = cy.get('[data-testid="contact-row"]').its('length');
      
      cy.get('[data-testid="contact-row"]').first().within(() => {
        cy.get('[data-testid="delete-contact-button"]').click();
      });
      
      cy.get('[data-testid="cancel-delete-button"]').click();
      
      cy.get('[data-testid="confirm-dialog"]').should('not.exist');
      cy.get('[data-testid="contact-row"]').should('have.length', initialRowCount);
    });

    it('should handle deletion errors', () => {
      cy.intercept('DELETE', '/api/contacts/*', {
        statusCode: 500,
        body: { error: 'Failed to delete contact' }
      }).as('deleteError');
      
      cy.get('[data-testid="contact-row"]').first().within(() => {
        cy.get('[data-testid="delete-contact-button"]').click();
      });
      
      cy.get('[data-testid="confirm-delete-button"]').click();
      
      cy.wait('@deleteError');
      cy.expectError('Failed to delete contact');
    });
  });

  describe('Contact Search and Filtering', () => {
    it('should search contacts by name', () => {
      cy.get('[data-testid="search-input"]').type('john');
      
      cy.get('[data-testid="contact-row"]').each(($row) => {
        cy.wrap($row).should('contain.text', 'john');
      });
    });

    it('should search contacts by email', () => {
      cy.get('[data-testid="search-input"]').type('john@example.com');
      
      cy.get('[data-testid="contact-row"]').should('have.length', 1);
      cy.get('[data-testid="contact-row"]').should('contain', 'john@example.com');
    });

    it('should show no results for invalid search', () => {
      cy.get('[data-testid="search-input"]').type('nonexistentcontact123');
      
      cy.get('[data-testid="no-search-results"]').should('be.visible');
      cy.get('[data-testid="no-results-message"]')
        .should('contain', 'No contacts found matching your search');
    });

    it('should clear search results', () => {
      cy.get('[data-testid="search-input"]').type('john');
      cy.get('[data-testid="clear-search-button"]').click();
      
      cy.get('[data-testid="search-input"]').should('have.value', '');
      cy.get('[data-testid="contact-row"]').should('have.length.at.least', 1);
    });

    it('should filter contacts by status', () => {
      cy.get('[data-testid="status-filter"]').select('active');
      
      cy.get('[data-testid="contact-row"]').each(($row) => {
        cy.wrap($row).find('[data-testid="contact-status"]')
          .should('contain', 'Active');
      });
    });

    it('should filter contacts by company', () => {
      cy.get('[data-testid="company-filter"]').select('Acme Corp');
      
      cy.get('[data-testid="contact-row"]').each(($row) => {
        cy.wrap($row).find('[data-testid="contact-company"]')
          .should('contain', 'Acme Corp');
      });
    });

    it('should combine search and filters', () => {
      cy.get('[data-testid="search-input"]').type('john');
      cy.get('[data-testid="status-filter"]').select('active');
      
      cy.get('[data-testid="contact-row"]').each(($row) => {
        cy.wrap($row).should('contain.text', 'john');
        cy.wrap($row).find('[data-testid="contact-status"]')
          .should('contain', 'Active');
      });
    });
  });

  describe('Contact Sorting', () => {
    it('should sort contacts by name', () => {
      cy.get('[data-testid="sort-name-header"]').click();
      
      // Should sort ascending first
      cy.get('[data-testid="sort-name-header"]').should('have.class', 'sort-asc');
      
      // Click again to sort descending
      cy.get('[data-testid="sort-name-header"]').click();
      cy.get('[data-testid="sort-name-header"]').should('have.class', 'sort-desc');
    });

    it('should sort contacts by email', () => {
      cy.get('[data-testid="sort-email-header"]').click();
      
      cy.get('[data-testid="sort-email-header"]').should('have.class', 'sort-asc');
    });

    it('should sort contacts by company', () => {
      cy.get('[data-testid="sort-company-header"]').click();
      
      cy.get('[data-testid="sort-company-header"]').should('have.class', 'sort-asc');
    });

    it('should sort contacts by created date', () => {
      cy.get('[data-testid="sort-created-header"]').click();
      
      cy.get('[data-testid="sort-created-header"]').should('have.class', 'sort-asc');
    });
  });

  describe('Contact Pagination', () => {
    it('should display pagination controls', () => {
      cy.get('[data-testid="pagination"]').should('be.visible');
      cy.get('[data-testid="page-info"]').should('be.visible');
      cy.get('[data-testid="prev-page-button"]').should('be.visible');
      cy.get('[data-testid="next-page-button"]').should('be.visible');
    });

    it('should navigate to next page', () => {
      cy.get('[data-testid="next-page-button"]').click();
      
      cy.url().should('include', 'page=2');
      cy.get('[data-testid="page-info"]').should('contain', 'Page 2');
    });

    it('should navigate to previous page', () => {
      // Go to page 2 first
      cy.get('[data-testid="next-page-button"]').click();
      
      // Then go back to page 1
      cy.get('[data-testid="prev-page-button"]').click();
      
      cy.url().should('include', 'page=1');
      cy.get('[data-testid="page-info"]').should('contain', 'Page 1');
    });

    it('should change page size', () => {
      cy.get('[data-testid="page-size-select"]').select('50');
      
      cy.url().should('include', 'pageSize=50');
      cy.get('[data-testid="contact-row"]').should('have.length.at.most', 50);
    });

    it('should disable prev button on first page', () => {
      cy.get('[data-testid="prev-page-button"]').should('be.disabled');
    });

    it('should show total count', () => {
      cy.get('[data-testid="total-count"]').should('contain', 'contacts');
      cy.get('[data-testid="total-count"]').should('match', /\d+/);
    });
  });

  describe('Bulk Operations', () => {
    it('should select multiple contacts', () => {
      cy.get('[data-testid="select-all-checkbox"]').check();
      
      cy.get('[data-testid="contact-checkbox"]').should('be.checked');
      cy.get('[data-testid="bulk-actions"]').should('be.visible');
    });

    it('should select individual contacts', () => {
      cy.get('[data-testid="contact-row"]').first().within(() => {
        cy.get('[data-testid="contact-checkbox"]').check();
      });
      
      cy.get('[data-testid="bulk-actions"]').should('be.visible');
      cy.get('[data-testid="selected-count"]').should('contain', '1 selected');
    });

    it('should bulk delete contacts', () => {
      cy.get('[data-testid="contact-row"]').first().within(() => {
        cy.get('[data-testid="contact-checkbox"]').check();
      });
      
      cy.get('[data-testid="bulk-delete-button"]').click();
      
      cy.get('[data-testid="confirm-dialog"]').should('be.visible');
      cy.get('[data-testid="confirm-message"]')
        .should('contain', 'Are you sure you want to delete 1 contact?');
      
      cy.get('[data-testid="confirm-delete-button"]').click();
      
      cy.expectNotification('1 contact deleted successfully');
    });

    it('should bulk update contact status', () => {
      cy.get('[data-testid="select-all-checkbox"]').check();
      
      cy.get('[data-testid="bulk-status-button"]').click();
      cy.get('[data-testid="status-dropdown"]').select('inactive');
      cy.get('[data-testid="apply-status-button"]').click();
      
      cy.expectNotification('Contact status updated successfully');
    });

    it('should export selected contacts', () => {
      cy.get('[data-testid="select-all-checkbox"]').check();
      
      cy.get('[data-testid="export-selected-button"]').click();
      
      // Should trigger download
      cy.readFile('cypress/downloads/contacts.csv').should('exist');
    });

    it('should clear selection', () => {
      cy.get('[data-testid="select-all-checkbox"]').check();
      cy.get('[data-testid="clear-selection-button"]').click();
      
      cy.get('[data-testid="contact-checkbox"]').should('not.be.checked');
      cy.get('[data-testid="bulk-actions"]').should('not.be.visible');
    });
  });

  describe('Contact Import/Export', () => {
    it('should open import modal', () => {
      cy.get('[data-testid="import-contacts-button"]').click();
      
      cy.get('[data-testid="import-modal"]').should('be.visible');
      cy.get('[data-testid="file-upload-area"]').should('be.visible');
    });

    it('should import contacts from CSV', () => {
      cy.get('[data-testid="import-contacts-button"]').click();
      
      const csvContent = 'firstName,lastName,email\nJohn,Doe,john@example.com';
      cy.uploadFile('[data-testid="file-input"]', 'contacts.csv', csvContent);
      
      cy.get('[data-testid="import-button"]').click();
      
      cy.expectNotification('1 contact imported successfully');
      cy.get('[data-testid="import-modal"]').should('not.exist');
    });

    it('should validate CSV format', () => {
      cy.get('[data-testid="import-contacts-button"]').click();
      
      const invalidCsv = 'invalid,csv,format';
      cy.uploadFile('[data-testid="file-input"]', 'invalid.csv', invalidCsv);
      
      cy.get('[data-testid="import-button"]').click();
      
      cy.expectError('Invalid CSV format');
    });

    it('should export all contacts', () => {
      cy.get('[data-testid="export-all-button"]').click();
      
      // Should trigger download
      cy.readFile('cypress/downloads/all-contacts.csv').should('exist');
    });

    it('should export filtered contacts', () => {
      cy.get('[data-testid="search-input"]').type('john');
      cy.get('[data-testid="export-filtered-button"]').click();
      
      cy.readFile('cypress/downloads/filtered-contacts.csv').should('exist');
    });
  });

  describe('Contact Details View', () => {
    it('should open contact details', () => {
      cy.get('[data-testid="contact-row"]').first().click();
      
      cy.url().should('match', /\/contacts\/\d+/);
      cy.get('[data-testid="contact-details"]').should('be.visible');
    });

    it('should display contact information', () => {
      cy.get('[data-testid="contact-row"]').first().click();
      
      cy.get('[data-testid="contact-name"]').should('be.visible');
      cy.get('[data-testid="contact-email"]').should('be.visible');
      cy.get('[data-testid="contact-phone"]').should('be.visible');
      cy.get('[data-testid="contact-company"]').should('be.visible');
    });

    it('should show contact activity history', () => {
      cy.get('[data-testid="contact-row"]').first().click();
      
      cy.get('[data-testid="activity-history"]').should('be.visible');
      cy.get('[data-testid="activity-item"]').should('have.length.at.least', 1);
    });

    it('should show related deals', () => {
      cy.get('[data-testid="contact-row"]').first().click();
      
      cy.get('[data-testid="related-deals"]').should('be.visible');
    });

    it('should navigate back to contacts list', () => {
      cy.get('[data-testid="contact-row"]').first().click();
      cy.get('[data-testid="back-to-contacts"]').click();
      
      cy.url().should('include', '/contacts');
      cy.get('[data-testid="contacts-table"]').should('be.visible');
    });
  });

  describe('Responsive Design', () => {
    it('should be responsive on tablet', () => {
      cy.setTabletViewport();
      
      cy.get('[data-testid="contacts-table"]').should('be.visible');
      cy.get('[data-testid="add-contact-button"]').should('be.visible');
    });

    it('should be responsive on mobile', () => {
      cy.setMobileViewport();
      
      cy.get('[data-testid="contacts-mobile-view"]').should('be.visible');
      cy.get('[data-testid="contact-card"]').should('have.length.at.least', 1);
    });

    it('should show mobile-optimized actions', () => {
      cy.setMobileViewport();
      
      cy.get('[data-testid="contact-card"]').first().within(() => {
        cy.get('[data-testid="mobile-actions-menu"]').click();
        cy.get('[data-testid="mobile-edit-button"]').should('be.visible');
        cy.get('[data-testid="mobile-delete-button"]').should('be.visible');
      });
    });
  });

  describe('Accessibility', () => {
    it('should be accessible', () => {
      cy.shouldBeAccessible();
    });

    it('should support keyboard navigation', () => {
      cy.testKeyboardNavigation();
    });

    it('should have proper ARIA labels', () => {
      cy.get('[data-testid="contacts-table"]').should('have.attr', 'aria-label');
      cy.get('[data-testid="add-contact-button"]').should('have.attr', 'aria-label');
      cy.get('[data-testid="search-input"]').should('have.attr', 'aria-label');
    });

    it('should support screen readers', () => {
      cy.testScreenReader();
    });
  });

  describe('Performance', () => {
    it('should load contacts quickly', () => {
      cy.shouldLoadFast();
    });

    it('should handle large datasets efficiently', () => {
      // Mock large dataset
      cy.intercept('GET', '/api/contacts', {
        statusCode: 200,
        body: {
          contacts: Array.from({ length: 1000 }, (_, i) => ({
            id: i,
            firstName: `Contact ${i}`,
            lastName: 'Test',
            email: `contact${i}@example.com`,
            phone: '+1-555-0100',
            company: 'Test Company'
          })),
          total: 1000
        }
      }).as('largeDataset');

      cy.reload();
      cy.wait('@largeDataset');
      
      cy.shouldBeResponsive();
    });

    it('should virtualize large lists', () => {
      // Test virtual scrolling performance
      cy.get('[data-testid="contacts-table"]').scrollTo('bottom');
      cy.shouldBeResponsive();
    });
  });
});