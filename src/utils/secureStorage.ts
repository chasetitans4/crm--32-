import { encryptApiKeySync as encryptData, decryptApiKeySync as decryptData, encryptApiKey, decryptApiKey } from './security'
import { advancedEncryption } from './encryption'

/**
 * Secure storage utility that encrypts sensitive data before storing in localStorage
 * and decrypts it when retrieving. Falls back to regular localStorage for non-sensitive data.
 */
class SecureStorage {
  private readonly sensitiveKeys = new Set([
    'auth_token',
    'auth_user',
    'api_keys',
    'user_credentials',
    'session_data',
    'payment_info',
    'personal_data'
  ])

  /**
   * Store data securely. Encrypts sensitive data, stores others normally.
   */
  setItem(key: string, value: string): void {
    try {
      if (this.isSensitiveKey(key)) {
        const encryptedValue = encryptData(value)
        localStorage.setItem(key, encryptedValue)
      } else {
        localStorage.setItem(key, value)
      }
    } catch (error) {
      console.error(`Failed to store item '${key}':`, error)
      throw new Error(`Secure storage failed for key: ${key}`)
    }
  }

  /**
   * Store data securely using advanced AES-256-GCM encryption (async)
   * Recommended for new implementations
   */
  async setItemSecure(key: string, value: string): Promise<void> {
    try {
      if (this.isSensitiveKey(key)) {
        const encryptedValue = await advancedEncryption.encrypt(value)
        localStorage.setItem(key, encryptedValue)
      } else {
        localStorage.setItem(key, value)
      }
    } catch (error) {
      console.error(`Failed to store item securely '${key}':`, error)
      throw new Error(`Advanced secure storage failed for key: ${key}`)
    }
  }

  /**
   * Retrieve data securely. Decrypts sensitive data, returns others normally.
   */
  getItem(key: string): string | null {
    try {
      const value = localStorage.getItem(key)
      if (value === null) return null

      if (this.isSensitiveKey(key)) {
        return decryptData(value)
      } else {
        return value
      }
    } catch (error) {
      console.error(`Failed to retrieve item '${key}':`, error)
      // Return null instead of throwing to maintain localStorage API compatibility
      return null
    }
  }

  /**
   * Retrieve data securely using advanced decryption (async)
   * Automatically handles both new and legacy encrypted formats
   */
  async getItemSecure(key: string): Promise<string | null> {
    try {
      const value = localStorage.getItem(key)
      if (value === null) return null

      if (this.isSensitiveKey(key)) {
        // Check if it's new format first
        if (advancedEncryption.isEncrypted(value)) {
          return await advancedEncryption.decrypt(value)
        } else {
          // Fall back to legacy decryption
          return decryptData(value)
        }
      } else {
        return value
      }
    } catch (error) {
      console.error(`Failed to retrieve item securely '${key}':`, error)
      return null
    }
  }

  /**
   * Remove item from storage
   */
  removeItem(key: string): void {
    try {
      localStorage.removeItem(key)
    } catch (error) {
      console.error(`Failed to remove item '${key}':`, error)
    }
  }

  /**
   * Clear all storage
   */
  clear(): void {
    try {
      localStorage.clear()
    } catch (error) {
      console.error('Failed to clear storage:', error)
    }
  }

  /**
   * Get all keys from storage
   */
  getAllKeys(): string[] {
    try {
      return Object.keys(localStorage)
    } catch (error) {
      console.error('Failed to get storage keys:', error)
      return []
    }
  }

  /**
   * Check if a key contains sensitive data
   */
  private isSensitiveKey(key: string): boolean {
    return this.sensitiveKeys.has(key) || 
           key.includes('token') || 
           key.includes('password') || 
           key.includes('secret') || 
           key.includes('key') ||
           key.includes('credential')
  }

  /**
   * Add a key to the sensitive keys list
   */
  addSensitiveKey(key: string): void {
    this.sensitiveKeys.add(key)
  }

  /**
   * Remove a key from the sensitive keys list
   */
  removeSensitiveKey(key: string): void {
    this.sensitiveKeys.delete(key)
  }

  /**
   * Store JSON data securely
   */
  setJSON(key: string, value: unknown): void {
    try {
      const jsonString = JSON.stringify(value)
      this.setItem(key, jsonString)
    } catch (error) {
      console.error(`Failed to store JSON for key '${key}':`, error)
      throw new Error(`Failed to serialize and store data for key: ${key}`)
    }
  }

  /**
   * Retrieve JSON data securely
   */
  getJSON<T = unknown>(key: string): T | null {
    try {
      const value = this.getItem(key)
      if (value === null) return null
      return JSON.parse(value) as T
    } catch (error) {
      console.error(`Failed to retrieve JSON for key '${key}':`, error)
      return null
    }
  }

