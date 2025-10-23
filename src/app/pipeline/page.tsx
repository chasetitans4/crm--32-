'use client'

import React from 'react'
import Pipeline from '../../components/Pipeline'
import { AppProvider } from '../../context/AppContext'
import { AuthProvider } from '../../context/AuthContext'
import { EnhancedErrorBoundary } from '../../components/EnhancedErrorBoundary'

export default function PipelinePage() {
  return (
    <EnhancedErrorBoundary>
      <AuthProvider>
        <AppProvider>
          <Pipeline />
        </AppProvider>
      </AuthProvider>
    </EnhancedErrorBoundary>
  )
}