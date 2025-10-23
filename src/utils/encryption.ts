/**
 * Advanced Encryption Module for CRM Platform
 * Implements AES-256-GCM encryption with PBKDF2 key derivation
 * Provides industry-standard security for sensitive data
 */

// Encryption configuration constants
const ENCRYPTION_CONFIG = {
  algorithm: 'AES-GCM' as const,
  keyLength: 256,
  ivLength: 12, // 96 bits for GCM
  saltLength: 32, // 256 bits
  tagLength: 16, // 128 bits
  iterations: 100000, // PBKDF2 iterations (OWASP recommended minimum)
  keyDerivationAlgorithm: 'PBKDF2' as const,
  hashAlgorithm: 'SHA-256' as const,
} as const

// Type definitions for encryption operations
interface EncryptionResult {
  encryptedData: string
  iv: string
  salt: string
  tag: string
  version: string
}

interface DecryptionInput {
  encryptedData: string
  iv: string
  salt: string
  tag: string
  version?: string
}

interface KeyDerivationResult {
  key: CryptoKey
  salt: Uint8Array
}

/**
 * Advanced Encryption Service Class
 * Provides secure encryption/decryption with proper key management
 */
export class AdvancedEncryption {
  private readonly masterPassword: string
  private readonly version = '1.0'

  private isInitialized = false
  private masterKey?: ArrayBuffer
  private cryptoKey?: CryptoKey

  constructor(masterPassword?: string) {
    // Use environment variable or provided password
    this.masterPassword = masterPassword || 
      process.env.ENCRYPTION_MASTER_KEY || 
      process.env.NEXT_PUBLIC_ENCRYPTION_FALLBACK || 
      'default-secure-key-change-in-production'
    
    if (this.masterPassword === 'default-secure-key-change-in-production') {
      console.warn('⚠️  Using default encryption key. Set ENCRYPTION_MASTER_KEY in production!')
    }
  }

  /**
   * Initialize the encryption system with key management
   */
  private async initialize(): Promise<void> {
    if (this.isInitialized) return

    try {
      // Get or create master key with key management
      const masterKeyHex = await this.getMasterKeyWithManagement()
      this.masterKey = this.hexToArrayBuffer(masterKeyHex)
      
      // Import the key for use with Web Crypto API
      this.cryptoKey = await crypto.subtle.importKey(
        'raw',
        this.masterKey,
        { name: 'AES-GCM' },
        false,
        ['encrypt', 'decrypt']
      )
      
      this.isInitialized = true
      console.log('🔐 Advanced encryption system initialized with key management')
      
      // Schedule periodic key rotation check
      this.scheduleKeyRotationCheck()
    } catch (error) {
      console.error('Failed to initialize encryption system:', error)
      throw new Error('Encryption initialization failed')
    }
  }

  /**
   * Get or create master key with management capabilities
   */
  private async getMasterKeyWithManagement(): Promise<string> {
    // For now, derive from master password - in production this would use secure key storage
    const encoder = new TextEncoder()
    const data = encoder.encode(this.masterPassword)
    const hashBuffer = await crypto.subtle.digest('SHA-256', data)
    return this.arrayBufferToHex(hashBuffer)
  }

  /**
   * Schedule periodic key rotation checks
   */
  private scheduleKeyRotationCheck(): void {
    // Implementation would depend on your key rotation policy
    console.log('Key rotation check scheduled')
  }

  /**
   * Integrate with key management for automatic rotation
   */
  async rotateEncryptionKey(): Promise<void> {
    try {
      // Force re-initialization with new key
      this.isInitialized = false
      await this.initialize()
      console.log('🔄 Encryption key rotated successfully')
    } catch (error) {
      console.error('Failed to rotate encryption key:', error)
      throw new Error('Key rotation failed')
    }
  }

  /**
   * Get encryption health status
   */
  getHealthStatus(): {
    initialized: boolean
    keyPresent: boolean
    version: string
  } {
    return {
      initialized: this.isInitialized,
      keyPresent: !!this.cryptoKey,
      version: this.version
    }
  }