  /**
   * Migrate existing localStorage data to advanced secure storage
   */
  async migrateToAdvancedEncryption(): Promise<void> {
    try {
      const keys = this.getAllKeys()
      const sensitiveData: Array<{key: string, value: string}> = []
      
      // Identify sensitive data that needs migration
      keys.forEach(key => {
        if (this.isSensitiveKey(key)) {
          const value = localStorage.getItem(key)
          if (value) {
            sensitiveData.push({ key, value })
          }
        }
      })
      
      // Migrate to advanced encryption
      for (const { key, value } of sensitiveData) {
        try {
          // Check if already using advanced encryption
          if (advancedEncryption.isEncrypted(value)) {
            continue // Already migrated
          }
          
          // Try to decrypt legacy format first
          let plaintext: string
          try {
            plaintext = decryptData(value)
          } catch {
            // Assume it's unencrypted plaintext
            plaintext = value
          }
          
          // Re-encrypt with advanced encryption
          const encryptedValue = await advancedEncryption.encrypt(plaintext)
          localStorage.setItem(key, encryptedValue)
        } catch (error) {
          console.error(`Failed to migrate key '${key}':`, error)
        }
      }
      
      console.log(`✅ Migrated ${sensitiveData.length} sensitive items to advanced encryption`)
    } catch (error) {
      console.error('Failed to migrate to advanced encryption:', error)
    }
  }

  /**
   * Legacy migration method for backward compatibility
   */
  migrateExistingData(): void {
    try {
      const keys = this.getAllKeys()
      const sensitiveData: Array<{key: string, value: string}> = []
      
      // Identify sensitive data that needs migration
      keys.forEach(key => {
        if (this.isSensitiveKey(key)) {
          const value = localStorage.getItem(key)
          if (value) {
            sensitiveData.push({ key, value })
          }
        }
      })
      
      // Re-encrypt sensitive data
      sensitiveData.forEach(({ key, value }) => {
        try {
          // Try to decrypt first to see if it's already encrypted
          decryptData(value)
          // If no error, it's already encrypted
        } catch {
          // Not encrypted, so encrypt it now
          const encryptedValue = encryptData(value)
          localStorage.setItem(key, encryptedValue)
        }
      })
      
      console.log(`Migrated ${sensitiveData.length} sensitive items to secure storage`)
    } catch (error) {
      console.error('Failed to migrate existing data:', error)
    }
  }

  /**
   * Store JSON data securely using advanced encryption
   */
  async setJSONSecure(key: string, value: unknown): Promise<void> {
    try {
      const jsonString = JSON.stringify(value)
      await this.setItemSecure(key, jsonString)
    } catch (error) {
      console.error(`Failed to store JSON securely '${key}':`, error)
      throw new Error(`Secure JSON storage failed for key: ${key}`)
    }
  }

  /**
   * Retrieve JSON data securely using advanced decryption
   */
  async getJSONSecure<T = unknown>(key: string): Promise<T | null> {
    try {
      const jsonString = await this.getItemSecure(key)
      if (jsonString === null) return null
      return JSON.parse(jsonString) as T
    } catch (error) {
      console.error(`Failed to retrieve JSON securely '${key}':`, error)
      return null
    }
  }
}

// Create and export singleton instance
export const secureStorage = new SecureStorage()

// Export class for testing
export { SecureStorage }

// Export convenience functions (legacy)
export const setSecureItem = (key: string, value: string) => secureStorage.setItem(key, value)
export const getSecureItem = (key: string) => secureStorage.getItem(key)
export const removeSecureItem = (key: string) => secureStorage.removeItem(key)
export const setSecureJSON = (key: string, value: unknown) => secureStorage.setJSON(key, value)
export const getSecureJSON = <T = unknown>(key: string) => secureStorage.getJSON<T>(key)

// Export advanced secure functions (recommended for new code)
export async function setSecureItemAdvanced(key: string, value: string): Promise<void> {
  return await secureStorage.setItemSecure(key, value)
}

export async function getSecureItemAdvanced(key: string): Promise<string | null> {
  return await secureStorage.getItemSecure(key)
}

export async function setSecureJSONAdvanced(key: string, value: unknown): Promise<void> {
  return await secureStorage.setJSONSecure(key, value)
}

export async function getSecureJSONAdvanced<T = unknown>(key: string): Promise<T | null> {
  return await secureStorage.getJSONSecure<T>(key)
}

export async function migrateToAdvancedEncryption(): Promise<void> {
  return await secureStorage.migrateToAdvancedEncryption()
}