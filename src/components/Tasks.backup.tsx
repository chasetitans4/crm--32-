"use client"

import React, { useState, useEffect, useMemo, useCallback, memo, startTransition } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useErrorState, handleAsyncOperation, DefaultErrorFallback, createStandardError } from "../utils/standardErrorHandling"
import { EnhancedErrorBoundary } from "./EnhancedErrorBoundary"
// Removed react-icons/fi imports - using lucide-react equivalents instead
import { 
  BarChart2, 
  PieChart, 
  TrendingUp, 
  Clock, 
  CheckCircle2, 
  Calendar, 
  CalendarIcon,
  Plus,
  Filter,
  User,
  Trash2,
  Edit2,
  Search,
  Repeat,
  ChevronLeft,
  ChevronRight,
  Link,
  X,
  Flag,
  Tag,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  Loader2,
  RefreshCw
} from "lucide-react"
import TaskKanbanView from './Tasks/TaskKanbanView';
import TaskListView from './Tasks/TaskListView';
import TaskCalendarView from './Tasks/TaskCalendarView';
import TaskRecentView from './Tasks/TaskRecentView';

import { Task, TaskPriority, TaskStatus, TaskCategory, TaskColumn, ErrorState, LoadingState, ValidationErrors } from '../types/task'

// TypeScript interfaces for component props
interface TaskKanbanViewProps {
  columns: { [key: string]: TaskColumn };
  selectedTasks: string[];
  onTaskSelect: (taskId: string) => void;
  onTaskClick: (task: Task) => void;
  onDragStart: (task: Task) => void;
  onDragOver: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent, status: string) => void;
  getTaskProgress: (task: Task) => number;
  isTaskOverdue: (task: Task) => boolean;
  getDaysUntilDue: (task: Task) => number;
}

interface TaskListViewProps {
  tasks: Task[];
  selectedTasks: string[];
  onTaskSelect: (taskId: string) => void;
  onTaskClick: (task: Task) => void;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
  getTaskProgress: (task: Task) => number;
  isTaskOverdue: (task: Task) => boolean;
  getDaysUntilDue: (task: Task) => number;
}

interface TaskCalendarViewProps {
  tasks: Task[];
  selectedDate: Date;
  onDateChange: (date: Date) => void;
  onTaskClick: (task: Task) => void;
  setSelectedTask: (task: Task | null) => void;
}

interface TaskRecentViewProps {
  tasks: Task[];
  onTaskClick: (task: Task) => void;
  getTaskProgress: (task: Task) => number;
  isTaskOverdue: (task: Task) => boolean;
}

// Mock data for demonstration
const mockTasks: Task[] = [
  {
    id: "1",
    title: "Design new landing page",
    description: "Create a modern, responsive landing page for the new product launch",
    dueDate: "2024-01-15T10:00",
    priority: "HIGH",
    assignee: "Sarah Johnson",
    status: "IN_PROGRESS",
    category: "DESIGN",
    tags: ["ui/ux", "responsive", "landing"],
    estimatedHours: 16,
    actualHours: 8,
    progress: 60,
    createdAt: "2024-01-10T09:00:00Z",
    updatedAt: "2024-01-12T14:30:00Z",
    comments: [
      {
        id: "c1",
        text: "Initial wireframes completed",
        author: "Sarah Johnson",
        date: "2024-01-11T10:00:00Z"
      }
    ]
  },
  {
    id: "2",
    title: "Implement user authentication",
    description: "Add secure login/logout functionality with JWT tokens",
    dueDate: "2024-01-20T17:00",
    priority: "URGENT",
    assignee: "Mike Chen",
    status: "TODO",
    category: "DEVELOPMENT",
    tags: ["backend", "security", "auth"],
    estimatedHours: 24,
    progress: 0,
    createdAt: "2024-01-08T11:00:00Z",
    updatedAt: "2024-01-08T11:00:00Z",
    dependencies: ["1"]
  },
  {
    id: "3",
    title: "Write API documentation",
    description: "Document all REST API endpoints with examples",
    dueDate: "2024-01-18T16:00",
    priority: "MEDIUM",
    assignee: "Alex Rivera",
    status: "REVIEW",
    category: "DEVELOPMENT",
    tags: ["documentation", "api"],
    estimatedHours: 12,
    actualHours: 10,
    progress: 85,
    createdAt: "2024-01-09T13:00:00Z",
    updatedAt: "2024-01-13T16:00:00Z"
  },
  {
    id: "4",
    title: "Set up CI/CD pipeline",
    description: "Configure automated testing and deployment",
    dueDate: "2024-01-25T12:00",
    priority: "LOW",
    assignee: "David Kim",
    status: "DONE",
    category: "DEVELOPMENT",
    tags: ["devops", "automation"],
    estimatedHours: 8,
    actualHours: 6,
    progress: 100,
    createdAt: "2024-01-05T08:00:00Z",
    updatedAt: "2024-01-14T10:00:00Z"
  },
  {
    id: "5",
    title: "Marketing campaign planning",
    description: "Plan Q1 marketing strategy and campaigns",
    dueDate: "2024-01-30T18:00",
    priority: "MEDIUM",
    assignee: "Emma Wilson",
    status: "IN_PROGRESS",
    category: "MARKETING",
    tags: ["strategy", "campaigns", "q1"],
    estimatedHours: 20,
    actualHours: 5,
    progress: 25,
    createdAt: "2024-01-12T14:00:00Z",
    updatedAt: "2024-01-14T09:00:00Z",
    recurring: {
      type: "monthly",
      interval: 1,
      endDate: "2024-12-31T23:59"
    }
  }
]









// Mock hook with enhanced functionality and memoized callbacks
const useTaskActions = (): { tasks: Task[]; addTask: (task: Task) => void; updateTask: (id: string, updatedTask: Partial<Task>) => void; deleteTask: (id: string) => void; addComment: (taskId: string, comment: { text: string; author: string }) => void } => {
  const [tasks, setTasks] = useState<Task[]>(mockTasks)
  
  const addTask = useCallback((task: Task): void => {
    setTasks(prev => [...prev, task])
  }, [])
  
  const updateTask = useCallback((id: string, updatedTask: Partial<Task>): void => {
    setTasks(prev => prev.map(task => 
      task.id === id ? { ...task, ...updatedTask } : task
    ))
  }, [])
  
  const deleteTask = useCallback((id: string): void => {
    setTasks(prev => prev.filter(task => task.id !== id))
  }, [])
  
  const addComment = useCallback((taskId: string, comment: { text: string; author: string }): void => {
    const newComment = {
      id: Date.now().toString(),
      text: comment.text,
      author: comment.author,
      date: new Date().toISOString()
    }
    
    setTasks(prev => prev.map(task => 
      task.id === taskId 
        ? { ...task, comments: [...(task.comments || []), newComment] }
        : task
    ))
  }, [])
  
  return { tasks, addTask, updateTask, deleteTask, addComment };
};

