
import { GoogleGenAI, Type } from "@google/genai";
import { Difficulty, QuizQuestion, DailyPlan } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

export const getDoubtSolvingResponse = async (parts: any[], history: {role: string, parts: {text: string}[]}[]) => {
  const model = 'gemini-3-flash-preview';
  const response = await ai.models.generateContent({
    model,
    contents: [...history, { role: 'user', parts }],
    config: {
      systemInstruction: `You are an elite, world-class educator. Provide the clearest possible explanations.
      
      STRICT FORMATTING RULES:
      - NEVER let raw symbols like '*' or '$' be visible as plain text. 
      - Use standard Markdown for bolding (**text**) and headers.
      - DO NOT use backslashes before symbols (e.g., do NOT write \$ or \*).
      
      MATHEMATICAL PRESENTATION:
      - Use LaTeX for ALL math. Wrap inline math in $ (e.g., $x+y=z$).
      - Use double dollar signs on NEW LINES for calculations: $$ x = \frac{-b \pm \sqrt{b^2-4ac}}{2a} $$
      - If a student asks for a "sum" or "problem", show each step clearly in its own centered $$ block.
      - NEVER show raw LaTeX code like \begin{equation}.`,
    }
  });
  return response.text;
};

export const generateQuiz = async (topic: string, difficulty: Difficulty, count: number): Promise<QuizQuestion[]> => {
  const model = 'gemini-3-flash-preview';
  const response = await ai.models.generateContent({
    model,
    contents: `Generate a ${count}-question multiple choice quiz about "${topic}" with difficulty level "${difficulty}". Ensure there are exactly ${count} questions. Return as JSON.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            question: { type: Type.STRING },
            options: { type: Type.ARRAY, items: { type: Type.STRING } },
            correctAnswer: { type: Type.INTEGER, description: '0-indexed index of the correct option' },
            explanation: { type: Type.STRING }
          },
          required: ["question", "options", "correctAnswer", "explanation"]
        }
      }
    }
  });
  
  return JSON.parse(response.text || '[]');
};

export const summarizeNotes = async (text: string) => {
  const model = 'gemini-3-flash-preview';
  const response = await ai.models.generateContent({
    model,
    contents: `Transform the following study notes into a HIGHLY CONCISE "Quick-Read" summary. 
    Focus on "Small Matter" - extract only the most vital points. 
    Use simplified, clear language that a student can understand instantly. 
    
    Structure your response exactly like this:
    # 🎯 Core Concept
    (One simple sentence explaining the main idea)
    
    # 📌 Key Takeaways
    - (Point 1: Small and clear)
    - (Point 2: Small and clear)
    - (Max 5 points total)
    
    # 💡 Important Terms
    - **Term**: Short 1-sentence definition.
    
    Notes to summarize:
    ${text}`,
  });
  return response.text;
};

export const generateStudyPlan = async (examName: string, daysRemaining: number, dailyHours: number): Promise<DailyPlan[]> => {
  const model = 'gemini-3-flash-preview';
  const response = await ai.models.generateContent({
    model,
    contents: `Create a daily study plan for the "${examName}" exam. I have ${daysRemaining} days left and can study ${dailyHours} hours per day. Return a list of daily plans as JSON.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            day: { type: Type.STRING },
            tasks: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  time: { type: Type.STRING },
                  task: { type: Type.STRING },
                  priority: { type: Type.STRING }
                }
              }
            }
          }
        }
      }
    }
  });
  return JSON.parse(response.text || '[]');
};
