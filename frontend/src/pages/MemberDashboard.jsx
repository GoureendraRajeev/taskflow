import React, { useState, useEffect } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip as RechartsTooltip
} from 'recharts';
import { 
  CheckSquare, CheckCircle, Clock, AlertCircle, Calendar
} from 'lucide-react';
import api from '../api/axiosConfig';
import Layout from '../components/Layout';
import StatCard from '../components/StatCard';
import Spinner from '../components/Spinner';

const MemberDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const response = await api.get('/dashboard/member');
        if (response.data.success) {
          setData(response.data.data);
        }
      } catch (error) {
        console.error('Failed to fetch dashboard data', error);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  if (loading) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-64">
          <Spinner size="lg" />
        </div>
      </Layout>
    );
  }

  if (!data) return <Layout><div>Failed to load dashboard.</div></Layout>;

  const { stats, projects, upcoming_deadlines, tasks_completed_per_day } = data;

  return (
    <Layout>
      <div className="space-y-6 animate-fade-in">
        <h1 className="text-2xl font-bold text-gray-900">My Dashboard</h1>

        {/* Section 1: Stat Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard icon={CheckSquare} label="My Total Tasks" value={stats.total_tasks} colorClass="bg-blue-500 text-blue-500" />
          <StatCard icon={CheckCircle} label="Completed" value={stats.completed_tasks} colorClass="bg-green-500 text-green-500" />
          <StatCard icon={Clock} label="In Progress" value={stats.in_progress_tasks} colorClass="bg-yellow-500 text-yellow-500" />
          <StatCard icon={AlertCircle} label="Overdue" value={stats.overdue_tasks} colorClass="bg-red-500 text-red-500" />
        </div>

        {/* Section 3 & 4 & 5 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">My Projects Progress</h3>
            <div className="space-y-4 overflow-y-auto max-h-64 pr-2">
              {projects.map((proj, i) => (
                <div key={i}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="font-medium text-gray-800">{proj.project_name}</span>
                    <span className="text-gray-500">{proj.completed_tasks}/{proj.total_tasks} tasks ({proj.completion_percentage}%)</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-indigo-600 h-2 rounded-full" 
                      style={{ width: `${proj.completion_percentage}%` }}
                    ></div>
                  </div>
                </div>
              ))}
              {projects.length === 0 && <div className="text-sm text-gray-500 text-center py-4">No projects assigned</div>}
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Calendar className="text-indigo-500" size={20} /> My Upcoming Deadlines
            </h3>
            <div className="space-y-3 overflow-y-auto max-h-64 pr-2">
              {upcoming_deadlines.map((task, i) => {
                const daysUntil = Math.ceil((new Date(task.due_date) - new Date()) / (1000 * 60 * 60 * 24));
                let colorClass = 'bg-green-100 text-green-800 border-green-200';
                if (daysUntil <= 2) colorClass = 'bg-yellow-100 text-yellow-800 border-yellow-200';
                if (daysUntil <= 0) colorClass = 'bg-red-100 text-red-800 border-red-200';
                
                return (
                  <div key={i} className="flex justify-between items-center p-3 hover:bg-gray-50 rounded-lg border border-gray-100 transition-colors">
                    <div>
                      <p className="font-medium text-sm text-gray-900">{task.title}</p>
                      <p className="text-xs text-gray-500">{task.project_name}</p>
                    </div>
                    <span className={`px-2 py-1 rounded text-xs font-medium border ${colorClass}`}>
                      {daysUntil < 0 ? 'Overdue' : daysUntil === 0 ? 'Today' : `In ${daysUntil}d`}
                    </span>
                  </div>
                )
              })}
              {upcoming_deadlines.length === 0 && <div className="text-sm text-gray-500 text-center py-4">No upcoming deadlines</div>}
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 col-span-1 lg:col-span-2">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Completed Tasks This Week</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={tasks_completed_per_day}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="day" />
                  <YAxis allowDecimals={false} />
                  <RechartsTooltip />
                  <Bar dataKey="count" fill="#6366f1" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

        </div>
      </div>
    </Layout>
  );
};

export default MemberDashboard;
