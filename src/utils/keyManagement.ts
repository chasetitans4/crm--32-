/**
 * Advanced Key Management System
 * Provides secure key generation, rotation, storage, and lifecycle management
 */

import { advancedEncryption } from './encryption'

interface KeyMetadata {
  id: string
  version: number
  createdAt: Date
  lastUsed: Date
  rotationDue: Date
  algorithm: string
  purpose: string
  status: 'active' | 'deprecated' | 'revoked'
}

interface MasterKeyConfig {
  rotationIntervalDays: number
  maxKeyAge: number
  backupCount: number
}

class KeyManager {
  private readonly config: MasterKeyConfig
  private readonly keyPrefix = 'km_'
  private readonly metadataPrefix = 'km_meta_'
  
  constructor(config: Partial<MasterKeyConfig> = {}) {
    this.config = {
      rotationIntervalDays: 90, // Rotate keys every 90 days
      maxKeyAge: 365, // Maximum key age in days
      backupCount: 3, // Keep 3 backup keys
      ...config
    }
  }

  /**
   * Generate a new master key with metadata
   */
  async generateMasterKey(purpose: string = 'encryption'): Promise<string> {
    try {
      const keyId = this.generateKeyId()
      const key = await this.generateSecureKey()
      
      const metadata: KeyMetadata = {
        id: keyId,
        version: 1,
        createdAt: new Date(),
        lastUsed: new Date(),
        rotationDue: new Date(Date.now() + this.config.rotationIntervalDays * 24 * 60 * 60 * 1000),
        algorithm: 'AES-256-GCM',
        purpose,
        status: 'active'
      }

      // Store encrypted key and metadata
      await this.storeKey(keyId, key, metadata)
      
      console.log(`✅ Generated new master key: ${keyId}`)
      return keyId
    } catch (error) {
      console.error('Failed to generate master key:', error)
      throw new Error('Master key generation failed')
    }
  }

  /**
   * Rotate an existing key
   */
  async rotateKey(keyId: string): Promise<string> {
    try {
      const oldMetadata = await this.getKeyMetadata(keyId)
      if (!oldMetadata) {
        throw new Error(`Key ${keyId} not found`)
      }

      // Generate new key
      const newKeyId = this.generateKeyId()
      const newKey = await this.generateSecureKey()
      
      const newMetadata: KeyMetadata = {
        ...oldMetadata,
        id: newKeyId,
        version: oldMetadata.version + 1,
        createdAt: new Date(),
        lastUsed: new Date(),
        rotationDue: new Date(Date.now() + this.config.rotationIntervalDays * 24 * 60 * 60 * 1000),
        status: 'active'
      }

      // Store new key
      await this.storeKey(newKeyId, newKey, newMetadata)
      
      // Mark old key as deprecated
      oldMetadata.status = 'deprecated'
      await this.updateKeyMetadata(keyId, oldMetadata)
      
      console.log(`✅ Rotated key ${keyId} → ${newKeyId}`)
      return newKeyId
    } catch (error) {
      console.error(`Failed to rotate key ${keyId}:`, error)
      throw new Error(`Key rotation failed for ${keyId}`)
    }
  }

  /**
   * Get active key for a purpose
   */
  async getActiveKey(purpose: string = 'encryption'): Promise<string | null> {
    try {
      const keys = await this.getAllKeys()
      const activeKey = keys.find(key => 
        key.metadata.purpose === purpose && 
        key.metadata.status === 'active'
      )
      
      if (activeKey) {
        // Update last used timestamp
        activeKey.metadata.lastUsed = new Date()
        await this.updateKeyMetadata(activeKey.metadata.id, activeKey.metadata)
        return activeKey.key
      }
      
      return null
    } catch (error) {
      console.error(`Failed to get active key for ${purpose}:`, error)
      return null
    }
  }

  /**
   * Check if key rotation is due
   */
  async isRotationDue(keyId: string): Promise<boolean> {
    try {
      const metadata = await this.getKeyMetadata(keyId)
      if (!metadata) return false
      
      return new Date() >= metadata.rotationDue
    } catch (error) {
      console.error(`Failed to check rotation status for ${keyId}:`, error)
      return false
    }
  }

  /**
   * Perform automatic key rotation for all due keys
   */
  async performAutoRotation(): Promise<void> {
    try {
      const keys = await this.getAllKeys()
      const dueKeys = keys.filter(key => 
        key.metadata.status === 'active' && 
        new Date() >= key.metadata.rotationDue
      )

      for (const keyInfo of dueKeys) {
        try {
          await this.rotateKey(keyInfo.metadata.id)
        } catch (error) {
          console.error(`Auto-rotation failed for key ${keyInfo.metadata.id}:`, error)
        }
      }

      console.log(`✅ Auto-rotation completed for ${dueKeys.length} keys`)
    } catch (error) {
      console.error('Auto-rotation process failed:', error)
    }
  }

  /**
   * Cleanup old and revoked keys
   */
  async cleanupOldKeys(): Promise<void> {
    try {
      const keys = await this.getAllKeys()
      const cutoffDate = new Date(Date.now() - this.config.maxKeyAge * 24 * 60 * 60 * 1000)
      
      const keysToRemove = keys.filter(key => 
        (key.metadata.status === 'deprecated' || key.metadata.status === 'revoked') &&
        key.metadata.createdAt < cutoffDate
      )

      for (const keyInfo of keysToRemove) {
        await this.deleteKey(keyInfo.metadata.id)
      }

      console.log(`✅ Cleaned up ${keysToRemove.length} old keys`)
    } catch (error) {
      console.error('Key cleanup failed:', error)
    }
  }

