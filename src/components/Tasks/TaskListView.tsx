import React from 'react';
import { motion } from 'framer-motion';
import { Edit2, Trash2, User, Calendar, Tag } from 'lucide-react';
import { Task } from '../../types/task';

interface TaskListViewProps {
  filteredTasks: Task[];
  selectedTasks: string[];
  setSelectedTasks: React.Dispatch<React.SetStateAction<string[]>>;
  setEditingTask: React.Dispatch<React.SetStateAction<Task | null>>;
  deleteTask: (taskId: string) => void;
  getTaskProgress: (task: Task) => number;
  isTaskOverdue: (task: Task) => boolean;
}

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

const TaskStatuses = {
  TODO: {
    label: 'To Do',
    color: 'bg-gray-500 text-white'
  },
  IN_PROGRESS: {
    label: 'In Progress',
    color: 'bg-blue-500 text-white'
  },
  REVIEW: {
    label: 'Review',
    color: 'bg-purple-500 text-white'
  },
  DONE: {
    label: 'Done',
    color: 'bg-green-500 text-white'
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

export const TaskListView: React.FC<TaskListViewProps> = ({
  filteredTasks,
  selectedTasks,
  setSelectedTasks,
  setEditingTask,
  deleteTask,
  getTaskProgress,
  isTaskOverdue
}) => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100">
      <div className="p-4 border-b border-gray-100">
        <h2 className="font-semibold text-gray-900">Task List</h2>
      </div>
      <div className="divide-y divide-gray-100">
        {filteredTasks.map((task) => (
          <motion.div
            key={task.id}
            className={`p-4 hover:bg-gray-50 transition-colors ${
              selectedTasks.includes(task.id) ? "bg-blue-50" : ""
            }`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            onClick={(e) => {
              if (e.ctrlKey || e.metaKey) {
                setSelectedTasks((prev) =>
                  prev.includes(task.id) ? prev.filter((id) => id !== task.id) : [...prev, task.id],
                )
              }
            }}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4 flex-1">
                <input
                  type="checkbox"
                  checked={selectedTasks.includes(task.id)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSelectedTasks((prev) => [...prev, task.id])
                    } else {
                      setSelectedTasks((prev) => prev.filter((id) => id !== task.id))
                    }
                  }}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />

                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-1">
                    <h3 className="font-medium text-gray-900">{task.title}</h3>
                    <span
                      className={`text-xs px-2 py-1 rounded-full border ${TaskPriorities[task.priority]?.color || TaskPriorities.MEDIUM.color}`}
                    >
                      {TaskPriorities[task.priority]?.label || "Medium"}
                    </span>
                    <span
                      className={`text-xs px-2 py-1 rounded-full ${TaskStatuses[task.status]?.color || TaskStatuses.TODO.color}`}
                    >
                      {TaskStatuses[task.status]?.label || "To Do"}
                    </span>
                  </div>

                  {task.description && <p className="text-sm text-gray-600 mb-2">{task.description}</p>}

                  <div className="flex items-center space-x-4 text-xs text-gray-500">
                    {task.assignee && (
                      <span className="flex items-center">
                        <User size={12} className="mr-1" />
                        {task.assignee}
                      </span>
                    )}
                    {task.dueDate && (
                      <span className={`flex items-center ${isTaskOverdue(task) ? "text-red-600" : ""}`}>
                        <Calendar size={12} className="mr-1" />
                        {new Date(task.dueDate).toLocaleDateString()}
                      </span>
                    )}
                    {task.category && (
                      <span className="flex items-center">
                        <Tag size={12} className="mr-1" />
                        {TaskCategories[task.category as keyof typeof TaskCategories]?.label || task.category}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                {/* Progress Indicator */}
                <div className="w-16 h-2 bg-gray-100 rounded-full">
                  <div
                    className={`h-2 rounded-full transition-all duration-300 ${
                      task.status === "DONE"
                        ? "bg-green-500"
                        : task.status === "REVIEW"
                          ? "bg-purple-500"
                          : task.status === "IN_PROGRESS"
                            ? "bg-blue-500"
                            : "bg-gray-300"
                    }`}
                    style={{ width: `${getTaskProgress(task)}%` }}
                  ></div>
                </div>

                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    setEditingTask(task)
                  }}
                  className="p-2 text-gray-400 hover:text-blue-600 rounded-full hover:bg-blue-50 transition-colors"
                >
                  <Edit2 size={16} />
                </button>

                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    deleteTask(task.id)
                  }}
                  className="p-2 text-gray-400 hover:text-red-600 rounded-full hover:bg-red-50 transition-colors"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default TaskListView;