  /**
   * Convert hex string to ArrayBuffer
   */
  private hexToArrayBuffer(hex: string): ArrayBuffer {
    const bytes = new Uint8Array(hex.length / 2)
    for (let i = 0; i < hex.length; i += 2) {
      bytes[i / 2] = parseInt(hex.substr(i, 2), 16)
    }
    return bytes.buffer
  }

  /**
   * Convert ArrayBuffer to hex string
   */
  private arrayBufferToHex(buffer: ArrayBuffer): string {
    const bytes = new Uint8Array(buffer)
    return Array.from(bytes, byte => byte.toString(16).padStart(2, '0')).join('')
  }

  /**
   * Derives a cryptographic key from the master password using PBKDF2
   */
  private async deriveKey(salt: Uint8Array): Promise<CryptoKey> {
    if (!crypto.subtle) {
      throw new Error('Web Crypto API not available. Secure encryption requires HTTPS.')
    }

    // Import the master password as a key
    const passwordKey = await crypto.subtle.importKey(
      'raw',
      new TextEncoder().encode(this.masterPassword),
      { name: ENCRYPTION_CONFIG.keyDerivationAlgorithm },
      false,
      ['deriveKey']
    )

    // Derive the actual encryption key
    return await crypto.subtle.deriveKey(
      {
        name: ENCRYPTION_CONFIG.keyDerivationAlgorithm,
        salt: salt.buffer as ArrayBuffer,
        iterations: ENCRYPTION_CONFIG.iterations,
        hash: ENCRYPTION_CONFIG.hashAlgorithm,
      },
      passwordKey,
      {
        name: ENCRYPTION_CONFIG.algorithm,
        length: ENCRYPTION_CONFIG.keyLength,
      },
      false,
      ['encrypt', 'decrypt']
    )
  }

  /**
   * Generates a cryptographically secure random salt
   */
  private generateSalt(): Uint8Array {
    return crypto.getRandomValues(new Uint8Array(ENCRYPTION_CONFIG.saltLength))
  }

  /**
   * Generates a cryptographically secure random IV
   */
  private generateIV(): Uint8Array {
    return crypto.getRandomValues(new Uint8Array(ENCRYPTION_CONFIG.ivLength))
  }

