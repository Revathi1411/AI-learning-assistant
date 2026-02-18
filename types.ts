
export enum Difficulty {
  EASY = 'Easy',
  MEDIUM = 'Medium',
  HARD = 'Hard'
}

export interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

export interface QuizHistoryItem {
  id: string;
  topic: string;
  difficulty: Difficulty;
  numQuestions: number;
  score: number;
  questions: QuizQuestion[];
  userAnswers: number[];
  timestamp: number;
}

export interface SummaryHistoryItem {
  id: string;
  originalText: string;
  summary: string;
  timestamp: number;
}

export interface PlanHistoryItem {
  id: string;
  examName: string;
  days: number;
  hours: number;
  plan: DailyPlan[];
  timestamp: number;
}

export interface ChatHistoryItem {
  id: string;
  title: string;
  messages: ChatMessage[];
  timestamp: number;
}

export interface Quiz {
  id: string;
  topic: string;
  difficulty: Difficulty;
  questions: QuizQuestion[];
  score?: number;
  timestamp: number;
}

export interface StudyTask {
  time: string;
  task: string;
  priority: 'High' | 'Medium' | 'Low';
}

export interface DailyPlan {
  day: string;
  tasks: StudyTask[];
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: number;
}

export interface User {
  id: string;
  name: string;
  email: string;
  progress: {
    totalQuizzes: number;
    averageScore: number;
    weakTopics: string[];
  };
}

export type View = 'dashboard' | 'chat' | 'quiz' | 'summarizer' | 'planner';
