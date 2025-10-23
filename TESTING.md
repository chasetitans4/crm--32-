# Testing Framework Documentation

This project includes a comprehensive testing framework with unit tests, integration tests, and end-to-end (E2E) tests using Jest, React Testing Library, and Cypress.

## Table of Contents

- [Overview](#overview)
- [Test Types](#test-types)
- [Setup and Installation](#setup-and-installation)
- [Running Tests](#running-tests)
- [Writing Tests](#writing-tests)
- [Test Structure](#test-structure)
- [Mocking and Test Data](#mocking-and-test-data)
- [Coverage Reports](#coverage-reports)
- [CI/CD Integration](#cicd-integration)
- [Best Practices](#best-practices)
- [Troubleshooting](#troubleshooting)

## Overview

Our testing strategy follows the testing pyramid approach:

- **Unit Tests**: Fast, isolated tests for individual components and functions
- **Integration Tests**: Tests for component interactions and API integrations
- **E2E Tests**: Full user journey tests using Cypress

## Test Types

### Unit Tests
- **Location**: `tests/components/`
- **Framework**: Jest + React Testing Library
- **Purpose**: Test individual components in isolation
- **Examples**: Button component, form validation, utility functions

### Integration Tests
- **Location**: `tests/integration/`
- **Framework**: Jest + React Testing Library + MSW
- **Purpose**: Test component interactions and API integrations
- **Examples**: Authentication flows, data fetching, form submissions

### E2E Tests
- **Location**: `cypress/e2e/`
- **Framework**: Cypress
- **Purpose**: Test complete user workflows
- **Examples**: Login flow, contact management, dashboard interactions

## Setup and Installation

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Install Dependencies
```bash
npm install
```

### Cypress Setup
For first-time Cypress setup:
```bash
npx cypress open
```

## Running Tests

### Unit Tests
```bash
# Run all unit tests
npm run test:unit

# Run tests in watch mode
npm run test:watch

# Run with coverage
npm run test:coverage

# Debug tests
npm run test:debug
```

### Integration Tests
```bash
# Run all integration tests
npm run test:integration

# Run specific integration test
npm test -- tests/integration/auth.test.tsx
```

### E2E Tests
```bash
# Open Cypress Test Runner (interactive)
npm run e2e:open

# Run E2E tests headlessly
npm run e2e:headless

# Run specific E2E test
npm run cypress:run -- --spec "cypress/e2e/auth.cy.ts"

# Run tests in different browsers
npm run cypress:run:chrome
npm run cypress:run:firefox
npm run cypress:run:edge
```

### All Tests
```bash
# Run all tests (unit, integration, E2E)
npm run test:all

# Run smoke tests (critical paths only)
npm run test:smoke

# Run regression tests
npm run test:regression
```

## Writing Tests

### Unit Test Example
```typescript
// tests/components/Button.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { Button } from '@/components/ui/Button';

describe('Button Component', () => {
  it('should render with correct text', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByRole('button')).toHaveTextContent('Click me');
  });

  it('should handle click events', () => {
    const handleClick = jest.fn();
    render(<Button onClick={handleClick}>Click me</Button>);
    
    fireEvent.click(screen.getByRole('button'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});
```

### Integration Test Example
```typescript
// tests/integration/auth.test.tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { server } from '../mocks/server';
import { LoginForm } from '@/components/auth/LoginForm';
import { customRender } from '../utils/testUtils';

describe('Authentication Integration', () => {
  beforeAll(() => server.listen());
  afterEach(() => server.resetHandlers());
  afterAll(() => server.close());

  it('should login successfully with valid credentials', async () => {
    customRender(<LoginForm />);
    
    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: 'test@example.com' }
    });
    fireEvent.change(screen.getByLabelText(/password/i), {
      target: { value: 'password123' }
    });
    fireEvent.click(screen.getByRole('button', { name: /login/i }));

    await waitFor(() => {
      expect(screen.getByText(/welcome/i)).toBeInTheDocument();
    });
  });
});
```

### E2E Test Example
```typescript
// cypress/e2e/auth.cy.ts
describe('Authentication Flow', () => {
  it('should login successfully', () => {
    cy.visit('/login');
    cy.get('[data-testid="email-input"]').type('test@example.com');
    cy.get('[data-testid="password-input"]').type('password123');
    cy.get('[data-testid="login-button"]').click();
    
    cy.url().should('include', '/dashboard');
    cy.get('[data-testid="user-menu"]').should('be.visible');
  });
});
```

## Test Structure

### File Organization
```
tests/
├── components/          # Unit tests for components
│   ├── Button.test.tsx
│   └── ...
├── integration/         # Integration tests
│   ├── auth.test.tsx
│   └── ...
├── mocks/              # MSW mock handlers
│   ├── handlers.ts
│   └── server.ts
└── utils/              # Test utilities
    └── testUtils.tsx

cypress/
├── e2e/                # E2E test files
│   ├── auth.cy.ts
│   ├── dashboard.cy.ts
│   └── contacts.cy.ts
├── support/            # Cypress support files
│   ├── commands.ts
│   └── e2e.ts
└── fixtures/           # Test data files
```

### Naming Conventions
- Unit tests: `ComponentName.test.tsx`
- Integration tests: `feature.test.tsx`
- E2E tests: `feature.cy.ts`
- Test IDs: `data-testid="component-element"`

## Mocking and Test Data

### MSW (Mock Service Worker)
API mocking for integration tests:

```typescript
// tests/mocks/handlers.ts
import { rest } from 'msw';

export const handlers = [
  rest.post('/api/auth/login', (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({ user: { id: 1, email: 'test@example.com' } })
    );
  }),
];
```

### Test Data Generation
Using Faker.js for realistic test data:

```typescript
// tests/utils/testUtils.tsx
import { faker } from '@faker-js/faker';

export const generateTestData = (type: string) => {
  switch (type) {
    case 'contact':
      return {
        firstName: faker.person.firstName(),
        lastName: faker.person.lastName(),
        email: faker.internet.email(),
        phone: faker.phone.number(),
        company: faker.company.name(),
      };
    default:
      return {};
  }
};
```

### Cypress Custom Commands
```typescript
// cypress/support/commands.ts
Cypress.Commands.add('login', () => {
  cy.visit('/login');
  cy.get('[data-testid="email-input"]').type('test@example.com');
  cy.get('[data-testid="password-input"]').type('password123');
  cy.get('[data-testid="login-button"]').click();
});
```

## Coverage Reports

### Generate Coverage Report
```bash
npm run test:coverage
```

### Coverage Thresholds
Configured in `jest.config.js`:
- Branches: 70%
- Functions: 70%
- Lines: 70%
- Statements: 70%

### View Coverage Report
After running coverage, open `coverage/lcov-report/index.html` in your browser.

## CI/CD Integration

### GitHub Actions Example
```yaml
name: Tests
on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run test:ci
      - run: npm run e2e:ci
```

### Test Commands for CI
```bash
# CI-optimized test commands
npm run test:ci        # Unit & integration tests with coverage
npm run e2e:ci         # E2E tests with recording
npm run test:all       # All tests
```

## Best Practices

### General
- Write tests before or alongside code (TDD/BDD)
- Keep tests simple and focused
- Use descriptive test names
- Follow the AAA pattern (Arrange, Act, Assert)
- Mock external dependencies
- Use data-testid attributes for reliable element selection

### Unit Tests
- Test one thing at a time
- Mock all external dependencies
- Test both happy path and edge cases
- Use React Testing Library queries in order of preference:
  1. `getByRole`
  2. `getByLabelText`
  3. `getByText`
  4. `getByTestId`

### Integration Tests
- Test realistic user scenarios
- Use MSW for API mocking
- Test error states and loading states
- Verify side effects (navigation, notifications)

### E2E Tests
- Focus on critical user journeys
- Use page object pattern for complex flows
- Test across different browsers
- Keep tests independent and idempotent
- Use custom commands for common actions

### Performance
- Run unit tests frequently during development
- Run integration tests before commits
- Run E2E tests in CI/CD pipeline
- Use test.skip() or test.only() for debugging

## Troubleshooting

### Common Issues

#### Jest Tests Failing
```bash
# Clear Jest cache
npm test -- --clearCache

# Run with verbose output
npm test -- --verbose

# Debug specific test
npm run test:debug -- --testNamePattern="test name"
```

#### Cypress Issues
```bash
# Clear Cypress cache
npx cypress cache clear

# Verify Cypress installation
npx cypress verify

# Run with debug output
DEBUG=cypress:* npm run e2e:open
```

#### MSW Not Working
- Ensure MSW server is started in test setup
- Check handler URLs match your API endpoints
- Verify request methods (GET, POST, etc.)

#### Flaky Tests
- Add proper waits (`waitFor`, `cy.wait`)
- Increase timeouts for slow operations
- Use more specific selectors
- Ensure test data cleanup

### Debug Commands
```bash
# Debug Jest tests
npm run test:debug

# Debug specific test file
npm test -- --testPathPattern="Button.test.tsx" --verbose

# Debug Cypress tests
npm run cypress:open  # Interactive debugging
```

### Environment Variables
```bash
# .env.test
NEXT_PUBLIC_API_URL=http://localhost:3001
TEST_USER_EMAIL=test@example.com
TEST_USER_PASSWORD=password123
```

## Resources

- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
- [Cypress Documentation](https://docs.cypress.io/)
- [MSW Documentation](https://mswjs.io/docs/)
- [Testing Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)

## Contributing

When adding new features:
1. Write unit tests for new components
2. Add integration tests for new API endpoints
3. Update E2E tests for new user flows
4. Ensure all tests pass before submitting PR
5. Maintain or improve test coverage

For questions or issues with the testing framework, please create an issue or reach out to the development team.