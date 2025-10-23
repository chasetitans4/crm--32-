"use client"

import * as React from "react"
import { useState, useMemo, useCallback } from "react"
import {
  Save,
  Send,
  FileText,
  User,
  DollarSign,
  Scale,
  AlertCircle,
  CheckCircle,
  Clock,
} from "lucide-react"
import { Card, CardContent } from "../ui/card"
import { Button } from "../ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs"
import { Badge } from "../ui/badge"
import { EnhancedErrorBoundary } from "../EnhancedErrorBoundary"
import { useEnhancedContractForm } from "../../hooks/useEnhancedContractForm"
import { useToast } from "../ui/use-toast"
import { useRoleAccess } from "../../hooks/useRoleAccess"
import type { Contract } from "../../schemas/contractInvoiceSchemas"
import FormHeader from "./FormHeader"
import ClientInfoTab from "./ClientInfoTab"
import ProjectDetailsTab from "./ProjectDetailsTab"
import ContractTermsTab from "./ContractTermsTab"
import LegalTermsTab from "./LegalTermsTab"

interface EnhancedDynamicContractFormProps {
  initialData?: Partial<Contract>
  onSubmit?: (contract: Contract) => Promise<boolean>
  onSave?: (contract: Partial<Contract>) => Promise<boolean>
  mode?: "create" | "edit" | "view"
  className?: string
}



