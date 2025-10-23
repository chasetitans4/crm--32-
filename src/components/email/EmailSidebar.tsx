"use client"

import React from "react"
import {
  Inbox,
  SendIcon,
  Mail,
  Star,
  Archive,
  Trash2,
  Plus,
} from "lucide-react"

interface Folder {
  id: string
  name: string
  icon: React.ReactNode
  count?: number
}

interface Label {
  id: string
  name: string
  color: string
}

interface EmailSidebarProps {
  activeFolder: string
  activeLabelFilter: string | null
  onFolderClick: (folderId: string) => void
  onLabelClick: (labelId: string) => void
  onCompose: () => void
  getEmailCountForFolder: (folderId: string) => number
  getEmailCountForLabel: (labelId: string) => number
  getColorForLabel: (color: string) => string
}

const EmailSidebar: React.FC<EmailSidebarProps> = ({
  activeFolder,
  activeLabelFilter,
  onFolderClick,
  onLabelClick,
  onCompose,
  getEmailCountForFolder,
  getEmailCountForLabel,
  getColorForLabel,
}) => {
  const folders: Folder[] = [
    { id: "inbox", name: "Inbox", icon: <Inbox size={18} />, count: 12 },
    { id: "sent", name: "Sent", icon: <SendIcon size={18} /> },
    { id: "drafts", name: "Drafts", icon: <Mail size={18} />, count: 3 },
    { id: "starred", name: "Starred", icon: <Star size={18} /> },
    { id: "archive", name: "Archive", icon: <Archive size={18} /> },
    { id: "trash", name: "Trash", icon: <Trash2 size={18} /> },
  ]

  const labels: Label[] = [
    { id: "important", name: "Important", color: "red" },
    { id: "work", name: "Work", color: "blue" },
    { id: "personal", name: "Personal", color: "green" },
    { id: "clients", name: "Clients", color: "purple" },
  ]

  return (
    <div className="w-64 border-r border-gray-200 bg-gray-50 p-4 flex flex-col">
      <button
        onClick={onCompose}
        className="bg-blue-600 text-white rounded-lg px-4 py-2 flex items-center justify-center gap-2 hover:bg-blue-700 transition-colors"
      >
        <Plus size={18} />
        <span>Compose</span>
      </button>

      <div className="mt-6 space-y-1">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-3 mb-2">
          Folders
        </p>
        {folders.map((folder) => (
          <button
            key={folder.id}
            onClick={() => onFolderClick(folder.id)}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm ${
              activeFolder === folder.id && !activeLabelFilter
                ? "bg-blue-100 text-blue-700 font-medium"
                : "text-gray-700 hover:bg-gray-100"
            }`}
          >
            <div className="flex items-center gap-3">
              <span className="text-gray-500">{folder.icon}</span>
              <span>{folder.name}</span>
            </div>
            {folder.count && (
              <span
                className={`text-xs px-2 py-0.5 rounded-full ${
                  activeFolder === folder.id && !activeLabelFilter
                    ? "bg-blue-200 text-blue-800"
                    : "bg-gray-200 text-gray-700"
                }`}
              >
                {getEmailCountForFolder(folder.id)}
              </span>
            )}
          </button>
        ))}
      </div>

      <div className="mt-6 space-y-1">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-3 mb-2">
          Labels
        </p>
        {labels.map((label) => (
          <button
            key={label.id}
            onClick={() => onLabelClick(label.id)}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm ${
              activeLabelFilter === label.id
                ? "bg-blue-100 text-blue-700 font-medium"
                : "text-gray-700 hover:bg-gray-100"
            }`}
          >
            <span
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: getColorForLabel(label.color) }}
            ></span>
            <span>{label.name}</span>
            <span className="ml-auto text-xs text-gray-500">
              {getEmailCountForLabel(label.id)}
            </span>
          </button>
        ))}
        <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-gray-700 hover:bg-gray-100">
          <Plus size={16} className="text-gray-500" />
          <span>Create new label</span>
        </button>
      </div>
    </div>
  )
}

export default EmailSidebar