import React from 'react';
import { Plus, Clock, Play, CheckCircle } from 'lucide-react';
import { TaskItem } from '../page';

interface TaskListProps {
  tasks: TaskItem[];
  onAdd: () => void;
}

export default function TaskList({ tasks, onAdd }: TaskListProps) {
  const getStatusIcon = (status: TaskItem['status']) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-600" />;
      case 'in-progress':
        return <Play className="h-4 w-4 text-blue-600" />;
      case 'done':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      default:
        return <Clock className="h-4 w-4 text-gray-600" />;
    }
  };

  const getStatusColor = (status: TaskItem['status']) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'in-progress':
        return 'bg-blue-100 text-blue-800';
      case 'done':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-md p-5 border-t-4 border-teal-500">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-slate-700 font-semibold">Active Tasks</h3>
        <button
          onClick={onAdd}
          className="px-3 py-1 bg-teal-600 text-white rounded flex items-center gap-2 text-sm"
          aria-label="Add new task"
        >
          <Plus size={14} />
          Add Task
        </button>
      </div>
      <div className="space-y-3">
        {tasks.map((task) => (
          <div key={task.id} className="flex items-center justify-between p-3 border rounded-lg">
            <div className="flex items-center gap-3">
              {getStatusIcon(task.status)}
              <div>
                <p className="font-medium text-gray-900">{task.title}</p>
                <p className="text-sm text-gray-600">{task.location}</p>
              </div>
            </div>
            <div className="text-right">
              <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(task.status)}`}>
                {task.status.replace('-', ' ')}
              </div>
              {task.startedAt && (
                <p className="text-sm text-gray-600 mt-1">Started: {task.startedAt}</p>
              )}
            </div>
          </div>
        ))}
        {tasks.length === 0 && (
          <p className="text-gray-500 text-center py-4">No active tasks</p>
        )}
      </div>
    </div>
  );
}