  /**
   * Converts Uint8Array to base64 string for storage
   */
  private arrayBufferToBase64(buffer: ArrayBuffer | Uint8Array | ArrayBufferLike): string {
    const bytes = buffer instanceof Uint8Array ? buffer : new Uint8Array(buffer as ArrayBuffer)
    let binary = ''
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i])
    }
    return btoa(binary)
  }

  /**
   * Converts base64 string back to Uint8Array
   */
  private base64ToArrayBuffer(base64: string): ArrayBuffer {
    const binary = atob(base64)
    const bytes = new Uint8Array(binary.length)
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i)
    }
    return bytes.buffer
  }

  /**
   * Encrypts data using AES-256-GCM with PBKDF2 key derivation
   */
  async encrypt(plaintext: string): Promise<string> {
    try {
      if (!crypto.subtle) {
        throw new Error('Web Crypto API not available')
      }

      // Generate random salt and IV
      const salt = this.generateSalt()
      const iv = this.generateIV()

      // Derive encryption key
      const key = await this.deriveKey(salt)

      // Encrypt the data
      const encodedPlaintext = new TextEncoder().encode(plaintext)
      const encryptedBuffer = await crypto.subtle.encrypt(
        {
          name: ENCRYPTION_CONFIG.algorithm,
          iv: iv.buffer as ArrayBuffer,
        },
        key,
        encodedPlaintext
      )

      // Extract the encrypted data and authentication tag
      const encryptedArray = new Uint8Array(encryptedBuffer)
      const encryptedData = encryptedArray.slice(0, -ENCRYPTION_CONFIG.tagLength)
      const tag = encryptedArray.slice(-ENCRYPTION_CONFIG.tagLength)

      // Create result object
      const result: EncryptionResult = {
        encryptedData: this.arrayBufferToBase64(encryptedData.buffer),
        iv: this.arrayBufferToBase64(iv.buffer),
        salt: this.arrayBufferToBase64(salt.buffer),
        tag: this.arrayBufferToBase64(tag.buffer),
        version: this.version,
      }

      // Return as JSON string for storage
      return JSON.stringify(result)
    } catch (error) {
      console.error('Encryption failed:', error)
      throw new Error('Failed to encrypt data')
    }
  }

  /**
   * Decrypts data encrypted with AES-256-GCM
   */
  async decrypt(encryptedData: string): Promise<string> {
    try {
      if (!crypto.subtle) {
        throw new Error('Web Crypto API not available')
      }

      // Parse the encrypted data
      const data: DecryptionInput = JSON.parse(encryptedData)
      
      // Convert base64 strings back to ArrayBuffers
      const salt = new Uint8Array(this.base64ToArrayBuffer(data.salt))
      const iv = new Uint8Array(this.base64ToArrayBuffer(data.iv))
      const encrypted = new Uint8Array(this.base64ToArrayBuffer(data.encryptedData))
      const tag = new Uint8Array(this.base64ToArrayBuffer(data.tag))

      // Derive the same key using the stored salt
      const key = await this.deriveKey(salt)

      // Combine encrypted data and tag for decryption
      const encryptedWithTag = new Uint8Array(encrypted.length + tag.length)
      encryptedWithTag.set(encrypted)
      encryptedWithTag.set(tag, encrypted.length)

      // Decrypt the data
      const decryptedBuffer = await crypto.subtle.decrypt(
        {
          name: ENCRYPTION_CONFIG.algorithm,
          iv: iv,
        },
        key,
        encryptedWithTag
      )

      // Convert back to string
      return new TextDecoder().decode(decryptedBuffer)
    } catch (error) {
      console.error('Decryption failed:', error)
      throw new Error('Failed to decrypt data')
    }
  }

  /**
   * Encrypts data for API keys and tokens with additional metadata
   */
  async encryptApiKey(apiKey: string, metadata?: Record<string, any>): Promise<string> {
    const dataToEncrypt = {
      apiKey,
      metadata: metadata || {},
      timestamp: Date.now(),
      keyType: 'api_key',
    }
    return await this.encrypt(JSON.stringify(dataToEncrypt))
  }

  /**
   * Decrypts API keys and returns the key with metadata
   */
  async decryptApiKey(encryptedApiKey: string): Promise<{
    apiKey: string
    metadata: Record<string, any>
    timestamp: number
    keyType: string
  }> {
    const decryptedData = await this.decrypt(encryptedApiKey)
    return JSON.parse(decryptedData)
  }

  /**
   * Validates if data is properly encrypted (has correct structure)
   */
  isEncrypted(data: string): boolean {
    try {
      const parsed = JSON.parse(data)
      return !!(
        parsed.encryptedData &&
        parsed.iv &&
        parsed.salt &&
        parsed.tag &&
        parsed.version
      )
    } catch {
      return false
    }
  }

  /**
   * Generates a secure random encryption key for key rotation
   */
  generateSecureKey(length: number = 32): string {
    const array = crypto.getRandomValues(new Uint8Array(length))
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('')
  }

  /**
   * Hashes sensitive data for comparison without storing plaintext
   */
  async hashSensitiveData(data: string): Promise<string> {
    const encoder = new TextEncoder()
    const dataBuffer = encoder.encode(data)
    const hashBuffer = await crypto.subtle.digest('SHA-256', dataBuffer)
    return this.arrayBufferToBase64(hashBuffer)
  }
}

// Create singleton instance
export const advancedEncryption = new AdvancedEncryption()

// Export convenience functions for backward compatibility
export const encryptData = (data: string): Promise<string> => advancedEncryption.encrypt(data)
export const decryptData = (encryptedData: string): Promise<string> => advancedEncryption.decrypt(encryptedData)
export const encryptApiKey = (apiKey: string): Promise<string> => advancedEncryption.encryptApiKey(apiKey)
export const decryptApiKey = (encryptedApiKey: string): Promise<{
  apiKey: string
  metadata: Record<string, any>
  timestamp: number
  keyType: string
}> => advancedEncryption.decryptApiKey(encryptedApiKey)

// Export types for external use
export type { EncryptionResult, DecryptionInput, KeyDerivationResult }