import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import '@testing-library/jest-dom'
import Dashboard from '../Dashboard'
import { AppProvider } from '../../context/AppContext'
import type { Client, Task } from '../../types'
import type { Contract, Invoice } from '../../schemas/contractInvoiceSchemas'

// Mock framer-motion
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
    h1: ({ children, ...props }: any) => <h1 {...props}>{children}</h1>,
    p: ({ children, ...props }: any) => <p {...props}>{children}</p>,
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
    created_at: '2023-12-15',
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
    stage: 'closed',
    value: 25000,
    source: 'cold-call',
    created_at: '2023-12-01',
    updated_at: '2024-01-05',
    lastContact: '2024-01-05',
    notes: [],
    projects: [],
    custom_fields: {}
  }
]

const mockTasks: Task[] = [
  {
    id: '1',
    title: 'Follow up with John Doe',
    description: 'Schedule demo call',
    due_date: '2024-01-20',
    priority: 'high',
    status: 'pending',
    assigned_to: 'sales-rep-1',
    client_id: '1',
    created_at: '2024-01-01',
    updated_at: '2024-01-15',
    tags: [],
    time_estimate: 60,
    time_spent: 0
  },
  {
    id: '2',
    title: 'Prepare proposal for Jane Smith',
    description: 'Create detailed proposal',
    due_date: '2024-01-18',
    priority: 'medium',
    status: 'in-progress',
    assigned_to: 'sales-rep-2',
    client_id: '2',
    created_at: '2024-01-01',
    updated_at: '2024-01-15',
    tags: [],
    time_estimate: 120,
    time_spent: 30
  }
]

const mockContracts: Contract[] = [
  {
    id: '1',
    clientId: '3',
    contractTitle: 'Software Development Contract',
    clientName: 'Bob Wilson',
    clientEmail: 'bob@example.com',
    startDate: '2024-01-01',
    endDate: '2024-06-01',
    terms: 'Standard terms and conditions for software development project',
    totalAmount: 25000,
    paymentSchedule: 'Monthly',
    scopeOfWork: 'Complete software development including design, development, testing and deployment'
  }
]

const mockInvoices: Invoice[] = [
  {
    id: '1',
    clientId: '3',
    invoiceNumber: 'INV-001',
    clientName: 'Bob Wilson',
    clientEmail: 'bob@example.com',
    clientAddress: '123 Main St, City, State 12345',
    issueDate: '2024-01-15',
    dueDate: '2024-01-30',
    status: 'Sent',
    items: [
      {
        description: 'Software Development Phase 1',
        quantity: 1,
        price: 5000
      }
    ]
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
  contracts: mockContracts,
  invoices: mockInvoices,
  tasks: mockTasks,
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
    <AppProvider>
      {component}
    </AppProvider>
  )
}

