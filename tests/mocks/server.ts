import { setupServer } from 'msw/node';
import { handlers } from './handlers';

// Setup MSW server with request handlers
export const server = setupServer(...handlers);

// Note: Jest lifecycle hooks are handled in jest.setup.js
// This file only exports the server instance