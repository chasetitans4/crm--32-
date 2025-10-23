import { rbacService, type Permission, type Role } from './rbacService';

export interface GranularPermission {
  id: string;
  name: string;
  resource: string;
  action: string;
  conditions?: {
    field?: string;
    operator: 'equals' | 'not_equals' | 'contains' | 'not_contains' | 'greater_than' | 'less_than' | 'in' | 'not_in';
    value: any;
  }[];
  scope?: 'global' | 'organization' | 'team' | 'personal';
  timeRestrictions?: {
    allowedHours?: { start: number; end: number }[];
    allowedDays?: number[]; // 0-6, Sunday-Saturday
    timezone?: string;
  };
  ipRestrictions?: {
    allowedIPs?: string[];
    blockedIPs?: string[];
    allowedCountries?: string[];
    blockedCountries?: string[];
  };
  dataFilters?: {
    field: string;
    operator: 'equals' | 'not_equals' | 'contains' | 'not_contains' | 'greater_than' | 'less_than';
    value: any;
  }[];
}

export interface GranularRole {
  id: string;
  name: string;
  description: string;
  permissions: string[]; // Permission IDs
  inheritsFrom?: string[]; // Parent role IDs
  isSystemRole: boolean;
  isActive: boolean;
  maxSessions?: number;
  sessionTimeout?: number; // minutes
  requiresMFA?: boolean;
  allowedFeatures?: string[];
  deniedFeatures?: string[];
  dataAccessLevel: 'none' | 'read' | 'write' | 'admin';
  auditLevel: 'none' | 'basic' | 'detailed' | 'full';
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
}

export interface UserRoleAssignment {
  userId: string;
  roleId: string;
  assignedBy: string;
  assignedAt: Date;
  expiresAt?: Date;
  isActive: boolean;
  conditions?: {
    field: string;
    operator: string;
    value: any;
  }[];
}

export interface AccessContext {
  userId: string;
  userEmail: string;
  ipAddress?: string;
  userAgent?: string;
  location?: {
    country?: string;
    city?: string;
  };
  timestamp: Date;
  sessionId?: string;
  organizationId?: string;
  teamId?: string;
}

export interface AccessResult {
  allowed: boolean;
  reason?: string;
  requiredPermissions?: string[];
  missingPermissions?: string[];
  conditions?: any;
  auditRequired: boolean;
  riskScore: number;
}

class GranularRBACService {
  private permissions: Map<string, GranularPermission> = new Map();
  private roles: Map<string, GranularRole> = new Map();
  private userRoles: Map<string, UserRoleAssignment[]> = new Map();
  private permissionCache: Map<string, { permissions: string[]; timestamp: number }> = new Map();
  private cacheTimeout = 5 * 60 * 1000; // 5 minutes

  constructor() {
    this.initializeDefaultPermissions();
    this.initializeDefaultRoles();
  }

