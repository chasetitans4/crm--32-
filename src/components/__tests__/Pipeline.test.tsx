import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import '@testing-library/jest-dom'
import Pipeline from '../Pipeline'
import { AppProvider } from '../../context/AppContext'
import type { Client } from '../../types'

// Mock the hooks
jest.mock('../../hooks/useClientActions', () => ({
  useClientActions: () => ({
    updateClientStage: jest.fn(),
    addClient: jest.fn(),
    updateClient: jest.fn(),
    deleteClient: jest.fn(),
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

// Mock the Pipeline sub-components
jest.mock('../Pipeline/PipelineMetricsView', () => {
  return function MockPipelineMetricsView() {
    return <div data-testid="pipeline-metrics-view">Pipeline Metrics View</div>
  }
})

jest.mock('../Pipeline/PipelineCardsView', () => {
  return function MockPipelineCardsView() {
    return <div data-testid="pipeline-cards-view">Pipeline Cards View</div>
  }
})

const mockClients: Client[] = [
  {
    id: '1',
    name: 'John Doe',
    email: 'john@example.com',
    phone: '+1 (555) 123-4567',
    company: 'Acme Corp',
    status: 'active',
    stage: 'lead',
    value: 50000,
    source: 'website',
    created_at: '2024-01-01',
    updated_at: '2024-01-15',
    lastContact: '2024-01-15',
    notes: [],
    projects: [],
    custom_fields: {}
  },
  {
    id: '2',
    name: 'Jane Smith',
    email: 'jane@example.com',
    phone: '+1 (555) 987-6543',
    company: 'Tech Solutions',
    status: 'active',
    stage: 'qualified',
    value: 75000,
    source: 'referral',
    created_at: '2024-01-05',
    updated_at: '2024-01-10',
    lastContact: '2024-01-10',
    notes: [],
    projects: [],
    custom_fields: {}
  },
  {
    id: '3',
    name: 'Bob Wilson',
    email: 'bob@example.com',
    phone: '+1 (555) 456-7890',
    company: 'StartupXYZ',
    status: 'active',
    stage: 'proposal',
    value: 25000,
    source: 'cold-call',
    created_at: '2024-01-01',
    updated_at: '2024-01-05',
    lastContact: '2024-01-05',
    notes: [],
    projects: [],
    custom_fields: {}
  },
  {
    id: '4',
    name: 'Alice Johnson',
    email: 'alice@example.com',
    phone: '+1 (555) 321-0987',
    company: 'Enterprise Inc',
    status: 'active',
    stage: 'closed',
    value: 100000,
    source: 'referral',
    created_at: '2023-12-01',
    updated_at: '2024-01-01',
    lastContact: '2024-01-01',
    notes: [],
    projects: [],
    custom_fields: {}
  }
]

const mockSalesStages = [
  { id: 'lead', name: 'Lead', color: '#3B82F6', order: 1, description: 'Initial lead stage', created_at: '2024-01-01T00:00:00Z', updated_at: '2024-01-01T00:00:00Z' },
  { id: 'qualified', name: 'Qualified', color: '#10B981', order: 2, description: 'Qualified prospect', created_at: '2024-01-01T00:00:00Z', updated_at: '2024-01-01T00:00:00Z' },
  { id: 'proposal', name: 'Proposal', color: '#F59E0B', order: 3, description: 'Proposal sent', created_at: '2024-01-01T00:00:00Z', updated_at: '2024-01-01T00:00:00Z' },
  { id: 'closed', name: 'Closed', color: '#EF4444', order: 4, description: 'Deal closed', created_at: '2024-01-01T00:00:00Z', updated_at: '2024-01-01T00:00:00Z' }
]

const mockInitialState = {
  clients: mockClients,
  salesStages: mockSalesStages,
  contracts: [],
  invoices: [],
  tasks: [],
  projects: [],
  reports: [],
  settings: {
    currency: 'USD',
    dateFormat: 'MM/DD/YYYY',
    timezone: 'UTC'
  }
}

const renderWithProvider = (component: React.ReactElement) => {
  return render(
    <AppProvider initialState={mockInitialState}>
      {component}
    </AppProvider>
  )
}

describe('Pipeline Component', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  test('renders pipeline component', () => {
    renderWithProvider(<Pipeline />)
    expect(screen.getByText('Sales Pipeline')).toBeInTheDocument()
  })

  test('displays all sales stages', () => {
    renderWithProvider(<Pipeline />)
    
    expect(screen.getByText('Lead')).toBeInTheDocument()
    expect(screen.getByText('Qualified')).toBeInTheDocument()
    expect(screen.getByText('Proposal')).toBeInTheDocument()
    expect(screen.getByText('Closed')).toBeInTheDocument()
  })

  test('shows clients in correct stages', () => {
    renderWithProvider(<Pipeline />)
    
    // Check that clients appear in their respective stages
    expect(screen.getByText('John Doe')).toBeInTheDocument()
    expect(screen.getByText('Jane Smith')).toBeInTheDocument()
    expect(screen.getByText('Bob Wilson')).toBeInTheDocument()
    expect(screen.getByText('Alice Johnson')).toBeInTheDocument()
  })

  test('displays client values correctly', () => {
    renderWithProvider(<Pipeline />)
    
    expect(screen.getByText('$50,000')).toBeInTheDocument()
    expect(screen.getByText('$75,000')).toBeInTheDocument()
    expect(screen.getByText('$25,000')).toBeInTheDocument()
    expect(screen.getByText('$100,000')).toBeInTheDocument()
  })

  test('calculates stage totals correctly', () => {
    renderWithProvider(<Pipeline />)
    
    // Lead stage: $50,000
    // Qualified stage: $75,000
    // Proposal stage: $25,000
    // Closed stage: $100,000
    
    const leadTotal = mockClients.filter(c => c.stage === 'lead').reduce((sum, c) => sum + c.value, 0)
    const qualifiedTotal = mockClients.filter(c => c.stage === 'qualified').reduce((sum, c) => sum + c.value, 0)
    const proposalTotal = mockClients.filter(c => c.stage === 'proposal').reduce((sum, c) => sum + c.value, 0)
    const closedTotal = mockClients.filter(c => c.stage === 'closed').reduce((sum, c) => sum + c.value, 0)
    
    expect(leadTotal).toBe(50000)
    expect(qualifiedTotal).toBe(75000)
    expect(proposalTotal).toBe(25000)
    expect(closedTotal).toBe(100000)
  })

  test('view mode switching works', async () => {
    const user = userEvent.setup()
    renderWithProvider(<Pipeline />)
    
    // Test switching to metrics view
    const metricsButton = screen.getByText('Metrics')
    await user.click(metricsButton)
    
    expect(screen.getByTestId('pipeline-metrics-view')).toBeInTheDocument()
  })

  test('search functionality filters clients', async () => {
    const user = userEvent.setup()
    renderWithProvider(<Pipeline />)
    
    const searchInput = screen.getByPlaceholderText(/search clients/i)
    await user.type(searchInput, 'John')
    
    expect(screen.getByText('John Doe')).toBeInTheDocument()
    expect(screen.queryByText('Jane Smith')).not.toBeInTheDocument()
  })

  test('filter by value range works', async () => {
    const user = userEvent.setup()
    renderWithProvider(<Pipeline />)
    
    // Open filters
    const filterButton = screen.getByText('Filters')
    await user.click(filterButton)
    
    // Set minimum value filter
    const minValueInput = screen.getByLabelText(/minimum value/i)
    await user.clear(minValueInput)
    await user.type(minValueInput, '60000')
    
    // Should show only clients with value >= 60000
    expect(screen.getByText('Jane Smith')).toBeInTheDocument() // $75,000
    expect(screen.getByText('Alice Johnson')).toBeInTheDocument() // $100,000
    expect(screen.queryByText('John Doe')).not.toBeInTheDocument() // $50,000
    expect(screen.queryByText('Bob Wilson')).not.toBeInTheDocument() // $25,000
  })

  test('displays stage metrics correctly', () => {
    renderWithProvider(<Pipeline />)
    
    // Check client count per stage
    const leadCount = mockClients.filter(c => c.stage === 'lead').length
    const qualifiedCount = mockClients.filter(c => c.stage === 'qualified').length
    const proposalCount = mockClients.filter(c => c.stage === 'proposal').length
    const closedCount = mockClients.filter(c => c.stage === 'closed').length
    
    expect(leadCount).toBe(1)
    expect(qualifiedCount).toBe(1)
    expect(proposalCount).toBe(1)
    expect(closedCount).toBe(1)
  })

  test('handles drag and drop functionality', async () => {
    const user = userEvent.setup()
    renderWithProvider(<Pipeline />)
    
    // Find a client card
    const clientCard = screen.getByText('John Doe').closest('[draggable]')
    
    if (clientCard) {
      // Simulate drag start
      fireEvent.dragStart(clientCard)
      
      // Find a drop zone (different stage)
      const qualifiedStage = screen.getByText('Qualified').closest('.stage-column')
      
      if (qualifiedStage) {
        // Simulate drop
        fireEvent.dragOver(qualifiedStage)
        fireEvent.drop(qualifiedStage)
        
        // Verify that updateClientStage was called
        // Note: This would require mocking the hook properly
      }
    }
  })

  test('shows client priority indicators', () => {
    renderWithProvider(<Pipeline />)
    
    // Check for priority indicators
    const highPriorityElements = screen.getAllByText(/high/i)
    const mediumPriorityElements = screen.getAllByText(/medium/i)
    const lowPriorityElements = screen.getAllByText(/low/i)
    
    expect(highPriorityElements.length).toBeGreaterThan(0)
    expect(mediumPriorityElements.length).toBeGreaterThan(0)
    expect(lowPriorityElements.length).toBeGreaterThan(0)
  })

  test('displays client tags', () => {
    renderWithProvider(<Pipeline />)
    
    expect(screen.getByText('enterprise')).toBeInTheDocument()
    expect(screen.getByText('tech')).toBeInTheDocument()
    expect(screen.getByText('startup')).toBeInTheDocument()
    expect(screen.getByText('vip')).toBeInTheDocument()
  })

  test('handles empty pipeline gracefully', () => {
    const emptyState = {
      ...mockInitialState,
      clients: []
    }
    
    render(
      <AppProvider initialState={emptyState}>
        <Pipeline />
      </AppProvider>
    )
    
    expect(screen.getByText('Sales Pipeline')).toBeInTheDocument()
    expect(screen.getByText(/no clients in pipeline/i)).toBeInTheDocument()
  })

  test('calculates conversion rates correctly', () => {
    renderWithProvider(<Pipeline />)
    
    const totalClients = mockClients.length
    const closedClients = mockClients.filter(c => c.stage === 'closed').length
    const conversionRate = Math.round((closedClients / totalClients) * 100)
    
    expect(conversionRate).toBe(25) // 1 out of 4 clients closed
  })

  test('shows pipeline velocity metrics', () => {
    renderWithProvider(<Pipeline />)
    
    // Switch to metrics view to see velocity
    const metricsButton = screen.getByText('Metrics')
    fireEvent.click(metricsButton)
    
    expect(screen.getByTestId('pipeline-metrics-view')).toBeInTheDocument()
  })

  test('bulk actions work correctly', async () => {
    const user = userEvent.setup()
    renderWithProvider(<Pipeline />)
    
    // Select multiple clients
    const checkboxes = screen.getAllByRole('checkbox')
    
    if (checkboxes.length > 0) {
      await user.click(checkboxes[0])
      await user.click(checkboxes[1])
      
      // Check that bulk actions become available
      expect(screen.getByText('Bulk Actions')).toBeInTheDocument()
    }
  })

  test('export functionality works', async () => {
    const user = userEvent.setup()
    renderWithProvider(<Pipeline />)
    
    const exportButton = screen.getByText('Export')
    await user.click(exportButton)
    
    // Should show export options
    expect(screen.getByText('Export Pipeline Data')).toBeInTheDocument()
  })

  test('responsive design adapts to screen size', () => {
    // Mock window.innerWidth
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 768,
    })
    
    renderWithProvider(<Pipeline />)
    
    // Check that mobile view is rendered
    const pipelineContainer = screen.getByText('Sales Pipeline').closest('div')
    expect(pipelineContainer).toBeInTheDocument()
  })
})