
import React, { useState, useEffect } from 'react';
import { User, View } from './types';
import Sidebar from './components/Sidebar';
import AuthView from './components/AuthView';
import Dashboard from './components/Dashboard';
import ChatInterface from './components/ChatInterface';
import QuizModule from './components/QuizModule';
import SummarizerModule from './components/SummarizerModule';
import StudyPlanner from './components/StudyPlanner';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [currentView, setCurrentView] = useState<View>('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // Persistence logic
  useEffect(() => {
    const savedUser = localStorage.getItem('edumind_user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  const handleLogin = (userData: User) => {
    setUser(userData);
    localStorage.setItem('edumind_user', JSON.stringify(userData));
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('edumind_user');
  };

  const updateProgress = (quizScore: number, topic: string) => {
    if (!user) return;
    const newProgress = { ...user.progress };
    newProgress.totalQuizzes += 1;
    newProgress.averageScore = (newProgress.averageScore * (newProgress.totalQuizzes - 1) + quizScore) / newProgress.totalQuizzes;
    
    if (quizScore < 60 && !newProgress.weakTopics.includes(topic)) {
      newProgress.weakTopics.push(topic);
    } else if (quizScore >= 80) {
      newProgress.weakTopics = newProgress.weakTopics.filter(t => t !== topic);
    }

    const updatedUser = { ...user, progress: newProgress };
    setUser(updatedUser);
    localStorage.setItem('edumind_user', JSON.stringify(updatedUser));
  };

  if (!user) {
    return <AuthView onLogin={handleLogin} />;
  }

  const renderContent = () => {
    switch (currentView) {
      case 'dashboard':
        return <Dashboard user={user} onNavigate={setCurrentView} />;
      case 'chat':
        return <ChatInterface />;
      case 'quiz':
        return <QuizModule onComplete={updateProgress} />;
      case 'summarizer':
        return <SummarizerModule />;
      case 'planner':
        return <StudyPlanner />;
      default:
        return <Dashboard user={user} onNavigate={setCurrentView} />;
    }
  };

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      <Sidebar 
        currentView={currentView} 
        setView={setCurrentView} 
        onLogout={handleLogout}
        isOpen={isSidebarOpen}
        setIsOpen={setIsSidebarOpen}
      />
      
      <main className={`flex-1 transition-all duration-300 relative overflow-y-auto ${isSidebarOpen ? 'ml-64' : 'ml-20'}`}>
        <header className="sticky top-0 z-10 glass border-b border-slate-200 px-8 py-4 flex justify-between items-center">
          <h1 className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-blue-500 bg-clip-text text-transparent">
            {currentView.charAt(0).toUpperCase() + currentView.slice(1)}
          </h1>
          <div className="flex items-center space-x-4">
            <span className="text-sm text-slate-500">Welcome, {user.name}</span>
            <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold border border-indigo-200">
              {user.name.charAt(0)}
            </div>
          </div>
        </header>

        <div className="p-8 max-w-6xl mx-auto">
          {renderContent()}
        </div>
      </main>
    </div>
  );
};

export default App;
