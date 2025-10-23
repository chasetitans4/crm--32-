"use client"

import React, { useState, useRef } from "react"
import {
  Grid,
  Columns,
  UploadCloud,
  Download,
  Search,
  FileText,
  Link,
  Trash,
  X,
  AlertTriangle,
  HardDrive,
} from "lucide-react"
import { useAppContext } from "../context/AppContext"
import { useErrorState, handleAsyncOperation, DefaultErrorFallback, createStandardError } from "../utils/standardErrorHandling"

interface DocumentQuota {
  userId: string
  storageUsed: number // in MB
  storageLimit: number // in MB
  maxFileSize: number // in MB
  maxVersions: number
  compressionEnabled: boolean
}

interface DocumentRetentionPolicy {
  maxVersionHistory: number
  autoDeleteOldVersions: boolean
  versionRetentionDays: number
  previewCacheRetentionDays: number
  deletedFileRetentionDays: number
}

const Documents: React.FC = () => {
  const { state, dispatch } = useAppContext()
  const { clients } = state
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [documentFilter, setDocumentFilter] = useState("all")
  const [showUploadModal, setShowUploadModal] = useState(false)
  const [uploadFiles, setUploadFiles] = useState<File[]>([])
  const [selectedClient, setSelectedClient] = useState<string>("")
  const [selectedProject, setSelectedProject] = useState<string>("")
  const [uploadProgress, setUploadProgress] = useState<number>(0)
  const [isUploading, setIsUploading] = useState<boolean>(false)
  const [compressionEnabled, setCompressionEnabled] = useState<boolean>(true)
  const { hasError, error, setError, clearError } = useErrorState()

  // Document quotas and limits
  const DEFAULT_QUOTA: DocumentQuota = {
    userId: "current-user",
    storageUsed: 0,
    storageLimit: 1000, // 1GB
    maxFileSize: 50, // 50MB per file
    maxVersions: 5,
    compressionEnabled: true,
  }

  const RETENTION_POLICY: DocumentRetentionPolicy = {
    maxVersionHistory: 5,
    autoDeleteOldVersions: true,
    versionRetentionDays: 90, // 3 months
    previewCacheRetentionDays: 30,
    deletedFileRetentionDays: 30,
  }

  const [documentQuota, setDocumentQuota] = useState<DocumentQuota>(DEFAULT_QUOTA)

  // Safely extract all documents with null checks
  const documents =
    clients && clients.length > 0
      ? clients.flatMap((client) =>
          client.projects && client.projects.length > 0
            ? client.projects.flatMap((project) =>
                project.documents && project.documents.length > 0
                  ? project.documents.map((doc: { id: string; name: string; url: string; uploadDate: string }) => ({
                      name: doc.name,
                      client: client.name,
                      project: project.name,
                      date: doc.uploadDate,
                      type: doc.name.split(".").pop(),
                      size: getRandomFileSize(),
                      versions: Math.floor(Math.random() * 3) + 1,
                    }))
                  : [],
              )
            : [],
        )
      : []

  // Calculate current storage usage
  const currentStorageUsed = documents.reduce((total, doc) => {
    return total + Number.parseFloat(doc.size.replace(" MB", ""))
  }, 0)

  function getRandomFileSize(): string {
    const sizes = ["0.5 MB", "1.2 MB", "2.8 MB", "5.1 MB", "0.8 MB", "3.4 MB", "1.9 MB"]
    return sizes[Math.floor(Math.random() * sizes.length)]
  }

  const filteredDocuments = documents.filter((doc) => {
    if (documentFilter === "all") return true
    if (documentFilter === "contracts") return doc.name.toLowerCase().includes("contract")
    if (documentFilter === "proposals") return doc.name.toLowerCase().includes("proposal")
    if (documentFilter === "designs") return ["figma", "pdf"].includes(doc.type || "")
    return true
  })

  const validateFileUpload = (files: File[]): { valid: boolean; errors: string[] } => {
    const errors: string[] = []
    let totalSize = 0

    for (const file of files) {
      const fileSizeInMB = file.size / (1024 * 1024)

      // Check individual file size
      if (fileSizeInMB > documentQuota.maxFileSize) {
        errors.push(`File "${file.name}" exceeds maximum size of ${documentQuota.maxFileSize}MB`)
      }

      totalSize += fileSizeInMB
    }

    // Check total storage limit
    if (currentStorageUsed + totalSize > documentQuota.storageLimit) {
      const availableSpace = documentQuota.storageLimit - currentStorageUsed
      errors.push(
        `Storage limit exceeded. Available: ${availableSpace.toFixed(1)}MB, Required: ${totalSize.toFixed(1)}MB`,
      )
    }

    // Check file types (basic validation)
    const allowedTypes = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "image/jpeg",
      "image/png",
      "image/gif",
      "text/plain",
    ]

    for (const file of files) {
      if (!allowedTypes.includes(file.type)) {
        errors.push(`File type "${file.type}" is not allowed for "${file.name}"`)
      }
    }

    return {
      valid: errors.length === 0,
      errors,
    }
  }

  const compressFile = async (file: File): Promise<File> => {
    // Simple compression simulation - in real implementation, use compression libraries
    if (file.type.startsWith("image/") && file.size > 1024 * 1024) {
      // Simulate image compression
      const compressedSize = Math.floor(file.size * 0.7) // 30% compression
      const compressedFile = new File([file], file.name, {
        type: file.type,
        lastModified: file.lastModified,
      })

      // Override size property (in real implementation, actual compression would occur)
      Object.defineProperty(compressedFile, "size", {
        value: compressedSize,
        writable: false,
      })

      return compressedFile
    }
    return file
  }

  const handleUploadClick = () => {
    setShowUploadModal(true)
  }

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      let filesArray = Array.from(e.target.files)

      // Compress files if enabled
      if (compressionEnabled) {
        filesArray = await Promise.all(filesArray.map((file) => compressFile(file)))
      }

      setUploadFiles(filesArray)
    }
  }

  const triggerFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click()
    }
  }

  const handleUpload = async () => {
    // Validate files before upload
    const validation = validateFileUpload(uploadFiles)

    if (!validation.valid) {
      setError(createStandardError(
        validation.errors.join(", "),
        {
          type: 'validation',
          code: 'FILE_UPLOAD_VALIDATION'
        }
      ))
      return
    }

    // Validate required selections
    if (uploadFiles.length === 0) {
      setError(createStandardError('Please select files to upload', {
        type: 'validation',
        code: 'NO_FILES_SELECTED'
      }))
      return
    }
    if (!selectedClient) {
      setError(createStandardError('Please select a client', {
        type: 'validation',
        code: 'NO_CLIENT_SELECTED'
      }))
      return
    }
    if (!selectedProject) {
      setError(createStandardError('Please select a project', {
        type: 'validation',
        code: 'NO_PROJECT_SELECTED'
      }))
      return
    }

    setIsUploading(true)
    clearError()

    const result = await handleAsyncOperation(async () => {
      // Simulate upload progress
      let progress = 0
      const interval = setInterval(() => {
        progress += 10
        setUploadProgress(progress)

        if (progress >= 100) {
          clearInterval(interval)
        }
      }, 300)

      // Wait for upload to complete
      await new Promise(resolve => setTimeout(resolve, 3000))

      // Add documents to the selected client and project
      const clientIndex = clients.findIndex((c) => c.name === selectedClient)
      if (clientIndex === -1) {
        throw new Error('Selected client not found')
      }

      const projectIndex = clients[clientIndex].projects.findIndex((p) => p.name === selectedProject)
      if (projectIndex === -1) {
        throw new Error('Selected project not found')
      }

      const newDocuments = uploadFiles.map((file) => file.name)

      // Update storage quota
      const uploadedSize = uploadFiles.reduce((total, file) => total + file.size / (1024 * 1024), 0)
      
      return { uploadedSize, newDocuments }
    }, 'Document upload')

    if (result.error) {
      setError(result.error)
    } else if (result.data) {
      setDocumentQuota((prev) => ({
        ...prev,
        storageUsed: prev.storageUsed + result.data!.uploadedSize,
      }))

      // Show success message
      setError(createStandardError('Documents uploaded successfully!', {
        type: 'business',
        code: 'UPLOAD_SUCCESS'
      }))

      // Reset and close modal
      setTimeout(() => {
        setUploadProgress(0)
        setUploadFiles([])
        setSelectedClient("")
        setSelectedProject("")
        setShowUploadModal(false)
        clearError()
      }, 2000)
    }

    setIsUploading(false)
  }

  const removeFile = (index: number) => {
    setUploadFiles((prev) => prev.filter((_, i) => i !== index))
  }

  const cleanupOldVersions = async () => {
    // Simulate cleanup of old document versions
    // Clean up old document versions

    // In real implementation, this would:
    // 1. Find documents with more than maxVersionHistory versions
    // 2. Delete oldest versions beyond the limit
    // 3. Update storage quota

    const freedSpace = Math.random() * 50 // Simulate freed space
    setDocumentQuota((prev) => ({
      ...prev,
      storageUsed: Math.max(0, prev.storageUsed - freedSpace),
    }))

    setError(createStandardError(`Cleanup completed. Freed ${freedSpace.toFixed(1)}MB of storage.`, {
      type: 'business',
      code: 'CLEANUP_SUCCESS'
    }))
  }

  const availableClients = clients || []
  const availableProjects = selectedClient ? clients.find((c) => c.name === selectedClient)?.projects || [] : []

  const storagePercentage = (currentStorageUsed / documentQuota.storageLimit) * 100

  return (
    <div className="p-8">
      {hasError && error && (
        <div className="mb-6">
          <DefaultErrorFallback
            error={error}
            retry={clearError}
          />
        </div>
      )}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Documents</h2>
        <div className="flex items-center space-x-2">
          <div className="flex border rounded overflow-hidden">
            <button
              onClick={() => setViewMode("grid")}
              className={`px-3 py-1 ${viewMode === "grid" ? "bg-blue-500 text-white" : "bg-white"}`}
            >
              <Grid size={16} />
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`px-3 py-1 ${viewMode === "list" ? "bg-blue-500 text-white" : "bg-white"}`}
            >
              <Columns size={16} />
            </button>
          </div>
          <button
            className="bg-blue-600 text-white px-3 py-1 rounded flex items-center gap-1 hover:bg-blue-700 transition-colors"
            onClick={handleUploadClick}
          >
            <UploadCloud size={16} />
            Upload
          </button>
        </div>
      </div>

      {/* Storage Quota Display */}
      <div className="bg-white rounded-lg shadow mb-6 p-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <HardDrive size={20} className="text-gray-600" />
            <span className="font-medium">Storage Usage</span>
          </div>
          <button onClick={cleanupOldVersions} className="text-sm text-blue-600 hover:text-blue-800">
            Cleanup Old Versions
          </button>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className={`h-2 rounded-full transition-all duration-300 ${
                  storagePercentage > 90 ? "bg-red-500" : storagePercentage > 75 ? "bg-yellow-500" : "bg-green-500"
                }`}
                style={{ width: `${Math.min(storagePercentage, 100)}%` }}
              ></div>
            </div>
          </div>
          <div className="text-sm text-gray-600">
            {currentStorageUsed.toFixed(1)} MB / {documentQuota.storageLimit} MB
          </div>
        </div>
        {storagePercentage > 90 && (
          <div className="mt-2 flex items-center gap-2 text-red-600 text-sm">
            <AlertTriangle size={16} />
            <span>Storage almost full. Consider cleaning up old files or upgrading your plan.</span>
          </div>
        )}
      </div>

      <div className="bg-white rounded-lg shadow mb-6">
        <div className="border-b px-6 py-3 flex justify-between items-center">
          <div className="flex space-x-4">
            <button
              onClick={() => setDocumentFilter("all")}
              className={`px-3 py-2 text-sm font-medium ${
                documentFilter === "all"
                  ? "text-blue-600 border-b-2 border-blue-600"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              All Files ({filteredDocuments.length})
            </button>
            <button
              onClick={() => setDocumentFilter("contracts")}
              className={`px-3 py-2 text-sm font-medium ${
                documentFilter === "contracts"
                  ? "text-blue-600 border-b-2 border-blue-600"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              Contracts
            </button>
            <button
              onClick={() => setDocumentFilter("proposals")}
              className={`px-3 py-2 text-sm font-medium ${
                documentFilter === "proposals"
                  ? "text-blue-600 border-b-2 border-blue-600"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              Proposals
            </button>
            <button
              onClick={() => setDocumentFilter("designs")}
              className={`px-3 py-2 text-sm font-medium ${
                documentFilter === "designs"
                  ? "text-blue-600 border-b-2 border-blue-600"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              Designs
            </button>
          </div>

          <div className="relative">
            <input type="text" placeholder="Search documents..." className="border rounded pl-8 pr-3 py-1 w-64" />
            <Search className="absolute left-2 top-2 text-gray-400" size={16} />
          </div>
        </div>

        {viewMode === "grid" ? (
          <div className="p-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filteredDocuments.map((doc, idx) => (
              <div
                key={idx}
                className="border rounded-lg p-4 hover:bg-blue-50 cursor-pointer transition-colors shadow-sm hover:shadow"
              >
                <div className="flex items-center justify-center h-24 mb-2 bg-gray-100 rounded">
                  {doc.type === "pdf" && <FileText size={40} className="text-red-500" />}
                  {doc.type === "figma" && <FileText size={40} className="text-purple-500" />}
                  {(doc.type === "doc" || doc.type === "docx") && <FileText size={40} className="text-blue-500" />}
                </div>
                <div className="text-center">
                  <div className="font-medium truncate">{doc.name}</div>
                  <div className="text-xs text-gray-500">{doc.client}</div>
                  <div className="text-xs text-gray-400">
                    {doc.date} • {doc.size}
                  </div>
                  {doc.versions > 1 && <div className="text-xs text-blue-600 mt-1">{doc.versions} versions</div>}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-6">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Client/Project
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Size
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Versions
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredDocuments.map((doc, idx) => (
                  <tr key={idx} className="hover:bg-blue-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {doc.type === "pdf" && <FileText size={16} className="text-red-500 mr-2" />}
                        {doc.type === "figma" && <FileText size={16} className="text-purple-500 mr-2" />}
                        {(doc.type === "doc" || doc.type === "docx") && (
                          <FileText size={16} className="text-blue-500 mr-2" />
                        )}
                        <div className="text-sm font-medium text-gray-900">{doc.name}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{doc.client}</div>
                      <div className="text-sm text-gray-500">{doc.project}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{doc.date}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{doc.size}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-blue-600">{doc.versions}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button className="text-blue-600 hover:text-blue-900 mr-3">
                        <Download size={16} />
                      </button>
                      <button className="text-blue-600 hover:text-blue-900 mr-3">
                        <Link size={16} />
                      </button>
                      <button className="text-red-600 hover:text-red-900">
                        <Trash size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b bg-gradient-to-r from-blue-500 to-blue-600">
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-bold text-white">Upload Documents</h3>
                <button
                  onClick={() => setShowUploadModal(false)}
                  className="text-white hover:text-gray-200 transition-colors"
                  disabled={isUploading}
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            <div className="p-6">
              {/* Storage Warning */}
              {storagePercentage > 75 && (
                <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <div className="flex items-center gap-2 text-yellow-800">
                    <AlertTriangle size={16} />
                    <span className="text-sm font-medium">
                      Storage {storagePercentage > 90 ? "Critical" : "Warning"}
                    </span>
                  </div>
                  <p className="text-sm text-yellow-700 mt-1">
                    {storagePercentage > 90
                      ? "Storage is almost full. Upload may fail."
                      : "Storage is getting full. Consider cleaning up old files."}
                  </p>
                </div>
              )}

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Select Client</label>
                <select
                  className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={selectedClient}
                  onChange={(e) => {
                    setSelectedClient(e.target.value)
                    setSelectedProject("")
                  }}
                  disabled={isUploading}
                >
                  <option value="">Select a client</option>
                  {availableClients.map((client, idx) => (
                    <option key={idx} value={client.name}>
                      {client.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Select Project</label>
                <select
                  className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={selectedProject}
                  onChange={(e) => setSelectedProject(e.target.value)}
                  disabled={!selectedClient || isUploading}
                >
                  <option value="">Select a project</option>
                  {availableProjects.map((project, idx) => (
                    <option key={idx} value={project.name}>
                      {project.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-gray-700">Upload Files</label>
                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={compressionEnabled}
                      onChange={(e) => setCompressionEnabled(e.target.checked)}
                      disabled={isUploading}
                    />
                    <span className="text-gray-600">Compress images</span>
                  </label>
                </div>
                <div
                  className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:bg-gray-50 transition-colors"
                  onClick={triggerFileInput}
                >
                  <input
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    multiple
                    onChange={handleFileSelect}
                    disabled={isUploading}
                    accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.gif,.txt"
                  />
                  <UploadCloud size={40} className="mx-auto text-gray-400 mb-2" />
                  <p className="text-sm text-gray-500">Click to browse or drag and drop files here</p>
                  <p className="text-xs text-gray-400 mt-1">
                    Max {documentQuota.maxFileSize}MB per file • PDF, DOC, DOCX, JPG, PNG, GIF, TXT
                  </p>
                </div>
              </div>

              {uploadFiles.length > 0 && (
                <div className="mb-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Selected Files:</h4>
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {uploadFiles.map((file, idx) => {
                      const sizeInMB = (file.size / (1024 * 1024)).toFixed(1)
                      const isOversized = file.size / (1024 * 1024) > documentQuota.maxFileSize

                      return (
                        <div
                          key={idx}
                          className={`flex items-center justify-between p-2 rounded ${isOversized ? "bg-red-50 border border-red-200" : "bg-gray-50"}`}
                        >
                          <div className="flex items-center">
                            <FileText size={16} className={`mr-2 ${isOversized ? "text-red-500" : "text-blue-500"}`} />
                            <div>
                              <span className="text-sm truncate max-w-[200px] block">{file.name}</span>
                              <span className={`text-xs ${isOversized ? "text-red-600" : "text-gray-500"}`}>
                                {sizeInMB} MB {isOversized && "(Too large)"}
                              </span>
                            </div>
                          </div>
                          <button
                            onClick={() => removeFile(idx)}
                            className="text-gray-400 hover:text-red-500 transition-colors"
                            disabled={isUploading}
                          >
                            <X size={16} />
                          </button>
                        </div>
                      )
                    })}
                  </div>
                  <div className="mt-2 text-xs text-gray-600">
                    Total: {(uploadFiles.reduce((sum, file) => sum + file.size, 0) / (1024 * 1024)).toFixed(1)} MB
                  </div>
                </div>
              )}

              {isUploading && (
                <div className="mb-4">
                  <div className="flex justify-between text-sm mb-1">
                    <span>Uploading...</span>
                    <span>{uploadProgress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    ></div>
                  </div>
                </div>
              )}

              <div className="flex justify-end gap-2 mt-6">
                <button
                  className="px-4 py-2 border rounded text-gray-700 hover:bg-gray-50 transition-colors"
                  onClick={() => setShowUploadModal(false)}
                  disabled={isUploading}
                >
                  Cancel
                </button>
                <button
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors flex items-center gap-1 disabled:opacity-50"
                  onClick={handleUpload}
                  disabled={uploadFiles.length === 0 || !selectedClient || !selectedProject || isUploading}
                >
                  {isUploading ? (
                    <>Uploading...</>
                  ) : (
                    <>
                      <UploadCloud size={16} />
                      Upload ({uploadFiles.length} files)
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Documents
