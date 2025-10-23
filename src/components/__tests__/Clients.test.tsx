import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import '@testing-library/jest-dom'
import Clients from '../Clients'
import { AppProvider } from '../../context/AppContext'
import type { Client } from '../../types'

// Mock the hooks
jest.mock('../../hooks/useClientActions', () => ({
  useClientActions: () => ({
    addClient: jest.fn(),
    updateClient: jest.fn(),
    deleteClient: jest.fn(),
    addNote: jest.fn(),
    addProject: jest.fn(),
  })
}))

// Mock framer-motion
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
    button: ({ children, ...props }: any) => <button {...props}>{children}</button>,
  },
  AnimatePresence: ({ children }: any) => children,
}))

const mockClients: Client[] = [
  {
    id: '1',
    name: 'John Doe',
    email: 'john@example.com',
    phone: '+1 (555) 123-4567',
    company: 'Acme Corp',
    stage: 'lead',
    value: 50000,
    lastContact: '2024-01-15',
    notes: [],
    projects: [],
    status: 'active',
    source: 'website',
    created_at: '2024-01-01',
    updated_at: '2024-01-15',
    custom_fields: {}
  },
  {
    id: '2',
    name: 'Jane Smith',
    email: 'jane@example.com',
    phone: '+1 (555) 987-6543',
    company: 'Tech Solutions',
    stage: 'qualified',
    value: 75000,
    lastContact: '2024-01-10',
    notes: [],
    projects: [],
    status: 'active',
    source: 'referral',
    created_at: '2024-01-01',
    updated_at: '2024-01-10',
    custom_fields: {}
  }
]

const mockSalesStages = [
  { id: 'lead', name: 'Lead', color: '#3B82F6', order: 1, description: 'Initial lead stage', created_at: '2024-01-01', updated_at: '2024-01-01' },
  { id: 'qualified', name: 'Qualified', color: '#10B981', order: 2, description: 'Qualified lead stage', created_at: '2024-01-01', updated_at: '2024-01-01' },
  { id: 'proposal', name: 'Proposal', color: '#F59E0B', order: 3, description: 'Proposal stage', created_at: '2024-01-01', updated_at: '2024-01-01' },
  { id: 'closed', name: 'Closed', color: '#EF4444', order: 4, description: 'Closed stage', created_at: '2024-01-01', updated_at: '2024-01-01' }
]

