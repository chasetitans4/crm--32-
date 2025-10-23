"use client"

import React, { useState, useEffect } from "react"
import { FileText, Download, Eye, Calendar, User } from "lucide-react"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import type { AuthUser } from '../context/AuthContext';

interface Document {
  id: string
  title: string
  description: string
  filename: string
  lastUpdated: string
  type: string
  size: string
}

interface ContractsProps {
  currentUser: AuthUser | null;
  onError?: (error: string) => void;
}

const Contracts: React.FC<ContractsProps> = ({ currentUser, onError }) => {
  const [selectedDocument, setSelectedDocument] = useState<string | null>(null)
  const [documentContent, setDocumentContent] = useState<string>("")
  const [loading, setLoading] = useState(false)

  const getUserDocuments = (): Document[] => {
    if (!currentUser) return [];
    
    return [
      {
        id: "compensation-plan-signed",
        title: `Compensation Plan - Signed by ${currentUser.name || currentUser.email.split('@')[0]}`,
        description: "Your personalized and signed commission structure and payment terms",
        filename: "COMPENSATION_PLAN.md",
        lastUpdated: currentUser.createdAt ? new Date(currentUser.createdAt).toISOString().split('T')[0] : "2024-01-15",
        type: "Compensation Agreement",
        size: "4.2 KB",
      },
      {
        id: "terms-conditions",
        title: "Terms & Conditions",
        description: "General terms and conditions for contractor agreements",
        filename: "TERMS_AND_CONDITIONS.md",
        lastUpdated: "2024-01-10",
        type: "Legal Document",
        size: "6.8 KB",
      },
      {
        id: "agent-agreement",
        title: `Agent Agreement - ${currentUser.name || currentUser.email.split('@')[0]}`,
        description: "Your signed agent agreement and onboarding documents",
        filename: "AGENT_AGREEMENT.md",
        lastUpdated: currentUser.createdAt ? new Date(currentUser.createdAt).toISOString().split('T')[0] : "2024-01-15",
        type: "Legal Document",
        size: "3.1 KB",
      },
    ];
  };
  
  const documents: Document[] = getUserDocuments();

  const loadDocument = async (filename: string, documentId: string) => {
    setLoading(true)
    try {
      // Input validation
      if (!filename || !documentId) {
        throw new Error('Invalid document parameters');
      }
      
      if (!currentUser) {
        throw new Error('User authentication required to load documents');
      }
      
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 500))

      // Mock document content with user-specific information
      if (documentId === "compensation-plan-signed" && currentUser) {
        setDocumentContent(`# Compensation Plan - Signed Document

**Agent:** ${currentUser.name || currentUser.email.split('@')[0]}  
**Email:** ${currentUser.email}  
**Agent ID:** ${currentUser.id}  
**Date Signed:** ${currentUser.createdAt ? new Date(currentUser.createdAt).toLocaleDateString() : 'N/A'}  
**Status:** ✅ Digitally Signed

---

## Commission Structure

### Base Commission Rates
- **Life Insurance**: 15% of first-year premium
- **Auto Insurance**: 12% of annual premium
- **Home Insurance**: 10% of annual premium
- **Health Insurance**: 8% of monthly premium

### Performance Bonuses
- **Monthly Sales Target**: $50,000+ = 2% bonus
- **Quarterly Excellence**: Top 10% performers = $1,000 bonus
- **Annual Achievement**: $500,000+ = 5% additional commission

### Payment Terms
- Commissions paid monthly on the 15th
- Bonuses paid quarterly
- Direct deposit required

### Additional Benefits
- Health insurance subsidy
- Professional development allowance
- Performance recognition programs

---

**Digital Signature:** ${currentUser.name || currentUser.email.split('@')[0]}  
**Signature Date:** ${currentUser.createdAt ? new Date(currentUser.createdAt).toLocaleDateString() : 'N/A'}  
**Document Hash:** ${currentUser.id.substring(0, 8).toUpperCase()}...`)
      } else if (documentId === "agent-agreement" && currentUser) {
        setDocumentContent(`# Agent Agreement

**Agent:** ${currentUser.name || currentUser.email.split('@')[0]}  
**Email:** ${currentUser.email}  
**Agent ID:** ${currentUser.id}  
**Agreement Date:** ${currentUser.createdAt ? new Date(currentUser.createdAt).toLocaleDateString() : 'N/A'}  
**Status:** ✅ Digitally Signed

---

## Agreement Terms

### 1. Agent Responsibilities
- Maintain professional conduct
- Meet sales targets and KPIs
- Complete required training programs
- Adhere to company policies

### 2. Company Obligations
- Provide necessary training and resources
- Process commissions timely
- Offer ongoing support and guidance

### 3. Performance Standards
- Monthly sales goals as outlined in compensation plan
- Customer satisfaction metrics
- Compliance with regulatory requirements

---

**Digital Signature:** ${currentUser.name || currentUser.email.split('@')[0]}  
**Signature Date:** ${currentUser.createdAt ? new Date(currentUser.createdAt).toLocaleDateString() : 'N/A'}`)
      } else {
        setDocumentContent(`# Terms & Conditions

## General Terms

This document outlines the terms and conditions for contractor agreements.

### 1. Scope of Work
Contractors are responsible for:
- Client acquisition and relationship management
- Policy sales and renewals
- Compliance with company standards

### 2. Compensation
Refer to the Compensation Plan for detailed commission structure.

### 3. Termination
Either party may terminate this agreement with 30 days written notice.

### 4. Confidentiality
Contractors must maintain strict confidentiality of client information.

### 5. Compliance
All activities must comply with state and federal regulations.`)
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to load document';
      console.error("Error loading document:", errorMessage);
      onError?.(errorMessage);
      setDocumentContent('Failed to load document. Please try again.');
    } finally {
      setLoading(false)
    }
  }

  const handleDocumentSelect = (document: Document) => {
    try {
      if (!document || !document.id || !document.filename) {
        throw new Error('Invalid document selected');
      }
      
      setSelectedDocument(document.id)
      loadDocument(document.filename, document.id)
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to select document';
      console.error('Document selection error:', errorMessage);
      onError?.(errorMessage);
    }
  }

  const handleDownload = (filename: string, title: string) => {
    try {
      if (!filename) {
        throw new Error('Invalid filename for download');
      }
      
      const link = document.createElement("a")
      link.href = `/${filename}`
      link.download = filename
      link.click()
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to download document';
      console.error('Download error:', errorMessage);
      onError?.(errorMessage);
    }
  }

  useEffect(() => {
    // Auto-load the compensation plan by default
    const compensationPlan = documents.find((doc) => doc.id === "compensation-plan-signed")
    if (compensationPlan) {
      handleDocumentSelect(compensationPlan)
    }
  }, [])

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Contracts & Documents</h1>
          <p className="text-gray-600">Access your compensation plan and important documents</p>
          {currentUser && (
            <div className="mt-4 p-4 bg-white rounded-lg shadow-sm border">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <User className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {currentUser.name || currentUser.email.split('@')[0]}
                  </h3>
                  <p className="text-sm text-gray-600">{currentUser.email}</p>
                  <p className="text-sm text-gray-500">All documents are personalized and digitally signed</p>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Document List */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
              <div className="p-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-800">Available Documents</h2>
              </div>
              <div className="divide-y divide-gray-200">
                {documents.map((document) => (
                  <div
                    key={document.id}
                    className={`p-4 cursor-pointer transition-colors hover:bg-gray-50 ${
                      selectedDocument === document.id ? "bg-blue-50 border-r-4 border-blue-500" : ""
                    }`}
                    onClick={() => handleDocumentSelect(document)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900 mb-1">{document.title}</h3>
                        <p className="text-sm text-gray-600 mb-2">{document.description}</p>
                        <div className="flex items-center gap-4 text-xs text-gray-500">
                          <span className="flex items-center gap-1">
                            <Calendar size={12} />
                            {document.lastUpdated}
                          </span>
                          <span>{document.size}</span>
                        </div>
                      </div>
                      <div className="flex flex-col gap-1 ml-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            handleDocumentSelect(document)
                          }}
                          className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                          title="View Document"
                        >
                          <Eye size={16} />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            handleDownload(document.filename, document.title)
                          }}
                          className="p-1 text-gray-400 hover:text-green-600 transition-colors"
                          title="Download Document"
                        >
                          <Download size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Document Viewer */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
              {selectedDocument ? (
                <>
                  <div className="p-4 border-b border-gray-200 flex items-center justify-between">
                    <div>
                      <h2 className="text-lg font-semibold text-gray-800">
                        {documents.find((doc) => doc.id === selectedDocument)?.title}
                      </h2>
                      <p className="text-sm text-gray-600">
                        {documents.find((doc) => doc.id === selectedDocument)?.type}
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        const doc = documents.find((doc) => doc.id === selectedDocument)
                        if (doc) handleDownload(doc.filename, doc.title)
                      }}
                      className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      <Download size={16} />
                      Download
                    </button>
                  </div>
                  <div className="p-6">
                    {loading ? (
                      <div className="flex items-center justify-center py-12">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                      </div>
                    ) : (
                      <div className="prose max-w-none">
                        <div className="text-gray-800 leading-relaxed">
                          <ReactMarkdown remarkPlugins={[remarkGfm]}>
                            {documentContent}
                          </ReactMarkdown>
                        </div>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <div className="p-12 text-center">
                  <FileText className="mx-auto text-gray-400 mb-4" size={48} />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Select a Document</h3>
                  <p className="text-gray-600">Choose a document from the list to view its contents</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Contracts
