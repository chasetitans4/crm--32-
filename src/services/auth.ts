// Authentication Service
"use client"

import { setSecureJSON, getSecureJSON, setSecureItem, getSecureItem, removeSecureItem, setSecureItemAdvanced, setSecureJSONAdvanced, getSecureJSONAdvanced } from "../utils/secureStorage"
import { advancedEncryption } from "../utils/encryption"

export interface AuthUser {
  id: string
  email: string
  name?: string
  role: string
  avatar?: string
  createdAt: string
  lastLogin?: string
}

export interface AuthTokens {
  accessToken: string
  refreshToken?: string
  expiresAt: string
  tokenType: string
}

export interface AuthState {
  user: AuthUser | null
  loading: boolean
  error: string | null
}

class AuthService {
  private user: AuthUser | null = null
  private tokens: AuthTokens | null = null
  private loading = false
  private error: string | null = null
  private subscribers: ((state: AuthState) => void)[] = []

  async signUp(email: string, password: string, userData?: { name?: string }): Promise<AuthUser> {
    this.loading = true
    this.error = null
    this.notifySubscribers()

    try {
      // Mock implementation - replace with actual auth service
      const user: AuthUser = {
        id: Math.random().toString(36).substr(2, 9),
        email,
        name: userData?.name || email.split("@")[0],
        role: "user",
        createdAt: new Date().toISOString(),
      }

      // Generate secure tokens
      const tokens: AuthTokens = {
        accessToken: this.generateSecureToken(),
        refreshToken: this.generateSecureToken(),
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 hours
        tokenType: "Bearer"
      }

      this.user = user
      this.tokens = tokens

      // Store user data and tokens securely using advanced encryption
      await setSecureJSONAdvanced("auth_user", user)
      await setSecureJSONAdvanced("auth_tokens", tokens)
      await setSecureItemAdvanced("auth_token", tokens.accessToken)

      this.notifySubscribers()
      return user
    } catch (error) {
      this.error = error instanceof Error ? error.message : "Sign up failed"
      this.notifySubscribers()
      throw error
    } finally {
      this.loading = false
      this.notifySubscribers()
    }
  }

  async signIn(email: string, password: string): Promise<AuthUser> {
    this.loading = true
    this.error = null
    this.notifySubscribers()

    try {
      // Mock implementation - replace with actual auth service
      const user: AuthUser = {
        id: Math.random().toString(36).substr(2, 9),
        email,
        name: email.split("@")[0],
        role: "user",
        createdAt: new Date().toISOString(),
        lastLogin: new Date().toISOString(),
      }

      // Generate secure tokens
      const tokens: AuthTokens = {
        accessToken: this.generateSecureToken(),
        refreshToken: this.generateSecureToken(),
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 hours
        tokenType: "Bearer"
      }

      this.user = user
      this.tokens = tokens

      // Store user data and tokens securely using advanced encryption
      await setSecureJSONAdvanced("auth_user", user)
      await setSecureJSONAdvanced("auth_tokens", tokens)
      await setSecureItemAdvanced("auth_token", tokens.accessToken)

      this.notifySubscribers()
      return user
    } catch (error) {
      this.error = error instanceof Error ? error.message : "Sign in failed"
      this.notifySubscribers()
      throw error
    } finally {
      this.loading = false
      this.notifySubscribers()
    }
  }

  async signOut(): Promise<void> {
    this.user = null
    this.tokens = null
    this.error = null
    
    // Clear all authentication data from secure storage
    removeSecureItem("auth_user")
    removeSecureItem("auth_tokens")
    removeSecureItem("auth_token")
    
    this.notifySubscribers()
  }

  async resetPassword(email: string): Promise<void> {
    this.loading = true
    this.error = null
    this.notifySubscribers()

    try {
      // Mock implementation
      // Silent logging - Password reset email sent
    } catch (error) {
      this.error = error instanceof Error ? error.message : "Password reset failed"
      this.notifySubscribers()
      throw error
    } finally {
      this.loading = false
      this.notifySubscribers()
    }
  }

  async updatePassword(newPassword: string): Promise<void> {
    this.loading = true
    this.error = null
    this.notifySubscribers()

    try {
      // Mock implementation
      // Silent logging - Password updated
    } catch (error) {
      this.error = error instanceof Error ? error.message : "Password update failed"
      this.notifySubscribers()
      throw error
    } finally {
      this.loading = false
      this.notifySubscribers()
    }
  }

