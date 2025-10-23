"use client";

import type React from "react"
import { useState, useEffect } from "react"
import { FileText, DollarSign, Building2, AlertCircle, Loader2 } from "lucide-react"
import { useAuth } from "../context/AuthContext"
import { useErrorState, handleAsyncOperation, DefaultErrorFallback, createStandardError } from "../utils/standardErrorHandling"
import CommissionDashboard from "./CommissionDashboard"
import Contracts from "./Contracts"

interface CompanyProps {
  setActiveTab?: (tab: string) => void
}

const Company: React.FC<CompanyProps> = ({ setActiveTab }) => {
  const [activeSection, setActiveSection] = useState("commission")
  const [loading, setLoading] = useState(true)
  const { hasError, error, setError, clearError } = useErrorState()
  const [componentErrors, setComponentErrors] = useState<Record<string, string>>({})
  const { user } = useAuth()

  // Initialize component and handle authentication
  useEffect(() => {
    const initializeComponent = async () => {
      setLoading(true)
      clearError()
      
      const result = await handleAsyncOperation(async () => {
        // Check if user is authenticated
        if (!user) {
          throw createStandardError(
            'You must be logged in to access company information.',
            {
              type: 'authentication',
              code: 'AUTH_REQUIRED'
            }
          )
        }

        // Validate user permissions
        if (!user.role || !['admin', 'agent', 'manager'].includes(user.role)) {
          throw createStandardError(
            'You do not have permission to access company information.',
            {
              type: 'authorization',
              code: 'INSUFFICIENT_PERMISSIONS'
            }
          )
        }

        // Simulate component initialization delay
        await new Promise(resolve => setTimeout(resolve, 500))
        
        return { success: true }
      }, 'Company component initialization')
      
      if (result.error) {
        setError(result.error)
      }
      
      setLoading(false)
    }

    initializeComponent()
  }, [user, setError, clearError])

  // Handle section changes with validation
  const handleSectionChange = async (sectionId: string) => {
    const result = await handleAsyncOperation(async () => {
      if (!sectionId || typeof sectionId !== 'string') {
        throw createStandardError('Invalid section ID', {
          type: 'validation',
          code: 'INVALID_SECTION_ID'
        })
      }
      
      const validSections = ['commission', 'contracts']
      if (!validSections.includes(sectionId)) {
        throw createStandardError('Invalid section selected', {
          type: 'validation',
          code: 'INVALID_SECTION'
        })
      }
      
      setActiveSection(sectionId)
      setComponentErrors(prev => ({ ...prev, [sectionId]: '' }))
      
      return { success: true }
    }, `Section change to ${sectionId}`)
    
    if (result.error) {
      setComponentErrors(prev => ({ 
        ...prev, 
        [sectionId]: result.error?.message || 'Failed to load section. Please try again.' 
      }))
    }
  }

  // Handle component errors from child components
  const handleComponentError = (componentName: string, errorMessage: string) => {
    setComponentErrors(prev => ({ ...prev, [componentName]: errorMessage }))
  }

  // Retry function for failed operations
  const handleRetry = () => {
    clearError()
    setComponentErrors({})
    setLoading(true)
    // Re-trigger useEffect
    window.location.reload()
  }

  const sections = [
    {
      id: "commission",
      label: "Commission Dashboard",
      icon: <DollarSign size={18} />,
      component: (
        <div className="relative">
          {componentErrors.commission && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center gap-2">
                <AlertCircle className="text-red-500" size={16} />
                <span className="text-red-700 text-sm">{componentErrors.commission}</span>
              </div>
            </div>
          )}
          <CommissionDashboard 
            currentUser={user} 
            onError={(error) => handleComponentError('commission', error)}
          />
        </div>
      ),
    },
    {
      id: "contracts",
      label: "Contracts",
      icon: <FileText size={18} />,
      component: (
        <div className="relative">
          {componentErrors.contracts && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center gap-2">
                <AlertCircle className="text-red-500" size={16} />
                <span className="text-red-700 text-sm">{componentErrors.contracts}</span>
              </div>
            </div>
          )}
          <Contracts 
            currentUser={user} 
            onError={(error) => handleComponentError('contracts', error)}
          />
        </div>
      ),
    },
  ]

  // Loading state
  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <Loader2 className="animate-spin text-blue-600 mx-auto mb-4" size={48} />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Loading Company Dashboard</h3>
            <p className="text-gray-600">Please wait while we prepare your information...</p>
          </div>
        </div>
      </div>
    )
  }

  // Error state
  if (hasError && error) {
    return (
      <div className="p-6">
        <div className="max-w-md mx-auto">
          <DefaultErrorFallback
            error={error}
            retry={handleRetry}
          />
          {(error.type === 'authentication' || error.type === 'authorization') && setActiveTab && (
            <div className="mt-4 text-center">
              <button
                onClick={() => setActiveTab('login')}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Go to Login
              </button>
            </div>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <Building2 className="text-blue-600" size={32} />
          <h1 className="text-3xl font-bold text-gray-800">Company</h1>
        </div>
        <p className="text-gray-600">Manage company information, documents, and contractor resources</p>
        
        {/* User Info */}
        {user && (
          <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-blue-600 font-semibold text-sm">
                  {user.name?.charAt(0).toUpperCase() || user.email.charAt(0).toUpperCase()}
                </span>
              </div>
              <div>
                <p className="text-sm font-medium text-blue-900">
                  {user.name || user.email.split('@')[0]}
                </p>
                <p className="text-xs text-blue-700 capitalize">{user.role}</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Navigation Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="flex space-x-8" role="tablist">
          {sections.map((section) => (
            <button
              key={section.id}
              onClick={() => handleSectionChange(section.id)}
              role="tab"
              aria-selected={activeSection === section.id}
              aria-controls={`panel-${section.id}`}
              className={`flex items-center gap-2 py-2 px-1 border-b-2 font-medium text-base transition-colors group focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                activeSection === section.id
                  ? "border-blue-700 text-blue-700"
                  : "border-transparent text-gray-600 hover:text-blue-600 hover:border-blue-400"
              }`}
            >
              <span className={activeSection === section.id ? "animate-bounce-subtle" : ""}>
                {section.icon}
              </span>
              {section.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Active Section Content */}
      <div 
        className="bg-white rounded-lg min-h-[400px]"
        role="tabpanel"
        id={`panel-${activeSection}`}
        aria-labelledby={`tab-${activeSection}`}
      >
        {sections.find((section) => section.id === activeSection)?.component}
      </div>
    </div>
  )
}

export default Company
