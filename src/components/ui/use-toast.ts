"use client"

import * as React from "react"

import { useState, useCallback } from "react"

interface Toast {
  id: string
  type: "success" | "error" | "warning" | "info"
  title: string
  description: string
  variant?: "default" | "destructive"
  action?: React.ReactElement
}

// Allow callers to omit `type` (defaults to "info")
interface ToastOptions {
  type?: Toast["type"]
  title: Toast["title"]
  description: Toast["description"]
  variant?: Toast["variant"]
  action?: Toast["action"]
}

export function useToast() {
  const [toasts, setToasts] = useState<Toast[]>([])

  const toast = useCallback((options: ToastOptions) => {
    const id = Math.random().toString(36).substring(2, 11)
    const newToast: Toast = { id, type: options.type ?? "info", title: options.title, description: options.description, variant: options.variant, action: options.action }

    setToasts((prev) => [...prev, newToast])

    // Auto remove after 5 seconds
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id))
    }, 5000)

    return id
  }, [])

  const showSuccess = useCallback(
    (title: string, description: string) => {
      return toast({ type: "success", title, description })
    },
    [toast],
  )

  const showError = useCallback(
    (title: string, description: string) => {
      return toast({ type: "error", title, description, variant: "destructive" })
    },
    [toast],
  )

  const showWarning = useCallback(
    (title: string, description: string) => {
      return toast({ type: "warning", title, description })
    },
    [toast],
  )

  const showInfo = useCallback(
    (title: string, description: string) => {
      return toast({ type: "info", title, description })
    },
    [toast],
  )

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  return {
    toast,
    showSuccess,
    showError,
    showWarning,
    showInfo,
    removeToast,
    toasts,
  }
}

// Create a global toast instance for use outside React components
let globalToastInstance: ReturnType<typeof useToast> | null = null

export const setGlobalToastInstance = (instance: ReturnType<typeof useToast>) => {
  globalToastInstance = instance
}

export const toast = (options: ToastOptions) => {
  if (globalToastInstance) {
    return globalToastInstance.toast(options)
  }
  console.warn('Toast instance not initialized. Call setGlobalToastInstance first.')
  return ''
}
