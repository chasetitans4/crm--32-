"use client"

import * as React from "react"
import { createContext, useContext, useEffect, useState } from "react"
import { authService, type AuthState, type AuthUser } from "../services/auth"

// Re-export AuthUser for components that need it
export type { AuthUser }

interface AuthContextType extends AuthState {
  signUp: (email: string, password: string, userData?: { name?: string }) => Promise<AuthUser>
  signIn: (email: string, password: string) => Promise<AuthUser>
  signOut: () => Promise<void>
  resetPassword: (email: string) => Promise<void>
  updatePassword: (newPassword: string) => Promise<void>
  updateProfile: (updates: Partial<AuthUser>) => Promise<AuthUser>
  uploadAvatar: (file: File) => Promise<string>
  isAuthenticated: () => boolean
  hasRole: (role: string) => boolean
  getAccessToken: () => string | null
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [authState, setAuthState] = useState<AuthState>(authService.getState())

  useEffect(() => {
    // Subscribe to auth state changes
    const unsubscribe = authService.subscribe(setAuthState)
    return unsubscribe
  }, [])

  const contextValue: AuthContextType = {
    ...authState,
    signUp: authService.signUp.bind(authService),
    signIn: authService.signIn.bind(authService),
    signOut: authService.signOut.bind(authService),
    resetPassword: authService.resetPassword.bind(authService),
    updatePassword: authService.updatePassword.bind(authService),
    updateProfile: authService.updateProfile.bind(authService),
    uploadAvatar: authService.uploadAvatar.bind(authService),
    isAuthenticated: authService.isAuthenticated.bind(authService),
    hasRole: authService.hasRole.bind(authService),
    getAccessToken: authService.getAccessToken.bind(authService),
  }

  return <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

// Higher-order component for protecting routes
export const withAuth = <P extends object>(Component: React.ComponentType<P>) => {
  return function AuthenticatedComponent(props: P) {
    const { isAuthenticated, loading } = useAuth()

    if (loading) {
      return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
        </div>
      )
    }

    if (!isAuthenticated()) {
      return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h1>
            <p className="text-gray-600">Please sign in to access this page.</p>
          </div>
        </div>
      )
    }

    return <Component {...props} />
  }
}
