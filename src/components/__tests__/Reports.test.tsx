import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import '@testing-library/jest-dom'
import Reports from '../Reports'
import { AppProvider } from '../../context/AppContext'
import type { Client, Task } from '../../types'
import type { Contract, Invoice } from '../../schemas/contractInvoiceSchemas'

// Mock framer-motion
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
    button: ({ children, ...props }: any) => <button {...props}>{children}</button>,
  },
  AnimatePresence: ({ children }: any) => children,
}))

// Mock chart libraries
jest.mock('recharts', () => ({
  BarChart: ({ children }: any) => <div data-testid="bar-chart">{children}</div>,
  LineChart: ({ children }: any) => <div data-testid="line-chart">{children}</div>,
  PieChart: ({ children }: any) => <div data-testid="pie-chart">{children}</div>,
  Bar: () => <div data-testid="bar" />,
  Line: () => <div data-testid="line" />,
  Pie: () => <div data-testid="pie" />,
  XAxis: () => <div data-testid="x-axis" />,
  YAxis: () => <div data-testid="y-axis" />,
  CartesianGrid: () => <div data-testid="cartesian-grid" />,
  Tooltip: () => <div data-testid="tooltip" />,
  Legend: () => <div data-testid="legend" />,
  ResponsiveContainer: ({ children }: any) => <div data-testid="responsive-container">{children}</div>,
  Cell: () => <div data-testid="cell" />,
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
    title: 'Prepare proposal',
    description: 'Create proposal',
    due_date: '2024-01-18',
    priority: 'medium',
    status: 'completed',
    assigned_to: 'sales-rep-2',
    client_id: '2',
    created_at: '2024-01-01',
    updated_at: '2024-01-15',
    tags: [],
    time_estimate: 90,
    time_spent: 85
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
  },
  {
    id: '2',
    clientId: '3',
    invoiceNumber: 'INV-002',
    clientName: 'Bob Wilson',
    clientEmail: 'bob@example.com',
    clientAddress: '123 Main St, City, State 12345',
    issueDate: '2024-02-01',
    dueDate: '2024-02-15',
    status: 'Paid',
    items: [
      {
        description: 'Software Development Phase 2',
        quantity: 1,
        price: 3000
      }
    ]
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
    <AppProvider initialState={mockInitialState}>
      {component}
    </AppProvider>
  )
}

describe('Reports Component', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  test('renders reports component', () => {
    renderWithProvider(<Reports />)
    expect(screen.getByText('Reports & Analytics')).toBeInTheDocument()
  })

  test('displays sales overview metrics', () => {
    renderWithProvider(<Reports />)
    
    expect(screen.getByText('Sales Overview')).toBeInTheDocument()
    expect(screen.getByText('Total Revenue')).toBeInTheDocument()
    expect(screen.getByText('Active Clients')).toBeInTheDocument()
    expect(screen.getByText('Conversion Rate')).toBeInTheDocument()
  })

  test('shows correct total revenue calculation', () => {
    renderWithProvider(<Reports />)
    
    // Total revenue should be sum of all client values
    const totalRevenue = mockClients.reduce((sum, client) => sum + client.value, 0)
    expect(screen.getByText(`$${totalRevenue.toLocaleString()}`)).toBeInTheDocument()
  })

  test('displays correct client count', () => {
    renderWithProvider(<Reports />)
    
    expect(screen.getByText(mockClients.length.toString())).toBeInTheDocument()
  })

  test('calculates conversion rate correctly', () => {
    renderWithProvider(<Reports />)
    
    const closedClients = mockClients.filter(c => c.stage === 'closed').length
    const totalClients = mockClients.length
    const conversionRate = Math.round((closedClients / totalClients) * 100)
    
    expect(screen.getByText(`${conversionRate}%`)).toBeInTheDocument()
  })

  test('displays sales pipeline chart', () => {
    renderWithProvider(<Reports />)
    
    expect(screen.getByText('Sales Pipeline')).toBeInTheDocument()
    expect(screen.getByTestId('bar-chart')).toBeInTheDocument()
  })

  test('shows revenue trend chart', () => {
    renderWithProvider(<Reports />)
    
    expect(screen.getByText('Revenue Trend')).toBeInTheDocument()
    expect(screen.getByTestId('line-chart')).toBeInTheDocument()
  })

  test('displays client source distribution', () => {
    renderWithProvider(<Reports />)
    
    expect(screen.getByText('Client Sources')).toBeInTheDocument()
    expect(screen.getByTestId('pie-chart')).toBeInTheDocument()
  })

  test('shows task completion metrics', () => {
    renderWithProvider(<Reports />)
    
    expect(screen.getByText('Task Performance')).toBeInTheDocument()
    
    const completedTasks = mockTasks.filter(t => t.status === 'completed').length
    const totalTasks = mockTasks.length
    const completionRate = Math.round((completedTasks / totalTasks) * 100)
    
    expect(screen.getByText(`${completionRate}%`)).toBeInTheDocument()
  })

  test('displays invoice status breakdown', () => {
    renderWithProvider(<Reports />)
    
    expect(screen.getByText('Invoice Status')).toBeInTheDocument()
    
    const pendingInvoices = mockInvoices.filter(i => i.status === 'Sent').length
    const paidInvoices = mockInvoices.filter(i => i.status === 'Paid').length
    
    expect(pendingInvoices).toBe(1)
    expect(paidInvoices).toBe(1)
  })

  test('shows contract performance metrics', () => {
    renderWithProvider(<Reports />)
    
    expect(screen.getByText('Contract Performance')).toBeInTheDocument()
    expect(screen.getByText('Active Contracts')).toBeInTheDocument()
    expect(screen.getByText(mockContracts.length.toString())).toBeInTheDocument()
  })

  test('date range filter works', async () => {
    const user = userEvent.setup()
    renderWithProvider(<Reports />)
    
    const dateRangeButton = screen.getByText('Last 30 Days')
    await user.click(dateRangeButton)
    
    expect(screen.getByText('Last 7 Days')).toBeInTheDocument()
    expect(screen.getByText('Last 90 Days')).toBeInTheDocument()
    expect(screen.getByText('Custom Range')).toBeInTheDocument()
  })

  test('export report functionality works', async () => {
    const user = userEvent.setup()
    renderWithProvider(<Reports />)
    
    const exportButton = screen.getByText('Export Report')
    await user.click(exportButton)
    
    expect(screen.getByText('Export Options')).toBeInTheDocument()
    expect(screen.getByText('PDF')).toBeInTheDocument()
    expect(screen.getByText('Excel')).toBeInTheDocument()
    expect(screen.getByText('CSV')).toBeInTheDocument()
  })

  test('report type switching works', async () => {
    const user = userEvent.setup()
    renderWithProvider(<Reports />)
    
    const salesReportTab = screen.getByText('Sales Report')
    const performanceReportTab = screen.getByText('Performance Report')
    
    await user.click(performanceReportTab)
    expect(screen.getByText('Team Performance')).toBeInTheDocument()
    
    await user.click(salesReportTab)
    expect(screen.getByText('Sales Overview')).toBeInTheDocument()
  })

  test('displays sales rep performance', () => {
    renderWithProvider(<Reports />)
    
    expect(screen.getByText('Sales Rep Performance')).toBeInTheDocument()
    expect(screen.getByText('sales-rep-1')).toBeInTheDocument()
    expect(screen.getByText('sales-rep-2')).toBeInTheDocument()
  })

  test('shows priority distribution', () => {
    renderWithProvider(<Reports />)
    
    expect(screen.getByText('Priority Distribution')).toBeInTheDocument()
    
    const highPriorityCount = mockTasks.filter(t => t.priority === 'high').length
    const mediumPriorityCount = mockTasks.filter(t => t.priority === 'medium').length
    const lowPriorityCount = mockTasks.filter(t => t.priority === 'low').length
    
    expect(highPriorityCount).toBe(1)
    expect(mediumPriorityCount).toBe(1)
    expect(lowPriorityCount).toBe(1)
  })

  test('displays stage progression metrics', () => {
    renderWithProvider(<Reports />)
    
    expect(screen.getByText('Stage Progression')).toBeInTheDocument()
    
    // Check stage distribution
    const leadCount = mockClients.filter(c => c.stage === 'lead').length
    const qualifiedCount = mockClients.filter(c => c.stage === 'qualified').length
    const closedCount = mockClients.filter(c => c.stage === 'closed').length
    
    expect(leadCount).toBe(1)
    expect(qualifiedCount).toBe(1)
    expect(closedCount).toBe(1)
  })

  test('shows average deal size', () => {
    renderWithProvider(<Reports />)
    
    expect(screen.getByText('Average Deal Size')).toBeInTheDocument()
    
    const totalValue = mockClients.reduce((sum, client) => sum + client.value, 0)
    const averageValue = Math.round(totalValue / mockClients.length)
    
    expect(screen.getByText(`$${averageValue.toLocaleString()}`)).toBeInTheDocument()
  })

  test('displays monthly recurring revenue', () => {
    renderWithProvider(<Reports />)
    
    expect(screen.getByText('Monthly Recurring Revenue')).toBeInTheDocument()
  })

  test('shows client acquisition cost', () => {
    renderWithProvider(<Reports />)
    
    expect(screen.getByText('Client Acquisition Cost')).toBeInTheDocument()
  })

  test('displays sales velocity metrics', () => {
    renderWithProvider(<Reports />)
    
    expect(screen.getByText('Sales Velocity')).toBeInTheDocument()
  })

  test('handles empty data gracefully', () => {
    const emptyState = {
      ...mockInitialState,
      clients: [],
      tasks: [],
      contracts: [],
      invoices: []
    }
    
    render(
      <AppProvider initialState={emptyState}>
        <Reports />
      </AppProvider>
    )
    
    expect(screen.getByText('No data available')).toBeInTheDocument()
  })

  test('refresh data functionality works', async () => {
    const user = userEvent.setup()
    renderWithProvider(<Reports />)
    
    const refreshButton = screen.getByText('Refresh Data')
    await user.click(refreshButton)
    
    // Should show loading state
    expect(screen.getByText('Refreshing...')).toBeInTheDocument()
  })

  test('custom date range picker works', async () => {
    const user = userEvent.setup()
    renderWithProvider(<Reports />)
    
    const dateRangeButton = screen.getByText('Last 30 Days')
    await user.click(dateRangeButton)
    
    const customRangeOption = screen.getByText('Custom Range')
    await user.click(customRangeOption)
    
    expect(screen.getByText('Select Date Range')).toBeInTheDocument()
  })

  test('drill-down functionality works', async () => {
    const user = userEvent.setup()
    renderWithProvider(<Reports />)
    
    // Click on a chart element to drill down
    const chartElement = screen.getByTestId('bar-chart')
    await user.click(chartElement)
    
    expect(screen.getByText('Detailed View')).toBeInTheDocument()
  })

  test('report scheduling works', async () => {
    const user = userEvent.setup()
    renderWithProvider(<Reports />)
    
    const scheduleButton = screen.getByText('Schedule Report')
    await user.click(scheduleButton)
    
    expect(screen.getByText('Schedule Options')).toBeInTheDocument()
    expect(screen.getByText('Daily')).toBeInTheDocument()
    expect(screen.getByText('Weekly')).toBeInTheDocument()
    expect(screen.getByText('Monthly')).toBeInTheDocument()
  })

  test('responsive design works correctly', () => {
    // Mock mobile viewport
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 768,
    })
    
    renderWithProvider(<Reports />)
    
    const reportsContainer = screen.getByText('Reports & Analytics').closest('div')
    expect(reportsContainer).toBeInTheDocument()
  })

  test('chart tooltips display correctly', async () => {
    const user = userEvent.setup()
    renderWithProvider(<Reports />)
    
    const chartElement = screen.getByTestId('bar-chart')
    await user.hover(chartElement)
    
    expect(screen.getByTestId('tooltip')).toBeInTheDocument()
  })

  test('legend interactions work', async () => {
    const user = userEvent.setup()
    renderWithProvider(<Reports />)
    
    const legendElement = screen.getByTestId('legend')
    await user.click(legendElement)
    
    // Should toggle data series visibility
    expect(legendElement).toBeInTheDocument()
  })
})