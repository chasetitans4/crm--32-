"use client";

import React, { useState, useRef } from "react"
import { ImageIcon, MessageSquare, Check, X, Download, Upload, ChevronLeft, CheckCircle, Edit } from "lucide-react"
import { useAppContext } from "../context/AppContext"

const DesignFeedback: React.FC = () => {
  const { state } = useAppContext()
  const { clients } = state

  const [activeProject, setActiveProject] = useState<number | null>(null)
  const [activeDesign, setActiveDesign] = useState<number | null>(null)
  const [showAnnotation, setShowAnnotation] = useState(false)
  const [annotations, setAnnotations] = useState<any[]>([])
  const [newAnnotation, setNewAnnotation] = useState({ x: 0, y: 0, text: "", visible: false })
  const imageRef = useRef<HTMLImageElement>(null)

  // Mock project data
  const projects = [
    {
      id: 1,
      clientId: 1,
      name: "E-commerce Redesign",
      client: "TechCorp Solutions",
      designs: [
        {
          id: 1,
          name: "Homepage Design",
          version: "v2",
          date: "2025-05-15",
          status: "in-review",
          designer: "Maria",
          image: "/modern-website-homepage.png",
          annotations: [
            {
              id: 1,
              x: 150,
              y: 100,
              text: "Can we make the logo bigger here?",
              author: "John Smith",
              date: "2025-05-16",
            },
            {
              id: 2,
              x: 400,
              y: 300,
              text: "I'd prefer a different image for the hero section.",
              author: "John Smith",
              date: "2025-05-16",
            },
          ],
          versions: [
            { id: 1, version: "v1", date: "2025-05-10", status: "rejected" },
            { id: 2, version: "v2", date: "2025-05-15", status: "in-review" },
          ],
        },
        {
          id: 2,
          name: "Product Page Design",
          version: "v1",
          date: "2025-05-18",
          status: "in-review",
          designer: "Chris",
          image: "/ecommerce-product-page.png",
          annotations: [],
          versions: [{ id: 1, version: "v1", date: "2025-05-18", status: "in-review" }],
        },
      ],
    },
    {
      id: 2,
      clientId: 3,
      name: "Corporate Website Rebuild",
      client: "Global Enterprises",
      designs: [
        {
          id: 3,
          name: "Homepage Design",
          version: "v3",
          date: "2025-05-10",
          status: "approved",
          designer: "Sophia",
          image: "/corporate-homepage.png",
          annotations: [
            {
              id: 3,
              x: 200,
              y: 150,
              text: "The mission statement should be more prominent.",
              author: "Michael Chen",
              date: "2025-05-11",
            },
          ],
          versions: [
            { id: 1, version: "v1", date: "2025-04-25", status: "rejected" },
            { id: 2, version: "v2", date: "2025-05-05", status: "rejected" },
            { id: 3, version: "v3", date: "2025-05-10", status: "approved" },
          ],
        },
        {
          id: 4,
          name: "Services Page",
          version: "v2",
          date: "2025-05-12",
          status: "approved",
          designer: "James",
          image: "/placeholder.svg?key=bbs34",
          annotations: [],
          versions: [
            { id: 1, version: "v1", date: "2025-05-08", status: "rejected" },
            { id: 2, version: "v2", date: "2025-05-12", status: "approved" },
          ],
        },
      ],
    },
  ]

  // Get all designs across projects
  const allDesigns = projects.flatMap((project) =>
    project.designs.map((design) => ({
      ...design,
      projectId: project.id,
      projectName: project.name,
      clientName: project.client,
    })),
  )

  // Get active design
  const currentDesign = activeDesign ? allDesigns.find((d) => d.id === activeDesign) : null

  // Get project designs with mapped properties
  const projectDesigns = activeProject 
    ? allDesigns.filter((d) => d.projectId === activeProject)
    : []

  // Handle image click for annotation
  const handleImageClick = (e: React.MouseEvent<HTMLImageElement>) => {
    if (!showAnnotation || !imageRef.current) return

    const rect = imageRef.current.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    setNewAnnotation({
      x,
      y,
      text: "",
      visible: true,
    })
  }

  // Save annotation
  const saveAnnotation = () => {
    if (!newAnnotation.text.trim() || !currentDesign) return

    const newAnnotations = [
      ...annotations,
      {
        id: Date.now(),
        x: newAnnotation.x,
        y: newAnnotation.y,
        text: newAnnotation.text,
        author: "Your Web Dev Company",
        date: new Date().toISOString().split("T")[0],
      },
    ]

    setAnnotations(newAnnotations)
    setNewAnnotation({ x: 0, y: 0, text: "", visible: false })
  }

  // Cancel annotation
  const cancelAnnotation = () => {
    setNewAnnotation({ x: 0, y: 0, text: "", visible: false })
  }

  // Approve design
  const approveDesign = () => {
    if (!currentDesign) return
    alert(`Design "${currentDesign.name}" approved!`)
  }

  // Request changes
  const requestChanges = () => {
    if (!currentDesign) return
    alert(`Changes requested for design "${currentDesign.name}"`)
  }

  // Upload new version
  const uploadNewVersion = () => {
    if (!currentDesign) return
    alert(`New version upload for "${currentDesign.name}" requested`)
  }

  // Add a function to handle downloading a design
  const downloadDesign = () => {
    if (!currentDesign) return
    alert(`Downloading design: ${currentDesign.name}`)
    // In a real app, this would download the design file
  }

  // Add a function to handle changing design versions
  const changeDesignVersion = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const versionId = Number.parseInt(e.target.value)
    if (!currentDesign) return

    const version = currentDesign.versions.find((v) => v.id === versionId)
    if (version) {
      alert(`Changed to version: ${version.version} (${version.date})`)
      // In a real app, this would load the selected version
    }
  }

  // Add a function to handle replying to annotations
  const replyToAnnotation = (annotationId: number) => {
    alert(`Replying to annotation #${annotationId}`)
    // In a real app, this would open a reply form
  }

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Design Feedback System</h2>
        <div className="flex gap-2">
          <button
            className="px-4 py-2 border rounded hover:bg-gray-50 flex items-center gap-2"
            onClick={() => {
              setActiveDesign(null)
              setActiveProject(null)
            }}
          >
            <ImageIcon size={16} />
            All Designs
          </button>
        </div>
      </div>

      {!activeDesign ? (
        <div>
          <div className="bg-white rounded-lg shadow p-4 mb-6">
            <h3 className="text-lg font-semibold mb-4">Projects</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {projects.map((project) => (
                <div
                  key={project.id}
                  className="border rounded-lg p-4 cursor-pointer hover:border-blue-500 hover:bg-blue-50"
                  onClick={() => setActiveProject(project.id)}
                >
                  <h4 className="font-medium">{project.name}</h4>
                  <p className="text-sm text-gray-500">{project.client}</p>
                  <div className="flex justify-between mt-2">
                    <span className="text-sm">{project.designs.length} designs</span>
                    <span className="text-sm text-blue-600">View</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">
                {activeProject ? `Designs for ${projects.find((p) => p.id === activeProject)?.name}` : "Recent Designs"}
              </h3>
              {activeProject && (
                <button className="text-blue-600 text-sm" onClick={() => setActiveProject(null)}>
                  View All Designs
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {(activeProject ? projectDesigns : allDesigns.slice(0, 6)).map((design) => (
                <div
                  key={design.id}
                  className="border rounded-lg overflow-hidden cursor-pointer hover:shadow-md"
                  onClick={() => {
                    setActiveDesign(design.id)
                    setAnnotations(design.annotations || [])
                  }}
                >
                  <div className="h-40 bg-gray-100 relative">
                    <img
                      src={design.image || "/placeholder.svg"}
                      alt={design.name}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-2 right-2">
                      <span
                        className={`text-xs px-2 py-1 rounded-full ${
                          design.status === "approved"
                            ? "bg-green-100 text-green-800"
                            : design.status === "rejected"
                              ? "bg-red-100 text-red-800"
                              : "bg-yellow-100 text-yellow-800"
                        }`}
                      >
                        {design.status === "approved"
                          ? "Approved"
                          : design.status === "rejected"
                            ? "Rejected"
                            : "In Review"}
                      </span>
                    </div>
                    {design.annotations && design.annotations.length > 0 && (
                      <div className="absolute bottom-2 left-2">
                        <span className="text-xs px-2 py-1 bg-white rounded-full flex items-center gap-1">
                          <MessageSquare size={12} />
                          {design.annotations.length} comments
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="p-3">
                    <div className="font-medium">{design.name}</div>
                    <div className="text-sm text-gray-500">
                      {design.version} • {design.date}
                    </div>
                    <div className="flex justify-between items-center mt-2">
                      <span className="text-xs text-gray-500">By {design.designer}</span>
                      {!activeProject && <span className="text-xs text-gray-500">{design.projectName}</span>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow">
          <div className="p-4 border-b flex justify-between items-center">
            <div className="flex items-center gap-2">
              <button className="p-1 rounded hover:bg-gray-100" onClick={() => setActiveDesign(null)}>
                <ChevronLeft size={20} />
              </button>
              <div>
                <h3 className="font-medium">{currentDesign?.name}</h3>
                <p className="text-sm text-gray-500">
                  {currentDesign?.projectName} • {currentDesign?.clientName}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1">
                <span className="text-sm text-gray-500">Version:</span>
                <select className="border rounded px-2 py-1 text-sm" onChange={changeDesignVersion}>
                  {currentDesign?.versions.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.version} ({v.date})
                    </option>
                  ))}
                </select>
              </div>
              <span
                className={`text-xs px-2 py-1 rounded-full ${
                  currentDesign?.status === "approved"
                    ? "bg-green-100 text-green-800"
                    : currentDesign?.status === "rejected"
                      ? "bg-red-100 text-red-800"
                      : "bg-yellow-100 text-yellow-800"
                }`}
              >
                {currentDesign?.status === "approved"
                  ? "Approved"
                  : currentDesign?.status === "rejected"
                    ? "Rejected"
                    : "In Review"}
              </span>
            </div>
          </div>

          <div className="flex h-[calc(100vh-16rem)]">
            <div className="flex-1 overflow-auto relative" style={{ backgroundColor: "#f0f0f0" }}>
              {currentDesign && (
                <>
                  <img
                    ref={imageRef}
                    src={currentDesign.image || "/placeholder.svg"}
                    alt={currentDesign.name}
                    className="max-w-full mx-auto cursor-crosshair"
                    onClick={handleImageClick}
                  />

                  {/* Existing annotations */}
                  {annotations.map((annotation) => (
                    <div
                      key={annotation.id}
                      className="absolute bg-yellow-200 w-6 h-6 rounded-full flex items-center justify-center cursor-pointer"
                      style={{
                        left: `${annotation.x - 12}px`,
                        top: `${annotation.y - 12}px`,
                      }}
                      title={annotation.text}
                    >
                      <span className="text-xs font-bold">{annotation.id}</span>
                    </div>
                  ))}

                  {/* New annotation input */}
                  {newAnnotation.visible && (
                    <div
                      className="absolute bg-white p-3 rounded shadow-lg w-64"
                      style={{
                        left: `${newAnnotation.x + 20}px`,
                        top: `${newAnnotation.y}px`,
                      }}
                    >
                      <textarea
                        value={newAnnotation.text}
                        onChange={(e) => setNewAnnotation({ ...newAnnotation, text: e.target.value })}
                        className="w-full border rounded p-2 text-sm h-20"
                        placeholder="Add your feedback..."
                      />
                      <div className="flex justify-end gap-2 mt-2">
                        <button onClick={cancelAnnotation} className="p-1 text-gray-500 hover:text-gray-700">
                          <X size={16} />
                        </button>
                        <button onClick={saveAnnotation} className="p-1 text-blue-600 hover:text-blue-800">
                          <Check size={16} />
                        </button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>

            <div className="w-80 border-l overflow-y-auto">
              <div className="p-4 border-b">
                <div className="flex justify-between items-center mb-4">
                  <h4 className="font-medium">Feedback</h4>
                  <button
                    className={`text-xs px-2 py-1 rounded ${
                      showAnnotation ? "bg-blue-100 text-blue-800" : "bg-gray-100"
                    }`}
                    onClick={() => setShowAnnotation(!showAnnotation)}
                  >
                    {showAnnotation ? "Cancel" : "Add Annotation"}
                  </button>
                </div>

                {annotations.length > 0 ? (
                  <div className="space-y-4">
                    {annotations.map((annotation) => (
                      <div key={annotation.id} className="border rounded p-3">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="bg-yellow-200 w-5 h-5 rounded-full flex items-center justify-center">
                            <span className="text-xs font-bold">{annotation.id}</span>
                          </div>
                          <div className="text-sm font-medium">{annotation.author}</div>
                          <div className="text-xs text-gray-500">{annotation.date}</div>
                        </div>
                        <p className="text-sm">{annotation.text}</p>
                        <div className="flex justify-end mt-2">
                          <button className="text-xs text-blue-600" onClick={() => replyToAnnotation(annotation.id)}>
                            Reply
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6 text-gray-500">
                    <MessageSquare size={24} className="mx-auto mb-2 text-gray-300" />
                    <p className="text-sm">No feedback yet</p>
                    <p className="text-xs mt-1">Click on the design to add annotations</p>
                  </div>
                )}
              </div>

              <div className="p-4">
                <h4 className="font-medium mb-3">Actions</h4>
                <div className="space-y-2">
                  <button
                    className="w-full px-3 py-2 bg-green-600 text-white rounded hover:bg-green-700 flex items-center justify-center gap-1"
                    onClick={approveDesign}
                  >
                    <CheckCircle size={16} />
                    Approve Design
                  </button>
                  <button
                    className="w-full px-3 py-2 border rounded hover:bg-gray-50 flex items-center justify-center gap-1"
                    onClick={requestChanges}
                  >
                    <Edit size={16} />
                    Request Changes
                  </button>
                  <button
                    className="w-full px-3 py-2 border rounded hover:bg-gray-50 flex items-center justify-center gap-1"
                    onClick={uploadNewVersion}
                  >
                    <Upload size={16} />
                    Upload New Version
                  </button>
                  <button
                    className="w-full px-3 py-2 border rounded hover:bg-gray-50 flex items-center justify-center gap-1"
                    onClick={downloadDesign}
                  >
                    <Download size={16} />
                    Download Design
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default DesignFeedback
