
import React, { useState } from 'react';
import { User } from '../types';

interface AuthProps {
  onLogin: (user: User) => void;
}

const AuthView: React.FC<AuthProps> = ({ onLogin }) => {
  const [mode, setMode] = useState<'login' | 'register' | 'forgot'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (mode === 'login') {
      if (email && password) {
        // Mock login
        onLogin({
          id: Math.random().toString(36).substr(2, 9),
          name: email.split('@')[0],
          email,
          progress: { totalQuizzes: 0, averageScore: 0, weakTopics: [] }
        });
      } else {
        setError('Please fill in all fields');
      }
    } else if (mode === 'register') {
      if (name && email && password) {
        onLogin({
          id: Math.random().toString(36).substr(2, 9),
          name,
          email,
          progress: { totalQuizzes: 0, averageScore: 0, weakTopics: [] }
        });
      } else {
        setError('Please fill in all fields');
      }
    } else {
      alert('Password reset link sent to your email!');
      setMode('login');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-xl overflow-hidden border border-slate-100">
        <div className="bg-indigo-600 p-8 text-white text-center">
          <h2 className="text-3xl font-bold">Veda AI</h2>
          <p className="mt-2 text-indigo-100 opacity-80">Your Personal AI Learning Partner</p>
        </div>
        
        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <h3 className="text-2xl font-bold text-slate-800">
            {mode === 'login' ? 'Welcome Back' : mode === 'register' ? 'Create Account' : 'Reset Password'}
          </h3>
          
          {error && <div className="p-3 bg-red-50 text-red-600 rounded-lg text-sm">{error}</div>}

          {mode === 'register' && (
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1">Full Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all"
                placeholder="John Doe"
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-slate-600 mb-1">Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all"
              placeholder="name@university.edu"
            />
          </div>

          {mode !== 'forgot' && (
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all"
                placeholder="••••••••"
              />
            </div>
          )}

          <button
            type="submit"
            className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold shadow-lg shadow-indigo-200 transition-all active:scale-95"
          >
            {mode === 'login' ? 'Sign In' : mode === 'register' ? 'Join Now' : 'Send Reset Link'}
          </button>

          <div className="flex flex-col items-center space-y-4 pt-4 border-t border-slate-100">
            {mode === 'login' ? (
              <>
                <button type="button" onClick={() => setMode('register')} className="text-indigo-600 font-medium hover:underline">Don't have an account? Sign up</button>
                <button type="button" onClick={() => setMode('forgot')} className="text-slate-500 text-sm hover:underline">Forgot your password?</button>
              </>
            ) : (
              <button type="button" onClick={() => setMode('login')} className="text-indigo-600 font-medium hover:underline">Already have an account? Sign in</button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default AuthView;
