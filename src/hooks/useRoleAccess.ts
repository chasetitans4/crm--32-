"use client"

import { useAuth } from '../context/AuthContext'

/**
 * Hook for role-based access control
 * @param requiredRole - The role required to access a feature
 * @returns Object with hasAccess boolean and userRole
 */
export const useRoleAccess = (requiredRole: string) => {
  const { user, hasRole } = useAuth()
  
  // Define permission mappings for specific actions
  const permissionMappings: Record<string, string[]> = {
    'contracts:write': ['admin', 'agent'],
    'invoices:write': ['admin', 'agent'],
    'contracts:read': ['admin', 'agent', 'user'],
    'invoices:read': ['admin', 'agent', 'user'],
  }
  
  // Check if the required role is a specific permission
  const allowedRoles = permissionMappings[requiredRole]
  const hasAccess = allowedRoles 
    ? allowedRoles.some(role => hasRole(role))
    : hasRole(requiredRole)
  
  const userRole = user?.role || null
  
  return {
    hasAccess,
    userRole
  }
}

export default useRoleAccess
