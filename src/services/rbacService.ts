import { supabase } from "../lib/supabase"
import type { Database } from "../lib/supabase"

type Tables<T extends keyof Database["public"]["Tables"]> = Database["public"]["Tables"][T]["Row"]

export interface Role {
  id: string
  name: string
  description: string
  permissions: Permission[]
  is_system_role: boolean
  created_at: string
  updated_at: string
}

export interface Permission {
  id: string
  name: string
  resource: string
  action: string
  description: string
  created_at: string
}

export interface UserRole {
  id: string
  user_id: string
  role_id: string
  assigned_by: string
  assigned_at: string
  expires_at?: string
}

export interface RolePermission {
  id: string
  role_id: string
  permission_id: string
  granted_by: string
  granted_at: string
}

export type Resource =
  | "clients"
  | "tasks"
  | "events"
  | "projects"
  | "invoices"
  | "reports"
  | "settings"
  | "users"
  | "roles"
  | "integrations"
  | "analytics"
  | "notifications"

export type Action =
  | "create"
  | "read"
  | "update"
  | "delete"
  | "assign"
  | "approve"
  | "export"
  | "import"
  | "manage"
  | "view_all"
  | "edit_all"

export interface AccessContext {
  user_id: string
  resource: Resource
  action: Action
  resource_id?: string
  additional_context?: Record<string, any>
}

class RBACService {
  private userPermissionsCache: Map<string, Set<string>> = new Map()
  private cacheExpiry: Map<string, number> = new Map()
  private readonly CACHE_DURATION = 5 * 60 * 1000 // 5 minutes

  // Permission checking
  async hasPermission(context: AccessContext): Promise<boolean> {
    try {
      const permissions = await this.getUserPermissions(context.user_id)
      const permissionKey = `${context.resource}:${context.action}`

      // Check direct permission
      if (permissions.has(permissionKey)) {
        return true
      }

      // Check wildcard permissions
      if (
        permissions.has(`${context.resource}:*`) ||
        permissions.has(`*:${context.action}`) ||
        permissions.has("*:*")
      ) {
        return true
      }

      // Check resource-specific permissions with context
      if (context.resource_id) {
        return await this.checkResourceSpecificPermission(context)
      }

      return false
    } catch (error) {
      // Silent error handling - Error checking permission
      return false
    }
  }

  private async checkResourceSpecificPermission(context: AccessContext): Promise<boolean> {
    // Check if user owns the resource or has specific access
    switch (context.resource) {
      case "clients":
        return await this.checkClientAccess(context.user_id, context.resource_id!, context.action)
      case "tasks":
        return await this.checkTaskAccess(context.user_id, context.resource_id!, context.action)
      case "projects":
        return await this.checkProjectAccess(context.user_id, context.resource_id!, context.action)
      default:
        return false
    }
  }

  private async checkClientAccess(userId: string, clientId: string, action: Action): Promise<boolean> {
    if (!supabase) {
      throw new Error('Supabase client is not initialized');
    }
    
    // Check if user is assigned to this client
    const { data } = await supabase
      .from("client_assignments")
      .select("*")
      .eq("user_id", userId)
      .eq("client_id", clientId)
      .single()

    return !!data
  }

  private async checkTaskAccess(userId: string, taskId: string, action: Action): Promise<boolean> {
    if (!supabase) {
      throw new Error('Supabase client is not initialized');
    }
    
    // Check if user is assigned to this task or owns it
    const { data } = await (supabase as any).from("tasks").select("assigned_to, created_by").eq("id", taskId).single()

    if (!data) return false

    return data.assigned_to === userId || data.created_by === userId
  }

  private async checkProjectAccess(userId: string, projectId: string, action: Action): Promise<boolean> {
    if (!supabase) {
      throw new Error('Supabase client is not initialized');
    }
    
    // Check if user is a team member of this project
    const { data } = await supabase
      .from("project_members")
      .select("*")
      .eq("user_id", userId)
      .eq("project_id", projectId)
      .single()

    return !!data
  }

  // User permissions management
  private async getUserPermissions(userId: string): Promise<Set<string>> {
    if (!supabase) {
      throw new Error('Supabase client is not initialized');
    }
    
    const cacheKey = userId
    const now = Date.now()

    // Check cache
    if (this.userPermissionsCache.has(cacheKey) && this.cacheExpiry.get(cacheKey)! > now) {
      return this.userPermissionsCache.get(cacheKey)!
    }

    // Fetch from database
    const { data: userRoles } = await supabase
      .from("user_roles")
      .select(
        `
        role:roles(
          id,
          role_permissions(
            permission:permissions(
              resource,
              action
            )
          )
        )
      `,
      )
      .eq("user_id", userId)
      .or("expires_at.is.null,expires_at.gt." + new Date().toISOString())

    const permissions = new Set<string>()

    if (userRoles) {
      userRoles.forEach((userRole: any) => {
        userRole.role.role_permissions.forEach((rp: any) => {
          const permission = rp.permission
          permissions.add(`${permission.resource}:${permission.action}`)
        })
      })
    }

    // Cache the result
    this.userPermissionsCache.set(cacheKey, permissions)
    this.cacheExpiry.set(cacheKey, now + this.CACHE_DURATION)

    return permissions
  }

  // Role management
  async getRoles(): Promise<Role[]> {
    if (!supabase) {
      throw new Error('Supabase client is not initialized');
    }
    
    const { data, error } = await supabase
      .from("roles")
      .select(
        `
        *,
        role_permissions(
          permission:permissions(*)
        )
      `,
      )
      .order("name")

    if (error) throw new Error(`Failed to fetch roles: ${error.message}`)

    return (data || []).map((role: any) => ({
      ...role,
      permissions: role.role_permissions.map((rp: any) => rp.permission),
    }))
  }

  async createRole(role: Omit<Role, "id" | "created_at" | "updated_at" | "permissions">): Promise<Role> {
    if (!supabase) {
      throw new Error('Supabase client is not initialized');
    }
    
    const { data, error } = await (supabase as any)
      .from("roles")
      .insert({
        ...role,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (error) throw new Error(`Failed to create role: ${error.message}`)
    return { ...data, permissions: [] }
  }

  // Permission helpers
  async canAccessResource(userId: string, resource: Resource): Promise<boolean> {
    return await this.hasPermission({
      user_id: userId,
      resource,
      action: "read",
    })
  }

  async canModifyResource(userId: string, resource: Resource, resourceId?: string): Promise<boolean> {
    return await this.hasPermission({
      user_id: userId,
      resource,
      action: "update",
      resource_id: resourceId,
    })
  }

  async canDeleteResource(userId: string, resource: Resource, resourceId?: string): Promise<boolean> {
    return await this.hasPermission({
      user_id: userId,
      resource,
      action: "delete",
      resource_id: resourceId,
    })
  }

  clearAllCache(): void {
    this.userPermissionsCache.clear()
    this.cacheExpiry.clear()
  }
}

export const rbacService = new RBACService()
export default rbacService
