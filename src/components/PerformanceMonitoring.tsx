'use client'

import React from 'react'
import { performanceOptimizationService } from '../services/performanceOptimization'

// Performance monitoring component
export function PerformanceMonitoring() {
  React.useEffect(() => {
    // Initialize performance monitoring
    if (typeof window !== 'undefined') {
      performanceOptimizationService.initializePerformanceMonitoring()
      
      // Register service worker
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('/sw.js')
          .then((registration) => {
            console.log('Service Worker registered:', registration)
          })
          .catch((error) => {
            console.error('Service Worker registration failed:', error)
          })
      }
      
      // Enable critical resource hints
      performanceOptimizationService.enableResourceHints()
    }
  }, [])
  
  return null
}