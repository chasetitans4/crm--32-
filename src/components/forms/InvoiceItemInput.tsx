"use client"

import * as React from "react"

// Local utility function to avoid import issues
function cn(...inputs: (string | undefined | null | boolean)[]): string {
  return inputs.filter(Boolean).join(" ")
}

interface InvoiceItemInputProps {
  type: "text" | "number"
  value: string | number
  onChange: (value: string | number) => void
  className?: string
  placeholder?: string
  min?: string
  step?: string
  id?: string
  name?: string
  "data-testid"?: string
}

const InvoiceItemInput: React.FC<InvoiceItemInputProps> = ({
  type,
  value,
  onChange,
  className,
  placeholder,
  min,
  step,
  id,
  name,
  "data-testid": dataTestId,
}) => {
  const baseClasses =
    "px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = type === "number" ? Number(e.target.value) : e.target.value
    onChange(newValue)
  }

  return (
    <input
      id={id}
      name={name}
      type={type}
      value={value}
      onChange={handleChange}
      className={cn(baseClasses, className)}
      placeholder={placeholder}
      min={min}
      step={step}
      data-testid={dataTestId}
    />
  )
}

export default InvoiceItemInput
