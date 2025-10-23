"use client"

import React from "react"
import { FileText, Plus } from "lucide-react"
import { formatCurrency } from "@/utils/safeFormatters"
import type { Project } from "@/types"

interface ProjectWithClient extends Project {
  clientName: string
  clientId: string
  deadline: string
}

interface ProjectListViewProps {
  projects: ProjectWithClient[]
  onViewDetails: (project: ProjectWithClient) => void
  onAddDocument?: (projectId: string) => void
}

const ProjectListView: React.FC<ProjectListViewProps> = ({
  projects,
  onViewDetails,
  onAddDocument
}) => {
  if (projects.length === 0) {
    return (
      <div className="text-center text-gray-500 py-12">
        No projects yet. Start by adding some clients and creating projects for them.
      </div>
    )
  }

  return (
    <div className="grid gap-6">
      {projects.map((project) => (
        <div
          key={`${project.clientId}-${project.id}`}
          className="bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow"
        >
          <div className="flex justify-between items-start mb-4">
            <div>
              <h3 className="text-lg font-semibold">{project.name}</h3>
              <p className="text-sm text-gray-600">{project.clientName}</p>
            </div>
            <div className="text-right">
              <span
                className={`px-3 py-1 text-xs rounded-full ${
                  project.status === "in-progress"
                    ? "bg-blue-100 text-blue-800"
                    : project.status === "completed"
                      ? "bg-green-100 text-green-800"
                      : "bg-gray-100 text-gray-800"
                }`}
              >
                {project.status}
              </span>
              <p className="text-sm text-gray-500 mt-1">Due: {project.deadline}</p>
            </div>
          </div>

          <div className="mb-4">
            <div className="flex justify-between text-sm mb-2">
              <span>Progress</span>
              <span>{project.progress}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${project.progress}%` }}
              ></div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div className="border rounded p-3 bg-gray-50">
              <div className="text-xs text-gray-500 mb-1">Budget</div>
              <div className="text-lg font-semibold">{formatCurrency(project.budget)}</div>
            </div>
            <div className="border rounded p-3 bg-gray-50">
              <div className="text-xs text-gray-500 mb-1">Spent</div>
              <div className="text-lg font-semibold">{formatCurrency(project.spent)}</div>
            </div>
            <div className="border rounded p-3 bg-gray-50">
              <div className="text-xs text-gray-500 mb-1">Remaining</div>
              <div className="text-lg font-semibold">{formatCurrency(project.budget - project.spent)}</div>
            </div>
          </div>

          <div className="mb-4">
            <div className="text-sm font-medium mb-2">Team Members:</div>
            <div className="flex flex-wrap gap-2">
              {project.teamMembers && project.teamMembers.length > 0 ? (
                project.teamMembers.map((member: string, idx: number) => (
                  <span key={idx} className="bg-blue-50 text-blue-700 px-2 py-1 rounded text-xs">
                    {member}
                  </span>
                ))
              ) : (
                <span className="text-gray-500 text-xs">No team members assigned</span>
              )}
            </div>
          </div>

          <div className="mb-4">
            <div className="text-sm font-medium mb-2">Milestones:</div>
            <div className="space-y-2">
              {project.milestones && project.milestones.length > 0 ? (
                project.milestones.map((milestone: any, idx: number) => (
                  <div key={idx} className="flex items-center gap-2 text-sm">
                    <span
                      className={`w-2 h-2 rounded-full ${
                        milestone.completed
                          ? "bg-green-500"
                          : "bg-gray-300"
                      }`}
                    ></span>
                    <span>{milestone.name}</span>
                    <span className="text-gray-500 text-xs">{milestone.dueDate}</span>
                  </div>
                ))
              ) : (
                <div className="text-gray-500 text-xs">No milestones defined</div>
              )}
            </div>
          </div>

          <div>
            <div className="text-sm font-medium mb-2">Documents:</div>
            <div className="flex flex-wrap gap-2">
              {project.documents && project.documents.length > 0 ? (
                project.documents.map((doc: any, idx: number) => (
                  <span key={idx} className="text-xs bg-gray-100 px-2 py-1 rounded flex items-center gap-1">
                    <FileText size={12} />
                    {typeof doc === 'string' ? doc : doc.name}
                  </span>
                ))
              ) : (
                <span className="text-gray-500 text-xs">No documents attached</span>
              )}
            </div>
          </div>

          <div className="mt-4 pt-4 border-t flex justify-end space-x-2">
            <button
              className="px-3 py-1 bg-gray-100 text-gray-700 rounded text-sm hover:bg-gray-200 transition-colors"
              onClick={() => onAddDocument?.(project.id)}
            >
              Add Document
            </button>
            <button
              className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 transition-colors"
              onClick={() => onViewDetails(project)}
            >
              View Details
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}

export default ProjectListView