import React, { useState, useEffect } from 'react';
import { 
  PieChart, Pie, Cell, Tooltip as RechartsTooltip, Legend,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer,
  LineChart, Line
} from 'recharts';
import { 
  FolderKanban, Users, CheckCircle, Clock, AlertCircle, 
  Trophy, Calendar, Activity
} from 'lucide-react';
import api from '../api/axiosConfig';
import Layout from '../components/Layout';
import StatCard from '../components/StatCard';
import Spinner from '../components/Spinner';

const AdminDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const response = await api.get('/dashboard/admin');
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

  const {
    stats, task_status_breakdown, project_progress, member_stats,
    top_performers, tasks_completed_per_day, upcoming_deadlines, recent_activity
  } = data;

  const pieData = [
    { name: 'Pending', value: task_status_breakdown.pending, color: '#facc15' },
    { name: 'In Progress', value: task_status_breakdown.in_progress, color: '#60a5fa' },
    { name: 'Completed', value: task_status_breakdown.completed, color: '#4ade80' }
  ];

  const formatTimeAgo = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now - date) / 1000);
    
    let interval = seconds / 31536000;
    if (interval > 1) return Math.floor(interval) + " years ago";
    interval = seconds / 2592000;
    if (interval > 1) return Math.floor(interval) + " months ago";
    interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + " days ago";
    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + " hours ago";
    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + " minutes ago";
    return Math.floor(seconds) + " seconds ago";
  };

  return (
    <Layout>
      <div className="space-y-6 animate-fade-in">
        <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>

        {/* Section 1: Stat Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
          <StatCard icon={FolderKanban} label="Total Projects" value={stats.total_projects} colorClass="bg-blue-500 text-blue-500" />
          <StatCard icon={Users} label="Total Members" value={stats.total_members} colorClass="bg-purple-500 text-purple-500" />
          <StatCard icon={CheckCircle} label="Completed Tasks" value={stats.completed_tasks} colorClass="bg-green-500 text-green-500" />
          <StatCard icon={Clock} label="In Progress" value={stats.in_progress_tasks} colorClass="bg-yellow-500 text-yellow-500" />
          <StatCard icon={AlertCircle} label="Overdue" value={stats.overdue_tasks} colorClass="bg-red-500 text-red-500" />
        </div>

        {/* Section 2: Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Task Status Breakdown</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={pieData} innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <RechartsTooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Project Completion</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={project_progress} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                  <XAxis type="number" domain={[0, 100]} />
                  <YAxis dataKey="project_name" type="category" width={100} tick={{fontSize: 12}} />
                  <RechartsTooltip formatter={(value) => `${value}%`} />
                  <Bar dataKey="completion_percentage" fill="#4f46e5" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Section 3 & 4: Team Performance & Top Performers */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="col-span-2 bg-white p-6 rounded-xl shadow-sm border border-gray-100 overflow-x-auto">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Team Performance</h3>
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Member</th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Assigned</th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Completed</th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">In Progress</th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Overdue</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {member_stats.map((member, i) => (
                  <tr key={i} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">{member.member_name}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-center text-gray-500">{member.assigned_count}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-center text-green-600 font-medium">{member.completed_count}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-center text-blue-600">{member.in_progress_count}</td>
                    <td className={`px-4 py-3 whitespace-nowrap text-sm text-center font-bold ${member.overdue_count > 0 ? 'text-red-600' : 'text-gray-500'}`}>
                      {member.overdue_count}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Trophy className="text-yellow-500" size={20} /> Top Performers
            </h3>
            <div className="space-y-4">
              {top_performers.map((performer, index) => {
                const medalColors = ['bg-yellow-100 text-yellow-700 border-yellow-200', 'bg-gray-100 text-gray-700 border-gray-200', 'bg-orange-100 text-orange-800 border-orange-200'];
                return (
                  <div key={index} className={`flex items-center justify-between p-3 rounded-lg border ${medalColors[index] || 'bg-blue-50 text-blue-800 border-blue-200'}`}>
                    <div className="flex items-center gap-3">
                      <span className="font-bold text-lg">#{index + 1}</span>
                      <span className="font-medium">{performer.name}</span>
                    </div>
                    <div className="text-sm font-semibold">
                      {performer.completed_count} tasks
                    </div>
                  </div>
                )
              })}
              {top_performers.length === 0 && <div className="text-sm text-gray-500 text-center py-4">No data this week</div>}
            </div>
          </div>
        </div>

        {/* Section 6 & 7: Tasks Completed Trend & Deadlines */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Activity className="text-indigo-500" size={20} /> Completed This Week
            </h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={tasks_completed_per_day}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="day" />
                  <YAxis />
                  <RechartsTooltip />
                  <Line type="monotone" dataKey="count" stroke="#6366f1" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Calendar className="text-indigo-500" size={20} /> Upcoming Deadlines
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
                      <p className="text-xs text-gray-500">{task.project_name} • {task.assignee_name || 'Unassigned'}</p>
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
        </div>

        {/* Section 8: Recent Activity */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
          <div className="space-y-4">
            {recent_activity.map((activity, i) => (
              <div key={i} className="flex items-start gap-3">
                <div className="mt-1 w-2 h-2 rounded-full bg-indigo-500 shadow-[0_0_0_4px_rgba(99,102,241,0.1)]"></div>
                <div>
                  <p className="text-sm text-gray-800">{activity.action_text}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{formatTimeAgo(activity.created_at)}</p>
                </div>
              </div>
            ))}
            {recent_activity.length === 0 && <div className="text-sm text-gray-500 py-2">No recent activity</div>}
          </div>
        </div>

      </div>
    </Layout>
  );
};

export default AdminDashboard;
