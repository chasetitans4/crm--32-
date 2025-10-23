import React from 'react';
import { motion } from 'framer-motion';
import { Edit2, Trash2, User, Calendar, Tag, Clock, AlertCircle } from 'lucide-react';
import { Task } from '../../types/task';

interface Column {
  name: string;
  items: Task[];
}

interface TaskKanbanViewProps {
  columns: Record<string, Column>;
  selectedTasks: string[];
  setSelectedTasks: React.Dispatch<React.SetStateAction<string[]>>;
  setSelectedTask: React.Dispatch<React.SetStateAction<Task | null>>;
  setEditingTask: React.Dispatch<React.SetStateAction<Task | null>>;
  deleteTask: (taskId: string) => void;
  handleDragStart: (task: Task) => void;
  handleDragOver: (e: React.DragEvent) => void;
  handleDrop: (e: React.DragEvent, columnId: string) => void;
  handleMoveTask: (taskId: string, newStatus: string) => void;
  canCompleteTask: (task: Task) => boolean;
  getTaskProgress: (task: Task) => number;
  isTaskOverdue: (task: Task) => boolean;
  getDaysUntilDue: (task: Task) => number;
}

const TaskStatuses = {
  TODO: {
    label: 'To Do',
    color: 'bg-gray-500',
    bgColor: 'bg-gray-50'
  },
  IN_PROGRESS: {
    label: 'In Progress',
    color: 'bg-blue-500',
    bgColor: 'bg-blue-50'
  },
  REVIEW: {
    label: 'Review',
    color: 'bg-purple-500',
    bgColor: 'bg-purple-50'
  },
  DONE: {
    label: 'Done',
    color: 'bg-green-500',
    bgColor: 'bg-green-50'
  }
};

const TaskPriorities = {
  LOW: {
    label: 'Low',
    color: 'text-green-600 bg-green-50 border-green-200'
  },
  MEDIUM: {
    label: 'Medium',
    color: 'text-yellow-600 bg-yellow-50 border-yellow-200'
  },
  HIGH: {
    label: 'High',
    color: 'text-orange-600 bg-orange-50 border-orange-200'
  },
  URGENT: {
    label: 'Urgent',
    color: 'text-red-600 bg-red-50 border-red-200'
  }
};

const TaskCategories = {
  DEVELOPMENT: { label: 'Development' },
  DESIGN: { label: 'Design' },
  TESTING: { label: 'Testing' },
  DOCUMENTATION: { label: 'Documentation' },
  MEETING: { label: 'Meeting' },
  RESEARCH: { label: 'Research' }
};

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
};

