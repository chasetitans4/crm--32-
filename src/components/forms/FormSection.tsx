"use client"

import * as React from "react"
import { AlertCircle } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card"
import { Alert, AlertDescription } from "../ui/alert"

interface FormSectionProps {
  title: string
  description: string
  icon: React.ReactNode
  children: React.ReactNode
  errors?: Record<string, string>
  warnings?: Record<string, string>
}

export const FormSection: React.FC<FormSectionProps> = React.memo(({
  title,
  description,
  icon,
  children,
  errors = {},
  warnings = {},
}) => {
  const hasErrors = Object.keys(errors).length > 0
  const hasWarnings = Object.keys(warnings).length > 0

  return (
    <Card className={`${hasErrors ? "border-red-200" : hasWarnings ? "border-yellow-200" : ""}`}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {icon}
          {title}
          {hasErrors && <AlertCircle className="h-4 w-4 text-red-500" />}
          {hasWarnings && !hasErrors && <AlertCircle className="h-4 w-4 text-yellow-500" />}
        </CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {children}

        {/* Display errors */}
        {Object.entries(errors).map(([field, message]) => (
          <Alert key={field} variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{message}</AlertDescription>
          </Alert>
        ))}

        {/* Display warnings */}
        {Object.entries(warnings).map(([field, message]) => (
          <Alert key={field} className="border-yellow-200 bg-yellow-50">
            <AlertCircle className="h-4 w-4 text-yellow-600" />
            <AlertDescription className="text-yellow-800">{message}</AlertDescription>
          </Alert>
        ))}
      </CardContent>
    </Card>
  )
})

FormSection.displayName = "FormSection"

export default FormSection