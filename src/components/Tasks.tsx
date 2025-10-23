import * as React from 'react';
import { memo } from 'react';
import { CheckCircle2 } from 'lucide-react';

const Tasks = memo(() => {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
          <div className="flex items-center space-x-4">
            <div className="p-2 bg-blue-100 rounded-lg">
              <CheckCircle2 className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Task Management</h1>
              <p className="text-gray-500 mt-1">Organize and track your project tasks</p>
            </div>
          </div>
        </div>
      </div>
      <div className="p-6">
        <p className="text-gray-600">Tasks component is being rebuilt...</p>
      </div>
    </div>
  );
});

export default Tasks;