  /**
   * Get key health status
   */
  async getKeyHealthStatus(): Promise<{
    totalKeys: number
    activeKeys: number
    deprecatedKeys: number
    revokedKeys: number
    rotationDue: number
    oldKeys: number
  }> {
    try {
      const keys = await this.getAllKeys()
      const now = new Date()
      const cutoffDate = new Date(now.getTime() - this.config.maxKeyAge * 24 * 60 * 60 * 1000)

      return {
        totalKeys: keys.length,
        activeKeys: keys.filter(k => k.metadata.status === 'active').length,
        deprecatedKeys: keys.filter(k => k.metadata.status === 'deprecated').length,
        revokedKeys: keys.filter(k => k.metadata.status === 'revoked').length,
        rotationDue: keys.filter(k => k.metadata.status === 'active' && now >= k.metadata.rotationDue).length,
        oldKeys: keys.filter(k => k.metadata.createdAt < cutoffDate).length
      }
    } catch (error) {
      console.error('Failed to get key health status:', error)
      return {
        totalKeys: 0,
        activeKeys: 0,
        deprecatedKeys: 0,
        revokedKeys: 0,
        rotationDue: 0,
        oldKeys: 0
      }
    }
  }

  // Private helper methods

  private generateKeyId(): string {
    const timestamp = Date.now().toString(36)
    const random = Math.random().toString(36).substring(2, 8)
    return `key_${timestamp}_${random}`
  }

  private async generateSecureKey(): Promise<string> {
    // Generate a 256-bit (32 byte) key
    const key = new Uint8Array(32)
    crypto.getRandomValues(key)
    return Array.from(key, byte => byte.toString(16).padStart(2, '0')).join('')
  }

  private async storeKey(keyId: string, key: string, metadata: KeyMetadata): Promise<void> {
    try {
      // Encrypt the key before storage
      const encryptedKey = await advancedEncryption.encrypt(key)
      localStorage.setItem(this.keyPrefix + keyId, encryptedKey)
      localStorage.setItem(this.metadataPrefix + keyId, JSON.stringify(metadata))
    } catch (error) {
      throw new Error(`Failed to store key ${keyId}: ${error}`)
    }
  }

  private async getKeyMetadata(keyId: string): Promise<KeyMetadata | null> {
    try {
      const metadataStr = localStorage.getItem(this.metadataPrefix + keyId)
      if (!metadataStr) return null
      
      const metadata = JSON.parse(metadataStr) as KeyMetadata
      // Convert date strings back to Date objects
      metadata.createdAt = new Date(metadata.createdAt)
      metadata.lastUsed = new Date(metadata.lastUsed)
      metadata.rotationDue = new Date(metadata.rotationDue)
      
      return metadata
    } catch (error) {
      console.error(`Failed to get metadata for key ${keyId}:`, error)
      return null
    }
  }

  private async updateKeyMetadata(keyId: string, metadata: KeyMetadata): Promise<void> {
    try {
      localStorage.setItem(this.metadataPrefix + keyId, JSON.stringify(metadata))
    } catch (error) {
      throw new Error(`Failed to update metadata for key ${keyId}: ${error}`)
    }
  }

  private async getAllKeys(): Promise<Array<{key: string, metadata: KeyMetadata}>> {
    try {
      const keys: Array<{key: string, metadata: KeyMetadata}> = []
      
      for (let i = 0; i < localStorage.length; i++) {
        const storageKey = localStorage.key(i)
        if (storageKey?.startsWith(this.metadataPrefix)) {
          const keyId = storageKey.substring(this.metadataPrefix.length)
          const metadata = await this.getKeyMetadata(keyId)
          
          if (metadata) {
            const encryptedKey = localStorage.getItem(this.keyPrefix + keyId)
            if (encryptedKey) {
              const decryptedKey = await advancedEncryption.decrypt(encryptedKey)
              keys.push({ key: decryptedKey, metadata })
            }
          }
        }
      }
      
      return keys
    } catch (error) {
      console.error('Failed to get all keys:', error)
      return []
    }
  }

  private async deleteKey(keyId: string): Promise<void> {
    try {
      localStorage.removeItem(this.keyPrefix + keyId)
      localStorage.removeItem(this.metadataPrefix + keyId)
    } catch (error) {
      throw new Error(`Failed to delete key ${keyId}: ${error}`)
    }
  }
}

// Create singleton instance
export const keyManager = new KeyManager()

// Export types and class
export { KeyManager }
export type { KeyMetadata, MasterKeyConfig }

// Convenience functions
export const generateMasterKey = (purpose?: string) => keyManager.generateMasterKey(purpose)
export const rotateKey = (keyId: string) => keyManager.rotateKey(keyId)
export const getActiveKey = (purpose?: string) => keyManager.getActiveKey(purpose)
export const performAutoRotation = () => keyManager.performAutoRotation()
export const cleanupOldKeys = () => keyManager.cleanupOldKeys()
export const getKeyHealthStatus = () => keyManager.getKeyHealthStatus()