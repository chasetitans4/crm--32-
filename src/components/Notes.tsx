"use client"

import React, { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Plus, Search, Edit, Trash2, Pin, UserIcon, Users, Clock, X, Save, StickyNote } from "lucide-react"

interface Note {
  id: string
  title: string
  content: string
  color: string
  isPinned: boolean
  isPrivate: boolean
  createdBy: string
  createdByName: string
  assignedTo?: string
  assignedToName?: string
  createdAt: string
  updatedAt: string
  tags: string[]
}

interface AppUser {
  id: string
  name: string
  role: string
}

const Notes: React.FC = () => {
  const [notes, setNotes] = useState<Note[]>([])
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [selectedNote, setSelectedNote] = useState<Note | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterBy, setFilterBy] = useState<"all" | "mine" | "assigned" | "pinned">("all")
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")

  // Form states
  const [noteForm, setNoteForm] = useState({
    title: "",
    content: "",
    color: "#fef3c7", // yellow-100
    isPinned: false,
    isPrivate: false,
    assignedTo: "",
    tags: [] as string[],
  })

  const [tagInput, setTagInput] = useState("")

  // Mock current user - in real app, this would come from auth context
  const currentUser = {
    id: "user-1",
    name: "John Admin",
    role: "admin",
  }

  // Mock users for assignment
  const users: AppUser[] = [
    { id: "user-1", name: "John Admin", role: "admin" },
    { id: "user-2", name: "Sarah Agent", role: "agent" },
    { id: "user-3", name: "Mike Manager", role: "manager" },
    { id: "user-4", name: "Lisa Agent", role: "agent" },
  ]

  // Color options for notes
  const colorOptions = [
    { name: "Yellow", value: "#fef3c7", class: "bg-yellow-100" },
    { name: "Blue", value: "#dbeafe", class: "bg-blue-100" },
    { name: "Green", value: "#dcfce7", class: "bg-green-100" },
    { name: "Pink", value: "#fce7f3", class: "bg-pink-100" },
    { name: "Purple", value: "#e9d5ff", class: "bg-purple-100" },
    { name: "Orange", value: "#fed7aa", class: "bg-orange-100" },
    { name: "Gray", value: "#f3f4f6", class: "bg-gray-100" },
  ]

  // Mock notes data
  useEffect(() => {
    const mockNotes: Note[] = [
      {
        id: "1",
        title: "Team Meeting Notes",
        content: "Discussed Q4 goals and upcoming projects. Need to follow up on client feedback.",
        color: "#fef3c7",
        isPinned: true,
        isPrivate: false,
        createdBy: "user-1",
        createdByName: "John Admin",
        assignedTo: "user-2",
        assignedToName: "Sarah Agent",
        createdAt: "2024-01-15T10:30:00Z",
        updatedAt: "2024-01-15T10:30:00Z",
        tags: ["meeting", "important"],
      },
      {
        id: "2",
        title: "Client Requirements",
        content: "New client wants e-commerce site with payment integration. Budget: $15k",
        color: "#dbeafe",
        isPinned: false,
        isPrivate: false,
        createdBy: "user-2",
        createdByName: "Sarah Agent",
        createdAt: "2024-01-14T14:20:00Z",
        updatedAt: "2024-01-14T14:20:00Z",
        tags: ["client", "project"],
      },
      {
        id: "3",
        title: "Personal Reminder",
        content: "Review and update portfolio website this weekend.",
        color: "#dcfce7",
        isPinned: false,
        isPrivate: true,
        createdBy: "user-1",
        createdByName: "John Admin",
        createdAt: "2024-01-13T09:15:00Z",
        updatedAt: "2024-01-13T09:15:00Z",
        tags: ["personal"],
      },
    ]
    setNotes(mockNotes)
  }, [])

  const handleCreateNote = () => {
    const newNote: Note = {
      id: Date.now().toString(),
      title: noteForm.title || "Untitled Note",
      content: noteForm.content,
      color: noteForm.color,
      isPinned: noteForm.isPinned,
      isPrivate: noteForm.isPrivate,
      createdBy: currentUser.id,
      createdByName: currentUser.name,
      assignedTo: noteForm.assignedTo || undefined,
      assignedToName: noteForm.assignedTo ? users.find((u) => u.id === noteForm.assignedTo)?.name : undefined,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      tags: noteForm.tags,
    }

    setNotes([newNote, ...notes])
    resetForm()
    setShowCreateModal(false)
  }

  const handleEditNote = () => {
    if (!selectedNote) return

    const updatedNote: Note = {
      ...selectedNote,
      title: noteForm.title || "Untitled Note",
      content: noteForm.content,
      color: noteForm.color,
      isPinned: noteForm.isPinned,
      isPrivate: noteForm.isPrivate,
      assignedTo: noteForm.assignedTo || undefined,
      assignedToName: noteForm.assignedTo ? users.find((u) => u.id === noteForm.assignedTo)?.name : undefined,
      updatedAt: new Date().toISOString(),
      tags: noteForm.tags,
    }

    setNotes(notes.map((note) => (note.id === selectedNote.id ? updatedNote : note)))
    resetForm()
    setShowEditModal(false)
    setSelectedNote(null)
  }

  const handleDeleteNote = (noteId: string) => {
    setNotes(notes.filter((note) => note.id !== noteId))
  }

  const handlePinNote = (noteId: string) => {
    setNotes(notes.map((note) => (note.id === noteId ? { ...note, isPinned: !note.isPinned } : note)))
  }

  const resetForm = () => {
    setNoteForm({
      title: "",
      content: "",
      color: "#fef3c7",
      isPinned: false,
      isPrivate: false,
      assignedTo: "",
      tags: [],
    })
    setTagInput("")
  }

  const openEditModal = (note: Note) => {
    setSelectedNote(note)
    setNoteForm({
      title: note.title,
      content: note.content,
      color: note.color,
      isPinned: note.isPinned,
      isPrivate: note.isPrivate,
      assignedTo: note.assignedTo || "",
      tags: note.tags,
    })
    setShowEditModal(true)
  }

  const addTag = () => {
    if (tagInput.trim() && !noteForm.tags.includes(tagInput.trim())) {
      setNoteForm({
        ...noteForm,
        tags: [...noteForm.tags, tagInput.trim()],
      })
      setTagInput("")
    }
  }

  const removeTag = (tagToRemove: string) => {
    setNoteForm({
      ...noteForm,
      tags: noteForm.tags.filter((tag) => tag !== tagToRemove),
    })
  }

  const filteredNotes = notes.filter((note) => {
    const matchesSearch =
      note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      note.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
      note.tags.some((tag) => tag.toLowerCase().includes(searchTerm.toLowerCase()))

    const matchesFilter = (() => {
      switch (filterBy) {
        case "mine":
          return note.createdBy === currentUser.id
        case "assigned":
          return note.assignedTo === currentUser.id
        case "pinned":
          return note.isPinned
        default:
          return true
      }
    })()

    // Don't show private notes unless they belong to current user
    const canView = !note.isPrivate || note.createdBy === currentUser.id || note.assignedTo === currentUser.id

    return matchesSearch && matchesFilter && canView
  })

  const sortedNotes = [...filteredNotes].sort((a, b) => {
    if (a.isPinned && !b.isPinned) return -1
    if (!a.isPinned && b.isPinned) return 1
    return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
  })

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString() + " " + date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  }

  const NoteModal = ({ isEdit = false }: { isEdit?: boolean }) => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-semibold">{isEdit ? "Edit Note" : "Create New Note"}</h3>
            <button
              onClick={() => {
                if (isEdit) {
                  setShowEditModal(false)
                  setSelectedNote(null)
                } else {
                  setShowCreateModal(false)
                }
                resetForm()
              }}
              className="text-gray-500 hover:text-gray-700"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          <div className="space-y-4">
            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
              <input
                type="text"
                value={noteForm.title}
                onChange={(e) => setNoteForm({ ...noteForm, title: e.target.value })}
                placeholder="Enter note title"
                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Content */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Content</label>
              <textarea
                value={noteForm.content}
                onChange={(e) => setNoteForm({ ...noteForm, content: e.target.value })}
                placeholder="Enter note content"
                rows={6}
                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Color Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Color</label>
              <div className="flex gap-2 flex-wrap">
                {colorOptions.map((color) => (
                  <button
                    key={color.value}
                    onClick={() => setNoteForm({ ...noteForm, color: color.value })}
                    className={`w-8 h-8 rounded-full border-2 ${color.class} ${
                      noteForm.color === color.value ? "border-gray-800" : "border-gray-300"
                    }`}
                    title={color.name}
                  />
                ))}
              </div>
            </div>

            {/* Assignment */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Assign To (Optional)</label>
              <select
                value={noteForm.assignedTo}
                onChange={(e) => setNoteForm({ ...noteForm, assignedTo: e.target.value })}
                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Select user...</option>
                {users
                  .filter((user) => user.id !== currentUser.id)
                  .map((user) => (
                    <option key={user.id} value={user.id}>
                      {user.name} ({user.role})
                    </option>
                  ))}
              </select>
            </div>

            {/* Tags */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tags</label>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addTag())}
                  placeholder="Add tag"
                  className="flex-1 p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <button onClick={addTag} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
                  Add
                </button>
              </div>
              <div className="flex gap-1 flex-wrap">
                {noteForm.tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 text-gray-700 rounded text-sm"
                  >
                    {tag}
                    <button onClick={() => removeTag(tag)} className="text-gray-500 hover:text-gray-700">
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
              </div>
            </div>

            {/* Options */}
            <div className="flex gap-4">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={noteForm.isPinned}
                  onChange={(e) => setNoteForm({ ...noteForm, isPinned: e.target.checked })}
                  className="rounded"
                />
                <span className="text-sm text-gray-700">Pin this note</span>
              </label>

              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={noteForm.isPrivate}
                  onChange={(e) => setNoteForm({ ...noteForm, isPrivate: e.target.checked })}
                  className="rounded"
                />
                <span className="text-sm text-gray-700">Private note</span>
              </label>
            </div>
          </div>

          <div className="flex justify-end gap-2 mt-6 pt-4 border-t">
            <button
              onClick={() => {
                if (isEdit) {
                  setShowEditModal(false)
                  setSelectedNote(null)
                } else {
                  setShowCreateModal(false)
                }
                resetForm()
              }}
              className="px-4 py-2 text-gray-600 hover:text-gray-800"
            >
              Cancel
            </button>
            <button
              onClick={isEdit ? handleEditNote : handleCreateNote}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center gap-2"
            >
              <Save className="h-4 w-4" />
              {isEdit ? "Update Note" : "Create Note"}
            </button>
          </div>
        </div>
      </div>
    </div>
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <StickyNote className="h-6 w-6" />
            Notes
          </h2>
          <p className="text-gray-600 mt-1">Create and manage sticky notes for yourself and your team</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          New Note
        </button>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-lg shadow-sm border p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search notes..."
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          <div className="flex gap-2">
            <select
              value={filterBy}
              onChange={(e) => setFilterBy(e.target.value as any)}
              className="px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Notes</option>
              <option value="mine">My Notes</option>
              <option value="assigned">Assigned to Me</option>
              <option value="pinned">Pinned</option>
            </select>

            <div className="flex border rounded-lg">
              <button
                onClick={() => setViewMode("grid")}
                className={`px-3 py-2 ${
                  viewMode === "grid" ? "bg-blue-600 text-white" : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                Grid
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`px-3 py-2 ${
                  viewMode === "list" ? "bg-blue-600 text-white" : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                List
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Notes Display */}
      {sortedNotes.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm border p-12 text-center">
          <StickyNote className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No notes found</h3>
          <p className="text-gray-600 mb-4">
            {searchTerm || filterBy !== "all"
              ? "Try adjusting your search or filter criteria."
              : "Create your first note to get started."}
          </p>
          {!searchTerm && filterBy === "all" && (
            <button
              onClick={() => setShowCreateModal(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
            >
              Create Note
            </button>
          )}
        </div>
      ) : (
        <div
          className={
            viewMode === "grid" ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4" : "space-y-4"
          }
        >
          {sortedNotes.map((note) => (
            <motion.div
              key={note.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className={`relative group ${
                viewMode === "grid" ? "aspect-square" : "flex items-start gap-4 bg-white border rounded-lg p-4"
              }`}
            >
              {viewMode === "grid" ? (
                <div
                  className="w-full h-full p-4 rounded-lg shadow-sm border hover:shadow-md transition-shadow cursor-pointer"
                  style={{ backgroundColor: note.color }}
                  onClick={() => openEditModal(note)}
                >
                  {/* Pin indicator */}
                  {note.isPinned && <Pin className="absolute top-2 right-2 h-4 w-4 text-gray-600" />}

                  {/* Privacy indicator */}
                  {note.isPrivate && <UserIcon className="absolute top-2 left-2 h-4 w-4 text-gray-600" />}

                  {/* Content */}
                  <div className="h-full flex flex-col">
                    <h3 className="font-medium text-gray-900 mb-2 line-clamp-2">{note.title}</h3>
                    <p className="text-sm text-gray-700 flex-1 line-clamp-4 mb-3">{note.content}</p>

                    {/* Tags */}
                    {note.tags.length > 0 && (
                      <div className="flex gap-1 flex-wrap mb-2">
                        {note.tags.slice(0, 2).map((tag) => (
                          <span key={tag} className="px-2 py-1 bg-white bg-opacity-70 text-xs rounded">
                            {tag}
                          </span>
                        ))}
                        {note.tags.length > 2 && (
                          <span className="px-2 py-1 bg-white bg-opacity-70 text-xs rounded">
                            +{note.tags.length - 2}
                          </span>
                        )}
                      </div>
                    )}

                    {/* Footer */}
                    <div className="text-xs text-gray-600 space-y-1">
                      <div className="flex items-center gap-1">
                        <UserIcon className="h-3 w-3" />
                        {note.createdByName}
                      </div>
                      {note.assignedToName && (
                        <div className="flex items-center gap-1">
                          <Users className="h-3 w-3" />→ {note.assignedToName}
                        </div>
                      )}
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {formatDate(note.updatedAt)}
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="absolute top-2 right-8 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        handlePinNote(note.id)
                      }}
                      className={`p-1 rounded ${
                        note.isPinned ? "bg-yellow-200 text-yellow-800" : "bg-white text-gray-600 hover:bg-gray-100"
                      }`}
                      title={note.isPinned ? "Unpin" : "Pin"}
                    >
                      <Pin className="h-3 w-3" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        openEditModal(note)
                      }}
                      className="p-1 bg-white text-gray-600 rounded hover:bg-gray-100"
                      title="Edit"
                    >
                      <Edit className="h-3 w-3" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        if (confirm("Are you sure you want to delete this note?")) {
                          handleDeleteNote(note.id)
                        }
                      }}
                      className="p-1 bg-white text-red-600 rounded hover:bg-red-100"
                      title="Delete"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  {/* List view */}
                  <div className="w-4 h-16 rounded" style={{ backgroundColor: note.color }} />
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-medium text-gray-900 flex items-center gap-2">
                        {note.title}
                        {note.isPinned && <Pin className="h-4 w-4 text-yellow-600" />}
                        {note.isPrivate && <UserIcon className="h-4 w-4 text-gray-600" />}
                      </h3>
                      <div className="flex gap-1">
                        <button
                          onClick={() => handlePinNote(note.id)}
                          className={`p-1 rounded ${
                            note.isPinned ? "bg-yellow-200 text-yellow-800" : "text-gray-400 hover:text-gray-600"
                          }`}
                        >
                          <Pin className="h-4 w-4" />
                        </button>
                        <button onClick={() => openEditModal(note)} className="p-1 text-gray-400 hover:text-gray-600">
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm("Are you sure you want to delete this note?")) {
                              handleDeleteNote(note.id)
                            }
                          }}
                          className="p-1 text-gray-400 hover:text-red-600"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                    <p className="text-gray-700 mb-2 line-clamp-2">{note.content}</p>

                    {/* Tags */}
                    {note.tags.length > 0 && (
                      <div className="flex gap-1 flex-wrap mb-2">
                        {note.tags.map((tag) => (
                          <span key={tag} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}

                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <div className="flex items-center gap-4">
                        <span>By {note.createdByName}</span>
                        {note.assignedToName && <span>→ {note.assignedToName}</span>}
                      </div>
                      <span>{formatDate(note.updatedAt)}</span>
                    </div>
                  </div>
                </>
              )}
            </motion.div>
          ))}
        </div>
      )}

      {/* Modals */}
      {showCreateModal && <NoteModal />}
      {showEditModal && <NoteModal isEdit />}
    </div>
  )
}

export default Notes
