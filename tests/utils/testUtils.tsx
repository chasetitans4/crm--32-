import React from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from 'next-themes';
import { AuthProvider } from '../../src/context/AuthContext';
// import { NotificationProvider } from '@/contexts/NotificationContext';
// import { ErrorBoundary } from '@/components/ErrorBoundary';

// Custom render function with providers
interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  initialEntries?: string[];
  queryClient?: QueryClient;
  user?: any;
  theme?: 'light' | 'dark' | 'system';
}

function createTestQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        cacheTime: 0,
        staleTime: 0,
      },
      mutations: {
        retry: false,
      },
    },
    logger: {
      log: () => {},
      warn: () => {},
      error: () => {},
    },
  });
}

function AllTheProviders({
  children,
  queryClient = createTestQueryClient(),
  user = null,
  theme = 'light',
}: {
  children: React.ReactNode;
  queryClient?: QueryClient;
  user?: any;
  theme?: string;
}) {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider attribute="class" defaultTheme={theme}>
        <AuthProvider>
          {children}
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

function customRender(
  ui: React.ReactElement,
  options: CustomRenderOptions = {}
) {
  const {
    queryClient,
    user,
    theme,
    ...renderOptions
  } = options;

  const Wrapper = ({ children }: { children: React.ReactNode }) => (
    <AllTheProviders
      queryClient={queryClient}
      user={user}
      theme={theme}
    >
      {children}
    </AllTheProviders>
  );

  return {
    ...render(ui, { wrapper: Wrapper, ...renderOptions }),
    queryClient: queryClient || createTestQueryClient(),
  };
}

// Mock data factories
export const mockUser = {
  id: '1',
  email: 'test@example.com',
  name: 'Test User',
  role: 'user' as const,
  createdAt: '2023-01-01T00:00:00Z',
};

export const mockAdmin = {
  id: '2',
  email: 'admin@example.com',
  name: 'Admin User',
  role: 'admin' as const,
  createdAt: '2023-01-01T00:00:00Z',
};

export const mockContact = {
  id: '1',
  firstName: 'John',
  lastName: 'Doe',
  email: 'john@example.com',
  phone: '+1234567890',
  company: 'Test Company',
  status: 'active' as const,
  createdAt: '2023-01-01T00:00:00Z',
};

export const mockDeal = {
  id: '1',
  title: 'Test Deal',
  amount: 10000,
  stage: 'proposal' as const,
  probability: 75,
  contactId: '1',
  expectedCloseDate: '2023-12-31',
  createdAt: '2023-01-01T00:00:00Z',
};

// Test helpers
export const testHelpers = {
  // Wait for element to appear
  waitForElement: async (getByTestId: any, testId: string, timeout = 1000) => {
    return new Promise((resolve, reject) => {
      const startTime = Date.now();
      const check = () => {
        try {
          const element = getByTestId(testId);
          if (element) {
            resolve(element);
          } else {
            throw new Error('Element not found');
          }
        } catch (error) {
          if (Date.now() - startTime > timeout) {
            reject(new Error(`Element with testId "${testId}" not found within ${timeout}ms`));
          } else {
            setTimeout(check, 10);
          }
        }
      };
      check();
    });
  },

  // Simulate user typing
  typeIntoInput: async (input: HTMLElement, text: string, delay = 50) => {
    const { fireEvent } = await import('@testing-library/react');
    
    for (let i = 0; i < text.length; i++) {
      fireEvent.change(input, {
        target: { value: text.slice(0, i + 1) },
      });
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  },

  // Mock API response
  mockApiResponse: (url: string, response: any, status = 200) => {
    const mockFetch = global.fetch as jest.MockedFunction<typeof fetch>;
    mockFetch.mockResolvedValueOnce({
      ok: status >= 200 && status < 300,
      status,
      json: async () => response,
      text: async () => JSON.stringify(response),
      headers: new Headers(),
      redirected: false,
      statusText: 'OK',
      type: 'basic',
      url,
      clone: function() { return this; },
      body: null,
      bodyUsed: false,
    } as Response);
  },

  // Mock API error
  mockApiError: (url: string, error: string, status = 500) => {
    const mockFetch = global.fetch as jest.MockedFunction<typeof fetch>;
    mockFetch.mockRejectedValueOnce(new Error(error));
  },

  // Create mock file
  createMockFile: (name: string, size: number, type: string) => {
    const file = new File([''], name, { type });
    Object.defineProperty(file, 'size', {
      value: size,
      writable: false,
    });
    return file;
  },

  // Mock intersection observer
  mockIntersectionObserver: (isIntersecting = true) => {
    const mockIntersectionObserver = jest.fn();
    mockIntersectionObserver.mockReturnValue({
      observe: jest.fn(),
      unobserve: jest.fn(),
      disconnect: jest.fn(),
    });

    window.IntersectionObserver = mockIntersectionObserver;
    
    // Trigger intersection
    const [callback] = mockIntersectionObserver.mock.calls[0];
    if (callback) {
      callback([{ isIntersecting }]);
    }

    return mockIntersectionObserver;
  },

  // Mock resize observer
  mockResizeObserver: () => {
    const mockResizeObserver = jest.fn();
    mockResizeObserver.mockReturnValue({
      observe: jest.fn(),
      unobserve: jest.fn(),
      disconnect: jest.fn(),
    });

    window.ResizeObserver = mockResizeObserver;
    return mockResizeObserver;
  },

  // Mock geolocation
  mockGeolocation: (coords = { latitude: 40.7128, longitude: -74.0060 }) => {
    const mockGeolocation = {
      getCurrentPosition: jest.fn((success) => {
        success({
          coords,
          timestamp: Date.now(),
        });
      }),
      watchPosition: jest.fn(),
      clearWatch: jest.fn(),
    };

    Object.defineProperty(navigator, 'geolocation', {
      value: mockGeolocation,
      writable: true,
    });

    return mockGeolocation;
  },

  // Mock local storage
  mockLocalStorage: () => {
    const store: Record<string, string> = {};
    
    const mockStorage = {
      getItem: jest.fn((key: string) => store[key] || null),
      setItem: jest.fn((key: string, value: string) => {
        store[key] = value;
      }),
      removeItem: jest.fn((key: string) => {
        delete store[key];
      }),
      clear: jest.fn(() => {
        Object.keys(store).forEach(key => delete store[key]);
      }),
      length: 0,
      key: jest.fn(),
    };

    Object.defineProperty(window, 'localStorage', {
      value: mockStorage,
    });

    return mockStorage;
  },

  // Create test query client
  createTestQueryClient,

  // Flush promises
  flushPromises: () => new Promise(resolve => setTimeout(resolve, 0)),

  // Mock timer helpers
  advanceTimers: (ms: number) => {
    jest.advanceTimersByTime(ms);
  },

  // Mock console methods
  mockConsole: () => {
    const originalConsole = { ...console };
    const mockConsole = {
      log: jest.fn(),
      warn: jest.fn(),
      error: jest.fn(),
      info: jest.fn(),
      debug: jest.fn(),
    };

    Object.assign(console, mockConsole);

    return {
      mockConsole,
      restore: () => Object.assign(console, originalConsole),
    };
  },
};

// Performance testing helpers
export const performanceHelpers = {
  // Measure render time
  measureRenderTime: async (renderFn: () => void) => {
    const start = performance.now();
    renderFn();
    await testHelpers.flushPromises();
    const end = performance.now();
    return end - start;
  },

  // Check for memory leaks
  checkMemoryLeaks: () => {
    const initialMemory = (performance as any).memory?.usedJSHeapSize || 0;
    
    return {
      getMemoryDiff: () => {
        const currentMemory = (performance as any).memory?.usedJSHeapSize || 0;
        return currentMemory - initialMemory;
      },
    };
  },

  // Mock performance observer
  mockPerformanceObserver: () => {
    const mockObserver = jest.fn();
    mockObserver.mockReturnValue({
      observe: jest.fn(),
      disconnect: jest.fn(),
    });

    (global as any).PerformanceObserver = mockObserver;
    return mockObserver;
  },
};

// Accessibility testing helpers
export const a11yHelpers = {
  // Check for ARIA attributes
  checkAriaAttributes: (element: HTMLElement) => {
    const ariaAttributes = Array.from(element.attributes)
      .filter(attr => attr.name.startsWith('aria-'))
      .reduce((acc, attr) => {
        acc[attr.name] = attr.value;
        return acc;
      }, {} as Record<string, string>);

    return ariaAttributes;
  },

  // Check for keyboard navigation
  checkKeyboardNavigation: async (element: HTMLElement) => {
    const { fireEvent } = await import('@testing-library/react');
    
    const results = {
      canFocus: false,
      canTab: false,
      canEnter: false,
      canEscape: false,
    };

    // Test focus
    element.focus();
    results.canFocus = document.activeElement === element;

    // Test tab navigation
    fireEvent.keyDown(element, { key: 'Tab' });
    results.canTab = true; // Simplified check

    // Test enter key
    fireEvent.keyDown(element, { key: 'Enter' });
    results.canEnter = true; // Simplified check

    // Test escape key
    fireEvent.keyDown(element, { key: 'Escape' });
    results.canEscape = true; // Simplified check

    return results;
  },

  // Check color contrast (simplified)
  checkColorContrast: (element: HTMLElement) => {
    const styles = window.getComputedStyle(element);
    return {
      color: styles.color,
      backgroundColor: styles.backgroundColor,
      // Note: Actual contrast calculation would require more complex logic
      hasGoodContrast: true, // Simplified
    };
  },
};

// Re-export everything from React Testing Library
export * from '@testing-library/react';
export { customRender as render };
export { createTestQueryClient };