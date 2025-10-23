"use client"

import * as React from "react"
import { User } from "lucide-react"
import { Input } from "../ui/input"
import { Textarea } from "../ui/textarea"
import { Separator } from "../ui/separator"
import FormSection from "./FormSection"
import FieldGroup from "./FieldGroup"
import { advancedEncryption } from "../../utils/encryption"
import { secureStorage } from "../../utils/secureStorage"

interface ClientInfo {
  name: string
  email: string
  phone: string
  company?: string
  address: string
}

interface ClientInfoTabProps {
  clientInfo: ClientInfo | undefined
  errors: Record<string, string>
  warnings: Record<string, string>
  isReadOnly: boolean
  onUpdateClientInfo: (field: string, value: string) => void
  onBlur?: (field: string) => void
}

export const ClientInfoTab: React.FC<ClientInfoTabProps> = React.memo(({
  clientInfo,
  errors,
  warnings,
  isReadOnly,
  onUpdateClientInfo,
  onBlur,
}) => {
  // Secure data handling functions
  const setSecureClientData = React.useCallback(async (field: string, value: string) => {
    if (!value) return
    
    try {
      // Encrypt sensitive data before storing
      const encryptedValue = await advancedEncryption.encrypt(value)
      
      // Store temporarily in secure storage with auto-cleanup
      const storageKey = `client_${field}_${Date.now()}`
      await secureStorage.setItem(storageKey, encryptedValue)
      
      // Clear after 10 minutes for security
      setTimeout(async () => {
        await secureStorage.removeItem(storageKey)
      }, 10 * 60 * 1000)
    } catch (error) {
      console.error('Failed to encrypt client data:', error)
    }
  }, [])

  const clearSensitiveClientData = React.useCallback(async () => {
    try {
      // Clear any temporarily stored client data
      const keys = await secureStorage.getAllKeys()
      const clientKeys = keys.filter(key => key.startsWith('client_'))
      
      for (const key of clientKeys) {
        await secureStorage.removeItem(key)
      }
    } catch (error) {
      console.error('Failed to clear sensitive client data:', error)
    }
  }, [])

  // Cleanup on unmount
  React.useEffect(() => {
    return () => {
      clearSensitiveClientData()
    }
  }, [clearSensitiveClientData])
  const getFieldErrors = (section: string) => {
    return Object.keys(errors)
      .filter(key => key.startsWith(`${section}.`))
      .reduce((acc, key) => {
        acc[key] = errors[key]
        return acc
      }, {} as Record<string, string>)
  }

  const getFieldWarnings = (section: string) => {
    return Object.keys(warnings)
      .filter(key => key.startsWith(`${section}.`))
      .reduce((acc, key) => {
        acc[key] = warnings[key]
        return acc
      }, {} as Record<string, string>)
  }

  const handleFieldChange = (field: string, value: string) => {
    onUpdateClientInfo(field, value)
    
    // Encrypt sensitive fields
    const sensitiveFields = ['name', 'email', 'phone', 'address']
    if (sensitiveFields.includes(field)) {
      setSecureClientData(field, value)
    }
  }

  const handleFieldBlur = (field: string) => {
    if (onBlur) {
      onBlur(`clientInfo.${field}`)
    }
  }

  return (
    <FormSection
      title="Client Information"
      description="Enter the client's contact details and company information"
      icon={<User className="h-5 w-5" />}
      errors={getFieldErrors("clientInfo")}
      warnings={getFieldWarnings("clientInfo")}
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FieldGroup 
          label="Full Name" 
          required 
          error={errors["clientInfo.name"]}
          warning={warnings["clientInfo.name"]}
        >
          <Input
            value={clientInfo?.name || ""}
            onChange={(e) => handleFieldChange("name", e.target.value)}
            onBlur={() => handleFieldBlur("name")}
            placeholder="Enter client's full name"
            disabled={isReadOnly}
          />
        </FieldGroup>

        <FieldGroup 
          label="Email Address" 
          required 
          error={errors["clientInfo.email"]}
          warning={warnings["clientInfo.email"]}
        >
          <Input
            type="email"
            value={clientInfo?.email || ""}
            onChange={(e) => handleFieldChange("email", e.target.value)}
            onBlur={() => handleFieldBlur("email")}
            placeholder="client@example.com"
            disabled={isReadOnly}
          />
        </FieldGroup>

        <FieldGroup 
          label="Phone Number" 
          required 
          error={errors["clientInfo.phone"]}
          warning={warnings["clientInfo.phone"]}
        >
          <Input
            type="tel"
            value={clientInfo?.phone || ""}
            onChange={(e) => handleFieldChange("phone", e.target.value)}
            onBlur={() => handleFieldBlur("phone")}
            placeholder="+1 (555) 123-4567"
            disabled={isReadOnly}
          />
        </FieldGroup>

        <FieldGroup 
          label="Company Name" 
          error={errors["clientInfo.company"]}
          warning={warnings["clientInfo.company"]}
        >
          <Input
            value={clientInfo?.company || ""}
            onChange={(e) => handleFieldChange("company", e.target.value)}
            onBlur={() => handleFieldBlur("company")}
            placeholder="Company name (optional)"
            disabled={isReadOnly}
          />
        </FieldGroup>
      </div>

      <Separator />

      <FieldGroup 
        label="Address" 
        error={errors["clientInfo.address"]}
        warning={warnings["clientInfo.address"]}
      >
        <Textarea
          value={clientInfo?.address || ""}
          onChange={(e) => handleFieldChange("address", e.target.value)}
          onBlur={() => handleFieldBlur("address")}
          placeholder="Enter full address"
          disabled={isReadOnly}
          rows={3}
        />
      </FieldGroup>
    </FormSection>
  )
})

ClientInfoTab.displayName = "ClientInfoTab"

export default ClientInfoTab