import React from 'react';
import { ArrowLeft, User, Calendar, Tag, Clock, AlertCircle } from 'lucide-react';
import { Task } from '../../types/task';

interface TaskRecentViewProps {
  recentTasks: Task[];
  setViewMode: React.Dispatch<React.SetStateAction<'kanban' | 'list' | 'calendar' | 'recent'>>;
  isTaskOverdue: (task: Task) => boolean;
  getTaskProgress: (task: Task) => number;
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

export const TaskRecentView: React.FC<TaskRecentViewProps> = ({
  recentTasks,
  setViewMode,
  isTaskOverdue,
  getTaskProgress
}) => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100">
      <div className="p-6 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setViewMode('kanban')}
              className="flex items-center px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft size={16} className="mr-2" />
              Back to Todo List
            </button>
          </div>
          <h2 className="text-lg font-semibold text-gray-900">Recent Tasks</h2>
        </div>
      </div>
      
      <div className="p-6">
        <div className="space-y-4">
          {recentTasks.map((task) => (
            <div
              key={task.id}
              className="bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className="font-medium text-gray-900">{task.title}</h3>
                    <span
                      className={`text-xs px-2 py-1 rounded-full ${TaskStatuses[task.status]?.color || TaskStatuses.TODO.color}`}
                    >
                      {TaskStatuses[task.status]?.label || "To Do"}
                    </span>
                    <span
                      className={`text-xs px-2 py-1 rounded-full border ${TaskPriorities[task.priority]?.color || TaskPriorities.MEDIUM.color}`}
                    >
                      {TaskPriorities[task.priority]?.label || "Medium"}
                    </span>
                    {isTaskOverdue(task) && (
                      <span className="inline-flex items-center text-xs px-2 py-1 bg-red-100 text-red-700 rounded-full">
                        <AlertCircle size={10} className="mr-1" />
                        Overdue
                      </span>
                    )}
                  </div>
                  
                  {task.description && (
                    <p className="text-sm text-gray-600 mb-3">{task.description}</p>
                  )}
                  
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
                    <span className="flex items-center">
                      <Clock size={12} className="mr-1" />
                      Updated {task.updatedAt ? new Date(task.updatedAt).toLocaleDateString() : 'N/A'}
                    </span>
                  </div>
                </div>
              </div>
              
              {/* Progress Bar */}
              {task.status !== "TODO" && (
                <div className="mt-3">
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-gray-500">Progress</span>
                    <span className="text-gray-700 font-medium">{getTaskProgress(task)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
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
              
              {/* Tags */}
              {task.tags && task.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-3">
                  {task.tags.map((tag, tagIndex) => (
                    <span
                      key={tagIndex}
                      className="inline-flex items-center px-2 py-1 bg-white text-gray-700 text-xs rounded-full border"
                    >
                      <Tag size={10} className="mr-1" />
                      {tag}
                    </span>
                  ))}
                </div>
              )}
              
              {/* Time Tracking */}
              {(task.estimatedHours || task.actualHours) && (
                <div className="mt-3 pt-3 border-t border-gray-200">
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    {task.estimatedHours && (
                      <span className="flex items-center">
                        <Clock size={10} className="mr-1" />
                        Estimated: {task.estimatedHours}h
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
            </div>
          ))}
          
          {recentTasks.length === 0 && (
            <div className="text-center py-12">
              <Clock className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Recent Tasks</h3>
              <p className="text-gray-500">Tasks you've worked on recently will appear here.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TaskRecentView;