const mockInitialState = {
  clients: mockClients,
  salesStages: mockSalesStages,
  contracts: [],
  invoices: [],
  tasks: [],
  events: [],
  quotes: [],
  savedProposals: [],
  adminSettings: {
    id: "admin-1",
    companyName: "Test Company",
    companyEmail: "test@company.com",
    companyPhone: "555-0123",
    companyAddress: "123 Test St",
    defaultCurrency: "USD",
    taxRate: 0.08,
    invoicePrefix: "INV",
    quotePrefix: "QUO",
    contractPrefix: "CON",
    emailSignature: "Best regards,\nTest Company",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  pendingQuoteForConversion: null,
  loading: {
    tasks: false,
    clients: false,
    events: false,
    salesStages: false,
    quotes: false,
    savedQuotes: false,
    contracts: false,
    invoices: false,
    proposals: false,
  },
  error: null,
  isOnline: true,
}

const renderWithProvider = (component: React.ReactElement) => {
  return render(
    <AppProvider initialState={mockInitialState}>
      {component}
    </AppProvider>
  )
}

describe('Clients Component', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  test('renders clients list correctly', () => {
    renderWithProvider(<Clients />)
    
    expect(screen.getByText('John Doe')).toBeInTheDocument()
    expect(screen.getByText('Jane Smith')).toBeInTheDocument()
    expect(screen.getByText('Acme Corp')).toBeInTheDocument()
    expect(screen.getByText('Tech Solutions')).toBeInTheDocument()
  })

  test('displays client contact information', () => {
    renderWithProvider(<Clients />)
    
    expect(screen.getByText('john@example.com')).toBeInTheDocument()
    expect(screen.getByText('+1 (555) 123-4567')).toBeInTheDocument()
    expect(screen.getByText('jane@example.com')).toBeInTheDocument()
    expect(screen.getByText('+1 (555) 987-6543')).toBeInTheDocument()
  })

  test('shows client values formatted correctly', () => {
    renderWithProvider(<Clients />)
    
    expect(screen.getByText('$50,000')).toBeInTheDocument()
    expect(screen.getByText('$75,000')).toBeInTheDocument()
  })

  test('displays sales stages correctly', () => {
    renderWithProvider(<Clients />)
    
    expect(screen.getByText('Lead')).toBeInTheDocument()
    expect(screen.getByText('Qualified')).toBeInTheDocument()
  })

  test('search functionality works', async () => {
    const user = userEvent.setup()
    renderWithProvider(<Clients />)
    
    const searchInput = screen.getByPlaceholderText(/search clients/i)
    await user.type(searchInput, 'John')
    
    expect(screen.getByText('John Doe')).toBeInTheDocument()
    expect(screen.queryByText('Jane Smith')).not.toBeInTheDocument()
  })

  test('filter by stage works', async () => {
    const user = userEvent.setup()
    renderWithProvider(<Clients />)
    
    // Find and click stage filter
    const stageFilter = screen.getByText('All Stages')
    await user.click(stageFilter)
    
    const leadOption = screen.getByText('Lead')
    await user.click(leadOption)
    
    expect(screen.getByText('John Doe')).toBeInTheDocument()
    expect(screen.queryByText('Jane Smith')).not.toBeInTheDocument()
  })

  test('opens add client modal', async () => {
    const user = userEvent.setup()
    renderWithProvider(<Clients />)
    
    const addButton = screen.getByText('Add Client')
    await user.click(addButton)
    
    expect(screen.getByText('Add New Client')).toBeInTheDocument()
  })

  test('client card click opens details', async () => {
    const user = userEvent.setup()
    renderWithProvider(<Clients />)
    
    const clientCard = screen.getByText('John Doe').closest('div')
    if (clientCard) {
      await user.click(clientCard)
      expect(screen.getByText('Client Details')).toBeInTheDocument()
    }
  })

  test('handles empty clients list', () => {
    const emptyState = {
      ...mockInitialState,
      clients: []
    }
    
    render(
      <AppProvider initialState={emptyState}>
        <Clients />
      </AppProvider>
    )
    
    expect(screen.getByText(/no clients found/i)).toBeInTheDocument()
  })

  test('shows client stages', () => {
    renderWithProvider(<Clients />)
    
    expect(screen.getByText('Lead')).toBeInTheDocument()
    expect(screen.getByText('Qualified')).toBeInTheDocument()
  })

  it('shows client companies', () => {
    const { container } = renderWithProvider(<Clients />)
    
    // Debug: Check if "No clients found" message is showing
    const noClientsMessage = screen.queryByText(/no clients found/i)
    if (noClientsMessage) {
      // If "No clients found" is showing, the filtering is removing all clients
      fail('"No clients found" message is displayed - filtering is removing all clients')
    }
    
    // Check if our mock clients are rendered
    expect(screen.getByText('John Doe')).toBeInTheDocument()
    expect(screen.getByText('Jane Smith')).toBeInTheDocument()
    expect(screen.getByText('Acme Corp')).toBeInTheDocument()
    expect(screen.getByText('Tech Solutions')).toBeInTheDocument()
  })

  test('displays last contact dates', async () => {
    render(
      <AppProvider initialState={mockInitialState}>
        <Clients />
      </AppProvider>
    )
    
    // Debug: Check what's actually rendered
    const table = screen.getByRole('table')
    console.log('Table content:', table.textContent)
    
    // First check if our mock clients are rendered
    expect(screen.getByText('John Doe')).toBeInTheDocument()
    expect(screen.getByText('Jane Smith')).toBeInTheDocument()
    
    // Then check for the dates
    expect(table.textContent).toContain('2024-01-15')
    expect(table.textContent).toContain('2024-01-10')
  })
})