"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { EvaluationFeedback, InterviewSession, QuestionItem } from "@/types/interview";
import {
  getActiveSession,
  getStoredSessions,
  saveActiveSession,
  saveSession as saveSessionLocal,
  deleteSession as removeStoredSession,
  STORAGE_SOURCE_LABEL,
} from "@/lib/storage";
import {
  saveSessionToDb,
  fetchSessionsFromDb,
  deleteSessionFromDb,
  fetchDbStatus,
} from "@/lib/api";
import { cleanQuestionText, extractNumericalScore } from "@/lib/utils";

interface InterviewContextType {
  activeSession: InterviewSession | null;
  historySessions: InterviewSession[];
  isLoaded: boolean;
  storageLabel: string;
  isDbConnected: boolean;
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
  refreshDbData: () => Promise<void>;
}

const InterviewContext = createContext<InterviewContextType | undefined>(undefined);

export function InterviewProvider({ children }: { children: React.ReactNode }) {
  const [activeSession, setActiveSessionState] = useState<InterviewSession | null>(null);
  const [historySessions, setHistorySessions] = useState<InterviewSession[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [storageLabel, setStorageLabel] = useState<string>(STORAGE_SOURCE_LABEL);
  const [isDbConnected, setIsDbConnected] = useState(false);

  // Sync session with DB in background (non-blocking)
  const syncSessionToDb = (session: InterviewSession) => {
    saveSessionToDb(session)
      .then((res) => {
        if (res.source === "Azure Cosmos DB") {
          setStorageLabel("Azure Cosmos DB");
          setIsDbConnected(true);
        }
      })
      .catch((err) => {
        console.warn("Background DB sync notice:", err.message);
      });
  };

  const refreshHistory = () => {
    setHistorySessions(getStoredSessions());
  };

  const refreshDbData = async () => {
    try {
      const dbStatus = await fetchDbStatus().catch(() => null);
      if (dbStatus && dbStatus.configured) {
        setIsDbConnected(true);
        setStorageLabel("Azure Cosmos DB");
      }

      const dbRes = await fetchSessionsFromDb().catch(() => null);
      if (dbRes && dbRes.configured && Array.isArray(dbRes.sessions) && dbRes.sessions.length > 0) {
        setHistorySessions(dbRes.sessions);
        setStorageLabel(dbRes.source || "Azure Cosmos DB");
        setIsDbConnected(true);
        // Also update local cache for offline availability
        dbRes.sessions.forEach((s) => saveSessionLocal(s));
      }
    } catch (e) {
      console.warn("Could not sync with Cosmos DB on load:", e);
    }
  };

  // Initialize from localStorage immediately, then reconcile with database
  useEffect(() => {
    try {
      const active = getActiveSession();
      const history = getStoredSessions();
      setActiveSessionState(active);
      setHistorySessions(history);
    } finally {
      setIsLoaded(true);
    }

    refreshDbData();
  }, []);

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
    saveSessionLocal(newSession);
    syncSessionToDb(newSession);
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
    saveSessionLocal(updated);
    syncSessionToDb(updated);
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
    saveSessionLocal(updated);
    syncSessionToDb(updated);
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
      saveSessionLocal(updated);
      syncSessionToDb(updated);
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
      saveSessionLocal(updated);
      syncSessionToDb(updated);
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
      saveSessionLocal(updated);
      syncSessionToDb(updated);
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
    saveSessionLocal(finalized);
    syncSessionToDb(finalized);
    refreshHistory();
  };

  const discardCurrentSession = () => {
    setActiveSessionState(null);
    saveActiveSession(null);
  };

  const deleteHistorySession = (id: string) => {
    removeStoredSession(id);
    deleteSessionFromDb(id).catch((err) => {
      console.warn("Cosmos DB delete warning:", err.message);
    });

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
        storageLabel,
        isDbConnected,
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
        refreshDbData,
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
