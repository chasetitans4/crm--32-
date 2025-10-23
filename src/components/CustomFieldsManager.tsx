"use client"

import React, { useState, useEffect } from "react"
import { motion } from "framer-motion"
import {
  Plus,
  Edit,
  Trash2,
  Save,
  X,
  Type,
  Hash,
  Calendar,
  ToggleLeft,
  List,
  FileText,
  Mail,
  Phone,
  Link,
  DollarSign,
  Settings,
  AlertCircle,
  CheckCircle,
  Eye,
  EyeOff,
} from "lucide-react"
import { useAppContext } from "../context/AppContext"

const configService = {
  getFeature: (feature: string) => true, // Mock implementation
}

interface CustomFieldOption {
  id: string
  label: string
  value: string
}

interface CustomField {
  id: string
  name: string
  label: string
  type:
    | "text"
    | "number"
    | "email"
    | "phone"
    | "url"
    | "textarea"
    | "select"
    | "multiselect"
    | "checkbox"
    | "date"
    | "datetime"
    | "currency"
  entity: "client" | "project" | "task" | "lead" | "proposal" | "invoice"
  required: boolean
  placeholder?: string
  defaultValue?: string
  options?: CustomFieldOption[]
  validation?: {
    min?: number
    max?: number
    pattern?: string
    message?: string
  }
  isActive: boolean
  order: number
  created_at: string
  updated_at: string
}

