"use client"

import React, { useState } from "react"
import {
  SettingsIcon,
  Users,
  Shield,
  Globe,
  CreditCard,
  Database,
  Bell,
  Download,
  Key,
  Plus,
  X,
  Eye,
  EyeOff,
  Save,
  Home,
  TrendingUp,
  FolderOpen,
  CheckSquare,
  BarChart3,
  DollarSign,
  Settings,
  LucideUser,
} from "lucide-react"

interface UserType {
  id: number
  name: string
  email: string
  role: string
  status: "active" | "inactive" | "pending"
  lastLogin: string
}

interface CustomField {
  id: number
  name: string
  type: "text" | "number" | "date" | "select"
  required: boolean
  options?: string[]
}

interface ApiKey {
  id: number
  name: string
  key: string
  permissions: string[]
  created: string
  lastUsed: string
  visible: boolean
}

const SettingsComponent: React.FC = () => {
  const [activeSection, setActiveSection] = useState("general")
  const [showAddUserModal, setShowAddUserModal] = useState(false)
  const [showAddFieldModal, setShowAddFieldModal] = useState(false)
  const [showAddApiKeyModal, setShowAddApiKeyModal] = useState(false)

  // State management for roles
  const [roles, setRoles] = useState([
    { id: 1, name: "Admin", description: "Full system access and user management", userCount: 1, isSystem: true },
    { id: 2, name: "Manager", description: "Project management and team oversight", userCount: 1, isSystem: true },
    { id: 3, name: "User", description: "Standard user with project access", userCount: 1, isSystem: true },
    { id: 4, name: "Guest", description: "Limited read-only access", userCount: 0, isSystem: true },
  ])
  const [showAddRoleModal, setShowAddRoleModal] = useState(false)
  const [editingRole, setEditingRole] = useState<any>(null)
  const [newRole, setNewRole] = useState({ name: "", description: "" })

  // Sample data
  const [users, setUsers] = useState<UserType[]>([
    {
      id: 1,
      name: "John Doe",
      email: "john@example.com",
      role: "Admin",
      status: "active",
      lastLogin: "2025-01-30 14:30",
    },
    {
      id: 2,
      name: "Jane Smith",
      email: "jane@example.com",
      role: "Manager",
      status: "active",
      lastLogin: "2025-01-30 09:15",
    },
    {
      id: 3,
      name: "Bob Wilson",
      email: "bob@example.com",
      role: "User",
      status: "pending",
      lastLogin: "Never",
    },
  ])

  const [customFields, setCustomFields] = useState<CustomField[]>([
    { id: 1, name: "Industry", type: "select", required: true, options: ["Technology", "Healthcare", "Finance"] },
    { id: 2, name: "Company Size", type: "number", required: false },
    { id: 3, name: "Contract Date", type: "date", required: true },
  ])

  const [apiKeys, setApiKeys] = useState<ApiKey[]>([
    {
      id: 1,
      name: "Production API",
      key: "[SECURE_KEY_HIDDEN]", // Security: Never expose real API keys in client code
      permissions: ["read", "write"],
      created: "2025-01-15",
      lastUsed: "2025-01-30",
      visible: false,
    },
    {
      id: 2,
      name: "Development API",
      key: "[SECURE_KEY_HIDDEN]", // Security: Never expose real API keys in client code
      permissions: ["read"],
      created: "2025-01-20",
      lastUsed: "2025-01-29",
      visible: false,
    },
  ])

  const [newUser, setNewUser] = useState({ name: "", email: "", role: "User" })
  const [newField, setNewField] = useState({ name: "", type: "text", required: false, options: "" })
  const [newApiKey, setNewApiKey] = useState({ name: "", permissions: ["read"] })

  const [selectedUserForPermissions, setSelectedUserForPermissions] = useState<UserType | null>(null)
  const [selectedUserForEdit, setSelectedUserForEdit] = useState<UserType | null>(null)
  const [showRoleModal, setShowRoleModal] = useState(false)
  const [showPermissionModal, setShowPermissionModal] = useState(false)

  // Page permissions data
  const [pagePermissions] = useState([
    {
      id: "dashboard",
      name: "Dashboard",
      icon: <Home size={16} className="text-gray-600" />,
      permissions: { Admin: "full", Manager: "full", User: "read", Guest: "none" },
    },
    {
      id: "clients",
      name: "Clients",
      icon: <Users size={16} className="text-gray-600" />,
      permissions: { Admin: "full", Manager: "full", User: "read", Guest: "none" },
    },
    {
      id: "pipeline",
      name: "Sales Pipeline",
      icon: <TrendingUp size={16} className="text-gray-600" />,
      permissions: { Admin: "full", Manager: "full", User: "read", Guest: "none" },
    },
    {
      id: "projects",
      name: "Projects",
      icon: <FolderOpen size={16} className="text-gray-600" />,
      permissions: { Admin: "full", Manager: "full", User: "full", Guest: "none" },
    },
    {
      id: "tasks",
      name: "Tasks",
      icon: <CheckSquare size={16} className="text-gray-600" />,
      permissions: { Admin: "full", Manager: "full", User: "full", Guest: "none" },
    },
    {
      id: "reports",
      name: "Reports",
      icon: <BarChart3 size={16} className="text-gray-600" />,
      permissions: { Admin: "full", Manager: "full", User: "read", Guest: "none" },
    },
    {
      id: "settings",
      name: "Settings",
      icon: <Settings size={16} className="text-gray-600" />,
      permissions: { Admin: "full", Manager: "read", User: "none", Guest: "none" },
    },
    {
      id: "invoicing",
      name: "Invoicing",
      icon: <DollarSign size={16} className="text-gray-600" />,
      permissions: { Admin: "full", Manager: "full", User: "read", Guest: "none" },
    },
    {
      id: "analytics",
      name: "Advanced Analytics",
      icon: <BarChart3 size={16} className="text-gray-600" />,
      permissions: { Admin: "full", Manager: "read", User: "none", Guest: "none" },
    },
  ])

  const [formErrors, setFormErrors] = useState<any>({})
  const [isLoading, setIsLoading] = useState(false)

  const validateForm = (formData: any, type: string) => {
    const errors: any = {}

    if (type === "user") {
      if (!formData.name.trim()) errors.name = "Name is required"
      if (!formData.email.trim()) errors.email = "Email is required"
      if (!/\S+@\S+\.\S+/.test(formData.email)) errors.email = "Email is invalid"
    }

    if (type === "field") {
      if (!formData.name.trim()) errors.name = "Field name is required"
      if (formData.type === "select" && !formData.options.trim()) {
        errors.options = "Options are required for select fields"
      }
    }

    if (type === "apiKey") {
      if (!formData.name.trim()) errors.name = "API key name is required"
      if (formData.permissions.length === 0) errors.permissions = "At least one permission is required"
    }

    return errors
  }

  const addUser = () => {
    const errors = validateForm(newUser, "user")
    setFormErrors(errors)

    if (Object.keys(errors).length > 0) {
      return
    }

    if (newUser.name && newUser.email) {
      const user: UserType = {
        id: Date.now(),
        ...newUser,
        status: "pending",
        lastLogin: "Never",
      }
      setUsers([...users, user])
      setNewUser({ name: "", email: "", role: "User" })
      setShowAddUserModal(false)
    }
  }

  const addCustomField = () => {
    const errors = validateForm(newField, "field")
    setFormErrors(errors)

    if (Object.keys(errors).length > 0) {
      return
    }

    if (newField.name) {
      const field: CustomField = {
        id: Date.now(),
        name: newField.name,
        type: newField.type as "text" | "number" | "date" | "select",
        required: newField.required,
        options: newField.type === "select" ? newField.options.split(",").map((s) => s.trim()) : undefined,
      }
      setCustomFields([...customFields, field])
      setNewField({ name: "", type: "text", required: false, options: "" })
      setShowAddFieldModal(false)
    }
  }

  const addApiKey = () => {
    const errors = validateForm(newApiKey, "apiKey")
    setFormErrors(errors)

    if (Object.keys(errors).length > 0) {
      return
    }

    if (newApiKey.name) {
      const apiKey: ApiKey = {
        id: Date.now(),
        name: newApiKey.name,
        key: `sk_${Math.random().toString(36).substr(2, 20)}`,
        permissions: newApiKey.permissions,
        created: new Date().toISOString().split("T")[0],
        lastUsed: "Never",
        visible: false,
      }
      setApiKeys([...apiKeys, apiKey])
      setNewApiKey({ name: "", permissions: ["read"] })
      setShowAddApiKeyModal(false)
    }
  }

  const toggleApiKeyVisibility = (id: number) => {
    setApiKeys(apiKeys.map((key) => (key.id === id ? { ...key, visible: !key.visible } : key)))
  }

  const removeUser = (id: number) => {
    setUsers(users.filter((user) => user.id !== id))
  }

  const removeCustomField = (id: number) => {
    setCustomFields(customFields.filter((field) => field.id !== id))
  }

  const removeApiKey = (id: number) => {
    setApiKeys(apiKeys.filter((key) => key.id !== id))
  }

  const addRole = () => {
    if (newRole.name && newRole.description) {
      const role = {
        id: Date.now(),
        name: newRole.name,
        description: newRole.description,
        userCount: 0,
        isSystem: false,
      }
      setRoles([...roles, role])
      setNewRole({ name: "", description: "" })
      setShowAddRoleModal(false)
    }
  }

  const updateRole = () => {
    if (editingRole && editingRole.name && editingRole.description) {
      setRoles(
        roles.map((role) =>
          role.id === editingRole.id ? { ...role, name: editingRole.name, description: editingRole.description } : role,
        ),
      )
      setEditingRole(null)
    }
  }

  const deleteRole = (roleId: number) => {
    const role = roles.find((r) => r.id === roleId)
    if (role && !role.isSystem && role.userCount === 0) {
      setRoles(roles.filter((r) => r.id !== roleId))
    }
  }

  const sidebarItems = [
    { id: "general", label: "General", icon: <SettingsIcon size={18} /> },
    { id: "users", label: "Users & Permissions", icon: <Users size={18} /> },
    { id: "security", label: "Security", icon: <Shield size={18} /> },
    { id: "integrations", label: "Integrations", icon: <Globe size={18} /> },
    { id: "billing", label: "Billing", icon: <CreditCard size={18} /> },
    { id: "fields", label: "Custom Fields", icon: <Database size={18} /> },
    { id: "notifications", label: "Notifications", icon: <Bell size={18} /> },
    { id: "import", label: "Import/Export", icon: <Download size={18} /> },
    { id: "api", label: "API Access", icon: <Key size={18} /> },
    { id: "backup", label: "Backup & Restore", icon: <Database size={18} /> },
    { id: "webhooks", label: "Webhooks", icon: <Globe size={18} /> },
    { id: "templates", label: "Email Templates", icon: <Bell size={18} /> },
    { id: "audit", label: "Audit Logs", icon: <Shield size={18} /> },
    { id: "health", label: "System Health", icon: <BarChart3 size={18} /> },
  ]

  const renderContent = () => {
    switch (activeSection) {
      case "general":
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold">General Settings</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Company Name</label>
                <input type="text" defaultValue="Acme Corporation" className="w-full border rounded-lg px-3 py-2" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Time Zone</label>
                <select className="w-full border rounded-lg px-3 py-2">
                  <option>UTC-8 (Pacific Time)</option>
                  <option>UTC-5 (Eastern Time)</option>
                  <option>UTC+0 (GMT)</option>
                  <option>UTC+1 (Central European Time)</option>
                  <option>UTC+9 (Japan Standard Time)</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Currency</label>
                <select className="w-full border rounded-lg px-3 py-2">
                  <option>USD ($)</option>
                  <option>EUR (€)</option>
                  <option>GBP (£)</option>
                  <option>JPY (¥)</option>
                  <option>CAD (C$)</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Date Format</label>
                <select className="w-full border rounded-lg px-3 py-2">
                  <option>MM/DD/YYYY</option>
                  <option>DD/MM/YYYY</option>
                  <option>YYYY-MM-DD</option>
                  <option>DD-MM-YYYY</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Language</label>
                <select className="w-full border rounded-lg px-3 py-2">
                  <option>English</option>
                  <option>Spanish</option>
                  <option>French</option>
                  <option>German</option>
                  <option>Japanese</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Theme</label>
                <select className="w-full border rounded-lg px-3 py-2">
                  <option>Light</option>
                  <option>Dark</option>
                  <option>Auto</option>
                </select>
              </div>
            </div>

            <div className="border-t pt-6">
              <h4 className="text-md font-medium mb-4">Business Information</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Business Address</label>
                  <textarea
                    className="w-full border rounded-lg px-3 py-2"
                    rows={3}
                    defaultValue="123 Business St, Suite 100&#10;City, State 12345&#10;United States"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Contact Information</label>
                  <div className="space-y-2">
                    <input
                      type="tel"
                      placeholder="Phone Number"
                      className="w-full border rounded-lg px-3 py-2"
                      defaultValue="+1 (555) 123-4567"
                    />
                    <input
                      type="email"
                      placeholder="Business Email"
                      className="w-full border rounded-lg px-3 py-2"
                      defaultValue="contact@acme.com"
                    />
                    <input
                      type="url"
                      placeholder="Website"
                      className="w-full border rounded-lg px-3 py-2"
                      defaultValue="https://acme.com"
                    />
                  </div>
                </div>
              </div>
            </div>

            <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2">
              <Save size={16} />
              Save Changes
            </button>
          </div>
        )

      case "security":
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold">Security Settings</h3>

            {/* Password Policy */}
            <div className="bg-white p-6 rounded-lg border">
              <h4 className="text-md font-medium mb-4">Password Policy</h4>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Minimum Password Length</p>
                    <p className="text-sm text-gray-600">Set minimum characters required for passwords</p>
                  </div>
                  <select className="border rounded px-3 py-2">
                    <option>8 characters</option>
                    <option>10 characters</option>
                    <option>12 characters</option>
                    <option>16 characters</option>
                  </select>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Require Special Characters</p>
                    <p className="text-sm text-gray-600">Force users to include special characters</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" defaultChecked />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Password Expiration</p>
                    <p className="text-sm text-gray-600">Force password changes after specified days</p>
                  </div>
                  <select className="border rounded px-3 py-2">
                    <option>Never</option>
                    <option>30 days</option>
                    <option>60 days</option>
                    <option>90 days</option>
                    <option>180 days</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Two-Factor Authentication */}
            <div className="bg-white p-6 rounded-lg border">
              <h4 className="text-md font-medium mb-4">Two-Factor Authentication</h4>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Require 2FA for All Users</p>
                    <p className="text-sm text-gray-600">Force all users to enable two-factor authentication</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">2FA for Admin Users Only</p>
                    <p className="text-sm text-gray-600">Require 2FA only for administrative accounts</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" defaultChecked />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>
              </div>
            </div>

            {/* Session Management */}
            <div className="bg-white p-6 rounded-lg border">
              <h4 className="text-md font-medium mb-4">Session Management</h4>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Session Timeout</p>
                    <p className="text-sm text-gray-600">Automatically log out inactive users</p>
                  </div>
                  <select className="border rounded px-3 py-2">
                    <option>15 minutes</option>
                    <option>30 minutes</option>
                    <option>1 hour</option>
                    <option>2 hours</option>
                    <option>4 hours</option>
                    <option>8 hours</option>
                  </select>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Maximum Login Attempts</p>
                    <p className="text-sm text-gray-600">Lock account after failed attempts</p>
                  </div>
                  <select className="border rounded px-3 py-2">
                    <option>3 attempts</option>
                    <option>5 attempts</option>
                    <option>10 attempts</option>
                    <option>Unlimited</option>
                  </select>
                </div>
              </div>
            </div>

            <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2">
              <Save size={16} />
              Save Security Settings
            </button>
          </div>
        )

      case "integrations":
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold">Integrations</h3>

            {/* Email Integration */}
            <div className="bg-white p-6 rounded-lg border">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h4 className="text-md font-medium">Email Integration</h4>
                  <p className="text-sm text-gray-600">Connect your Mailjet service for automated communications</p>
                </div>
                <span className="px-3 py-1 text-sm bg-green-100 text-green-800 rounded-full">Connected</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email Provider</label>
                  <select className="w-full border rounded px-3 py-2">
                    <option>Mailjet</option>
                    <option>Outlook</option>
                    <option>SMTP</option>
                    <option>SendGrid</option>
                    <option>Mailgun</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">From Email</label>
                  <input type="email" className="w-full border rounded px-3 py-2" defaultValue="noreply@acme.com" />
                </div>
              </div>
              <div className="mt-4 flex gap-2">
                <button className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
                  Test Mailjet Connection
                </button>
                <button className="px-4 py-2 border rounded hover:bg-gray-50">Configure Mailjet</button>
              </div>
            </div>

            {/* Calendar Integration */}
            <div className="bg-white p-6 rounded-lg border">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h4 className="text-md font-medium">Calendar Integration</h4>
                  <p className="text-sm text-gray-600">Sync events and meetings with your calendar</p>
                </div>
                <span className="px-3 py-1 text-sm bg-gray-100 text-gray-800 rounded-full">Not Connected</span>
              </div>
              <div className="space-y-3">
                <button className="w-full flex items-center justify-center gap-2 p-3 border rounded-lg hover:bg-gray-50">
                  <div className="w-5 h-5 bg-blue-500 rounded"></div>
                  Connect Google Calendar
                </button>
                <button className="w-full flex items-center justify-center gap-2 p-3 border rounded-lg hover:bg-gray-50">
                  <div className="w-5 h-5 bg-blue-600 rounded"></div>
                  Connect Outlook Calendar
                </button>
              </div>
            </div>

            {/* Payment Integration */}
            <div className="bg-white p-6 rounded-lg border">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h4 className="text-md font-medium">Payment Processing</h4>
                  <p className="text-sm text-gray-600">Accept payments for invoices and services</p>
                </div>
                <span className="px-3 py-1 text-sm bg-yellow-100 text-yellow-800 rounded-full">
                  Partially Connected
                </span>
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-purple-100 rounded flex items-center justify-center">
                      <CreditCard size={16} className="text-purple-600" />
                    </div>
                    <div>
                      <p className="font-medium">Stripe</p>
                      <p className="text-sm text-gray-600">Credit cards, ACH, international payments</p>
                    </div>
                  </div>
                  <button className="px-3 py-1 bg-green-600 text-white rounded text-sm">Connected</button>
                </div>
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-blue-100 rounded flex items-center justify-center">
                      <DollarSign size={16} className="text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium">PayPal</p>
                      <p className="text-sm text-gray-600">PayPal payments and subscriptions</p>
                    </div>
                  </div>
                  <button className="px-3 py-1 border rounded text-sm hover:bg-gray-50">Connect</button>
                </div>
              </div>
            </div>

            {/* CRM Integration */}
            <div className="bg-white p-6 rounded-lg border">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h4 className="text-md font-medium">CRM Integration</h4>
                  <p className="text-sm text-gray-600">Sync with external CRM systems</p>
                </div>
                <span className="px-3 py-1 text-sm bg-gray-100 text-gray-800 rounded-full">Not Connected</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <button className="flex items-center justify-center gap-2 p-3 border rounded-lg hover:bg-gray-50">
                  <Users size={16} />
                  Salesforce
                </button>
                <button className="flex items-center justify-center gap-2 p-3 border rounded-lg hover:bg-gray-50">
                  <Users size={16} />
                  HubSpot
                </button>
                <button className="flex items-center justify-center gap-2 p-3 border rounded-lg hover:bg-gray-50">
                  <Users size={16} />
                  Pipedrive
                </button>
                <button className="flex items-center justify-center gap-2 p-3 border rounded-lg hover:bg-gray-50">
                  <Users size={16} />
                  Zoho CRM
                </button>
              </div>
            </div>
          </div>
        )

      case "billing":
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold">Billing & Subscription</h3>

            {/* Current Plan */}
            <div className="bg-white p-6 rounded-lg border">
              <h4 className="text-md font-medium mb-4">Current Plan</h4>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h5 className="text-lg font-semibold">Professional Plan</h5>
                  <p className="text-gray-600">$49/month • Billed annually</p>
                </div>
                <span className="px-3 py-1 text-sm bg-green-100 text-green-800 rounded-full">Active</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div className="text-center p-3 bg-gray-50 rounded">
                  <p className="text-2xl font-bold">25</p>
                  <p className="text-sm text-gray-600">Users</p>
                </div>
                <div className="text-center p-3 bg-gray-50 rounded">
                  <p className="text-2xl font-bold">100GB</p>
                  <p className="text-sm text-gray-600">Storage</p>
                </div>
                <div className="text-center p-3 bg-gray-50 rounded">
                  <p className="text-2xl font-bold">∞</p>
                  <p className="text-sm text-gray-600">Projects</p>
                </div>
              </div>
              <div className="flex gap-2">
                <button className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">Upgrade Plan</button>
                <button className="px-4 py-2 border rounded hover:bg-gray-50">Change Plan</button>
              </div>
            </div>

            {/* Usage Statistics */}
            <div className="bg-white p-6 rounded-lg border">
              <h4 className="text-md font-medium mb-4">Usage This Month</h4>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm">Users</span>
                    <span className="text-sm">12 / 25</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-blue-600 h-2 rounded-full" style={{ width: "48%" }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm">Storage</span>
                    <span className="text-sm">45GB / 100GB</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-green-600 h-2 rounded-full" style={{ width: "45%" }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm">API Calls</span>
                    <span className="text-sm">8,450 / 10,000</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-yellow-600 h-2 rounded-full" style={{ width: "84.5%" }}></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Payment Method */}
            <div className="bg-white p-6 rounded-lg border">
              <h4 className="text-md font-medium mb-4">Payment Method</h4>
              <div className="flex items-center justify-between p-4 border rounded-lg mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-6 bg-blue-600 rounded flex items-center justify-center">
                    <span className="text-white text-xs font-bold">VISA</span>
                  </div>
                  <div>
                    <p className="font-medium">•••• •••• •••• 4242</p>
                    <p className="text-sm text-gray-600">Expires 12/25</p>
                  </div>
                </div>
                <button className="text-blue-600 hover:text-blue-800 text-sm">Edit</button>
              </div>
              <button className="px-4 py-2 border rounded hover:bg-gray-50">Add Payment Method</button>
            </div>

            {/* Billing History */}
            <div className="bg-white p-6 rounded-lg border">
              <h4 className="text-md font-medium mb-4">Billing History</h4>
              <div className="space-y-3">
                {[
                  { date: "Jan 1, 2025", amount: "$49.00", status: "Paid", invoice: "INV-2025-001" },
                  { date: "Dec 1, 2024", amount: "$49.00", status: "Paid", invoice: "INV-2024-012" },
                  { date: "Nov 1, 2024", amount: "$49.00", status: "Paid", invoice: "INV-2024-011" },
                ].map((bill, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <div>
                        <p className="font-medium">{bill.invoice}</p>
                        <p className="text-sm text-gray-600">{bill.date}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="font-medium">{bill.amount}</span>
                      <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded">{bill.status}</span>
                      <button className="text-blue-600 hover:text-blue-800 text-sm">Download</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )

      case "notifications":
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold">Notification Settings</h3>

            {/* Email Notifications */}
            <div className="bg-white p-6 rounded-lg border">
              <h4 className="text-md font-medium mb-4">Email Notifications</h4>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">New Client Registration</p>
                    <p className="text-sm text-gray-600">Get notified when new clients sign up</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" defaultChecked />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Project Updates</p>
                    <p className="text-sm text-gray-600">Receive updates on project progress</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" defaultChecked />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Payment Notifications</p>
                    <p className="text-sm text-gray-600">Get notified about payments and invoices</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" defaultChecked />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Weekly Reports</p>
                    <p className="text-sm text-gray-600">Receive weekly summary reports</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>
              </div>
            </div>

            {/* Push Notifications */}
            <div className="bg-white p-6 rounded-lg border">
              <h4 className="text-md font-medium mb-4">Push Notifications</h4>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Task Reminders</p>
                    <p className="text-sm text-gray-600">Get reminded about upcoming tasks</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" defaultChecked />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Meeting Alerts</p>
                    <p className="text-sm text-gray-600">Alerts for upcoming meetings</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" defaultChecked />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">System Updates</p>
                    <p className="text-sm text-gray-600">Notifications about system maintenance</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>
              </div>
            </div>

            {/* Notification Schedule */}
            <div className="bg-white p-6 rounded-lg border">
              <h4 className="text-md font-medium mb-4">Notification Schedule</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Quiet Hours Start</label>
                  <input type="time" className="w-full border rounded px-3 py-2" defaultValue="22:00" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Quiet Hours End</label>
                  <input type="time" className="w-full border rounded px-3 py-2" defaultValue="08:00" />
                </div>
              </div>
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Notification Frequency</label>
                <select className="w-full border rounded px-3 py-2">
                  <option>Immediately</option>
                  <option>Every 15 minutes</option>
                  <option>Every hour</option>
                  <option>Daily digest</option>
                </select>
              </div>
            </div>

            <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2">
              <Save size={16} />
              Save Notification Settings
            </button>
          </div>
        )

      case "import":
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold">Import/Export Data</h3>

            {/* Import Data */}
            <div className="bg-white p-6 rounded-lg border">
              <h4 className="text-md font-medium mb-4">Import Data</h4>
              <p className="text-gray-600 mb-4">Import your existing data from CSV files or other CRM systems</p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 cursor-pointer">
                  <Users size={24} className="mx-auto mb-2 text-gray-400" />
                  <p className="font-medium">Import Clients</p>
                  <p className="text-sm text-gray-600">Upload CSV file with client data</p>
                  <input type="file" className="hidden" accept=".csv" />
                </div>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 cursor-pointer">
                  <FolderOpen size={24} className="mx-auto mb-2 text-gray-400" />
                  <p className="font-medium">Import Projects</p>
                  <p className="text-sm text-gray-600">Upload CSV file with project data</p>
                  <input type="file" className="hidden" accept=".csv" />
                </div>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 cursor-pointer">
                  <CheckSquare size={24} className="mx-auto mb-2 text-gray-400" />
                  <p className="font-medium">Import Tasks</p>
                  <p className="text-sm text-gray-600">Upload CSV file with task data</p>
                  <input type="file" className="hidden" accept=".csv" />
                </div>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 cursor-pointer">
                  <DollarSign size={24} className="mx-auto mb-2 text-gray-400" />
                  <p className="font-medium">Import Invoices</p>
                  <p className="text-sm text-gray-600">Upload CSV file with invoice data</p>
                  <input type="file" className="hidden" accept=".csv" />
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded p-4">
                <h5 className="font-medium text-blue-900 mb-2">Import Guidelines</h5>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Files must be in CSV format with UTF-8 encoding</li>
                  <li>• First row should contain column headers</li>
                  <li>• Maximum file size: 10MB</li>
                  <li>• Download our templates for proper formatting</li>
                </ul>
              </div>
            </div>

            {/* Export Data */}
            <div className="bg-white p-6 rounded-lg border">
              <h4 className="text-md font-medium mb-4">Export Data</h4>
              <p className="text-gray-600 mb-4">Export your data for backup or migration purposes</p>

              <div className="space-y-3">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <Users size={20} className="text-blue-600" />
                    <div>
                      <p className="font-medium">Client Data</p>
                      <p className="text-sm text-gray-600">Export all client information and contacts</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button className="px-3 py-1 border rounded text-sm hover:bg-gray-50">CSV</button>
                    <button className="px-3 py-1 border rounded text-sm hover:bg-gray-50">Excel</button>
                    <button className="px-3 py-1 border rounded text-sm hover:bg-gray-50">JSON</button>
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <FolderOpen size={20} className="text-green-600" />
                    <div>
                      <p className="font-medium">Project Data</p>
                      <p className="text-sm text-gray-600">Export all projects and their details</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button className="px-3 py-1 border rounded text-sm hover:bg-gray-50">CSV</button>
                    <button className="px-3 py-1 border rounded text-sm hover:bg-gray-50">Excel</button>
                    <button className="px-3 py-1 border rounded text-sm hover:bg-gray-50">JSON</button>
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <BarChart3 size={20} className="text-purple-600" />
                    <div>
                      <p className="font-medium">Complete Backup</p>
                      <p className="text-sm text-gray-600">Export all data including settings</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700">
                      Download
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Import History */}
            <div className="bg-white p-6 rounded-lg border">
              <h4 className="text-md font-medium mb-4">Recent Import/Export Activity</h4>
              <div className="space-y-3">
                {[
                  { type: "Export", data: "Client Data", date: "Jan 30, 2025", status: "Completed", size: "2.3 MB" },
                  { type: "Import", data: "Project Data", date: "Jan 28, 2025", status: "Completed", size: "1.8 MB" },
                  {
                    type: "Export",
                    data: "Complete Backup",
                    date: "Jan 25, 2025",
                    status: "Completed",
                    size: "15.2 MB",
                  },
                ].map((activity, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-8 h-8 rounded flex items-center justify-center ${
                          activity.type === "Export" ? "bg-green-100" : "bg-blue-100"
                        }`}
                      >
                        {activity.type === "Export" ? (
                          <Download size={16} className="text-green-600" />
                        ) : (
                          <Download size={16} className="text-blue-600 rotate-180" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium">
                          {activity.type} - {activity.data}
                        </p>
                        <p className="text-sm text-gray-600">
                          {activity.date} • {activity.size}
                        </p>
                      </div>
                    </div>
                    <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded">{activity.status}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )

      case "users":
        return (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Users & Permissions</h3>
              <div className="flex gap-2">
                <button
                  onClick={() => setShowAddUserModal(true)}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
                >
                  <Plus size={16} />
                  Add User
                </button>
                <button
                  onClick={() => setShowRoleModal(true)}
                  className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center gap-2"
                >
                  <Shield size={16} />
                  Manage Roles
                </button>
              </div>
            </div>

            {/* Permission Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="bg-white p-4 rounded-lg border">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Users size={20} className="text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Total Users</p>
                    <p className="text-2xl font-bold">{users.length}</p>
                  </div>
                </div>
              </div>
              <div className="bg-white p-4 rounded-lg border">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                    <Shield size={20} className="text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Active Roles</p>
                    <p className="text-2xl font-bold">4</p>
                  </div>
                </div>
              </div>
              <div className="bg-white p-4 rounded-lg border">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                    <Key size={20} className="text-yellow-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Pending Access</p>
                    <p className="text-2xl font-bold">{users.filter((u) => u.status === "pending").length}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Users Table */}
            <div className="bg-white rounded-lg border overflow-hidden">
              <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
                <h4 className="font-medium text-gray-900">User Management</h4>
              </div>
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">User</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Role</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Status</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Permissions</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Last Login</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {users.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                            <LucideUser size={16} className="text-gray-600" />
                          </div>
                          <div>
                            <p className="text-sm font-medium">{user.name}</p>
                            <p className="text-xs text-gray-500">{user.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`px-2 py-1 text-xs rounded-full ${
                            user.role === "Admin"
                              ? "bg-red-100 text-red-800"
                              : user.role === "Manager"
                                ? "bg-blue-100 text-blue-800"
                                : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {user.role}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`px-2 py-1 text-xs rounded-full ${
                            user.status === "active"
                              ? "bg-green-100 text-green-800"
                              : user.status === "pending"
                                ? "bg-yellow-100 text-yellow-800"
                                : "bg-red-100 text-red-800"
                          }`}
                        >
                          {user.status}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => setSelectedUserForPermissions(user)}
                          className="text-blue-600 hover:text-blue-800 text-sm"
                        >
                          View/Edit
                        </button>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">{user.lastLogin}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setSelectedUserForEdit(user)}
                            className="text-blue-600 hover:text-blue-800"
                            title="Edit user"
                          >
                            <Settings size={16} />
                          </button>
                          <button
                            onClick={() => removeUser(user.id)}
                            className="text-red-600 hover:text-red-800"
                            title="Remove user"
                          >
                            <X size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Permission Matrix */}
            <div className="bg-white rounded-lg border overflow-hidden">
              <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
                <h4 className="font-medium text-gray-900">Permission Matrix</h4>
                <p className="text-sm text-gray-600">Quick overview of role permissions</p>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Page/Component</th>
                      <th className="px-4 py-3 text-center text-sm font-medium text-gray-700">Admin</th>
                      <th className="px-4 py-3 text-center text-sm font-medium text-gray-700">Manager</th>
                      <th className="px-4 py-3 text-center text-sm font-medium text-gray-700">User</th>
                      <th className="px-4 py-3 text-center text-sm font-medium text-gray-700">Guest</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {pagePermissions.map((page) => (
                      <tr key={page.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            {page.icon}
                            <span className="text-sm font-medium">{page.name}</span>
                          </div>
                        </td>
                        {(["Admin", "Manager", "User", "Guest"] as const).map((role) => (
                          <td key={role} className="px-4 py-3 text-center">
                            <div className="flex justify-center">
                              {page.permissions[role] === "full" && (
                                <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                                </div>
                              )}
                              {page.permissions[role] === "read" && (
                                <div className="w-6 h-6 bg-yellow-100 rounded-full flex items-center justify-center">
                                  <Eye size={12} className="text-yellow-600" />
                                </div>
                              )}
                              {page.permissions[role] === "none" && (
                                <div className="w-6 h-6 bg-red-100 rounded-full flex items-center justify-center">
                                  <X size={12} className="text-red-500" />
                                </div>
                              )}
                            </div>
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="px-4 py-3 border-t border-gray-200 bg-gray-50">
                <div className="flex items-center gap-6 text-xs text-gray-600">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <span>Full Access</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Eye size={12} className="text-yellow-600" />
                    <span>Read Only</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <X size={12} className="text-red-500" />
                    <span>No Access</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )

      case "fields":
        return (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Custom Fields</h3>
              <button
                onClick={() => setShowAddFieldModal(true)}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
              >
                <Plus size={16} />
                Add Field
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {customFields.map((field) => (
                <div key={field.id} className="bg-white p-4 rounded-lg border">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-medium">{field.name}</h4>
                    <button onClick={() => removeCustomField(field.id)} className="text-red-600 hover:text-red-800">
                      <X size={16} />
                    </button>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">Type: {field.type}</p>
                  <p className="text-sm text-gray-600 mb-2">Required: {field.required ? "Yes" : "No"}</p>
                  {field.options && <p className="text-sm text-gray-600">Options: {field.options.join(", ")}</p>}
                </div>
              ))}
            </div>
          </div>
        )

      case "api":
        return (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">API Access</h3>
              <button
                onClick={() => setShowAddApiKeyModal(true)}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
              >
                <Plus size={16} />
                Generate API Key
              </button>
            </div>
            <div className="space-y-4">
              {apiKeys.map((apiKey) => (
                <div key={apiKey.id} className="bg-white p-4 rounded-lg border">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h4 className="font-medium">{apiKey.name}</h4>
                      <p className="text-sm text-gray-600">Created: {apiKey.created}</p>
                      <p className="text-sm text-gray-600">Last used: {apiKey.lastUsed}</p>
                    </div>
                    <button onClick={() => removeApiKey(apiKey.id)} className="text-red-600 hover:text-red-800">
                      <X size={16} />
                    </button>
                  </div>
                  <div className="flex items-center gap-2 mb-2">
                    <code className="bg-gray-100 px-2 py-1 rounded text-sm font-mono">
                      {apiKey.visible ? apiKey.key : "••••••••••••••••••••"}
                    </code>
                    <button
                      onClick={() => toggleApiKeyVisibility(apiKey.id)}
                      className="text-gray-600 hover:text-gray-800"
                    >
                      {apiKey.visible ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                  <div className="flex gap-2">
                    {apiKey.permissions.map((permission) => (
                      <span key={permission} className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
                        {permission}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )

      case "backup":
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold">Backup & Restore</h3>

            {/* Automated Backups */}
            <div className="bg-white p-6 rounded-lg border">
              <h4 className="text-md font-medium mb-4">Automated Backups</h4>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Enable Automated Backups</p>
                    <p className="text-sm text-gray-600">Automatically backup your data on a schedule</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" defaultChecked />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Backup Frequency</label>
                    <select className="w-full border rounded px-3 py-2">
                      <option>Daily</option>
                      <option>Weekly</option>
                      <option>Monthly</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Retention Period</label>
                    <select className="w-full border rounded px-3 py-2">
                      <option>30 days</option>
                      <option>90 days</option>
                      <option>1 year</option>
                      <option>Forever</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* Manual Backup */}
            <div className="bg-white p-6 rounded-lg border">
              <h4 className="text-md font-medium mb-4">Manual Backup</h4>
              <p className="text-gray-600 mb-4">Create an immediate backup of all your data</p>
              <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
                Create Backup Now
              </button>
            </div>

            {/* Backup History */}
            <div className="bg-white p-6 rounded-lg border">
              <h4 className="text-md font-medium mb-4">Backup History</h4>
              <div className="space-y-3">
                {[
                  { date: "2025-01-30 02:00", type: "Automated", size: "45.2 MB", status: "Completed" },
                  { date: "2025-01-29 02:00", type: "Automated", size: "44.8 MB", status: "Completed" },
                  { date: "2025-01-28 14:30", type: "Manual", size: "44.5 MB", status: "Completed" },
                ].map((backup, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">{backup.type} Backup</p>
                      <p className="text-sm text-gray-600">
                        {backup.date} • {backup.size}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded">{backup.status}</span>
                      <button className="text-blue-600 hover:text-blue-800 text-sm">Download</button>
                      <button className="text-blue-600 hover:text-blue-800 text-sm">Restore</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )

      case "webhooks":
        return (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Webhooks</h3>
              <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2">
                <Plus size={16} />
                Add Webhook
              </button>
            </div>

            {/* Webhook List */}
            <div className="bg-white p-6 rounded-lg border">
              <h4 className="text-md font-medium mb-4">Active Webhooks</h4>
              <div className="space-y-3">
                {[
                  {
                    name: "Client Created",
                    url: "https://api.example.com/webhooks/client",
                    events: ["client.created"],
                    status: "Active",
                  },
                  {
                    name: "Invoice Paid",
                    url: "https://api.example.com/webhooks/payment",
                    events: ["invoice.paid"],
                    status: "Active",
                  },
                  {
                    name: "Project Updated",
                    url: "https://api.example.com/webhooks/project",
                    events: ["project.updated"],
                    status: "Inactive",
                  },
                ].map((webhook, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <p className="font-medium">{webhook.name}</p>
                      <p className="text-sm text-gray-600">{webhook.url}</p>
                      <div className="flex gap-1 mt-1">
                        {webhook.events.map((event, i) => (
                          <span key={i} className="px-2 py-1 text-xs bg-gray-100 text-gray-800 rounded">
                            {event}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span
                        className={`px-2 py-1 text-xs rounded ${
                          webhook.status === "Active" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                        }`}
                      >
                        {webhook.status}
                      </span>
                      <button className="text-blue-600 hover:text-blue-800 text-sm">Edit</button>
                      <button className="text-red-600 hover:text-red-800 text-sm">Delete</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Webhook Events */}
            <div className="bg-white p-6 rounded-lg border">
              <h4 className="text-md font-medium mb-4">Available Events</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {[
                  "client.created",
                  "client.updated",
                  "client.deleted",
                  "project.created",
                  "project.updated",
                  "project.completed",
                  "invoice.created",
                  "invoice.paid",
                  "invoice.overdue",
                  "task.created",
                  "task.completed",
                  "task.assigned",
                ].map((event, index) => (
                  <div key={index} className="p-3 border rounded-lg">
                    <code className="text-sm font-mono">{event}</code>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )

      case "templates":
        return (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Email Templates</h3>
              <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2">
                <Plus size={16} />
                Create Template
              </button>
            </div>

            {/* Template Categories */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white p-6 rounded-lg border">
                <h4 className="font-medium mb-4">Client Communications</h4>
                <div className="space-y-2">
                  {["Welcome Email", "Project Update", "Invoice Reminder", "Thank You"].map((template, index) => (
                    <div key={index} className="flex items-center justify-between p-2 hover:bg-gray-50 rounded">
                      <span className="text-sm">{template}</span>
                      <button className="text-blue-600 hover:text-blue-800 text-sm">Edit</button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg border">
                <h4 className="font-medium mb-4">Internal Notifications</h4>
                <div className="space-y-2">
                  {["Task Assignment", "Deadline Reminder", "Team Update", "System Alert"].map((template, index) => (
                    <div key={index} className="flex items-center justify-between p-2 hover:bg-gray-50 rounded">
                      <span className="text-sm">{template}</span>
                      <button className="text-blue-600 hover:text-blue-800 text-sm">Edit</button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg border">
                <h4 className="font-medium mb-4">Marketing</h4>
                <div className="space-y-2">
                  {["Newsletter", "Product Update", "Event Invitation", "Survey Request"].map((template, index) => (
                    <div key={index} className="flex items-center justify-between p-2 hover:bg-gray-50 rounded">
                      <span className="text-sm">{template}</span>
                      <button className="text-blue-600 hover:text-blue-800 text-sm">Edit</button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Template Variables */}
            <div className="bg-white p-6 rounded-lg border">
              <h4 className="text-md font-medium mb-4">Available Variables</h4>
              <p className="text-gray-600 mb-4">Use these variables in your email templates</p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {[
                  "{{client.name}}",
                  "{{client.email}}",
                  "{{project.name}}",
                  "{{project.deadline}}",
                  "{{invoice.amount}}",
                  "{{invoice.due_date}}",
                  "{{task.title}}",
                  "{{user.name}}",
                ].map((variable, index) => (
                  <code key={index} className="p-2 bg-gray-100 rounded text-sm font-mono">
                    {variable}
                  </code>
                ))}
              </div>
            </div>
          </div>
        )

      case "audit":
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold">Audit Logs</h3>

            {/* Filters */}
            <div className="bg-white p-6 rounded-lg border">
              <h4 className="text-md font-medium mb-4">Filters</h4>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Date Range</label>
                  <select className="w-full border rounded px-3 py-2">
                    <option>Last 7 days</option>
                    <option>Last 30 days</option>
                    <option>Last 90 days</option>
                    <option>Custom range</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Action Type</label>
                  <select className="w-full border rounded px-3 py-2">
                    <option>All actions</option>
                    <option>Create</option>
                    <option>Update</option>
                    <option>Delete</option>
                    <option>Login</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">User</label>
                  <select className="w-full border rounded px-3 py-2">
                    <option>All users</option>
                    <option>John Doe</option>
                    <option>Jane Smith</option>
                    <option>Bob Wilson</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Resource</label>
                  <select className="w-full border rounded px-3 py-2">
                    <option>All resources</option>
                    <option>Clients</option>
                    <option>Projects</option>
                    <option>Tasks</option>
                    <option>Invoices</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Audit Log Entries */}
            <div className="bg-white rounded-lg border overflow-hidden">
              <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
                <h4 className="font-medium text-gray-900">Recent Activity</h4>
              </div>
              <div className="divide-y divide-gray-200">
                {[
                  {
                    user: "John Doe",
                    action: "Created",
                    resource: "Client",
                    details: "New client 'Acme Corp' added",
                    time: "2 minutes ago",
                    ip: "192.168.1.100",
                  },
                  {
                    user: "Jane Smith",
                    action: "Updated",
                    resource: "Project",
                    details: "Project 'Website Redesign' status changed to In Progress",
                    time: "15 minutes ago",
                    ip: "192.168.1.101",
                  },
                  {
                    user: "Bob Wilson",
                    action: "Deleted",
                    resource: "Task",
                    details: "Task 'Review mockups' removed",
                    time: "1 hour ago",
                    ip: "192.168.1.102",
                  },
                  {
                    user: "John Doe",
                    action: "Login",
                    resource: "System",
                    details: "User logged in successfully",
                    time: "2 hours ago",
                    ip: "192.168.1.100",
                  },
                ].map((log, index) => (
                  <div key={index} className="p-4 hover:bg-gray-50">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                          <LucideUser size={16} className="text-gray-600" />
                        </div>
                        <div>
                          <p className="text-sm font-medium">
                            <span className="text-blue-600">{log.user}</span> {log.action.toLowerCase()}{" "}
                            {log.resource.toLowerCase()}
                          </p>
                          <p className="text-sm text-gray-600">{log.details}</p>
                          <p className="text-xs text-gray-500">
                            IP: {log.ip} • {log.time}
                          </p>
                        </div>
                      </div>
                      <span
                        className={`px-2 py-1 text-xs rounded-full ${
                          log.action === "Created"
                            ? "bg-green-100 text-green-800"
                            : log.action === "Updated"
                              ? "bg-blue-100 text-blue-800"
                              : log.action === "Deleted"
                                ? "bg-red-100 text-red-800"
                                : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {log.action}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )

      case "health":
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold">System Health</h3>

            {/* System Status */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-white p-4 rounded-lg border">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <div>
                    <p className="text-sm text-gray-600">System Status</p>
                    <p className="font-semibold text-green-600">Operational</p>
                  </div>
                </div>
              </div>
              <div className="bg-white p-4 rounded-lg border">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <div>
                    <p className="text-sm text-gray-600">Database</p>
                    <p className="font-semibold text-green-600">Healthy</p>
                  </div>
                </div>
              </div>
              <div className="bg-white p-4 rounded-lg border">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                  <div>
                    <p className="text-sm text-gray-600">Email Service</p>
                    <p className="font-semibold text-yellow-600">Degraded</p>
                  </div>
                </div>
              </div>
              <div className="bg-white p-4 rounded-lg border">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <div>
                    <p className="text-sm text-gray-600">API</p>
                    <p className="font-semibold text-green-600">Operational</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Performance Metrics */}
            <div className="bg-white p-6 rounded-lg border">
              <h4 className="text-md font-medium mb-4">Performance Metrics</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <p className="text-sm text-gray-600 mb-2">Response Time</p>
                  <p className="text-2xl font-bold">245ms</p>
                  <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                    <div className="bg-green-600 h-2 rounded-full" style={{ width: "75%" }}></div>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-2">CPU Usage</p>
                  <p className="text-2xl font-bold">34%</p>
                  <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                    <div className="bg-blue-600 h-2 rounded-full" style={{ width: "34%" }}></div>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-2">Memory Usage</p>
                  <p className="text-2xl font-bold">67%</p>
                  <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                    <div className="bg-yellow-600 h-2 rounded-full" style={{ width: "67%" }}></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Incidents */}
            <div className="bg-white p-6 rounded-lg border">
              <h4 className="text-md font-medium mb-4">Recent Incidents</h4>
              <div className="space-y-3">
                {[
                  { title: "Email delivery delays", status: "Resolved", time: "2 hours ago", severity: "Minor" },
                  {
                    title: "Database connection timeout",
                    status: "Investigating",
                    time: "1 day ago",
                    severity: "Major",
                  },
                  { title: "API rate limit exceeded", status: "Resolved", time: "3 days ago", severity: "Minor" },
                ].map((incident, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">{incident.title}</p>
                      <p className="text-sm text-gray-600">{incident.time}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span
                        className={`px-2 py-1 text-xs rounded ${
                          incident.severity === "Major" ? "bg-red-100 text-red-800" : "bg-yellow-100 text-yellow-800"
                        }`}
                      >
                        {incident.severity}
                      </span>
                      <span
                        className={`px-2 py-1 text-xs rounded ${
                          incident.status === "Resolved" ? "bg-green-100 text-green-800" : "bg-blue-100 text-blue-800"
                        }`}
                      >
                        {incident.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )

      default:
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold">{activeSection}</h3>
            <p className="text-gray-600">This section is under development.</p>
          </div>
        )
    }
  }

  return (
    <div className="flex h-full bg-gray-50">
      {/* Sidebar */}
      <div className="w-64 bg-white border-r border-gray-200 p-4">
        <h2 className="text-xl font-bold mb-6">Settings</h2>
        <nav className="space-y-2">
          {sidebarItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveSection(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2 text-left rounded-lg transition-colors ${
                activeSection === item.id
                  ? "bg-blue-50 text-blue-700 border border-blue-200"
                  : "text-gray-700 hover:bg-gray-100"
              }`}
            >
              {item.icon}
              <span className="text-sm">{item.label}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-6 overflow-auto">{renderContent()}</div>

      {/* Add User Modal */}
      {showAddUserModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Add New User</h3>
              <button onClick={() => setShowAddUserModal(false)} className="text-gray-500 hover:text-gray-700">
                <X size={20} />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <input
                  type="text"
                  value={newUser.name}
                  onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                  className={`w-full border rounded px-3 py-2 ${formErrors.name ? "border-red-500" : ""}`}
                />
                {formErrors.name && <p className="text-red-500 text-xs mt-1">{formErrors.name}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  value={newUser.email}
                  onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                  className={`w-full border rounded px-3 py-2 ${formErrors.email ? "border-red-500" : ""}`}
                />
                {formErrors.email && <p className="text-red-500 text-xs mt-1">{formErrors.email}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                <select
                  value={newUser.role}
                  onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                  className="w-full border rounded px-3 py-2"
                >
                  <option value="User">User</option>
                  <option value="Manager">Manager</option>
                  <option value="Admin">Admin</option>
                </select>
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-6">
              <button onClick={() => setShowAddUserModal(false)} className="px-4 py-2 border rounded hover:bg-gray-50">
                Cancel
              </button>
              <button onClick={addUser} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
                Add User
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Custom Field Modal */}
      {showAddFieldModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Add Custom Field</h3>
              <button onClick={() => setShowAddFieldModal(false)} className="text-gray-500 hover:text-gray-700">
                <X size={20} />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Field Name</label>
                <input
                  type="text"
                  value={newField.name}
                  onChange={(e) => setNewField({ ...newField, name: e.target.value })}
                  className={`w-full border rounded px-3 py-2 ${formErrors.name ? "border-red-500" : ""}`}
                />
                {formErrors.name && <p className="text-red-500 text-xs mt-1">{formErrors.name}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Field Type</label>
                <select
                  value={newField.type}
                  onChange={(e) => setNewField({ ...newField, type: e.target.value })}
                  className="w-full border rounded px-3 py-2"
                >
                  <option value="text">Text</option>
                  <option value="number">Number</option>
                  <option value="date">Date</option>
                  <option value="select">Select</option>
                </select>
              </div>
              {newField.type === "select" && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Options (comma-separated)</label>
                  <input
                    type="text"
                    value={newField.options}
                    onChange={(e) => setNewField({ ...newField, options: e.target.value })}
                    placeholder="Option 1, Option 2, Option 3"
                    className={`w-full border rounded px-3 py-2 ${formErrors.options ? "border-red-500" : ""}`}
                  />
                  {formErrors.options && <p className="text-red-500 text-xs mt-1">{formErrors.options}</p>}
                </div>
              )}
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="required"
                  checked={newField.required}
                  onChange={(e) => setNewField({ ...newField, required: e.target.checked })}
                  className="rounded text-blue-600 focus:ring-blue-500"
                />
                <label htmlFor="required" className="ml-2 text-sm text-gray-700">
                  Required field
                </label>
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-6">
              <button onClick={() => setShowAddFieldModal(false)} className="px-4 py-2 border rounded hover:bg-gray-50">
                Cancel
              </button>
              <button onClick={addCustomField} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
                Add Field
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add API Key Modal */}
      {showAddApiKeyModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Generate API Key</h3>
              <button onClick={() => setShowAddApiKeyModal(false)} className="text-gray-500 hover:text-gray-700">
                <X size={20} />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Key Name</label>
                <input
                  type="text"
                  value={newApiKey.name}
                  onChange={(e) => setNewApiKey({ ...newApiKey, name: e.target.value })}
                  className={`w-full border rounded px-3 py-2 ${formErrors.name ? "border-red-500" : ""}`}
                />
                {formErrors.name && <p className="text-red-500 text-xs mt-1">{formErrors.name}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Permissions</label>
                <div className="space-y-2">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="read"
                      checked={newApiKey.permissions.includes("read")}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setNewApiKey({ ...newApiKey, permissions: [...newApiKey.permissions, "read"] })
                        } else {
                          setNewApiKey({
                            ...newApiKey,
                            permissions: newApiKey.permissions.filter((p) => p !== "read"),
                          })
                        }
                      }}
                      className="rounded text-blue-600 focus:ring-blue-500"
                    />
                    <label htmlFor="read" className="ml-2 text-sm text-gray-700">
                      Read access
                    </label>
                  </div>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="write"
                      checked={newApiKey.permissions.includes("write")}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setNewApiKey({ ...newApiKey, permissions: [...newApiKey.permissions, "write"] })
                        } else {
                          setNewApiKey({
                            ...newApiKey,
                            permissions: newApiKey.permissions.filter((p) => p !== "write"),
                          })
                        }
                      }}
                      className="rounded text-blue-600 focus:ring-blue-500"
                    />
                    <label htmlFor="write" className="ml-2 text-sm text-gray-700">
                      Write access
                    </label>
                  </div>
                </div>
                {formErrors.permissions && <p className="text-red-500 text-xs mt-1">{formErrors.permissions}</p>}
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-6">
              <button
                onClick={() => setShowAddApiKeyModal(false)}
                className="px-4 py-2 border rounded hover:bg-gray-50"
              >
                Cancel
              </button>
              <button onClick={addApiKey} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
                Generate Key
              </button>
            </div>
          </div>
        </div>
      )}

      {/* User Permissions Modal */}
      {selectedUserForPermissions && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Manage Permissions - {selectedUserForPermissions.name}</h3>
              <button onClick={() => setSelectedUserForPermissions(null)} className="text-gray-500 hover:text-gray-700">
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium mb-2">User Information</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Role:</span>
                    <span className="ml-2 font-medium">{selectedUserForPermissions.role}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Status:</span>
                    <span className="ml-2 font-medium">{selectedUserForPermissions.status}</span>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-medium mb-3">Page Access Permissions</h4>
                <div className="space-y-3">
                  {pagePermissions.map((page) => (
                    <div key={page.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        {page.icon}
                        <span className="font-medium">{page.name}</span>
                      </div>
                      <div className="flex gap-2">
                        <select
                          defaultValue={page.permissions[selectedUserForPermissions.role as keyof typeof page.permissions]}
                          className="border rounded px-3 py-1 text-sm"
                        >
                          <option value="full">Full Access</option>
                          <option value="read">Read Only</option>
                          <option value="none">No Access</option>
                        </select>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="font-medium mb-3">Custom Restrictions</h4>
                <div className="space-y-2">
                  <label className="flex items-center gap-2">
                    <input type="checkbox" className="rounded" />
                    <span className="text-sm">Can export data</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input type="checkbox" className="rounded" />
                    <span className="text-sm">Can delete records</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input type="checkbox" className="rounded" />
                    <span className="text-sm">Can manage other users</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input type="checkbox" className="rounded" />
                    <span className="text-sm">Can access API keys</span>
                  </label>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 mt-6">
              <button
                onClick={() => setSelectedUserForPermissions(null)}
                className="px-4 py-2 border rounded hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setSelectedUserForPermissions(null)
                  //showSuccess("Permissions updated successfully") // showSuccess is not defined
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Save Permissions
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Role Management Modal */}
      {showRoleModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Role Management</h3>
              <button onClick={() => setShowRoleModal(false)} className="text-gray-500 hover:text-gray-700">
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h4 className="font-medium">System Roles</h4>
                <button
                  onClick={() => setShowAddRoleModal(true)}
                  className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700"
                >
                  Add Role
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {roles.map((role) => (
                  <div key={role.id} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex items-center gap-2">
                        <h5 className="font-medium">{role.name}</h5>
                        {role.isSystem && (
                          <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded">System</span>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => setEditingRole(role)}
                          className="text-blue-600 hover:text-blue-800 text-sm"
                        >
                          Edit
                        </button>
                        {!role.isSystem && role.userCount === 0 && (
                          <button
                            onClick={() => deleteRole(role.id)}
                            className="text-red-600 hover:text-red-800 text-sm"
                          >
                            Delete
                          </button>
                        )}
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 mb-3">{role.description}</p>
                    <div className="text-xs text-gray-500">{role.userCount} users assigned</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end gap-2 mt-6">
              <button onClick={() => setShowRoleModal(false)} className="px-4 py-2 border rounded hover:bg-gray-50">
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Role Modal */}
      {showAddRoleModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Add New Role</h3>
              <button onClick={() => setShowAddRoleModal(false)} className="text-gray-500 hover:text-gray-700">
                <X size={20} />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Role Name</label>
                <input
                  type="text"
                  value={newRole.name}
                  onChange={(e) => setNewRole({ ...newRole, name: e.target.value })}
                  className="w-full border rounded px-3 py-2"
                  placeholder="e.g., Project Lead"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={newRole.description}
                  onChange={(e) => setNewRole({ ...newRole, description: e.target.value })}
                  className="w-full border rounded px-3 py-2"
                  rows={3}
                  placeholder="Describe the role's responsibilities..."
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-6">
              <button onClick={() => setShowAddRoleModal(false)} className="px-4 py-2 border rounded hover:bg-gray-50">
                Cancel
              </button>
              <button onClick={addRole} className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700">
                Create Role
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Role Modal */}
      {editingRole && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Edit Role</h3>
              <button onClick={() => setEditingRole(null)} className="text-gray-500 hover:text-gray-700">
                <X size={20} />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Role Name</label>
                <input
                  type="text"
                  value={editingRole.name}
                  onChange={(e) => setEditingRole({ ...editingRole, name: e.target.value })}
                  className="w-full border rounded px-3 py-2"
                  disabled={editingRole.isSystem}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={editingRole.description}
                  onChange={(e) => setEditingRole({ ...editingRole, description: e.target.value })}
                  className="w-full border rounded px-3 py-2"
                  rows={3}
                />
              </div>
              {editingRole.isSystem && (
                <div className="bg-yellow-50 border border-yellow-200 rounded p-3">
                  <p className="text-sm text-yellow-800">
                    This is a system role. Only the description can be modified.
                  </p>
                </div>
              )}
            </div>
            <div className="flex justify-end gap-2 mt-6">
              <button onClick={() => setEditingRole(null)} className="px-4 py-2 border rounded hover:bg-gray-50">
                Cancel
              </button>
              <button onClick={updateRole} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
                Update Role
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default SettingsComponent
