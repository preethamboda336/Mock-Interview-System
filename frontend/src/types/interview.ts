export interface EvaluationFeedback {
  relevance: string;
  tone: string;
  technicalAccuracy: string;
  score: string;
  strengths: string;
  weaknesses: string;
  suggestions: string;
  improvedAnswer: string;
  fullFeedback: string;
}

export interface QuestionItem {
  id: string;
  rawText: string;
  cleanText: string;
  category?: string;
  difficulty?: 'Foundational' | 'Intermediate' | 'Advanced';
}

export interface QuestionEvaluationRecord {
  questionId: string;
  question: string;
  answer: string;
  feedback: EvaluationFeedback;
  numericalScore: number;
  evaluatedAt: string;
}

export interface InterviewSession {
  id: string;
  title: string;
  jobTitle: string;
  resumeSnippet: string;
  createdAt: string;
  updatedAt: string;
  questions: QuestionItem[];
  answers: Record<string, string>; // questionId -> candidate's answer
  evaluations: Record<string, EvaluationFeedback>; // questionId -> feedback
  currentQuestionIndex: number;
  status: 'draft' | 'in-progress' | 'completed';
  averageScore?: number;
}

export interface UserStats {
  totalInterviews: number;
  completedInterviews: number;
  averageScore: number;
  totalQuestionsAnswered: number;
  readinessLevel: string;
  skillMetrics: {
    name: string;
    score: number; // 0-100
  }[];
}

