import React from 'react';
import { Calendar, User, Trash2, Edit } from 'lucide-react';
import PriorityBadge from './PriorityBadge';
import StatusBadge from './StatusBadge';

const TaskCard = ({ task, isAdmin, onStatusChange, onDelete }) => {
  const isOverdue = task.is_overdue || (new Date(task.due_date) < new Date() && task.status !== 'completed');

  return (
    <div className={`bg-white rounded-xl shadow-sm border-l-4 border-y border-r border-gray-200 hover:shadow-md transition-all flex flex-col h-full
      ${task.priority === 'high' ? 'border-l-red-500' : task.priority === 'medium' ? 'border-l-yellow-500' : 'border-l-green-500'}
    `}>
      <div className="p-5 flex-1">
        <div className="flex justify-between items-start mb-3">
          <PriorityBadge priority={task.priority} />
          <div className="flex items-center gap-2">
            <StatusBadge status={task.status} />
            {isAdmin && onDelete && (
              <button onClick={() => onDelete(task.id)} className="text-gray-400 hover:text-red-600 transition-colors">
                <Trash2 size={16} />
              </button>
            )}
          </div>
        </div>
        
        <h3 className="text-lg font-bold text-gray-900 mb-2 leading-tight">{task.title}</h3>
        {task.description && (
          <p className="text-sm text-gray-500 mb-4 line-clamp-2">{task.description}</p>
        )}
        
        <div className="space-y-2 mt-auto pt-4 border-t border-gray-100">
          {task.project_name && (
            <div className="text-xs font-medium text-indigo-600 bg-indigo-50 px-2 py-1 rounded inline-block mb-1">
              {task.project_name}
            </div>
          )}
          
          <div className="flex items-center justify-between text-sm">
            <div className={`flex items-center gap-1.5 ${isOverdue ? 'text-red-600 font-medium' : 'text-gray-500'}`}>
              <Calendar size={14} />
              {new Date(task.due_date).toLocaleDateString()}
            </div>
            
            {isAdmin && task.assigned_to_name && (
              <div className="flex items-center gap-1.5 text-gray-600">
                <User size={14} />
                <span className="truncate max-w-[100px]">{task.assigned_to_name}</span>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Quick Status Toggles */}
      <div className="px-5 py-3 bg-gray-50 rounded-b-xl border-t border-gray-100 flex gap-2">
        <button 
          onClick={() => onStatusChange(task.id, 'pending')}
          className={`flex-1 py-1.5 text-xs font-medium rounded transition-colors ${task.status === 'pending' ? 'bg-yellow-100 text-yellow-800 border border-yellow-200' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-100'}`}
        >
          Pending
        </button>
        <button 
          onClick={() => onStatusChange(task.id, 'in_progress')}
          className={`flex-1 py-1.5 text-xs font-medium rounded transition-colors ${task.status === 'in_progress' ? 'bg-blue-100 text-blue-800 border border-blue-200' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-100'}`}
        >
          In Progress
        </button>
        <button 
          onClick={() => onStatusChange(task.id, 'completed')}
          className={`flex-1 py-1.5 text-xs font-medium rounded transition-colors ${task.status === 'completed' ? 'bg-green-100 text-green-800 border border-green-200' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-100'}`}
        >
          Completed
        </button>
      </div>
    </div>
  );
};

export default TaskCard;
