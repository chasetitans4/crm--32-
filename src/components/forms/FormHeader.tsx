"use client"

import * as React from "react"
import { AlertCircle, CheckCircle, Clock, Save } from "lucide-react"
import { Card, CardContent } from "../ui/card"
import { Progress } from "../ui/progress"
import { Badge } from "../ui/badge"
import { Alert, AlertDescription } from "../ui/alert"

interface FormHeaderProps {
  title: string
  description?: string
  completionPercentage: number
  isValid: boolean
  isDirty: boolean
  lastSaved: Date | null
  autoSaveEnabled: boolean
  errorCount: number
  warningCount: number
  mode: "create" | "edit" | "view"
}

export const FormHeader: React.FC<FormHeaderProps> = React.memo(({
  title,
  description,
  completionPercentage,
  isValid,
  isDirty,
  lastSaved,
  autoSaveEnabled,
  errorCount,
  warningCount,
  mode,
}) => {
  const getStatusIcon = () => {
    if (isValid) {
      return <CheckCircle className="h-5 w-5 text-green-500" />
    }
    return <AlertCircle className="h-5 w-5 text-red-500" />
  }

  const getStatusText = () => {
    if (isValid) {
      return "Form is valid and ready to submit"
    }
    return `Please fix ${errorCount} error${errorCount !== 1 ? 's' : ''} before submitting`
  }

  const formatLastSaved = (date: Date | null) => {
    if (!date) return "Never saved"
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    
    if (diffMins < 1) return "Just saved"
    if (diffMins < 60) return `Saved ${diffMins} minute${diffMins !== 1 ? 's' : ''} ago`
    
    const diffHours = Math.floor(diffMins / 60)
    if (diffHours < 24) return `Saved ${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`
    
    return `Saved on ${date.toLocaleDateString()}`
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
          {description && (
            <p className="text-gray-600 mt-1">{description}</p>
          )}
        </div>
        
        <div className="flex items-center gap-3">
          {/* Auto-save status */}
          {autoSaveEnabled && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Save className="h-4 w-4" />
              <span>Auto-save: {formatLastSaved(lastSaved)}</span>
            </div>
          )}
          
          {/* Mode indicator */}
          <Badge variant={mode === "view" ? "secondary" : "default"}>
            {mode === "create" ? "Creating" : mode === "edit" ? "Editing" : "Viewing"}
          </Badge>
        </div>
      </div>

      {/* Validation Summary */}
      {(errorCount > 0 || warningCount > 0) && (
        <Alert variant={errorCount > 0 ? "destructive" : "default"}>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {errorCount > 0 && (
              <span className="text-red-600">
                {errorCount} error{errorCount !== 1 ? 's' : ''} found
              </span>
            )}
            {errorCount > 0 && warningCount > 0 && <span className="mx-2">•</span>}
            {warningCount > 0 && (
              <span className="text-yellow-600">
                {warningCount} warning{warningCount !== 1 ? 's' : ''}
              </span>
            )}
          </AlertDescription>
        </Alert>
      )}

      {/* Progress Card */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Form Completion</span>
            <span className="text-sm text-gray-600">{completionPercentage}%</span>
          </div>
          <Progress value={completionPercentage} className="h-2" />
          
          {/* Status indicator */}
          <div className="flex items-center gap-2 mt-3">
            {getStatusIcon()}
            <span className={`text-sm ${
              isValid ? "text-green-600" : "text-red-600"
            }`}>
              {getStatusText()}
            </span>
            {isDirty && (
              <Badge variant="outline" className="ml-2">
                Unsaved changes
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
})

FormHeader.displayName = "FormHeader"

export default FormHeader