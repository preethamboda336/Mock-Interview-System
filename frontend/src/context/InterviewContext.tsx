"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { EvaluationFeedback, InterviewSession, QuestionItem } from "@/types/interview";
import {
  getActiveSession,
  getStoredSessions,
  saveActiveSession,
  saveSession,
  deleteSession as removeStoredSession,
  STORAGE_SOURCE_LABEL,
} from "@/lib/storage";
import { cleanQuestionText, extractNumericalScore } from "@/lib/utils";

interface InterviewContextType {
  activeSession: InterviewSession | null;
  historySessions: InterviewSession[];
  isLoaded: boolean;
  storageLabel: string;
  startNewSession: (jobTitle: string, resumeText: string, questionsList: string[]) => InterviewSession;
  updateAnswer: (questionId: string, answerText: string) => void;
  saveEvaluationForCurrentQuestion: (feedback: EvaluationFeedback) => void;
  nextQuestion: () => boolean;
  prevQuestion: () => boolean;
  goToQuestion: (index: number) => void;
  finishCurrentInterview: () => void;
  discardCurrentSession: () => void;
  deleteHistorySession: (id: string) => void;
  loadSessionIntoActive: (session: InterviewSession) => void;
}

const InterviewContext = createContext<InterviewContextType | undefined>(undefined);

export function InterviewProvider({ children }: { children: React.ReactNode }) {
  const [activeSession, setActiveSessionState] = useState<InterviewSession | null>(null);
  const [historySessions, setHistorySessions] = useState<InterviewSession[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Initialize from localStorage on mount
  useEffect(() => {
    try {
      const active = getActiveSession();
      const history = getStoredSessions();
      setActiveSessionState(active);
      setHistorySessions(history);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  const refreshHistory = () => {
    setHistorySessions(getStoredSessions());
  };

  const startNewSession = (
    jobTitle: string,
    resumeText: string,
    rawQuestions: string[]
  ): InterviewSession => {
    const formattedQuestions: QuestionItem[] = rawQuestions.map((q, idx) => ({
      id: `q_${Date.now()}_${idx}`,
      rawText: q,
      cleanText: cleanQuestionText(q),
      difficulty: idx === 0 ? "Foundational" : idx === 1 ? "Intermediate" : "Advanced",
    }));

    const newSession: InterviewSession = {
      id: `session_${Date.now()}`,
      title: jobTitle ? `${jobTitle} Technical Mock` : "Technical Mock Interview",
      jobTitle: jobTitle || "Software Engineer",
      resumeSnippet: resumeText.slice(0, 300),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      questions: formattedQuestions,
      answers: {},
      evaluations: {},
      currentQuestionIndex: 0,
      status: "in-progress",
    };

    setActiveSessionState(newSession);
    saveActiveSession(newSession);
    saveSession(newSession);
    refreshHistory();
    return newSession;
  };

  const updateAnswer = (questionId: string, answerText: string) => {
    if (!activeSession) return;
    const updated: InterviewSession = {
      ...activeSession,
      answers: {
        ...activeSession.answers,
        [questionId]: answerText,
      },
      updatedAt: new Date().toISOString(),
    };
    setActiveSessionState(updated);
    saveActiveSession(updated);
    saveSession(updated);
  };

  const saveEvaluationForCurrentQuestion = (feedback: EvaluationFeedback) => {
    if (!activeSession) return;
    const currQ = activeSession.questions[activeSession.currentQuestionIndex];
    if (!currQ) return;

    const newEvals = {
      ...activeSession.evaluations,
      [currQ.id]: feedback,
    };

    // calculate average score so far
    const scores = Object.values(newEvals).map((f) => extractNumericalScore(f.score));
    const avg = scores.length > 0 ? Number((scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(1)) : undefined;

    const updated: InterviewSession = {
      ...activeSession,
      evaluations: newEvals,
      averageScore: avg,
      updatedAt: new Date().toISOString(),
    };

    setActiveSessionState(updated);
    saveActiveSession(updated);
    saveSession(updated);
    refreshHistory();
  };

  const nextQuestion = (): boolean => {
    if (!activeSession) return false;
    if (activeSession.currentQuestionIndex < activeSession.questions.length - 1) {
      const updated = {
        ...activeSession,
        currentQuestionIndex: activeSession.currentQuestionIndex + 1,
      };
      setActiveSessionState(updated);
      saveActiveSession(updated);
      saveSession(updated);
      return true;
    }
    return false;
  };

  const prevQuestion = (): boolean => {
    if (!activeSession) return false;
    if (activeSession.currentQuestionIndex > 0) {
      const updated = {
        ...activeSession,
        currentQuestionIndex: activeSession.currentQuestionIndex - 1,
      };
      setActiveSessionState(updated);
      saveActiveSession(updated);
      saveSession(updated);
      return true;
    }
    return false;
  };

  const goToQuestion = (index: number) => {
    if (!activeSession) return;
    if (index >= 0 && index < activeSession.questions.length) {
      const updated = {
        ...activeSession,
        currentQuestionIndex: index,
      };
      setActiveSessionState(updated);
      saveActiveSession(updated);
      saveSession(updated);
    }
  };

  const finishCurrentInterview = () => {
    if (!activeSession) return;
    const scores = Object.values(activeSession.evaluations).map((f) => extractNumericalScore(f.score));
    const avg = scores.length > 0 ? Number((scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(1)) : 7.0;

    const finalized: InterviewSession = {
      ...activeSession,
      status: "completed",
      averageScore: avg,
      updatedAt: new Date().toISOString(),
    };

    setActiveSessionState(finalized);
    saveActiveSession(finalized);
    saveSession(finalized);
    refreshHistory();
  };

  const discardCurrentSession = () => {
    setActiveSessionState(null);
    saveActiveSession(null);
  };

  const deleteHistorySession = (id: string) => {
    removeStoredSession(id);
    if (activeSession?.id === id) {
      discardCurrentSession();
    }
    refreshHistory();
  };

  const loadSessionIntoActive = (session: InterviewSession) => {
    setActiveSessionState(session);
    saveActiveSession(session);
  };

  return (
    <InterviewContext.Provider
      value={{
        activeSession,
        historySessions,
        isLoaded,
        storageLabel: STORAGE_SOURCE_LABEL,
        startNewSession,
        updateAnswer,
        saveEvaluationForCurrentQuestion,
        nextQuestion,
        prevQuestion,
        goToQuestion,
        finishCurrentInterview,
        discardCurrentSession,
        deleteHistorySession,
        loadSessionIntoActive,
      }}
    >
      {children}
    </InterviewContext.Provider>
  );
}

export function useInterview() {
  const context = useContext(InterviewContext);
  if (!context) {
    throw new Error("useInterview must be used within an InterviewProvider");
  }
  return context;
}