const CustomFieldsManager: React.FC = () => {
  const { state } = useAppContext()

  const [customFields, setCustomFields] = useState<CustomField[]>([])
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [editingField, setEditingField] = useState<CustomField | null>(null)
  const [selectedEntity, setSelectedEntity] = useState<string>("all")
  const [isLoading, setIsLoading] = useState(false)
  const [newField, setNewField] = useState<Partial<CustomField>>({
    name: "",
    label: "",
    type: "text",
    entity: "client",
    required: false,
    isActive: true,
    order: 0,
    options: [],
  })

  // Check if custom fields are enabled
  const isCustomFieldsEnabled = configService.getFeature("enableCustomFields")

  useEffect(() => {
    if (isCustomFieldsEnabled) {
      loadCustomFields()
    }
  }, [isCustomFieldsEnabled])

  const loadCustomFields = async () => {
    setIsLoading(true)
    try {
      // Load custom fields from service (mock data for now)
      const mockFields: CustomField[] = [
        {
          id: "1",
          name: "industry",
          label: "Industry",
          type: "select",
          entity: "client",
          required: false,
          options: [
            { id: "1", label: "Technology", value: "technology" },
            { id: "2", label: "Healthcare", value: "healthcare" },
            { id: "3", label: "Finance", value: "finance" },
            { id: "4", label: "Education", value: "education" },
            { id: "5", label: "Retail", value: "retail" },
          ],
          isActive: true,
          order: 1,
          created_at: "2025-01-15T09:00:00Z",
          updated_at: "2025-01-20T14:30:00Z",
        },
        {
          id: "2",
          name: "annual_revenue",
          label: "Annual Revenue",
          type: "currency",
          entity: "client",
          required: false,
          placeholder: "Enter annual revenue",
          validation: {
            min: 0,
            message: "Revenue must be a positive number",
          },
          isActive: true,
          order: 2,
          created_at: "2025-01-15T09:00:00Z",
          updated_at: "2025-01-15T09:00:00Z",
        },
        {
          id: "3",
          name: "project_complexity",
          label: "Project Complexity",
          type: "select",
          entity: "project",
          required: true,
          options: [
            { id: "1", label: "Low", value: "low" },
            { id: "2", label: "Medium", value: "medium" },
            { id: "3", label: "High", value: "high" },
            { id: "4", label: "Very High", value: "very_high" },
          ],
          isActive: true,
          order: 1,
          created_at: "2025-01-16T10:00:00Z",
          updated_at: "2025-01-16T10:00:00Z",
        },
        {
          id: "4",
          name: "lead_source",
          label: "Lead Source",
          type: "select",
          entity: "lead",
          required: false,
          options: [
            { id: "1", label: "Website", value: "website" },
            { id: "2", label: "Referral", value: "referral" },
            { id: "3", label: "Social Media", value: "social_media" },
            { id: "4", label: "Cold Outreach", value: "cold_outreach" },
            { id: "5", label: "Event", value: "event" },
          ],
          isActive: true,
          order: 1,
          created_at: "2025-01-17T11:00:00Z",
          updated_at: "2025-01-17T11:00:00Z",
        },
        {
          id: "5",
          name: "special_requirements",
          label: "Special Requirements",
          type: "textarea",
          entity: "project",
          required: false,
          placeholder: "Describe any special requirements or considerations",
          isActive: true,
          order: 2,
          created_at: "2025-01-18T12:00:00Z",
          updated_at: "2025-01-18T12:00:00Z",
        },
        {
          id: "6",
          name: "is_priority_client",
          label: "Priority Client",
          type: "checkbox",
          entity: "client",
          required: false,
          defaultValue: "false",
          isActive: true,
          order: 3,
          created_at: "2025-01-19T13:00:00Z",
          updated_at: "2025-01-19T13:00:00Z",
        },
      ]
      setCustomFields(mockFields)
    } catch (error) {
      console.error("Failed to load custom fields:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleCreateField = async () => {
    if (!newField.name || !newField.label) {
      alert("Please fill in all required fields")
      return
    }

    const field: CustomField = {
      id: Date.now().toString(),
      name: newField.name!,
      label: newField.label!,
      type: newField.type!,
      entity: newField.entity!,
      required: newField.required!,
      placeholder: newField.placeholder,
      defaultValue: newField.defaultValue,
      options: newField.options,
      validation: newField.validation,
      isActive: newField.isActive!,
      order: customFields.filter((f) => f.entity === newField.entity).length + 1,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }

    setCustomFields((prev) => [...prev, field])
    setShowCreateModal(false)
    resetNewField()
  }

  const handleUpdateField = async () => {
    if (!editingField) return

    setCustomFields((prev) =>
      prev.map((field) =>
        field.id === editingField.id ? { ...editingField, updated_at: new Date().toISOString() } : field,
      ),
    )
    setEditingField(null)
  }

  const handleDeleteField = async (fieldId: string) => {
    if (confirm("Are you sure you want to delete this custom field? This action cannot be undone.")) {
      setCustomFields((prev) => prev.filter((field) => field.id !== fieldId))
    }
  }

  const toggleFieldStatus = async (fieldId: string) => {
    setCustomFields((prev) =>
      prev.map((field) =>
        field.id === fieldId ? { ...field, isActive: !field.isActive, updated_at: new Date().toISOString() } : field,
      ),
    )
  }

  const resetNewField = () => {
    setNewField({
      name: "",
      label: "",
      type: "text",
      entity: "client",
      required: false,
      isActive: true,
      order: 0,
      options: [],
    })
  }

  const addOption = (field: Partial<CustomField>, setField: (field: Partial<CustomField>) => void) => {
    const newOption: CustomFieldOption = {
      id: Date.now().toString(),
      label: "",
      value: "",
    }
    setField({
      ...field,
      options: [...(field.options || []), newOption],
    })
  }

  const updateOption = (
    field: Partial<CustomField>,
    setField: (field: Partial<CustomField>) => void,
    optionId: string,
    updates: Partial<CustomFieldOption>,
  ) => {
    setField({
      ...field,
      options: field.options?.map((option) => (option.id === optionId ? { ...option, ...updates } : option)),
    })
  }

  const removeOption = (
    field: Partial<CustomField>,
    setField: (field: Partial<CustomField>) => void,
    optionId: string,
  ) => {
    setField({
      ...field,
      options: field.options?.filter((option) => option.id !== optionId),
    })
  }

  const getFieldTypeIcon = (type: string) => {
    switch (type) {
      case "text":
        return Type
      case "number":
        return Hash
      case "email":
        return Mail
      case "phone":
        return Phone
      case "url":
        return Link
      case "textarea":
        return FileText
      case "select":
      case "multiselect":
        return List
      case "checkbox":
        return ToggleLeft
      case "date":
      case "datetime":
        return Calendar
      case "currency":
        return DollarSign
      default:
        return Type
    }
  }

  const filteredFields = customFields.filter((field) => {
    if (selectedEntity === "all") return true
    return field.entity === selectedEntity
  })

  const fieldsByEntity = customFields.reduce(
    (acc, field) => {
      acc[field.entity] = (acc[field.entity] || 0) + 1
      return acc
    },
    {} as Record<string, number>,
  )

  if (!isCustomFieldsEnabled) {
    return (
      <div className="p-6">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-center">
            <AlertCircle className="h-5 w-5 text-yellow-600 mr-2" />
            <h3 className="text-sm font-medium text-yellow-800">Custom Fields Not Enabled</h3>
          </div>
          <p className="mt-2 text-sm text-yellow-700">
            Custom fields feature is currently disabled. Please enable them in Settings to create and manage custom
            fields.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Custom Fields</h1>
          <p className="text-gray-600 mt-1">Create and manage custom fields for your entities</p>
        </div>
        <div className="flex items-center space-x-3">
          <select
            value={selectedEntity}
            onChange={(e) => setSelectedEntity(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-2 text-sm"
          >
            <option value="all">All Entities</option>
            <option value="client">Clients</option>
            <option value="project">Projects</option>
            <option value="task">Tasks</option>
            <option value="lead">Leads</option>
            <option value="proposal">Proposals</option>
            <option value="invoice">Invoices</option>
          </select>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Field
          </button>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          {
            title: "Total Fields",
            value: customFields.length.toString(),
            icon: Settings,
            color: "blue",
          },
          {
            title: "Active Fields",
            value: customFields.filter((f) => f.isActive).length.toString(),
            icon: CheckCircle,
            color: "green",
          },
          {
            title: "Client Fields",
            value: (fieldsByEntity.client || 0).toString(),
            icon: Type,
            color: "purple",
          },
          {
            title: "Project Fields",
            value: (fieldsByEntity.project || 0).toString(),
            icon: FileText,
            color: "orange",
          },
        ].map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
              </div>
              <div className={`p-3 rounded-full bg-${stat.color}-100`}>
                <stat.icon className={`h-6 w-6 text-${stat.color}-600`} />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Custom Fields List */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Custom Fields</h2>
        </div>
        <div className="divide-y divide-gray-200">
          {filteredFields.map((field, index) => {
            const IconComponent = getFieldTypeIcon(field.type)
            return (
              <motion.div
                key={field.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="p-6 hover:bg-gray-50"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-blue-100 rounded-md">
                        <IconComponent className="h-4 w-4 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="text-lg font-medium text-gray-900">{field.label}</h3>
                        <p className="text-sm text-gray-500">Field name: {field.name}</p>
                      </div>
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded-full ${
                          field.isActive ? "text-green-600 bg-green-100" : "text-gray-600 bg-gray-100"
                        }`}
                      >
                        {field.isActive ? "Active" : "Inactive"}
                      </span>
                      {field.required && (
                        <span className="px-2 py-1 text-xs font-medium rounded-full text-red-600 bg-red-100">
                          Required
                        </span>
                      )}
                    </div>
                    <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                      <span className="capitalize">{field.type.replace("_", " ")}</span>
                      <span>•</span>
                      <span className="capitalize">{field.entity}</span>
                      {field.options && field.options.length > 0 && (
                        <>
                          <span>•</span>
                          <span>{field.options.length} options</span>
                        </>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => toggleFieldStatus(field.id)}
                      className={`p-2 rounded-md ${
                        field.isActive ? "text-gray-600 hover:bg-gray-100" : "text-green-600 hover:bg-green-100"
                      }`}
                      title={field.isActive ? "Deactivate field" : "Activate field"}
                    >
                      {field.isActive ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                    <button
                      onClick={() => setEditingField(field)}
                      className="p-2 text-gray-600 hover:bg-gray-100 rounded-md"
                      title="Edit field"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteField(field.id)}
                      className="p-2 text-red-600 hover:bg-red-100 rounded-md"
                      title="Delete field"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </motion.div>
            )
          })}
        </div>
      </div>

      {/* Empty State */}
      {filteredFields.length === 0 && (
        <div className="text-center py-12">
          <Settings className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No custom fields found</h3>
          <p className="text-gray-600 mb-4">
            {selectedEntity === "all"
              ? "Create your first custom field to get started"
              : `No custom fields found for ${selectedEntity}`}
          </p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Field
          </button>
        </div>
      )}

      {/* Create/Edit Modal */}
      {(showCreateModal || editingField) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-semibold text-gray-900">
                  {editingField ? "Edit Custom Field" : "Create Custom Field"}
                </h3>
                <button
                  onClick={() => {
                    setShowCreateModal(false)
                    setEditingField(null)
                    resetNewField()
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
            </div>
            <div className="p-6 space-y-6">
              {/* Basic Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Field Name *</label>
                  <input
                    type="text"
                    value={editingField ? editingField.name : newField.name}
                    onChange={(e) => {
                      const value = e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, "_")
                      if (editingField) {
                        setEditingField({ ...editingField, name: value })
                      } else {
                        setNewField({ ...newField, name: value })
                      }
                    }}
                    placeholder="field_name"
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                  />
                  <p className="text-xs text-gray-500 mt-1">Used internally (lowercase, underscores only)</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Display Label *</label>
                  <input
                    type="text"
                    value={editingField ? editingField.label : newField.label}
                    onChange={(e) => {
                      if (editingField) {
                        setEditingField({ ...editingField, label: e.target.value })
                      } else {
                        setNewField({ ...newField, label: e.target.value })
                      }
                    }}
                    placeholder="Field Label"
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Field Type</label>
                  <select
                    value={editingField ? editingField.type : newField.type}
                    onChange={(e) => {
                      const type = e.target.value as CustomField["type"]
                      if (editingField) {
                        setEditingField({ ...editingField, type })
                      } else {
                        setNewField({ ...newField, type })
                      }
                    }}
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                  >
                    <option value="text">Text</option>
                    <option value="number">Number</option>
                    <option value="email">Email</option>
                    <option value="phone">Phone</option>
                    <option value="url">URL</option>
                    <option value="textarea">Textarea</option>
                    <option value="select">Select (Dropdown)</option>
                    <option value="multiselect">Multi-Select</option>
                    <option value="checkbox">Checkbox</option>
                    <option value="date">Date</option>
                    <option value="datetime">Date & Time</option>
                    <option value="currency">Currency</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Entity</label>
                  <select
                    value={editingField ? editingField.entity : newField.entity}
                    onChange={(e) => {
                      const entity = e.target.value as CustomField["entity"]
                      if (editingField) {
                        setEditingField({ ...editingField, entity })
                      } else {
                        setNewField({ ...newField, entity })
                      }
                    }}
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                  >
                    <option value="client">Client</option>
                    <option value="project">Project</option>
                    <option value="task">Task</option>
                    <option value="lead">Lead</option>
                    <option value="proposal">Proposal</option>
                    <option value="invoice">Invoice</option>
                  </select>
                </div>
              </div>

              {/* Options for select fields */}
              {(editingField?.type === "select" ||
                editingField?.type === "multiselect" ||
                newField.type === "select" ||
                newField.type === "multiselect") && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Options</label>
                  <div className="space-y-2">
                    {(editingField ? editingField.options : newField.options)?.map((option, index) => (
                      <div key={option.id} className="flex items-center space-x-2">
                        <input
                          type="text"
                          value={option.label}
                          onChange={(e) => {
                            if (editingField) {
                              updateOption(editingField, (field) => setEditingField(field as CustomField), option.id, {
                                label: e.target.value,
                                value: e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, "_"),
                              })
                            } else {
                              updateOption(newField, setNewField, option.id, {
                                label: e.target.value,
                                value: e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, "_"),
                              })
                            }
                          }}
                          placeholder="Option label"
                          className="flex-1 border border-gray-300 rounded-md px-3 py-2"
                        />
                        <button
                          onClick={() => {
                            if (editingField) {
                              removeOption(editingField, (field) => setEditingField(field as CustomField), option.id)
                            } else {
                              removeOption(newField, setNewField, option.id)
                            }
                          }}
                          className="p-2 text-red-600 hover:bg-red-100 rounded-md"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                    <button
                      onClick={() => {
                        if (editingField) {
                          addOption(editingField, (field) => setEditingField(field as CustomField))
                        } else {
                          addOption(newField, setNewField)
                        }
                      }}
                      className="flex items-center px-3 py-2 text-blue-600 hover:bg-blue-100 rounded-md"
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Add Option
                    </button>
                  </div>
                </div>
              )}

              {/* Additional Settings */}
              <div className="space-y-4">
                <div className="flex items-center space-x-4">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={editingField ? editingField.required : newField.required}
                      onChange={(e) => {
                        if (editingField) {
                          setEditingField({ ...editingField, required: e.target.checked })
                        } else {
                          setNewField({ ...newField, required: e.target.checked })
                        }
                      }}
                      className="mr-2"
                    />
                    Required field
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={editingField ? editingField.isActive : newField.isActive}
                      onChange={(e) => {
                        if (editingField) {
                          setEditingField({ ...editingField, isActive: e.target.checked })
                        } else {
                          setNewField({ ...newField, isActive: e.target.checked })
                        }
                      }}
                      className="mr-2"
                    />
                    Active
                  </label>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Placeholder Text</label>
                  <input
                    type="text"
                    value={editingField ? editingField.placeholder || "" : newField.placeholder || ""}
                    onChange={(e) => {
                      if (editingField) {
                        setEditingField({ ...editingField, placeholder: e.target.value })
                      } else {
                        setNewField({ ...newField, placeholder: e.target.value })
                      }
                    }}
                    placeholder="Enter placeholder text"
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-3 p-6 border-t border-gray-200">
              <button
                onClick={() => {
                  setShowCreateModal(false)
                  setEditingField(null)
                  resetNewField()
                }}
                className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={editingField ? handleUpdateField : handleCreateField}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                <Save className="h-4 w-4 mr-2" />
                {editingField ? "Update Field" : "Create Field"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default CustomFieldsManager
