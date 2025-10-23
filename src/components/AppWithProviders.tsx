"use client"

import React from 'react'
import { AppProvider } from "@/context/AppContext"
import { AuthProvider } from "@/context/AuthContext"
import { EnhancedErrorBoundary } from "@/components/EnhancedErrorBoundary"
import App from "@/App"

export default function AppWithProviders() {
  return (
    <EnhancedErrorBoundary>
      <AuthProvider>
        <AppProvider>
          <App />
        </AppProvider>
      </AuthProvider>
    </EnhancedErrorBoundary>
  )
}