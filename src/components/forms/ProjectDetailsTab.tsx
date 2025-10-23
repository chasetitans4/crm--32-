"use client"

import * as React from "react"
import { FileText } from "lucide-react"
import { Input } from "../ui/input"
import { Textarea } from "../ui/textarea"
import FormSection from "./FormSection"
import FieldGroup from "./FieldGroup"
import { formatDateForInput, convertInputDateToISO } from "../../utils/dateUtils"

interface ProjectDetails {
  title: string
  description: string
}

interface ProjectDetailsTabProps {
  projectDetails: ProjectDetails | undefined
  startDate: Date | string | undefined
  endDate: Date | string | undefined
  errors: Record<string, string>
  warnings: Record<string, string>
  isReadOnly: boolean
  onUpdateProjectDetails: (field: string, value: string) => void
  onUpdateContractTerms: (field: string, value: Date | undefined) => void
  onBlur?: (field: string) => void
}



export const ProjectDetailsTab: React.FC<ProjectDetailsTabProps> = React.memo(({
  projectDetails,
  startDate,
  endDate,
  errors,
  warnings,
  isReadOnly,
  onUpdateProjectDetails,
  onUpdateContractTerms,
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

  return (
    <FormSection
      title="Project Details"
      description="Define the project scope, timeline, and deliverables"
      icon={<FileText className="h-5 w-5" />}
      errors={getFieldErrors("projectDetails")}
      warnings={getFieldWarnings("projectDetails")}
    >
      <div className="space-y-4">
        <FieldGroup 
          label="Project Title" 
          required 
          error={errors["projectDetails.title"]}
          warning={warnings["projectDetails.title"]}
        >
          <Input
            value={projectDetails?.title || ""}
            onChange={(e) => onUpdateProjectDetails("title", e.target.value)}
            onBlur={() => handleFieldBlur("projectDetails.title")}
            placeholder="Enter project title"
            disabled={isReadOnly}
          />
        </FieldGroup>

        <FieldGroup 
          label="Project Description" 
          required 
          error={errors["projectDetails.description"]}
          warning={warnings["projectDetails.description"]}
        >
          <Textarea
            value={projectDetails?.description || ""}
            onChange={(e) => onUpdateProjectDetails("description", e.target.value)}
            onBlur={() => handleFieldBlur("projectDetails.description")}
            placeholder="Describe the project in detail..."
            rows={4}
            disabled={isReadOnly}
          />
        </FieldGroup>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FieldGroup 
            label="Start Date" 
            required 
            error={errors["startDate"]}
            warning={warnings["startDate"]}
          >
            <Input
              type="date"
              value={formatDateForInput(startDate)}
              onChange={(e) => onUpdateContractTerms("startDate", e.target.value ? new Date(e.target.value) : undefined)}
              onBlur={() => handleFieldBlur("startDate")}
              disabled={isReadOnly}
            />
          </FieldGroup>

          <FieldGroup 
            label="End Date" 
            required 
            error={errors["endDate"]}
            warning={warnings["endDate"]}
          >
            <Input
              type="date"
              value={formatDateForInput(endDate)}
              onChange={(e) => onUpdateContractTerms("endDate", e.target.value ? new Date(e.target.value) : undefined)}
              onBlur={() => handleFieldBlur("endDate")}
              disabled={isReadOnly}
            />
          </FieldGroup>
        </div>
      </div>
    </FormSection>
  )
})

ProjectDetailsTab.displayName = "ProjectDetailsTab"

export default ProjectDetailsTab