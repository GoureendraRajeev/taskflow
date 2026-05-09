import React from 'react';
import { Link } from 'react-router-dom';
import { Users, CheckSquare, Calendar, Edit, Trash2, ArrowRight } from 'lucide-react';

const ProjectCard = ({ project, isAdmin, onEdit, onDelete }) => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow flex flex-col h-full overflow-hidden">
      <div className="p-5 flex-1">
        <div className="flex justify-between items-start mb-3">
          <h3 className="text-xl font-bold text-gray-900 truncate pr-2">{project.name}</h3>
          {isAdmin && (
            <div className="flex gap-2">
              <button onClick={() => onEdit(project)} className="text-gray-400 hover:text-indigo-600 transition-colors">
                <Edit size={16} />
              </button>
              <button onClick={() => onDelete(project.id)} className="text-gray-400 hover:text-red-600 transition-colors">
                <Trash2 size={16} />
              </button>
            </div>
          )}
        </div>
        
        <p className="text-sm text-gray-500 mb-5 line-clamp-2 min-h-[40px]">
          {project.description || 'No description provided.'}
        </p>
        
        <div className="space-y-3 mb-6">
          <div className="flex items-center text-sm text-gray-600">
            <Calendar size={14} className="mr-2 text-indigo-500" />
            Deadline: <span className="font-medium ml-1 text-gray-900">{new Date(project.deadline).toLocaleDateString()}</span>
          </div>
          <div className="flex items-center text-sm text-gray-600">
            <Users size={14} className="mr-2 text-indigo-500" />
            Members: <span className="font-medium ml-1 text-gray-900">{project.member_count || 1}</span>
          </div>
          <div className="flex items-center text-sm text-gray-600">
            <CheckSquare size={14} className="mr-2 text-indigo-500" />
            Tasks: <span className="font-medium ml-1 text-gray-900">{project.total_task_count || 0}</span>
          </div>
        </div>

        <div className="mt-auto">
          <div className="flex justify-between text-xs font-medium mb-1">
            <span className="text-gray-600">Progress</span>
            <span className="text-indigo-600">{project.completion_percentage || 0}%</span>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-2">
            <div 
              className="bg-indigo-600 h-2 rounded-full transition-all duration-500" 
              style={{ width: `${project.completion_percentage || 0}%` }}
            ></div>
          </div>
        </div>
      </div>
      
      <div className="bg-gray-50 border-t border-gray-100 p-3">
        <Link 
          to={`/projects/${project.id}`}
          className="w-full flex items-center justify-center gap-2 py-2 px-4 rounded-lg font-medium text-indigo-700 bg-indigo-50 hover:bg-indigo-100 transition-colors"
        >
          View Project <ArrowRight size={16} />
        </Link>
      </div>
    </div>
  );
};

export default ProjectCard;
