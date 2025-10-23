"use client"

import React, { useEffect, useRef } from "react"
import { X } from "lucide-react"
import { cn } from "@/lib/utils"

export interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title?: string
  description?: string
  children: React.ReactNode
  size?: "sm" | "md" | "lg" | "xl" | "full"
  showCloseButton?: boolean
  closeOnOverlayClick?: boolean
  closeOnEscape?: boolean
  preventClose?: boolean
  className?: string
  overlayClassName?: string
  contentClassName?: string
  headerClassName?: string
  footerClassName?: string
  footer?: React.ReactNode
  onConfirmClose?: () => Promise<boolean> | boolean
}

const sizeClasses = {
  sm: "max-w-md",
  md: "max-w-lg",
  lg: "max-w-2xl",
  xl: "max-w-4xl",
  full: "max-w-full mx-4"
}

export const ReusableModal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  description,
  children,
  size = "md",
  showCloseButton = true,
  closeOnOverlayClick = true,
  closeOnEscape = true,
  preventClose = false,
  className,
  overlayClassName,
  contentClassName,
  headerClassName,
  footerClassName,
  footer,
  onConfirmClose
}) => {
  const modalRef = useRef<HTMLDivElement>(null)
  const previousActiveElement = useRef<HTMLElement | null>(null)

  // Handle escape key
  useEffect(() => {
    if (!isOpen || !closeOnEscape) return

    const handleEscape = async (e: KeyboardEvent) => {
      if (e.key === "Escape" && !preventClose) {
        e.preventDefault()
        await handleClose()
      }
    }

    document.addEventListener("keydown", handleEscape)
    return () => document.removeEventListener("keydown", handleEscape)
  }, [isOpen, closeOnEscape, preventClose])

  // Focus management
  useEffect(() => {
    if (isOpen) {
      previousActiveElement.current = document.activeElement as HTMLElement
      modalRef.current?.focus()
    } else {
      previousActiveElement.current?.focus()
    }
  }, [isOpen])

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = "unset"
    }

    return () => {
      document.body.style.overflow = "unset"
    }
  }, [isOpen])

  const handleClose = async () => {
    if (preventClose) return

    if (onConfirmClose) {
      const canClose = await onConfirmClose()
      if (!canClose) return
    }

    onClose()
  }

  const handleOverlayClick = async (e: React.MouseEvent) => {
    if (e.target === e.currentTarget && closeOnOverlayClick && !preventClose) {
      await handleClose()
    }
  }

  if (!isOpen) return null

  return (
    <div
      className={cn(
        "fixed inset-0 z-50 flex items-center justify-center p-4",
        "bg-black/50 backdrop-blur-sm",
        "animate-in fade-in-0 duration-200",
        overlayClassName
      )}
      onClick={handleOverlayClick}
    >
      <div
        ref={modalRef}
        tabIndex={-1}
        className={cn(
          "relative w-full bg-white rounded-lg shadow-xl",
          "animate-in zoom-in-95 duration-200",
          "max-h-[90vh] overflow-hidden flex flex-col",
          sizeClasses[size],
          className
        )}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        {(title || description || showCloseButton) && (
          <div
            className={cn(
              "flex items-start justify-between p-6 border-b border-gray-200",
              headerClassName
            )}
          >
            <div className="flex-1">
              {title && (
                <h2 className="text-lg font-semibold text-gray-900 mb-1">
                  {title}
                </h2>
              )}
              {description && (
                <p className="text-sm text-gray-600">{description}</p>
              )}
            </div>
            {showCloseButton && (
              <button
                onClick={handleClose}
                disabled={preventClose}
                className={cn(
                  "ml-4 p-2 rounded-md text-gray-400 hover:text-gray-600",
                  "hover:bg-gray-100 transition-colors duration-200",
                  "disabled:opacity-50 disabled:cursor-not-allowed",
                  "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                )}
                aria-label="Close modal"
              >
                <X className="h-5 w-5" />
              </button>
            )}
          </div>
        )}

        {/* Content */}
        <div
          className={cn(
            "flex-1 overflow-y-auto p-6",
            !title && !description && !showCloseButton && "pt-6",
            contentClassName
          )}
        >
          {children}
        </div>

        {/* Footer */}
        {footer && (
          <div
            className={cn(
              "border-t border-gray-200 p-6",
              footerClassName
            )}
          >
            {footer}
          </div>
        )}
      </div>
    </div>
  )
}

// Confirmation Modal Component
export interface ConfirmationModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void | Promise<void>
  title: string
  message: string
  confirmText?: string
  cancelText?: string
  variant?: "danger" | "warning" | "info"
  isLoading?: boolean
}