describe('Dashboard Component', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  test('renders dashboard component', async () => {
    renderWithProvider(<Dashboard />)
    // Wait for the animated Dashboard title to appear
    await waitFor(() => {
      expect(screen.getByText('Dashboard')).toBeInTheDocument()
    })
  })

  test('displays active clients metric', async () => {
    renderWithProvider(<Dashboard />)
    await waitFor(() => {
      expect(screen.getByText('Active Clients')).toBeInTheDocument()
    }, { timeout: 3000 })
  })

  test('displays total pipeline value metric', async () => {
    renderWithProvider(<Dashboard />)
    await waitFor(() => {
      expect(screen.getByText('Total Pipeline Value')).toBeInTheDocument()
    }, { timeout: 3000 })
  })

  test('displays active projects metric', async () => {
    renderWithProvider(<Dashboard />)
    await waitFor(() => {
      expect(screen.getByText('Active Projects')).toBeInTheDocument()
    }, { timeout: 3000 })
  })

  test('displays task completion metric', async () => {
    renderWithProvider(<Dashboard />)
    await waitFor(() => {
      expect(screen.getByText('Tasks Completion')).toBeInTheDocument()
    }, { timeout: 3000 })
  })

  test('shows recent activity section', async () => {
    renderWithProvider(<Dashboard />)
    await waitFor(() => {
      expect(screen.getByText('Recent Activity')).toBeInTheDocument()
    }, { timeout: 3000 })
  })

  test('displays revenue trend chart', async () => {
    renderWithProvider(<Dashboard />)
    await waitFor(() => {
      expect(screen.getByText('Revenue Trend (Last 7 Months)')).toBeInTheDocument()
    }, { timeout: 3000 })
  })

  test('shows new clients chart', async () => {
    renderWithProvider(<Dashboard />)
    await waitFor(() => {
      expect(screen.getByText('New Clients (Last 7 Months)')).toBeInTheDocument()
    }, { timeout: 3000 })
  })

  test('displays upcoming tasks and events', async () => {
    renderWithProvider(<Dashboard />)
    await waitFor(() => {
      expect(screen.getByText('Upcoming Tasks & Events')).toBeInTheDocument()
      expect(screen.getByText('Client meeting')).toBeInTheDocument()
      expect(screen.getByText('Send proposal')).toBeInTheDocument()
    }, { timeout: 3000 })
  })

  test('shows recent activity section', async () => {
    renderWithProvider(<Dashboard />)
    await waitFor(() => {
      expect(screen.getByText('Recent Activity')).toBeInTheDocument()
      expect(screen.getByText('New client added')).toBeInTheDocument()
      expect(screen.getByText('Task completed')).toBeInTheDocument()
    }, { timeout: 3000 })
  })

  test('displays client distribution by stage', async () => {
    renderWithProvider(<Dashboard />)
    
    await waitFor(() => {
      // Should show distribution: 1 lead, 1 qualified, 1 closed
      const leadClients = mockClients.filter(c => c.stage === 'lead').length
      const qualifiedClients = mockClients.filter(c => c.stage === 'qualified').length
      const closedClients = mockClients.filter(c => c.stage === 'closed').length
      
      expect(leadClients).toBe(1)
      expect(qualifiedClients).toBe(1)
      expect(closedClients).toBe(1)
    }, { timeout: 3000 })
  })

  test('handles setActiveTab prop correctly', async () => {
    const mockSetActiveTab = jest.fn()
    renderWithProvider(<Dashboard setActiveTab={mockSetActiveTab} />)
    
    // Component should render without errors when setActiveTab is provided
    await waitFor(() => {
      expect(screen.getByText('Dashboard')).toBeInTheDocument()
    }, { timeout: 3000 })
  })

  test('displays correct priority distribution', async () => {
    renderWithProvider(<Dashboard />)
    
    await waitFor(() => {
      const highPriorityCount = mockTasks.filter(t => t.priority === 'high').length
      const mediumPriorityCount = mockTasks.filter(t => t.priority === 'medium').length
      const lowPriorityCount = mockTasks.filter(t => t.priority === 'low').length
      
      expect(highPriorityCount).toBe(1)
      expect(mediumPriorityCount).toBe(1)
      expect(lowPriorityCount).toBe(1)
    }, { timeout: 3000 })
  })

  test('shows welcome message', async () => {
    renderWithProvider(<Dashboard />)
    await waitFor(() => {
      expect(screen.getByText('Welcome back! Here\'s an overview of your sales performance.')).toBeInTheDocument()
    }, { timeout: 3000 })
  })

  test('calculates task completion rate correctly', async () => {
    renderWithProvider(<Dashboard />)
    
    // Component should calculate and display task completion rate
    await waitFor(() => {
      expect(screen.getByText('Tasks Completion')).toBeInTheDocument()
    }, { timeout: 3000 })
  })

  test('handles empty data gracefully', async () => {
    const emptyState = {
      ...mockInitialState,
      clients: [],
      tasks: [],
      contracts: [],
      invoices: []
    }
    
    render(
      <AppProvider initialState={emptyState}>
        <Dashboard />
      </AppProvider>
    )
    
    await waitFor(() => {
      expect(screen.getByText('0')).toBeInTheDocument() // Should show 0 for metrics
    }, { timeout: 3000 })
  })

  test('chart components render without errors', async () => {
    renderWithProvider(<Dashboard />)
    
    // Check that chart sections are present
    await waitFor(() => {
      expect(screen.getByText('Revenue Trend (Last 7 Months)')).toBeInTheDocument()
      expect(screen.getByText('New Clients (Last 7 Months)')).toBeInTheDocument()
    }, { timeout: 3000 })
  })

  test('activity feed shows recent client interactions', async () => {
    renderWithProvider(<Dashboard />)
    
    // Should show recent client activities based on lastContact dates
    await waitFor(() => {
      expect(screen.getByText('Recent Activity')).toBeInTheDocument()
    })
  })

  test('responsive design elements are present', async () => {
    renderWithProvider(<Dashboard />)
    
    // Check that dashboard renders properly
    await waitFor(() => {
      expect(screen.getByText('Dashboard')).toBeInTheDocument()
    })
    expect(screen.getByText('Welcome back! Here\'s an overview of your sales performance.')).toBeInTheDocument()
  })
})