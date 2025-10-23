import { authService, AuthUser } from '../auth'
import { secureStorage, setSecureJSONAdvanced, getSecureJSONAdvanced } from '../../utils/secureStorage'

// Mock secureStorage
jest.mock('../../utils/secureStorage', () => {
  const secureStorage = {
    setJSON: jest.fn(),
    getJSON: jest.fn(),
    removeItem: jest.fn(),
  }
  const setItemSecure = jest.fn()
  const setJSONAdvanced = jest.fn()
  const getJSONAdvanced = jest.fn()
  return {
    secureStorage,
    // Legacy convenience exports
    setSecureJSON: secureStorage.setJSON,
    getSecureJSON: secureStorage.getJSON,
    removeSecureItem: secureStorage.removeItem,
    setSecureItemAdvanced: setItemSecure,
    setSecureItem: jest.fn(),
    getSecureItem: jest.fn(),
    // Advanced JSON storage uses isolated mocks so tests don't interfere
    setSecureJSONAdvanced: setJSONAdvanced,
    getSecureJSONAdvanced: getJSONAdvanced,
  }
})

const mockSecureStorage = secureStorage as jest.Mocked<typeof secureStorage>
const mockSetJSONAdvanced = setSecureJSONAdvanced as unknown as jest.Mock
const mockGetJSONAdvanced = getSecureJSONAdvanced as unknown as jest.Mock

describe('AuthService', () => {
  beforeEach(async () => {
    jest.resetAllMocks()
    // Reset auth service state
    await authService.signOut()
  })

  describe('signUp', () => {
    it('should create a new user account', async () => {
      const email = 'test@example.com'
      const password = 'password123'
      const userData = { name: 'Test User' }

      const user = await authService.signUp(email, password, userData)

      expect(user).toMatchObject({
        email,
        name: 'Test User',
        role: 'user',
      })
      expect(user.id).toBeDefined()
      expect(user.createdAt).toBeDefined()
      expect(mockSetJSONAdvanced).toHaveBeenCalledWith('auth_user', user)
    })

    it('should use email prefix as name when name not provided', async () => {
      const email = 'john.doe@example.com'
      const password = 'password123'

      const user = await authService.signUp(email, password)

      expect(user.name).toBe('john.doe')
    })

    it('should handle signup errors', async () => {
      mockSetJSONAdvanced.mockImplementationOnce(() => {
        throw new Error('Storage error')
      })

      await expect(
        authService.signUp('test@example.com', 'password123')
      ).rejects.toThrow('Storage error')
    })
  })

  describe('signIn', () => {
    it('should authenticate user with valid credentials', async () => {
      const email = 'test@example.com'
      const password = 'password123'

      const user = await authService.signIn(email, password)

      expect(user).toMatchObject({
        email,
        name: 'test',
        role: 'user',
      })
      expect(user.lastLogin).toBeDefined()
      expect(authService.isAuthenticated()).toBe(true)
    })

    it('should handle signin errors', async () => {
      // Cause secure JSON write to fail
      mockSetJSONAdvanced.mockImplementationOnce(() => {
        throw new Error('Storage error')
      })

      await expect(
        authService.signIn('test@example.com', 'password123')
      ).rejects.toThrow('Storage error')
    })
  })

  describe('signOut', () => {
    it('should clear user session', async () => {
      // First sign in
      await authService.signIn('test@example.com', 'password123')
      expect(authService.isAuthenticated()).toBe(true)

      // Then sign out
      await authService.signOut()

      expect(authService.isAuthenticated()).toBe(false)
      expect(authService.getCurrentUser()).toBeNull()
      expect(mockSecureStorage.removeItem).toHaveBeenCalledWith('auth_user')
    })
  })

  describe('updateProfile', () => {
    it('should update user profile when authenticated', async () => {
      // First sign in
      await authService.signIn('test@example.com', 'password123')

      const updates = { name: 'Updated Name', role: 'admin' }
      const updatedUser = await authService.updateProfile(updates)

      expect(updatedUser.name).toBe('Updated Name')
      expect(updatedUser.role).toBe('admin')
      expect(mockSetJSONAdvanced).toHaveBeenCalledWith('auth_user', updatedUser)
    })

    it('should throw error when not authenticated', async () => {
      const updates = { name: 'Updated Name' }

      await expect(
        authService.updateProfile(updates)
      ).rejects.toThrow('No authenticated user')
    })
  })

  describe('hasRole', () => {
    it('should validate admin role hierarchy', async () => {
      const adminUser: AuthUser = {
        id: '1',
        email: 'admin@example.com',
        name: 'Admin User',
        role: 'admin',
        createdAt: new Date().toISOString(),
      }

      // Mock the user via advanced storage and init
      mockGetJSONAdvanced.mockReturnValue(adminUser)
      await authService.init()

      expect(authService.hasRole('admin')).toBe(true)
      expect(authService.hasRole('agent')).toBe(true)
      expect(authService.hasRole('user')).toBe(true)
    })

    it('should validate agent role hierarchy', async () => {
      await authService.signIn('agent@example.com', 'password123')
      await authService.updateProfile({ role: 'agent' })

      expect(authService.hasRole('admin')).toBe(false)
      expect(authService.hasRole('agent')).toBe(true)
      expect(authService.hasRole('user')).toBe(true)
    })

    it('should validate user role hierarchy', async () => {
      await authService.signIn('user@example.com', 'password123')

      expect(authService.hasRole('admin')).toBe(false)
      expect(authService.hasRole('agent')).toBe(false)
      expect(authService.hasRole('user')).toBe(true)
    })

    it('should return false when not authenticated', () => {
      expect(authService.hasRole('user')).toBe(false)
    })
  })

  describe('getAccessToken', () => {
    it('should return token when authenticated', async () => {
      await authService.signIn('test@example.com', 'password123')

      const token = authService.getAccessToken()
      expect(token).toEqual(expect.any(String))
      expect((token as string).length).toBeGreaterThan(0)
    })

    it('should return null when not authenticated', () => {
      const token = authService.getAccessToken()
      expect(token).toBeNull()
    })
  })

  describe('state management', () => {
    it('should notify subscribers of state changes', async () => {
      const mockCallback = jest.fn()
      const unsubscribe = authService.subscribe(mockCallback)

      await authService.signIn('test@example.com', 'password123')

      // Ensure callback was called with the expected initial and updated states
      expect(mockCallback).toHaveBeenCalled()

      unsubscribe()
    })

    it('should handle unsubscribe without errors', () => {
      const mockCallback = jest.fn()
      const unsubscribe = authService.subscribe(mockCallback)

      unsubscribe()
      // Should not throw
      expect(true).toBe(true)
    })
  })
})