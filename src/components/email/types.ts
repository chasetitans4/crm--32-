export interface Email {
  id: string
  from: string
  email: string
  subject: string
  preview: string
  body: string
  date: string
  read: boolean
  starred: boolean
  labels: string[]
  folder: string
  attachments?: Array<{
    name: string
    size: string
    type: string
  }>
}

export interface ErrorState {
  message: string
  type: 'error' | 'warning' | 'info'
}

export interface LoadingState {
  emails: boolean
  sending: boolean
  attachment: boolean
}

export interface ComposeForm {
  to: string
  cc: string
  bcc: string
  subject: string
  body: string
}

export interface Label {
  id: string
  name: string
  color: string
}

export interface Folder {
  id: string
  name: string
  icon: React.ReactNode
  count?: number
}