  async updateProfile(updates: Partial<AuthUser>): Promise<AuthUser> {
    if (!this.user) {
      throw new Error("No authenticated user")
    }

    this.loading = true
    this.error = null
    this.notifySubscribers()

    try {
      const updatedUser = { ...this.user, ...updates }
      this.user = updatedUser
      
      // Store updated user data securely using advanced encryption
      await setSecureJSONAdvanced("auth_user", updatedUser)
      
      this.notifySubscribers()
      return updatedUser
    } catch (error) {
      this.error = error instanceof Error ? error.message : "Profile update failed"
      this.notifySubscribers()
      throw error
    } finally {
      this.loading = false
      this.notifySubscribers()
    }
  }

  async uploadAvatar(file: File): Promise<string> {
    this.loading = true
    this.error = null
    this.notifySubscribers()

    try {
      // Mock implementation - return a placeholder URL
      const avatarUrl = URL.createObjectURL(file)

      if (this.user) {
        await this.updateProfile({ avatar: avatarUrl })
      }

      return avatarUrl
    } catch (error) {
      this.error = error instanceof Error ? error.message : "Avatar upload failed"
      this.notifySubscribers()
      throw error
    } finally {
      this.loading = false
      this.notifySubscribers()
    }
  }

  isAuthenticated(): boolean {
    return this.user !== null
  }

  hasRole(role: string): boolean {
    if (!this.user) return false;
    const rolesHierarchy = {
      admin: ['admin', 'agent', 'user'],
      agent: ['agent', 'user'],
      user: ['user'],
    };
    const userRoles = rolesHierarchy[this.user.role as keyof typeof rolesHierarchy] || [];
    return userRoles.includes(role);
  }

  getAccessToken(): string | null {
    if (!this.user || !this.tokens) return null
    
    // Check if token is expired
    if (new Date() > new Date(this.tokens.expiresAt)) {
      // Token expired, clear auth state
      this.signOut()
      return null
    }
    
    return this.tokens.accessToken
  }

  getCurrentUser(): AuthUser | null {
    return this.user
  }

  getState(): AuthState {
    return {
      user: this.user,
      loading: this.loading,
      error: this.error,
    }
  }

  // Subscribe to auth state changes
  subscribe(callback: (state: AuthState) => void): () => void {
    this.subscribers.push(callback)
    return () => {
      this.subscribers = this.subscribers.filter((sub) => sub !== callback)
    }
  }

  private notifySubscribers(): void {
    const state = this.getState()
    this.subscribers.forEach((callback) => callback(state))
  }

  private generateSecureToken(): string {
    // Generate a cryptographically secure token
    const array = new Uint8Array(32)
    crypto.getRandomValues(array)
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('')
  }

  // Initialize from secure storage
  async init(): Promise<void> {
    try {
      // Try to load user data using advanced encryption first
      const storedUser = await getSecureJSONAdvanced("auth_user")
      const storedTokens = await getSecureJSONAdvanced("auth_tokens")
      
      if (storedUser && typeof storedUser === 'object' && 'id' in storedUser && 'email' in storedUser) {
        this.user = storedUser as AuthUser
        
        if (storedTokens && typeof storedTokens === 'object' && 'accessToken' in storedTokens) {
          this.tokens = storedTokens as AuthTokens
          
          // Check if token is expired
          if (new Date() > new Date(this.tokens.expiresAt)) {
            // Token expired, clear auth state
            await this.signOut()
            return
          }
        }
        
        this.notifySubscribers()
      }
    } catch (error) {
      // Try legacy storage as fallback
      try {
        const legacyUser = getSecureJSON("auth_user")
        if (legacyUser && typeof legacyUser === 'object' && 'id' in legacyUser && 'email' in legacyUser) {
          this.user = legacyUser as AuthUser
          // Migrate to advanced encryption
          await setSecureJSONAdvanced("auth_user", this.user)
          this.notifySubscribers()
        }
      } catch (legacyError) {
        // Silent error handling - Failed to load user from storage
      }
    }
  }
}

export const authService = new AuthService()

// Initialize on import
if (typeof window !== "undefined") {
  authService.init().catch(error => {
    console.error("Failed to initialize auth service:", error)
  })
}
