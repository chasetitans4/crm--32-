describe('Authentication Flow', () => {
  beforeEach(() => {
    cy.visit('/');
  });

  describe('Login', () => {
    it('should redirect unauthenticated users to login page', () => {
      cy.url().should('include', '/login');
      cy.get('[data-testid="login-form"]').should('be.visible');
    });

    it('should successfully log in with valid credentials', () => {
      const { email, password } = Cypress.env('testUser');
      
      cy.get('[data-testid="email-input"]').type(email);
      cy.get('[data-testid="password-input"]').type(password);
      cy.get('[data-testid="login-button"]').click();

      // Should redirect to dashboard after successful login
      cy.url().should('include', '/dashboard');
      cy.get('[data-testid="user-menu"]').should('be.visible');
      cy.get('[data-testid="dashboard-content"]').should('be.visible');
    });

    it('should show error message with invalid credentials', () => {
      cy.get('[data-testid="email-input"]').type('invalid@example.com');
      cy.get('[data-testid="password-input"]').type('wrongpassword');
      cy.get('[data-testid="login-button"]').click();

      cy.expectError('Invalid credentials');
      cy.url().should('include', '/login');
    });

    it('should validate required fields', () => {
      cy.get('[data-testid="login-button"]').click();

      cy.expectFormError('email', 'Email is required');
      cy.expectFormError('password', 'Password is required');
    });

    it('should validate email format', () => {
      cy.get('[data-testid="email-input"]').type('invalid-email');
      cy.get('[data-testid="password-input"]').type('password123');
      cy.get('[data-testid="login-button"]').click();

      cy.expectFormError('email', 'Please enter a valid email address');
    });

    it('should show loading state during login', () => {
      // Intercept login request with delay
      cy.intercept('POST', '/api/auth/login', {
        delay: 1000,
        statusCode: 200,
        body: { user: { id: 1, email: 'test@example.com' }, token: 'fake-token' }
      }).as('loginRequest');

      const { email, password } = Cypress.env('testUser');
      
      cy.get('[data-testid="email-input"]').type(email);
      cy.get('[data-testid="password-input"]').type(password);
      cy.get('[data-testid="login-button"]').click();

      // Should show loading state
      cy.get('[data-testid="login-button"]').should('be.disabled');
      cy.get('[data-testid="loading-spinner"]').should('be.visible');

      cy.wait('@loginRequest');
    });

    it('should remember user session', () => {
      cy.login();
      
      // Reload page
      cy.reload();
      
      // Should still be logged in
      cy.url().should('include', '/dashboard');
      cy.get('[data-testid="user-menu"]').should('be.visible');
    });

    it('should support keyboard navigation', () => {
      cy.get('[data-testid="email-input"]').focus();
      cy.pressTab();
      cy.focused().should('have.attr', 'data-testid', 'password-input');
      cy.pressTab();
      cy.focused().should('have.attr', 'data-testid', 'login-button');
    });
  });

  describe('Logout', () => {
    beforeEach(() => {
      cy.login();
    });

    it('should successfully log out user', () => {
      cy.get('[data-testid="user-menu"]').click();
      cy.get('[data-testid="logout-button"]').click();

      // Should redirect to login page
      cy.url().should('include', '/login');
      cy.get('[data-testid="login-form"]').should('be.visible');
    });

    it('should clear user session on logout', () => {
      cy.logout();
      
      // Try to access protected route
      cy.visit('/dashboard');
      
      // Should redirect to login
      cy.url().should('include', '/login');
    });
  });

  describe('Password Reset', () => {
    it('should show forgot password link', () => {
      cy.get('[data-testid="forgot-password-link"]').should('be.visible');
    });

    it('should navigate to password reset page', () => {
      cy.get('[data-testid="forgot-password-link"]').click();
      cy.url().should('include', '/forgot-password');
      cy.get('[data-testid="reset-form"]').should('be.visible');
    });

    it('should send password reset email', () => {
      cy.visit('/forgot-password');
      
      cy.get('[data-testid="email-input"]').type('test@example.com');
      cy.get('[data-testid="reset-button"]').click();

      cy.expectNotification('Password reset email sent');
    });

    it('should validate email for password reset', () => {
      cy.visit('/forgot-password');
      
      cy.get('[data-testid="reset-button"]').click();
      cy.expectFormError('email', 'Email is required');

      cy.get('[data-testid="email-input"]').type('invalid-email');
      cy.get('[data-testid="reset-button"]').click();
      cy.expectFormError('email', 'Please enter a valid email address');
    });
  });

  describe('Registration', () => {
    it('should navigate to registration page', () => {
      cy.get('[data-testid="register-link"]').click();
      cy.url().should('include', '/register');
      cy.get('[data-testid="register-form"]').should('be.visible');
    });

    it('should successfully register new user', () => {
      cy.visit('/register');
      
      const newUser = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        password: 'password123',
        confirmPassword: 'password123'
      };

      cy.get('[data-testid="firstName-input"]').type(newUser.firstName);
      cy.get('[data-testid="lastName-input"]').type(newUser.lastName);
      cy.get('[data-testid="email-input"]').type(newUser.email);
      cy.get('[data-testid="password-input"]').type(newUser.password);
      cy.get('[data-testid="confirmPassword-input"]').type(newUser.confirmPassword);
      cy.get('[data-testid="register-button"]').click();

      cy.expectNotification('Registration successful');
      cy.url().should('include', '/dashboard');
    });

    it('should validate registration form', () => {
      cy.visit('/register');
      
      cy.get('[data-testid="register-button"]').click();

      cy.expectFormError('firstName', 'First name is required');
      cy.expectFormError('lastName', 'Last name is required');
      cy.expectFormError('email', 'Email is required');
      cy.expectFormError('password', 'Password is required');
    });

    it('should validate password confirmation', () => {
      cy.visit('/register');
      
      cy.get('[data-testid="password-input"]').type('password123');
      cy.get('[data-testid="confirmPassword-input"]').type('different');
      cy.get('[data-testid="register-button"]').click();

      cy.expectFormError('confirmPassword', 'Passwords do not match');
    });

    it('should validate password strength', () => {
      cy.visit('/register');
      
      cy.get('[data-testid="password-input"]').type('weak');
      cy.get('[data-testid="register-button"]').click();

      cy.expectFormError('password', 'Password must be at least 8 characters');
    });

    it('should handle duplicate email registration', () => {
      cy.visit('/register');
      
      const existingUser = Cypress.env('testUser');
      
      cy.get('[data-testid="firstName-input"]').type('John');
      cy.get('[data-testid="lastName-input"]').type('Doe');
      cy.get('[data-testid="email-input"]').type(existingUser.email);
      cy.get('[data-testid="password-input"]').type('password123');
      cy.get('[data-testid="confirmPassword-input"]').type('password123');
      cy.get('[data-testid="register-button"]').click();

      cy.expectError('Email already exists');
    });
  });

  describe('Session Management', () => {
    it('should handle expired session', () => {
      cy.login();
      
      // Simulate expired token
      cy.intercept('GET', '/api/auth/me', {
        statusCode: 401,
        body: { error: 'Token expired' }
      }).as('expiredToken');
      
      cy.visit('/dashboard');
      cy.wait('@expiredToken');
      
      // Should redirect to login
      cy.url().should('include', '/login');
      cy.expectNotification('Session expired. Please log in again.');
    });

    it('should refresh token automatically', () => {
      cy.login();
      
      // Mock token refresh
      cy.intercept('POST', '/api/auth/refresh', {
        statusCode: 200,
        body: { token: 'new-token' }
      }).as('refreshToken');
      
      // Simulate API call that triggers token refresh
      cy.intercept('GET', '/api/user/profile', (req) => {
        if (req.headers.authorization === 'Bearer old-token') {
          req.reply({ statusCode: 401, body: { error: 'Token expired' } });
        } else {
          req.reply({ statusCode: 200, body: { user: { id: 1 } } });
        }
      }).as('profileRequest');
      
      cy.visit('/profile');
      cy.wait('@refreshToken');
      cy.wait('@profileRequest');
      
      // Should stay on profile page
      cy.url().should('include', '/profile');
    });
  });

  describe('Multi-factor Authentication', () => {
    it('should prompt for 2FA when enabled', () => {
      // Mock user with 2FA enabled
      cy.intercept('POST', '/api/auth/login', {
        statusCode: 200,
        body: { requiresMFA: true, tempToken: 'temp-token' }
      }).as('loginWith2FA');
      
      const { email, password } = Cypress.env('testUser');
      
      cy.get('[data-testid="email-input"]').type(email);
      cy.get('[data-testid="password-input"]').type(password);
      cy.get('[data-testid="login-button"]').click();
      
      cy.wait('@loginWith2FA');
      
      // Should show 2FA form
      cy.url().should('include', '/verify-2fa');
      cy.get('[data-testid="2fa-form"]').should('be.visible');
    });

    it('should verify 2FA code', () => {
      cy.visit('/verify-2fa');
      
      cy.get('[data-testid="2fa-code-input"]').type('123456');
      cy.get('[data-testid="verify-button"]').click();
      
      cy.url().should('include', '/dashboard');
    });

    it('should handle invalid 2FA code', () => {
      cy.visit('/verify-2fa');
      
      cy.intercept('POST', '/api/auth/verify-2fa', {
        statusCode: 400,
        body: { error: 'Invalid code' }
      }).as('invalid2FA');
      
      cy.get('[data-testid="2fa-code-input"]').type('000000');
      cy.get('[data-testid="verify-button"]').click();
      
      cy.wait('@invalid2FA');
      cy.expectError('Invalid verification code');
    });
  });

  describe('Accessibility', () => {
    it('should be accessible', () => {
      cy.visit('/login');
      cy.shouldBeAccessible();
    });

    it('should support screen readers', () => {
      cy.visit('/login');
      cy.testScreenReader();
      
      cy.get('[data-testid="email-input"]').should('have.attr', 'aria-label');
      cy.get('[data-testid="password-input"]').should('have.attr', 'aria-label');
      cy.get('[data-testid="login-button"]').should('have.attr', 'aria-label');
    });

    it('should support keyboard navigation', () => {
      cy.visit('/login');
      cy.testKeyboardNavigation();
    });
  });

  describe('Performance', () => {
    it('should load quickly', () => {
      cy.visit('/login');
      cy.shouldLoadFast();
    });

    it('should be responsive', () => {
      cy.visit('/login');
      cy.shouldBeResponsive();
    });
  });

  describe('Security', () => {
    it('should prevent XSS attacks', () => {
      const xssPayload = '<script>alert("XSS")</script>';
      
      cy.get('[data-testid="email-input"]').type(xssPayload);
      cy.get('[data-testid="password-input"]').type('password');
      cy.get('[data-testid="login-button"]').click();
      
      // Should not execute script
      cy.window().then((win) => {
        expect(win.alert).to.not.have.been.called;
      });
    });

    it('should prevent CSRF attacks', () => {
      // Check for CSRF token in forms
      cy.get('[name="_token"]').should('exist');
    });

    it('should use HTTPS in production', () => {
      if (Cypress.env('NODE_ENV') === 'production') {
        cy.location('protocol').should('eq', 'https:');
      }
    });
  });
});