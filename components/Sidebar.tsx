
import React from 'react';
import { View } from '../types';

interface SidebarProps {
  currentView: View;
  setView: (view: View) => void;
  onLogout: () => void;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ currentView, setView, onLogout, isOpen, setIsOpen }) => {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: '📊' },
    { id: 'chat', label: 'Doubt Solver', icon: '🤖' },
    { id: 'quiz', label: 'Quiz Gen', icon: '📝' },
    { id: 'summarizer', label: 'Summarizer', icon: '📄' },
    { id: 'planner', label: 'Planner', icon: '📅' },
  ];

  return (
    <aside className={`fixed h-full bg-white border-r border-slate-200 transition-all duration-300 z-20 ${isOpen ? 'w-64' : 'w-20'}`}>
      <div className="p-6 flex items-center space-x-3">
        <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold shrink-0">V</div>
        {isOpen && <span className="font-bold text-lg">Veda AI</span>}
      </div>

      <nav className="mt-8 px-4 space-y-2">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setView(item.id as View)}
            className={`w-full flex items-center p-3 rounded-xl transition-colors ${
              currentView === item.id 
                ? 'bg-indigo-50 text-indigo-700 border border-indigo-100' 
                : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            <span className="text-xl shrink-0">{item.icon}</span>
            {isOpen && <span className="ml-3 font-medium">{item.label}</span>}
          </button>
        ))}
      </nav>

      <div className="absolute bottom-8 left-0 w-full px-4">
        <button
          onClick={onLogout}
          className="w-full flex items-center p-3 text-red-500 hover:bg-red-50 rounded-xl transition-colors"
        >
          <span className="text-xl shrink-0">🚪</span>
          {isOpen && <span className="ml-3 font-medium">Logout</span>}
        </button>
        
        <button 
          onClick={() => setIsOpen(!isOpen)}
          className="mt-4 w-full flex items-center justify-center p-2 text-slate-400 hover:text-slate-600"
        >
          {isOpen ? '◀' : '▶'}
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
