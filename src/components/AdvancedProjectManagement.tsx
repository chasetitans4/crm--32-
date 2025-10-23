"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react"
import {
  Calendar,
  Clock,
  Users,
  CheckCircle,
  Plus,
  Filter,
  Settings,
  TrendingUp,
  User,
  DollarSign,
  Timer,
  Flag,
  X,
} from "lucide-react"
import { useToast } from "../hooks/useAppState"

interface Task {
  id: string
  name: string
  description: string
  status: "not_started" | "in_progress" | "completed" | "on_hold" | "cancelled"
  priority: "low" | "medium" | "high" | "critical"
  startDate: string
  endDate: string
  estimatedHours: number
  actualHours: number
  assignedTo: string[]
  dependencies: string[]
  progress: number
  tags: string[]
  attachments: string[]
  comments: Comment[]
  subtasks: SubTask[]
}

interface SubTask {
  id: string
  name: string
  completed: boolean
  assignedTo: string
}

interface Comment {
  id: string
  author: string
  content: string
  timestamp: string
}

interface Milestone {
  id: string
  name: string
  description: string
  dueDate: string
  status: "upcoming" | "completed" | "overdue"
  tasks: string[]
  deliverables: string[]
}

interface Resource {
  id: string
  name: string
  role: string
  email: string
  hourlyRate: number
  availability: number // percentage
  skills: string[]
  currentTasks: string[]
}

interface Project {
  id: string
  name: string
  description: string
  clientId: string
  clientName: string
  status: "planning" | "active" | "on_hold" | "completed" | "cancelled"
  startDate: string
  endDate: string
  budget: number
  spentBudget: number
  progress: number
  tasks: Task[]
  milestones: Milestone[]
  resources: Resource[]
  tags: string[]
}

interface GanttChartProps {
  tasks: Task[]
  onTaskUpdate: (taskId: string, updates: Partial<Task>) => void
}

interface AdvancedProjectManagementProps {
  projectId?: string
  onProjectUpdate?: (project: Project) => void
}

