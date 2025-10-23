"use client"

import React from 'react'
import dynamic from 'next/dynamic'

// Simple loading component
const LoadingSpinner = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="flex flex-col items-center gap-3">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      <p className="text-sm text-gray-500">Loading application...</p>
    </div>
  </div>
)

// Use dynamic import with SSR disabled to prevent hydration issues
const AppWithProviders = dynamic(
  () => import("@/components/AppWithProviders"),
  { 
    ssr: false,
    loading: () => <LoadingSpinner />
  }
)

export default function Page() {
  return <AppWithProviders />
}
