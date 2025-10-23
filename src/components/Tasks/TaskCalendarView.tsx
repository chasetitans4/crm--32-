import React from 'react';
import { ChevronLeft, ChevronRight, Calendar, User, Tag, AlertCircle } from 'lucide-react';
import { Task } from '../../types/task';

interface TaskCalendarViewProps {
  tasks: Task[];
  calendarDate: Date;
  setCalendarDate: React.Dispatch<React.SetStateAction<Date>>;
  isTaskOverdue: (task: Task) => boolean;
}

const TaskPriorities = {
  LOW: {
    label: 'Low',
    color: 'bg-green-100 text-green-800'
  },
  MEDIUM: {
    label: 'Medium',
    color: 'bg-yellow-100 text-yellow-800'
  },
  HIGH: {
    label: 'High',
    color: 'bg-orange-100 text-orange-800'
  },
  URGENT: {
    label: 'Urgent',
    color: 'bg-red-100 text-red-800'
  }
};

const TaskStatuses = {
  TODO: {
    label: 'To Do',
    color: 'bg-gray-100 text-gray-800'
  },
  IN_PROGRESS: {
    label: 'In Progress',
    color: 'bg-blue-100 text-blue-800'
  },
  REVIEW: {
    label: 'Review',
    color: 'bg-purple-100 text-purple-800'
  },
  DONE: {
    label: 'Done',
    color: 'bg-green-100 text-green-800'
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

export const TaskCalendarView: React.FC<TaskCalendarViewProps> = ({
  tasks,
  calendarDate,
  setCalendarDate,
  isTaskOverdue
}) => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100">
      <div className="p-6 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Task Calendar</h2>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setCalendarDate(new Date(calendarDate.getFullYear(), calendarDate.getMonth() - 1, 1))}
              className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
            >
              <ChevronLeft size={16} />
            </button>
            <span className="text-sm font-medium text-gray-700 min-w-[120px] text-center">
              {calendarDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            </span>
            <button
              onClick={() => setCalendarDate(new Date(calendarDate.getFullYear(), calendarDate.getMonth() + 1, 1))}
              className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>
      
      <div className="p-6">
        <div className="grid grid-cols-7 gap-2 mb-4">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="text-center text-sm font-medium text-gray-500 py-2">
              {day}
            </div>
          ))}
        </div>
        
        <div className="grid grid-cols-7 gap-2">
          {Array.from({ length: 35 }, (_, i) => {
            const date = new Date(calendarDate.getFullYear(), calendarDate.getMonth(), i - 6)
            const dayTasks = tasks.filter(task => {
              if (!task.dueDate) return false
              const taskDate = new Date(task.dueDate)
              return taskDate.toDateString() === date.toDateString()
            })
            const isCurrentMonth = date.getMonth() === calendarDate.getMonth()
            const isToday = date.toDateString() === new Date().toDateString()
            
            return (
              <div
                key={i}
                className={`min-h-[100px] p-2 border border-gray-100 rounded-lg ${
                  isCurrentMonth ? 'bg-white' : 'bg-gray-50'
                } ${isToday ? 'ring-2 ring-blue-500' : ''}`}
              >
                <div className={`text-sm font-medium mb-1 ${
                  isCurrentMonth ? 'text-gray-900' : 'text-gray-400'
                }`}>
                  {date.getDate()}
                </div>
                
                <div className="space-y-1">
                  {dayTasks.slice(0, 3).map(task => (
                    <div
                      key={task.id}
                      className={`text-xs p-1 rounded truncate cursor-pointer hover:shadow-sm transition-shadow ${
                        TaskStatuses[task.status]?.color || TaskStatuses.TODO.color
                      } ${isTaskOverdue(task) ? 'ring-1 ring-red-400' : ''}`}
                      title={`${task.title} - ${task.assignee || 'Unassigned'}`}
                    >
                      <div className="flex items-center space-x-1">
                        {isTaskOverdue(task) && (
                          <AlertCircle size={8} className="text-red-600 flex-shrink-0" />
                        )}
                        <span className="truncate">{task.title}</span>
                      </div>
                      
                      {task.assignee && (
                        <div className="flex items-center mt-1 text-gray-600">
                          <User size={8} className="mr-1" />
                          <span className="truncate">{task.assignee}</span>
                        </div>
                      )}
                      
                      {task.category && (
                        <div className="flex items-center mt-1 text-gray-600">
                          <Tag size={8} className="mr-1" />
                          <span className="truncate">
                            {TaskCategories[task.category as keyof typeof TaskCategories]?.label || task.category}
                          </span>
                        </div>
                      )}
                    </div>
                  ))}
                  
                  {dayTasks.length > 3 && (
                    <div className="text-xs text-gray-500 text-center py-1">
                      +{dayTasks.length - 3} more
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
        
        {/* Calendar Legend */}
        <div className="mt-6 pt-4 border-t border-gray-100">
          <h3 className="text-sm font-medium text-gray-700 mb-3">Legend</h3>
          <div className="flex flex-wrap gap-4">
            {Object.entries(TaskStatuses).map(([key, status]) => (
              <div key={key} className="flex items-center space-x-2">
                <div className={`w-3 h-3 rounded ${status.color}`}></div>
                <span className="text-xs text-gray-600">{status.label}</span>
              </div>
            ))}
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 rounded border-2 border-red-400"></div>
              <span className="text-xs text-gray-600">Overdue</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 rounded ring-2 ring-blue-500"></div>
              <span className="text-xs text-gray-600">Today</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskCalendarView;