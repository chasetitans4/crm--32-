"use client"

import type React from "react"
import { useState, useMemo, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { jsPDF } from "jspdf"
import { X, Eye, Plus, FileText, Download, Save } from "lucide-react"
import { useToast } from "./ui/use-toast"
import { useAppContext } from "../context/AppContext"
import { formatCurrency, formatNumber } from "@/utils/safeFormatters"

// Define the schema for the proposal form
const proposalSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters"),
  clientId: z.number({
    required_error: "Client is required",
    invalid_type_error: "Client is required",
  }),
  introduction: z.string().min(10, "Introduction must be at least 10 characters"),
  projectScope: z.string().min(10, "Project scope must be at least 10 characters"),
  timeline: z.string().min(10, "Timeline must be at least 10 characters"),
  services: z
    .array(
      z.object({
        name: z.string().min(1, "Service name is required"),
        description: z.string().optional(),
        price: z.number().min(0, "Price must be a positive number"),
      }),
    )
    .min(1, "At least one service is required"),
  totalPrice: z.number().min(0, "Total price must be a positive number"),
  terms: z.string().optional(),
  projectRequirementsDocumentId: z.string().optional(),
})

type ProposalFormValues = z.infer<typeof proposalSchema>

interface ProjectRequirementsDocument {
  id: string
  name: string
  content: string
  createdAt: string
  updatedAt: string
  version: number
  projectOverview?: string
  technicalRequirements?: string
  businessRequirements?: string
  timelineAndBudget?: string
}

const ProposalBuilder: React.FC = () => {
  const { state } = useAppContext()
  const { clients } = state
  const { toast } = useToast()

  const [savedProposals, setSavedProposals] = useState<any[]>([
    {
      id: 1,
      title: "E-commerce Website Redesign",
      clientName: "TechCorp Solutions",
      date: "2025-05-10",
      status: "Sent",
      totalPrice: 45000,
      version: 1,
      projectRequirementsDocumentId: "req-1",
    },
    {
      id: 2,
      title: "Corporate Website Development",
      clientName: "Global Enterprises",
      date: "2025-05-08",
      status: "Draft",
      totalPrice: 35000,
      version: 1,
      projectRequirementsDocumentId: "req-2",
    },
  ])

  const [projectRequirementsDocuments, setProjectRequirementsDocuments] = useState<ProjectRequirementsDocument[]>([
    {
      id: "req-1",
      name: "E-commerce Requirements",
      content:
        "Detailed requirements for e-commerce functionality including shopping cart, payment processing, inventory management, and customer accounts.",
      createdAt: "2025-05-10T10:00:00Z",
      updatedAt: "2025-05-10T10:00:00Z",
      version: 1,
      projectOverview: "Complete e-commerce platform redesign",
      technicalRequirements: "React, Node.js, PostgreSQL, Stripe integration",
      businessRequirements: "Increase conversion rate by 25%, mobile-first design",
      timelineAndBudget: "12 weeks, $45,000 budget",
    },
    {
      id: "req-2",
      name: "Corporate Website Requirements",
      content:
        "Requirements for corporate website including company information, team profiles, service descriptions, and contact forms.",
      createdAt: "2025-05-08T14:30:00Z",
      updatedAt: "2025-05-08T14:30:00Z",
      version: 1,
      projectOverview: "Professional corporate website development",
      technicalRequirements: "WordPress, custom theme, SEO optimization",
      businessRequirements: "Professional brand representation, lead generation",
      timelineAndBudget: "8 weeks, $35,000 budget",
    },
  ])

  const [showPreview, setShowPreview] = useState(false)
  const [activeProposal, setActiveProposal] = useState<any | null>(null)
  const [versionHistory, setVersionHistory] = useState<any[]>([])
  const [showVersionHistory, setShowVersionHistory] = useState(false)
  const [projectRequirements, setProjectRequirements] = useState("")
  const [showRequirementsModal, setShowRequirementsModal] = useState(false)
  const [selectedRequirementsDoc, setSelectedRequirementsDoc] = useState<ProjectRequirementsDocument | null>(null)

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ProposalFormValues>({
    resolver: zodResolver(proposalSchema),
    defaultValues: {
      title: "",
      clientId: 0,
      introduction: "",
      projectScope: "",
      timeline:
        "Phase 1: Discovery & Planning - 1 week\nPhase 2: Design & Mockups - 2 weeks\nPhase 3: Development & Testing - 3 weeks\nPhase 4: Launch & Training - 1 week",
      services: [{ name: "Web Design & Development", description: "Custom website design and development", price: 0 }],
      totalPrice: 0,
      terms:
        "50% deposit required to begin work. Remaining 50% due upon project completion. All work includes 30-day warranty and basic training.",
      projectRequirementsDocumentId: "",
    },
  })

  // Watch services to calculate total price
  const services = watch("services")

  // Calculate total price using useMemo to prevent infinite re-renders
  const totalPrice = useMemo(() => {
    return services.reduce((sum, service) => sum + (service.price || 0), 0)
  }, [services])

  // Update the form's totalPrice when the calculated total changes
  useEffect(() => {
    setValue("totalPrice", totalPrice)
  }, [totalPrice, setValue])

  // Add a new service
  const addService = () => {
    const currentServices = watch("services")
    setValue("services", [...currentServices, { name: "", description: "", price: 0 }])
  }

  // Remove a service
  const removeService = (index: number) => {
    const currentServices = watch("services")
    setValue(
      "services",
      currentServices.filter((_, i) => i !== index),
    )
  }

  const onSubmit = async (data: ProposalFormValues) => {
    try {
      // Simulate saving
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Handle project requirements document
      let documentId = data.projectRequirementsDocumentId
      if (projectRequirements.trim()) {
        if (documentId) {
          // Update existing document
          setProjectRequirementsDocuments((prev) =>
            prev.map((doc) =>
              doc.id === documentId
                ? {
                    ...doc,
                    content: projectRequirements,
                    updatedAt: new Date().toISOString(),
                    version: doc.version + 1,
                  }
                : doc,
            ),
          )
        } else {
          // Create new document
          documentId = `req-${Date.now()}`
          const newDoc: ProjectRequirementsDocument = {
            id: documentId,
            name: `${data.title} - Requirements`,
            content: projectRequirements,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            version: 1,
          }
          setProjectRequirementsDocuments((prev) => [...prev, newDoc])
          setValue("projectRequirementsDocumentId", documentId)
        }
      }

      // Add to saved proposals
      const client = clients.find((c) => String(c.id) === String(data.clientId))
      if (client) {
        if (activeProposal && activeProposal.id) {
          // Update existing proposal
          const updatedProposals = savedProposals.map((p) =>
            p.id === activeProposal.id
              ? {
                  ...data,
                  id: activeProposal.id,
                  clientName: client.name,
                  date: new Date().toISOString().split("T")[0],
                  status: p.status,
                  version: (p.version || 1) + 1,
                  projectRequirementsDocumentId: documentId,
                }
              : p,
          )
          setSavedProposals(updatedProposals)
          const updatedActiveProposal = {
            ...data,
            id: activeProposal.id,
            clientName: client.name,
            date: new Date().toISOString().split("T")[0],
            status: activeProposal.status,
            version: (activeProposal.version || 1) + 1,
            projectRequirementsDocumentId: documentId,
          }
          setActiveProposal(updatedActiveProposal)
          setVersionHistory([...versionHistory, { ...updatedActiveProposal, date: new Date().toISOString() }])
        } else {
          // Create new proposal
          const newProposal = {
            ...data,
            id: Date.now(),
            clientName: client.name,
            date: new Date().toISOString().split("T")[0],
            status: "Draft",
            version: 1,
            projectRequirementsDocumentId: documentId,
          }
          setSavedProposals([...savedProposals, newProposal])
          setActiveProposal(newProposal)
          setVersionHistory([...versionHistory, { ...newProposal, date: new Date().toISOString() }])
        }
      }

      toast({
        title: "Proposal Saved",
        description: "Your proposal has been saved successfully!",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save proposal. Please try again.",
        variant: "destructive",
      })
    }
  }

  // Enhanced PDF export function
  const handleExportPDF = async () => {
    try {
      const doc = new jsPDF()

      const primaryColor: [number, number, number] = [59, 130, 246]
      const textColor: [number, number, number] = [31, 41, 55]
      const lightGray: [number, number, number] = [156, 163, 175]

      let yPosition = 20
      const pageWidth = doc.internal.pageSize.width
      const margin = 20
      const contentWidth = pageWidth - margin * 2

      // Add company logo
      try {
        const logoImg = new Image()
        // Remove crossOrigin to avoid CORS issues
        logoImg.src = "/company-logo.png"

        await new Promise((resolve, reject) => {
          logoImg.onload = resolve
          logoImg.onerror = () => {
            console.log("Logo could not be loaded, continuing without logo")
            resolve(null)
          }
          setTimeout(() => {
            console.log("Logo loading timeout, continuing without logo")
            resolve(null)
          }, 1000)
        })

        if (logoImg.complete && logoImg.naturalWidth > 0) {
          doc.addImage(logoImg, "PNG", margin, yPosition, 60, 24)
          yPosition += 35
        } else {
          yPosition += 10
        }
      } catch (error) {
        console.log("Logo could not be loaded, continuing without logo")
        yPosition += 10
      }

      // Header
      doc.setFontSize(20)
      doc.setTextColor(...primaryColor)
      doc.text("PROJECT PROPOSAL", margin, yPosition)

      yPosition += 10
      doc.setFontSize(12)
      doc.setTextColor(...lightGray)
      doc.text(`Generated on ${new Date().toLocaleDateString()}`, margin, yPosition)

      yPosition += 20

      // Proposal content
      doc.setFontSize(16)
      doc.setTextColor(...textColor)
      doc.text(watch("title") || "Untitled Proposal", margin, yPosition)

      yPosition += 15

      // Client information
      const client = clients.find((c) => String(c.id) === String(watch("clientId")))
      if (client) {
        doc.setFontSize(12)
        doc.text(`Prepared for: ${client.name}`, margin, yPosition)
        yPosition += 8
      }

      // Introduction
      doc.setFontSize(14)
      doc.setTextColor(...primaryColor)
      doc.text("INTRODUCTION", margin, yPosition)
      yPosition += 8

      doc.setFontSize(10)
      doc.setTextColor(...textColor)
      const introLines = doc.splitTextToSize(watch("introduction") || "", contentWidth)
      doc.text(introLines, margin, yPosition)
      yPosition += introLines.length * 5 + 10

      // Project Scope
      doc.setFontSize(14)
      doc.setTextColor(...primaryColor)
      doc.text("PROJECT SCOPE", margin, yPosition)
      yPosition += 8

      doc.setFontSize(10)
      doc.setTextColor(...textColor)
      const scopeLines = doc.splitTextToSize(watch("projectScope") || "", contentWidth)
      doc.text(scopeLines, margin, yPosition)
      yPosition += scopeLines.length * 5 + 10

      // Services and Pricing
      doc.setFontSize(14)
      doc.setTextColor(...primaryColor)
      doc.text("SERVICES & PRICING", margin, yPosition)
      yPosition += 10

      // Services table
      const services = watch("services")
      services.forEach((service, index) => {
        if (yPosition > 250) {
          doc.addPage()
          yPosition = 20
        }

        doc.setFontSize(11)
        doc.setTextColor(...textColor)
        doc.text(`${index + 1}. ${service.name}`, margin, yPosition)
        yPosition += 6

        if (service.description) {
          doc.setFontSize(9)
          doc.setTextColor(...lightGray)
          const descLines = doc.splitTextToSize(service.description, contentWidth - 20)
          doc.text(descLines, margin + 10, yPosition)
          yPosition += descLines.length * 4 + 2
        }

        doc.setFontSize(10)
        doc.setTextColor(...textColor)
        doc.text(`Price: ${formatCurrency(service.price)}`, margin + 10, yPosition)
        yPosition += 10
      })

      // Total
      doc.setFontSize(14)
      doc.setTextColor(...primaryColor)
      doc.text(`TOTAL INVESTMENT: ${formatCurrency(watch("totalPrice"))}`, margin, yPosition)

      doc.save(`proposal-${watch("title") || "untitled"}.pdf`)
      toast({
        title: "PDF Exported",
        description: "Your proposal has been exported as a PDF file.",
      })
    } catch (error) {
      toast({
        title: "Export Failed",
        description: "Could not generate PDF. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleCancel = () => {
    if (confirm("Are you sure you want to cancel? Any unsaved changes will be lost.")) {
      reset()
      setActiveProposal(null)
      setShowPreview(false)
      setProjectRequirements("")
      toast({
        title: "Form Cancelled",
        description: "The proposal form has been reset.",
      })
    }
  }

  const viewProposal = (proposal: any) => {
    setActiveProposal(proposal)

    // Load proposal data into form
    setValue("title", proposal.title)
    setValue("clientId", Number(clients.find((c) => c.name === proposal.clientName)?.id) || 0)
    setValue(
      "introduction",
      "Thank you for considering our web design services. We're excited to work with you to create a website that perfectly represents your brand and meets your business goals.",
    )
    setValue(
      "projectScope",
      "Based on our discussions, we'll create a fully responsive website that meets your specific business needs and provides an excellent user experience across all devices.",
    )
    setValue("totalPrice", proposal.totalPrice)

    // Load project requirements if available
    if (proposal.projectRequirementsDocumentId) {
      const reqDoc = projectRequirementsDocuments.find((doc) => doc.id === proposal.projectRequirementsDocumentId)
      if (reqDoc) {
        setProjectRequirements(reqDoc.content)
        setValue("projectRequirementsDocumentId", reqDoc.id)
      }
    }

    setShowPreview(true)
  }

  const viewRequirementsDocument = (docId: string) => {
    const doc = projectRequirementsDocuments.find((d) => d.id === docId)
    if (doc) {
      setSelectedRequirementsDoc(doc)
      setShowRequirementsModal(true)
    }
  }

  const handleNewProposal = () => {
    try {
      // Reset form to default values
      reset({
        title: "",
        clientId: 0,
        introduction: "",
        projectScope: "",
        timeline:
          "Phase 1: Discovery & Planning - 1 week\nPhase 2: Design & Mockups - 2 weeks\nPhase 3: Development & Testing - 3 weeks\nPhase 4: Launch & Training - 1 week",
        services: [
          { name: "Web Design & Development", description: "Custom website design and development", price: 0 },
        ],
        totalPrice: 0,
        terms:
          "50% deposit required to begin work. Remaining 50% due upon project completion. All work includes 30-day warranty and basic training.",
        projectRequirementsDocumentId: "",
      })

      // Reset all state variables
      setActiveProposal(null)
      setShowPreview(false)
      setProjectRequirements("")
      setVersionHistory([])
      setShowVersionHistory(false)
      setShowRequirementsModal(false)
      setSelectedRequirementsDoc(null)

      // Show success message using the toast notification system
      toast({
        title: "Form Ready",
        description: "You can now create a fresh proposal.",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create new proposal. Please try again.",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header Section */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
          <div className="p-6 border-b border-gray-200">
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Proposal Builder</h1>
                <p className="text-gray-600 mt-1">Create professional proposals for your clients</p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={handleNewProposal}
                  className="px-4 py-2 text-sm font-medium text-white bg-green-600 border border-transparent rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                >
                  <Plus className="w-4 h-4 mr-2 inline" />
                  New Proposal
                </button>
                <button
                  onClick={() => setShowVersionHistory(true)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                  <FileText className="w-4 h-4 mr-2 inline" />
                  Version History
                </button>
                <button
                  onClick={handleExportPDF}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                  <Download className="w-4 h-4 mr-2 inline" />
                  Export PDF
                </button>
              </div>
            </div>
          </div>

          {/* Saved Proposals Section */}
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Proposals</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {savedProposals.map((proposal) => (
                <div
                  key={proposal.id}
                  className="bg-gray-50 rounded-lg p-4 border border-gray-200 hover:shadow-md transition-shadow"
                >
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-medium text-gray-900 truncate">{proposal.title}</h4>
                    <span
                      className={`px-2 py-1 text-xs font-medium rounded-full ${
                        proposal.status === "Sent"
                          ? "bg-green-100 text-green-800"
                          : proposal.status === "Draft"
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {proposal.status}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">{proposal.clientName}</p>
                  <p className="text-sm text-gray-500 mb-3">{proposal.date}</p>
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-semibold text-gray-900">{formatCurrency(proposal.totalPrice)}</span>
                    <button
                      onClick={() => viewProposal(proposal)}
                      className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center gap-1"
                    >
                      <Eye size={14} />
                      View
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Main Form Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Form Column */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-900">
                  {activeProposal ? "Edit Proposal" : "Create New Proposal"}
                </h2>
              </div>

              <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
                {/* Basic Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-gray-900">Basic Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Proposal Title *</label>
                      <input
                        {...register("title")}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Enter proposal title"
                      />
                      {errors.title && <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Client *</label>
                      <select
                        {...register("clientId", { valueAsNumber: true })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value={0}>Select a client</option>
                        {clients.map((client) => (
                          <option key={client.id} value={client.id}>
                            {client.name}
                          </option>
                        ))}
                      </select>
                      {errors.clientId && <p className="mt-1 text-sm text-red-600">{errors.clientId.message}</p>}
                    </div>
                  </div>
                </div>

                {/* Project Details */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-gray-900">Project Details</h3>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Introduction *</label>
                    <textarea
                      {...register("introduction")}
                      rows={4}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Introduce your proposal and company"
                    />
                    {errors.introduction && <p className="mt-1 text-sm text-red-600">{errors.introduction.message}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Project Scope *</label>
                    <textarea
                      {...register("projectScope")}
                      rows={4}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Describe the project scope and deliverables"
                    />
                    {errors.projectScope && <p className="mt-1 text-sm text-red-600">{errors.projectScope.message}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Timeline</label>
                    <textarea
                      {...register("timeline")}
                      rows={4}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Project timeline and milestones"
                    />
                  </div>
                </div>

                {/* Services & Pricing */}
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-medium text-gray-900">Services & Pricing</h3>
                    <button
                      type="button"
                      onClick={addService}
                      className="px-3 py-2 text-sm font-medium text-blue-600 bg-blue-50 border border-blue-200 rounded-md hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                    >
                      <Plus className="w-4 h-4 mr-1 inline" />
                      Add Service
                    </button>
                  </div>

                  <div className="space-y-4">
                    {services.map((service, index) => (
                      <div key={index} className="p-4 border border-gray-200 rounded-lg bg-gray-50">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Service Name *</label>
                            <input
                              {...register(`services.${index}.name`)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                              placeholder="Service name"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Price *</label>
                            <input
                              {...register(`services.${index}.price`, { valueAsNumber: true })}
                              type="number"
                              min="0"
                              step="0.01"
                              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                              placeholder="0.00"
                            />
                          </div>

                          <div className="flex items-end">
                            <button
                              type="button"
                              onClick={() => removeService(index)}
                              className="w-full px-3 py-2 text-sm font-medium text-red-600 bg-red-50 border border-red-200 rounded-md hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                              disabled={services.length === 1}
                            >
                              Remove
                            </button>
                          </div>
                        </div>

                        <div className="mt-3">
                          <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                          <textarea
                            {...register(`services.${index}.description`)}
                            rows={2}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="Service description"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Terms & Conditions */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-gray-900">Terms & Conditions</h3>
                  <div>
                    <textarea
                      {...register("terms")}
                      rows={4}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Payment terms, warranties, and other conditions"
                    />
                  </div>
                </div>

                {/* Form Actions */}
                <div className="flex justify-end gap-3 pt-6 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={handleCancel}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="w-4 h-4 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin inline-block" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4 mr-2 inline" />
                        {activeProposal ? "Update Proposal" : "Save Proposal"}
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Proposal Summary */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="p-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">Proposal Summary</h3>
              </div>
              <div className="p-4 space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Services:</span>
                  <span className="text-sm font-medium text-gray-900">{services.length}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Subtotal:</span>
                  <span className="text-sm font-medium text-gray-900">{formatCurrency(totalPrice)}</span>
                </div>
                <div className="border-t border-gray-200 pt-3">
                  <div className="flex justify-between items-center">
                    <span className="text-base font-semibold text-gray-900">Total:</span>
                    <span className="text-xl font-bold text-blue-600">{formatCurrency(totalPrice)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Project Requirements */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="p-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">Project Requirements</h3>
              </div>
              <div className="p-4">
                <textarea
                  value={projectRequirements}
                  onChange={(e) => setProjectRequirements(e.target.value)}
                  rows={6}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Document specific project requirements, client needs, and technical specifications..."
                />
                <p className="text-xs text-gray-500 mt-2">
                  This will be saved as a separate requirements document linked to your proposal.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Version History Modal */}
      {showVersionHistory && (
        <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-6 border-b border-gray-200">
              <h3 className="text-xl font-semibold text-gray-800">
                {activeProposal ? `Version History for: ${activeProposal.title}` : "All Proposal Versions"}
              </h3>
              <button
                onClick={() => setShowVersionHistory(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-full hover:bg-gray-100"
              >
                <X size={22} />
              </button>
            </div>
            <div className="p-6 space-y-4">
              {versionHistory
                .filter((v) => (activeProposal ? v.id === activeProposal.id : true))
                .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                .map((version, index) => (
                  <div key={index} className="p-4 border rounded-lg bg-gray-50">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium">
                          Version {version.version} -{" "}
                          <span className="text-sm text-gray-600">{new Date(version.date).toLocaleString()}</span>
                        </p>
                        <p className="text-sm text-gray-600">Status: {version.status}</p>
                        <p className="text-sm text-gray-600">Total: {formatCurrency(version.totalPrice)}</p>
                        {version.projectRequirementsDocumentId && (
                          <p className="text-sm text-blue-600">
                            Requirements Document:{" "}
                            {projectRequirementsDocuments.find(
                              (doc) => doc.id === version.projectRequirementsDocumentId,
                            )?.name || "Unknown"}
                          </p>
                        )}
                      </div>
                      <button
                        onClick={() => viewRequirementsDocument(version.projectRequirementsDocumentId)}
                        className="text-blue-600 hover:text-blue-800 text-sm flex items-center gap-1"
                        disabled={!version.projectRequirementsDocumentId}
                      >
                        <Eye size={14} />
                        View Requirements
                      </button>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}

      {/* Requirements Document Modal */}
      {showRequirementsModal && selectedRequirementsDoc && (
        <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-6 border-b border-gray-200">
              <div>
                <h3 className="text-xl font-semibold text-gray-800">{selectedRequirementsDoc.name}</h3>
                <p className="text-sm text-gray-600">
                  Created: {new Date(selectedRequirementsDoc.createdAt).toLocaleDateString()}
                </p>
              </div>
              <button
                onClick={() => setShowRequirementsModal(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-full hover:bg-gray-100"
              >
                <X size={22} />
              </button>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-gray-800 mb-2">Project Overview</h4>
                  <p className="text-gray-600">{selectedRequirementsDoc.projectOverview}</p>
                </div>
                <div>
                  <h4 className="font-medium text-gray-800 mb-2">Technical Requirements</h4>
                  <p className="text-gray-600">{selectedRequirementsDoc.technicalRequirements}</p>
                </div>
                <div>
                  <h4 className="font-medium text-gray-800 mb-2">Business Requirements</h4>
                  <p className="text-gray-600">{selectedRequirementsDoc.businessRequirements}</p>
                </div>
                <div>
                  <h4 className="font-medium text-gray-800 mb-2">Timeline & Budget</h4>
                  <p className="text-gray-600">{selectedRequirementsDoc.timelineAndBudget}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default ProposalBuilder
