"use client"

import React from "react"
import { AlertCircle, X } from "lucide-react"

interface ErrorState {
  message: string
  type: 'error' | 'warning' | 'info'
}

interface ErrorToastProps {
  error: ErrorState | null
  onClose: () => void
  onRetry?: () => void
}

const ErrorToast: React.FC<ErrorToastProps> = ({ error, onClose, onRetry }) => {
  if (!error) return null

  const getToastStyles = () => {
    switch (error.type) {
      case 'error':
        return 'bg-red-50 border-red-400 text-red-700'
      case 'warning':
        return 'bg-yellow-50 border-yellow-400 text-yellow-700'
      case 'info':
        return 'bg-blue-50 border-blue-400 text-blue-700'
      default:
        return 'bg-gray-50 border-gray-400 text-gray-700'
    }
  }

  return (
    <div className="fixed top-4 right-4 z-50 max-w-md">
      <div className={`p-4 rounded-lg shadow-lg border-l-4 ${getToastStyles()}`}>
        <div className="flex items-start">
          <AlertCircle size={20} className="mr-3 mt-0.5 flex-shrink-0" />
          <div className="flex-1">
            <p className="text-sm font-medium">{error.message}</p>
            {error.type === 'error' && onRetry && (
              <button
                onClick={onRetry}
                className="mt-2 text-sm underline hover:no-underline"
              >
                Try again
              </button>
            )}
          </div>
          <button
            onClick={onClose}
            className="ml-3 flex-shrink-0"
          >
            <X size={16} />
          </button>
        </div>
      </div>
    </div>
  )
}

export default ErrorToast