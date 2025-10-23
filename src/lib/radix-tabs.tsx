"use client"

import React, { createContext, useContext, useState } from "react"

interface TabsContextType {
  value: string
  onValueChange: (value: string) => void
}

const TabsContext = createContext<TabsContextType | undefined>(undefined)

interface TabsProps {
  value?: string
  defaultValue?: string
  onValueChange?: (value: string) => void
  children: React.ReactNode
  className?: string
}

const Root: React.FC<TabsProps> = ({
  value: controlledValue,
  defaultValue = "",
  onValueChange,
  children,
  className,
}) => {
  const [internalValue, setInternalValue] = useState(defaultValue)
  const value = controlledValue ?? internalValue

  const handleValueChange = (newValue: string) => {
    if (controlledValue === undefined) {
      setInternalValue(newValue)
    }
    onValueChange?.(newValue)
  }

  return (
    <TabsContext.Provider value={{ value, onValueChange: handleValueChange }}>
      <div className={className}>{children}</div>
    </TabsContext.Provider>
  )
}
Root.displayName = "Tabs"

interface TabsListProps {
  children: React.ReactNode
  className?: string
}

const List = React.forwardRef<HTMLDivElement, TabsListProps>(({ children, className, ...props }, ref) => {
  return (
    <div ref={ref} className={className} role="tablist" {...props}>
      {children}
    </div>
  )
})
List.displayName = "TabsList"

interface TabsTriggerProps {
  value: string
  children: React.ReactNode
  className?: string
  disabled?: boolean
}

const Trigger = React.forwardRef<HTMLButtonElement, TabsTriggerProps>(
  ({ value, children, className, disabled, ...props }, ref) => {
    const context = useContext(TabsContext)
    if (!context) {
      throw new Error("Tabs.Trigger must be used within Tabs.Root")
    }

    const isActive = context.value === value

    return (
      <button
        ref={ref}
        className={className}
        role="tab"
        aria-selected={isActive}
        data-state={isActive ? "active" : "inactive"}
        disabled={disabled}
        onClick={() => !disabled && context.onValueChange(value)}
        {...props}
      >
        {children}
      </button>
    )
  },
)
Trigger.displayName = "TabsTrigger"

interface TabsContentProps {
  value: string
  children: React.ReactNode
  className?: string
}

const Content = React.forwardRef<HTMLDivElement, TabsContentProps>(({ value, children, className, ...props }, ref) => {
  const context = useContext(TabsContext)
  if (!context) {
    throw new Error("Tabs.Content must be used within Tabs.Root")
  }

  const isActive = context.value === value

  if (!isActive) return null

  return (
    <div ref={ref} className={className} role="tabpanel" data-state={isActive ? "active" : "inactive"} {...props}>
      {children}
    </div>
  )
})
Content.displayName = "TabsContent"

export { Root, List, Trigger, Content }