  /**
   * Initialize default system permissions
   */
  private initializeDefaultPermissions(): void {
    const defaultPermissions: GranularPermission[] = [
      // User Management
      {
        id: 'users.read',
        name: 'Read Users',
        resource: 'users',
        action: 'read',
        scope: 'organization'
      },
      {
        id: 'users.create',
        name: 'Create Users',
        resource: 'users',
        action: 'create',
        scope: 'organization'
      },
      {
        id: 'users.update',
        name: 'Update Users',
        resource: 'users',
        action: 'update',
        scope: 'organization'
      },
      {
        id: 'users.delete',
        name: 'Delete Users',
        resource: 'users',
        action: 'delete',
        scope: 'organization'
      },
      
      // Contact Management
      {
        id: 'contacts.read',
        name: 'Read Contacts',
        resource: 'contacts',
        action: 'read',
        scope: 'team'
      },
      {
        id: 'contacts.create',
        name: 'Create Contacts',
        resource: 'contacts',
        action: 'create',
        scope: 'team'
      },
      {
        id: 'contacts.update',
        name: 'Update Contacts',
        resource: 'contacts',
        action: 'update',
        scope: 'team'
      },
      {
        id: 'contacts.delete',
        name: 'Delete Contacts',
        resource: 'contacts',
        action: 'delete',
        scope: 'team'
      },
      
      // Quote Management
      {
        id: 'quotes.read',
        name: 'Read Quotes',
        resource: 'quotes',
        action: 'read',
        scope: 'team'
      },
      {
        id: 'quotes.create',
        name: 'Create Quotes',
        resource: 'quotes',
        action: 'create',
        scope: 'team'
      },
      {
        id: 'quotes.update',
        name: 'Update Quotes',
        resource: 'quotes',
        action: 'update',
        scope: 'team'
      },
      {
        id: 'quotes.delete',
        name: 'Delete Quotes',
        resource: 'quotes',
        action: 'delete',
        scope: 'team'
      },
      {
        id: 'quotes.approve',
        name: 'Approve Quotes',
        resource: 'quotes',
        action: 'approve',
        scope: 'team',
        conditions: [{
          field: 'amount',
          operator: 'less_than',
          value: 10000
        }]
      },
      
      // Contract Management
      {
        id: 'contracts.read',
        name: 'Read Contracts',
        resource: 'contracts',
        action: 'read',
        scope: 'team'
      },
      {
        id: 'contracts.create',
        name: 'Create Contracts',
        resource: 'contracts',
        action: 'create',
        scope: 'team'
      },
      {
        id: 'contracts.update',
        name: 'Update Contracts',
        resource: 'contracts',
        action: 'update',
        scope: 'team'
      },
      {
        id: 'contracts.delete',
        name: 'Delete Contracts',
        resource: 'contracts',
        action: 'delete',
        scope: 'team'
      },
      {
        id: 'contracts.sign',
        name: 'Sign Contracts',
        resource: 'contracts',
        action: 'sign',
        scope: 'team'
      },
      
      // Invoice Management
      {
        id: 'invoices.read',
        name: 'Read Invoices',
        resource: 'invoices',
        action: 'read',
        scope: 'team'
      },
      {
        id: 'invoices.create',
        name: 'Create Invoices',
        resource: 'invoices',
        action: 'create',
        scope: 'team'
      },
      {
        id: 'invoices.update',
        name: 'Update Invoices',
        resource: 'invoices',
        action: 'update',
        scope: 'team'
      },
      {
        id: 'invoices.delete',
        name: 'Delete Invoices',
        resource: 'invoices',
        action: 'delete',
        scope: 'team'
      },
      {
        id: 'invoices.send',
        name: 'Send Invoices',
        resource: 'invoices',
        action: 'send',
        scope: 'team'
      },
      
      // Reporting
      {
        id: 'reports.read',
        name: 'Read Reports',
        resource: 'reports',
        action: 'read',
        scope: 'team'
      },
      {
        id: 'reports.create',
        name: 'Create Reports',
        resource: 'reports',
        action: 'create',
        scope: 'team'
      },
      {
        id: 'reports.export',
        name: 'Export Reports',
        resource: 'reports',
        action: 'export',
        scope: 'team'
      },
      
      // System Administration
      {
        id: 'system.admin',
        name: 'System Administration',
        resource: 'system',
        action: 'admin',
        scope: 'global',
        timeRestrictions: {
          allowedHours: [{ start: 9, end: 17 }],
          allowedDays: [1, 2, 3, 4, 5] // Monday-Friday
        }
      },
      {
        id: 'audit.read',
        name: 'Read Audit Logs',
        resource: 'audit',
        action: 'read',
        scope: 'organization'
      },
      {
        id: 'security.manage',
        name: 'Manage Security',
        resource: 'security',
        action: 'manage',
        scope: 'global'
      }
    ];

    defaultPermissions.forEach(permission => {
      this.permissions.set(permission.id, permission);
    });
  }