export const EnhancedDynamicContractForm: React.FC<EnhancedDynamicContractFormProps> = ({
  initialData,
  onSubmit,
  onSave,
  mode = "create",
  className = "",
}) => {
  const { toast } = useToast()
  const { hasAccess } = useRoleAccess("contracts:write")
  const [activeTab, setActiveTab] = useState("client")

  const [formState, formActions] = useEnhancedContractForm(initialData, onSubmit, onSave)

  const { data, errors, warnings, isValid, isSubmitting, isDirty, lastSaved, autoSaveEnabled } = formState
  const {
    updateClientInfo,
    updateProjectDetails,
    updateContractTerms,
    addMilestone,
    removeMilestone,
    updateMilestone,
    submitForm,
    saveAsDraft,
    toggleAutoSave,
    calculateTotals,
  } = formActions

  const isReadOnly = mode === "view" || !hasAccess

  // Calculate form completion percentage with memoization
  const completionPercentage = useMemo((): number => {
    const requiredFields = [
      data.clientInfo?.name,
      data.clientInfo?.email,
      data.projectDetails?.title,
      data.projectDetails?.description,
      data.totalAmount,
      data.paymentSchedule,
    ]

    const completedFields = requiredFields.filter(
      (field) => field !== undefined && field !== null && field !== "" && field !== 0,
    ).length

    return Math.round((completedFields / requiredFields.length) * 100)
  }, [data.clientInfo?.name, data.clientInfo?.email, data.projectDetails?.title, data.projectDetails?.description, data.totalAmount, data.paymentSchedule])

  // Filter errors and warnings by section with memoization
  const getFieldErrors = useCallback((prefix: string): Record<string, string> => {
    return Object.fromEntries(Object.entries(errors).filter(([key]) => key.startsWith(prefix)))
  }, [errors])

  const getFieldWarnings = useCallback((prefix: string): Record<string, string> => {
    return Object.fromEntries(Object.entries(warnings).filter(([key]) => key.startsWith(prefix)))
  }, [warnings])

  // Memoize error and warning counts
  const errorCount = useMemo(() => Object.keys(errors).length, [errors])
  const warningCount = useMemo(() => Object.keys(warnings).length, [warnings])

  const handleSubmit = useCallback(async (): Promise<void> => {
    try {
      if (!isValid) {
        toast({
          variant: "destructive",
          title: "Validation Error",
          description: "Please fix all errors before submitting"
        })
        return
      }

      const success = await submitForm()
      if (success) {
        toast({
          title: "Success",
          description: "Contract submitted successfully"
        })
      } else {
        toast({
          variant: "destructive",
          title: "Submission Failed",
          description: "Failed to submit contract. Please try again."
        })
      }
    } catch (error) {
      console.error('Contract submission error:', error)
      toast({
        variant: "destructive",
        title: "Submission Error",
        description: error instanceof Error ? error.message : "An unexpected error occurred during submission"
      })
    }
  }, [isValid, submitForm, toast])

  const handleSaveDraft = useCallback(async (): Promise<void> => {
    try {
      const success = await saveAsDraft()
      if (success) {
        toast({
          title: "Success",
          description: "Draft saved successfully"
        })
      } else {
        toast({
          variant: "destructive",
          title: "Save Failed",
          description: "Failed to save draft. Please try again."
        })
      }
    } catch (error) {
      console.error('Draft save error:', error)
      toast({
        variant: "destructive",
        title: "Save Error",
        description: error instanceof Error ? error.message : "An unexpected error occurred while saving"
      })
    }
  }, [saveAsDraft, toast])

  return (
    <EnhancedErrorBoundary enableRetry enableReporting showErrorDetails={process.env.NODE_ENV === "development"}>
      <div className={`max-w-6xl mx-auto p-6 space-y-6 ${className}`}>
        <FormHeader
          title={mode === "create" ? "Create Contract" : mode === "edit" ? "Edit Contract" : "View Contract"}
          description={mode === "create"
            ? "Create a new contract with detailed terms and conditions"
            : mode === "edit"
              ? "Modify contract details and terms"
              : "Review contract information"}
          completionPercentage={completionPercentage}
          isValid={isValid}
          isDirty={isDirty}
          lastSaved={lastSaved}
          autoSaveEnabled={autoSaveEnabled}
          errorCount={errorCount}
          warningCount={warningCount}
          mode={mode}
        />

        {/* Form tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="client" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              Client Info
              {Object.keys(getFieldErrors("clientInfo")).length > 0 && (
                <Badge variant="destructive" className="ml-1 h-4 w-4 p-0">
                  !
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="project" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Project
              {Object.keys(getFieldErrors("projectDetails")).length > 0 && (
                <Badge variant="destructive" className="ml-1 h-4 w-4 p-0">
                  !
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="financial" className="flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              Financial
              {(errors["totalAmount"] || errors["paymentSchedule"]) && (
                <Badge variant="destructive" className="ml-1 h-4 w-4 p-0">
                  !
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="legal" className="flex items-center gap-2">
              <Scale className="h-4 w-4" />
              Legal Terms
              {Object.keys(getFieldErrors("legalTerms")).length > 0 && (
                <Badge variant="destructive" className="ml-1 h-4 w-4 p-0">
                  !
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>

          {/* Client Information Tab */}
          <TabsContent value="client">
            <ClientInfoTab
              clientInfo={{
                name: data.clientInfo?.name || "",
                email: data.clientInfo?.email || "",
                phone: data.clientInfo?.phone || "",
                address: data.clientInfo?.address || "",
                company: data.clientInfo?.company
              }}
              errors={errors}
              warnings={warnings}
              isReadOnly={isReadOnly}
              onUpdateClientInfo={updateClientInfo}
            />
          </TabsContent>

          {/* Project Details Tab */}
          <TabsContent value="project">
            <ProjectDetailsTab
              projectDetails={data.projectDetails || { title: "", description: "" }}
              startDate={data.startDate}
              endDate={data.endDate}
              errors={errors}
              warnings={warnings}
              isReadOnly={isReadOnly}
              onUpdateProjectDetails={updateProjectDetails}
              onUpdateContractTerms={updateContractTerms}
            />
          </TabsContent>

          {/* Financial Terms Tab */}
          <TabsContent value="financial">
            <ContractTermsTab
              contractTerms={{
                value: data.totalAmount || 0,
                currency: "USD", // Contract schema doesn't have currency field
                paymentSchedule: data.paymentSchedule || "",
                terms: data.terms || ""
              }}
              errors={errors}
              warnings={warnings}
              isReadOnly={isReadOnly}
              onUpdateContractTerms={updateContractTerms}
            />
          </TabsContent>

          {/* Legal Terms Tab */}
          <TabsContent value="legal">
            <LegalTermsTab
              legalTerms={{
                liability: "", // Contract schema doesn't have liability field
                termination: "", // Contract schema doesn't have termination field
                disputeResolution: "", // Contract schema doesn't have disputeResolution field
                governingLaw: "" // Contract schema doesn't have governingLaw field
              }}
              milestones={[]} // Contract schema doesn't have milestones field
              errors={errors}
              warnings={warnings}
              isReadOnly={isReadOnly}
              onUpdateLegalTerms={(field, value) => updateContractTerms(field, value)}
              onAddMilestone={addMilestone}
              onUpdateMilestone={updateMilestone}
              onRemoveMilestone={removeMilestone}
            />
          </TabsContent>
        </Tabs>

        {/* Action buttons */}
        {!isReadOnly && (
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {isValid ? (
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  ) : (
                    <AlertCircle className="h-5 w-5 text-red-500" />
                  )}
                  <span className={`text-sm ${isValid ? "text-green-600" : "text-red-600"}`}>
                    {isValid ? "Form is valid and ready to submit" : "Please fix errors before submitting"}
                  </span>
                  {isDirty && (
                    <Badge variant="outline" className="ml-2">
                      Unsaved changes
                    </Badge>
                  )}
                </div>

                <div className="flex gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleSaveDraft}
                    disabled={isSubmitting}
                    className="flex items-center gap-2 bg-transparent"
                  >
                    <Save className="h-4 w-4" />
                    Save Draft
                  </Button>

                  <Button
                    type="button"
                    onClick={handleSubmit}
                    disabled={!isValid || isSubmitting}
                    className="flex items-center gap-2"
                  >
                    {isSubmitting ? <Clock className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                    {mode === "create" ? "Create Contract" : "Update Contract"}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </EnhancedErrorBoundary>
  )
}

export default EnhancedDynamicContractForm
