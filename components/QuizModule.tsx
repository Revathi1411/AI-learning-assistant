
import React, { useState, useEffect } from 'react';
import { Difficulty, QuizQuestion, QuizHistoryItem } from '../types';
import { generateQuiz } from '../services/geminiService';

interface QuizModuleProps {
  onComplete: (score: number, topic: string) => void;
}

const QuizModule: React.FC<QuizModuleProps> = ({ onComplete }) => {
  const [topic, setTopic] = useState('');
  const [difficulty, setDifficulty] = useState<Difficulty>(Difficulty.MEDIUM);
  const [numQuestions, setNumQuestions] = useState<string>('10');
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentStep, setCurrentStep] = useState<'setup' | 'quiz' | 'result' | 'history'>('setup');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [history, setHistory] = useState<QuizHistoryItem[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem('edumind_quiz_history');
    if (saved) setHistory(JSON.parse(saved));
  }, []);

  const saveToHistory = (score: number, finalQuestions: QuizQuestion[], finalAnswers: number[]) => {
    const count = finalQuestions.length;
    const newItem: QuizHistoryItem = {
      id: Date.now().toString(),
      topic,
      difficulty,
      numQuestions: count,
      score,
      questions: finalQuestions,
      userAnswers: finalAnswers,
      timestamp: Date.now()
    };
    const updatedHistory = [newItem, ...history];
    setHistory(updatedHistory);
    localStorage.setItem('edumind_quiz_history', JSON.stringify(updatedHistory));
  };

  const clearHistory = () => {
    if (confirm('Clear all quiz history?')) {
      setHistory([]);
      localStorage.removeItem('edumind_quiz_history');
    }
  };

  const startQuiz = async () => {
    if (!topic.trim()) return;
    const count = parseInt(numQuestions);
    if (isNaN(count) || count < 1) {
      alert('Please enter a valid number of questions (minimum 1).');
      return;
    }
    
    setIsLoading(true);
    try {
      const safeCount = Math.min(count, 50);
      const qs = await generateQuiz(topic, difficulty, safeCount);
      setQuestions(qs);
      setAnswers(new Array(qs.length).fill(-1));
      setCurrentStep('quiz');
    } catch (error) {
      alert('Error generating quiz. Please try again with a simpler topic or fewer questions.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAnswer = (optionIdx: number) => {
    const newAnswers = [...answers];
    newAnswers[currentIndex] = optionIdx;
    setAnswers(newAnswers);
  };

  const finishQuiz = () => {
    const correctCount = questions.reduce((acc, q, idx) => {
      return acc + (q.correctAnswer === answers[idx] ? 1 : 0);
    }, 0);
    const score = (correctCount / questions.length) * 100;
    saveToHistory(score, questions, answers);
    setCurrentStep('result');
    onComplete(score, topic);
  };

  const reloadPastResult = (item: QuizHistoryItem) => {
    setTopic(item.topic);
    setDifficulty(item.difficulty);
    setQuestions(item.questions || []);
    setAnswers(item.userAnswers || []);
    setNumQuestions((item.questions?.length || 10).toString());
    setCurrentStep('result');
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-6">
        <div className="w-16 h-16 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
        <div className="text-center">
          <h3 className="text-xl font-bold">Generating Your Quiz...</h3>
          <p className="text-slate-500">Veda AI is crafting {numQuestions} unique questions based on your request.</p>
        </div>
      </div>
    );
  }

  if (currentStep === 'history') {
    return (
      <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold">Quiz History</h2>
            <p className="text-sm text-slate-500">Review your past performance and improvements.</p>
          </div>
          <div className="space-x-4">
            <button 
              onClick={() => setCurrentStep('setup')} 
              className="text-sm text-indigo-600 font-bold hover:underline"
            >
              Back to Generator
            </button>
            <button onClick={clearHistory} className="text-sm text-red-500 hover:underline">Clear All</button>
          </div>
        </div>
        {history.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl border border-slate-200">
            <p className="text-slate-400">No quizzes taken yet.</p>
            <button 
              onClick={() => setCurrentStep('setup')}
              className="mt-4 text-indigo-600 font-bold hover:underline"
            >
              Create your first quiz
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {history.map((item) => (
              <div key={item.id} className="bg-white p-6 rounded-2xl border border-slate-200 flex justify-between items-center hover:border-indigo-200 transition-colors shadow-sm group">
                <div>
                  <h4 className="font-bold text-slate-800">{item.topic}</h4>
                  <p className="text-xs text-slate-500">
                    {item.difficulty} • {item.numQuestions || 10} Qs • {new Date(item.timestamp).toLocaleDateString()}
                  </p>
                  <div className="mt-1">
                    <span className={`text-sm font-black ${item.score >= 80 ? 'text-green-600' : item.score >= 50 ? 'text-orange-500' : 'text-red-500'}`}>
                      Score: {Math.round(item.score)}%
                    </span>
                  </div>
                </div>
                <button 
                  onClick={() => reloadPastResult(item)}
                  className="px-4 py-2 bg-indigo-50 text-indigo-600 text-xs font-bold rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  Reload Results
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  if (currentStep === 'setup') {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="bg-white p-10 rounded-3xl border border-slate-200 shadow-sm animate-in zoom-in duration-300">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">Create Custom Quiz</h2>
            <div className="flex space-x-4">
              <button onClick={() => setCurrentStep('history')} className="text-sm text-indigo-600 font-bold hover:underline">
                View History ({history.length})
              </button>
            </div>
          </div>
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-2">Topic or Subject</label>
              <input
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="e.g. Physics, History, Coding"
                className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-2">How many questions?</label>
                <input 
                  type="text" 
                  inputMode="numeric"
                  value={numQuestions} 
                  onChange={(e) => {
                    const val = e.target.value.replace(/\D/g, '');
                    setNumQuestions(val);
                  }}
                  placeholder="Enter a number (e.g. 15)"
                  className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all font-bold text-indigo-600"
                />
                <p className="text-[10px] text-slate-400 mt-2 italic">Enter any number based on your interest.</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-600 mb-2">Difficulty Level</label>
                <div className="grid grid-cols-3 gap-2">
                  {Object.values(Difficulty).map((d) => (
                    <button
                      key={d}
                      onClick={() => setDifficulty(d)}
                      className={`py-4 rounded-xl border font-bold transition-all text-xs ${
                        difficulty === d 
                          ? 'bg-indigo-600 text-white border-indigo-600 shadow-md' 
                          : 'bg-white text-slate-600 border-slate-200 hover:border-indigo-300'
                      }`}
                    >
                      {d}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <button
              onClick={startQuiz}
              disabled={!topic.trim() || !numQuestions}
              className="w-full py-5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 text-white rounded-2xl font-bold text-lg shadow-xl shadow-indigo-100 transition-all active:scale-95"
            >
              Generate {numQuestions || '...'} Questions 🚀
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (currentStep === 'quiz') {
    const q = questions[currentIndex];
    return (
      <div className="max-w-2xl mx-auto space-y-8 animate-in slide-in-from-right duration-300">
        <div className="flex justify-between items-center px-2">
          <span className="text-sm font-bold text-slate-500 uppercase tracking-wider">Question {currentIndex + 1} of {questions.length}</span>
          <div className="flex space-x-1 flex-1 max-w-[200px] ml-4">
             <div className="h-2 w-full bg-slate-200 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-indigo-600 transition-all duration-300" 
                  style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
                ></div>
             </div>
          </div>
        </div>

        <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
          <h3 className="text-xl font-bold text-slate-800 mb-8">{q.question}</h3>
          <div className="space-y-4">
            {q.options.map((opt, idx) => (
              <button
                key={idx}
                onClick={() => handleAnswer(idx)}
                className={`w-full p-4 text-left rounded-2xl border transition-all flex items-center group ${
                  answers[currentIndex] === idx 
                    ? 'bg-indigo-50 border-indigo-600 text-indigo-700 font-medium' 
                    : 'bg-white border-slate-200 hover:border-indigo-300 text-slate-600'
                }`}
              >
                <span className={`w-8 h-8 rounded-lg flex items-center justify-center mr-4 text-sm font-bold ${
                   answers[currentIndex] === idx ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-500 group-hover:bg-indigo-100'
                }`}>
                  {String.fromCharCode(65 + idx)}
                </span>
                {opt}
              </button>
            ))}
          </div>
        </div>

        <div className="flex justify-between items-center">
          <button
            onClick={() => setCurrentIndex(Math.max(0, currentIndex - 1))}
            disabled={currentIndex === 0}
            className="px-6 py-3 font-bold text-slate-500 hover:text-indigo-600 transition-colors disabled:opacity-30"
          >
            Back
          </button>
          {currentIndex === questions.length - 1 ? (
            <button
              onClick={finishQuiz}
              disabled={answers[currentIndex] === -1}
              className="px-10 py-3 bg-indigo-600 text-white rounded-xl font-bold shadow-lg shadow-indigo-100 hover:bg-indigo-700 disabled:bg-slate-300 transition-all active:scale-95"
            >
              Finish Quiz
            </button>
          ) : (
            <button
              onClick={() => setCurrentIndex(currentIndex + 1)}
              disabled={answers[currentIndex] === -1}
              className="px-10 py-3 bg-indigo-600 text-white rounded-xl font-bold shadow-lg shadow-indigo-100 hover:bg-indigo-700 disabled:bg-slate-300 transition-all active:scale-95"
            >
              Next Question
            </button>
          )}
        </div>
      </div>
    );
  }

  const finalScore = (questions.reduce((acc, q, idx) => acc + (q.correctAnswer === answers[idx] ? 1 : 0), 0) / questions.length) * 100;

  return (
    <div className="max-w-2xl mx-auto bg-white p-10 rounded-3xl border border-slate-200 shadow-sm text-center animate-in zoom-in duration-500">
      <div className="text-6xl mb-4">{finalScore >= 80 ? '🏆' : finalScore >= 50 ? '👏' : '📚'}</div>
      <h2 className="text-3xl font-bold text-slate-800">Quiz Completed!</h2>
      <p className="text-slate-500 mt-2">Topic: {topic}</p>
      
      <div className="my-10 p-8 bg-slate-50 rounded-2xl">
        <div className="text-5xl font-black text-indigo-600">{Math.round(finalScore)}%</div>
        <p className="mt-2 font-medium text-slate-600">
          You got {questions.reduce((acc, q, idx) => acc + (q.correctAnswer === answers[idx] ? 1 : 0), 0)} out of {questions.length} correct
        </p>
      </div>

      <div className="space-y-4 text-left max-h-64 overflow-y-auto pr-2 mb-8 border-y border-slate-100 py-4">
        {questions.map((q, i) => (
          <div key={i} className="p-4 rounded-xl bg-slate-50 border border-slate-100">
            <p className="font-bold text-sm mb-1">{q.question}</p>
            <div className="flex items-center space-x-2">
              <span className={`text-xs font-bold ${answers[i] === q.correctAnswer ? 'text-green-600' : 'text-red-600'}`}>
                {answers[i] === q.correctAnswer ? 'Correct' : (answers[i] === -1 ? 'Unanswered' : 'Incorrect')}
              </span>
              <p className="text-xs text-slate-500 italic">Ans: {q.options[q.correctAnswer]}</p>
            </div>
            {answers[i] !== -1 && (
               <p className="text-xs text-slate-400 mt-1">Your answer: {q.options[answers[i]]}</p>
            )}
            <p className="text-xs text-slate-400 mt-1">{q.explanation}</p>
          </div>
        ))}
      </div>

      <button
        onClick={() => setCurrentStep('setup')}
        className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-bold text-lg transition-all"
      >
        Try Another Quiz
      </button>
    </div>
  );
};

export default QuizModule;