  /**
   * Initialize default system roles
   */
  private initializeDefaultRoles(): void {
    const now = new Date();
    
    const defaultRoles: GranularRole[] = [
      {
        id: 'super_admin',
        name: 'Super Administrator',
        description: 'Full system access with all permissions',
        permissions: Array.from(this.permissions.keys()),
        isSystemRole: true,
        isActive: true,
        requiresMFA: true,
        dataAccessLevel: 'admin',
        auditLevel: 'full',
        maxSessions: 2,
        sessionTimeout: 60,
        createdAt: now,
        updatedAt: now,
        createdBy: 'system'
      },
      {
        id: 'admin',
        name: 'Administrator',
        description: 'Organization administrator with most permissions',
        permissions: [
          'users.read', 'users.create', 'users.update',
          'contacts.read', 'contacts.create', 'contacts.update', 'contacts.delete',
          'quotes.read', 'quotes.create', 'quotes.update', 'quotes.delete', 'quotes.approve',
          'contracts.read', 'contracts.create', 'contracts.update', 'contracts.delete', 'contracts.sign',
          'invoices.read', 'invoices.create', 'invoices.update', 'invoices.delete', 'invoices.send',
          'reports.read', 'reports.create', 'reports.export',
          'audit.read'
        ],
        isSystemRole: true,
        isActive: true,
        requiresMFA: true,
        dataAccessLevel: 'admin',
        auditLevel: 'detailed',
        maxSessions: 3,
        sessionTimeout: 120,
        createdAt: now,
        updatedAt: now,
        createdBy: 'system'
      },
      {
        id: 'manager',
        name: 'Manager',
        description: 'Team manager with elevated permissions',
        permissions: [
          'contacts.read', 'contacts.create', 'contacts.update',
          'quotes.read', 'quotes.create', 'quotes.update', 'quotes.approve',
          'contracts.read', 'contracts.create', 'contracts.update', 'contracts.sign',
          'invoices.read', 'invoices.create', 'invoices.update', 'invoices.send',
          'reports.read', 'reports.create'
        ],
        isSystemRole: true,
        isActive: true,
        requiresMFA: false,
        dataAccessLevel: 'write',
        auditLevel: 'basic',
        maxSessions: 2,
        sessionTimeout: 240,
        createdAt: now,
        updatedAt: now,
        createdBy: 'system'
      },
      {
        id: 'sales_rep',
        name: 'Sales Representative',
        description: 'Sales team member with standard permissions',
        permissions: [
          'contacts.read', 'contacts.create', 'contacts.update',
          'quotes.read', 'quotes.create', 'quotes.update',
          'contracts.read',
          'invoices.read',
          'reports.read'
        ],
        isSystemRole: true,
        isActive: true,
        requiresMFA: false,
        dataAccessLevel: 'write',
        auditLevel: 'basic',
        maxSessions: 1,
        sessionTimeout: 480,
        createdAt: now,
        updatedAt: now,
        createdBy: 'system'
      },
      {
        id: 'viewer',
        name: 'Viewer',
        description: 'Read-only access to basic information',
        permissions: [
          'contacts.read',
          'quotes.read',
          'contracts.read',
          'invoices.read',
          'reports.read'
        ],
        isSystemRole: true,
        isActive: true,
        requiresMFA: false,
        dataAccessLevel: 'read',
        auditLevel: 'basic',
        maxSessions: 1,
        sessionTimeout: 480,
        createdAt: now,
        updatedAt: now,
        createdBy: 'system'
      }
    ];

    defaultRoles.forEach(role => {
      this.roles.set(role.id, role);
    });
  }

  /**
   * Check if user has permission to perform an action
   */
  async checkAccess(
    userId: string,
    resource: string,
    action: string,
    context: AccessContext,
    data?: any
  ): Promise<AccessResult> {
    try {
      const userPermissions = await this.getUserPermissions(userId);
      const permissionId = `${resource}.${action}`;
      
      // Check if user has the required permission
      if (!userPermissions.includes(permissionId)) {
        return {
          allowed: false,
          reason: 'Insufficient permissions',
          requiredPermissions: [permissionId],
          missingPermissions: [permissionId],
          auditRequired: true,
          riskScore: 0.7
        };
      }

      const permission = this.permissions.get(permissionId);
      if (!permission) {
        return {
          allowed: false,
          reason: 'Permission not found',
          auditRequired: true,
          riskScore: 0.8
        };
      }

      // Check time restrictions
      if (permission.timeRestrictions) {
        const timeCheck = this.checkTimeRestrictions(permission.timeRestrictions, context.timestamp);
        if (!timeCheck.allowed) {
          return {
            allowed: false,
            reason: timeCheck.reason,
            auditRequired: true,
            riskScore: 0.6
          };
        }
      }

      // Check IP restrictions
      if (permission.ipRestrictions && context.ipAddress) {
        const ipCheck = this.checkIPRestrictions(permission.ipRestrictions, context.ipAddress, context.location);
        if (!ipCheck.allowed) {
          return {
            allowed: false,
            reason: ipCheck.reason,
            auditRequired: true,
            riskScore: 0.9
          };
        }
      }

      // Check data conditions
      if (permission.conditions && data) {
        const conditionCheck = this.checkConditions(permission.conditions, data);
        if (!conditionCheck.allowed) {
          return {
            allowed: false,
            reason: conditionCheck.reason,
            auditRequired: true,
            riskScore: 0.5
          };
        }
      }

      // Calculate risk score
      const riskScore = this.calculateAccessRiskScore(permission, context, data);

      return {
        allowed: true,
        auditRequired: riskScore > 0.5,
        riskScore
      };
    } catch (error) {
      console.error('Error checking access:', error);
      return {
        allowed: false,
        reason: 'Access check failed',
        auditRequired: true,
        riskScore: 1.0
      };
    }
  }

