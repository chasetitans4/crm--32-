"use client"

import { useState, useCallback } from "react"
import { useAuth } from "../context/AuthContext"
import { validatePasswordSecure } from "../utils/validation"

export interface SecurityFeatures {
  detectSuspiciousActivity: (activity: any) => boolean
  validateSecureConnection: () => boolean
  checkPasswordStrength: (password: string) => { score: number; feedback: string[] }
  detectBruteForce: (attempts: number) => boolean
  validateTwoFactor: (code: string) => Promise<boolean>
}

export const useSecureAuth = () => {
  const auth = useAuth()
  const [securityWarnings, setSecurityWarnings] = useState<string[]>([])
  const [loginAttempts, setLoginAttempts] = useState(0)
  const [isLocked, setIsLocked] = useState(false)
  const [lockoutTime, setLockoutTime] = useState<Date | null>(null)
  const [csrfToken, setCsrfToken] = useState<string | null>(null)

  const detectSuspiciousActivity = useCallback((activity: any) => {
    // Basic suspicious activity detection
    const suspiciousPatterns = [/script/i, /javascript/i, /eval/i, /alert/i, /document\./i, /window\./i]

    const activityString = JSON.stringify(activity)
    return suspiciousPatterns.some((pattern) => pattern.test(activityString))
  }, [])

  const validateSecureConnection = useCallback(() => {
    return window.location.protocol === "https:" || window.location.hostname === "localhost"
  }, [])

  const checkPasswordStrength = useCallback((password: string) => {
    const result = validatePasswordSecure(password)
    
    if (!result.isValid) {
      return { score: 0, feedback: result.error ? [result.error] : ['Invalid password'] }
    }
    
    // Calculate score based on password strength
    let score = 0
    const feedback: string[] = []
    
    if (password.length >= 8) score += 1
    else feedback.push("Password should be at least 8 characters long")
    if (/[a-z]/.test(password)) score += 1
    else feedback.push("Password should contain lowercase letters")
    if (/[A-Z]/.test(password)) score += 1
    else feedback.push("Password should contain uppercase letters")
    if (/\d/.test(password)) score += 1
    else feedback.push("Password should contain numbers")
    if (/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password)) score += 1
    else feedback.push("Password should contain special characters")
    
    return { score, feedback }
  }, [])

  const detectBruteForce = useCallback((attempts: number) => {
    return attempts > 5
  }, [])

  const validateTwoFactor = useCallback(async (code: string) => {
    // Mock 2FA validation - in real app, this would call your 2FA service
    return code.length === 6 && /^\d{6}$/.test(code)
  }, [])

  const addSecurityWarning = useCallback((warning: string) => {
    setSecurityWarnings((prev) => [...prev, warning])
  }, [])

  const clearSecurityWarnings = useCallback(() => {
    setSecurityWarnings([])
  }, [])

  const incrementLoginAttempts = useCallback(() => {
    setLoginAttempts((prev) => prev + 1)
  }, [])

  const resetLoginAttempts = useCallback(() => {
    setLoginAttempts(0)
  }, [])

  const lockAccount = useCallback((duration: number = 300000) => { // 5 minutes default
    setIsLocked(true)
    const unlockTime = new Date(Date.now() + duration)
    setLockoutTime(unlockTime)
    setTimeout(() => {
      setIsLocked(false)
      setLockoutTime(null)
    }, duration)
  }, [])

  const generateCSRFToken = useCallback(() => {
    const token = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
    setCsrfToken(token)
    return token
  }, [])

  const verifyCredentials = useCallback(async (email: string, password: string) => {
    // In a real app, this would make an API call to verify credentials
    // For now, we'll simulate credential verification
    try {
      // Basic validation
      if (!email || !password) {
        return false
      }

      // Check if account is locked
      if (isLocked) {
        throw new Error('Account is locked')
      }

      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 500))

      // For demo purposes, accept any email/password combination
      // In real app, this would verify against your authentication service
      return true
    } catch (error) {
      incrementLoginAttempts()
      
      // Lock account after too many attempts
      if (loginAttempts >= 4) {
        lockAccount()
      }
      
      return false
    }
  }, [isLocked, incrementLoginAttempts, loginAttempts, lockAccount])

  return {
    ...auth,
    securityWarnings,
    loginAttempts,
    isLocked,
    lockoutTime,
    csrfToken,
    detectSuspiciousActivity,
    validateSecureConnection,
    checkPasswordStrength,
    detectBruteForce,
    validateTwoFactor,
    verifyCredentials,
    addSecurityWarning,
    clearSecurityWarnings,
    incrementLoginAttempts,
    resetLoginAttempts,
    lockAccount,
    generateCSRFToken,
  }
}
