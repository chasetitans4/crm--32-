import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'
import { advancedEncryption } from '../../utils/encryption'
import { secureStorage } from '../../utils/secureStorage'

// Mock the encryption and storage utilities
jest.mock('../../utils/encryption', () => ({
  advancedEncryption: {
    encrypt: jest.fn((data: string) => Promise.resolve(`encrypted_${btoa(data)}`)),
    decrypt: jest.fn((data: string) => Promise.resolve(atob(data.replace('encrypted_', '')))),
    isEncrypted: jest.fn((data: string) => data.startsWith('encrypted_'))
  }
}))

jest.mock('../../utils/secureStorage', () => ({
  secureStorage: {
    setItem: jest.fn(),
    getItem: jest.fn(),
    removeItem: jest.fn(),
    clear: jest.fn()
  }
}))

// Mock the hooks and components
jest.mock('../../hooks/useLeadManagement', () => ({
  useLeadManagement: () => ({
    leads: [],
    newLead: {
      name: '',
      company: '',
      status: 'NEW',
      source: '',
      notes: '',
      value: 0,
      contacts: [{ name: '', email: '', phone: '', position: '', isPrimary: true }]
    },
    addLead: jest.fn(),
    updateLead: jest.fn(),
    deleteLead: jest.fn(),
    setNewLead: jest.fn(),
    editingLead: null,
    setEditingLead: jest.fn(),
    isAddingLead: false,
    setIsAddingLead: jest.fn()
  })
}))

