
import React, { useState, useEffect } from 'react';
import { DailyPlan, PlanHistoryItem } from '../types';
import { generateStudyPlan } from '../services/geminiService';

const StudyPlanner: React.FC = () => {
  const [examName, setExamName] = useState('');
  const [days, setDays] = useState(7);
  const [hours, setHours] = useState(4);
  const [plan, setPlan] = useState<DailyPlan[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [history, setHistory] = useState<PlanHistoryItem[]>([]);
  const [showHistory, setShowHistory] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('edumind_plan_history');
    if (saved) setHistory(JSON.parse(saved));
  }, []);

  const saveToHistory = (newPlan: DailyPlan[]) => {
    const newItem: PlanHistoryItem = {
      id: Date.now().toString(),
      examName,
      days,
      hours,
      plan: newPlan,
      timestamp: Date.now()
    };
    const updatedHistory = [newItem, ...history];
    setHistory(updatedHistory);
    localStorage.setItem('edumind_plan_history', JSON.stringify(updatedHistory));
  };

  const clearHistory = () => {
    if (confirm('Clear all plan history?')) {
      setHistory([]);
      localStorage.removeItem('edumind_plan_history');
    }
  };

  const handleGenerate = async () => {
    if (!examName.trim() || isLoading) return;
    setIsLoading(true);
    try {
      const result = await generateStudyPlan(examName, days, hours);
      setPlan(result);
      saveToHistory(result);
    } catch (error) {
      alert('Error generating plan');
    } finally {
      setIsLoading(false);
    }
  };

  const resetPlanner = () => {
    setExamName('');
    setDays(7);
    setHours(4);
    setPlan([]);
  };

  return (
    <div className="space-y-8 animate-in slide-in-from-bottom duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Study Planner</h2>
          <p className="text-sm text-slate-500">Veda AI organizes your preparation schedule.</p>
        </div>
        <div className="flex space-x-4">
          <button 
            onClick={() => setShowHistory(!showHistory)}
            className="text-sm text-indigo-600 font-bold hover:underline"
          >
            {showHistory ? 'Create New Plan' : `View History (${history.length})`}
          </button>
        </div>
      </div>

      {showHistory ? (
        <div className="space-y-4 animate-in fade-in">
          <div className="flex justify-between items-center">
            <h3 className="font-bold text-slate-600">Past Study Plans</h3>
            <button onClick={clearHistory} className="text-sm text-red-500 hover:underline">Clear All</button>
          </div>
          {history.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-3xl border border-slate-200">
              <p className="text-slate-400">No study plans created yet.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {history.map((item) => (
                <div key={item.id} className="bg-white p-6 rounded-2xl border border-slate-200 flex justify-between items-center">
                  <div>
                    <h4 className="font-bold text-slate-800">{item.examName}</h4>
                    <p className="text-xs text-slate-500">{item.days} days • {item.hours} hrs/day • {new Date(item.timestamp).toLocaleDateString()}</p>
                  </div>
                  <button 
                    onClick={() => { setPlan(item.plan); setShowHistory(false); setExamName(item.examName); }}
                    className="text-sm text-indigo-600 font-bold hover:underline"
                  >
                    Load Plan
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        <>
          <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold">Plan Your Success</h3>
              <button onClick={resetPlanner} className="text-sm text-slate-400 hover:text-slate-600">Reset All</button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-600">Exam Subject</label>
                <input
                  type="text"
                  value={examName}
                  onChange={(e) => setExamName(e.target.value)}
                  placeholder="e.g. Final Math Exam"
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-600">Days Remaining</label>
                <input
                  type="number"
                  value={days}
                  onChange={(e) => setDays(parseInt(e.target.value))}
                  min={1}
                  max={60}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-600">Study Hours/Day</label>
                <input
                  type="number"
                  value={hours}
                  onChange={(e) => setHours(parseInt(e.target.value))}
                  min={1}
                  max={16}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>
            </div>
            <button
              onClick={handleGenerate}
              disabled={!examName.trim() || isLoading}
              className="mt-8 w-full py-4 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 text-white rounded-2xl font-bold shadow-lg transition-all active:scale-95"
            >
              {isLoading ? 'Creating Plan...' : 'Generate Daily Study Routine 🗓️'}
            </button>
          </div>

          {plan.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {plan.map((dayPlan, idx) => (
                <div key={idx} className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden flex flex-col animate-in slide-in-from-bottom-2">
                  <div className="bg-slate-50 px-6 py-4 border-b border-slate-200">
                    <h4 className="font-bold text-slate-800">{dayPlan.day}</h4>
                  </div>
                  <div className="p-6 space-y-4 flex-1">
                    {dayPlan.tasks.map((task, tidx) => (
                      <div key={tidx} className="flex items-start space-x-3 group">
                        <div className={`mt-1 w-2 h-2 shrink-0 rounded-full ${
                          task.priority === 'High' ? 'bg-red-500' : task.priority === 'Medium' ? 'bg-orange-400' : 'bg-green-400'
                        }`}></div>
                        <div>
                          <span className="text-xs font-bold text-indigo-500 block">{task.time}</span>
                          <p className="text-sm text-slate-700 group-hover:text-slate-900 transition-colors">{task.task}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {plan.length === 0 && !isLoading && (
            <div className="py-20 text-center text-slate-400">
              <div className="text-6xl mb-4 opacity-50">📍</div>
              <p>Fill in the details above to see your personalized plan.</p>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default StudyPlanner;
