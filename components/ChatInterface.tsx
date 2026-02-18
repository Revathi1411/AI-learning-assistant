import React, { useState, useEffect, useRef, useLayoutEffect } from 'react';
import { ChatMessage, ChatHistoryItem } from '../types';
import { getDoubtSolvingResponse } from '../services/geminiService';
import { marked } from 'marked';

interface AttachedFile {
  data: string;
  mimeType: string;
  name: string;
  previewUrl?: string;
}

const ChatInterface: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [history, setHistory] = useState<ChatHistoryItem[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [attachedFile, setAttachedFile] = useState<AttachedFile | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const savedHistory = localStorage.getItem('edumind_chat_history');
    if (savedHistory) {
      setHistory(JSON.parse(savedHistory));
    }
    const currentChat = localStorage.getItem('edumind_current_chat');
    if (currentChat) {
      setMessages(JSON.parse(currentChat));
    }
  }, []);

  // Robust math rendering function
  const triggerMathRendering = () => {
    if (messagesContainerRef.current && (window as any).renderMathInElement) {
      try {
        (window as any).renderMathInElement(messagesContainerRef.current, {
          delimiters: [
            { left: "$$", right: "$$", display: true },
            { left: "$", right: "$", display: false },
            { left: "\\(", right: "\\)", display: false },
            { left: "\\[", right: "\\]", display: true }
          ],
          throwOnError: false,
          output: 'html'
        });
      } catch (err) {
        console.warn('Math rendering failed:', err);
      }
    }
  };

  useLayoutEffect(() => {
    triggerMathRendering();
    // Multiple triggers to ensure rendering happens after Markdown conversion
    const timer1 = setTimeout(triggerMathRendering, 50);
    const timer2 = setTimeout(triggerMathRendering, 300);
    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, [messages, showHistory, isLoading]);

  useEffect(() => {
    localStorage.setItem('edumind_current_chat', JSON.stringify(messages));
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
    
    if (messages.length >= 2 && messages.length % 4 === 0) {
      saveSession();
    }
  }, [messages]);

  const saveSession = () => {
    if (messages.length < 2) return;
    const title = messages[0].text.substring(0, 30) + (messages[0].text.length > 30 ? '...' : '');
    const existingIdx = history.findIndex(h => h.id === messages[0].id);
    
    const session: ChatHistoryItem = {
      id: messages[0].id,
      title,
      messages: [...messages],
      timestamp: Date.now()
    };

    let newHistory;
    if (existingIdx >= 0) {
      newHistory = [...history];
      newHistory[existingIdx] = session;
    } else {
      newHistory = [session, ...history];
    }
    
    setHistory(newHistory);
    localStorage.setItem('edumind_chat_history', JSON.stringify(newHistory));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64Data = (event.target?.result as string).split(',')[1];
      const previewUrl = file.type.startsWith('image/') ? URL.createObjectURL(file) : undefined;
      
      setAttachedFile({
        data: base64Data,
        mimeType: file.type,
        name: file.name,
        previewUrl
      });
    };
    reader.readAsDataURL(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSend = async () => {
    if ((!input.trim() && !attachedFile) || isLoading) return;

    const parts: any[] = [];
    let userVisibleText = input;

    if (attachedFile) {
      parts.push({
        inlineData: {
          data: attachedFile.data,
          mimeType: attachedFile.mimeType
        }
      });
      userVisibleText = input.trim() 
        ? `${input}\n\n[Attachment: ${attachedFile.name}]`
        : `[Attachment: ${attachedFile.name}]`;
    }

    if (input.trim()) {
      parts.push({ text: input });
    } else if (attachedFile) {
      parts.push({ text: "Analyze this document/image for me." });
    }

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      text: userVisibleText,
      timestamp: Date.now()
    };

    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput('');
    setAttachedFile(null);
    setIsLoading(true);

    try {
      const chatHistory = messages.map(m => ({
        role: m.role,
        parts: [{ text: m.text }]
      }));
      
      const response = await getDoubtSolvingResponse(parts, chatHistory);
      
      const aiMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: response || 'I am sorry, I could not generate a response.',
        timestamp: Date.now()
      };
      
      setMessages(prev => [...prev, aiMsg]);
    } catch (error) {
      console.error(error);
      alert('Error communicating with AI. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const clearCurrentChat = () => {
    if (confirm('Are you sure you want to clear this current chat?')) {
      saveSession();
      setMessages([]);
      localStorage.removeItem('edumind_current_chat');
    }
  };

  const clearAllHistory = () => {
    if (confirm('Are you sure you want to clear ALL past chat history?')) {
      setHistory([]);
      localStorage.removeItem('edumind_chat_history');
    }
  };

  const restoreSession = (session: ChatHistoryItem) => {
    saveSession();
    setMessages(session.messages);
    setShowHistory(false);
  };

  const renderMarkdown = (text: string) => {
    // Configured marked for clear, textbook-like rendering
    return { __html: marked.parse(text, { breaks: true, gfm: true }) };
  };

  return (
    <div className="flex flex-col h-[calc(100vh-12rem)] bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm relative">
      <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 rounded-full bg-green-500"></div>
          <span className="font-semibold text-slate-700">AI Doubt Solver</span>
        </div>
        <div className="flex space-x-4 items-center">
          <button 
            onClick={() => setShowHistory(!showHistory)} 
            className="text-sm text-indigo-600 font-bold hover:underline"
          >
            {showHistory ? 'Back to Chat' : `History (${history.length})`}
          </button>
          {!showHistory && messages.length > 0 && (
            <button onClick={clearCurrentChat} className="text-sm text-slate-400 hover:text-red-500 transition-colors">New Chat</button>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-6" ref={messagesContainerRef}>
        {showHistory ? (
          <div className="animate-in fade-in space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="font-bold text-slate-600">Past Conversations</h3>
              <button onClick={clearAllHistory} className="text-sm text-red-500 hover:underline">Clear All History</button>
            </div>
            {history.length === 0 ? (
              <div className="text-center py-20 text-slate-400">No past conversations saved.</div>
            ) : (
              <div className="grid grid-cols-1 gap-3">
                {history.map((item) => (
                  <div key={item.id} className="p-4 bg-slate-50 border border-slate-100 rounded-2xl flex justify-between items-center group hover:border-indigo-200 transition-colors">
                    <div className="flex-1 cursor-pointer" onClick={() => restoreSession(item)}>
                      <h4 className="font-bold text-slate-800 text-sm">{item.title}</h4>
                      <p className="text-xs text-slate-500">{new Date(item.timestamp).toLocaleString()}</p>
                    </div>
                    <button 
                      onClick={() => restoreSession(item)}
                      className="px-4 py-2 bg-indigo-50 text-indigo-600 text-xs font-bold rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      Restore
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center space-y-4">
            <div className="text-6xl">🤖</div>
            <h3 className="text-xl font-bold">I'm your AI Teacher</h3>
            <p className="text-slate-500 max-w-xs">Ask me any study question. You can also upload images or PDF notes for me to analyze!</p>
          </div>
        ) : (
          messages.map((msg) => (
            <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[85%] p-5 rounded-2xl ${
                msg.role === 'user' 
                  ? 'bg-indigo-600 text-white rounded-tr-none shadow-md' 
                  : 'bg-slate-100 text-slate-800 rounded-tl-none border border-slate-200'
              }`}>
                {msg.role === 'model' ? (
                  <div 
                    className="markdown-content text-sm md:text-base leading-relaxed" 
                    dangerouslySetInnerHTML={renderMarkdown(msg.text)}
                  />
                ) : (
                  <div className="whitespace-pre-wrap text-sm md:text-base">{msg.text}</div>
                )}
                <div className={`text-[10px] mt-2 opacity-60 ${msg.role === 'user' ? 'text-right' : 'text-left'}`}>
                  {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            </div>
          ))
        )}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-slate-100 p-4 rounded-2xl rounded-tl-none animate-pulse flex space-x-2">
              <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce [animation-delay:0.2s]"></div>
              <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce [animation-delay:0.4s]"></div>
            </div>
          </div>
        )}
        <div ref={scrollRef} />
      </div>

      {!showHistory && (
        <div className="p-4 bg-slate-50 border-t border-slate-200">
          {attachedFile && (
            <div className="mb-3 flex items-center bg-white border border-indigo-100 p-2 rounded-xl animate-in slide-in-from-bottom-2">
              <div className="w-10 h-10 bg-indigo-50 rounded-lg overflow-hidden flex items-center justify-center mr-3 shrink-0 border border-indigo-100">
                {attachedFile.previewUrl ? (
                  <img src={attachedFile.previewUrl} alt="Preview" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-xl">📄</span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-700 truncate">{attachedFile.name}</p>
                <p className="text-[10px] text-slate-400 uppercase">{attachedFile.mimeType.split('/')[1]}</p>
              </div>
              <button 
                onClick={() => setAttachedFile(null)}
                className="p-1.5 text-slate-400 hover:text-red-500 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          )}
          
          <div className="flex items-end space-x-2">
            <div className="flex-1 relative">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
                placeholder="Type your question or analyze an attachment..."
                className="w-full px-4 py-3 bg-white border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all resize-none max-h-32 shadow-inner"
                rows={2}
              />
            </div>
            
            <div className="flex flex-col space-y-2">
              <input 
                type="file" 
                ref={fileInputRef}
                onChange={handleFileChange} 
                accept="image/*,application/pdf" 
                className="hidden" 
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="p-3 bg-white border border-slate-200 text-slate-500 rounded-xl hover:bg-slate-50 hover:text-indigo-600 transition-all shadow-sm"
                title="Attach image or PDF"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </button>
              
              <button
                onClick={handleSend}
                disabled={(!input.trim() && !attachedFile) || isLoading}
                className={`p-3 rounded-xl transition-all shadow-md ${
                  (input.trim() || attachedFile) && !isLoading 
                    ? 'bg-indigo-600 text-white hover:bg-indigo-700' 
                    : 'bg-slate-200 text-slate-400'
                }`}
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatInterface;
