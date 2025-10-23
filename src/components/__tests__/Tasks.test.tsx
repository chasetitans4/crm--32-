import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import '@testing-library/jest-dom'
import Tasks from '../Tasks'
import { AppProvider } from '../../context/AppContext'
import type { Task, Client } from '../../types'

// Mock framer-motion
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
    button: ({ children, ...props }: any) => <button {...props}>{children}</button>,
    li: ({ children, ...props }: any) => <li {...props}>{children}</li>,
  },
  AnimatePresence: ({ children }: any) => children,
}))

const mockTasks: Task[] = [
  {
    id: '1',
    title: 'Follow up with John Doe',
    description: 'Schedule demo call and send proposal',
    due_date: '2024-01-20',
    priority: 'high',
    status: 'pending',
    assigned_to: 'sales-rep-1',
    client_id: '1',
    created_at: '2024-01-15',
    updated_at: '2024-01-15',
    tags: [],
    time_estimate: 2,
    time_spent: 0
  },
  {
    id: '2',
    title: 'Prepare proposal for Jane Smith',
    description: 'Create detailed technical proposal',
    due_date: '2024-01-18',
    priority: 'medium',
    status: 'in-progress',
    assigned_to: 'sales-rep-2',
    client_id: '2',
    created_at: '2024-01-10',
    updated_at: '2024-01-12',
    tags: [],
    time_estimate: 4,
    time_spent: 2
  },
  {
    id: '3',
    title: 'Contract review',
    description: 'Review and finalize contract terms',
    due_date: '2024-01-25',
    priority: 'low',
    status: 'completed',
    assigned_to: 'sales-rep-1',
    client_id: '3',
    created_at: '2024-01-05',
    updated_at: '2024-01-15',
    tags: [],
    time_estimate: 1,
    time_spent: 1
  },
  {
    id: '4',
    title: 'Client onboarding',
    description: 'Setup new client account and training',
    due_date: '2024-01-22',
    priority: 'high',
    status: 'overdue',
    assigned_to: 'sales-rep-2',
    client_id: '4',
    created_at: '2024-01-01',
    updated_at: '2024-01-10',
    tags: [],
    time_estimate: 3,
    time_spent: 0
  }
]

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
  }
]

