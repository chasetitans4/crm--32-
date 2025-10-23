// Utility functions and constants for WebDesignQuote component
import { QuestionnaireState } from './types'

// Pricing constants
export const PRICING_CONSTANTS = {
  BASE_COST: 2500,
  FEATURE_MULTIPLIERS: {
    'E-commerce': 1.8,
    'Custom CMS': 1.5,
    'User Authentication': 1.3,
    'Payment Integration': 1.6,
    'API Integration': 1.4,
    'Multi-language': 1.3,
    'Advanced Analytics': 1.2,
    'Live Chat': 1.1,
    'Blog/News': 1.2,
    'SEO Optimization': 1.1,
  },
  INDUSTRY_MULTIPLIERS: {
    'Healthcare': 1.4,
    'Finance': 1.5,
    'Legal': 1.3,
    'Education': 1.1,
    'Non-profit': 0.9,
    'Technology': 1.2,
    'Retail': 1.3,
    'Real Estate': 1.2,
    'Restaurant': 1.1,
    'Other': 1.0,
  },
  TIMELINE_MULTIPLIERS: {
    'Rush (2-4 weeks)': 1.5,
    'Standard (4-8 weeks)': 1.0,
    'Extended (8-12 weeks)': 0.9,
    'Flexible (12+ weeks)': 0.8,
  },
}

// Question navigation utilities
export const calculateProgress = (currentStep: number, totalSteps: number): number => {
  return Math.round((currentStep / totalSteps) * 100)
}

export const isStepComplete = (step: number, answers: Record<string, any>): boolean => {
  switch (step) {
    case 0:
      return answers.businessGoals && answers.businessGoals.length > 0
    case 1:
      return answers.targetAudience && answers.targetAudience.trim().length > 0
    case 2:
      return answers.industry && answers.industry.trim().length > 0
    case 3:
      return answers.websiteType && answers.websiteType.trim().length > 0
    case 4:
      return answers.features && answers.features.length > 0
    case 5:
      return answers.budget && answers.budget.trim().length > 0
    case 6:
      return answers.timeline && answers.timeline.trim().length > 0
    default:
      return false
  }
}

// Cost calculation utilities
export const calculateEstimatedCost = (answers: Record<string, any>): number => {
  let baseCost = PRICING_CONSTANTS.BASE_COST
  
  // Apply feature multipliers
  if (answers.features && Array.isArray(answers.features)) {
    answers.features.forEach((feature: string) => {
      const multiplier = PRICING_CONSTANTS.FEATURE_MULTIPLIERS[feature as keyof typeof PRICING_CONSTANTS.FEATURE_MULTIPLIERS] || 1
      baseCost *= multiplier
    })
  }
  
  // Apply industry multiplier
  if (answers.industry) {
    const multiplier = PRICING_CONSTANTS.INDUSTRY_MULTIPLIERS[answers.industry as keyof typeof PRICING_CONSTANTS.INDUSTRY_MULTIPLIERS] || 1
    baseCost *= multiplier
  }
  
  // Apply timeline multiplier
  if (answers.timeline) {
    const multiplier = PRICING_CONSTANTS.TIMELINE_MULTIPLIERS[answers.timeline as keyof typeof PRICING_CONSTANTS.TIMELINE_MULTIPLIERS] || 1
    baseCost *= multiplier
  }
  
  return Math.round(baseCost)
}

// Session management utilities
export const saveSessionToLocalStorage = (state: QuestionnaireState): string | null => {
  try {
    const sessionId = `quote-session-${Date.now()}`
    localStorage.setItem(sessionId, JSON.stringify(state))
    return sessionId
  } catch (error) {
    console.error('Failed to save session:', error)
    return null
  }
}

export const loadSessionFromLocalStorage = (sessionId: string): QuestionnaireState | null => {
  try {
    const savedState = localStorage.getItem(sessionId)
    return savedState ? JSON.parse(savedState) : null
  } catch (error) {
    console.error('Failed to load session:', error)
    return null
  }
}

export const clearSessionFromLocalStorage = (sessionId: string): void => {
  try {
    localStorage.removeItem(sessionId)
  } catch (error) {
    console.error('Failed to clear session:', error)
  }
}

// Form validation utilities
export const validateStep = (step: number, answers: Record<string, any>): string[] => {
  const errors: string[] = []
  
  switch (step) {
    case 0:
      if (!answers.businessGoals || answers.businessGoals.length === 0) {
        errors.push('Please select at least one business goal')
      }
      break
    case 1:
      if (!answers.targetAudience || answers.targetAudience.trim().length === 0) {
        errors.push('Please describe your target audience')
      }
      break
    case 2:
      if (!answers.industry || answers.industry.trim().length === 0) {
        errors.push('Please select your industry')
      }
      break
    case 3:
      if (!answers.websiteType || answers.websiteType.trim().length === 0) {
        errors.push('Please select a website type')
      }
      break
    case 4:
      if (!answers.features || answers.features.length === 0) {
        errors.push('Please select at least one feature')
      }
      break
    case 5:
      if (!answers.budget || answers.budget.trim().length === 0) {
        errors.push('Please select a budget range')
      }
      break
    case 6:
      if (!answers.timeline || answers.timeline.trim().length === 0) {
        errors.push('Please select a timeline')
      }
      break
  }
  
  return errors
}

// Format utilities
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

export const formatTimeline = (timeline: string): string => {
  const timelineMap: Record<string, string> = {
    'Rush (2-4 weeks)': '2-4 weeks',
    'Standard (4-8 weeks)': '4-8 weeks',
    'Extended (8-12 weeks)': '8-12 weeks',
    'Flexible (12+ weeks)': '12+ weeks',
  }
  
  return timelineMap[timeline] || timeline
}