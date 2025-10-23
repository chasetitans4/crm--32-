import { http, HttpResponse } from 'msw';

// Mock API handlers for testing
export const handlers = [
  // Auth endpoints
  http.post('/api/auth/login', () => {
    return HttpResponse.json({
      user: {
        id: '1',
        email: 'test@example.com',
        name: 'Test User',
        role: 'user',
      },
      token: 'mock-jwt-token',
    });
  }),

  http.post('/api/auth/logout', () => {
    return HttpResponse.json({ success: true });
  }),

  http.get('/api/auth/me', () => {
    return HttpResponse.json({
      id: '1',
      email: 'test@example.com',
      name: 'Test User',
      role: 'user',
    });
  }),

  // Users endpoints
  http.get('/api/users', () => {
    return HttpResponse.json({
      users: [
        {
          id: '1',
          email: 'test@example.com',
          name: 'Test User',
          role: 'user',
          createdAt: '2023-01-01T00:00:00Z',
        },
        {
          id: '2',
          email: 'admin@example.com',
          name: 'Admin User',
          role: 'admin',
          createdAt: '2023-01-01T00:00:00Z',
        },
      ],
      total: 2,
    });
  }),

  http.post('/api/users', () => {
    return HttpResponse.json({
      id: '3',
      email: 'new@example.com',
      name: 'New User',
      role: 'user',
      createdAt: new Date().toISOString(),
    }, { status: 201 });
  }),

  // Contacts endpoints
  http.get('/api/contacts', () => {
    return HttpResponse.json({
      contacts: [
        {
          id: '1',
          name: 'John Doe',
          email: 'john@example.com',
          phone: '+1234567890',
          company: 'Acme Corp',
          status: 'active',
          createdAt: '2023-01-01T00:00:00Z',
        },
      ],
      total: 1,
    });
  }),

  http.post('/api/contacts', () => {
    return HttpResponse.json({
      id: '2',
      name: 'Jane Smith',
      email: 'jane@example.com',
      phone: '+1234567891',
      company: 'Tech Inc',
      status: 'active',
      createdAt: new Date().toISOString(),
    }, { status: 201 });
  }),

  // Dashboard endpoints
  http.get('/api/dashboard/metrics', () => {
    return HttpResponse.json({
      totalContacts: 150,
      totalDeals: 45,
      totalRevenue: 125000,
      conversionRate: 0.15,
    });
  }),

  // Error simulation endpoints
  http.get('/api/error/500', () => {
    return HttpResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }),

  http.get('/api/error/404', () => {
    return HttpResponse.json(
      { error: 'Not Found' },
      { status: 404 }
    );
  }),

  // Fallback handler for unhandled requests
  http.all('*', ({ request }) => {
    console.warn(`Unhandled ${request.method} request to ${request.url}`);
    return HttpResponse.json(
      { error: 'Endpoint not mocked' },
      { status: 404 }
    );
  }),
];