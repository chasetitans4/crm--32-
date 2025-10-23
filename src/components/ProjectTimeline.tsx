"use client"

// Add imports for granular task management and progress tracking
import type React from "react"
import { useState, useEffect } from "react"
import {
  CheckCircle,
  Clock,
  AlertTriangle,
  Plus,
  X,
  Calendar,
  Edit,
  ChevronDown,
  ChevronUp,
  List,
  BarChart2,
  Trash2,
  MoreHorizontal,
  CheckSquare,
  Square,
} from "lucide-react"
import { useAppContext } from "../context/AppContext"

// Replace the ProjectTimeline component with this enhanced version
const ProjectTimeline: React.FC = () => {
  const { state } = useAppContext()
  const { clients } = state

  const [selectedProject, setSelectedProject] = useState<string | null>(null)
  const [showAddMilestoneModal, setShowAddMilestoneModal] = useState(false)
  // Task modal state removed - task functionality will be available in future update
  const [expandedProjects, setExpandedProjects] = useState<string[]>([])
  const [expandedMilestones, setExpandedMilestones] = useState<string[]>([])
  const [newMilestone, setNewMilestone] = useState({
    name: "",
    date: "",
    description: "",
  })
  // Task state removed - task functionality will be available in future update
  const [viewMode, setViewMode] = useState<"timeline" | "kanban" | "gantt">("timeline")
  const [filterStatus, setFilterStatus] = useState("all")
  const [sortBy, setSortBy] = useState("deadline")
  // Task details state removed - task functionality will be available in future update
  const [isAutomatedUpdatesEnabled, setIsAutomatedUpdatesEnabled] = useState(true)

  // Get all projects from clients
  const allProjects = clients.flatMap((client) =>
    client.projects.map((project) => ({
      ...project,
      clientName: client.name,
      clientId: client.id,
      // Ensure milestones exist with default if not
      milestones: project.milestones || [],
      // Tasks functionality removed - will be available in future update
    })),
  )

  // Find the selected project
  const activeProject = allProjects.find((p) => p.id === selectedProject)

  // Toggle project expansion
  const toggleProjectExpansion = (projectId: string) => {
    if (expandedProjects.includes(projectId)) {
      setExpandedProjects(expandedProjects.filter((id) => id !== projectId))
    } else {
      setExpandedProjects([...expandedProjects, projectId])
    }
  }

  // Toggle milestone expansion
  const toggleMilestoneExpansion = (milestoneId: string) => {
    if (expandedMilestones.includes(milestoneId)) {
      setExpandedMilestones(expandedMilestones.filter((id) => id !== milestoneId))
    } else {
      setExpandedMilestones([...expandedMilestones, milestoneId])
    }
  }

  // Handle adding a new milestone
  const handleAddMilestone = () => {
    if (!selectedProject || !newMilestone.name || !newMilestone.date) {
      alert("Please fill in all required fields")
      return
    }

    // In a real app, this would call an API to add the milestone
    alert(`Milestone "${newMilestone.name}" added to project`)

    // Reset form and close modal
    setNewMilestone({
      name: "",
      date: "",
      description: "",
    })
    setShowAddMilestoneModal(false)
  }

  // Task handling function removed - task functionality will be available in future update

  // Task functionality removed - will be available in future update

  // Calculate days remaining or overdue
  const getDaysStatus = (endDate: string) => {
    const today = new Date()
    const deadlineDate = new Date(endDate)
    const diffTime = deadlineDate.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    if (diffDays > 0) {
      return { days: diffDays, status: "remaining" }
    } else if (diffDays < 0) {
      return { days: Math.abs(diffDays), status: "overdue" }
    } else {
      return { days: 0, status: "due today" }
    }
  }

  // Calculate project progress based on completed tasks and milestones
  const calculateProjectProgress = (project: any) => {
    if (!project.milestones || project.milestones.length === 0) return 0

    const totalMilestones = project.milestones.length
    const completedMilestones = project.milestones.filter((m: any) => m.status === "completed").length

    // If we have tasks, use a weighted calculation
    if (project.tasks && project.tasks.length > 0) {
      const totalTasks = project.tasks.length
      const completedTasks = project.tasks.filter((t: any) => t.status === "completed").length

      // Weight: 60% milestones, 40% tasks
      return Math.round(((completedMilestones / totalMilestones) * 0.6 + (completedTasks / totalTasks) * 0.4) * 100)
    }

    // If no tasks, base progress solely on milestones
    return Math.round((completedMilestones / totalMilestones) * 100)
  }

  // Priority color function removed - task functionality will be available in future update

  // Simulate automated progress updates
  useEffect(() => {
    if (!isAutomatedUpdatesEnabled) return

    const interval = setInterval(() => {
      // In a real app, this would fetch the latest project data from the API
      console.log("Fetching latest project data...")
    }, 60000) // Update every minute

    return () => clearInterval(interval)
  }, [isAutomatedUpdatesEnabled])

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold">Website Design Project Timeline</h2>
          <p className="text-gray-500">Track project milestones, tasks, and progress</p>
        </div>
        <div className="flex gap-2">
          <div className="flex border rounded overflow-hidden">
            <button
              className={`px-3 py-1 ${viewMode === "timeline" ? "bg-blue-600 text-white" : "bg-white"}`}
              onClick={() => setViewMode("timeline")}
            >
              <List size={16} />
            </button>
            <button
              className={`px-3 py-1 ${viewMode === "kanban" ? "bg-blue-600 text-white" : "bg-white"}`}
              onClick={() => setViewMode("kanban")}
            >
              <BarChart2 size={16} />
            </button>
            <button
              className={`px-3 py-1 ${viewMode === "gantt" ? "bg-blue-600 text-white" : "bg-white"}`}
              onClick={() => setViewMode("gantt")}
            >
              <Calendar size={16} />
            </button>
          </div>
          {/* Add Task button removed - task functionality will be available in future update */}
          <button
            className="px-4 py-2 bg-blue-600 text-white rounded flex items-center gap-2 hover:bg-blue-700"
            onClick={() => {
              setSelectedProject(null)
              setShowAddMilestoneModal(true)
            }}
          >
            <Plus size={16} />
            Add Milestone
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="flex flex-wrap gap-4 items-center justify-between">
          <div className="flex gap-4 items-center">
            <div>
              <label htmlFor="projectFilter" className="block text-sm font-medium text-gray-700 mb-1">
                Project
              </label>
              <select
                id="projectFilter"
                className="border rounded px-3 py-2 min-w-[200px]"
                value={selectedProject || ""}
                onChange={(e) => setSelectedProject(e.target.value || null)}
              >
                <option value="">All Projects</option>
                {allProjects.map((project) => (
                  <option key={project.id} value={project.id}>
                    {project.name} ({project.clientName})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="statusFilter" className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <select
                id="statusFilter"
                className="border rounded px-3 py-2"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
              >
                <option value="all">All Statuses</option>
                <option value="not-started">Not Started</option>
                <option value="in-progress">In Progress</option>
                <option value="completed">Completed</option>
                <option value="overdue">Overdue</option>
              </select>
            </div>

            <div>
              <label htmlFor="sortBy" className="block text-sm font-medium text-gray-700 mb-1">
                Sort By
              </label>
              <select
                id="sortBy"
                className="border rounded px-3 py-2"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                <option value="deadline">Deadline (Closest First)</option>
                <option value="name">Name (A-Z)</option>
                <option value="progress">Progress (Highest First)</option>
                <option value="client">Client (A-Z)</option>
              </select>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500">Automated Updates</span>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                className="sr-only peer"
                checked={isAutomatedUpdatesEnabled}
                onChange={() => setIsAutomatedUpdatesEnabled(!isAutomatedUpdatesEnabled)}
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
        </div>
      </div>

      {viewMode === "timeline" && (
        <div className="grid grid-cols-1 gap-6">
          {allProjects
            .filter((project) => !selectedProject || project.id === selectedProject.toString())
            .filter((project) => {
              if (filterStatus === "all") return true
              if (filterStatus === "overdue") {
                return getDaysStatus(project.endDate || project.startDate).status === "overdue"
              }
              return project.status === filterStatus
            })
            .sort((a, b) => {
              if (sortBy === "deadline") {
                return new Date(a.endDate || a.startDate).getTime() - new Date(b.endDate || b.startDate).getTime()
              }
              if (sortBy === "name") {
                return a.name.localeCompare(b.name)
              }
              if (sortBy === "progress") {
                return calculateProjectProgress(b) - calculateProjectProgress(a)
              }
              if (sortBy === "client") {
                return a.clientName.localeCompare(b.clientName)
              }
              return 0
            })
            .map((project) => (
              <div key={`${project.clientId}-${project.id}`} className="bg-white rounded-lg shadow overflow-hidden">
                <div
                  className="bg-gray-50 p-4 flex justify-between items-center cursor-pointer"
                  onClick={() => toggleProjectExpansion(project.id)}
                >
                  <div>
                    <h3 className="font-semibold text-lg">{project.name}</h3>
                    <p className="text-sm text-gray-500">
                      Client: {project.clientName} • Deadline: {project.endDate}
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <div>
                      <span
                        className={`px-2 py-1 text-xs rounded-full ${
                          project.status === "in-progress"
                            ? "bg-blue-100 text-blue-800"
                            : project.status === "completed"
                              ? "bg-green-100 text-green-800"
                              : getDaysStatus(project.endDate || project.startDate).status === "overdue"
                              ? "bg-red-100 text-red-800"
                              : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {project.status === "in-progress"
                          ? "In Progress"
                          : project.status === "completed"
                            ? "Completed"
                            : getDaysStatus(project.endDate || project.startDate).status === "overdue"
                              ? "Overdue"
                              : "Not Started"}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-full bg-gray-200 rounded-full h-2 w-24">
                        <div
                          className={`h-2 rounded-full ${
                            calculateProjectProgress(project) < 30
                              ? "bg-red-500"
                              : calculateProjectProgress(project) < 70
                                ? "bg-yellow-500"
                                : "bg-green-500"
                          }`}
                          style={{ width: `${calculateProjectProgress(project)}%` }}
                        ></div>
                      </div>
                      <span className="text-sm">{calculateProjectProgress(project)}%</span>
                    </div>
                    {expandedProjects.includes(project.id) ? (
                      <ChevronUp size={20} className="text-gray-500" />
                    ) : (
                      <ChevronDown size={20} className="text-gray-500" />
                    )}
                  </div>
                </div>

                {expandedProjects.includes(project.id) && (
                  <div className="p-6">
                    <div className="mb-6">
                      <div className="flex justify-between items-center mb-4">
                        <h4 className="font-medium text-lg">Project Timeline</h4>
                        <div className="flex gap-2">
                          {/* Add Task button removed - task functionality will be available in future update */}
                          <button
                            className="px-3 py-1 border rounded text-sm flex items-center gap-1 hover:bg-gray-50"
                            onClick={() => {
                              setSelectedProject(project.id)
                              setShowAddMilestoneModal(true)
                            }}
                          >
                            <Plus size={14} />
                            Add Milestone
                          </button>
                        </div>
                      </div>

                      <div className="relative">
                        {/* Vertical line */}
                        <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200"></div>

                        {project.milestones && project.milestones.length > 0 ? (
                          <div className="space-y-8">
                            {project.milestones.map((milestone, index) => (
                              <div key={index} className="relative pl-10">
                                <div
                                  className={`absolute left-0 w-8 h-8 rounded-full flex items-center justify-center ${
                                    milestone.completed
                                      ? "bg-green-500 text-white"
                                      : getDaysStatus(milestone.dueDate).status === "overdue"
                                        ? "bg-red-500 text-white"
                                        : "bg-blue-500 text-white"
                                  }`}
                                >
                                  {milestone.completed ? (
                                    <CheckCircle size={16} />
                                  ) : getDaysStatus(milestone.dueDate).status === "overdue" ? (
                                    <AlertTriangle size={16} />
                                  ) : (
                                    <Clock size={16} />
                                  )}
                                </div>
                                <div>
                                  <div className="flex justify-between items-start">
                                    <div
                                      className="cursor-pointer"
                                      onClick={() => toggleMilestoneExpansion(milestone.id)}
                                    >
                                      <h4 className="font-medium flex items-center gap-2">
                                        {milestone.name}
                                        {expandedMilestones.includes(milestone.id) ? (
                                          <ChevronUp size={16} className="text-gray-500" />
                                        ) : (
                                          <ChevronDown size={16} className="text-gray-500" />
                                        )}
                                      </h4>
                                      <p className="text-sm text-gray-500">{milestone.dueDate}</p>
                                    </div>
                                    <div className="flex gap-2">
                                      <select
                                        className="text-sm border rounded px-2 py-1"
                                        value={milestone.completed ? "completed" : "in-progress"}
                                        onChange={() => alert("Status update functionality will be implemented soon.")}
                                      >
                                        <option value="in-progress">In Progress</option>
                                        <option value="completed">Completed</option>
                                      </select>
                                      <button className="p-1 text-gray-400 hover:text-blue-600">
                                        <Edit size={16} />
                                      </button>
                                    </div>
                                  </div>
                                  {/* Description removed - milestone interface doesn't include description property */}

                                  {/* Tasks for this milestone */}
                                  {expandedMilestones.includes(milestone.id) && (
                                    <div className="mt-4 space-y-2">
                                      <div className="flex justify-between items-center mb-2">
                                        <h5 className="text-sm font-medium">Tasks</h5>
                                        {/* Add Task button removed - task functionality will be available in future update */}
                                      </div>

                                      <div className="text-sm text-gray-500 py-2 text-center border rounded">
                                        Task management will be available in a future update
                                      </div>
                                    </div>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="text-center py-8 text-gray-500">
                            No milestones defined for this project yet.
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="border-t pt-4">
                      <h4 className="font-medium mb-3">Project Details</h4>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="border rounded-lg p-4">
                          <div className="text-sm text-gray-500 mb-1">Budget</div>
                          <div className="text-lg font-semibold">${project.budget?.toLocaleString()}</div>
                          <div className="text-xs text-gray-500 mt-1">
                            ${project.spent?.toLocaleString()} spent (
                            {Math.round((project.spent / project.budget) * 100)}%)
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-1.5 mt-2">
                            <div
                              className={`h-1.5 rounded-full ${
                                (project.spent / project.budget) > 0.9
                                  ? "bg-red-500"
                                  : project.spent / project.budget > 0.7
                                    ? "bg-yellow-500"
                                    : "bg-green-500"
                              }`}
                              style={{ width: `${Math.min(100, Math.round((project.spent / project.budget) * 100))}%` }}
                            ></div>
                          </div>
                        </div>

                        <div className="border rounded-lg p-4">
                          <div className="text-sm text-gray-500 mb-1">Timeline</div>
                          <div className="text-lg font-semibold">
                            {getDaysStatus(project.endDate || project.startDate).days}{" "}
                            {getDaysStatus(project.endDate || project.startDate).status === "remaining"
                              ? "days remaining"
                              : getDaysStatus(project.endDate || project.startDate).status === "overdue"
                                ? "days overdue"
                                : "due today"}
                          </div>
                          <div className="text-xs text-gray-500 mt-1">Deadline: {project.endDate || project.startDate}</div>
                          <div className="flex items-center gap-1 mt-2">
                            <div className="flex-1 h-1.5 bg-gray-200 rounded-full">
                              <div
                                className={`h-1.5 rounded-full ${
                                  getDaysStatus(project.endDate || project.startDate).status === "overdue"
                                    ? "bg-red-500"
                                    : getDaysStatus(project.endDate || project.startDate).days < 7
                                      ? "bg-yellow-500"
                                      : "bg-green-500"
                                }`}
                                style={{
                                  width:
                                    getDaysStatus(project.endDate || project.startDate).status === "overdue"
                                      ? "100%"
                                      : `${Math.min(100, 100 - (getDaysStatus(project.endDate || project.startDate).days / 30) * 100)}%`,
                                }}
                              ></div>
                            </div>
                          </div>
                        </div>

                        <div className="border rounded-lg p-4">
                          <div className="text-sm text-gray-500 mb-1">Team</div>
                          <div className="text-lg font-semibold">{project.teamMembers?.length || 0} members</div>
                          <div className="text-xs text-gray-500 mt-1">
                            {project.teamMembers?.join(", ") || "No team members assigned"}
                          </div>
                          <div className="flex mt-2">
                            {project.teamMembers?.slice(0, 5).map((member, i) => (
                              <div
                                key={i}
                                className="w-6 h-6 rounded-full bg-blue-500 text-white flex items-center justify-center text-xs -ml-1 first:ml-0 border border-white"
                                title={member}
                              >
                                {member ? member.charAt(0).toUpperCase() : '?'}
                              </div>
                            ))}
                            {project.teamMembers && project.teamMembers.length > 5 && (
                              <div className="w-6 h-6 rounded-full bg-gray-300 text-gray-700 flex items-center justify-center text-xs -ml-1 border border-white">
                                +{project.teamMembers.length - 5}
                              </div>
                            )}
                            <button className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 -ml-1 border border-white hover:bg-gray-200">
                              <Plus size={14} />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}

          {allProjects.length === 0 && (
            <div className="text-center py-12 bg-white rounded-lg shadow">
              <div className="text-gray-400 mb-3">
                <Calendar size={48} className="mx-auto" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-1">No projects found</h3>
              <p className="text-gray-500">Start by creating a new project for your clients.</p>
            </div>
          )}
        </div>
      )}

      {viewMode === "kanban" && (
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <div className="text-gray-500">
            <div className="text-4xl mb-4">🚧</div>
            <h3 className="text-lg font-medium mb-2">Kanban View Coming Soon</h3>
            <p className="text-sm">Task management features will be available in a future update.</p>
          </div>
        </div>
      )}

      {viewMode === "gantt" && (
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-center py-8">
            <h3 className="text-lg font-medium text-gray-700 mb-2">Gantt Chart View</h3>
            <p className="text-gray-500">
              The Gantt chart visualization would display project timelines, milestones, and tasks in a horizontal
              timeline format.
            </p>
            <div className="mt-4 h-64 border rounded-lg flex items-center justify-center bg-gray-50">
              <div className="text-gray-400">Gantt chart visualization would appear here</div>
            </div>
          </div>
        </div>
      )}

      {/* Add Milestone Modal */}
      {showAddMilestoneModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-full max-w-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold">Add Project Milestone</h3>
              <button onClick={() => setShowAddMilestoneModal(false)} className="text-gray-400 hover:text-gray-600">
                <X size={20} />
              </button>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Project</label>
              <select
                className="w-full border rounded px-3 py-2"
                value={selectedProject || ""}
                onChange={(e) => setSelectedProject(e.target.value || null)}
              >
                <option value="">Select a project</option>
                {allProjects.map((project) => (
                  <option key={`${project.clientId}-${project.id}`} value={project.id}>
                    {project.name} ({project.clientName})
                  </option>
                ))}
              </select>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Milestone Name*</label>
              <input
                type="text"
                className="w-full border rounded px-3 py-2"
                value={newMilestone.name}
                onChange={(e) => setNewMilestone({ ...newMilestone, name: e.target.value })}
                placeholder="e.g., Design Approval"
                required
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Due Date*</label>
              <input
                type="date"
                className="w-full border rounded px-3 py-2"
                value={newMilestone.date}
                onChange={(e) => setNewMilestone({ ...newMilestone, date: e.target.value })}
                required
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea
                className="w-full border rounded px-3 py-2"
                value={newMilestone.description}
                onChange={(e) => setNewMilestone({ ...newMilestone, description: e.target.value })}
                placeholder="Optional description of this milestone"
                rows={3}
              ></textarea>
            </div>

            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowAddMilestoneModal(false)}
                className="px-4 py-2 border rounded hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleAddMilestone}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                disabled={!selectedProject || !newMilestone.name || !newMilestone.date}
              >
                Add Milestone
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Task Modal removed - task functionality will be available in future update */}

      {/* Task Details Modal removed - task functionality will be available in future update */}
    </div>
  )
}

export default ProjectTimeline