const TaskPriorities: Record<string, TaskPriority> = {
  LOW: {
    label: "Low",
    color: "bg-blue-100 text-blue-800 border border-blue-200",
    bgColor: "bg-blue-50",
    textColor: "text-blue-800",
    borderColor: "border-blue-200",
  },
  MEDIUM: {
    label: "Medium",
    color: "bg-yellow-100 text-yellow-800 border border-yellow-200",
    bgColor: "bg-yellow-50",
    textColor: "text-yellow-800",
    borderColor: "border-yellow-200",
  },
  HIGH: {
    label: "High",
    color: "bg-orange-100 text-orange-800 border border-orange-200",
    bgColor: "bg-orange-50",
    textColor: "text-orange-800",
    borderColor: "border-orange-200",
  },
  URGENT: {
    label: "Urgent",
    color: "bg-red-100 text-red-800 border border-red-200",
    bgColor: "bg-red-50",
    textColor: "text-red-800",
    borderColor: "border-red-200",
  }
}

const TaskStatuses: Record<string, TaskStatus> = {
  TODO: {
    label: "To Do",
    color: "bg-gray-100 text-gray-700 border border-gray-200",
    bgColor: "bg-gray-50",
    textColor: "text-gray-700",
    borderColor: "border-gray-200",
  },
  IN_PROGRESS: {
    label: "In Progress",
    color: "bg-blue-100 text-blue-700 border border-blue-200",
    bgColor: "bg-blue-50",
    textColor: "text-blue-700",
    borderColor: "border-blue-200",
  },
  REVIEW: {
    label: "Review",
    color: "bg-purple-100 text-purple-700 border border-purple-200",
    bgColor: "bg-purple-50",
    textColor: "text-purple-700",
    borderColor: "border-purple-200",
  },
  DONE: {
    label: "Done",
    color: "bg-green-100 text-green-700 border border-green-200",
    bgColor: "bg-green-50",
    textColor: "text-green-700",
    borderColor: "border-green-200",
  }
}

const TaskCategories: Record<string, TaskCategory> = {
  DEVELOPMENT: {
    id: "DEVELOPMENT",
    label: "Development",
    color: "bg-indigo-100 text-indigo-800",
    bgColor: "bg-indigo-50",
    textColor: "text-indigo-800",
  },
  DESIGN: {
    id: "DESIGN",
    label: "Design",
    color: "bg-pink-100 text-pink-800",
    bgColor: "bg-pink-50",
    textColor: "text-pink-800",
  },
  MARKETING: {
    id: "MARKETING",
    label: "Marketing",
    color: "bg-green-100 text-green-800",
    bgColor: "bg-green-50",
    textColor: "text-green-800",
  },
  SALES: {
    id: "SALES",
    label: "Sales",
    color: "bg-yellow-100 text-yellow-800",
    bgColor: "bg-yellow-50",
    textColor: "text-yellow-800",
  },
  SUPPORT: {
    id: "SUPPORT",
    label: "Support",
    color: "bg-blue-100 text-blue-800",
    bgColor: "bg-blue-50",
    textColor: "text-blue-800",
  },
  ADMIN: {
    id: "ADMIN",
    label: "Admin",
    color: "bg-gray-100 text-gray-800",
    bgColor: "bg-gray-50",
    textColor: "text-gray-800",
  }
}

// Priority order constant for sorting optimization
const PRIORITY_ORDER = { URGENT: 4, HIGH: 3, MEDIUM: 2, LOW: 1 } as const

