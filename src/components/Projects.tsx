"use client"

import React, { useState } from "react"
import {
  Columns,
  Plus,
  FileText,
  CheckCircle,
  Download,
  UploadCloud,
  X,
  Calendar,
  DollarSign,
  Users,
} from "lucide-react"
import { useAppContext } from "@/context/AppContext"
import { formatCurrency, formatNumber } from "@/utils/safeFormatters"
import { useErrorState, handleAsyncOperation, DefaultErrorFallback, createStandardError, FormValidationError } from "@/utils/standardErrorHandling"
import type { Project } from "@/types"
import ProjectListView from "./Projects/ProjectListView"
import ProjectGanttView from "./Projects/ProjectGanttView"

const Projects: React.FC = () => {
  const { state, dispatch } = useAppContext()
  const { clients = [] } = state || {} // Add default empty array if state or clients is undefined

  const [viewMode, setViewMode] = useState<"list" | "gantt">("list")
  const [selectedProject, setSelectedProject] = useState<Project & {
    clientName: string
    clientId: string
    deadline: string
  } | null>(null)
  const [showNewProjectModal, setShowNewProjectModal] = useState(false)
  const [newProject, setNewProject] = useState({
    name: "",
    clientId: "",
    status: "not-started",
    deadline: "",
    budget: "",
    teamMembers: "",
    description: "",
  })
  const [isCreating, setIsCreating] = useState(false)

  // Error handling state
  const { hasError, error, setError, clearError } = useErrorState()

  // Safely extract all projects from clients with null checks
   const allProjects = clients.flatMap((client) =>
     client && client.projects && Array.isArray(client.projects)
       ? client.projects.map((project) => ({
           ...project,
           clientName: client.name || "Unknown Client",
           clientId: client.id,
           deadline: project.endDate || project.startDate,
           // Ensure these properties exist with defaults
           teamMembers: project.teamMembers || [],
           milestones: project.milestones || [],
           documents: project.documents || [],
           progress: project.progress || 0,
           budget: project.budget || 0,
           spent: project.spent || 0,
         }))
       : [],
   )

  const handleNewProjectClick = () => {
    setShowNewProjectModal(true)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setNewProject((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleCreateProject = async () => {
    // Validate required fields
    const errors: FormValidationError[] = []
    if (!newProject.name.trim()) {
      errors.push({ field: 'name', message: 'Project name is required' })
    }
    if (!newProject.clientId) {
      errors.push({ field: 'clientId', message: 'Client selection is required' })
    }
    if (!newProject.deadline) {
      errors.push({ field: 'deadline', message: 'Project deadline is required' })
    }
    
    if (errors.length > 0) {
      setError(createStandardError('Please fix the following errors:', { type: 'validation', context: { validationErrors: errors } }))
      return
    }

    setIsCreating(true)

    // Create new project object
     const projectToAdd = {
       id: Date.now().toString(),
       name: newProject.name,
       description: newProject.description,
       status: newProject.status,
       startDate: new Date().toISOString().split("T")[0],
       endDate: newProject.deadline,
       progress: 0,
       budget: Number.parseFloat(newProject.budget) || 0,
       spent: 0,
       teamMembers: newProject.teamMembers
         .split(",")
         .map((member) => member.trim())
         .filter(Boolean),
      milestones: [
         {
           id: `milestone-${Date.now()}-1`,
           name: "Project Start",
           dueDate: new Date().toISOString().split("T")[0],
           completed: false,
         },
         {
           id: `milestone-${Date.now()}-2`,
           name: "Project Completion",
           dueDate: newProject.deadline,
           completed: false,
         },
       ],
       documents: [],
    }

    // Use handleAsyncOperation for API simulation
    const result = await handleAsyncOperation(async () => {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Add project to client
      dispatch({
        type: "ADD_PROJECT",
        payload: {
          clientId: newProject.clientId,
          project: projectToAdd,
        },
      })
      
      return { projectName: newProject.name }
    }, 'Creating project')

    if (result.error) {
      setError(result.error)
    } else {
      // Show success message
      setError(createStandardError(`Project "${result.data?.projectName}" created successfully!`, { type: 'business', severity: 'low' }))
      
      // Reset form and close modal
      setNewProject({
        name: "",
        clientId: "",
        status: "not-started",
        deadline: "",
        budget: "",
        teamMembers: "",
        description: "",
      })
      setShowNewProjectModal(false)
    }
    
    setIsCreating(false)
  }

  return (
    <div className="p-8">
      {hasError && (
        <DefaultErrorFallback
          error={error!}
          retry={clearError}
        />
      )}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Projects</h2>
        <div className="flex items-center space-x-2">
          <div className="flex border rounded overflow-hidden">
            <button
              onClick={() => setViewMode("list")}
              className={`px-3 py-1 ${viewMode === "list" ? "bg-blue-500 text-white" : "bg-white"}`}
            >
              <Columns size={16} />
            </button>
            <button
              onClick={() => setViewMode("gantt")}
              className={`px-3 py-1 ${viewMode === "gantt" ? "bg-blue-500 text-white" : "bg-white"}`}
            >
              <Columns size={16} />
            </button>
          </div>
          <button
            className="bg-blue-600 text-white px-3 py-1 rounded flex items-center gap-1 hover:bg-blue-700 transition-colors"
            onClick={handleNewProjectClick}
          >
            <Plus size={16} />
            New Project
          </button>
        </div>
      </div>

      {viewMode === "list" ? (
        <ProjectListView
          projects={allProjects}
          onViewDetails={setSelectedProject}
          onAddDocument={(projectId) => alert("Document upload functionality will be implemented soon.")}
        />
      ) : (
        <ProjectGanttView projects={allProjects} />
      )}

      {/* Project Details Modal */}
      {selectedProject && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-full max-w-4xl max-h-screen overflow-y-auto">
            <div className="p-6 border-b bg-gradient-to-r from-blue-500 to-blue-600">
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-bold text-white">{selectedProject.name}</h3>
                <button
                  onClick={() => setSelectedProject(null)}
                  className="text-white hover:text-gray-200 transition-colors"
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <h4 className="font-semibold mb-3">Project Details</h4>
                  <div className="space-y-2 text-sm">
                    <div>
                      Client: <span className="font-medium">{selectedProject.clientName}</span>
                    </div>
                    <div>
                      Status:
                      <span
                        className={`ml-2 px-2 py-0.5 text-xs rounded-full ${
                          selectedProject.status === "in-progress"
                            ? "bg-blue-100 text-blue-800"
                            : selectedProject.status === "completed"
                              ? "bg-green-100 text-green-800"
                              : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {selectedProject.status}
                      </span>
                    </div>
                    <div>
                      Deadline: <span className="font-medium">{selectedProject.deadline}</span>
                    </div>
                    <div>
                      Budget: <span className="font-medium">{formatCurrency(selectedProject.budget)}</span>
                    </div>
                    <div>
                      Spent: <span className="font-medium">{formatCurrency(selectedProject.spent)}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-3">Team Members</h4>
                  <div className="space-y-2">
                    {selectedProject.teamMembers && selectedProject.teamMembers.length > 0 ? (
                      selectedProject.teamMembers.map((member, idx) => (
                        <div key={idx} className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                            {member ? member.charAt(0) : '?'}
                          </div>
                          <div>{member}</div>
                        </div>
                      ))
                    ) : (
                      <div className="text-gray-500">No team members assigned</div>
                    )}
                    <button
                      className="flex items-center gap-1 text-blue-600 text-sm mt-2"
                      onClick={() => alert("Team member functionality will be implemented soon.")}
                    >
                      <Plus size={14} />
                      Add Team Member
                    </button>
                  </div>
                </div>
              </div>

              <div className="mb-6">
                <h4 className="font-semibold mb-3">Milestones</h4>
                <div className="space-y-4">
                  {selectedProject.milestones && selectedProject.milestones.length > 0 ? (
                    selectedProject.milestones.map((milestone, idx) => (
                       <div key={idx} className="flex items-center gap-3">
                         <div
                           className={`w-6 h-6 rounded-full flex items-center justify-center ${
                             milestone.completed
                               ? "bg-green-100 text-green-600"
                               : "bg-gray-100 text-gray-600"
                           }`}
                         >
                           {milestone.completed ? <CheckCircle size={14} /> : idx + 1}
                         </div>
                         <div className="flex-1">
                           <div className="font-medium">{milestone.name}</div>
                           <div className="text-sm text-gray-500">{milestone.dueDate}</div>
                         </div>
                         <select
                           className="border rounded px-2 py-1 text-sm"
                           value={milestone.completed ? "completed" : "not-started"}
                           onChange={() => alert("Status update functionality will be implemented soon.")}
                         >
                           <option value="not-started">Not Started</option>
                           <option value="completed">Completed</option>
                         </select>
                       </div>
                     ))
                  ) : (
                    <div className="text-gray-500">No milestones defined</div>
                  )}
                </div>
              </div>

              <div className="mb-6">
                <h4 className="font-semibold mb-3">Documents</h4>
                <div className="border rounded-lg overflow-hidden">
                  {selectedProject.documents && selectedProject.documents.length > 0 ? (
                     selectedProject.documents.map((doc, idx) => (
                       <div key={idx} className="flex items-center p-3 border-b">
                         <div className="p-2 bg-gray-100 rounded mr-3">
                           <FileText size={18} className="text-blue-600" />
                         </div>
                         <div className="flex-1">
                           <div className="font-medium">{typeof doc === 'string' ? doc : doc.name}</div>
                           <div className="text-xs text-gray-500">Added on {typeof doc === 'string' ? 'May 5, 2025' : doc.uploadDate}</div>
                         </div>
                         <button
                           className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                           onClick={() => alert("Download functionality will be implemented soon.")}
                         >
                           <Download size={16} />
                         </button>
                       </div>
                     ))
                   ) : (
                     <div className="p-3 text-center text-gray-500">No documents attached</div>
                   )}
                  <div className="p-3 flex justify-center">
                    <button
                      className="flex items-center gap-1 text-blue-600 text-sm hover:text-blue-700 transition-colors"
                      onClick={() => alert("Document upload functionality will be implemented soon.")}
                    >
                      <UploadCloud size={14} />
                      Upload Document
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="border-t p-6 flex justify-end gap-2">
              <button
                className="px-4 py-2 border rounded hover:bg-gray-50 transition-colors"
                onClick={() => setSelectedProject(null)}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                onClick={() => {
                  setError(createStandardError('Changes saved successfully!', { type: 'business', severity: 'low' }))
                  setSelectedProject(null)
                }}
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* New Project Modal */}
      {showNewProjectModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b bg-gradient-to-r from-blue-500 to-blue-600">
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-bold text-white">Create New Project</h3>
                <button
                  onClick={() => setShowNewProjectModal(false)}
                  className="text-white hover:text-gray-200 transition-colors"
                  disabled={isCreating}
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Project Name*</label>
                  <input
                    type="text"
                    name="name"
                    value={newProject.name}
                    onChange={handleInputChange}
                    className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter project name"
                    disabled={isCreating}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Client*</label>
                  <select
                    name="clientId"
                    value={newProject.clientId}
                    onChange={handleInputChange}
                    className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    disabled={isCreating}
                    required
                  >
                    <option value="">Select a client</option>
                    {clients && clients.length > 0 ? (
                      clients.map((client) => (
                        <option key={client.id} value={client.id}>
                          {client.name}
                        </option>
                      ))
                    ) : (
                      <option value="" disabled>
                        No clients available
                      </option>
                    )}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <select
                    name="status"
                    value={newProject.status}
                    onChange={handleInputChange}
                    className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    disabled={isCreating}
                  >
                    <option value="not-started">Not Started</option>
                    <option value="in-progress">In Progress</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Deadline*</label>
                  <div className="relative">
                    <input
                      type="date"
                      name="deadline"
                      value={newProject.deadline}
                      onChange={handleInputChange}
                      className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 pl-8"
                      disabled={isCreating}
                      required
                    />
                    <Calendar size={16} className="absolute left-2 top-3 text-gray-400" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Budget</label>
                  <div className="relative">
                    <input
                      type="number"
                      name="budget"
                      value={newProject.budget}
                      onChange={handleInputChange}
                      className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 pl-8"
                      placeholder="0.00"
                      disabled={isCreating}
                    />
                    <DollarSign size={16} className="absolute left-2 top-3 text-gray-400" />
                  </div>
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Team Members</label>
                <div className="relative">
                  <input
                    type="text"
                    name="teamMembers"
                    value={newProject.teamMembers}
                    onChange={handleInputChange}
                    className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 pl-8"
                    placeholder="Enter team members (comma separated)"
                    disabled={isCreating}
                  />
                  <Users size={16} className="absolute left-2 top-3 text-gray-400" />
                </div>
                <p className="text-xs text-gray-500 mt-1">Separate multiple team members with commas</p>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Project Description</label>
                <textarea
                  name="description"
                  value={newProject.description}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={4}
                  placeholder="Enter project description"
                  disabled={isCreating}
                ></textarea>
              </div>

              <div className="flex justify-end gap-2 mt-6">
                <button
                  className="px-4 py-2 border rounded text-gray-700 hover:bg-gray-50 transition-colors"
                  onClick={() => setShowNewProjectModal(false)}
                  disabled={isCreating}
                >
                  Cancel
                </button>
                <button
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors flex items-center gap-1 disabled:opacity-50"
                  onClick={handleCreateProject}
                  disabled={isCreating}
                >
                  {isCreating ? (
                    <>Creating...</>
                  ) : (
                    <>
                      <Plus size={16} />
                      Create Project
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Projects
