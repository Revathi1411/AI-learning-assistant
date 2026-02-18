
import React, { useState, useEffect, useRef, useLayoutEffect } from 'react';
import { SummaryHistoryItem } from '../types';
import { summarizeNotes } from '../services/geminiService';
import { marked } from 'marked';

const SummarizerModule: React.FC = () => {
  const [text, setText] = useState('');
  const [summary, setSummary] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [history, setHistory] = useState<SummaryHistoryItem[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const summaryContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const saved = localStorage.getItem('edumind_summary_history');
    if (saved) setHistory(JSON.parse(saved));
  }, []);

  // Ensure math rendering in summaries too
  useLayoutEffect(() => {
    if (summaryContainerRef.current && (window as any).renderMathInElement) {
      (window as any).renderMathInElement(summaryContainerRef.current, {
        delimiters: [
          { left: "$$", right: "$$", display: true },
          { left: "$", right: "$", display: false }
        ],
        throwOnError: false
      });
    }
  }, [summary, showHistory]);

  const saveToHistory = (newSummary: string) => {
    const newItem: SummaryHistoryItem = {
      id: Date.now().toString(),
      originalText: text,
      summary: newSummary,
      timestamp: Date.now()
    };
    const updatedHistory = [newItem, ...history];
    setHistory(updatedHistory);
    localStorage.setItem('edumind_summary_history', JSON.stringify(updatedHistory));
  };

  const clearHistory = () => {
    if (confirm('Clear all summary history?')) {
      setHistory([]);
      localStorage.removeItem('edumind_summary_history');
    }
  };

  const handleSummarize = async () => {
    if (!text.trim() || isLoading) return;
    setIsLoading(true);
    try {
      const result = await summarizeNotes(text);
      if (result) {
        setSummary(result);
        saveToHistory(result);
      }
    } catch (error) {
      alert('Error summarizing text');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      setText(content);
    };
    reader.readAsText(file);
  };

  const renderMarkdown = (text: string) => {
    return { __html: marked.parse(text) };
  };

  const reset = () => {
    setText('');
    setSummary('');
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Notes Summarizer</h2>
          <p className="text-sm text-slate-500">Get the "Small Matter" - concise & clear.</p>
        </div>
        <button 
          onClick={() => setShowHistory(!showHistory)}
          className="text-sm text-indigo-600 font-bold hover:underline"
        >
          {showHistory ? 'Back to Summarizer' : `View History (${history.length})`}
        </button>
      </div>

      {showHistory ? (
        <div className="space-y-4 animate-in fade-in">
          <div className="flex justify-between items-center">
            <h3 className="font-bold text-slate-600">Past Summaries</h3>
            <button onClick={clearHistory} className="text-sm text-red-500 hover:underline">Clear All</button>
          </div>
          {history.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-3xl border border-slate-200">
              <p className="text-slate-400">No history yet.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {history.map((item) => (
                <div key={item.id} className="bg-white p-6 rounded-2xl border border-slate-200">
                  <div className="flex justify-between items-start mb-4">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">{new Date(item.timestamp).toLocaleString()}</span>
                    <button 
                      onClick={() => { setText(item.originalText); setSummary(item.summary); setShowHistory(false); }}
                      className="text-xs text-indigo-600 font-bold hover:underline"
                    >
                      Restore
                    </button>
                  </div>
                  <div className="prose prose-sm max-w-none line-clamp-3 overflow-hidden text-slate-600">
                    {item.summary}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-full animate-in fade-in duration-500">
          <div className="flex flex-col space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-bold">Input Notes</h3>
              <div className="flex space-x-2">
                <button onClick={reset} className="text-sm text-slate-400 hover:text-slate-600">Clear</button>
                <label className="text-sm text-indigo-600 font-medium hover:underline cursor-pointer">
                  Upload File
                  <input type="file" onChange={handleFileUpload} className="hidden" accept=".txt,.md" />
                </label>
              </div>
            </div>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Paste long lecture notes here..."
              className="flex-1 min-h-[400px] p-6 bg-white border border-slate-200 rounded-3xl focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all resize-none shadow-sm"
            />
            <button
              onClick={handleSummarize}
              disabled={!text.trim() || isLoading}
              className="py-4 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 text-white rounded-2xl font-bold shadow-lg shadow-indigo-100 transition-all active:scale-95"
            >
              {isLoading ? 'Condensing Content...' : 'Summarize Small Matter ✨'}
            </button>
          </div>

          <div className="flex flex-col space-y-4">
            <h3 className="text-lg font-bold">Clear & Concise Summary</h3>
            <div 
              ref={summaryContainerRef}
              className="flex-1 min-h-[400px] p-8 bg-white border border-indigo-100 rounded-3xl shadow-sm overflow-y-auto"
            >
              {isLoading ? (
                <div className="space-y-4">
                  <div className="h-4 bg-slate-100 rounded animate-pulse w-3/4"></div>
                  <div className="h-4 bg-slate-100 rounded animate-pulse w-full"></div>
                  <div className="h-4 bg-slate-100 rounded animate-pulse w-5/6"></div>
                  <div className="h-4 bg-slate-100 rounded animate-pulse w-2/3"></div>
                </div>
              ) : summary ? (
                <div 
                  className="markdown-content summary-view" 
                  dangerouslySetInnerHTML={renderMarkdown(summary)} 
                />
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-center text-slate-400 space-y-4">
                  <div className="text-5xl opacity-50">📑</div>
                  <p>Your "Small Matter" summary will appear here.<br/>Clear, understood, and fast.</p>
                </div>
              )}
            </div>
            {summary && (
              <button
                onClick={() => {
                  navigator.clipboard.writeText(summary);
                  alert('Summary copied to clipboard!');
                }}
                className="py-3 border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-xl font-medium transition-all"
              >
                Copy Summary
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default SummarizerModule;
