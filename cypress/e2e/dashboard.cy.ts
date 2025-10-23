describe('Dashboard', () => {
  beforeEach(() => {
    cy.login();
    cy.visit('/dashboard');
  });

  describe('Layout and Navigation', () => {
    it('should display main dashboard components', () => {
      cy.get('[data-testid="dashboard-header"]').should('be.visible');
      cy.get('[data-testid="sidebar"]').should('be.visible');
      cy.get('[data-testid="main-content"]').should('be.visible');
      cy.get('[data-testid="user-menu"]').should('be.visible');
    });

    it('should navigate between dashboard sections', () => {
      // Test sidebar navigation
      cy.get('[data-testid="nav-contacts"]').click();
      cy.url().should('include', '/contacts');
      cy.get('[data-testid="contacts-page"]').should('be.visible');

      cy.get('[data-testid="nav-deals"]').click();
      cy.url().should('include', '/deals');
      cy.get('[data-testid="deals-page"]').should('be.visible');

      cy.get('[data-testid="nav-analytics"]').click();
      cy.url().should('include', '/analytics');
      cy.get('[data-testid="analytics-page"]').should('be.visible');

      cy.get('[data-testid="nav-dashboard"]').click();
      cy.url().should('include', '/dashboard');
    });

    it('should toggle sidebar on mobile', () => {
      cy.setMobileViewport();
      
      // Sidebar should be hidden on mobile
      cy.get('[data-testid="sidebar"]').should('not.be.visible');
      
      // Click menu button to show sidebar
      cy.get('[data-testid="mobile-menu-button"]').click();
      cy.get('[data-testid="sidebar"]').should('be.visible');
      
      // Click outside to hide sidebar
      cy.get('[data-testid="main-content"]').click();
      cy.get('[data-testid="sidebar"]').should('not.be.visible');
    });

    it('should show active navigation item', () => {
      cy.get('[data-testid="nav-dashboard"]').should('have.class', 'active');
      
      cy.get('[data-testid="nav-contacts"]').click();
      cy.get('[data-testid="nav-contacts"]').should('have.class', 'active');
      cy.get('[data-testid="nav-dashboard"]').should('not.have.class', 'active');
    });
  });

  describe('Dashboard Metrics', () => {
    it('should display key metrics cards', () => {
      cy.get('[data-testid="metrics-grid"]').should('be.visible');
      cy.get('[data-testid="metric-total-contacts"]').should('be.visible');
      cy.get('[data-testid="metric-active-deals"]').should('be.visible');
      cy.get('[data-testid="metric-revenue"]').should('be.visible');
      cy.get('[data-testid="metric-conversion-rate"]').should('be.visible');
    });

    it('should show loading state for metrics', () => {
      // Intercept metrics API with delay
      cy.intercept('GET', '/api/dashboard/metrics', {
        delay: 1000,
        statusCode: 200,
        body: {
          totalContacts: 150,
          activeDeals: 25,
          revenue: 125000,
          conversionRate: 15.5
        }
      }).as('metricsRequest');

      cy.reload();
      
      // Should show loading skeletons
      cy.get('[data-testid="metrics-loading"]').should('be.visible');
      
      cy.wait('@metricsRequest');
      
      // Should show actual metrics
      cy.get('[data-testid="metrics-loading"]').should('not.exist');
      cy.get('[data-testid="metric-total-contacts"]').should('contain', '150');
    });

    it('should handle metrics API error', () => {
      cy.intercept('GET', '/api/dashboard/metrics', {
        statusCode: 500,
        body: { error: 'Internal server error' }
      }).as('metricsError');

      cy.reload();
      cy.wait('@metricsError');
      
      cy.expectError('Failed to load dashboard metrics');
      cy.get('[data-testid="metrics-error"]').should('be.visible');
      cy.get('[data-testid="retry-metrics-button"]').should('be.visible');
    });

    it('should retry loading metrics on error', () => {
      // First request fails
      cy.intercept('GET', '/api/dashboard/metrics', {
        statusCode: 500,
        body: { error: 'Internal server error' }
      }).as('metricsError');

      cy.reload();
      cy.wait('@metricsError');
      
      // Second request succeeds
      cy.intercept('GET', '/api/dashboard/metrics', {
        statusCode: 200,
        body: {
          totalContacts: 150,
          activeDeals: 25,
          revenue: 125000,
          conversionRate: 15.5
        }
      }).as('metricsSuccess');

      cy.get('[data-testid="retry-metrics-button"]').click();
      cy.wait('@metricsSuccess');
      
      cy.get('[data-testid="metrics-error"]').should('not.exist');
      cy.get('[data-testid="metric-total-contacts"]').should('contain', '150');
    });

    it('should format metrics correctly', () => {
      cy.get('[data-testid="metric-revenue"]').should('contain', '$');
      cy.get('[data-testid="metric-conversion-rate"]').should('contain', '%');
    });

    it('should show metric trends', () => {
      cy.get('[data-testid="metric-total-contacts"] [data-testid="trend-indicator"]')
        .should('be.visible');
      cy.get('[data-testid="metric-revenue"] [data-testid="trend-percentage"]')
        .should('be.visible');
    });
  });

  describe('Recent Activity', () => {
    it('should display recent activity feed', () => {
      cy.get('[data-testid="recent-activity"]').should('be.visible');
      cy.get('[data-testid="activity-item"]').should('have.length.at.least', 1);
    });

    it('should show different activity types', () => {
      cy.get('[data-testid="activity-item"]').first().within(() => {
        cy.get('[data-testid="activity-type"]').should('be.visible');
        cy.get('[data-testid="activity-description"]').should('be.visible');
        cy.get('[data-testid="activity-timestamp"]').should('be.visible');
      });
    });

    it('should load more activities', () => {
      cy.get('[data-testid="load-more-activities"]').click();
      
      cy.get('[data-testid="activity-item"]').should('have.length.at.least', 10);
    });

    it('should filter activities by type', () => {
      cy.get('[data-testid="activity-filter"]').select('contacts');
      
      cy.get('[data-testid="activity-item"]').each(($item) => {
        cy.wrap($item).find('[data-testid="activity-type"]')
          .should('contain', 'contact');
      });
    });

    it('should show empty state when no activities', () => {
      cy.intercept('GET', '/api/dashboard/activities', {
        statusCode: 200,
        body: { activities: [] }
      }).as('emptyActivities');

      cy.reload();
      cy.wait('@emptyActivities');
      
      cy.get('[data-testid="activities-empty-state"]').should('be.visible');
      cy.get('[data-testid="activities-empty-message"]')
        .should('contain', 'No recent activities');
    });
  });

  describe('Quick Actions', () => {
    it('should display quick action buttons', () => {
      cy.get('[data-testid="quick-actions"]').should('be.visible');
      cy.get('[data-testid="quick-add-contact"]').should('be.visible');
      cy.get('[data-testid="quick-add-deal"]').should('be.visible');
      cy.get('[data-testid="quick-add-task"]').should('be.visible');
    });

    it('should open contact creation modal', () => {
      cy.get('[data-testid="quick-add-contact"]').click();
      
      cy.get('[data-testid="contact-modal"]').should('be.visible');
      cy.get('[data-testid="contact-form"]').should('be.visible');
    });

    it('should open deal creation modal', () => {
      cy.get('[data-testid="quick-add-deal"]').click();
      
      cy.get('[data-testid="deal-modal"]').should('be.visible');
      cy.get('[data-testid="deal-form"]').should('be.visible');
    });

    it('should create contact from quick action', () => {
      cy.get('[data-testid="quick-add-contact"]').click();
      
      const contact = cy.generateTestData('contact');
      
      cy.get('[data-testid="firstName-input"]').type(contact.firstName);
      cy.get('[data-testid="lastName-input"]').type(contact.lastName);
      cy.get('[data-testid="email-input"]').type(contact.email);
      cy.get('[data-testid="phone-input"]').type(contact.phone);
      
      cy.get('[data-testid="save-contact-button"]').click();
      
      cy.expectNotification('Contact created successfully');
      cy.get('[data-testid="contact-modal"]').should('not.exist');
    });
  });

  describe('Charts and Analytics', () => {
    it('should display revenue chart', () => {
      cy.get('[data-testid="revenue-chart"]').should('be.visible');
      cy.get('[data-testid="chart-canvas"]').should('be.visible');
    });

    it('should display deals pipeline chart', () => {
      cy.get('[data-testid="pipeline-chart"]').should('be.visible');
      cy.get('[data-testid="pipeline-stages"]').should('be.visible');
    });

    it('should allow chart period selection', () => {
      cy.get('[data-testid="chart-period-selector"]').select('30d');
      
      // Should reload chart data
      cy.get('[data-testid="revenue-chart"]').should('be.visible');
    });

    it('should show chart tooltips on hover', () => {
      cy.get('[data-testid="revenue-chart"]').trigger('mouseover');
      cy.get('[data-testid="chart-tooltip"]').should('be.visible');
    });

    it('should handle chart data loading error', () => {
      cy.intercept('GET', '/api/dashboard/charts', {
        statusCode: 500,
        body: { error: 'Failed to load chart data' }
      }).as('chartError');

      cy.reload();
      cy.wait('@chartError');
      
      cy.get('[data-testid="chart-error"]').should('be.visible');
      cy.get('[data-testid="retry-chart-button"]').should('be.visible');
    });
  });

  describe('Notifications', () => {
    it('should display notification center', () => {
      cy.get('[data-testid="notification-bell"]').click();
      cy.get('[data-testid="notification-dropdown"]').should('be.visible');
    });

    it('should show unread notification count', () => {
      cy.get('[data-testid="notification-badge"]').should('be.visible');
      cy.get('[data-testid="notification-badge"]').should('contain.text');
    });

    it('should mark notifications as read', () => {
      cy.get('[data-testid="notification-bell"]').click();
      cy.get('[data-testid="notification-item"]').first().click();
      
      // Badge count should decrease
      cy.get('[data-testid="notification-badge"]').should('not.exist');
    });

    it('should clear all notifications', () => {
      cy.get('[data-testid="notification-bell"]').click();
      cy.get('[data-testid="clear-all-notifications"]').click();
      
      cy.get('[data-testid="notifications-empty"]').should('be.visible');
      cy.get('[data-testid="notification-badge"]').should('not.exist');
    });
  });

  describe('Search', () => {
    it('should display global search', () => {
      cy.get('[data-testid="global-search"]').should('be.visible');
    });

    it('should search across all entities', () => {
      cy.get('[data-testid="global-search"]').type('john');
      
      cy.get('[data-testid="search-results"]').should('be.visible');
      cy.get('[data-testid="search-result-item"]').should('have.length.at.least', 1);
    });

    it('should show search suggestions', () => {
      cy.get('[data-testid="global-search"]').type('j');
      
      cy.get('[data-testid="search-suggestions"]').should('be.visible');
      cy.get('[data-testid="search-suggestion"]').should('have.length.at.least', 1);
    });

    it('should navigate to search result', () => {
      cy.get('[data-testid="global-search"]').type('john');
      cy.get('[data-testid="search-result-item"]').first().click();
      
      // Should navigate to the selected item
      cy.url().should('match', /\/(contacts|deals|companies)\/\d+/);
    });

    it('should show empty search results', () => {
      cy.get('[data-testid="global-search"]').type('nonexistentquery123');
      
      cy.get('[data-testid="search-no-results"]').should('be.visible');
      cy.get('[data-testid="search-no-results"]')
        .should('contain', 'No results found');
    });

    it('should support keyboard navigation in search', () => {
      cy.get('[data-testid="global-search"]').type('john');
      
      // Use arrow keys to navigate results
      cy.get('[data-testid="global-search"]').type('{downarrow}');
      cy.get('[data-testid="search-result-item"]').first()
        .should('have.class', 'highlighted');
      
      // Press Enter to select
      cy.get('[data-testid="global-search"]').type('{enter}');
      cy.url().should('match', /\/(contacts|deals|companies)\/\d+/);
    });
  });

  describe('User Profile', () => {
    it('should display user menu', () => {
      cy.get('[data-testid="user-menu"]').click();
      cy.get('[data-testid="user-dropdown"]').should('be.visible');
    });

    it('should show user information', () => {
      cy.get('[data-testid="user-menu"]').click();
      
      cy.get('[data-testid="user-name"]').should('be.visible');
      cy.get('[data-testid="user-email"]').should('be.visible');
      cy.get('[data-testid="user-avatar"]').should('be.visible');
    });

    it('should navigate to profile settings', () => {
      cy.get('[data-testid="user-menu"]').click();
      cy.get('[data-testid="profile-settings-link"]').click();
      
      cy.url().should('include', '/profile');
    });

    it('should navigate to account settings', () => {
      cy.get('[data-testid="user-menu"]').click();
      cy.get('[data-testid="account-settings-link"]').click();
      
      cy.url().should('include', '/settings');
    });
  });

  describe('Theme Toggle', () => {
    it('should toggle between light and dark theme', () => {
      cy.get('[data-testid="theme-toggle"]').click();
      
      cy.get('body').should('have.class', 'dark');
      
      cy.get('[data-testid="theme-toggle"]').click();
      cy.get('body').should('not.have.class', 'dark');
    });

    it('should persist theme preference', () => {
      cy.get('[data-testid="theme-toggle"]').click();
      cy.reload();
      
      cy.get('body').should('have.class', 'dark');
    });
  });

  describe('Responsive Design', () => {
    it('should be responsive on tablet', () => {
      cy.setTabletViewport();
      
      cy.get('[data-testid="dashboard-header"]').should('be.visible');
      cy.get('[data-testid="metrics-grid"]').should('be.visible');
      cy.get('[data-testid="sidebar"]').should('be.visible');
    });

    it('should be responsive on mobile', () => {
      cy.setMobileViewport();
      
      cy.get('[data-testid="dashboard-header"]').should('be.visible');
      cy.get('[data-testid="metrics-grid"]').should('be.visible');
      cy.get('[data-testid="mobile-menu-button"]').should('be.visible');
    });

    it('should stack metrics on mobile', () => {
      cy.setMobileViewport();
      
      cy.get('[data-testid="metrics-grid"]')
        .should('have.css', 'flex-direction', 'column');
    });
  });

  describe('Performance', () => {
    it('should load dashboard quickly', () => {
      cy.visit('/dashboard');
      cy.shouldLoadFast();
    });

    it('should handle large datasets efficiently', () => {
      // Mock large dataset
      cy.intercept('GET', '/api/dashboard/activities', {
        statusCode: 200,
        body: {
          activities: Array.from({ length: 1000 }, (_, i) => ({
            id: i,
            type: 'contact',
            description: `Activity ${i}`,
            timestamp: new Date().toISOString()
          }))
        }
      }).as('largeDataset');

      cy.reload();
      cy.wait('@largeDataset');
      
      // Should still be responsive
      cy.get('[data-testid="recent-activity"]').should('be.visible');
      cy.shouldBeResponsive();
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
      cy.get('[data-testid="metrics-grid"]').should('have.attr', 'aria-label');
      cy.get('[data-testid="recent-activity"]').should('have.attr', 'aria-label');
      cy.get('[data-testid="quick-actions"]').should('have.attr', 'aria-label');
    });

    it('should support screen readers', () => {
      cy.testScreenReader();
    });
  });

  describe('Error Handling', () => {
    it('should handle network errors gracefully', () => {
      cy.simulateNetworkError();
      
      cy.reload();
      
      cy.expectError('Network error');
      cy.get('[data-testid="retry-button"]').should('be.visible');
    });

    it('should show error boundary for component errors', () => {
      // Simulate component error
      cy.window().then((win) => {
        win.dispatchEvent(new Error('Component error'));
      });
      
      cy.get('[data-testid="error-boundary"]').should('be.visible');
      cy.get('[data-testid="error-message"]').should('contain', 'Something went wrong');
    });

    it('should recover from errors', () => {
      cy.simulateNetworkError();
      cy.reload();
      
      cy.restoreNetwork();
      cy.get('[data-testid="retry-button"]').click();
      
      cy.get('[data-testid="dashboard-content"]').should('be.visible');
    });
  });
});