export const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = "Confirm",
  cancelText = "Cancel",
  variant = "info",
  isLoading = false
}) => {
  const handleConfirm = async () => {
    await onConfirm()
    onClose()
  }

  const variantStyles = {
    danger: {
      button: "bg-red-600 hover:bg-red-700 focus:ring-red-500",
      icon: "text-red-600"
    },
    warning: {
      button: "bg-yellow-600 hover:bg-yellow-700 focus:ring-yellow-500",
      icon: "text-yellow-600"
    },
    info: {
      button: "bg-blue-600 hover:bg-blue-700 focus:ring-blue-500",
      icon: "text-blue-600"
    }
  }

  const footer = (
    <div className="flex justify-end space-x-3">
      <button
        onClick={onClose}
        disabled={isLoading}
        className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {cancelText}
      </button>
      <button
        onClick={handleConfirm}
        disabled={isLoading}
        className={cn(
          "px-4 py-2 text-sm font-medium text-white rounded-md",
          "focus:outline-none focus:ring-2 focus:ring-offset-2",
          "disabled:opacity-50 disabled:cursor-not-allowed",
          "flex items-center space-x-2",
          variantStyles[variant].button
        )}
      >
        {isLoading && (
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
        )}
        <span>{confirmText}</span>
      </button>
    </div>
  )

  return (
    <ReusableModal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      size="sm"
      footer={footer}
      preventClose={isLoading}
    >
      <p className="text-gray-600">{message}</p>
    </ReusableModal>
  )
}

// Form Modal Component
export interface FormModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  children: React.ReactNode
  onSubmit?: () => void | Promise<void>
  submitText?: string
  cancelText?: string
  isSubmitting?: boolean
  isValid?: boolean
  hasUnsavedChanges?: boolean
  size?: "sm" | "md" | "lg" | "xl"
}

export const FormModal: React.FC<FormModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  onSubmit,
  submitText = "Save",
  cancelText = "Cancel",
  isSubmitting = false,
  isValid = true,
  hasUnsavedChanges = false,
  size = "md"
}) => {
  const handleConfirmClose = async (): Promise<boolean> => {
    if (hasUnsavedChanges && !isSubmitting) {
      return window.confirm(
        "You have unsaved changes. Are you sure you want to close this form? All data will be lost."
      )
    }
    return true
  }

  const handleSubmit = async () => {
    if (onSubmit && isValid && !isSubmitting) {
      await onSubmit()
    }
  }

  const footer = onSubmit ? (
    <div className="flex justify-end space-x-3">
      <button
        onClick={onClose}
        disabled={isSubmitting}
        className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {cancelText}
      </button>
      <button
        onClick={handleSubmit}
        disabled={!isValid || isSubmitting}
        className={cn(
          "px-4 py-2 text-sm font-medium text-white rounded-md",
          "bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2",
          "focus:ring-offset-2 focus:ring-blue-500",
          "disabled:opacity-50 disabled:cursor-not-allowed",
          "flex items-center space-x-2"
        )}
      >
        {isSubmitting && (
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
        )}
        <span>{submitText}</span>
      </button>
    </div>
  ) : undefined

  return (
    <ReusableModal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      size={size}
      footer={footer}
      onConfirmClose={handleConfirmClose}
      preventClose={isSubmitting}
    >
      {children}
    </ReusableModal>
  )
}

export default ReusableModal