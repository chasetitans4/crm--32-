"use client"

import React, { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Search,
  Filter,
  Save,
  Clock,
  X,
  Users,
  Briefcase,
  CheckSquare,
  Mail,
  DollarSign,
  FileText,
  Star,
  Trash2,
  Settings,
  Grid,
  List,
} from "lucide-react"
import { useAppContext } from "../context/AppContext"
import { searchService as searchAPI } from "../services/searchService"

interface SearchFilter {
  field: string
  operator:
    | "equals"
    | "contains"
    | "starts_with"
    | "ends_with"
    | "greater_than"
    | "less_than"
    | "between"
    | "in"
    | "not_in"
  value: string | string[] | { min: string; max: string }
  label: string
}

interface SavedSearch {
  id: string
  name: string
  query: string
  filters: SearchFilter[]
  entityTypes: string[]
  sortBy: string
  sortOrder: "asc" | "desc"
  isStarred: boolean
  created_at: string
  last_used: string
}

interface SearchResult {
  id: string
  type: "client" | "project" | "task" | "lead" | "proposal" | "invoice" | "document"
  title: string
  subtitle: string
  description: string
  metadata: Record<string, any>
  relevance: number
  created_at: string
  updated_at: string
}

const EnhancedSearch: React.FC = () => {
  const { state } = useAppContext()
  const { clients, tasks, projects } = state

  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState<SearchResult[]>([])
  const [savedSearches, setSavedSearches] = useState<SavedSearch[]>([])
  const [activeFilters, setActiveFilters] = useState<SearchFilter[]>([])
  const [selectedEntityTypes, setSelectedEntityTypes] = useState<string[]>(["all"])
  const [sortBy, setSortBy] = useState("relevance")
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc")
  const [viewMode, setViewMode] = useState<"list" | "grid">("list")
  const [showFilters, setShowFilters] = useState(false)
  const [showSaveModal, setShowSaveModal] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [recentSearches, setRecentSearches] = useState<string[]>([])
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)

  const searchInputRef = useRef<HTMLInputElement>(null)
  const searchTimeout = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    loadSavedSearches()
    loadRecentSearches()
  }, [])

  useEffect(() => {
    if (searchQuery.length > 0) {
      generateSuggestions(searchQuery)
      if (searchTimeout.current) {
        clearTimeout(searchTimeout.current)
      }
      searchTimeout.current = setTimeout(() => {
        performSearch()
      }, 300)
    } else {
      setSearchResults([])
      setSuggestions([])
    }

    return () => {
      if (searchTimeout.current) {
        clearTimeout(searchTimeout.current)
      }
    }
  }, [searchQuery, activeFilters, selectedEntityTypes, sortBy, sortOrder])

  const loadSavedSearches = async () => {
    // Load saved searches from service (mock data for now)
    const mockSavedSearches: SavedSearch[] = [
      {
        id: "1",
        name: "Active High-Value Clients",
        query: "status:active",
        filters: [
          {
            field: "status",
            operator: "equals",
            value: "active",
            label: "Status is Active",
          },
          {
            field: "value",
            operator: "greater_than",
            value: "10000",
            label: "Value > $10,000",
          },
        ],
        entityTypes: ["client"],
        sortBy: "value",
        sortOrder: "desc",
        isStarred: true,
        created_at: "2025-01-15T09:00:00Z",
        last_used: "2025-01-30T10:30:00Z",
      },
      {
        id: "2",
        name: "Overdue Tasks",
        query: "overdue",
        filters: [
          {
            field: "due_date",
            operator: "less_than",
            value: new Date().toISOString().split("T")[0],
            label: "Due date is past",
          },
          {
            field: "status",
            operator: "not_in",
            value: ["completed", "cancelled"],
            label: "Status not completed or cancelled",
          },
        ],
        entityTypes: ["task"],
        sortBy: "due_date",
        sortOrder: "asc",
        isStarred: false,
        created_at: "2025-01-20T14:30:00Z",
        last_used: "2025-01-29T16:45:00Z",
      },
      {
        id: "3",
        name: "Recent Projects",
        query: "project",
        filters: [
          {
            field: "created_at",
            operator: "greater_than",
            value: "2025-01-01",
            label: "Created this year",
          },
        ],
        entityTypes: ["project"],
        sortBy: "created_at",
        sortOrder: "desc",
        isStarred: true,
        created_at: "2025-01-25T11:15:00Z",
        last_used: "2025-01-30T09:20:00Z",
      },
    ]
    setSavedSearches(mockSavedSearches)
  }

  const loadRecentSearches = () => {
    // Load from localStorage or service
    const recent = ["web design", "status:active", "john smith", "overdue tasks", "project budget"]
    setRecentSearches(recent)
  }

  const generateSuggestions = (query: string) => {
    // Generate search suggestions based on query
    const suggestions = [
      `${query} status:active`,
      `${query} created:today`,
      `${query} priority:high`,
      `${query} assigned:me`,
      `${query} type:project`,
    ].filter((s) => s !== query)
    setSuggestions(suggestions.slice(0, 5))
    setShowSuggestions(true)
  }

  const performSearch = async () => {
    if (!searchQuery.trim()) {
      setSearchResults([])
      return
    }

    setIsLoading(true)
    try {
      // Simulate search API call with mock results
      // await new Promise((resolve) => setTimeout(resolve, 500))
      
      // Convert SearchFilter[] to SearchFilters object
      const searchFilters: import('../services/searchService').SearchFilters = {
        types: selectedEntityTypes.includes('all') ? undefined : selectedEntityTypes as any[]
      }
      
      const apiResults = await searchAPI.search(searchQuery, searchFilters)

      const mockResults: SearchResult[] = [
        {
          id: "1",
          type: "client",
          title: "Acme Corporation",
          subtitle: "john.doe@acme.com",
          description: "Technology company specializing in web development and digital solutions",
          metadata: {
            status: "active",
            value: "$25,000",
            projects: 3,
            last_contact: "2025-01-29",
          },
          relevance: 95,
          created_at: "2025-01-15T09:00:00Z",
          updated_at: "2025-01-29T14:30:00Z",
        },
        {
          id: "2",
          type: "project",
          title: "E-commerce Website Redesign",
          subtitle: "Acme Corporation",
          description: "Complete redesign of the company's e-commerce platform with modern UI/UX",
          metadata: {
            status: "in_progress",
            budget: "$15,000",
            progress: "65%",
            due_date: "2025-02-15",
          },
          relevance: 88,
          created_at: "2025-01-10T10:00:00Z",
          updated_at: "2025-01-30T11:20:00Z",
        },
        {
          id: "3",
          type: "task",
          title: "Design Homepage Mockups",
          subtitle: "E-commerce Website Redesign",
          description: "Create initial homepage design mockups for client review",
          metadata: {
            status: "completed",
            assignee: "Sarah Johnson",
            priority: "high",
            completed_at: "2025-01-28",
          },
          relevance: 82,
          created_at: "2025-01-12T14:00:00Z",
          updated_at: "2025-01-28T16:45:00Z",
        },
        {
          id: "4",
          type: "proposal",
          title: "Mobile App Development Proposal",
          subtitle: "TechStart Inc.",
          description: "Proposal for developing a cross-platform mobile application",
          metadata: {
            status: "sent",
            amount: "$35,000",
            sent_date: "2025-01-25",
            expires: "2025-02-25",
          },
          relevance: 75,
          created_at: "2025-01-20T09:30:00Z",
          updated_at: "2025-01-25T10:15:00Z",
        },
        {
          id: "5",
          type: "lead",
          title: "Global Solutions Ltd",
          subtitle: "contact@globalsolutions.com",
          description: "Potential client interested in digital transformation services",
          metadata: {
            status: "qualified",
            source: "website",
            estimated_value: "$50,000",
            last_contact: "2025-01-28",
          },
          relevance: 70,
          created_at: "2025-01-22T11:00:00Z",
          updated_at: "2025-01-28T15:30:00Z",
        },
      ]

      // Apply filters and sorting
      let filteredResults = mockResults

      // Filter by entity types
      if (!selectedEntityTypes.includes("all")) {
        filteredResults = filteredResults.filter((result) => selectedEntityTypes.includes(result.type))
      }

      // Apply custom filters
      activeFilters.forEach((filter) => {
        filteredResults = filteredResults.filter((result) => {
          const fieldValue = result.metadata[filter.field] || result[filter.field as keyof SearchResult]
          if (!fieldValue) return false

          switch (filter.operator) {
            case "equals":
              return fieldValue === filter.value
            case "contains":
              return fieldValue.toString().toLowerCase().includes(filter.value.toString().toLowerCase())
            case "starts_with":
              return fieldValue.toString().toLowerCase().startsWith(filter.value.toString().toLowerCase())
            case "ends_with":
              return fieldValue.toString().toLowerCase().endsWith(filter.value.toString().toLowerCase())
            case "greater_than":
              return Number.parseFloat(fieldValue) > Number.parseFloat(filter.value.toString())
            case "less_than":
              return Number.parseFloat(fieldValue) < Number.parseFloat(filter.value.toString())
            case "in":
              return Array.isArray(filter.value) && filter.value.includes(fieldValue)
            case "not_in":
              return Array.isArray(filter.value) && !filter.value.includes(fieldValue)
            default:
              return true
          }
        })
      })

      // Sort results
      filteredResults.sort((a, b) => {
        let aValue, bValue

        if (sortBy === "relevance") {
          aValue = a.relevance
          bValue = b.relevance
        } else {
          aValue = a.metadata[sortBy] || a[sortBy as keyof SearchResult]
          bValue = b.metadata[sortBy] || b[sortBy as keyof SearchResult]
        }

        if (typeof aValue === "string" && typeof bValue === "string") {
          return sortOrder === "asc" ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue)
        }

        if (typeof aValue === "number" && typeof bValue === "number") {
          return sortOrder === "asc" ? aValue - bValue : bValue - aValue
        }

        return 0
      })

      setSearchResults(filteredResults)

      // Add to recent searches
      if (!recentSearches.includes(searchQuery)) {
        setRecentSearches((prev) => [searchQuery, ...prev.slice(0, 4)])
      }
    } catch (error) {
      console.error("Search failed:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSaveSearch = async (name: string) => {
    const newSavedSearch: SavedSearch = {
      id: Date.now().toString(),
      name,
      query: searchQuery,
      filters: activeFilters,
      entityTypes: selectedEntityTypes,
      sortBy,
      sortOrder,
      isStarred: false,
      created_at: new Date().toISOString(),
      last_used: new Date().toISOString(),
    }

    setSavedSearches((prev) => [newSavedSearch, ...prev])
    setShowSaveModal(false)
  }

  const loadSavedSearch = (savedSearch: SavedSearch) => {
    setSearchQuery(savedSearch.query)
    setActiveFilters(savedSearch.filters)
    setSelectedEntityTypes(savedSearch.entityTypes)
    setSortBy(savedSearch.sortBy)
    setSortOrder(savedSearch.sortOrder)

    // Update last used
    setSavedSearches((prev) =>
      prev.map((search) =>
        search.id === savedSearch.id ? { ...search, last_used: new Date().toISOString() } : search,
      ),
    )
  }

  const toggleStarredSearch = (searchId: string) => {
    setSavedSearches((prev) =>
      prev.map((search) => (search.id === searchId ? { ...search, isStarred: !search.isStarred } : search)),
    )
  }

  const deleteSavedSearch = (searchId: string) => {
    if (confirm("Are you sure you want to delete this saved search?")) {
      setSavedSearches((prev) => prev.filter((search) => search.id !== searchId))
    }
  }

  const addFilter = (filter: SearchFilter) => {
    setActiveFilters((prev) => [...prev, filter])
  }

  const removeFilter = (index: number) => {
    setActiveFilters((prev) => prev.filter((_, i) => i !== index))
  }

  const getEntityIcon = (type: string) => {
    switch (type) {
      case "client":
        return Users
      case "project":
        return Briefcase
      case "task":
        return CheckSquare
      case "lead":
        return Mail
      case "proposal":
      case "invoice":
        return DollarSign
      case "document":
        return FileText
      default:
        return FileText
    }
  }

  const getEntityColor = (type: string) => {
    switch (type) {
      case "client":
        return "blue"
      case "project":
        return "green"
      case "task":
        return "purple"
      case "lead":
        return "orange"
      case "proposal":
        return "indigo"
      case "invoice":
        return "red"
      case "document":
        return "gray"
      default:
        return "gray"
    }
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Enhanced Search</h1>
          <p className="text-gray-600 mt-1">Search across all your data with advanced filters and saved searches</p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setViewMode(viewMode === "list" ? "grid" : "list")}
            className="p-2 text-gray-600 hover:bg-gray-100 rounded-md"
            title={`Switch to ${viewMode === "list" ? "grid" : "list"} view`}
          >
            {viewMode === "list" ? <Grid className="h-4 w-4" /> : <List className="h-4 w-4" />}
          </button>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center px-3 py-2 rounded-md ${
              showFilters ? "bg-blue-100 text-blue-700" : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            <Filter className="h-4 w-4 mr-2" />
            Filters
            {activeFilters.length > 0 && (
              <span className="ml-2 px-2 py-1 text-xs bg-blue-600 text-white rounded-full">{activeFilters.length}</span>
            )}
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            ref={searchInputRef}
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => setShowSuggestions(true)}
            onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
            placeholder="Search clients, projects, tasks, and more..."
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          {searchQuery && (
            <button
              onClick={() => {
                setSearchQuery("")
                setSearchResults([])
                searchInputRef.current?.focus()
              }}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X className="h-5 w-5" />
            </button>
          )}
        </div>

        {/* Search Suggestions */}
        <AnimatePresence>
          {showSuggestions && (suggestions.length > 0 || recentSearches.length > 0) && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50"
            >
              {suggestions.length > 0 && (
                <div className="p-2">
                  <div className="text-xs font-medium text-gray-500 px-2 py-1">Suggestions</div>
                  {suggestions.map((suggestion, index) => (
                    <button
                      key={index}
                      onClick={() => {
                        setSearchQuery(suggestion)
                        setShowSuggestions(false)
                      }}
                      className="w-full text-left px-2 py-2 text-sm hover:bg-gray-100 rounded"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              )}
              {recentSearches.length > 0 && (
                <div className="p-2 border-t border-gray-100">
                  <div className="text-xs font-medium text-gray-500 px-2 py-1">Recent</div>
                  {recentSearches.map((recent, index) => (
                    <button
                      key={index}
                      onClick={() => {
                        setSearchQuery(recent)
                        setShowSuggestions(false)
                      }}
                      className="w-full text-left px-2 py-2 text-sm hover:bg-gray-100 rounded flex items-center"
                    >
                      <Clock className="h-3 w-3 text-gray-400 mr-2" />
                      {recent}
                    </button>
                  ))}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Entity Type Filters */}
      <div className="flex items-center space-x-2 overflow-x-auto pb-2">
        {[
          { id: "all", label: "All", icon: Search },
          { id: "client", label: "Clients", icon: Users },
          { id: "project", label: "Projects", icon: Briefcase },
          { id: "task", label: "Tasks", icon: CheckSquare },
          { id: "lead", label: "Leads", icon: Mail },
          { id: "proposal", label: "Proposals", icon: DollarSign },
          { id: "invoice", label: "Invoices", icon: DollarSign },
          { id: "document", label: "Documents", icon: FileText },
        ].map((entityType) => {
          const isSelected = selectedEntityTypes.includes(entityType.id)
          return (
            <button
              key={entityType.id}
              onClick={() => {
                if (entityType.id === "all") {
                  setSelectedEntityTypes(["all"])
                } else {
                  setSelectedEntityTypes((prev) => {
                    const filtered = prev.filter((t) => t !== "all")
                    if (isSelected) {
                      const newTypes = filtered.filter((t) => t !== entityType.id)
                      return newTypes.length === 0 ? ["all"] : newTypes
                    } else {
                      return [...filtered, entityType.id]
                    }
                  })
                }
              }}
              className={`flex items-center px-3 py-2 rounded-full text-sm font-medium whitespace-nowrap ${
                isSelected
                  ? "bg-blue-100 text-blue-700 border border-blue-200"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              <entityType.icon className="h-4 w-4 mr-2" />
              {entityType.label}
            </button>
          )
        })}
      </div>

      {/* Active Filters */}
      {activeFilters.length > 0 && (
        <div className="flex items-center space-x-2 flex-wrap">
          <span className="text-sm font-medium text-gray-700">Active filters:</span>
          {activeFilters.map((filter, index) => (
            <span
              key={index}
              className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800"
            >
              {filter.label}
              <button onClick={() => removeFilter(index)} className="ml-2 text-blue-600 hover:text-blue-800">
                <X className="h-3 w-3" />
              </button>
            </span>
          ))}
          <button onClick={() => setActiveFilters([])} className="text-sm text-gray-600 hover:text-gray-800">
            Clear all
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar */}
        <div className="lg:col-span-1 space-y-6">
          {/* Saved Searches */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="px-4 py-3 border-b border-gray-200">
              <h3 className="text-sm font-medium text-gray-900">Saved Searches</h3>
            </div>
            <div className="p-2">
              {savedSearches.slice(0, 5).map((savedSearch) => (
                <div
                  key={savedSearch.id}
                  className="flex items-center justify-between p-2 hover:bg-gray-50 rounded group"
                >
                  <button onClick={() => loadSavedSearch(savedSearch)} className="flex-1 text-left">
                    <div className="text-sm font-medium text-gray-900">{savedSearch.name}</div>
                    <div className="text-xs text-gray-500">{savedSearch.query}</div>
                  </button>
                  <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100">
                    <button
                      onClick={() => toggleStarredSearch(savedSearch.id)}
                      className={`p-1 rounded ${
                        savedSearch.isStarred ? "text-yellow-500" : "text-gray-400 hover:text-yellow-500"
                      }`}
                    >
                      <Star className="h-3 w-3" />
                    </button>
                    <button
                      onClick={() => deleteSavedSearch(savedSearch.id)}
                      className="p-1 text-gray-400 hover:text-red-500 rounded"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </div>
                </div>
              ))}
              {searchQuery && (
                <button
                  onClick={() => setShowSaveModal(true)}
                  className="w-full flex items-center justify-center px-3 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded"
                >
                  <Save className="h-4 w-4 mr-2" />
                  Save Current Search
                </button>
              )}
            </div>
          </div>

          {/* Quick Filters */}
          {showFilters && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="px-4 py-3 border-b border-gray-200">
                <h3 className="text-sm font-medium text-gray-900">Quick Filters</h3>
              </div>
              <div className="p-4 space-y-3">
                <div className="text-center py-4">
                  <Settings className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-500">Advanced filter builder would be implemented here</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Search Results */}
        <div className="lg:col-span-3">
          {/* Results Header */}
          {searchResults.length > 0 && (
            <div className="flex justify-between items-center mb-4">
              <div className="text-sm text-gray-600">
                {searchResults.length} result{searchResults.length !== 1 ? "s" : ""} found
                {searchQuery && ` for "${searchQuery}"`}
              </div>
              <div className="flex items-center space-x-3">
                <select
                  value={`${sortBy}-${sortOrder}`}
                  onChange={(e) => {
                    const [field, order] = e.target.value.split("-")
                    setSortBy(field)
                    setSortOrder(order as "asc" | "desc")
                  }}
                  className="text-sm border border-gray-300 rounded px-2 py-1"
                >
                  <option value="relevance-desc">Relevance</option>
                  <option value="created_at-desc">Newest First</option>
                  <option value="created_at-asc">Oldest First</option>
                  <option value="updated_at-desc">Recently Updated</option>
                  <option value="title-asc">Name A-Z</option>
                  <option value="title-desc">Name Z-A</option>
                </select>
              </div>
            </div>
          )}

          {/* Loading State */}
          {isLoading && (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="text-gray-600 mt-2">Searching...</p>
            </div>
          )}

          {/* Search Results */}
          {!isLoading && searchQuery && searchResults.length === 0 && (
            <div className="text-center py-12">
              <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No results found</h3>
              <p className="text-gray-600 mb-4">
                No results found for "{searchQuery}". Try adjusting your search terms or filters.
              </p>
              <button
                onClick={() => {
                  setSearchQuery("")
                  setActiveFilters([])
                  setSelectedEntityTypes(["all"])
                }}
                className="text-blue-600 hover:text-blue-800"
              >
                Clear search and filters
              </button>
            </div>
          )}

          {/* Default State */}
          {!isLoading && !searchQuery && (
            <div className="text-center py-12">
              <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Start searching</h3>
              <p className="text-gray-600 mb-4">
                Search across all your clients, projects, tasks, and more using the search bar above.
              </p>
              <div className="text-sm text-gray-500">
                <p>Try searching for:</p>
                <div className="flex justify-center space-x-2 mt-2">
                  {["status:active", "overdue", "high priority"].map((example) => (
                    <button
                      key={example}
                      onClick={() => setSearchQuery(example)}
                      className="px-2 py-1 bg-gray-100 rounded hover:bg-gray-200"
                    >
                      {example}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Save Search Modal */}
      {showSaveModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
            <div className="flex justify-between items-center p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Save Search</h3>
              <button onClick={() => setShowSaveModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="h-6 w-6" />
              </button>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Search Name</label>
                  <input
                    type="text"
                    placeholder="Enter a name for this search"
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                    onKeyPress={(e) => {
                      if (e.key === "Enter") {
                        const target = e.target as HTMLInputElement
                        if (target.value.trim()) {
                          handleSaveSearch(target.value.trim())
                        }
                      }
                    }}
                  />
                </div>
                <div className="text-sm text-gray-600">
                  <p>This will save:</p>
                  <ul className="list-disc list-inside mt-1 space-y-1">
                    <li>Search query: "{searchQuery}"</li>
                    <li>
                      {activeFilters.length} filter{activeFilters.length !== 1 ? "s" : ""}
                    </li>
                    <li>Entity types: {selectedEntityTypes.join(", ")}</li>
                    <li>
                      Sort order: {sortBy} ({sortOrder})
                    </li>
                  </ul>
                </div>
              </div>
            </div>
            <div className="flex justify-end space-x-3 p-6 border-t border-gray-200">
              <button
                onClick={() => setShowSaveModal(false)}
                className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  const input = document.querySelector(
                    'input[placeholder="Enter a name for this search"]',
                  ) as HTMLInputElement
                  if (input?.value.trim()) {
                    handleSaveSearch(input.value.trim())
                  }
                }}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                <Save className="h-4 w-4 mr-2" />
                Save Search
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default EnhancedSearch

const searchService = {
  search: async (query: string, filters: any) => {
    // Mock search implementation
    return []
  },
}