export const TaskKanbanView: React.FC<TaskKanbanViewProps> = ({
  columns,
  selectedTasks,
  setSelectedTasks,
  setSelectedTask,
  setEditingTask,
  deleteTask,
  handleDragStart,
  handleDragOver,
  handleDrop,
  canCompleteTask,
  getTaskProgress,
  isTaskOverdue
}) => {
  return (
    <motion.div
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {Object.entries(columns).map(([columnId, column]) => (
        <motion.div
          key={columnId}
          className="bg-white rounded-xl border border-gray-200 shadow-sm"
          variants={itemVariants}
        >
          <div className={`p-4 border-b border-gray-100 ${TaskStatuses[columnId as keyof typeof TaskStatuses].bgColor}`}>
            <div className="flex items-center justify-between">
              <h2 className="font-semibold flex items-center">
                <span className={`w-3 h-3 rounded-full ${TaskStatuses[columnId as keyof typeof TaskStatuses].color} mr-3`}></span>
                {column.name}
              </h2>
              <span className={`text-sm font-medium px-2 py-1 rounded-full ${TaskStatuses[columnId as keyof typeof TaskStatuses].color}`}>
                {column.items.length}
              </span>
            </div>
          </div>

          <div 
            className="p-4 min-h-[400px]"
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, columnId)}
          >
            <div className="space-y-3">
              {column.items.map((task) => (
                <motion.div
                  key={task.id}
                  draggable
                  onDragStart={() => handleDragStart(task)}
                  className={`bg-white border border-gray-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-all cursor-pointer ${
                    selectedTasks.includes(task.id) ? "ring-2 ring-blue-500" : ""
                  } ${!canCompleteTask(task) && task.status !== 'DONE' ? 'opacity-60' : ''}`}
                  whileHover={{ scale: 1.02 }}
                  transition={{ type: "spring", stiffness: 400, damping: 10 }}
                  onClick={(e) => {
                    if (e.ctrlKey || e.metaKey) {
                      setSelectedTasks((prev) =>
                        prev.includes(task.id)
                          ? prev.filter((id) => id !== task.id)
                          : [...prev, task.id],
                      )
                    } else {
                      setSelectedTask(task)
                    }
                  }}
                >
                  {/* Task Header */}
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="font-medium text-gray-900 line-clamp-2 flex-1">{task.title}</h3>
                    <div className="flex items-center space-x-1 ml-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          setEditingTask(task)
                        }}
                        className="p-1 text-gray-400 hover:text-blue-600 rounded-full hover:bg-blue-50 transition-colors"
                      >
                        <Edit2 size={14} />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          deleteTask(task.id)
                        }}
                        className="p-1 text-gray-400 hover:text-red-600 rounded-full hover:bg-red-50 transition-colors"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>

                  {/* Task Description */}
                  {task.description && (
                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">{task.description}</p>
                  )}

                  {/* Progress Bar */}
                  {task.status !== "TODO" && (
                    <div className="mb-3">
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-gray-500">Progress</span>
                        <span className="text-gray-700 font-medium">{getTaskProgress(task)}%</span>
                      </div>
                      <div className="w-full bg-gray-100 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full transition-all duration-300 ${
                            task.status === "DONE"
                              ? "bg-green-500"
                              : task.status === "REVIEW"
                                ? "bg-purple-500"
                                : "bg-blue-500"
                          }`}
                          style={{ width: `${getTaskProgress(task)}%` }}
                        ></div>
                      </div>
                    </div>
                  )}

                  {/* Task Tags */}
                  {task.tags && task.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-3">
                      {task.tags.slice(0, 3).map((tag, tagIndex) => (
                        <span
                          key={tagIndex}
                          className="inline-flex items-center px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full"
                        >
                          <Tag size={10} className="mr-1" />
                          {tag}
                        </span>
                      ))}
                      {task.tags.length > 3 && (
                        <span className="text-xs text-gray-500">+{task.tags.length - 3} more</span>
                      )}
                    </div>
                  )}

                  {/* Task Metadata */}
                  <div className="flex flex-wrap gap-2 mb-3">
                    {/* Priority Badge */}
                    <span
                      className={`text-xs px-2 py-1 rounded-full border ${TaskPriorities[task.priority]?.color || TaskPriorities.MEDIUM.color}`}
                    >
                      {TaskPriorities[task.priority]?.label || "Medium"}
                    </span>

                    {/* Overdue Indicator */}
                    {isTaskOverdue(task) && (
                      <span className="inline-flex items-center text-xs px-2 py-1 bg-red-100 text-red-700 rounded-full">
                        <AlertCircle size={10} className="mr-1" />
                        Overdue
                      </span>
                    )}
                  </div>

                  {/* Task Footer */}
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <div className="flex items-center space-x-3">
                      {task.assignee && (
                        <span className="flex items-center">
                          <User size={12} className="mr-1" />
                          {task.assignee}
                        </span>
                      )}
                      {task.category && (
                        <span className="flex items-center">
                          <Tag size={12} className="mr-1" />
                          {TaskCategories[task.category as keyof typeof TaskCategories]?.label || task.category}
                        </span>
                      )}
                    </div>
                    
                    {task.dueDate && (
                      <span className={`flex items-center ${isTaskOverdue(task) ? "text-red-600" : ""}`}>
                        <Calendar size={12} className="mr-1" />
                        {new Date(task.dueDate).toLocaleDateString()}
                      </span>
                    )}
                  </div>

                  {/* Time Tracking */}
                  {(task.estimatedHours || task.actualHours) && (
                    <div className="mt-2 pt-2 border-t border-gray-100">
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        {task.estimatedHours && (
                          <span className="flex items-center">
                            <Clock size={10} className="mr-1" />
                            Est: {task.estimatedHours}h
                          </span>
                        )}
                        {task.actualHours && (
                          <span className="flex items-center">
                            <Clock size={10} className="mr-1" />
                            Actual: {task.actualHours}h
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      ))}
    </motion.div>
  );
};

export default TaskKanbanView;