  /**
   * Get all permissions for a user
   */
  async getUserPermissions(userId: string): Promise<string[]> {
    // Check cache first
    const cached = this.permissionCache.get(userId);
    if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
      return cached.permissions;
    }

    const userRoleAssignments = this.userRoles.get(userId) || [];
    const activeAssignments = userRoleAssignments.filter(assignment => 
      assignment.isActive && 
      (!assignment.expiresAt || assignment.expiresAt > new Date())
    );

    const allPermissions = new Set<string>();

    for (const assignment of activeAssignments) {
      const role = this.roles.get(assignment.roleId);
      if (role && role.isActive) {
        // Add direct permissions
        role.permissions.forEach(permissionId => allPermissions.add(permissionId));
        
        // Add inherited permissions
        if (role.inheritsFrom) {
          for (const parentRoleId of role.inheritsFrom) {
            const parentRole = this.roles.get(parentRoleId);
            if (parentRole && parentRole.isActive) {
              parentRole.permissions.forEach(permissionId => allPermissions.add(permissionId));
            }
          }
        }
      }
    }

    const permissions = Array.from(allPermissions);
    
    // Cache the result
    this.permissionCache.set(userId, {
      permissions,
      timestamp: Date.now()
    });

    return permissions;
  }

  /**
   * Assign role to user
   */
  async assignRole(
    userId: string,
    roleId: string,
    assignedBy: string,
    expiresAt?: Date,
    conditions?: any[]
  ): Promise<boolean> {
    try {
      const role = this.roles.get(roleId);
      if (!role || !role.isActive) {
        throw new Error('Role not found or inactive');
      }

      const assignment: UserRoleAssignment = {
        userId,
        roleId,
        assignedBy,
        assignedAt: new Date(),
        expiresAt,
        isActive: true,
        conditions
      };

      const userRoles = this.userRoles.get(userId) || [];
      
      // Check if assignment already exists
      const existingIndex = userRoles.findIndex(a => a.roleId === roleId && a.isActive);
      if (existingIndex >= 0) {
        userRoles[existingIndex] = assignment; // Update existing
      } else {
        userRoles.push(assignment); // Add new
      }
      
      this.userRoles.set(userId, userRoles);
      
      // Clear permission cache
      this.permissionCache.delete(userId);
      
      return true;
    } catch (error) {
      console.error('Error assigning role:', error);
      return false;
    }
  }

  /**
   * Remove role from user
   */
  async removeRole(userId: string, roleId: string): Promise<boolean> {
    try {
      const userRoles = this.userRoles.get(userId) || [];
      const updatedRoles = userRoles.map(assignment => 
        assignment.roleId === roleId 
          ? { ...assignment, isActive: false }
          : assignment
      );
      
      this.userRoles.set(userId, updatedRoles);
      
      // Clear permission cache
      this.permissionCache.delete(userId);
      
      return true;
    } catch (error) {
      console.error('Error removing role:', error);
      return false;
    }
  }

  /**
   * Create custom role
   */
  async createRole(role: Omit<GranularRole, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    const roleId = `custom_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const now = new Date();
    
    const newRole: GranularRole = {
      ...role,
      id: roleId,
      createdAt: now,
      updatedAt: now
    };
    
    this.roles.set(roleId, newRole);
    return roleId;
  }

  /**
   * Update role
   */
  async updateRole(roleId: string, updates: Partial<GranularRole>): Promise<boolean> {
    try {
      const role = this.roles.get(roleId);
      if (!role) {
        throw new Error('Role not found');
      }
      
      if (role.isSystemRole && updates.permissions) {
        throw new Error('Cannot modify permissions of system roles');
      }
      
      const updatedRole: GranularRole = {
        ...role,
        ...updates,
        id: roleId, // Ensure ID doesn't change
        updatedAt: new Date()
      };
      
      this.roles.set(roleId, updatedRole);
      
      // Clear all permission caches since role permissions changed
      this.permissionCache.clear();
      
      return true;
    } catch (error) {
      console.error('Error updating role:', error);
      return false;
    }
  }

  /**
   * Check time restrictions
   */
  private checkTimeRestrictions(
    restrictions: NonNullable<GranularPermission['timeRestrictions']>,
    timestamp: Date
  ): { allowed: boolean; reason?: string } {
    const hour = timestamp.getHours();
    const day = timestamp.getDay();
    
    // Check allowed hours
    if (restrictions.allowedHours) {
      const isAllowedHour = restrictions.allowedHours.some(range => 
        hour >= range.start && hour <= range.end
      );
      if (!isAllowedHour) {
        return {
          allowed: false,
          reason: 'Access not allowed during current hours'
        };
      }
    }
    
    // Check allowed days
    if (restrictions.allowedDays && !restrictions.allowedDays.includes(day)) {
      return {
        allowed: false,
        reason: 'Access not allowed on current day'
      };
    }
    
    return { allowed: true };
  }

  /**
   * Check IP restrictions
   */
  private checkIPRestrictions(
    restrictions: NonNullable<GranularPermission['ipRestrictions']>,
    ipAddress: string,
    location?: AccessContext['location']
  ): { allowed: boolean; reason?: string } {
    // Check blocked IPs
    if (restrictions.blockedIPs?.includes(ipAddress)) {
      return {
        allowed: false,
        reason: 'IP address is blocked'
      };
    }
    
    // Check allowed IPs
    if (restrictions.allowedIPs && !restrictions.allowedIPs.includes(ipAddress)) {
      return {
        allowed: false,
        reason: 'IP address not in allowed list'
      };
    }
    
    // Check country restrictions
    if (location?.country) {
      if (restrictions.blockedCountries?.includes(location.country)) {
        return {
          allowed: false,
          reason: 'Access blocked from current country'
        };
      }
      
      if (restrictions.allowedCountries && !restrictions.allowedCountries.includes(location.country)) {
        return {
          allowed: false,
          reason: 'Country not in allowed list'
        };
      }
    }
    
    return { allowed: true };
  }

  /**
   * Check data conditions
   */
  private checkConditions(
    conditions: GranularPermission['conditions'],
    data: any
  ): { allowed: boolean; reason?: string } {
    if (!conditions) return { allowed: true };
    
    for (const condition of conditions) {
      const fieldValue = data[condition.field || ''];
      const conditionValue = condition.value;
      
      let conditionMet = false;
      
      switch (condition.operator) {
        case 'equals':
          conditionMet = fieldValue === conditionValue;
          break;
        case 'not_equals':
          conditionMet = fieldValue !== conditionValue;
          break;
        case 'contains':
          conditionMet = String(fieldValue).includes(String(conditionValue));
          break;
        case 'not_contains':
          conditionMet = !String(fieldValue).includes(String(conditionValue));
          break;
        case 'greater_than':
          conditionMet = Number(fieldValue) > Number(conditionValue);
          break;
        case 'less_than':
          conditionMet = Number(fieldValue) < Number(conditionValue);
          break;
        case 'in':
          conditionMet = Array.isArray(conditionValue) && conditionValue.includes(fieldValue);
          break;
        case 'not_in':
          conditionMet = Array.isArray(conditionValue) && !conditionValue.includes(fieldValue);
          break;
      }
      
      if (!conditionMet) {
        return {
          allowed: false,
          reason: `Condition not met: ${condition.field} ${condition.operator} ${condition.value}`
        };
      }
    }
    
    return { allowed: true };
  }

  /**
   * Calculate access risk score
   */
  private calculateAccessRiskScore(
    permission: GranularPermission,
    context: AccessContext,
    data?: any
  ): number {
    let score = 0;
    
    // Base score by action sensitivity
    const actionScores = {
      'delete': 0.8,
      'admin': 0.9,
      'create': 0.4,
      'update': 0.5,
      'read': 0.1
    };
    
    score += actionScores[permission.action as keyof typeof actionScores] || 0.3;
    
    // Scope multiplier
    const scopeMultipliers = {
      'global': 1.0,
      'organization': 0.8,
      'team': 0.6,
      'personal': 0.4
    };
    
    score *= scopeMultipliers[permission.scope || 'team'];
    
    // Time-based risk
    const hour = context.timestamp.getHours();
    if (hour < 6 || hour > 22) {
      score += 0.2; // Off-hours access
    }
    
    // Weekend access
    const day = context.timestamp.getDay();
    if (day === 0 || day === 6) {
      score += 0.1;
    }
    
    return Math.min(Math.max(score, 0), 1);
  }

  /**
   * Get user roles
   */
  getUserRoles(userId: string): UserRoleAssignment[] {
    return this.userRoles.get(userId) || [];
  }

  /**
   * Get all roles
   */
  getAllRoles(): GranularRole[] {
    return Array.from(this.roles.values());
  }

  /**
   * Get all permissions
   */
  getAllPermissions(): GranularPermission[] {
    return Array.from(this.permissions.values());
  }

  /**
   * Clear permission cache for user
   */
  clearUserCache(userId: string): void {
    this.permissionCache.delete(userId);
  }

  /**
   * Clear all permission caches
   */
  clearAllCaches(): void {
    this.permissionCache.clear();
  }
}

export const granularRBACService = new GranularRBACService();
export default granularRBACService;