const AdvancedProjectManagement: React.FC<AdvancedProjectManagementProps> = ({
  projectId = "proj_001",
  onProjectUpdate,
}) => {
  const { showSuccess } = useToast()
  const [project, setProject] = useState<Project | null>(null)
  const [activeTab, setActiveTab] = useState("overview")
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)
  const [viewMode, setViewMode] = useState<"list" | "kanban" | "gantt" | "calendar">("list")
  const [filterStatus, setFilterStatus] = useState("all")
  const [filterAssignee, setFilterAssignee] = useState("all")
  const [showTaskModal, setShowTaskModal] = useState(false)
  const [showAddMilestoneModal, setShowAddMilestoneModal] = useState(false)
  const [showAddResourceModal, setShowAddResourceModal] = useState(false)
  const [showNewTaskForm, setShowNewTaskForm] = useState(false)
  const [newTaskData, setNewTaskData] = useState<Partial<Task>>({})
  const [loading, setLoading] = useState(false)

  // Initialize mock project data
  useEffect(() => {
    const mockProject: Project = {
      id: "proj_001",
      name: "TechCorp Website Redesign",
      description: "Complete redesign and development of TechCorp corporate website with modern UI/UX",
      clientId: "client_001",
      clientName: "TechCorp Solutions",
      status: "active",
      startDate: "2024-01-15",
      endDate: "2024-04-15",
      budget: 45000,
      spentBudget: 18500,
      progress: 42,
      tags: ["web-design", "development", "ui-ux"],
      resources: [
        {
          id: "res_001",
          name: "John Smith",
          role: "Project Manager",
          email: "john@company.com",
          hourlyRate: 85,
          availability: 100,
          skills: ["project-management", "agile", "scrum"],
          currentTasks: ["task_001", "task_002"],
        },
        {
          id: "res_002",
          name: "Sarah Johnson",
          role: "UI/UX Designer",
          email: "sarah@company.com",
          hourlyRate: 75,
          availability: 80,
          skills: ["ui-design", "ux-design", "figma", "adobe-creative"],
          currentTasks: ["task_003", "task_004"],
        },
        {
          id: "res_003",
          name: "Mike Chen",
          role: "Frontend Developer",
          email: "mike@company.com",
          hourlyRate: 80,
          availability: 90,
          skills: ["react", "typescript", "css", "javascript"],
          currentTasks: ["task_005", "task_006"],
        },
        {
          id: "res_004",
          name: "Lisa Wang",
          role: "Backend Developer",
          email: "lisa@company.com",
          hourlyRate: 85,
          availability: 75,
          skills: ["node.js", "python", "database", "api-development"],
          currentTasks: ["task_007"],
        },
      ],
      milestones: [
        {
          id: "milestone_001",
          name: "Design Phase Complete",
          description: "All UI/UX designs approved and finalized",
          dueDate: "2024-02-15",
          status: "completed",
          tasks: ["task_003", "task_004"],
          deliverables: ["Wireframes", "High-fidelity mockups", "Design system"],
        },
        {
          id: "milestone_002",
          name: "Frontend Development Complete",
          description: "All frontend components implemented and tested",
          dueDate: "2024-03-15",
          status: "upcoming",
          tasks: ["task_005", "task_006"],
          deliverables: ["Responsive website", "Component library"],
        },
        {
          id: "milestone_003",
          name: "Backend Integration Complete",
          description: "All APIs integrated and database setup complete",
          dueDate: "2024-04-01",
          status: "upcoming",
          tasks: ["task_007", "task_008"],
          deliverables: ["API endpoints", "Database schema", "Admin panel"],
        },
      ],
      tasks: [
        {
          id: "task_001",
          name: "Project Planning & Requirements",
          description: "Define project scope, requirements, and create project plan",
          status: "completed",
          priority: "high",
          startDate: "2024-01-15",
          endDate: "2024-01-22",
          estimatedHours: 20,
          actualHours: 18,
          assignedTo: ["res_001"],
          dependencies: [],
          progress: 100,
          tags: ["planning", "requirements"],
          attachments: ["project-plan.pdf", "requirements.docx"],
          comments: [
            {
              id: "comment_001",
              author: "John Smith",
              content: "Initial requirements gathering completed. Client approved the scope.",
              timestamp: "2024-01-20T10:30:00Z",
            },
          ],
          subtasks: [
            { id: "subtask_001", name: "Stakeholder interviews", completed: true, assignedTo: "res_001" },
            { id: "subtask_002", name: "Technical requirements", completed: true, assignedTo: "res_001" },
            { id: "subtask_003", name: "Project timeline", completed: true, assignedTo: "res_001" },
          ],
        },
        {
          id: "task_002",
          name: "Resource Allocation & Team Setup",
          description: "Assign team members and set up project infrastructure",
          status: "completed",
          priority: "medium",
          startDate: "2024-01-22",
          endDate: "2024-01-26",
          estimatedHours: 12,
          actualHours: 10,
          assignedTo: ["res_001"],
          dependencies: ["task_001"],
          progress: 100,
          tags: ["setup", "team"],
          attachments: [],
          comments: [],
          subtasks: [
            { id: "subtask_004", name: "Team assignments", completed: true, assignedTo: "res_001" },
            { id: "subtask_005", name: "Tool setup", completed: true, assignedTo: "res_001" },
          ],
        },
        {
          id: "task_003",
          name: "User Research & Wireframing",
          description: "Conduct user research and create initial wireframes",
          status: "completed",
          priority: "high",
          startDate: "2024-01-26",
          endDate: "2024-02-05",
          estimatedHours: 40,
          actualHours: 42,
          assignedTo: ["res_002"],
          dependencies: ["task_002"],
          progress: 100,
          tags: ["design", "research", "wireframes"],
          attachments: ["user-research.pdf", "wireframes.fig"],
          comments: [
            {
              id: "comment_002",
              author: "Sarah Johnson",
              content: "User research revealed key insights about navigation preferences.",
              timestamp: "2024-02-01T14:15:00Z",
            },
          ],
          subtasks: [
            { id: "subtask_006", name: "User interviews", completed: true, assignedTo: "res_002" },
            { id: "subtask_007", name: "Competitive analysis", completed: true, assignedTo: "res_002" },
            { id: "subtask_008", name: "Wireframe creation", completed: true, assignedTo: "res_002" },
          ],
        },
        {
          id: "task_004",
          name: "UI Design & Prototyping",
          description: "Create high-fidelity designs and interactive prototypes",
          status: "completed",
          priority: "high",
          startDate: "2024-02-05",
          endDate: "2024-02-15",
          estimatedHours: 50,
          actualHours: 48,
          assignedTo: ["res_002"],
          dependencies: ["task_003"],
          progress: 100,
          tags: ["design", "ui", "prototyping"],
          attachments: ["designs.fig", "prototype-link.txt"],
          comments: [],
          subtasks: [
            { id: "subtask_009", name: "Design system", completed: true, assignedTo: "res_002" },
            { id: "subtask_010", name: "Page designs", completed: true, assignedTo: "res_002" },
            { id: "subtask_011", name: "Interactive prototype", completed: true, assignedTo: "res_002" },
          ],
        },
        {
          id: "task_005",
          name: "Frontend Development Setup",
          description: "Set up development environment and project structure",
          status: "completed",
          priority: "medium",
          startDate: "2024-02-15",
          endDate: "2024-02-20",
          estimatedHours: 16,
          actualHours: 14,
          assignedTo: ["res_003"],
          dependencies: ["task_004"],
          progress: 100,
          tags: ["development", "setup", "frontend"],
          attachments: [],
          comments: [],
          subtasks: [
            { id: "subtask_012", name: "Project scaffolding", completed: true, assignedTo: "res_003" },
            { id: "subtask_013", name: "Build configuration", completed: true, assignedTo: "res_003" },
          ],
        },
        {
          id: "task_006",
          name: "Component Development",
          description: "Develop reusable React components based on designs",
          status: "in_progress",
          priority: "high",
          startDate: "2024-02-20",
          endDate: "2024-03-15",
          estimatedHours: 80,
          actualHours: 45,
          assignedTo: ["res_003"],
          dependencies: ["task_005"],
          progress: 65,
          tags: ["development", "components", "react"],
          attachments: [],
          comments: [
            {
              id: "comment_003",
              author: "Mike Chen",
              content: "Header and navigation components completed. Working on content sections.",
              timestamp: "2024-02-28T09:20:00Z",
            },
          ],
          subtasks: [
            { id: "subtask_014", name: "Header component", completed: true, assignedTo: "res_003" },
            { id: "subtask_015", name: "Navigation component", completed: true, assignedTo: "res_003" },
            { id: "subtask_016", name: "Content components", completed: false, assignedTo: "res_003" },
            { id: "subtask_017", name: "Footer component", completed: false, assignedTo: "res_003" },
          ],
        },
        {
          id: "task_007",
          name: "Backend API Development",
          description: "Develop REST APIs for content management and user authentication",
          status: "in_progress",
          priority: "high",
          startDate: "2024-02-25",
          endDate: "2024-03-25",
          estimatedHours: 60,
          actualHours: 25,
          assignedTo: ["res_004"],
          dependencies: ["task_001"],
          progress: 40,
          tags: ["development", "backend", "api"],
          attachments: ["api-spec.yaml"],
          comments: [],
          subtasks: [
            { id: "subtask_018", name: "Database schema", completed: true, assignedTo: "res_004" },
            { id: "subtask_019", name: "Authentication API", completed: true, assignedTo: "res_004" },
            { id: "subtask_020", name: "Content API", completed: false, assignedTo: "res_004" },
            { id: "subtask_021", name: "Admin API", completed: false, assignedTo: "res_004" },
          ],
        },
        {
          id: "task_008",
          name: "Testing & Quality Assurance",
          description: "Comprehensive testing of all features and bug fixes",
          status: "not_started",
          priority: "medium",
          startDate: "2024-03-20",
          endDate: "2024-04-05",
          estimatedHours: 40,
          actualHours: 0,
          assignedTo: ["res_001", "res_003"],
          dependencies: ["task_006", "task_007"],
          progress: 0,
          tags: ["testing", "qa", "bugs"],
          attachments: [],
          comments: [],
          subtasks: [
            { id: "subtask_022", name: "Unit testing", completed: false, assignedTo: "res_003" },
            { id: "subtask_023", name: "Integration testing", completed: false, assignedTo: "res_001" },
            { id: "subtask_024", name: "User acceptance testing", completed: false, assignedTo: "res_001" },
          ],
        },
      ],
    }

    setProject(mockProject)
  }, [projectId])

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800"
      case "in_progress":
        return "bg-blue-100 text-blue-800"
      case "on_hold":
        return "bg-yellow-100 text-yellow-800"
      case "not_started":
        return "bg-gray-100 text-gray-800"
      case "cancelled":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "critical":
        return "bg-red-500"
      case "high":
        return "bg-orange-500"
      case "medium":
        return "bg-yellow-500"
      case "low":
        return "bg-green-500"
      default:
        return "bg-gray-500"
    }
  }

  const updateTask = useCallback(
    (taskId: string, updates: Partial<Task>) => {
      if (!project) return

      const updatedTasks = project.tasks.map((task) => (task.id === taskId ? { ...task, ...updates } : task))

      const updatedProject = { ...project, tasks: updatedTasks }
      setProject(updatedProject)

      if (onProjectUpdate) {
        onProjectUpdate(updatedProject)
      }

      showSuccess("Task updated successfully", "The task has been updated with your changes.")
    },
    [project, onProjectUpdate, showSuccess],
  )

  const handleAddTask = useCallback(() => {
    setNewTaskData({
      name: "",
      description: "",
      status: "not_started",
      priority: "medium",
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      estimatedHours: 8,
      assignedTo: []
    })
    setShowNewTaskForm(true)
  }, [])

  const handleCreateTask = useCallback(() => {
    if (!project || !newTaskData.name) return

    const newTask: Task = {
      id: `task_${Date.now()}`,
      name: newTaskData.name || "New Task",
      description: newTaskData.description || "Task description",
      status: newTaskData.status || "not_started",
      priority: newTaskData.priority || "medium",
      startDate: newTaskData.startDate || new Date().toISOString().split('T')[0],
      endDate: newTaskData.endDate || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      estimatedHours: newTaskData.estimatedHours || 8,
      actualHours: 0,
      assignedTo: newTaskData.assignedTo || [],
      dependencies: [],
      progress: 0,
      tags: [],
      attachments: [],
      comments: [],
      subtasks: []
    }

    const updatedProject = {
      ...project,
      tasks: [...project.tasks, newTask]
    }
    
    setProject(updatedProject)
    setShowNewTaskForm(false)
    setNewTaskData({})
    
    if (onProjectUpdate) {
      onProjectUpdate(updatedProject)
    }

    showSuccess("Task created", "New task has been added to the project.")
  }, [project, newTaskData, onProjectUpdate, showSuccess])

  const handleAddMilestone = useCallback((milestoneData?: { name: string; description: string; dueDate: string }) => {
    if (!project) return

    const newMilestone: Milestone = {
      id: `milestone_${Date.now()}`,
      name: milestoneData?.name || "New Milestone",
      description: milestoneData?.description || "Milestone description",
      dueDate: milestoneData?.dueDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      status: "upcoming",
      tasks: [],
      deliverables: ["Deliverable 1"]
    }

    const updatedProject = {
      ...project,
      milestones: [...project.milestones, newMilestone]
    }
    
    setProject(updatedProject)
    
    if (onProjectUpdate) {
      onProjectUpdate(updatedProject)
    }

    showSuccess("Milestone created", "New milestone has been added to the project.")
    setShowAddMilestoneModal(false)
  }, [project, onProjectUpdate, showSuccess])

  const handleAddResource = useCallback((resourceData?: { name: string; role: string; email: string; hourlyRate: number }) => {
    if (!project) return

    const newResource: Resource = {
      id: `res_${Date.now()}`,
      name: resourceData?.name || "New Team Member",
      role: resourceData?.role || "Team Member",
      email: resourceData?.email || "member@company.com",
      hourlyRate: resourceData?.hourlyRate || 75,
      availability: 100,
      skills: [],
      currentTasks: []
    }

    const updatedProject = {
      ...project,
      resources: [...project.resources, newResource]
    }
    
    setProject(updatedProject)
    
    if (onProjectUpdate) {
      onProjectUpdate(updatedProject)
    }

    showSuccess("Resource added", "New team member has been added to the project.")
    setShowAddResourceModal(false)
  }, [project, onProjectUpdate, showSuccess])

  const filteredTasks = useMemo(() => {
    if (!project || !project.tasks || !Array.isArray(project.tasks)) return []

    return project.tasks.filter((task) => {
      if (!task) return false
      
      const statusMatch = filterStatus === "all" || task.status === filterStatus
      const assigneeMatch = filterAssignee === "all" || (task.assignedTo && Array.isArray(task.assignedTo) && task.assignedTo.includes(filterAssignee))
      return statusMatch && assigneeMatch
    })
  }, [project, filterStatus, filterAssignee])

  const projectStats = useMemo(() => {
    if (!project || !project.tasks) return null

    const totalTasks = project.tasks.length
    const completedTasks = project.tasks.filter((t) => t.status === "completed").length
    const inProgressTasks = project.tasks.filter((t) => t.status === "in_progress").length
    const overdueTasks = project.tasks.filter((t) => {
      try {
        const endDate = new Date(t.endDate)
        const today = new Date()
        return endDate < today && t.status !== "completed"
      } catch {
        return false
      }
    }).length

    const totalEstimatedHours = project.tasks.reduce((sum, task) => {
      const hours = typeof task.estimatedHours === 'number' ? task.estimatedHours : 0
      return sum + hours
    }, 0)
    const totalActualHours = project.tasks.reduce((sum, task) => {
      const hours = typeof task.actualHours === 'number' ? task.actualHours : 0
      return sum + hours
    }, 0)
    
    // Prevent division by zero
    const budgetUsed = project.budget > 0 ? (project.spentBudget / project.budget) * 100 : 0
    const completionRate = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0

    return {
      totalTasks,
      completedTasks,
      inProgressTasks,
      overdueTasks,
      completionRate,
      totalEstimatedHours,
      totalActualHours,
      budgetUsed,
      remainingBudget: (project.budget || 0) - (project.spentBudget || 0),
    }
  }, [project])

  const GanttChart: React.FC<GanttChartProps> = ({ tasks, onTaskUpdate }) => {
    // Add defensive checks for empty tasks array
    if (!tasks || tasks.length === 0) {
      return (
        <div className="bg-white rounded-lg border p-8 text-center">
          <p className="text-gray-500">No tasks to display in Gantt chart</p>
        </div>
      )
    }

    const validTasks = tasks.filter(t => t.startDate && t.endDate)
    if (validTasks.length === 0) {
      return (
        <div className="bg-white rounded-lg border p-8 text-center">
          <p className="text-gray-500">No valid tasks with dates to display</p>
        </div>
      )
    }

    const timelineStart = new Date(Math.min(...validTasks.map((t) => new Date(t.startDate).getTime())))
    const timelineEnd = new Date(Math.max(...validTasks.map((t) => new Date(t.endDate).getTime())))
    const totalDays = Math.ceil((timelineEnd.getTime() - timelineStart.getTime()) / (1000 * 60 * 60 * 24))
    
    // Ensure totalDays is valid
    if (totalDays <= 0 || !isFinite(totalDays)) {
      return (
        <div className="bg-white rounded-lg border p-8 text-center">
          <p className="text-gray-500">Invalid date range for Gantt chart</p>
        </div>
      )
    }

    const getTaskPosition = (task: Task) => {
      const taskStart = new Date(task.startDate)
      const taskEnd = new Date(task.endDate)
      const startOffset = Math.ceil((taskStart.getTime() - timelineStart.getTime()) / (1000 * 60 * 60 * 24))
      const duration = Math.ceil((taskEnd.getTime() - taskStart.getTime()) / (1000 * 60 * 60 * 24))

      return {
        left: `${(startOffset / totalDays) * 100}%`,
        width: `${(duration / totalDays) * 100}%`,
      }
    }

    return (
      <div className="bg-white rounded-lg border overflow-x-auto">
        <div className="min-w-[800px] p-4">
          {/* Timeline header */}
          <div className="flex items-center mb-4">
            <div className="w-64 font-medium text-gray-900">Task</div>
            <div className="flex-1 relative">
              <div className="flex border-b border-gray-200">
                {Array.from({ length: Math.ceil(totalDays / 7) }, (_, i) => {
                  const weekStart = new Date(timelineStart.getTime() + i * 7 * 24 * 60 * 60 * 1000)
                  return (
                    <div key={i} className="flex-1 text-center py-2 text-sm text-gray-600 border-r border-gray-100">
                      {weekStart.toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                    </div>
                  )
                })}
              </div>
            </div>
          </div>

          {/* Task rows */}
          <div className="space-y-2">
            {validTasks.map((task) => {
              const position = getTaskPosition(task)
              return (
                <div key={task.id} className="flex items-center">
                  <div className="w-64 pr-4">
                    <div className="text-sm font-medium text-gray-900 truncate">{task.name}</div>
                    <div className="text-xs text-gray-500">
                      {task.assignedTo.length > 0 && (
                        <span>{task.assignedTo[0]}</span>
                      )}
                    </div>
                  </div>
                  <div className="flex-1 relative h-8">
                    <div className="absolute inset-y-0 bg-gray-100 rounded" style={{ left: "0%", right: "0%" }}></div>
                    <div
                      className={`absolute inset-y-1 rounded cursor-pointer transition-colors hover:opacity-80 ${
                        task.status === "completed"
                          ? "bg-green-500"
                          : task.status === "in_progress"
                            ? "bg-blue-500"
                            : task.status === "on_hold"
                              ? "bg-yellow-500"
                              : "bg-gray-400"
                      }`}
                      style={position}
                      onClick={() => setSelectedTask(task)}
                    >
                      <div className="h-full flex items-center px-2">
                        <div className="text-xs text-white font-medium truncate">{task.progress}%</div>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    )
  }

  if (!project) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-500">Loading project...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{project.name}</h1>
          <p className="text-gray-600 mt-1">{project.description}</p>
          <div className="flex items-center space-x-4 mt-2">
            <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(project.status)}`}>
              {project.status.replace("_", " ").toUpperCase()}
            </span>
            <span className="text-sm text-gray-500">
              {new Date(project.startDate).toLocaleDateString()} - {new Date(project.endDate).toLocaleDateString()}
            </span>
            <span className="text-sm text-gray-500">Client: {project.clientName}</span>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <select
            value={viewMode}
            onChange={(e) => setViewMode(e.target.value as any)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="list">List View</option>
            <option value="kanban">Kanban Board</option>
            <option value="gantt">Gantt Chart</option>
            <option value="calendar">Calendar View</option>
          </select>
          <button
            onClick={handleAddTask}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Task
          </button>
        </div>
      </div>

      {/* Project Stats */}
      {projectStats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Progress</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{projectStats.completionRate.toFixed(1)}%</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-full">
                <TrendingUp className="w-6 h-6 text-blue-600" />
              </div>
            </div>
            <div className="mt-4">
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${projectStats.completionRate}%` }}
                ></div>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Tasks</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {projectStats.completedTasks}/{projectStats.totalTasks}
                </p>
              </div>
              <div className="p-3 bg-green-100 rounded-full">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
            </div>
            <div className="flex items-center mt-4 space-x-4 text-sm">
              <span className="text-blue-600">{projectStats.inProgressTasks} in progress</span>
              {projectStats.overdueTasks > 0 && (
                <span className="text-red-600">{projectStats.overdueTasks} overdue</span>
              )}
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Budget Used</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{projectStats.budgetUsed.toFixed(1)}%</p>
              </div>
              <div className="p-3 bg-yellow-100 rounded-full">
                <DollarSign className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
            <p className="text-sm text-gray-600 mt-2">${projectStats.remainingBudget.toLocaleString()} remaining</p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Time Spent</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{projectStats.totalActualHours}h</p>
              </div>
              <div className="p-3 bg-purple-100 rounded-full">
                <Timer className="w-6 h-6 text-purple-600" />
              </div>
            </div>
            <p className="text-sm text-gray-600 mt-2">of {projectStats.totalEstimatedHours}h estimated</p>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {[
              { id: "tasks", name: "Tasks", icon: CheckCircle },
              { id: "milestones", name: "Milestones", icon: Flag },
              { id: "resources", name: "Resources", icon: Users },
              { id: "timeline", name: "Timeline", icon: Calendar },
            ].map((tab) => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? "border-blue-500 text-blue-600"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
                >
                  <Icon className="w-4 h-4 mr-2" />
                  {tab.name}
                </button>
              )
            })}
          </nav>
        </div>

        <div className="p-6">
          {activeTab === "tasks" && (
            <div className="space-y-4">
              {/* Filters */}
              <div className="flex items-center space-x-4">
                <Filter className="w-4 h-4 text-gray-500" />
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">All Status</option>
                  <option value="not_started">Not Started</option>
                  <option value="in_progress">In Progress</option>
                  <option value="completed">Completed</option>
                  <option value="on_hold">On Hold</option>
                </select>
                <select
                  value={filterAssignee}
                  onChange={(e) => setFilterAssignee(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">All Assignees</option>
                  {project?.resources && Array.isArray(project.resources) && project.resources.map((resource) => (
                    <option key={resource.id} value={resource.id}>
                      {resource.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Task Views */}
              {viewMode === "list" && (
                <div className="space-y-3">
                  {filteredTasks.map((task) => (
                    <div
                      key={task.id}
                      className="border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3">
                            <div className={`w-1 h-6 rounded ${getPriorityColor(task.priority)}`}></div>
                            <h3 className="font-medium text-gray-900">{task.name}</h3>
                            <span
                              className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(task.status)}`}
                            >
                              {task.status.replace("_", " ").toUpperCase()}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 mt-1 ml-4">{task.description}</p>
                          <div className="flex items-center space-x-4 mt-3 ml-4 text-sm text-gray-500">
                            <span className="flex items-center">
                              <Calendar className="w-4 h-4 mr-1" />
                              {new Date(task.startDate).toLocaleDateString()} -{" "}
                              {new Date(task.endDate).toLocaleDateString()}
                            </span>
                            <span className="flex items-center">
                              <Clock className="w-4 h-4 mr-1" />
                              {task.actualHours}h / {task.estimatedHours}h
                            </span>
                            <span className="flex items-center">
                              <User className="w-4 h-4 mr-1" />
                              {task.assignedTo && Array.isArray(task.assignedTo) ? 
                                task.assignedTo.map((id) => {
                                  const resource = project?.resources?.find((r) => r.id === id)
                                  return resource?.name || id
                                }).join(", ") : 'Unassigned'
                              }
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <div className="text-right">
                            <div className="text-sm font-medium text-gray-900">{task.progress}%</div>
                            <div className="w-20 bg-gray-200 rounded-full h-2 mt-1">
                              <div
                                className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                                style={{ width: `${task.progress}%` }}
                              ></div>
                            </div>
                          </div>
                          <button
                            onClick={() => setSelectedTask(task)}
                            className="p-2 text-gray-400 hover:text-blue-600"
                            title="Edit task"
                          >
                            <Settings className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {viewMode === "gantt" && <GanttChart tasks={filteredTasks} onTaskUpdate={updateTask} />}
            </div>
          )}

          {activeTab === "milestones" && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-900">Project Milestones</h3>
                <button 
                  onClick={() => setShowAddMilestoneModal(true)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Add Milestone
                </button>
              </div>

              <div className="space-y-4">
                {project?.milestones && Array.isArray(project.milestones) && project.milestones.map((milestone) => (
                  <div key={milestone.id} className="bg-gray-50 rounded-lg p-6 border">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3">
                          <Flag className="w-5 h-5 text-blue-600" />
                          <h4 className="font-semibold text-gray-900">{milestone.name}</h4>
                          <span
                            className={`px-2 py-1 text-xs font-medium rounded-full ${
                              milestone.status === "completed"
                                ? "bg-green-100 text-green-800"
                                : milestone.status === "overdue"
                                  ? "bg-red-100 text-red-800"
                                  : "bg-blue-100 text-blue-800"
                            }`}
                          >
                            {milestone.status.toUpperCase()}
                          </span>
                        </div>
                        <p className="text-gray-600 mt-2">{milestone.description}</p>
                        <div className="mt-4">
                          <p className="text-sm font-medium text-gray-700 mb-2">Deliverables:</p>
                          <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                            {milestone.deliverables.map((deliverable, index) => (
                              <li key={index}>{deliverable}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-600">Due Date</p>
                        <p className="font-medium text-gray-900">{new Date(milestone.dueDate).toLocaleDateString()}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === "resources" && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-900">Team Resources</h3>
                <button 
                  onClick={() => setShowAddResourceModal(true)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Add Resource
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {project?.resources && Array.isArray(project.resources) && project.resources.map((resource) => (
                  <div key={resource.id} className="bg-white border border-gray-200 rounded-lg p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                          <User className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900">{resource.name}</h4>
                          <p className="text-sm text-gray-600">{resource.role}</p>
                          <p className="text-xs text-gray-500">{resource.email}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-gray-900">${resource.hourlyRate}/hr</p>
                        <p className="text-xs text-gray-500">{resource.availability}% available</p>
                      </div>
                    </div>

                    <div className="mt-4">
                      <p className="text-sm font-medium text-gray-700 mb-2">Skills:</p>
                      <div className="flex flex-wrap gap-1">
                        {resource.skills && Array.isArray(resource.skills) && resource.skills.map((skill, index) => (
                          <span key={index} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="mt-4">
                      <p className="text-sm font-medium text-gray-700 mb-2">
                        Current Tasks ({resource.currentTasks && Array.isArray(resource.currentTasks) ? resource.currentTasks.length : 0}):
                      </p>
                      <div className="space-y-1">
                        {resource.currentTasks && Array.isArray(resource.currentTasks) && resource.currentTasks.map((taskId) => {
                          const task = project?.tasks?.find((t) => t.id === taskId)
                          return task ? (
                            <div key={taskId} className="text-xs text-gray-600 flex items-center justify-between">
                              <span className="truncate">{task.name}</span>
                              <span className={`px-1 py-0.5 rounded text-xs ${getStatusColor(task.status)}`}>
                                {task.status}
                              </span>
                            </div>
                          ) : null
                        })}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === "timeline" && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Project Timeline</h3>
              <GanttChart tasks={project?.tasks || []} onTaskUpdate={updateTask} />
            </div>
          )}
        </div>
      </div>

      {/* New Task Form Modal */}
      {showNewTaskForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-xl font-semibold text-gray-900">Create New Task</h2>
              <button onClick={() => setShowNewTaskForm(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Task Name *</label>
                <input
                  type="text"
                  value={newTaskData.name || ''}
                  onChange={(e) => setNewTaskData({ ...newTaskData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter task name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={newTaskData.description || ''}
                  onChange={(e) => setNewTaskData({ ...newTaskData, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={3}
                  placeholder="Enter task description"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                  <select
                    value={newTaskData.priority || 'medium'}
                    onChange={(e) => setNewTaskData({ ...newTaskData, priority: e.target.value as any })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="critical">Critical</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Estimated Hours</label>
                  <input
                    type="number"
                    value={newTaskData.estimatedHours || 8}
                    onChange={(e) => setNewTaskData({ ...newTaskData, estimatedHours: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    min="1"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                  <input
                    type="date"
                    value={newTaskData.startDate || ''}
                    onChange={(e) => setNewTaskData({ ...newTaskData, startDate: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                  <input
                    type="date"
                    value={newTaskData.endDate || ''}
                    onChange={(e) => setNewTaskData({ ...newTaskData, endDate: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Assign To</label>
                <select
                  multiple
                  value={newTaskData.assignedTo || []}
                  onChange={(e) => {
                    const values = Array.from(e.target.selectedOptions, option => option.value)
                    setNewTaskData({ ...newTaskData, assignedTo: values })
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  size={3}
                >
                  {project?.resources && Array.isArray(project.resources) && project.resources.map((resource) => (
                    <option key={resource.id} value={resource.id}>
                      {resource.name} - {resource.role}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-gray-500 mt-1">Hold Ctrl/Cmd to select multiple team members</p>
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowNewTaskForm(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateTask}
                disabled={!newTaskData.name}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Create Task
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Milestone Modal */}
      {showAddMilestoneModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-lg">
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-xl font-semibold text-gray-900">Add New Milestone</h2>
              <button onClick={() => setShowAddMilestoneModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Milestone Name *</label>
                <input
                  type="text"
                  placeholder="Enter milestone name"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  id="milestone-name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  placeholder="Enter milestone description"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={3}
                  id="milestone-description"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Due Date *</label>
                <input
                  type="date"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  id="milestone-date"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowAddMilestoneModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  const nameInput = document.getElementById('milestone-name') as HTMLInputElement;
                  const descInput = document.getElementById('milestone-description') as HTMLTextAreaElement;
                  const dateInput = document.getElementById('milestone-date') as HTMLInputElement;
                  
                  if (nameInput.value && dateInput.value) {
                    handleAddMilestone({
                      name: nameInput.value,
                      description: descInput.value,
                      dueDate: dateInput.value
                    });
                    setShowAddMilestoneModal(false);
                  }
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Add Milestone
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Resource Modal */}
      {showAddResourceModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-lg">
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-xl font-semibold text-gray-900">Add New Resource</h2>
              <button onClick={() => setShowAddResourceModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                <input
                  type="text"
                  placeholder="Enter resource name"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  id="resource-name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Role *</label>
                <input
                  type="text"
                  placeholder="Enter role (e.g., Developer, Designer)"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  id="resource-role"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  placeholder="Enter email address"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  id="resource-email"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Hourly Rate</label>
                <input
                  type="number"
                  placeholder="Enter hourly rate"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  id="resource-rate"
                  min="0"
                  step="0.01"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowAddResourceModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  const nameInput = document.getElementById('resource-name') as HTMLInputElement;
                  const roleInput = document.getElementById('resource-role') as HTMLInputElement;
                  const emailInput = document.getElementById('resource-email') as HTMLInputElement;
                  const rateInput = document.getElementById('resource-rate') as HTMLInputElement;
                  
                  if (nameInput.value && roleInput.value) {
                    handleAddResource({
                      name: nameInput.value,
                      role: roleInput.value,
                      email: emailInput.value,
                      hourlyRate: rateInput.value ? parseFloat(rateInput.value) : 0
                    });
                    setShowAddResourceModal(false);
                  }
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Add Resource
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Task Detail Modal */}
      {selectedTask && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-xl font-semibold text-gray-900">{selectedTask.name}</h2>
              <button onClick={() => setSelectedTask(null)} className="text-gray-400 hover:text-gray-600">
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <p className="text-gray-600">{selectedTask.description}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <select
                    value={selectedTask.status}
                    onChange={(e) => updateTask(selectedTask.id, { status: e.target.value as any })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="not_started">Not Started</option>
                    <option value="in_progress">In Progress</option>
                    <option value="completed">Completed</option>
                    <option value="on_hold">On Hold</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                  <select
                    value={selectedTask.priority}
                    onChange={(e) => updateTask(selectedTask.id, { priority: e.target.value as any })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="critical">Critical</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Progress</label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={selectedTask.progress}
                  onChange={(e) => updateTask(selectedTask.id, { progress: Number.parseInt(e.target.value) })}
                  className="w-full"
                />
                <div className="flex justify-between text-sm text-gray-500 mt-1">
                  <span>0%</span>
                  <span className="font-medium">{selectedTask.progress}%</span>
                  <span>100%</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Subtasks</label>
                <div className="space-y-2">
                  {selectedTask.subtasks && Array.isArray(selectedTask.subtasks) && selectedTask.subtasks.map((subtask) => (
                    <label key={subtask.id} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={subtask.completed}
                        onChange={(e) => {
                          const updatedSubtasks = selectedTask.subtasks.map((st) =>
                            st.id === subtask.id ? { ...st, completed: e.target.checked } : st,
                          )
                          updateTask(selectedTask.id, { subtasks: updatedSubtasks })
                        }}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 mr-2"
                      />
                      <span className={`text-sm ${subtask.completed ? "line-through text-gray-500" : "text-gray-900"}`}>
                        {subtask.name}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setSelectedTask(null)}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Close
              </button>
              <button
                onClick={() => {
                  showSuccess("Task updated successfully", "The task has been updated with your changes.")
                  setSelectedTask(null)
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdvancedProjectManagement
