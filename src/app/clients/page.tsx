'use client'

import React from 'react'
import Clients from '../../components/Clients'
import { AppProvider } from '../../context/AppContext'
import { AuthProvider } from '../../context/AuthContext'
import { EnhancedErrorBoundary } from '../../components/EnhancedErrorBoundary'

export default function ClientsPage() {
  return (
    <EnhancedErrorBoundary>
      <AuthProvider>
        <AppProvider>
          <Clients />
        </AppProvider>
      </AuthProvider>
    </EnhancedErrorBoundary>
  )
}