
import React from 'react';
import { User, View } from '../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface DashboardProps {
  user: User;
  onNavigate: (view: View) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ user, onNavigate }) => {
  const chartData = [
    { name: 'Your Score', value: user.progress.averageScore },
    { name: 'Target', value: 90 },
    { name: 'Peer Avg', value: 72 },
  ];

  const COLORS = ['#4f46e5', '#10b981', '#94a3b8'];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <h3 className="text-slate-500 font-medium">Average Score</h3>
          <div className="flex items-end space-x-2 mt-2">
            <span className="text-4xl font-bold text-slate-800">{Math.round(user.progress.averageScore)}%</span>
            <span className={`text-sm mb-1 ${user.progress.averageScore > 75 ? 'text-green-500' : 'text-orange-500'}`}>
              {user.progress.averageScore > 75 ? 'Excellent' : 'Improving'}
            </span>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <h3 className="text-slate-500 font-medium">Quizzes Completed</h3>
          <div className="flex items-end space-x-2 mt-2">
            <span className="text-4xl font-bold text-slate-800">{user.progress.totalQuizzes}</span>
            <span className="text-sm text-slate-400 mb-1">Total sessions</span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-indigo-100 bg-gradient-to-br from-indigo-50 to-white shadow-sm flex flex-col justify-between">
          <h3 className="text-indigo-600 font-medium">Weak Topics</h3>
          <div className="mt-2 flex flex-wrap gap-2">
            {user.progress.weakTopics.length > 0 ? (
              user.progress.weakTopics.map((topic, i) => (
                <span key={i} className="px-2 py-1 bg-white border border-indigo-200 text-indigo-700 text-xs rounded-lg font-medium">
                  {topic}
                </span>
              ))
            ) : (
              <span className="text-slate-400 text-sm">No weak topics found!</span>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
          <h3 className="text-xl font-bold mb-6">Performance Comparison</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-xl font-bold">Quick Actions</h3>
          <button onClick={() => onNavigate('chat')} className="w-full flex items-center p-4 bg-white hover:bg-indigo-50 border border-slate-200 hover:border-indigo-200 rounded-2xl transition-all group">
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center text-2xl mr-4 group-hover:scale-110 transition-transform">🤖</div>
            <div className="text-left">
              <h4 className="font-bold">Ask AI a Question</h4>
              <p className="text-slate-500 text-sm">Get instant help with any topic</p>
            </div>
          </button>
          
          <button onClick={() => onNavigate('quiz')} className="w-full flex items-center p-4 bg-white hover:bg-emerald-50 border border-slate-200 hover:border-emerald-200 rounded-2xl transition-all group">
            <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center text-2xl mr-4 group-hover:scale-110 transition-transform">📝</div>
            <div className="text-left">
              <h4 className="font-bold">Generate Quiz</h4>
              <p className="text-slate-500 text-sm">Test your knowledge on any topic</p>
            </div>
          </button>

          <button onClick={() => onNavigate('planner')} className="w-full flex items-center p-4 bg-white hover:bg-orange-50 border border-slate-200 hover:border-orange-200 rounded-2xl transition-all group">
            <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center text-2xl mr-4 group-hover:scale-110 transition-transform">📅</div>
            <div className="text-left">
              <h4 className="font-bold">Create Study Plan</h4>
              <p className="text-slate-500 text-sm">Organize your preparation schedule</p>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
