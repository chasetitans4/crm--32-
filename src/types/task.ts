// Shared Task type definitions
export interface Task {
  id: string;
  title: string;
  description: string;
  dueDate: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  assignee: string;
  status: 'TODO' | 'IN_PROGRESS' | 'REVIEW' | 'DONE';
  category?: string;
  tags?: string[];
  estimatedHours?: number;
  actualHours?: number;
  dependencies?: string[];
  recurring?: {
    type: "daily" | "weekly" | "monthly" | "yearly";
    interval: number;
    endDate?: string;
  };
  attachments?: string[];
  comments?: Array<{
    id: string;
    text: string;
    author: string;
    date: string;
  }>;
  progress?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface TaskPriority {
  label: string;
  color: string;
  bgColor: string;
  textColor: string;
  borderColor: string;
}

export interface TaskStatus {
  label: string;
  color: string;
  bgColor: string;
  textColor: string;
  borderColor: string;
}

export interface TaskCategory {
  id: string;
  label: string;
  color: string;
  bgColor: string;
  textColor: string;
}

export interface TaskColumn {
  name: string;
  items: Task[];
}

export interface ErrorState {
  message: string;
  type: 'error' | 'warning' | 'info';
  show: boolean;
}

export interface LoadingState {
  isLoading: boolean;
  operation: string;
  addTask?: boolean;
  updateTask?: boolean;
}

export interface ValidationErrors {
  title?: string;
  description?: string;
  dueDate?: string;
  assignee?: string;
  estimatedHours?: string;
}