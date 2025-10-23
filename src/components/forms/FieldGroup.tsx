"use client"

import * as React from "react"
import { Label } from "../ui/label"

interface FieldGroupProps {
  label: string
  children: React.ReactNode
  required?: boolean
  error?: string
  warning?: string
}

export const FieldGroup: React.FC<FieldGroupProps> = React.memo(({
  label,
  children,
  required,
  error,
  warning,
}) => (
  <div className="space-y-2">
    <Label className={`${error ? "text-red-600" : warning ? "text-yellow-600" : ""}`}>
      {label}
      {required && <span className="text-red-500 ml-1">*</span>}
    </Label>
    {children}
    {error && <p className="text-sm text-red-600">{error}</p>}
    {warning && !error && <p className="text-sm text-yellow-600">{warning}</p>}
  </div>
))

FieldGroup.displayName = "FieldGroup"

export default FieldGroup