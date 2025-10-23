"use client"

import React, { useState, useRef, useEffect } from "react"
import { Clock, Download, Eye, X, TrendingUp, Star, Search, Plus } from "lucide-react"
import { useAppContext } from "../context/AppContext"

interface Client {
  id: string
  name: string
  email: string
  phone: string
  company: string
  address: string
  projects: Project[]
}

interface Project {
  id: string
  name: string
  status: "active" | "completed" | "pending"
  progress: number
  startDate: string
  endDate: string
  milestones: Milestone[]
}

interface Milestone {
  id: string
  name: string
  dueDate: string
  status: "complete" | "incomplete"
}

interface Message {
  id: string
  sender: "client" | "you"
  text: string
  timestamp: string
}

interface File {
  id: string
  name: string
  type: string
  size: number
  uploadDate: string
}

interface Invoice {
  id: string
  amount: number
  dueDate: string
  status: "paid" | "unpaid" | "overdue"
}

const EnhancedClientDashboard = () => {
  const { state } = useAppContext()
  const [selectedClient, setSelectedClient] = useState<Client | null>(null)
  const [activeTab, setActiveTab] = useState("overview")
  const [searchTerm, setSearchTerm] = useState("")
  const [sortColumn, setSortColumn] = useState("")
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc")
  const [isGridView, setIsGridView] = useState(true)

  const dummyClients: Client[] = [
    {
      id: "1",
      name: "Acme Corp",
      email: "info@acme.com",
      phone: "555-123-4567",
      company: "Acme Corporation",
      address: "123 Main St",
      projects: [
        {
          id: "101",
          name: "Website Redesign",
          status: "active",
          progress: 60,
          startDate: "2023-01-15",
          endDate: "2023-06-30",
          milestones: [
            { id: "101-1", name: "Design Mockups", dueDate: "2023-02-15", status: "complete" },
            { id: "101-2", name: "Frontend Development", dueDate: "2023-04-30", status: "complete" },
            { id: "101-3", name: "Backend Development", dueDate: "2023-05-31", status: "incomplete" },
          ],
        },
        {
          id: "102",
          name: "Mobile App Development",
          status: "pending",
          progress: 20,
          startDate: "2023-03-01",
          endDate: "2023-09-30",
          milestones: [
            { id: "102-1", name: "Requirements Gathering", dueDate: "2023-03-15", status: "complete" },
            { id: "102-2", name: "UI/UX Design", dueDate: "2023-04-30", status: "incomplete" },
            { id: "102-3", name: "Development", dueDate: "2023-07-31", status: "incomplete" },
          ],
        },
      ],
    },
    {
      id: "2",
      name: "Beta Industries",
      email: "contact@beta.net",
      phone: "555-987-6543",
      company: "Beta Industries",
      address: "456 Oak Ave",
      projects: [
        {
          id: "201",
          name: "Marketing Campaign",
          status: "completed",
          progress: 100,
          startDate: "2022-11-01",
          endDate: "2023-01-31",
          milestones: [
            { id: "201-1", name: "Market Research", dueDate: "2022-11-15", status: "complete" },
            { id: "201-2", name: "Ad Creation", dueDate: "2022-12-15", status: "complete" },
            { id: "201-3", name: "Campaign Launch", dueDate: "2023-01-15", status: "complete" },
          ],
        },
      ],
    },
  ]

  const dummyMessages: Message[] = [
    { id: "m1", sender: "client", text: "Hi, how is the project going?", timestamp: "2023-10-26 10:00" },
    {
      id: "m2",
      sender: "you",
      text: "It is progressing well. We expect to complete the next milestone by next week.",
      timestamp: "2023-10-26 10:15",
    },
    { id: "m3", sender: "client", text: "Great to hear!", timestamp: "2023-10-26 10:20" },
  ]

  const dummyFiles: File[] = [
    { id: "f1", name: "Project_Proposal.pdf", type: "pdf", size: 2.5, uploadDate: "2023-10-20" },
    { id: "f2", name: "Design_Mockups.zip", type: "zip", size: 15.2, uploadDate: "2023-10-22" },
  ]

  const dummyInvoices: Invoice[] = [
    { id: "i1", amount: 5000, dueDate: "2023-11-01", status: "unpaid" },
    { id: "i2", amount: 2500, dueDate: "2023-10-01", status: "paid" },
  ]

  const [clients, setClients] = useState<Client[]>(dummyClients)
  const [messages, setMessages] = useState<Message[]>(dummyMessages)
  const [files, setFiles] = useState<File[]>(dummyFiles)
  const [invoices, setInvoices] = useState<Invoice[]>(dummyInvoices)
  const messageInputRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    if (clients.length > 0) {
      setSelectedClient(clients[0])
    }
  }, [clients])

  const handleClientSelect = (client: Client) => {
    setSelectedClient(client)
  }

  const handleTabChange = (tab: string) => {
    setActiveTab(tab)
  }

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value)
  }

  const handleSort = (column: string) => {
    if (column === sortColumn) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      setSortColumn(column)
      setSortDirection("asc")
    }
  }

  const handleSendMessage = () => {
    if (messageInputRef.current && messageInputRef.current.value.trim() !== "") {
      const newMessage: Message = {
        id: String(messages.length + 1),
        sender: "you",
        text: messageInputRef.current.value,
        timestamp: new Date().toISOString(),
      }
      setMessages([...messages, newMessage])
      messageInputRef.current.value = ""
    }
  }

  const filteredClients = clients.filter((client) => client.name.toLowerCase().includes(searchTerm.toLowerCase()))

  const sortedClients = [...filteredClients].sort((a, b) => {
    if (sortColumn) {
      const aValue = a[sortColumn as keyof Client]
      const bValue = b[sortColumn as keyof Client]

      if (typeof aValue === "string" && typeof bValue === "string") {
        return sortDirection === "asc" ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue)
      } else if (typeof aValue === "number" && typeof bValue === "number") {
        return sortDirection === "asc" ? aValue - bValue : bValue - aValue
      }
    }
    return 0
  })

  const toggleView = () => {
    setIsGridView(!isGridView)
  }

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Client Selection Sidebar */}
      <aside className="w-64 bg-gray-200 p-4">
        <div className="mb-4">
          <div className="relative">
            <input
              type="search"
              placeholder="Search clients..."
              className="w-full px-4 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
              onChange={handleSearchChange}
            />
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
          </div>
        </div>
        <ul>
          {sortedClients.map((client) => (
            <li
              key={client.id}
              className={`p-2 rounded-md cursor-pointer hover:bg-gray-300 ${
                selectedClient?.id === client.id ? "bg-blue-100" : ""
              }`}
              onClick={() => handleClientSelect(client)}
            >
              {client.name}
            </li>
          ))}
        </ul>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-4">
        {selectedClient ? (
          <div>
            {/* Client Header */}
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-2xl font-semibold">{selectedClient.name}</h2>
                <p className="text-gray-500">{selectedClient.company}</p>
              </div>
              <div>
                <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
                  <Plus className="inline-block mr-2" size={16} />
                  New Project
                </button>
              </div>
            </div>

            {/* Tab Navigation */}
            <nav className="mb-4">
              <ul className="flex space-x-4">
                <li
                  className={`cursor-pointer ${activeTab === "overview" ? "text-blue-500 font-semibold" : "text-gray-500"}`}
                  onClick={() => handleTabChange("overview")}
                >
                  Overview
                </li>
                <li
                  className={`cursor-pointer ${activeTab === "projects" ? "text-blue-500 font-semibold" : "text-gray-500"}`}
                  onClick={() => handleTabChange("projects")}
                >
                  Projects
                </li>
                <li
                  className={`cursor-pointer ${activeTab === "messages" ? "text-blue-500 font-semibold" : "text-gray-500"}`}
                  onClick={() => handleTabChange("messages")}
                >
                  Messages
                </li>
                <li
                  className={`cursor-pointer ${activeTab === "files" ? "text-blue-500 font-semibold" : "text-gray-500"}`}
                  onClick={() => handleTabChange("files")}
                >
                  Files
                </li>
                <li
                  className={`cursor-pointer ${activeTab === "invoices" ? "text-blue-500 font-semibold" : "text-gray-500"}`}
                  onClick={() => handleTabChange("invoices")}
                >
                  Invoices
                </li>
                <li
                  className={`cursor-pointer ${activeTab === "analytics" ? "text-blue-500 font-semibold" : "text-gray-500"}`}
                  onClick={() => handleTabChange("analytics")}
                >
                  Analytics
                </li>
              </ul>
            </nav>

            {/* Tab Content */}
            <div className="bg-white rounded-md shadow-md p-4">
              {activeTab === "overview" && (
                <div>
                  <h3 className="text-lg font-semibold mb-2">Overview</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div className="bg-gray-100 p-4 rounded-md">
                      <p className="text-gray-500">Total Projects</p>
                      <p className="text-2xl font-bold">{selectedClient.projects.length}</p>
                    </div>
                    <div className="bg-gray-100 p-4 rounded-md">
                      <p className="text-gray-500">Active Projects</p>
                      <p className="text-2xl font-bold">
                        {selectedClient.projects.filter((p) => p.status === "active").length}
                      </p>
                    </div>
                    <div className="bg-gray-100 p-4 rounded-md">
                      <p className="text-gray-500">Pending Projects</p>
                      <p className="text-2xl font-bold">
                        {selectedClient.projects.filter((p) => p.status === "pending").length}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "projects" && (
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold">Projects</h3>
                    <div>
                      <button
                        className={`px-4 py-2 rounded-md ${
                          isGridView
                            ? "bg-blue-500 text-white hover:bg-blue-700"
                            : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                        }`}
                        onClick={toggleView}
                      >
                        {isGridView ? "Grid View" : "List View"}
                      </button>
                    </div>
                  </div>

                  {isGridView ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {selectedClient.projects.map((project) => (
                        <div key={project.id} className="bg-gray-100 p-4 rounded-md">
                          <h4 className="font-semibold">{project.name}</h4>
                          <p className="text-gray-500">Status: {project.status}</p>
                          <div className="flex items-center space-x-2">
                            <p className="text-sm">Progress:</p>
                            <div className="w-full bg-gray-300 rounded-full h-2.5">
                              <div
                                className="bg-blue-600 h-2.5 rounded-full"
                                style={{ width: `${project.progress}%` }}
                              ></div>
                            </div>
                            <p className="text-sm">{project.progress}%</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="min-w-full leading-normal">
                        <thead>
                          <tr>
                            <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                              Name
                            </th>
                            <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                              Status
                            </th>
                            <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                              Progress
                            </th>
                            <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                              Start Date
                            </th>
                            <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                              End Date
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {selectedClient.projects.map((project) => (
                            <tr key={project.id}>
                              <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                                <p className="text-gray-900 whitespace-no-wrap">{project.name}</p>
                              </td>
                              <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                                <span className="relative inline-block px-3 py-1 font-semibold text-green-900 leading-tight">
                                  <span
                                    aria-hidden
                                    className="absolute inset-0 bg-green-200 opacity-50 rounded-full"
                                  ></span>
                                  <span className="relative">{project.status}</span>
                                </span>
                              </td>
                              <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                                <div className="flex items-center">
                                  <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
                                    <div
                                      className="bg-green-600 h-2.5 rounded-full"
                                      style={{ width: `${project.progress}%` }}
                                    ></div>
                                  </div>
                                  <span className="ml-2 text-gray-900">{project.progress}%</span>
                                </div>
                              </td>
                              <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                                <p className="text-gray-900 whitespace-no-wrap">{project.startDate}</p>
                              </td>
                              <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                                <p className="text-gray-900 whitespace-no-wrap">{project.endDate}</p>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}

              {activeTab === "messages" && (
                <div>
                  <h3 className="text-lg font-semibold mb-2">Messages</h3>
                  <div className="space-y-2">
                    {messages.map((message) => (
                      <div
                        key={message.id}
                        className={`p-3 rounded-md ${
                          message.sender === "you" ? "bg-blue-100 ml-auto w-fit" : "bg-gray-100 mr-auto w-fit"
                        }`}
                      >
                        <p className="text-sm">{message.text}</p>
                        <p className="text-xs text-gray-500">{message.timestamp}</p>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4">
                    <textarea
                      ref={messageInputRef}
                      placeholder="Type your message..."
                      className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                      className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mt-2"
                      onClick={handleSendMessage}
                    >
                      Send
                    </button>
                  </div>
                </div>
              )}

              {activeTab === "files" && (
                <div>
                  <h3 className="text-lg font-semibold mb-2">Files</h3>
                  <div className="overflow-x-auto">
                    <table className="min-w-full leading-normal">
                      <thead>
                        <tr>
                          <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                            Name
                          </th>
                          <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                            Type
                          </th>
                          <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                            Size
                          </th>
                          <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                            Upload Date
                          </th>
                          <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {files.map((file) => (
                          <tr key={file.id}>
                            <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                              <p className="text-gray-900 whitespace-no-wrap">{file.name}</p>
                            </td>
                            <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                              <p className="text-gray-900 whitespace-no-wrap">{file.type}</p>
                            </td>
                            <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                              <p className="text-gray-900 whitespace-no-wrap">{file.size} MB</p>
                            </td>
                            <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                              <p className="text-gray-900 whitespace-no-wrap">{file.uploadDate}</p>
                            </td>
                            <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                              <div className="flex space-x-2">
                                <button className="text-blue-500 hover:text-blue-700">
                                  <Eye className="inline-block" size={16} />
                                </button>
                                <button className="text-green-500 hover:text-green-700">
                                  <Download className="inline-block" size={16} />
                                </button>
                                <button className="text-red-500 hover:text-red-700">
                                  <X className="inline-block" size={16} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {activeTab === "invoices" && (
                <div>
                  <h3 className="text-lg font-semibold mb-2">Invoices</h3>
                  <div className="overflow-x-auto">
                    <table className="min-w-full leading-normal">
                      <thead>
                        <tr>
                          <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                            Amount
                          </th>
                          <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                            Due Date
                          </th>
                          <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                            Status
                          </th>
                          <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {invoices.map((invoice) => (
                          <tr key={invoice.id}>
                            <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                              <p className="text-gray-900 whitespace-no-wrap">${invoice.amount}</p>
                            </td>
                            <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                              <p className="text-gray-900 whitespace-no-wrap">{invoice.dueDate}</p>
                            </td>
                            <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                              <span className="relative inline-block px-3 py-1 font-semibold text-green-900 leading-tight">
                                <span
                                  aria-hidden
                                  className="absolute inset-0 bg-green-200 opacity-50 rounded-full"
                                ></span>
                                <span className="relative">{invoice.status}</span>
                              </span>
                            </td>
                            <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                              <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
                                Pay Now
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {activeTab === "analytics" && (
                <div>
                  <h3 className="text-lg font-semibold mb-2">Analytics</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div className="bg-gray-100 p-4 rounded-md">
                      <p className="text-gray-500">Project Completion Rate</p>
                      <p className="text-2xl font-bold">85%</p>
                      <TrendingUp className="text-green-500" size={32} />
                    </div>
                    <div className="bg-gray-100 p-4 rounded-md">
                      <p className="text-gray-500">Average Invoice Payment Time</p>
                      <p className="text-2xl font-bold">25 Days</p>
                      <Clock className="text-yellow-500" size={32} />
                    </div>
                    <div className="bg-gray-100 p-4 rounded-md">
                      <p className="text-gray-500">Client Satisfaction</p>
                      <p className="text-2xl font-bold">9.2/10</p>
                      <Star className="text-yellow-500" size={32} />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="text-center">
            <p className="text-gray-500">Select a client to view their dashboard.</p>
          </div>
        )}
      </main>
    </div>
  )
}

export default EnhancedClientDashboard