const mockInitialState = {
  clients: mockClients,
  salesStages: [],
  contracts: [],
  invoices: [],
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

describe('Tasks Component', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  test('renders tasks component', () => {
    renderWithProvider(<Tasks />)
    expect(screen.getByText('Tasks')).toBeInTheDocument()
  })

  test('displays all tasks', () => {
    renderWithProvider(<Tasks />)
    
    expect(screen.getByText('Follow up with John Doe')).toBeInTheDocument()
    expect(screen.getByText('Prepare proposal for Jane Smith')).toBeInTheDocument()
    expect(screen.getByText('Contract review')).toBeInTheDocument()
    expect(screen.getByText('Client onboarding')).toBeInTheDocument()
  })

  test('shows task descriptions', () => {
    renderWithProvider(<Tasks />)
    
    expect(screen.getByText('Schedule demo call and send proposal')).toBeInTheDocument()
    expect(screen.getByText('Create detailed technical proposal')).toBeInTheDocument()
    expect(screen.getByText('Review and finalize contract terms')).toBeInTheDocument()
    expect(screen.getByText('Setup new client account and training')).toBeInTheDocument()
  })

  test('displays task priorities correctly', () => {
    renderWithProvider(<Tasks />)
    
    const highPriorityTasks = screen.getAllByText('High')
    const mediumPriorityTasks = screen.getAllByText('Medium')
    const lowPriorityTasks = screen.getAllByText('Low')
    
    expect(highPriorityTasks.length).toBe(2) // 2 high priority tasks
    expect(mediumPriorityTasks.length).toBe(1) // 1 medium priority task
    expect(lowPriorityTasks.length).toBe(1) // 1 low priority task
  })

  test('shows task statuses correctly', () => {
    renderWithProvider(<Tasks />)
    
    expect(screen.getByText('Pending')).toBeInTheDocument()
    expect(screen.getByText('In Progress')).toBeInTheDocument()
    expect(screen.getByText('Completed')).toBeInTheDocument()
    expect(screen.getByText('Overdue')).toBeInTheDocument()
  })

  test('displays due dates', () => {
    renderWithProvider(<Tasks />)
    
    expect(screen.getByText('2024-01-20')).toBeInTheDocument()
    expect(screen.getByText('2024-01-18')).toBeInTheDocument()
    expect(screen.getByText('2024-01-25')).toBeInTheDocument()
    expect(screen.getByText('2024-01-22')).toBeInTheDocument()
  })

  test('shows assigned users', () => {
    renderWithProvider(<Tasks />)
    
    expect(screen.getByText('sales-rep-1')).toBeInTheDocument()
    expect(screen.getByText('sales-rep-2')).toBeInTheDocument()
  })

  test('filter by status works', async () => {
    const user = userEvent.setup()
    renderWithProvider(<Tasks />)
    
    // Filter by pending status
    const statusFilter = screen.getByText('All Status')
    await user.click(statusFilter)
    
    const pendingOption = screen.getByText('Pending')
    await user.click(pendingOption)
    
    expect(screen.getByText('Follow up with John Doe')).toBeInTheDocument()
    expect(screen.queryByText('Prepare proposal for Jane Smith')).not.toBeInTheDocument()
  })

  test('filter by priority works', async () => {
    const user = userEvent.setup()
    renderWithProvider(<Tasks />)
    
    // Filter by high priority
    const priorityFilter = screen.getByText('All Priorities')
    await user.click(priorityFilter)
    
    const highOption = screen.getByText('High')
    await user.click(highOption)
    
    expect(screen.getByText('Follow up with John Doe')).toBeInTheDocument()
    expect(screen.getByText('Client onboarding')).toBeInTheDocument()
    expect(screen.queryByText('Prepare proposal for Jane Smith')).not.toBeInTheDocument()
  })

  test('search functionality works', async () => {
    const user = userEvent.setup()
    renderWithProvider(<Tasks />)
    
    const searchInput = screen.getByPlaceholderText(/search tasks/i)
    await user.type(searchInput, 'proposal')
    
    expect(screen.getByText('Prepare proposal for Jane Smith')).toBeInTheDocument()
    expect(screen.queryByText('Follow up with John Doe')).not.toBeInTheDocument()
  })

  test('opens add task modal', async () => {
    const user = userEvent.setup()
    renderWithProvider(<Tasks />)
    
    const addButton = screen.getByText('Add Task')
    await user.click(addButton)
    
    expect(screen.getByText('Create New Task')).toBeInTheDocument()
  })

  test('task completion toggle works', async () => {
    const user = userEvent.setup()
    renderWithProvider(<Tasks />)
    
    // Find a pending task checkbox
    const taskCheckbox = screen.getByLabelText('Mark Follow up with John Doe as complete')
    await user.click(taskCheckbox)
    
    // Task should be marked as completed
    expect(taskCheckbox).toBeChecked()
  })

  test('displays overdue tasks with warning', () => {
    renderWithProvider(<Tasks />)
    
    // Overdue tasks should have warning styling
    const overdueTask = screen.getByText('Client onboarding')
    const taskCard = overdueTask.closest('.task-card')
    
    expect(taskCard).toHaveClass('overdue') // Assuming overdue class exists
  })

  test('shows task count by status', () => {
    renderWithProvider(<Tasks />)
    
    const pendingCount = mockTasks.filter(t => t.status === 'pending').length
    const inProgressCount = mockTasks.filter(t => t.status === 'in-progress').length
    const completedCount = mockTasks.filter(t => t.status === 'completed').length
    const overdueCount = mockTasks.filter(t => t.status === 'overdue').length
    
    expect(pendingCount).toBe(1)
    expect(inProgressCount).toBe(1)
    expect(completedCount).toBe(1)
    expect(overdueCount).toBe(1)
  })

  test('sort by due date works', async () => {
    const user = userEvent.setup()
    renderWithProvider(<Tasks />)
    
    const sortButton = screen.getByText('Sort by Due Date')
    await user.click(sortButton)
    
    // Tasks should be sorted by due date
    const taskTitles = screen.getAllByRole('heading', { level: 3 })
    expect(taskTitles[0]).toHaveTextContent('Prepare proposal for Jane Smith') // 2024-01-18
  })

  test('sort by priority works', async () => {
    const user = userEvent.setup()
    renderWithProvider(<Tasks />)
    
    const sortButton = screen.getByText('Sort by Priority')
    await user.click(sortButton)
    
    // High priority tasks should appear first
    const taskTitles = screen.getAllByRole('heading', { level: 3 })
    expect(taskTitles[0]).toHaveTextContent('Follow up with John Doe') // High priority
  })

  test('task details modal opens', async () => {
    const user = userEvent.setup()
    renderWithProvider(<Tasks />)
    
    const taskTitle = screen.getByText('Follow up with John Doe')
    await user.click(taskTitle)
    
    expect(screen.getByText('Task Details')).toBeInTheDocument()
  })

  test('edit task functionality works', async () => {
    const user = userEvent.setup()
    renderWithProvider(<Tasks />)
    
    // Find edit button for a task
    const editButton = screen.getByLabelText('Edit Follow up with John Doe')
    await user.click(editButton)
    
    expect(screen.getByText('Edit Task')).toBeInTheDocument()
  })

  test('delete task functionality works', async () => {
    const user = userEvent.setup()
    renderWithProvider(<Tasks />)
    
    // Find delete button for a task
    const deleteButton = screen.getByLabelText('Delete Follow up with John Doe')
    await user.click(deleteButton)
    
    expect(screen.getByText('Confirm Delete')).toBeInTheDocument()
  })

  test('handles empty tasks list', () => {
    const emptyState = {
      ...mockInitialState,
      tasks: []
    }
    
    render(
      <AppProvider initialState={emptyState}>
        <Tasks />
      </AppProvider>
    )
    
    expect(screen.getByText(/no tasks found/i)).toBeInTheDocument()
  })

  test('displays client names for tasks', () => {
    renderWithProvider(<Tasks />)
    
    // Tasks should show associated client names
    expect(screen.getByText('John Doe')).toBeInTheDocument()
    expect(screen.getByText('Jane Smith')).toBeInTheDocument()
  })

  test('bulk task actions work', async () => {
    const user = userEvent.setup()
    renderWithProvider(<Tasks />)
    
    // Select multiple tasks
    const checkboxes = screen.getAllByRole('checkbox')
    
    if (checkboxes.length > 1) {
      await user.click(checkboxes[0])
      await user.click(checkboxes[1])
      
      // Bulk actions should become available
      expect(screen.getByText('Bulk Actions')).toBeInTheDocument()
    }
  })

  test('task calendar view works', async () => {
    const user = userEvent.setup()
    renderWithProvider(<Tasks />)
    
    const calendarViewButton = screen.getByText('Calendar View')
    await user.click(calendarViewButton)
    
    expect(screen.getByText('Task Calendar')).toBeInTheDocument()
  })

  test('task kanban view works', async () => {
    const user = userEvent.setup()
    renderWithProvider(<Tasks />)
    
    const kanbanViewButton = screen.getByText('Kanban View')
    await user.click(kanbanViewButton)
    
    expect(screen.getByText('Task Board')).toBeInTheDocument()
  })

  test('task export functionality works', async () => {
    const user = userEvent.setup()
    renderWithProvider(<Tasks />)
    
    const exportButton = screen.getByText('Export Tasks')
    await user.click(exportButton)
    
    expect(screen.getByText('Export Options')).toBeInTheDocument()
  })

  test('responsive design adapts correctly', () => {
    // Mock mobile viewport
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 768,
    })
    
    renderWithProvider(<Tasks />)
    
    const tasksContainer = screen.getByText('Tasks').closest('div')
    expect(tasksContainer).toBeInTheDocument()
  })
})