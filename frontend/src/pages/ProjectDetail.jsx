import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Users, UserMinus } from 'lucide-react';
import api from '../api/axiosConfig';
import Layout from '../components/Layout';
import TaskCard from '../components/TaskCard';
import Spinner from '../components/Spinner';
import CreateTaskModal from '../components/CreateTaskModal';
import toast from 'react-hot-toast';

const ProjectDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isCreateTaskOpen, setIsCreateTaskOpen] = useState(false);
  const [filterStatus, setFilterStatus] = useState('all');

  const userStr = localStorage.getItem('user');
  const isAdmin = userStr && JSON.parse(userStr).role === 'admin';

  useEffect(() => {
    fetchProjectDetail();
  }, [id]);

  const fetchProjectDetail = async () => {
    try {
      const response = await api.get(`/projects/${id}`);
      if (response.data.success) {
        setProject(response.data.data);
      }
    } catch (error) {
      toast.error('Failed to load project details');
      navigate('/projects');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (taskId, newStatus) => {
    try {
      await api.put(`/tasks/${taskId}`, { status: newStatus });
      toast.success('Task status updated');
      fetchProjectDetail();
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  const handleDeleteTask = async (taskId) => {
    if (!window.confirm('Are you sure you want to delete this task?')) return;
    try {
      await api.delete(`/tasks/${taskId}`);
      toast.success('Task deleted');
      fetchProjectDetail();
    } catch (error) {
      toast.error('Failed to delete task');
    }
  };

  const handleRemoveMember = async (userId) => {
    if (!window.confirm('Remove this member from the project?')) return;
    try {
      await api.delete(`/projects/${id}/members/${userId}`);
      toast.success('Member removed');
      fetchProjectDetail();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to remove member');
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-64"><Spinner size="lg" /></div>
      </Layout>
    );
  }

  if (!project) return null;

  const totalTasks = project.tasks?.length || 0;
  const completedTasks = project.tasks?.filter(t => t.status === 'completed').length || 0;
  const progress = totalTasks === 0 ? 0 : Math.round((completedTasks / totalTasks) * 100);

  const filteredTasks = project.tasks?.filter(t => filterStatus === 'all' || t.status === filterStatus) || [];

  return (
    <Layout>
      <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <button 
          onClick={() => navigate('/projects')}
          className="flex items-center text-sm font-medium text-gray-500 hover:text-indigo-600 transition-colors mb-2"
        >
          <ArrowLeft size={16} className="mr-1" /> Back to Projects
        </button>
        
        <div className="bg-white p-6 md:p-8 rounded-xl shadow-sm border border-gray-200">
          <div className="flex flex-col md:flex-row justify-between md:items-start gap-4">
            <div className="flex-1">
              <h1 className="text-3xl font-extrabold text-gray-900 mb-2">{project.name}</h1>
              <p className="text-gray-600 mb-6">{project.description || 'No description provided.'}</p>
              
              <div className="flex items-center text-sm text-gray-600 mb-4">
                Deadline: <span className="font-semibold text-gray-900 ml-1">{new Date(project.deadline).toLocaleDateString()}</span>
              </div>
            </div>
            
            <div className="w-full md:w-64 bg-gray-50 p-4 rounded-lg border border-gray-100">
              <div className="flex justify-between text-sm font-medium mb-2">
                <span className="text-gray-700">Project Progress</span>
                <span className="text-indigo-600">{progress}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div 
                  className="bg-indigo-600 h-2.5 rounded-full transition-all duration-500" 
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
              <p className="text-xs text-center text-gray-500 mt-2">{completedTasks} of {totalTasks} tasks completed</p>
            </div>
          </div>
        </div>

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Members Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <Users size={18} className="text-indigo-500" /> Team Members
                </h3>
                {isAdmin && (
                  <button className="text-indigo-600 hover:text-indigo-700 text-sm font-medium flex items-center">
                    <Plus size={16} className="mr-0.5" /> Add
                  </button>
                )}
              </div>
              
              <div className="space-y-3">
                {project.members?.map(member => (
                  <div key={member.id} className="flex justify-between items-center p-2 hover:bg-gray-50 rounded-lg group transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-sm">
                        {member.name.charAt(0)}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">{member.name}</p>
                        <p className="text-xs text-gray-500 capitalize">{member.role}</p>
                      </div>
                    </div>
                    {isAdmin && project.owner_id !== member.id && (
                      <button 
                        onClick={() => handleRemoveMember(member.id)}
                        className="text-gray-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-all"
                        title="Remove member"
                      >
                        <UserMinus size={16} />
                      </button>
                    )}
                    {project.owner_id === member.id && (
                      <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded border border-gray-200">Owner</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Tasks Main Area */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <h3 className="text-xl font-bold text-gray-900">Project Tasks</h3>
              <div className="flex items-center gap-3">
                <select 
                  className="bg-white px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-indigo-500 focus:border-indigo-500 outline-none shadow-sm"
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                >
                  <option value="all">All Tasks</option>
                  <option value="pending">Pending</option>
                  <option value="in_progress">In Progress</option>
                  <option value="completed">Completed</option>
                </select>
                
                {isAdmin && (
                  <button 
                    onClick={() => setIsCreateTaskOpen(true)}
                    className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm"
                  >
                    <Plus size={16} /> Add Task
                  </button>
                )}
              </div>
            </div>

            {filteredTasks.length === 0 ? (
              <div className="bg-white border border-dashed border-gray-300 rounded-xl p-12 text-center">
                <p className="text-gray-500 font-medium">No tasks found in this project.</p>
                {isAdmin && (
                  <button 
                    onClick={() => setIsCreateTaskOpen(true)}
                    className="mt-3 text-indigo-600 hover:text-indigo-700 font-medium text-sm flex items-center justify-center gap-1 mx-auto"
                  >
                    <Plus size={16} /> Create one now
                  </button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredTasks.map(task => (
                  <TaskCard 
                    key={task.id} 
                    task={task} 
                    isAdmin={isAdmin}
                    onStatusChange={handleStatusChange}
                    onDelete={handleDeleteTask}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {isCreateTaskOpen && (
        <CreateTaskModal 
          projectId={project.id}
          members={project.members}
          onClose={() => setIsCreateTaskOpen(false)}
          onSuccess={fetchProjectDetail}
        />
      )}
    </Layout>
  );
};

export default ProjectDetail;
