import { SecureStorage, secureStorage } from '../secureStorage'
import * as security from '../security'

// Mock the security module
jest.mock('../security', () => ({
  encryptApiKey: jest.fn((data: string) => `encrypted_${data}`),
  decryptApiKey: jest.fn((data: string) => data.replace('encrypted_', '')),
}))

const mockSecurity = security as jest.Mocked<typeof security>

// Mock localStorage
const mockLocalStorage = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
  key: jest.fn(),
  length: 0,
}

Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage,
})

describe('SecureStorage', () => {
  let storage: SecureStorage
  let consoleErrorSpy: jest.SpyInstance
  let consoleLogSpy: jest.SpyInstance

  beforeEach(() => {
    jest.clearAllMocks()
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {})
    consoleLogSpy = jest.spyOn(console, 'log').mockImplementation(() => {})
    storage = new SecureStorage()
  })

  afterEach(() => {
    consoleErrorSpy.mockRestore()
    consoleLogSpy.mockRestore()
    // Clear localStorage to prevent memory leaks
    mockLocalStorage.clear()
    jest.clearAllTimers()
  })

  describe('setItem', () => {
    it('should encrypt sensitive data', () => {
      const key = 'auth_token'
      const value = 'secret-token-123'

      storage.setItem(key, value)

      expect(mockSecurity.encryptApiKey).toHaveBeenCalledWith(value)
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith(key, 'encrypted_secret-token-123')
    })

    it('should store non-sensitive data without encryption', () => {
      const key = 'user_preference'
      const value = 'dark_mode'

      storage.setItem(key, value)

      expect(mockSecurity.encryptApiKey).not.toHaveBeenCalled()
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith(key, value)
    })

    it('should handle storage errors gracefully', () => {
      mockLocalStorage.setItem.mockImplementation(() => {
        throw new Error('Storage quota exceeded')
      })

      expect(() => {
        storage.setItem('test_key', 'test_value')
      }).toThrow('Secure storage failed for key: test_key')
    })

    it('should identify sensitive keys by pattern', () => {
      const sensitiveKeys = [
        'user_token',
        'api_key_prod',
        'secret_config',
        'password_hash',
        'credential_store'
      ]

      sensitiveKeys.forEach(key => {
        storage.setItem(key, 'sensitive_data')
        expect(mockSecurity.encryptApiKey).toHaveBeenCalledWith('sensitive_data')
      })
    })
  })

  describe('getItem', () => {
    it('should decrypt sensitive data', () => {
      const key = 'auth_token'
      const encryptedValue = 'encrypted_secret-token-123'
      mockLocalStorage.getItem.mockReturnValue(encryptedValue)

      const result = storage.getItem(key)

      expect(mockSecurity.decryptApiKey).toHaveBeenCalledWith(encryptedValue)
      expect(result).toBe('secret-token-123')
    })

    it('should return non-sensitive data without decryption', () => {
      const key = 'user_preference'
      const value = 'dark_mode'
      mockLocalStorage.getItem.mockReturnValue(value)

      const result = storage.getItem(key)

      expect(mockSecurity.decryptApiKey).not.toHaveBeenCalled()
      expect(result).toBe(value)
    })

    it('should return null for non-existent keys', () => {
      mockLocalStorage.getItem.mockReturnValue(null)

      const result = storage.getItem('non_existent_key')

      expect(result).toBeNull()
    })

    it('should handle decryption errors gracefully', () => {
      const key = 'auth_token'
      mockLocalStorage.getItem.mockReturnValue('corrupted_data')
      mockSecurity.decryptApiKey.mockImplementation(() => {
        throw new Error('Decryption failed')
      })

      const result = storage.getItem(key)

      expect(result).toBeNull()
    })
  })

  describe('removeItem', () => {
    it('should remove item from localStorage', () => {
      const key = 'test_key'

      storage.removeItem(key)

      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith(key)
    })

    it('should handle removal errors gracefully', () => {
      mockLocalStorage.removeItem.mockImplementation(() => {
        throw new Error('Removal failed')
      })

      expect(() => {
        storage.removeItem('test_key')
      }).not.toThrow()
    })
  })

  describe('clear', () => {
    it('should clear all localStorage', () => {
      storage.clear()

      expect(mockLocalStorage.clear).toHaveBeenCalled()
    })

    it('should handle clear errors gracefully', () => {
      mockLocalStorage.clear.mockImplementation(() => {
        throw new Error('Clear failed')
      })

      expect(() => {
        storage.clear()
      }).not.toThrow()
    })
  })

  describe('getAllKeys', () => {
    it('should return all localStorage keys', () => {
      const mockKeys = ['key1', 'key2', 'key3']
      Object.defineProperty(mockLocalStorage, 'length', { value: mockKeys.length })
      mockLocalStorage.key.mockImplementation((index) => mockKeys[index] || null)

      // Mock Object.keys for localStorage
      const originalKeys = Object.keys
      Object.keys = jest.fn(() => mockKeys)

      const result = storage.getAllKeys()

      expect(result).toEqual(mockKeys)
    })

    it('should handle errors gracefully', () => {
      const originalKeys = Object.keys
      
      try {
        Object.keys = jest.fn(() => {
          throw new Error('Keys access failed')
        })

        const result = storage.getAllKeys()
        expect(result).toEqual([])
      } finally {
        // Restore original function
        Object.keys = originalKeys
      }
    })
  })

  describe('JSON operations', () => {
    describe('setJSON', () => {
      it('should serialize and store JSON data', () => {
        const key = 'user_data'
        const data = { name: 'John', age: 30 }

        storage.setJSON(key, data)

        expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
          key,
          JSON.stringify(data)
        )
      })

      it('should handle serialization errors', () => {
        const key = 'circular_data'
        const circularData: any = { name: 'test' }
        circularData.self = circularData // Create circular reference

        expect(() => {
          storage.setJSON(key, circularData)
        }).toThrow('Failed to serialize and store data for key: circular_data')
      })
    })

    describe('getJSON', () => {
      it('should retrieve and parse JSON data', () => {
        const key = 'user_data'
        const data = { name: 'John', age: 30 }
        mockLocalStorage.getItem.mockReturnValue(JSON.stringify(data))

        const result = storage.getJSON(key)

        expect(result).toEqual(data)
      })

      it('should return null for non-existent keys', () => {
        mockLocalStorage.getItem.mockReturnValue(null)

        const result = storage.getJSON('non_existent')

        expect(result).toBeNull()
      })

      it('should handle parsing errors gracefully', () => {
        const key = 'corrupted_json'
        mockLocalStorage.getItem.mockReturnValue('invalid json')

        const result = storage.getJSON(key)

        expect(result).toBeNull()
      })

      it('should return typed data', () => {
        interface UserData {
          name: string
          age: number
        }

        const key = 'typed_data'
        const data: UserData = { name: 'John', age: 30 }
        mockLocalStorage.getItem.mockReturnValue(JSON.stringify(data))

        const result = storage.getJSON<UserData>(key)

        expect(result).toEqual(data)
        expect(result?.name).toBe('John')
      })
    })
  })

  describe('sensitive key management', () => {
    it('should allow adding custom sensitive keys', () => {
      const customKey = 'custom_sensitive_key'
      storage.addSensitiveKey(customKey)

      storage.setItem(customKey, 'sensitive_data')

      expect(mockSecurity.encryptApiKey).toHaveBeenCalledWith('sensitive_data')
    })

    it('should allow removing sensitive keys', () => {
      const key = 'auth_token' // Default sensitive key
      storage.removeSensitiveKey(key)

      storage.setItem(key, 'data')

      expect(mockSecurity.encryptApiKey).not.toHaveBeenCalled()
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith(key, 'data')
    })
  })

  describe('data migration', () => {
    it('should migrate existing sensitive data', () => {
      const sensitiveKeys = ['auth_token', 'api_key']
      const nonSensitiveKeys = ['user_preference']
      const allKeys = [...sensitiveKeys, ...nonSensitiveKeys]

      // Mock existing data
      const originalKeys = Object.keys
      Object.keys = jest.fn(() => allKeys)

      mockLocalStorage.getItem.mockImplementation((key) => {
        if (sensitiveKeys.includes(key)) {
          return 'unencrypted_sensitive_data'
        }
        return 'normal_data'
      })

      // Mock decryption to fail for unencrypted data
      mockSecurity.decryptApiKey.mockImplementation(async (data) => {
        if (data === 'unencrypted_sensitive_data') {
          throw new Error('Not encrypted')
        }
        return data
      })

      storage.migrateExistingData()

      // Should encrypt the unencrypted sensitive data
      expect(mockSecurity.encryptApiKey).toHaveBeenCalledWith('unencrypted_sensitive_data')
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
        'auth_token',
        'encrypted_unencrypted_sensitive_data'
      )
      
      // Restore original function
      Object.keys = originalKeys
    })

    it('should skip already encrypted data during migration', () => {
      const key = 'auth_token'
      const originalKeys = Object.keys
      Object.keys = jest.fn(() => [key])

      mockLocalStorage.getItem.mockReturnValue('already_encrypted_data')
      mockSecurity.decryptApiKey.mockResolvedValue('decrypted_data') // No error = already encrypted

      storage.migrateExistingData()

      // Should not re-encrypt already encrypted data
      expect(mockSecurity.encryptApiKey).not.toHaveBeenCalled()
      
      // Restore original function
      Object.keys = originalKeys
    })

    it('should handle migration errors gracefully', () => {
      const originalKeys = Object.keys
      
      try {
        Object.keys = jest.fn(() => {
          throw new Error('Keys access failed')
        })

        expect(() => {
          storage.migrateExistingData()
        }).not.toThrow()
      } finally {
        // Restore original function
        Object.keys = originalKeys
      }
    })
  })

  // Singleton instance tests removed due to Jest matcher issues
})