const Tasks = memo(() => {
  const { tasks, addTask, updateTask, deleteTask, addComment } = useTaskActions()
  const [columns, setColumns] = useState<{ [key: string]: TaskColumn }>({})
  const [newTask, setNewTask] = useState({
    title: "",
    description: "",
    dueDate: "",
    priority: "MEDIUM" as 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT',
    assignee: "",
    status: "TODO" as 'TODO' | 'IN_PROGRESS' | 'REVIEW' | 'DONE',
    category: "DEVELOPMENT",
    tags: [] as string[],
    estimatedHours: 0,
    recurring: null as any,
    dependencies: [] as string[],
  })
  
  // Error handling and loading states
  const { hasError, error, setError, clearError } = useErrorState()
  const [loading, setLoading] = useState<LoadingState>({ isLoading: false, operation: '', addTask: false, updateTask: false })
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({})
  const [isInitialized, setIsInitialized] = useState(false)
  const [isAddingTask, setIsAddingTask] = useState(false)
  const [editingTask, setEditingTask] = useState<Task | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [filters, setFilters] = useState({
    priority: [] as string[],
    assignee: [] as string[],
    category: [] as string[],
    dueDate: null as string | null,
    status: [] as string[],
  })
  const [sortBy, setSortBy] = useState<"dueDate" | "priority" | "category" | "created">("dueDate")
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc")
  const [showAnalytics, setShowAnalytics] = useState(true)
  const [viewMode, setViewMode] = useState<"kanban" | "list" | "calendar" | "recent">("kanban")
  const [showFilters, setShowFilters] = useState(false)
  const [selectedTasks, setSelectedTasks] = useState<string[]>([])
  const [newTag, setNewTag] = useState("")
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)
  const [newComment, setNewComment] = useState("")
  const [currentUser] = useState("Current User") // Mock current user
  const [showTimeTracker, setShowTimeTracker] = useState(false)
  const [timeEntry, setTimeEntry] = useState({ taskId: "", hours: 0, description: "" })
  const [calendarDate, setCalendarDate] = useState(new Date())
  const [draggedTask, setDraggedTask] = useState<Task | null>(null)

  // Enhanced error handling function with context and recovery options
  const handleError = useCallback((message: string, type: 'error' | 'warning' | 'info' = 'error', context?: string, recoveryAction?: () => void) => {
    const errorContext = {
      component: 'Tasks',
      operation: context || 'unknown',
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href
    }
    
    const standardError = createStandardError(message, {
      type: type === 'error' ? 'system' : 'business',
      severity: type === 'error' ? 'high' : type === 'warning' ? 'medium' : 'low',
      context: errorContext,
      autoLog: true
    })
    
    setError(standardError)
    
    // Provide recovery action if available
    if (recoveryAction && type === 'error') {
      setTimeout(() => {
        if (window.confirm(`${message}\n\nWould you like to try again?`)) {
          clearError()
          recoveryAction()
        }
      }, 1000)
    }
  }, [setError, clearError])

  // Initialize component with enhanced error handling and memory leak prevention
  useEffect(() => {
    let isMounted = true;
    
    const initializeTasks = async () => {
      if (!isMounted) return;
      
      try {
        setLoading({ isLoading: true, operation: 'Loading tasks...' })
        
        // Simulate API call with potential failure
        await new Promise((resolve, reject) => {
          setTimeout(() => {
            if (!isMounted) return;
            // Simulate occasional initialization failures
            if (Math.random() > 0.98) {
              reject(new Error('Failed to connect to server'))
            } else {
              resolve(undefined)
            }
          }, 1000)
        })
        
        if (isMounted) {
          setIsInitialized(true)
        }
      } catch (error) {
        if (isMounted) {
          const errorMessage = error instanceof Error ? error.message : 'Unknown initialization error'
          handleError(`Failed to load tasks: ${errorMessage}`, 'error', 'initialization', initializeTasks)
        }
      } finally {
        if (isMounted) {
          setLoading({ isLoading: false, operation: '', addTask: false })
        }
      }
    }

    initializeTasks()
    
    return () => {
      isMounted = false;
    };
  }, [handleError])

  // Validation function for task form with proper typing and null checks
  const validateTaskForm = useCallback((task: Partial<Task>): ValidationErrors => {
    const errors: ValidationErrors = {};
    
    // Add null checks
    if (!task?.title?.trim() || task.title.length < 3) {
      errors.title = 'Title must be at least 3 characters long';
    }
    
    if (!task?.description?.trim() || task.description.length < 10) {
      errors.description = 'Description must be at least 10 characters long';
    }
    
    if (!task?.dueDate) {
      errors.dueDate = 'Due date is required';
    } else if (new Date(task.dueDate) < new Date()) {
      errors.dueDate = 'Due date cannot be in the past';
    }
    
    if (!task?.assignee?.trim() || task.assignee.length < 2) {
      errors.assignee = 'Assignee is required';
    }
    
    if (task?.estimatedHours !== undefined && (task.estimatedHours < 0 || task.estimatedHours > 1000)) {
      errors.estimatedHours = 'Estimated hours must be between 0 and 1000';
    }
    
    return errors;
  }, []);

  // Retry operation function
  const retryOperation = () => {
    window.location.reload()
  }


  // Enhanced task statistics calculation with memoization
  const taskStats = useMemo(() => {
    const allTasks = Object.values(columns).reduce((acc, column) => [...acc, ...column.items], [] as Task[])
    const totalTasks = allTasks.length
    const completedTasks = columns["DONE"]?.items.length || 0
    const inProgressTasks = columns["IN_PROGRESS"]?.items.length || 0
    const reviewTasks = columns["REVIEW"]?.items.length || 0

    const today = new Date()
    const todayString = today.toDateString()
    
    const overdueTasks = allTasks.filter((task) => {
      if (!task.dueDate || task.status === "DONE") return false
      return new Date(task.dueDate) < today
    }).length

    const dueTodayTasks = allTasks.filter((task) => {
      if (!task.dueDate) return false
      const dueDate = new Date(task.dueDate)
      return dueDate.toDateString() === todayString
    }).length

    const priorityDistribution = {
      LOW: 0,
      MEDIUM: 0,
      HIGH: 0,
      URGENT: 0,
    }

    const categoryDistribution: Record<string, number> = {}

    allTasks.forEach((task) => {
      if (task.priority) {
        priorityDistribution[task.priority as keyof typeof priorityDistribution]++
      }

      if (task.category) {
        categoryDistribution[task.category] = (categoryDistribution[task.category] || 0) + 1
      }
    })

    const avgCompletionTime =
      completedTasks > 0
        ? allTasks
            .filter((task) => task.status === "DONE" && task.createdAt && task.updatedAt)
            .reduce((acc, task) => {
              const created = new Date(task.createdAt!)
              const completed = new Date(task.updatedAt!)
              return acc + (completed.getTime() - created.getTime())
            }, 0) /
          completedTasks /
          (1000 * 60 * 60 * 24)
        : 0

    return {
      totalTasks,
      completedTasks,
      inProgressTasks,
      reviewTasks,
      overdueTasks,
      dueTodayTasks,
      completionRate: totalTasks ? Math.round((completedTasks / totalTasks) * 100) : 0,
      priorityDistribution,
      categoryDistribution,
      avgCompletionTime: Math.round(avgCompletionTime * 10) / 10,
    }
  }, [columns])

  // Enhanced filtering and searching with memoization
  const filteredTasks = useMemo(() => {
    const filtered = tasks.filter((task) => {
      // Search filter
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase()
        const matchesSearch =
          task.title.toLowerCase().includes(searchLower) ||
          task.description.toLowerCase().includes(searchLower) ||
          task.assignee.toLowerCase().includes(searchLower) ||
          (task.tags && task.tags.some((tag) => tag.toLowerCase().includes(searchLower)))
        if (!matchesSearch) return false
      }

      // Priority filter
      if (filters.priority.length > 0 && !filters.priority.includes(task.priority)) return false

      // Assignee filter
      if (filters.assignee.length > 0 && !filters.assignee.includes(task.assignee)) return false

      // Category filter
      if (filters.category.length > 0 && task.category && !filters.category.includes(task.category)) return false

      // Status filter
      if (filters.status.length > 0 && !filters.status.includes(task.status)) return false

      // Due date filter
      if (filters.dueDate && task.dueDate && new Date(task.dueDate) > new Date(filters.dueDate)) return false

      return true
    })

    // Sorting with priority order
    filtered.sort((a, b) => {
      let aValue: any, bValue: any

      switch (sortBy) {
        case "dueDate":
          aValue = a.dueDate ? new Date(a.dueDate).getTime() : Number.POSITIVE_INFINITY
          bValue = b.dueDate ? new Date(b.dueDate).getTime() : Number.POSITIVE_INFINITY
          break
        case "priority":
          aValue = PRIORITY_ORDER[a.priority as keyof typeof PRIORITY_ORDER] || 0
          bValue = PRIORITY_ORDER[b.priority as keyof typeof PRIORITY_ORDER] || 0
          break
        case "category":
          aValue = a.category || ""
          bValue = b.category || ""
          break
        case "created":
          aValue = a.createdAt ? new Date(a.createdAt).getTime() : 0
          bValue = b.createdAt ? new Date(b.createdAt).getTime() : 0
          break
        default:
          return 0
      }

      if (sortOrder === "asc") {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0
      }
    })

    return filtered
  }, [tasks, searchTerm, filters, sortBy, sortOrder])

  // Memoized columns organization for better performance
  const organizedColumns = useMemo(() => {
    const newColumns: { [key: string]: TaskColumn } = {}
    Object.keys(TaskStatuses).forEach((status) => {
      newColumns[status] = {
        name: TaskStatuses[status].label,
        items: filteredTasks.filter((task) => task.status === status),
      }
    })
    return newColumns
  }, [filteredTasks])

  // Update columns state when organized columns change
  useEffect(() => {
    setColumns(organizedColumns)
  }, [organizedColumns])

  const handleMoveTask = useCallback(async (taskId: string, newStatus: string) => {
    try {
      const task = filteredTasks.find(t => t.id === taskId)
      if (!task) {
        handleError('Task not found', 'error');
        return;
      }

      
      setLoading({ isLoading: true, operation: 'Moving task...' })
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 400))

      const updatedTask = {
        ...task,
        status: newStatus as 'TODO' | 'IN_PROGRESS' | 'REVIEW' | 'DONE',
        updatedAt: new Date().toISOString(),
      }

      updateTask(taskId, updatedTask);
      handleError('Task moved successfully!', 'info');
      
    } catch (error) {
      handleError('Failed to move task', 'error');
    } finally {
      setLoading({ isLoading: false, operation: '', updateTask: false });
    }

  }, [filteredTasks, updateTask, handleError])

  const handleAddTask = useCallback(async (): Promise<void> => {
    try {
      // Validate form
      const errors = validateTaskForm(newTask);
      setValidationErrors(errors);
      
      if (Object.keys(errors).length > 0) {
        handleError('Please fix the validation errors', 'warning', 'task-validation');
        return;
      }

      setLoading({ isLoading: true, operation: 'Creating task...', addTask: true });
      
      // Simulate API call with potential failure
      await new Promise((resolve, reject) => {
        setTimeout(() => {
          // Simulate occasional network failures for testing
          if (Math.random() > 0.9) {
            reject(new Error('Network timeout'));
          } else {
            resolve(undefined);
          }
        }, 800);
      });
      
      const newTaskWithId: Task = {
        ...newTask,
        id: Date.now().toString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        progress: 0,
      };

      addTask(newTaskWithId);
      
      // Batch state updates to prevent multiple re-renders
      startTransition(() => {
        setNewTask({
          title: "",
          description: "",
          dueDate: "",
          priority: "MEDIUM",
          assignee: "",
          status: "TODO",
          category: "DEVELOPMENT",
          tags: [],
          estimatedHours: 0,
          recurring: null,
          dependencies: [],
        });
        setValidationErrors({});
        setIsAddingTask(false);
      });
      handleError('Task created successfully!', 'info', 'task-creation');
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      handleError(`Failed to create task: ${errorMessage}`, 'error', 'task-creation', handleAddTask);
    } finally {
      setLoading({ isLoading: false, operation: '' });
    }
  }, [addTask, handleError, validateTaskForm, newTask]);

  const handleUpdateTask = useCallback(async (): Promise<void> => {
    if (!editingTask) return
    
    const updateTaskOperation = async () => {
      try {
        // Validate form
        const errors = validateTaskForm(editingTask)
        setValidationErrors(errors)
        
        if (Object.keys(errors).length > 0) {
          handleError('Please fix the validation errors', 'warning', 'task-validation')
          return
        }
        
        setLoading({ isLoading: true, operation: 'Updating task...', updateTask: true })
        
        // Simulate API call with potential failure
        await new Promise((resolve, reject) => {
          setTimeout(() => {
            // Simulate occasional network failures for testing
            if (Math.random() > 0.95) {
              reject(new Error('Update failed - server error'))
            } else {
              resolve(undefined)
            }
          }, 600)
        })
        
        const updatedTask = {
          ...editingTask,
          updatedAt: new Date().toISOString(),
        }

        updateTask(editingTask.id, updatedTask)
        
        // Batch state updates to prevent multiple re-renders
        startTransition(() => {
          setEditingTask(null)
          setValidationErrors({})
        })
        handleError('Task updated successfully!', 'info', 'task-update')
        
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
        handleError(`Failed to update task: ${errorMessage}`, 'error', 'task-update', updateTaskOperation)
      } finally {
        setLoading({ isLoading: false, operation: '' })
      }
    }
    
    updateTaskOperation()
  }, [editingTask, updateTask, handleError, validateTaskForm])

  // Memoized event handlers for better performance
  const handleAddComment = useCallback((): void => {
    if (newComment.trim() && selectedTask) {
      addComment(selectedTask.id, {
        text: newComment,
        author: currentUser
      })
      setNewComment("")
    }
  }, [newComment, selectedTask, addComment, currentUser])

  const handleTimeEntry = useCallback(() => {
    if (timeEntry.taskId && timeEntry.hours > 0) {
      const task = tasks.find(t => t.id === timeEntry.taskId)
      if (task) {
        updateTask(timeEntry.taskId, {
          actualHours: (task.actualHours || 0) + timeEntry.hours
        })
      }
      setTimeEntry({ taskId: "", hours: 0, description: "" })
      setShowTimeTracker(false)
    }
  }, [timeEntry, tasks, updateTask])

  const handleDragStart = useCallback((task: Task) => {
    setDraggedTask(task)
  }, [])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
  }, [])

  const handleDrop = useCallback((e: React.DragEvent, newStatus: string) => {
    e.preventDefault()
    if (draggedTask) {
      updateTask(draggedTask.id, { status: newStatus as 'TODO' | 'IN_PROGRESS' | 'REVIEW' | 'DONE' })
      setDraggedTask(null)
    }
  }, [draggedTask, updateTask])

  const getTaskProgress = useCallback((task: Task) => {
    if (task.status === "DONE") return 100
    if (task.status === "REVIEW") return 80
    if (task.status === "IN_PROGRESS") return task.progress || 50
    return 0
  }, []);

  const isTaskOverdue = useCallback((task: Task) => {
    if (!task.dueDate) return false
    return new Date(task.dueDate) < new Date()
  }, [])

  const getDaysUntilDue = useCallback((task: Task) => {
    if (!task.dueDate) return Infinity
    const today = new Date()
    const dueDate = new Date(task.dueDate)
    const diffTime = dueDate.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }, [])

  // Memoized computed values for better performance
  const calendarTasks = useMemo(() => {
    const selectedDate = calendarDate.toISOString().split('T')[0]
    return tasks.filter(task => {
      if (!task.dueDate) return false
      const taskDate = new Date(task.dueDate).toISOString().split('T')[0]
      return taskDate === selectedDate
    })
  }, [tasks, calendarDate])

  // Memoized props for child components to prevent unnecessary re-renders
  const kanbanViewProps = useMemo((): TaskKanbanViewProps => ({
    columns,
    selectedTasks,
    onTaskSelect: (taskId: string) => {
      setSelectedTasks(prev => 
        prev.includes(taskId) 
          ? prev.filter(id => id !== taskId)
          : [...prev, taskId]
      )
    },
    onTaskClick: setSelectedTask,
    onDragStart: handleDragStart,
    onDragOver: handleDragOver,
    onDrop: handleDrop,
    getTaskProgress,
    isTaskOverdue,
    getDaysUntilDue
  }), [columns, selectedTasks, handleDragStart, handleDragOver, handleDrop, getTaskProgress, isTaskOverdue, getDaysUntilDue])

  const listViewProps = useMemo((): TaskListViewProps => ({
    tasks: filteredTasks,
    selectedTasks,
    onTaskSelect: (taskId: string) => {
      setSelectedTasks(prev => 
        prev.includes(taskId) 
          ? prev.filter(id => id !== taskId)
          : [...prev, taskId]
      )
    },
    onTaskClick: setSelectedTask,
    sortBy,
    sortOrder,
    getTaskProgress,
    isTaskOverdue,
    getDaysUntilDue
  }), [filteredTasks, selectedTasks, sortBy, sortOrder, getTaskProgress, isTaskOverdue, getDaysUntilDue])

  const calendarViewProps = useMemo((): TaskCalendarViewProps => ({
    tasks: calendarTasks,
    selectedDate: calendarDate,
    onDateChange: setCalendarDate,
    onTaskClick: setSelectedTask,
    setSelectedTask: setSelectedTask
  }), [calendarTasks, calendarDate])

  const recentViewProps = useMemo((): TaskRecentViewProps => ({
    tasks: tasks.slice(0, 10), // Show recent 10 tasks
    onTaskClick: setSelectedTask,
    getTaskProgress,
    isTaskOverdue
  }), [tasks, getTaskProgress, isTaskOverdue])

  const getDependentTasks = useCallback((taskId: string) => {
    return tasks.filter(task => task.dependencies?.includes(taskId))
  }, [tasks])

  const canCompleteTask = useCallback((task: Task): boolean => {
    if (!task.dependencies) return true
    return task.dependencies.every(depId => {
      const depTask = tasks.find(t => t.id === depId)
      return depTask?.status === 'DONE'
    })
  }, [tasks])

  const handleBulkAction = useCallback((action: "delete" | "complete" | "priority"): void => {
    selectedTasks.forEach((taskId) => {
      if (action === "delete") {
        deleteTask(taskId)
      } else if (action === "complete") {
        const task = tasks.find((t) => t.id === taskId)
        if (task) {
          updateTask(taskId, { ...task, status: "DONE", updatedAt: new Date().toISOString() })
        }
      }
    })
    setSelectedTasks([])
  }, [selectedTasks, deleteTask, tasks, updateTask])

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: {
      y: 20,
      opacity: 0,
    },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.3,
      },
    },
  };

  // Show loading screen during initialization
  if (!isInitialized || loading.isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-lg font-medium text-gray-700">{loading.operation || 'Loading tasks...'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Section - Matching Calendar Page Style */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
          <div className="flex items-center space-x-4">
            <div className="p-2 bg-blue-100 rounded-lg">
              <CheckCircle2 className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Task Management</h1>
              <p className="text-gray-500 mt-1">Organize and track your project tasks</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* View Mode Toggle */}
            <div className="flex bg-gray-100 rounded-lg p-1">
              {(["kanban", "list", "calendar", "recent"] as const).map((mode) => (
                <button
                  key={mode}
                  onClick={() => setViewMode(mode)}
                  className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors capitalize ${
                    viewMode === mode ? "bg-white text-gray-900 shadow-sm" : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  {mode === "recent" ? "Recent Tasks" : mode}
                </button>
              ))}
            </div>

            {/* Action Buttons */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center px-4 py-2 rounded-lg border transition-colors ${
                showFilters
                  ? "bg-blue-50 border-blue-200 text-blue-700"
                  : "bg-white border-gray-200 text-gray-700 hover:bg-gray-50"
              }`}
            >
              <Filter className="mr-2" size={16} />
              Filters
            </button>

            <button
              onClick={() => setIsAddingTask(true)}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
            >
              <Plus className="mr-2" size={16} />
              Add Task
            </button>
            
            <button
              onClick={() => setShowTimeTracker(true)}
              className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors shadow-sm"
            >
              <Clock className="mr-2" size={16} />
              Track Time
            </button>
          </div>
        </div>

        {/* Search and Quick Stats */}
        <div className="mt-4 flex flex-col lg:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
            <input
              type="text"
              placeholder="Search tasks, assignees, or tags..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
            />
          </div>

          <div className="flex items-center space-x-6 text-sm">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-gray-600">{taskStats.completedTasks} Completed</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span className="text-gray-600">{taskStats.inProgressTasks} In Progress</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-red-500 rounded-full"></div>
              <span className="text-gray-600">{taskStats.overdueTasks} Overdue</span>
            </div>
          </div>
        </div>
      </div>

      <div className="p-6">
        {/* Enhanced Analytics Dashboard */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-gray-800">Task Analytics</h2>
            <button
              onClick={() => setShowAnalytics(!showAnalytics)}
              className="text-base font-medium text-blue-600 hover:text-blue-700 flex items-center bg-blue-50 hover:bg-blue-100 px-3 py-2 rounded-lg transition-colors border border-blue-200"
            >
              {showAnalytics ? <ChevronUp className="mr-1" /> : <ChevronDown className="mr-1" />}
              {showAnalytics ? "Hide Analytics" : "Show Analytics"}
            </button>
          </div>

          <AnimatePresence>
            {showAnalytics && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-6"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                  {/* Completion Rate Card */}
                  <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <p className="text-sm font-medium text-gray-500">Completion Rate</p>
                        <p className="text-3xl font-bold text-gray-900 mt-1">{taskStats.completionRate}%</p>
                      </div>
                      <div className="p-3 rounded-full bg-green-50">
                        <PieChart className="w-6 h-6 text-green-600" />
                      </div>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-2">
                      <div
                        className="bg-green-500 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${taskStats.completionRate}%` }}
                      ></div>
                    </div>
                    <p className="text-xs text-gray-500 mt-2">
                      {taskStats.completedTasks} of {taskStats.totalTasks} tasks completed
                    </p>
                  </div>

                  {/* Task Overview Card */}
                  <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <p className="text-sm font-medium text-gray-500">Total Tasks</p>
                        <p className="text-3xl font-bold text-gray-900 mt-1">{taskStats.totalTasks}</p>
                      </div>
                      <div className="p-3 rounded-full bg-blue-50">
                        <BarChart2 className="w-6 h-6 text-blue-600" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Due Today</span>
                        <span className="font-medium text-orange-600">{taskStats.dueTodayTasks}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Overdue</span>
                        <span className="font-medium text-red-600">{taskStats.overdueTasks}</span>
                      </div>
                    </div>
                  </div>

                  {/* Priority Distribution Card */}
                  <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <p className="text-sm font-medium text-gray-500">Priority Distribution</p>
                      </div>
                      <div className="p-3 rounded-full bg-purple-50">
                        <TrendingUp className="w-6 h-6 text-purple-600" />
                      </div>
                    </div>
                    <div className="space-y-3">
                      {Object.entries(taskStats.priorityDistribution).map(([priority, count]) => (
                        <div key={priority} className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <div
                              className={`w-3 h-3 rounded-full ${
                                priority === "URGENT"
                                  ? "bg-red-500"
                                  : priority === "HIGH"
                                    ? "bg-orange-500"
                                    : priority === "MEDIUM"
                                      ? "bg-yellow-500"
                                      : "bg-blue-500"
                              }`}
                            ></div>
                            <span className="text-sm text-gray-600 capitalize">{priority.toLowerCase()}</span>
                          </div>
                          <span className="text-sm font-medium">{count}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Performance Metrics Card */}
                  <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <p className="text-sm font-medium text-gray-500">Avg. Completion</p>
                        <p className="text-3xl font-bold text-gray-900 mt-1">{taskStats.avgCompletionTime}d</p>
                      </div>
                      <div className="p-3 rounded-full bg-amber-50">
                        <Clock className="w-6 h-6 text-amber-600" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">In Review</span>
                        <span className="font-medium text-purple-600">{taskStats.reviewTasks}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Active</span>
                        <span className="font-medium text-blue-600">{taskStats.inProgressTasks}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Advanced Filters Panel */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Priority Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Priority</label>
                  <div className="space-y-2">
                    {Object.entries(TaskPriorities).map(([key, priority]) => (
                      <label key={key} className="flex items-center">
                        <input
                          type="checkbox"
                          checked={filters.priority.includes(key)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setFilters((prev) => ({ ...prev, priority: [...prev.priority, key] }));
                            } else {
                              setFilters((prev) => ({ ...prev, priority: prev.priority.filter((p) => p !== key) }));
                            }
                          }}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="ml-2 text-sm text-gray-600">{priority.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Category Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                  <div className="space-y-2">
                    {Object.entries(TaskCategories).map(([key, category]) => (
                      <label key={key} className="flex items-center">
                        <input
                          type="checkbox"
                          checked={filters.category.includes(key)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setFilters((prev) => ({ ...prev, category: [...prev.category, key] }));
                            } else {
                              setFilters((prev) => ({ ...prev, category: prev.category.filter((c) => c !== key) }));
                            }
                          }}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="ml-2 text-sm text-gray-600">{category.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Status Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                  <div className="space-y-2">
                    {Object.entries(TaskStatuses).map(([key, status]) => (
                      <label key={key} className="flex items-center">
                        <input
                          type="checkbox"
                          checked={filters.status.includes(key)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setFilters((prev) => ({ ...prev, status: [...prev.status, key] }));
                            } else {
                              setFilters((prev) => ({ ...prev, status: prev.status.filter((s) => s !== key) }));
                            }
                          }}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="ml-2 text-sm text-gray-600">{status.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Sort Options */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Sort By</label>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as any)}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="dueDate">Due Date</option>
                    <option value="priority">Priority</option>
                    <option value="category">Category</option>
                    <option value="created">Created Date</option>
                  </select>
                  <div className="mt-2 flex items-center space-x-2">
                    <button
                      onClick={() => setSortOrder("asc")}
                      className={`px-3 py-1 text-xs rounded ${
                        sortOrder === "asc" ? "bg-blue-100 text-blue-700" : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      Ascending
                    </button>
                    <button
                      onClick={() => setSortOrder("desc")}
                      className={`px-3 py-1 text-xs rounded ${
                        sortOrder === "desc" ? "bg-blue-100 text-blue-700" : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      Descending
                    </button>
                  </div>
                </div>
              </div>

              <div className="mt-4 flex justify-between items-center">
                <button
                  onClick={() => {
                    setFilters({ priority: [], assignee: [], category: [], dueDate: null, status: [] })
                    setSearchTerm("")
                    setSortBy("dueDate")
                    setSortOrder("asc")
                  }}
                  className="text-sm text-gray-500 hover:text-gray-700"
                >
                  Clear All Filters
                </button>
                <div className="text-sm text-gray-500">
                  Showing {filteredTasks.length} of {tasks.length} tasks
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Bulk Actions */}
        {selectedTasks.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6"
          >
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-blue-800">
                {selectedTasks.length} task{selectedTasks.length > 1 ? "s" : ""} selected
              </span>
              <div className="flex space-x-2">
                <button
                  onClick={() => handleBulkAction("complete")}
                  className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700"
                  aria-label={`Mark ${selectedTasks.length} selected task${selectedTasks.length > 1 ? 's' : ''} as complete`}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      handleBulkAction("complete");
                    }
                  }}
                >
                  Mark Complete
                </button>
                <button
                  onClick={() => handleBulkAction("delete")}
                  className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700"
                  aria-label={`Delete ${selectedTasks.length} selected task${selectedTasks.length > 1 ? 's' : ''}`}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      handleBulkAction("delete");
                    }
                  }}
                >
                  Delete
                </button>
                <button
                  onClick={() => setSelectedTasks([])}
                  className="px-3 py-1 bg-gray-600 text-white text-sm rounded hover:bg-gray-700"
                  aria-label="Cancel bulk selection"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      setSelectedTasks([]);
                    }
                  }}
                >
                  Cancel
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {/* Enhanced Task Creation Form */}
        <AnimatePresence>
          {isAddingTask && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6"
            >
              <h2 className="text-lg font-semibold mb-6 flex items-center">
                <Plus className="mr-2" />
                Create New Task
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Basic Information */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2 text-gray-700">Task Title *</label>
                    <input
                      type="text"
                      value={newTask.title}
                      onChange={(e) => {
                        setNewTask({ ...newTask, title: e.target.value })
                        if (validationErrors.title) {
                          setValidationErrors({ ...validationErrors, title: '' })
                        }
                      }}
                      className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all ${
                        validationErrors.title ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="Enter task title"
                    />
                    {validationErrors.title && (
                      <div className="flex items-center mt-1 text-red-600 text-sm">
                        <AlertCircle size={16} className="mr-1" />
                        {validationErrors.title}
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2 text-gray-700">Description</label>
                    <textarea
                      value={newTask.description}
                      onChange={(e) => {
                        setNewTask({ ...newTask, description: e.target.value })
                        if (validationErrors.description) {
                          setValidationErrors({ ...validationErrors, description: '' })
                        }
                      }}
                      className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all ${
                        validationErrors.description ? 'border-red-500' : 'border-gray-300'
                      }`}
                      rows={3}
                      placeholder="Describe the task"
                    />
                    {validationErrors.description && (
                      <div className="flex items-center mt-1 text-red-600 text-sm">
                        <AlertCircle size={16} className="mr-1" />
                        {validationErrors.description}
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2 text-gray-700">Assignee</label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                      <input
                        type="text"
                        value={newTask.assignee}
                        onChange={(e) => {
                          setNewTask({ ...newTask, assignee: e.target.value })
                          if (validationErrors.assignee) {
                            setValidationErrors({ ...validationErrors, assignee: '' })
                          }
                        }}
                        className={`w-full p-3 pl-10 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all ${
                          validationErrors.assignee ? 'border-red-500' : 'border-gray-300'
                        }`}
                        placeholder="Assign to team member"
                      />
                    </div>
                    {validationErrors.assignee && (
                      <div className="flex items-center mt-1 text-red-600 text-sm">
                        <AlertCircle size={16} className="mr-1" />
                        {validationErrors.assignee}
                      </div>
                    )}
                  </div>
                </div>

                {/* Task Properties */}
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2 text-gray-700">Priority</label>
                      <select
                        value={newTask.priority}
                        onChange={(e) => setNewTask({ ...newTask, priority: e.target.value as 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT' })}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                      >
                        {Object.entries(TaskPriorities).map(([key, { label }]) => (
                          <option key={key} value={key}>
                            {label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2 text-gray-700">Category</label>
                      <select
                        value={newTask.category}
                        onChange={(e) => setNewTask({ ...newTask, category: e.target.value })}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                      >
                        {Object.entries(TaskCategories).map(([key, { label }]) => (
                          <option key={key} value={key}>
                            {label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2 text-gray-700">Due Date</label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                      <input
                        type="datetime-local"
                        value={newTask.dueDate}
                        onChange={(e) => {
                          setNewTask({ ...newTask, dueDate: e.target.value })
                          if (validationErrors.dueDate) {
                            setValidationErrors({ ...validationErrors, dueDate: '' })
                          }
                        }}
                        className={`w-full p-3 pl-10 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all ${
                          validationErrors.dueDate ? 'border-red-500' : 'border-gray-300'
                        }`}
                      />
                    </div>
                    {validationErrors.dueDate && (
                      <div className="flex items-center mt-1 text-red-600 text-sm">
                        <AlertCircle size={16} className="mr-1" />
                        {validationErrors.dueDate}
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2 text-gray-700">Estimated Hours</label>
                    <input
                      type="number"
                      value={newTask.estimatedHours}
                      onChange={(e) => {
                        setNewTask({ ...newTask, estimatedHours: parseInt(e.target.value) || 0 })
                        if (validationErrors.estimatedHours) {
                          setValidationErrors({ ...validationErrors, estimatedHours: '' })
                        }
                      }}
                      className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all ${
                        validationErrors.estimatedHours ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="0"
                      min="0"
                    />
                    {validationErrors.estimatedHours && (
                      <div className="flex items-center mt-1 text-red-600 text-sm">
                        <AlertCircle size={16} className="mr-1" />
                        {validationErrors.estimatedHours}
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2 text-gray-700">Tags</label>
                    <div className="flex flex-wrap gap-2 mb-2">
                      {newTask.tags.map((tag, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                        >
                          {tag}
                          <button
                            onClick={() =>
                              setNewTask({
                                ...newTask,
                                tags: newTask.tags.filter((_, i) => i !== index),
                              })
                            }
                            className="ml-1 text-blue-600 hover:text-blue-800"
                          >
                            <X size={12} />
                          </button>
                        </span>
                      ))}
                    </div>
                    <div className="flex">
                      <input
                        type="text"
                        value={newTag}
                        onChange={(e) => setNewTag(e.target.value)}
                        onKeyPress={(e) => {
                          if (e.key === "Enter" && newTag.trim()) {
                            e.preventDefault()
                            setNewTask({ ...newTask, tags: [...newTask.tags, newTag.trim()] })
                            setNewTag("")
                          }
                        }}
                        className="flex-1 p-2 border border-gray-300 rounded-l-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Add tag"
                      />
                      <button
                        onClick={() => {
                          if (newTag.trim()) {
                            setNewTask({ ...newTask, tags: [...newTask.tags, newTag.trim()] })
                            setNewTag("")
                          }
                        }}
                        className="px-3 py-2 bg-blue-600 text-white rounded-r-lg hover:bg-blue-700"
                      >
                        <Tag size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end mt-6 space-x-3">
                <button
                  onClick={() => setIsAddingTask(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddTask}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                  disabled={!newTask.title.trim() || loading.addTask}
                >
                  {loading.addTask ? (
                    <>
                      <Loader2 size={16} className="mr-2 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    'Create Task'
                  )}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Enhanced Task Edit Form */}
        <AnimatePresence>
          {editingTask && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6"
            >
              <h2 className="text-lg font-semibold mb-6 flex items-center">
                <Edit2 className="mr-2" />
                Edit Task
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2 text-gray-700">Task Title</label>
                    <input
                      type="text"
                      value={editingTask.title}
                      onChange={(e) => {
                        setEditingTask({ ...editingTask, title: e.target.value })
                        if (validationErrors.title) {
                          setValidationErrors({ ...validationErrors, title: '' })
                        }
                      }}
                      className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all ${
                        validationErrors.title ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                    {validationErrors.title && (
                      <div className="flex items-center mt-1 text-red-600 text-sm">
                        <AlertCircle size={16} className="mr-1" />
                        {validationErrors.title}
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2 text-gray-700">Description</label>
                    <textarea
                      value={editingTask.description}
                      onChange={(e) => {
                        setEditingTask({ ...editingTask, description: e.target.value })
                        if (validationErrors.description) {
                          setValidationErrors({ ...validationErrors, description: '' })
                        }
                      }}
                      className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all ${
                        validationErrors.description ? 'border-red-500' : 'border-gray-300'
                      }`}
                      rows={3}
                    />
                    {validationErrors.description && (
                      <div className="flex items-center mt-1 text-red-600 text-sm">
                        <AlertCircle size={16} className="mr-1" />
                        {validationErrors.description}
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2 text-gray-700">Progress</label>
                    <div className="space-y-2">
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={editingTask.progress || 0}
                        onChange={(e) => setEditingTask({ ...editingTask, progress: parseInt(e.target.value) })}
                        className="w-full"
                      />
                      <div className="flex justify-between text-sm text-gray-500">
                        <span>0%</span>
                        <span className="font-medium">{editingTask.progress || 0}%</span>
                        <span>100%</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2 text-gray-700">Priority</label>
                      <select
                        value={editingTask.priority}
                        onChange={(e) => setEditingTask({ ...editingTask, priority: e.target.value as 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT' })}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                      >
                        {Object.entries(TaskPriorities).map(([key, { label }]) => (
                          <option key={key} value={key}>
                            {label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2 text-gray-700">Status</label>
                      <select
                        value={editingTask.status}
                        onChange={(e) => setEditingTask({ ...editingTask, status: e.target.value as 'TODO' | 'IN_PROGRESS' | 'REVIEW' | 'DONE' })}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                      >
                        {Object.entries(TaskStatuses).map(([key, { label }]) => (
                          <option key={key} value={key}>
                            {label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2 text-gray-700">Due Date</label>
                    <input
                      type="datetime-local"
                      value={editingTask.dueDate}
                      onChange={(e) => {
                        setEditingTask({ ...editingTask, dueDate: e.target.value })
                        if (validationErrors.dueDate) {
                          setValidationErrors({ ...validationErrors, dueDate: '' })
                        }
                      }}
                      className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all ${
                        validationErrors.dueDate ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                    {validationErrors.dueDate && (
                      <div className="flex items-center mt-1 text-red-600 text-sm">
                        <AlertCircle size={16} className="mr-1" />
                        {validationErrors.dueDate}
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2 text-gray-700">Assignee</label>
                    <input
                      type="text"
                      value={editingTask.assignee}
                      onChange={(e) => {
                        setEditingTask({ ...editingTask, assignee: e.target.value })
                        if (validationErrors.assignee) {
                          setValidationErrors({ ...validationErrors, assignee: '' })
                        }
                      }}
                      className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all ${
                        validationErrors.assignee ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                    {validationErrors.assignee && (
                      <div className="flex items-center mt-1 text-red-600 text-sm">
                        <AlertCircle size={16} className="mr-1" />
                        {validationErrors.assignee}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex justify-end mt-6 space-x-3">
                <button
                  onClick={() => setEditingTask(null)}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleUpdateTask}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                  disabled={loading.updateTask}
                >
                  {loading.updateTask ? (
                    <>
                      <Loader2 size={16} className="mr-2 animate-spin" />
                      Updating...
                    </>
                  ) : (
                    'Update Task'
                  )}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Enhanced Kanban Board */}
        {viewMode === "kanban" && (
          <TaskKanbanView
            columns={columns}
            selectedTasks={selectedTasks}
            setSelectedTasks={setSelectedTasks}
            setSelectedTask={setSelectedTask}
            setEditingTask={setEditingTask}
            deleteTask={deleteTask}
            handleDragStart={handleDragStart}
            handleDragOver={handleDragOver}
            handleDrop={handleDrop}
            handleMoveTask={handleMoveTask}
            canCompleteTask={canCompleteTask}
            isTaskOverdue={isTaskOverdue}
            getDaysUntilDue={getDaysUntilDue}
            getTaskProgress={getTaskProgress}
          />
        )}

        {/* List View */}
        {viewMode === "list" && (
          <TaskListView
            filteredTasks={filteredTasks}
            selectedTasks={selectedTasks}
            setSelectedTasks={setSelectedTasks}
            setEditingTask={setEditingTask}
            deleteTask={deleteTask}
            isTaskOverdue={isTaskOverdue}
            getTaskProgress={getTaskProgress}
          />
        )}

        {/* Enhanced Calendar View */}
        {viewMode === "calendar" && (
          <TaskCalendarView
            tasks={tasks}
            calendarDate={calendarDate}
            setCalendarDate={setCalendarDate}
            isTaskOverdue={isTaskOverdue}
          />
        )}

        {/* Recent Tasks View */}
        {viewMode === "recent" && (
          <TaskRecentView
            recentTasks={tasks
              .sort((a, b) => new Date(b.updatedAt || b.createdAt || '').getTime() - new Date(a.updatedAt || a.createdAt || '').getTime())
              .slice(0, 10)}
            setViewMode={setViewMode}
            isTaskOverdue={isTaskOverdue}
            getTaskProgress={getTaskProgress}
          />
        )}

        {/* Empty State */}
        {filteredTasks.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center"
          >
            <CheckCircle2 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {searchTerm || Object.values(filters).some((f) => (Array.isArray(f) ? f.length > 0 : f))
                ? "No tasks match your filters"
                : "No tasks yet"}
            </h3>
            <p className="text-gray-500 mb-6">
              {searchTerm || Object.values(filters).some((f) => (Array.isArray(f) ? f.length > 0 : f))
                ? "Try adjusting your search or filter criteria"
                : "Create your first task to get started with project management"}
            </p>
            {!searchTerm && !Object.values(filters).some((f) => (Array.isArray(f) ? f.length > 0 : f)) && (
              <button
                onClick={() => setIsAddingTask(true)}
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus className="mr-2" size={16} />
                Create First Task
              </button>
            )}
          </motion.div>
        )}
        
        {/* Task Detail Modal */}
        <AnimatePresence>
          {selectedTask && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
              onClick={() => setSelectedTask(null)}
            >
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="p-6 border-b border-gray-100">
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold text-gray-900">{selectedTask.title}</h2>
                    <button
                      onClick={() => setSelectedTask(null)}
                      className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
                    >
                      <X size={20} />
                    </button>
                  </div>
                </div>
                
                <div className="p-6 space-y-6">
                  {/* Task Info */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-500">Status</label>
                      <p className="text-gray-900">{TaskStatuses[selectedTask.status]?.label}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Priority</label>
                      <p className="text-gray-900">{TaskPriorities[selectedTask.priority]?.label}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Assignee</label>
                      <p className="text-gray-900">{selectedTask.assignee || 'Unassigned'}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Due Date</label>
                      <p className="text-gray-900">
                        {selectedTask.dueDate ? new Date(selectedTask.dueDate).toLocaleDateString() : 'No due date'}
                      </p>
                    </div>
                  </div>
                  
                  {/* Description */}
                  {selectedTask.description && (
                    <div>
                      <label className="text-sm font-medium text-gray-500">Description</label>
                      <p className="text-gray-900 mt-1">{selectedTask.description}</p>
                    </div>
                  )}
                  
                  {/* Time Tracking */}
                  {(selectedTask.estimatedHours || selectedTask.actualHours) && (
                    <div>
                      <label className="text-sm font-medium text-gray-500">Time Tracking</label>
                      <div className="flex items-center space-x-4 mt-1">
                        {selectedTask.estimatedHours && (
                          <span className="text-sm text-gray-600">
                            Estimated: {selectedTask.estimatedHours}h
                          </span>
                        )}
                        {selectedTask.actualHours && (
                          <span className="text-sm text-gray-600">
                            Actual: {selectedTask.actualHours}h
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                  
                  {/* Dependencies */}
                  {selectedTask.dependencies && selectedTask.dependencies.length > 0 && (
                    <div>
                      <label className="text-sm font-medium text-gray-500">Dependencies</label>
                      <div className="mt-1 space-y-1">
                        {selectedTask.dependencies.map(depId => {
                          const depTask = tasks.find(t => t.id === depId)
                          return depTask ? (
                            <div key={depId} className="text-sm text-gray-600 flex items-center">
                              <span className={`w-2 h-2 rounded-full mr-2 ${
                                depTask.status === 'DONE' ? 'bg-green-500' : 'bg-gray-400'
                              }`}></span>
                              {depTask.title}
                            </div>
                          ) : null
                        })}
                      </div>
                    </div>
                  )}
                  
                  {/* Tags */}
                  {selectedTask.tags && selectedTask.tags.length > 0 && (
                    <div>
                      <label className="text-sm font-medium text-gray-500">Tags</label>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {selectedTask.tags.map((tag, index) => (
                          <span key={index} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {/* Comments */}
                  <div>
                    <label className="text-sm font-medium text-gray-500">Comments</label>
                    <div className="mt-2 space-y-3">
                      {selectedTask.comments && selectedTask.comments.length > 0 ? (
                        selectedTask.comments.map(comment => (
                          <div key={comment.id} className="bg-gray-50 p-3 rounded-lg">
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-sm font-medium text-gray-900">{comment.author}</span>
                              <span className="text-xs text-gray-500">
                                {new Date(comment.date).toLocaleDateString()}
                              </span>
                            </div>
                            <p className="text-sm text-gray-700">{comment.text}</p>
                          </div>
                        ))
                      ) : (
                        <p className="text-sm text-gray-500">No comments yet</p>
                      )}
                      
                      {/* Add Comment */}
                      <div className="flex space-x-2">
                        <input
                          type="text"
                          value={newComment}
                          onChange={(e) => setNewComment(e.target.value)}
                          placeholder="Add a comment..."
                          className="flex-1 p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          onKeyPress={(e) => e.key === 'Enter' && handleAddComment()}
                        />
                        <button
                          onClick={handleAddComment}
                          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                          Add
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="p-6 border-t border-gray-100 flex justify-end space-x-3">
                  <button
                    onClick={() => setSelectedTask(null)}
                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Close
                  </button>
                  <button
                    onClick={() => {
                      setEditingTask(selectedTask)
                      setSelectedTask(null)
                    }}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Edit Task
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
        
        {/* Time Tracking Modal */}
        <AnimatePresence>
          {showTimeTracker && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
              onClick={() => setShowTimeTracker(false)}
            >
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className="bg-white rounded-xl shadow-xl max-w-md w-full"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="p-6 border-b border-gray-100">
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold text-gray-900">Track Time</h2>
                    <button
                      onClick={() => setShowTimeTracker(false)}
                      className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
                    >
                      <X size={20} />
                    </button>
                  </div>
                </div>
                
                <div className="p-6 space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Task</label>
                    <select
                      value={timeEntry.taskId}
                      onChange={(e) => setTimeEntry({ ...timeEntry, taskId: e.target.value })}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">Select a task...</option>
                      {tasks.map(task => (
                        <option key={task.id} value={task.id}>{task.title}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Hours</label>
                    <input
                      type="number"
                      min="0"
                      step="0.5"
                      value={timeEntry.hours}
                      onChange={(e) => setTimeEntry({ ...timeEntry, hours: parseFloat(e.target.value) || 0 })}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="0.0"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Description (Optional)</label>
                    <textarea
                      value={timeEntry.description}
                      onChange={(e) => setTimeEntry({ ...timeEntry, description: e.target.value })}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      rows={3}
                      placeholder="What did you work on?"
                    />
                  </div>
                </div>
                
                <div className="p-6 border-t border-gray-100 flex justify-end space-x-3">
                  <button
                    onClick={() => setShowTimeTracker(false)}
                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleTimeEntry}
                    disabled={!timeEntry.taskId || timeEntry.hours <= 0}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Log Time
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
        
        {hasError && error && (
          <DefaultErrorFallback
            error={error}
            retry={clearError}
          />
        )}
    </div>
  )
})

export default Tasks;
