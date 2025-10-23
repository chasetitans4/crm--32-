"use client"

import React, { useCallback, memo } from "react"
import { motion } from "framer-motion"
import { Calendar, User, Clock, Edit2, Trash2 } from "lucide-react"
import { Task, TaskPriority, TaskCategory } from '../../types/task'

// Interface for TaskCard props
interface TaskCardProps {
  task: Task;
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
  onSelect: (task: Task) => void;
  isTaskOverdue: (task: Task) => boolean;
  getTaskProgress: (task: Task) => number;
  TaskPriorities: Record<string, TaskPriority>;
  TaskCategories: Record<string, TaskCategory>;
}

// Memoized TaskCard component to prevent unnecessary re-renders
export const TaskCard = memo(({
  task,
  onEdit,
  onDelete,
  onSelect,
  isTaskOverdue,
  getTaskProgress,
  TaskPriorities,
  TaskCategories
}: TaskCardProps) => {
  const handleEdit = useCallback((e: React.MouseEvent) => {
    e.stopPropagation()
    onEdit(task)
  }, [onEdit, task])

  const handleDelete = useCallback((e: React.MouseEvent) => {
    e.stopPropagation()
    onDelete(task.id)
  }, [onDelete, task.id])

  const handleSelect = useCallback(() => {
    onSelect(task)
  }, [onSelect, task])

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      whileHover={{ scale: 1.02 }}
      className="bg-white rounded-lg border border-gray-200 p-4 cursor-pointer hover:shadow-md transition-all duration-200"
      onClick={handleSelect}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-2">
            <span className={`px-2 py-1 text-xs font-medium rounded-full ${
              TaskPriorities[task.priority]?.color || 'bg-gray-100 text-gray-700'
            }`}>
              {task.priority}
            </span>
            <span className={`px-2 py-1 text-xs font-medium rounded-full ${
              task.category ? TaskCategories[task.category]?.color || 'bg-gray-100 text-gray-700' : 'bg-gray-100 text-gray-700'
            }`}>
              {task.category}
            </span>
            {isTaskOverdue(task) && (
              <span className="px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-700">
                Overdue
              </span>
            )}
          </div>
          <h3 className="font-semibold text-gray-900 mb-1">{task.title}</h3>
          <p className="text-sm text-gray-600 mb-2 line-clamp-2">{task.description}</p>
          <div className="flex items-center space-x-4 text-xs text-gray-500">
            <div className="flex items-center space-x-1">
              <Calendar size={12} />
              <span>{new Date(task.dueDate).toLocaleDateString()}</span>
            </div>
            <div className="flex items-center space-x-1">
              <User size={12} />
              <span>{task.assignee}</span>
            </div>
            <div className="flex items-center space-x-1">
              <Clock size={12} />
              <span>{task.estimatedHours}h</span>
            </div>
          </div>
          {task.tags && task.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {task.tags.map((tag, index) => (
                <span key={index} className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded">
                  {tag}
                </span>
              ))}
            </div>
          )}
          <div className="mt-2">
            <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
              <span>Progress</span>
              <span>{getTaskProgress(task)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
                style={{ width: `${getTaskProgress(task)}%` }}
              />
            </div>
          </div>
        </div>
        <button
          onClick={handleEdit}
          className="p-2 text-gray-400 hover:text-blue-600 rounded-full hover:bg-blue-50 transition-colors"
        >
          <Edit2 size={16} />
        </button>

        <button
          onClick={handleDelete}
          className="p-2 text-gray-400 hover:text-red-600 rounded-full hover:bg-red-50 transition-colors"
        >
          <Trash2 size={16} />
        </button>
      </div>
    </motion.div>
  )
})

TaskCard.displayName = 'TaskCard'