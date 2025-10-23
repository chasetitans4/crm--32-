// Configuration service for managing application settings
// Mock configuration service for feature flags
export interface ConfigService {
  getFeature: (featureName: string) => boolean
  setFeature: (featureName: string, enabled: boolean) => void
  getAllFeatures: () => Record<string, boolean>
}

export interface DatabaseConfig {
  supabaseUrl: string
  supabaseAnonKey: string
  supabaseServiceKey?: string
}

export interface EmailConfig {
  provider: "mailjet" | "outlook" | "smtp"
  mailjet?: {
    clientId: string
    clientSecret: string
    redirectUri: string
  }
  outlook?: {
    clientId: string
    clientSecret: string
    redirectUri: string
    tenantId: string
  }
  smtp?: {
    host: string
    port: number
    secure: boolean
    user: string
    password: string
  }
}

export interface NotificationConfig {
  enablePush: boolean
  enableEmail: boolean
  enableSMS: boolean
  defaultDuration: number
  maxNotifications: number
}

export interface ThemeConfig {
  defaultTheme: "light" | "dark" | "system"
  allowUserThemeChange: boolean
  customColors?: {
    primary: string
    secondary: string
    accent: string
  }
}

export interface SecurityConfig {
  sessionTimeout: number // minutes
  maxLoginAttempts: number
  passwordMinLength: number
  requireTwoFactor: boolean
  allowedDomains?: string[]
}

export interface PerformanceConfig {
  enableCaching: boolean
  cacheTimeout: number // minutes
  maxCacheSize: number // MB
  enableOfflineMode: boolean
  syncInterval: number // minutes
  enableAnalytics: boolean
}

export interface FeatureFlags {
  enableAdvancedAnalytics: boolean
  enableEmailIntegration: boolean
  enableRealTimeUpdates: boolean
  enableOfflineMode: boolean
  enableRoleBasedAccess: boolean
  enableAuditLog: boolean
  enableDataExport: boolean
  enableCustomFields: boolean
  enableAutomations: boolean
  enableIntegrations: boolean
}

export interface AppConfig {
  app: {
    name: string
    version: string
    environment: "development" | "staging" | "production"
    debug: boolean
    apiUrl: string
  }
  database: DatabaseConfig
  email: EmailConfig
  notifications: NotificationConfig
  theme: ThemeConfig
  security: SecurityConfig
  performance: PerformanceConfig
  features: FeatureFlags
}

class ConfigServiceImpl implements ConfigService {
  private features: Record<string, boolean> = {
    enableDataExport: true,
    enableCustomFields: true,
    enableAutomations: true,
    enableAdvancedAnalytics: true,
    enableEnhancedSearch: true,
    enableEmailTemplates: true,
    enableNotifications: true,
    enableReporting: true,
  }

  getFeature(featureName: string): boolean {
    return this.features[featureName] ?? false
  }

  setFeature(featureName: string, enabled: boolean): void {
    this.features[featureName] = enabled
  }

  getAllFeatures(): Record<string, boolean> {
    return { ...this.features }
  }

  isDevelopment(): boolean {
    return process.env.NODE_ENV === 'development'
  }
}

// Create and export singleton instance
export const configService = new ConfigServiceImpl()
export default configService