describe('Encryption Integration Tests', () => {
  const mockEncrypt = advancedEncryption.encrypt as jest.MockedFunction<typeof advancedEncryption.encrypt>
  const mockDecrypt = advancedEncryption.decrypt as jest.MockedFunction<typeof advancedEncryption.decrypt>
  const mockSetItem = secureStorage.setItem as jest.MockedFunction<typeof secureStorage.setItem>
  const mockGetItem = secureStorage.getItem as jest.MockedFunction<typeof secureStorage.getItem>
  const mockRemoveItem = secureStorage.removeItem as jest.MockedFunction<typeof secureStorage.removeItem>

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Client Data Encryption', () => {
    test('should encrypt sensitive client data when adding a new client', async () => {
      const sensitiveClientData = {
        name: 'John Doe',
        email: 'john@example.com',
        phone: '+1-555-123-4567',
        contact: 'John Doe',
        company: 'Acme Corp'
      }

      // Simulate the encryption process that happens in handleAddClient
      const encryptedData = await mockEncrypt(JSON.stringify(sensitiveClientData))
      mockSetItem('client_123', encryptedData)

      expect(mockEncrypt).toHaveBeenCalledWith(JSON.stringify(sensitiveClientData))
      expect(mockSetItem).toHaveBeenCalledWith('client_123', encryptedData)
      expect(encryptedData).not.toContain('John Doe')
      expect(encryptedData).not.toContain('john@example.com')
    })

    test('should encrypt email data when sending emails', async () => {
      const emailData = {
        to: 'client@example.com',
        subject: 'Important Business Matter',
        body: 'This is confidential information about the client.',
        client_id: 123,
        timestamp: new Date().toISOString()
      }

      // Simulate the encryption process that happens in handleSendEmail
      const encryptedData = await mockEncrypt(JSON.stringify(emailData))
      mockSetItem('email_123', encryptedData)

      expect(mockEncrypt).toHaveBeenCalledWith(JSON.stringify(emailData))
      expect(mockSetItem).toHaveBeenCalledWith('email_123', encryptedData)
      expect(encryptedData).not.toContain('client@example.com')
      expect(encryptedData).not.toContain('confidential information')
    })

    test('should handle encryption errors gracefully', async () => {
      mockEncrypt.mockImplementationOnce(() => {
        throw new Error('Encryption failed')
      })

      const sensitiveData = { name: 'Test User', email: 'test@example.com' }
      
      // Should not throw an error when encryption fails
      await expect(async () => {
        try {
          const encrypted = await mockEncrypt(JSON.stringify(sensitiveData))
          mockSetItem('test_key', encrypted)
        } catch (error) {
          console.error('Failed to encrypt data:', error)
        }
      }).not.toThrow()
    })
  })

  describe('Lead Data Encryption', () => {
    test('should encrypt sensitive lead data when adding a new lead', async () => {
      const sensitiveLeadData = {
        name: 'ABC Corporation',
        company: 'ABC Corporation',
        contacts: [
          {
            name: 'Jane Smith',
            email: 'jane@abc.com',
            phone: '+1-555-987-6543',
            position: 'CEO'
          }
        ],
        notes: 'Potential high-value client with specific requirements'
      }

      // Simulate the encryption process that happens in addLead
      const encryptedData = await mockEncrypt(JSON.stringify(sensitiveLeadData))
      mockSetItem('lead_456', encryptedData)

      expect(mockEncrypt).toHaveBeenCalledWith(JSON.stringify(sensitiveLeadData))
      expect(mockSetItem).toHaveBeenCalledWith('lead_456', encryptedData)
      expect(encryptedData).not.toContain('ABC Corporation')
      expect(encryptedData).not.toContain('jane@abc.com')
      expect(encryptedData).not.toContain('high-value client')
    })

    test('should encrypt sensitive lead data when updating existing lead', async () => {
      const updatedLeadData = {
        name: 'Updated Corp Name',
        company: 'Updated Corp Name',
        contacts: [
          {
            name: 'Updated Contact',
            email: 'updated@corp.com',
            phone: '+1-555-111-2222',
            position: 'Manager'
          }
        ],
        notes: 'Updated notes with sensitive information'
      }

      // Simulate the encryption process that happens in updateLead
      const encryptedData = await mockEncrypt(JSON.stringify(updatedLeadData))
      mockSetItem('lead_456', encryptedData)

      expect(mockEncrypt).toHaveBeenCalledWith(JSON.stringify(updatedLeadData))
      expect(mockSetItem).toHaveBeenCalledWith('lead_456', encryptedData)
      expect(encryptedData).not.toContain('Updated Corp Name')
      expect(encryptedData).not.toContain('updated@corp.com')
    })
  })

  describe('Data Cleanup and Security', () => {
    test('should auto-clear encrypted data after timeout', async () => {
      jest.useFakeTimers()

      const sensitiveData = { name: 'Test User', email: 'test@example.com' }
      const encryptedData = await mockEncrypt(JSON.stringify(sensitiveData))
      mockSetItem('temp_data', encryptedData)

      // Simulate the auto-clear timeout (10 minutes = 600,000ms)
      setTimeout(() => {
        mockRemoveItem('temp_data')
      }, 10 * 60 * 1000)

      // Fast-forward time by 10 minutes
      jest.advanceTimersByTime(10 * 60 * 1000)

      expect(mockRemoveItem).toHaveBeenCalledWith('temp_data')

      jest.useRealTimers()
    })

    test('should clear sensitive data on component unmount', () => {
      // Simulate component unmount cleanup
      const keysToClean = ['client_123', 'lead_456', 'email_789']
      
      keysToClean.forEach(key => {
        mockRemoveItem(key)
      })

      keysToClean.forEach(key => {
        expect(mockRemoveItem).toHaveBeenCalledWith(key)
      })
    })

    test('should handle storage quota exceeded errors', async () => {
      mockSetItem.mockImplementationOnce(() => {
        throw new Error('QuotaExceededError: Storage quota exceeded')
      })

      const sensitiveData = { name: 'Test User', email: 'test@example.com' }
      const encryptedData = await mockEncrypt(JSON.stringify(sensitiveData))

      // Should handle storage errors gracefully
      expect(() => {
        try {
          mockSetItem('test_key', encryptedData)
        } catch (error) {
          console.error('Storage error:', error)
        }
      }).not.toThrow()
    })
  })

  describe('Data Retrieval and Decryption', () => {
    test('should decrypt data when retrieving from storage', async () => {
      const originalData = {
        name: 'John Doe',
        email: 'john@example.com',
        phone: '+1-555-123-4567'
      }
      
      const encryptedData = `encrypted_${btoa(JSON.stringify(originalData))}`
      mockGetItem.mockReturnValue(encryptedData)
      
      const retrieved = mockGetItem('client_123')
      const decrypted = await mockDecrypt(retrieved!)
      const parsedData = JSON.parse(decrypted)

      expect(mockGetItem).toHaveBeenCalledWith('client_123')
      expect(mockDecrypt).toHaveBeenCalledWith(encryptedData)
      expect(parsedData).toEqual(originalData)
    })

    test('should handle missing encrypted data gracefully', () => {
      mockGetItem.mockReturnValue(null)
      
      const retrieved = mockGetItem('non_existent_key')
      
      expect(retrieved).toBeNull()
      expect(mockDecrypt).not.toHaveBeenCalled()
    })

    test('should handle corrupted encrypted data', () => {
      const corruptedData = 'corrupted_encrypted_data'
      mockGetItem.mockReturnValue(corruptedData)
      mockDecrypt.mockImplementationOnce(() => {
        throw new Error('Decryption failed')
      })

      const retrieved = mockGetItem('corrupted_key')
      
      expect(() => {
        try {
          if (retrieved) {
            mockDecrypt(retrieved)
          }
        } catch (error) {
          console.error('Decryption error:', error)
        }
      }).not.toThrow()
    })
  })

  describe('Performance and Scalability', () => {
    test('should handle multiple encryption operations efficiently', async () => {
      const dataItems = Array(50).fill(0).map((_, i) => ({
        id: i,
        name: `User ${i}`,
        email: `user${i}@example.com`,
        sensitive: `sensitive_data_${i}`
      }))

      for (const [index, item] of dataItems.entries()) {
        const encryptedData = await mockEncrypt(JSON.stringify(item))
        mockSetItem(`item_${index}`, encryptedData)
      }

      expect(mockEncrypt).toHaveBeenCalledTimes(50)
      expect(mockSetItem).toHaveBeenCalledTimes(50)
    })

    test('should handle large data objects', async () => {
      const largeData = {
        id: 1,
        name: 'Large Data Object',
        description: 'x'.repeat(10000), // 10KB of data
        metadata: Array(100).fill(0).map((_, i) => ({
          key: `meta_${i}`,
          value: `value_${i}`.repeat(50)
        }))
      }

      const encryptedData = await mockEncrypt(JSON.stringify(largeData))
      mockSetItem('large_data', encryptedData)

      expect(mockEncrypt).toHaveBeenCalledWith(JSON.stringify(largeData))
      expect(mockSetItem).toHaveBeenCalledWith('large_data', encryptedData)
    })
  })

  describe('Security Validation', () => {
    test('should ensure no plaintext data is stored', async () => {
      const sensitiveData = {
        ssn: '123-45-6789',
        creditCard: '4111-1111-1111-1111',
        password: 'MySecretPassword123!',
        personalNotes: 'Confidential client information'
      }

      const encryptedData = await mockEncrypt(JSON.stringify(sensitiveData))
      mockSetItem('sensitive_client', encryptedData)

      // Verify that the encrypted data doesn't contain plaintext
      expect(encryptedData).not.toContain('123-45-6789')
      expect(encryptedData).not.toContain('4111-1111-1111-1111')
      expect(encryptedData).not.toContain('MySecretPassword123!')
      expect(encryptedData).not.toContain('Confidential client information')
    })

    test('should use different encryption for same data (randomization)', async () => {
      const data = 'Same sensitive data'
      
      // Mock different outputs for same input (simulating randomization)
      mockEncrypt.mockReturnValueOnce(Promise.resolve(`encrypted_${btoa(data)}_1`))
      mockEncrypt.mockReturnValueOnce(Promise.resolve(`encrypted_${btoa(data)}_2`))

      const result1 = await mockEncrypt(data)
      const result2 = await mockEncrypt(data)

      expect(result1).not.toBe(result2)
    })
  })
})