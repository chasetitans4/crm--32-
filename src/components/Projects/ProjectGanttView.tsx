"use client"

import React from "react"
import type { Project } from "@/types"

interface ProjectWithClient extends Project {
  clientName: string
  clientId: string
  deadline: string
}

interface ProjectGanttViewProps {
  projects: ProjectWithClient[]
}

const ProjectGanttView: React.FC<ProjectGanttViewProps> = ({ projects }) => {
  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h3 className="text-lg font-semibold mb-4">Project Timeline (Gantt Chart)</h3>
      <div className="overflow-x-auto">
        <div className="min-w-max">
          <div className="grid grid-cols-12 gap-0 border-b pb-2 mb-4">
            <div className="col-span-3 font-medium text-sm">Project / Milestone</div>
            <div className="col-span-9 grid grid-cols-12 gap-0">
              {Array.from({ length: 12 }).map((_, i) => (
                <div key={i} className="text-center text-xs text-gray-500">
                  Week {i + 1}
                </div>
              ))}
            </div>
          </div>

          {projects.map((project) => (
            <div key={`${project.clientId}-${project.id}`}>
              <div className="grid grid-cols-12 gap-0 py-2 border-b">
                <div className="col-span-3 font-medium text-sm">{project.name}</div>
                <div className="col-span-9 relative h-6">
                  <div
                    className="absolute h-4 bg-blue-300 rounded"
                    style={{
                      left: "8.333%",
                      width: `${(Math.min(project.progress || 0, 100) * 9) / 100}%`,
                    }}
                  ></div>
                </div>
              </div>

              {project.milestones &&
                project.milestones.length > 0 &&
                project.milestones.map((milestone, mIdx) => (
                  <div
                    key={`${project.clientId}-${project.id}-milestone-${mIdx}`}
                    className="grid grid-cols-12 gap-0 py-2 border-b pl-6"
                  >
                    <div className="col-span-3 text-sm text-gray-600">{milestone.name}</div>
                    <div className="col-span-9 relative h-6">
                      <div
                        className={`absolute h-4 w-4 rounded-full ${
                          milestone.completed
                            ? "bg-green-500"
                            : "bg-gray-300"
                        }`}
                        style={{
                          left: `${(Number.parseInt(milestone.dueDate.split("-")[1] || "5") - 5) * 8.333}%`,
                        }}
                      ></div>
                    </div>
                  </div>
                ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default ProjectGanttView