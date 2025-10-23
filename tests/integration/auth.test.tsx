import React from 'react';
import { render, screen, fireEvent, waitFor } from '../utils/testUtils';
// MSW imports temporarily disabled
// import { rest } from 'msw';
// import { server } from '../mocks/server';
import { LoginForm } from '@/components/auth/LoginForm';
import { AuthProvider } from '@/contexts/AuthContext';
import { mockUser } from '../utils/testUtils';

describe('Authentication Integration Tests', () => {
  beforeEach(() => {
    // Clear any stored auth state
    localStorage.clear();
    sessionStorage.clear();
  });

  describe('Login Flow', () => {
    it('successfully logs in a user', async () => {
      render(
        <AuthProvider>
          <LoginForm />
        </AuthProvider>
      );

      // Fill in login form
      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/password/i);
      const submitButton = screen.getByRole('button', { name: /sign in/i });

      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      fireEvent.change(passwordInput, { target: { value: 'password123' } });
      fireEvent.click(submitButton);

      // Wait for successful login
      await waitFor(() => {
        expect(screen.getByText(/welcome back/i)).toBeInTheDocument();
      });

      // Check that user data is stored
      const storedUser = localStorage.getItem('user');
      expect(storedUser).toBeTruthy();
      expect(JSON.parse(storedUser!)).toMatchObject({
        email: 'test@example.com',
        name: 'Test User',
      });
    });

    it('handles login errors gracefully', async () => {
      // Override the login endpoint to return an error
      // server.use(
      //   rest.post('/api/auth/login', (req, res, ctx) => {
      //     return res(
      //       ctx.status(401),
      //       ctx.json({
      //         error: 'Invalid credentials',
      //         message: 'Email or password is incorrect',
      //       })
      //     );
      //   })
      // );

      render(
        <AuthProvider>
          <LoginForm />
        </AuthProvider>
      );

      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/password/i);
      const submitButton = screen.getByRole('button', { name: /sign in/i });

      fireEvent.change(emailInput, { target: { value: 'wrong@example.com' } });
      fireEvent.change(passwordInput, { target: { value: 'wrongpassword' } });
      fireEvent.click(submitButton);

      // Wait for error message
      await waitFor(() => {
        expect(screen.getByText(/invalid credentials/i)).toBeInTheDocument();
      });

      // Ensure no user data is stored
      expect(localStorage.getItem('user')).toBeNull();
    });

    it('validates form inputs', async () => {
      render(
        <AuthProvider>
          <LoginForm />
        </AuthProvider>
      );

      const submitButton = screen.getByRole('button', { name: /sign in/i });
      fireEvent.click(submitButton);

      // Check for validation errors
      await waitFor(() => {
        expect(screen.getByText(/email is required/i)).toBeInTheDocument();
        expect(screen.getByText(/password is required/i)).toBeInTheDocument();
      });
    });

    it('shows loading state during login', async () => {
      // Add delay to login endpoint
      // server.use(
      //   rest.post('/api/auth/login', (req, res, ctx) => {
      //     return res(
      //       ctx.delay(1000),
      //       ctx.status(200),
      //       ctx.json({
      //         user: mockUser,
      //         token: 'mock-jwt-token',
      //       })
      //     );
      //   })
      // );

      render(
        <AuthProvider>
          <LoginForm />
        </AuthProvider>
      );

      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/password/i);
      const submitButton = screen.getByRole('button', { name: /sign in/i });

      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      fireEvent.change(passwordInput, { target: { value: 'password123' } });
      fireEvent.click(submitButton);

      // Check loading state
      expect(screen.getByText(/signing in/i)).toBeInTheDocument();
      expect(submitButton).toBeDisabled();
    });
  });

  describe('Logout Flow', () => {
    it('successfully logs out a user', async () => {
      // Start with authenticated user
      localStorage.setItem('user', JSON.stringify(mockUser));
      localStorage.setItem('token', 'mock-jwt-token');

      const LogoutComponent = () => {
        const { logout, user } = useAuth();
        
        return (
          <div>
            {user && <p>Welcome, {user.name}</p>}
            <button onClick={logout}>Logout</button>
          </div>
        );
      };

      render(
        <AuthProvider initialUser={mockUser}>
          <LogoutComponent />
        </AuthProvider>
      );

      // Verify user is logged in
      expect(screen.getByText(/welcome, test user/i)).toBeInTheDocument();

      // Click logout
      const logoutButton = screen.getByRole('button', { name: /logout/i });
      fireEvent.click(logoutButton);

      // Wait for logout to complete
      await waitFor(() => {
        expect(screen.queryByText(/welcome, test user/i)).not.toBeInTheDocument();
      });

      // Check that user data is cleared
      expect(localStorage.getItem('user')).toBeNull();
      expect(localStorage.getItem('token')).toBeNull();
    });

    it('handles logout errors', async () => {
      // Override logout endpoint to return error
      // server.use(
      //   rest.post('/api/auth/logout', (req, res, ctx) => {
      //     return res(
      //       ctx.status(500),
      //       ctx.json({
      //         error: 'Server Error',
      //         message: 'Failed to logout',
      //       })
      //     );
      //   })
      // );

      localStorage.setItem('user', JSON.stringify(mockUser));

      const LogoutComponent = () => {
        const { logout, user } = useAuth();
        
        return (
          <div>
            {user && <p>Welcome, {user.name}</p>}
            <button onClick={logout}>Logout</button>
          </div>
        );
      };

      render(
        <AuthProvider initialUser={mockUser}>
          <LogoutComponent />
        </AuthProvider>
      );

      const logoutButton = screen.getByRole('button', { name: /logout/i });
      fireEvent.click(logoutButton);

      // Even if server logout fails, local state should be cleared
      await waitFor(() => {
        expect(screen.queryByText(/welcome, test user/i)).not.toBeInTheDocument();
      });
    });
  });

  describe('Protected Routes', () => {
    it('redirects unauthenticated users to login', async () => {
      const ProtectedComponent = () => {
        const { user, loading } = useAuth();
        
        if (loading) return <div>Loading...</div>;
        if (!user) return <div>Please log in</div>;
        
        return <div>Protected Content</div>;
      };

      render(
        <AuthProvider>
          <ProtectedComponent />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(screen.getByText(/please log in/i)).toBeInTheDocument();
      });
    });

    it('allows authenticated users to access protected content', async () => {
      const ProtectedComponent = () => {
        const { user, loading } = useAuth();
        
        if (loading) return <div>Loading...</div>;
        if (!user) return <div>Please log in</div>;
        
        return <div>Protected Content</div>;
      };

      render(
        <AuthProvider initialUser={mockUser}>
          <ProtectedComponent />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(screen.getByText(/protected content/i)).toBeInTheDocument();
      });
    });
  });

  describe('Token Management', () => {
    it('refreshes expired tokens automatically', async () => {
      // Mock token refresh endpoint
      // server.use(
      //   rest.post('/api/auth/refresh', (req, res, ctx) => {
      //     return res(
      //       ctx.status(200),
      //       ctx.json({
      //         token: 'new-jwt-token',
      //         user: mockUser,
      //       })
      //     );
      //   })
      // );

      // Set expired token
      localStorage.setItem('token', 'expired-token');
      localStorage.setItem('user', JSON.stringify(mockUser));

      const TestComponent = () => {
        const { user } = useAuth();
        return user ? <div>Authenticated</div> : <div>Not authenticated</div>;
      };

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      // Should automatically refresh token and maintain authentication
      await waitFor(() => {
        expect(screen.getByText(/authenticated/i)).toBeInTheDocument();
      });

      // Check that new token is stored
      expect(localStorage.getItem('token')).toBe('new-jwt-token');
    });

    it('logs out user when token refresh fails', async () => {
      // Mock failed token refresh
      // server.use(
      //   rest.post('/api/auth/refresh', (req, res, ctx) => {
      //     return res(
      //       ctx.status(401),
      //       ctx.json({
      //         error: 'Invalid refresh token',
      //       })
      //     );
      //   })
      // );

      localStorage.setItem('token', 'invalid-token');
      localStorage.setItem('user', JSON.stringify(mockUser));

      const TestComponent = () => {
        const { user } = useAuth();
        return user ? <div>Authenticated</div> : <div>Not authenticated</div>;
      };

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      // Should log out user when refresh fails
      await waitFor(() => {
        expect(screen.getByText(/not authenticated/i)).toBeInTheDocument();
      });

      // Check that tokens are cleared
      expect(localStorage.getItem('token')).toBeNull();
      expect(localStorage.getItem('user')).toBeNull();
    });
  });

  describe('Session Persistence', () => {
    it('restores user session on page reload', async () => {
      localStorage.setItem('user', JSON.stringify(mockUser));
      localStorage.setItem('token', 'valid-token');

      const TestComponent = () => {
        const { user, loading } = useAuth();
        
        if (loading) return <div>Loading...</div>;
        return user ? <div>Welcome back, {user.name}</div> : <div>Not logged in</div>;
      };

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(screen.getByText(/welcome back, test user/i)).toBeInTheDocument();
      });
    });

    it('handles corrupted session data', async () => {
      localStorage.setItem('user', 'invalid-json');
      localStorage.setItem('token', 'some-token');

      const TestComponent = () => {
        const { user, loading } = useAuth();
        
        if (loading) return <div>Loading...</div>;
        return user ? <div>Authenticated</div> : <div>Not authenticated</div>;
      };

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(screen.getByText(/not authenticated/i)).toBeInTheDocument();
      });

      // Should clear corrupted data
      expect(localStorage.getItem('user')).toBeNull();
    });
  });
});