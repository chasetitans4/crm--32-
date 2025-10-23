"use client"
import type React from "react"
import { useState } from "react"
import {
  User,
  FileText,
  MessageSquare,
  CheckCircle,
  Clock,
  AlertTriangle,
  Download,
  Upload,
  ThumbsUp,
  ThumbsDown,
  ImageIcon,
  Send,
  Plus,
  Folder,
  Trash2,
} from "lucide-react"
import { useAppContext } from "../context/AppContext"

const ClientPortal: React.FC = () => {
  const { state } = useAppContext()
  const { clients } = state
  const [activeClient, setActiveClient] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState("overview")
  const [showInviteForm, setShowInviteForm] = useState(false)
  const [inviteEmail, setInviteEmail] = useState("")

  // Mock project data
  const projects = [
    {
      id: 1,
      clientId: 1,
      name: "E-commerce Redesign",
      status: "in-progress",
      progress: 65,
      startDate: "2025-05-01",
      deadline: "2025-07-15",
      lastUpdate: "2025-05-10",
      description: "Complete redesign of the e-commerce website with new branding and improved user experience.",
      milestones: [
        { id: 1, name: "Requirements Gathering", status: "completed", date: "2025-05-01" },
        { id: 2, name: "Wireframes", status: "completed", date: "2025-05-20" },
        { id: 3, name: "Design Approval", status: "in-progress", date: "2025-06-10" },
        { id: 4, name: "Development", status: "not-started", date: "2025-06-25" },
        { id: 5, name: "Testing", status: "not-started", date: "2025-07-05" },
        { id: 6, name: "Launch", status: "not-started", date: "2025-07-15" },
      ],
      designs: [
        {
          id: 1,
          name: "Homepage Design",
          version: "v2",
          date: "2025-05-15",
          status: "approved",
          thumbnail: "/website-design-concept.png",
        },
        {
          id: 2,
          name: "Product Page Design",
          version: "v1",
          date: "2025-05-18",
          status: "pending",
          thumbnail: "/placeholder.svg?key=0tomr",
        },
        {
          id: 3,
          name: "Checkout Flow",
          version: "v1",
          date: "2025-05-20",
          status: "pending",
          thumbnail: "/modern-checkout-page.png",
        },
      ],
      messages: [
        {
          id: 1,
          sender: "John Smith",
          date: "2025-05-08",
          content: "The wireframes look great! I have a few minor suggestions for the homepage layout.",
        },
        {
          id: 2,
          sender: "Your Web Dev Company",
          date: "2025-05-09",
          content:
            "Thanks for the feedback! We've updated the wireframes based on your suggestions. Please take a look at the latest version.",
        },
        {
          id: 3,
          sender: "John Smith",
          date: "2025-05-10",
          content: "Perfect! Let's move forward with the design phase.",
        },
      ],
      contentNeeded: [
        { id: 1, name: "About Us Content", status: "pending", dueDate: "2025-05-20" },
        { id: 2, name: "Product Descriptions", status: "pending", dueDate: "2025-05-25" },
        { id: 3, name: "Team Photos", status: "completed", dueDate: "2025-05-15" },
      ],
      files: [
        { id: 1, name: "Project Brief.pdf", type: "document", size: "2.5 MB", date: "2025-05-05" },
        { id: 2, name: "Images.zip", type: "archive", size: "15 MB", date: "2025-05-12" },
      ],
    },
    {
      id: 2,
      clientId: 3,
      name: "Corporate Website Rebuild",
      status: "in-progress",
      progress: 30,
      startDate: "2025-04-15",
      deadline: "2025-08-30",
      lastUpdate: "2025-05-06",
      description: "Complete rebuild of the corporate website with modern design and improved functionality.",
      milestones: [
        { id: 1, name: "Requirements Gathering", status: "completed", date: "2025-04-15" },
        { id: 2, name: "Wireframes", status: "completed", date: "2025-05-01" },
        { id: 3, name: "Design Approval", status: "completed", date: "2025-05-20" },
        { id: 4, name: "Development", status: "in-progress", date: "2025-07-15" },
        { id: 5, name: "Testing", status: "not-started", date: "2025-08-15" },
        { id: 6, name: "Launch", status: "not-started", date: "2025-08-30" },
      ],
      designs: [
        {
          id: 1,
          name: "Homepage Design",
          version: "v3",
          date: "2025-05-10",
          status: "approved",
          thumbnail: "/corporate-website.png",
        },
        {
          id: 2,
          name: "Services Page",
          version: "v2",
          date: "2025-05-12",
          status: "approved",
          thumbnail: "/placeholder.svg?key=pjz5q",
        },
        {
          id: 3,
          name: "Contact Page",
          version: "v1",
          date: "2025-05-15",
          status: "pending",
          thumbnail: "/contact-page.png",
        },
      ],
      messages: [
        {
          id: 1,
          sender: "Michael Chen",
          date: "2025-05-03",
          content: "The design concepts look great! I especially like option #2.",
        },
        {
          id: 2,
          sender: "Your Web Dev Company",
          date: "2025-05-04",
          content: "Glad you like it! We'll proceed with option #2 for the final design.",
        },
        {
          id: 3,
          sender: "Your Web Dev Company",
          date: "2025-05-06",
          content: "We've sent the weekly progress report. Development is now underway.",
        },
      ],
      contentNeeded: [
        { id: 1, name: "Company History", status: "completed", dueDate: "2025-04-30" },
        { id: 2, name: "Team Bios", status: "pending", dueDate: "2025-05-15" },
        { id: 3, name: "Service Descriptions", status: "pending", dueDate: "2025-05-20" },
      ],
      files: [
        { id: 3, name: "Sitemap.txt", type: "document", size: "10 KB", date: "2025-04-28" },
        { id: 4, name: "Brand Guidelines.pdf", type: "document", size: "3 MB", date: "2025-05-02" },
      ],
    },
  ]

  // Get client and their projects
  const client = clients.find((c) => c.id === activeClient)
  const clientProjects = projects.filter((p) => activeClient !== null && p.clientId === parseInt(activeClient))

  // Handle client invitation
  const handleInviteClient = (e: React.FormEvent) => {
    e.preventDefault()
    // In a real app, this would send an invitation email
    alert(`Invitation sent to ${inviteEmail}`)
    setInviteEmail("")
    setShowInviteForm(false)
  }

  // Handle design feedback
  const handleDesignFeedback = (designId: number, approved: boolean) => {
    // In a real app, this would update the design status
    alert(`Design ${approved ? "approved" : "rejected"} with feedback`)
  }

  // Handle content upload
  const handleContentUpload = (contentId: number) => {
    // In a real app, this would handle file upload
    alert("Content uploaded successfully")
  }

  // Add a function to handle sending a message
  const [newMessage, setNewMessage] = useState("")
  const handleSendMessage = () => {
    if (!newMessage.trim()) return
    alert(`Message sent: ${newMessage}`)
    setNewMessage("")
    // In a real app, this would add the message to the conversation
  }

  // Add a function to handle file uploads
  const handleFileUpload = (type: string) => {
    alert(`Uploading ${type}...`)
    // In a real app, this would open a file picker
  }

  // Add a function to handle viewing full-size designs
  const viewFullSizeDesign = (designId: number) => {
    alert(`Opening full-size design #${designId}`)
    // In a real app, this would open the design in a modal or new tab
  }

  // Function to handle file downloads
  const handleFileDownload = (fileId: number) => {
    alert(`Downloading file #${fileId}...`)
    // In a real app, this would trigger a file download
  }

  // Function to handle file deletion
  const handleFileDelete = (fileId: number) => {
    alert(`Deleting file #${fileId}...`)
    // In a real app, this would delete the file
  }

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Client Portal</h2>
        <div className="flex gap-2">
          <button
            className="px-4 py-2 border rounded hover:bg-gray-50 flex items-center gap-2"
            onClick={() => setShowInviteForm(true)}
          >
            <Plus size={16} />
            Invite Client
          </button>
        </div>
      </div>

      {showInviteForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-full max-w-md p-6">
            <h3 className="text-lg font-bold mb-4">Invite Client to Portal</h3>
            <form onSubmit={handleInviteClient}>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">Client Email</label>
                <input
                  type="email"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  className="w-full border rounded px-3 py-2"
                  placeholder="client@example.com"
                  required
                />
              </div>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowInviteForm(false)}
                  className="px-4 py-2 border rounded hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
                  Send Invitation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Client list sidebar */}
        <div className="bg-white rounded-lg shadow p-4">
          <h3 className="text-lg font-semibold mb-4">Clients</h3>
          <div className="space-y-2">
            {clients.map((client) => (
              <div
                key={client.id}
                className={`p-3 border rounded cursor-pointer ${
                  activeClient === client.id ? "border-blue-500 bg-blue-50" : "hover:bg-gray-50"
                }`}
                onClick={() => setActiveClient(client.id)}
              >
                <div className="flex items-center gap-2">
                  <User size={16} className="text-gray-400" />
                  <div className="font-medium">{client.name}</div>
                </div>
                <div className="text-sm text-gray-500 mt-1">{client.email}</div>
                <div className="flex items-center gap-1 mt-1">
                  <div
                    className={`w-2 h-2 rounded-full ${
                      client.portal?.status === "active" ? "bg-green-500" : "bg-gray-300"
                    }`}
                  ></div>
                  <span className="text-xs text-gray-500">
                    {client.portal?.status === "active" ? "Active" : "Inactive"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Main content area */}
        <div className="bg-white rounded-lg shadow p-6 md:col-span-3">
          {activeClient && client ? (
            <>
              <div className="flex justify-between items-center mb-6 pb-4 border-b">
                <div>
                  <h2 className="text-2xl font-bold">{client.name}</h2>
                  <p className="text-gray-500">
                    {client.email} • {client.phone}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className={`px-2 py-1 text-xs rounded-full ${
                      client.portal?.status === "active" ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {client.portal?.status === "active" ? "Portal Active" : "Portal Inactive"}
                  </span>
                  {client.portal?.status === "active" && (
                    <span className="text-xs text-gray-500">Last login: {client.portal?.lastLogin}</span>
                  )}
                </div>
              </div>

              <div className="mb-6">
                <div className="flex border-b">
                  <button
                    onClick={() => setActiveTab("overview")}
                    className={`px-4 py-2 ${activeTab === "overview" ? "border-b-2 border-blue-500 text-blue-600" : "text-gray-500"}`}
                  >
                    Overview
                  </button>
                  <button
                    onClick={() => setActiveTab("projects")}
                    className={`px-4 py-2 ${activeTab === "projects" ? "border-b-2 border-blue-500 text-blue-600" : "text-gray-500"}`}
                  >
                    Projects
                  </button>
                  <button
                    onClick={() => setActiveTab("designs")}
                    className={`px-4 py-2 ${activeTab === "designs" ? "border-b-2 border-blue-500 text-blue-600" : "text-gray-500"}`}
                  >
                    Design Approvals
                  </button>
                  <button
                    onClick={() => setActiveTab("content")}
                    className={`px-4 py-2 ${activeTab === "content" ? "border-b-2 border-blue-500 text-blue-600" : "text-gray-500"}`}
                  >
                    Content Needed
                  </button>
                  <button
                    onClick={() => setActiveTab("messages")}
                    className={`px-4 py-2 ${activeTab === "messages" ? "border-b-2 border-blue-500 text-blue-600" : "text-gray-500"}`}
                  >
                    Messages
                  </button>
                  <button
                    onClick={() => setActiveTab("files")}
                    className={`px-4 py-2 ${activeTab === "files" ? "border-b-2 border-blue-500 text-blue-600" : "text-gray-500"}`}
                  >
                    Files
                  </button>
                </div>
              </div>

              {activeTab === "overview" && (
                <div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <h3 className="font-medium mb-1">Active Projects</h3>
                      <p className="text-2xl font-bold">{clientProjects.length}</p>
                    </div>
                    <div className="bg-yellow-50 p-4 rounded-lg">
                      <h3 className="font-medium mb-1">Pending Approvals</h3>
                      <p className="text-2xl font-bold">
                        {clientProjects.reduce(
                          (count, project) => count + project.designs.filter((d) => d.status === "pending").length,
                          0,
                        )}
                      </p>
                    </div>
                    <div className="bg-red-50 p-4 rounded-lg">
                      <h3 className="font-medium mb-1">Content Needed</h3>
                      <p className="text-2xl font-bold">
                        {clientProjects.reduce(
                          (count, project) =>
                            count + project.contentNeeded.filter((c) => c.status === "pending").length,
                          0,
                        )}
                      </p>
                    </div>
                  </div>

                  <h3 className="text-lg font-semibold mb-3">Project Status</h3>
                  {clientProjects.length > 0 ? (
                    <div className="space-y-4">
                      {clientProjects.map((project) => (
                        <div key={project.id} className="border rounded-lg p-4">
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <h4 className="font-medium">{project.name}</h4>
                              <p className="text-sm text-gray-500">Deadline: {project.deadline}</p>
                            </div>
                            <span
                              className={`px-2 py-1 text-xs rounded-full ${
                                project.status === "in-progress"
                                  ? "bg-blue-100 text-blue-800"
                                  : project.status === "completed"
                                    ? "bg-green-100 text-green-800"
                                    : "bg-gray-100 text-gray-800"
                              }`}
                            >
                              {project.status === "in-progress"
                                ? "In Progress"
                                : project.status === "completed"
                                  ? "Completed"
                                  : "Not Started"}
                            </span>
                          </div>
                          <div className="mb-2">
                            <div className="flex justify-between text-xs mb-1">
                              <span>Progress</span>
                              <span>{project.progress}%</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div
                                className="bg-blue-600 h-2 rounded-full"
                                style={{ width: `${project.progress}%` }}
                              ></div>
                            </div>
                          </div>
                          <div className="text-sm">
                            <p className="text-gray-600">Last updated: {project.lastUpdate}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">No active projects for this client.</div>
                  )}

                  <h3 className="text-lg font-semibold mb-3 mt-6">Recent Activity</h3>
                  <div className="space-y-3">
                    {clientProjects.flatMap((project) =>
                      project.messages.slice(0, 2).map((message) => (
                        <div key={message.id} className="flex items-start gap-3 p-3 border rounded-lg">
                          <MessageSquare size={16} className="text-blue-600 mt-1" />
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-medium">{message.sender}</span>
                              <span className="text-xs text-gray-500">{message.date}</span>
                            </div>
                            <p className="text-sm mt-1">{message.content}</p>
                          </div>
                        </div>
                      )),
                    )}
                  </div>
                </div>
              )}

              {activeTab === "projects" && (
                <div>
                  <h3 className="text-lg font-semibold mb-4">Projects</h3>
                  {clientProjects.length > 0 ? (
                    <div className="space-y-6">
                      {clientProjects.map((project) => (
                        <div key={project.id} className="border rounded-lg overflow-hidden">
                          <div className="bg-gray-50 p-4">
                            <div className="flex justify-between items-start">
                              <div>
                                <h4 className="text-lg font-medium">{project.name}</h4>
                                <p className="text-sm text-gray-500">
                                  Started: {project.startDate} • Deadline: {project.deadline}
                                </p>
                              </div>
                              <span
                                className={`px-2 py-1 text-xs rounded-full ${
                                  project.status === "in-progress"
                                    ? "bg-blue-100 text-blue-800"
                                    : project.status === "completed"
                                      ? "bg-green-100 text-green-800"
                                      : "bg-gray-100 text-gray-800"
                                }`}
                              >
                                {project.status === "in-progress"
                                  ? "In Progress"
                                  : project.status === "completed"
                                    ? "Completed"
                                    : "Not Started"}
                              </span>
                            </div>
                            <div className="mt-3">
                              <div className="flex justify-between text-xs mb-1">
                                <span>Progress</span>
                                <span>{project.progress}%</span>
                              </div>
                              <div className="w-full bg-gray-200 rounded-full h-2">
                                <div
                                  className="bg-blue-600 h-2 rounded-full"
                                  style={{ width: `${project.progress}%` }}
                                ></div>
                              </div>
                            </div>
                          </div>
                          <div className="p-4">
                            <p className="mb-4">{project.description}</p>
                            <h5 className="font-medium mb-2">Project Milestones</h5>
                            <div className="space-y-2 mb-4">
                              {project.milestones.map((milestone) => (
                                <div key={milestone.id} className="flex items-center gap-3">
                                  <div
                                    className={`w-6 h-6 rounded-full flex items-center justify-center ${
                                      milestone.status === "completed"
                                        ? "bg-green-100 text-green-600"
                                        : milestone.status === "in-progress"
                                          ? "bg-blue-100 text-blue-600"
                                          : "bg-gray-100 text-gray-600"
                                    }`}
                                  >
                                    {milestone.status === "completed" ? (
                                      <CheckCircle size={14} />
                                    ) : milestone.status === "in-progress" ? (
                                      <Clock size={14} />
                                    ) : (
                                      <AlertTriangle size={14} />
                                    )}
                                  </div>
                                  <div className="flex-1">
                                    <div className="font-medium">{milestone.name}</div>
                                    <div className="text-sm text-gray-500">{milestone.date}</div>
                                  </div>
                                  <div>
                                    <span
                                      className={`text-xs px-2 py-1 rounded-full ${
                                        milestone.status === "completed"
                                          ? "bg-green-100 text-green-800"
                                          : milestone.status === "in-progress"
                                            ? "bg-blue-100 text-blue-800"
                                            : "bg-gray-100 text-gray-800"
                                      }`}
                                    >
                                      {milestone.status === "completed"
                                        ? "Completed"
                                        : milestone.status === "in-progress"
                                          ? "In Progress"
                                          : "Not Started"}
                                    </span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">No projects found for this client.</div>
                  )}
                </div>
              )}

              {activeTab === "designs" && (
                <div>
                  <h3 className="text-lg font-semibold mb-4">Design Approvals</h3>
                  {clientProjects.flatMap((project) => project.designs).length > 0 ? (
                    <div className="space-y-6">
                      {clientProjects.map((project) => (
                        <div key={project.id}>
                          <h4 className="font-medium mb-3">{project.name}</h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {project.designs.map((design) => (
                              <div key={design.id} className="border rounded-lg overflow-hidden">
                                <div className="h-32 bg-gray-100 relative">
                                  <img
                                    src={design.thumbnail || "/placeholder.svg"}
                                    alt={design.name}
                                    className="w-full h-full object-cover"
                                  />
                                  <div className="absolute top-2 right-2">
                                    <span
                                      className={`text-xs px-2 py-1 rounded-full ${
                                        design.status === "approved"
                                          ? "bg-green-100 text-green-800"
                                          : "bg-yellow-100 text-yellow-800"
                                      }`}
                                    >
                                      {design.status === "approved" ? "Approved" : "Pending Approval"}
                                    </span>
                                  </div>
                                </div>
                                <div className="p-3">
                                  <div className="font-medium">{design.name}</div>
                                  <div className="text-sm text-gray-500">
                                    {design.version} • {design.date}
                                  </div>
                                  <div className="flex justify-between mt-3">
                                    <button
                                      className="text-blue-600 text-sm flex items-center gap-1"
                                      onClick={() => viewFullSizeDesign(design.id)}
                                    >
                                      <Download size={14} />
                                      View Full Size
                                    </button>
                                    {design.status === "pending" && (
                                      <div className="flex gap-1">
                                        <button
                                          onClick={() => handleDesignFeedback(design.id, true)}
                                          className="p-1 bg-green-100 text-green-600 rounded"
                                          title="Approve"
                                        >
                                          <ThumbsUp size={14} />
                                        </button>
                                        <button
                                          onClick={() => handleDesignFeedback(design.id, false)}
                                          className="p-1 bg-red-100 text-red-600 rounded"
                                          title="Request Changes"
                                        >
                                          <ThumbsDown size={14} />
                                        </button>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">No designs waiting for approval.</div>
                  )}
                </div>
              )}

              {activeTab === "content" && (
                <div>
                  <h3 className="text-lg font-semibold mb-4">Content Needed</h3>
                  {clientProjects.flatMap((project) => project.contentNeeded).length > 0 ? (
                    <div className="space-y-6">
                      {clientProjects.map((project) => (
                        <div key={project.id}>
                          <h4 className="font-medium mb-3">{project.name}</h4>
                          <div className="border rounded-lg overflow-hidden">
                            <table className="min-w-full divide-y divide-gray-200">
                              <thead className="bg-gray-50">
                                <tr>
                                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Content Item
                                  </th>
                                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Due Date
                                  </th>
                                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Status
                                  </th>
                                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Action
                                  </th>
                                </tr>
                              </thead>
                              <tbody className="bg-white divide-y divide-gray-200">
                                {project.contentNeeded.map((content) => (
                                  <tr key={content.id}>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                      <div className="font-medium">{content.name}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                      {content.dueDate}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                      <span
                                        className={`px-2 py-1 text-xs rounded-full ${
                                          content.status === "completed"
                                            ? "bg-green-100 text-green-800"
                                            : "bg-yellow-100 text-yellow-800"
                                        }`}
                                      >
                                        {content.status === "completed" ? "Completed" : "Pending"}
                                      </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                      {content.status === "pending" ? (
                                        <button
                                          onClick={() => handleContentUpload(content.id)}
                                          className="text-blue-600 text-sm flex items-center gap-1"
                                        >
                                          <Upload size={14} />
                                          Upload
                                        </button>
                                      ) : (
                                        <span className="text-green-600 text-sm flex items-center gap-1">
                                          <CheckCircle size={14} />
                                          Completed
                                        </span>
                                      )}
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">No content items needed at this time.</div>
                  )}
                </div>
              )}

              {activeTab === "messages" && (
                <div>
                  <h3 className="text-lg font-semibold mb-4">Messages</h3>
                  <div className="border rounded-lg overflow-hidden">
                    <div className="h-96 p-4 overflow-y-auto border-b">
                      {clientProjects.flatMap((project) => project.messages).length > 0 ? (
                        <div className="space-y-4">
                          {clientProjects.flatMap((project) =>
                            project.messages.map((message) => (
                              <div
                                key={message.id}
                                className={`flex ${message.sender === "Your Web Dev Company" ? "justify-end" : ""}`}
                              >
                                <div
                                  className={`max-w-3/4 p-3 rounded-lg ${
                                    message.sender === "Your Web Dev Company"
                                      ? "bg-blue-100 text-blue-800"
                                      : "bg-gray-100"
                                  }`}
                                >
                                  <div className="flex items-center gap-2 mb-1">
                                    <span className="font-medium">{message.sender}</span>
                                    <span className="text-xs text-gray-500">{message.date}</span>
                                  </div>
                                  <p>{message.content}</p>
                                </div>
                              </div>
                            )),
                          )}
                        </div>
                      ) : (
                        <div className="text-center py-8 text-gray-500">No messages yet.</div>
                      )}
                    </div>
                    <div className="p-4">
                      <div className="flex gap-2">
                        <input
                          type="text"
                          className="flex-1 border rounded px-3 py-2"
                          placeholder="Type your message..."
                          value={newMessage}
                          onChange={(e) => setNewMessage(e.target.value)}
                          onKeyPress={(e) => {
                            if (e.key === "Enter") {
                              handleSendMessage()
                            }
                          }}
                        />
                        <button
                          className="p-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                          onClick={handleSendMessage}
                        >
                          <Send size={16} />
                        </button>
                      </div>
                      <div className="flex gap-2 mt-2">
                        <button
                          className="p-2 border rounded hover:bg-gray-50"
                          onClick={() => handleFileUpload("image")}
                        >
                          <ImageIcon size={16} />
                        </button>
                        <button
                          className="p-2 border rounded hover:bg-gray-50"
                          onClick={() => handleFileUpload("document")}
                        >
                          <FileText size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "files" && (
                <div>
                  <h3 className="text-lg font-semibold mb-4">Files</h3>
                  {clientProjects.flatMap((project) => project.files).length > 0 ? (
                    <div className="space-y-6">
                      {clientProjects.map((project) => (
                        <div key={project.id}>
                          <h4 className="font-medium mb-3">{project.name}</h4>
                          <div className="border rounded-lg overflow-hidden">
                            <table className="min-w-full divide-y divide-gray-200">
                              <thead className="bg-gray-50">
                                <tr>
                                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    File Name
                                  </th>
                                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Type
                                  </th>
                                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Size
                                  </th>
                                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Date
                                  </th>
                                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Actions
                                  </th>
                                </tr>
                              </thead>
                              <tbody className="bg-white divide-y divide-gray-200">
                                {project.files.map((file) => (
                                  <tr key={file.id}>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                      <div className="flex items-center gap-2">
                                        <Folder size={16} className="text-gray-500" />
                                        <div className="font-medium">{file.name}</div>
                                      </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{file.type}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{file.size}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{file.date}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right">
                                      <div className="flex justify-end gap-2">
                                        <button
                                          onClick={() => handleFileDownload(file.id)}
                                          className="text-blue-600 text-sm flex items-center gap-1"
                                        >
                                          <Download size={14} />
                                          Download
                                        </button>
                                        <button
                                          onClick={() => handleFileDelete(file.id)}
                                          className="text-red-600 text-sm flex items-center gap-1"
                                        >
                                          <Trash2 size={14} />
                                          Delete
                                        </button>
                                      </div>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">No files uploaded yet.</div>
                  )}
                  <div className="mt-4">
                    <button
                      className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center gap-2"
                      onClick={() => handleFileUpload("file")}
                    >
                      <Upload size={16} />
                      Upload File
                    </button>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-12 text-gray-500">
              <User size={48} className="mx-auto mb-4 text-gray-300" />
              <p className="text-lg">Select a client to view their portal</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default ClientPortal
