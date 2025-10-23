'use client'

import { useEffect } from 'react'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error)
  }, [error])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full text-center">
        <div className="mb-8">
          <h1 className="text-6xl font-bold text-red-600 mb-4">⚠️</h1>
          <h2 className="text-2xl font-semibold text-gray-700 mb-2">Something went wrong!</h2>
          <p className="text-gray-600 mb-8">
            An unexpected error occurred. Please try again.
          </p>
        </div>
        
        <div className="space-y-4">
          <button
            onClick={reset}
            className="inline-block bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition-colors"
          >
            Try again
          </button>
          
          <div>
            <a 
              href="/"
              className="text-blue-600 hover:text-blue-800 underline"
            >
              Return to dashboard
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}