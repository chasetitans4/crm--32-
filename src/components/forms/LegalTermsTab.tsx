"use client"

import * as React from "react"
import { Scale, Plus, Trash2 } from "lucide-react"
import { Input } from "../ui/input"
import { Textarea } from "../ui/textarea"
import { Button } from "../ui/button"
import FormSection from "./FormSection"
import FieldGroup from "./FieldGroup"
import { formatDateForInput, convertInputDateToISO } from "../../utils/dateUtils"

interface LegalTerms {
  liability: string
  termination: string
  disputeResolution: string
  governingLaw: string
}

interface Milestone {
  id: string
  title: string
  description: string
  dueDate: Date | string
  deliverables: string[]
  paymentPercentage: number
}

interface LegalTermsTabProps {
  legalTerms: LegalTerms | undefined
  milestones: Milestone[]
  errors: Record<string, string>
  warnings: Record<string, string>
  isReadOnly: boolean
  onUpdateLegalTerms: (field: string, value: string) => void
  onAddMilestone: () => void
  onUpdateMilestone: (id: string, field: string, value: any) => void
  onRemoveMilestone: (id: string) => void
  onBlur?: (field: string) => void
}

export const LegalTermsTab: React.FC<LegalTermsTabProps> = React.memo(({
  legalTerms,
  milestones,
  errors,
  warnings,
  isReadOnly,
  onUpdateLegalTerms,
  onAddMilestone,
  onUpdateMilestone,
  onRemoveMilestone,
  onBlur,
}) => {
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

  const handleFieldBlur = (field: string) => {
    if (onBlur) {
      onBlur(field)
    }
  }

  const handleMilestoneDateChange = (id: string, value: string) => {
    const isoDate = convertInputDateToISO(value)
    onUpdateMilestone(id, "dueDate", isoDate)
  }

  const handleDeliverableChange = (milestoneId: string, index: number, value: string) => {
    const milestone = milestones.find(m => m.id === milestoneId)
    if (milestone) {
      const newDeliverables = [...milestone.deliverables]
      newDeliverables[index] = value
      onUpdateMilestone(milestoneId, "deliverables", newDeliverables)
    }
  }

  const addDeliverable = (milestoneId: string) => {
    const milestone = milestones.find(m => m.id === milestoneId)
    if (milestone) {
      const newDeliverables = [...milestone.deliverables, ""]
      onUpdateMilestone(milestoneId, "deliverables", newDeliverables)
    }
  }

  const removeDeliverable = (milestoneId: string, index: number) => {
    const milestone = milestones.find(m => m.id === milestoneId)
    if (milestone) {
      const newDeliverables = milestone.deliverables.filter((_, i) => i !== index)
      onUpdateMilestone(milestoneId, "deliverables", newDeliverables)
    }
  }

  return (
    <div className="space-y-6">
      <FormSection
        title="Legal Terms"
        description="Define legal protections and dispute resolution"
        icon={<Scale className="h-5 w-5" />}
        errors={getFieldErrors("legalTerms")}
        warnings={getFieldWarnings("legalTerms")}
      >
        <div className="space-y-4">
          <FieldGroup 
            label="Liability Limitations" 
            required 
            error={errors["legalTerms.liability"]}
            warning={warnings["legalTerms.liability"]}
          >
            <Textarea
              value={legalTerms?.liability || ""}
              onChange={(e) => onUpdateLegalTerms("liability", e.target.value)}
              onBlur={() => handleFieldBlur("legalTerms.liability")}
              placeholder="Define liability limitations and caps..."
              rows={3}
              disabled={isReadOnly}
            />
          </FieldGroup>

          <FieldGroup 
            label="Termination Clauses" 
            required 
            error={errors["legalTerms.termination"]}
            warning={warnings["legalTerms.termination"]}
          >
            <Textarea
              value={legalTerms?.termination || ""}
              onChange={(e) => onUpdateLegalTerms("termination", e.target.value)}
              onBlur={() => handleFieldBlur("legalTerms.termination")}
              placeholder="Define termination conditions and procedures..."
              rows={3}
              disabled={isReadOnly}
            />
          </FieldGroup>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FieldGroup 
              label="Dispute Resolution" 
              required 
              error={errors["legalTerms.disputeResolution"]}
              warning={warnings["legalTerms.disputeResolution"]}
            >
              <Textarea
                value={legalTerms?.disputeResolution || ""}
                onChange={(e) => onUpdateLegalTerms("disputeResolution", e.target.value)}
                onBlur={() => handleFieldBlur("legalTerms.disputeResolution")}
                placeholder="e.g., Arbitration, Mediation, Court jurisdiction..."
                rows={3}
                disabled={isReadOnly}
              />
            </FieldGroup>

            <FieldGroup 
              label="Governing Law" 
              required 
              error={errors["legalTerms.governingLaw"]}
              warning={warnings["legalTerms.governingLaw"]}
            >
              <Input
                value={legalTerms?.governingLaw || ""}
                onChange={(e) => onUpdateLegalTerms("governingLaw", e.target.value)}
                onBlur={() => handleFieldBlur("legalTerms.governingLaw")}
                placeholder="e.g., State of California, USA"
                disabled={isReadOnly}
              />
            </FieldGroup>
          </div>
        </div>
      </FormSection>

      <FormSection
        title="Project Milestones"
        description="Define project milestones and deliverables"
        icon={<Scale className="h-5 w-5" />}
        errors={getFieldErrors("milestones")}
        warnings={getFieldWarnings("milestones")}
      >
        <div className="space-y-4">
          {milestones.map((milestone, index) => (
            <div key={milestone.id} className="border rounded-lg p-4 space-y-4">
              <div className="flex justify-between items-center">
                <h4 className="font-medium">Milestone {index + 1}</h4>
                {!isReadOnly && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => onRemoveMilestone(milestone.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FieldGroup label="Title" required>
                  <Input
                    value={milestone.title}
                    onChange={(e) => onUpdateMilestone(milestone.id, "title", e.target.value)}
                    placeholder="Milestone title"
                    disabled={isReadOnly}
                  />
                </FieldGroup>

                <FieldGroup label="Due Date" required>
                  <Input
                    type="date"
                    value={formatDateForInput(milestone.dueDate)}
                    onChange={(e) => handleMilestoneDateChange(milestone.id, e.target.value)}
                    disabled={isReadOnly}
                  />
                </FieldGroup>
              </div>

              <FieldGroup label="Description">
                <Textarea
                  value={milestone.description}
                  onChange={(e) => onUpdateMilestone(milestone.id, "description", e.target.value)}
                  placeholder="Describe this milestone..."
                  rows={2}
                  disabled={isReadOnly}
                />
              </FieldGroup>

              <FieldGroup label="Payment Percentage">
                <Input
                  type="number"
                  value={milestone.paymentPercentage}
                  onChange={(e) => onUpdateMilestone(milestone.id, "paymentPercentage", parseFloat(e.target.value) || 0)}
                  placeholder="0"
                  min="0"
                  max="100"
                  disabled={isReadOnly}
                />
              </FieldGroup>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-sm font-medium">Deliverables</label>
                  {!isReadOnly && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => addDeliverable(milestone.id)}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  )}
                </div>
                <div className="space-y-2">
                  {milestone.deliverables.map((deliverable, deliverableIndex) => (
                    <div key={deliverableIndex} className="flex gap-2">
                      <Input
                        value={deliverable}
                        onChange={(e) => handleDeliverableChange(milestone.id, deliverableIndex, e.target.value)}
                        placeholder="Deliverable description"
                        disabled={isReadOnly}
                      />
                      {!isReadOnly && (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => removeDeliverable(milestone.id, deliverableIndex)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}

          {!isReadOnly && (
            <Button
              type="button"
              variant="outline"
              onClick={onAddMilestone}
              className="w-full"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Milestone
            </Button>
          )}
        </div>
      </FormSection>
    </div>
  )
})

LegalTermsTab.displayName = "LegalTermsTab"

export default LegalTermsTab