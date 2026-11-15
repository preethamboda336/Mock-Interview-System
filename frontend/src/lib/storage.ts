import { InterviewSession, UserStats } from "@/types/interview";

const SESSIONS_STORAGE_KEY = "ai_career_coach_sessions_v1";
const ACTIVE_SESSION_KEY = "ai_career_coach_active_session_v1";

export const STORAGE_SOURCE_LABEL = "Browser Local Storage";
export const STORAGE_IS_LOCAL_ONLY = true;

/**
 * Retrieve all completed & in-progress sessions stored locally
 */
export function getStoredSessions(): InterviewSession[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(SESSIONS_STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as InterviewSession[];
  } catch (e) {
    console.error("Failed to parse local sessions:", e);
    return [];
  }
}

/**
 * Save or update a session in local storage
 */
export function saveSession(session: InterviewSession): void {
  if (typeof window === "undefined") return;
  try {
    const sessions = getStoredSessions();
    const existingIndex = sessions.findIndex((s) => s.id === session.id);

    if (existingIndex >= 0) {
      sessions[existingIndex] = {
        ...session,
        updatedAt: new Date().toISOString(),
      };
    } else {
      sessions.unshift({
        ...session,
        updatedAt: new Date().toISOString(),
      });
    }

    localStorage.setItem(SESSIONS_STORAGE_KEY, JSON.stringify(sessions));
  } catch (e) {
    console.error("Failed to save session to localStorage:", e);
  }
}

/**
 * Delete a session from local storage
 */
export function deleteSession(id: string): void {
  if (typeof window === "undefined") return;
  try {
    const sessions = getStoredSessions().filter((s) => s.id !== id);
    localStorage.setItem(SESSIONS_STORAGE_KEY, JSON.stringify(sessions));
  } catch (e) {
    console.error("Failed to delete session from localStorage:", e);
  }
}

/**
 * Clear all locally stored sessions
 */
export function clearAllLocalSessions(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(SESSIONS_STORAGE_KEY);
  localStorage.removeItem(ACTIVE_SESSION_KEY);
}

/**
 * Save active session being worked on
 */
export function saveActiveSession(session: InterviewSession | null): void {
  if (typeof window === "undefined") return;
  if (!session) {
    localStorage.removeItem(ACTIVE_SESSION_KEY);
  } else {
    localStorage.setItem(ACTIVE_SESSION_KEY, JSON.stringify(session));
  }
}

/**
 * Get active session
 */
export function getActiveSession(): InterviewSession | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(ACTIVE_SESSION_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as InterviewSession;
  } catch {
    return null;
  }
}

/**
 * Compute aggregate statistics across all local sessions
 */
export function computeUserStats(sessions: InterviewSession[]): UserStats {
  const completed = sessions.filter((s) => s.status === "completed" || Object.keys(s.evaluations).length > 0);
  const totalQuestions = sessions.reduce((acc, s) => acc + Object.keys(s.answers).length, 0);

  const scores: number[] = [];
  sessions.forEach((s) => {
    Object.values(s.evaluations).forEach((feedback) => {
      // parse score e.g. "8.5/10" or "8"
      const match = feedback.score.match(/(\d+(?:\.\d+)?)/);
      if (match && match[1]) {
        const val = parseFloat(match[1]);
        if (!isNaN(val) && val <= 10) scores.push(val);
      }
    });
  });

  const avgScore = scores.length > 0 ? Number((scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(1)) : 0;

  // Determine readiness level
  let readiness = "Beginner Ready";
  if (avgScore >= 8.5) readiness = "Interview Master";
  else if (avgScore >= 7.0) readiness = "Strong Contender";
  else if (avgScore >= 5.0) readiness = "Solid Foundation";

  return {
    totalInterviews: sessions.length,
    completedInterviews: completed.length,
    averageScore: avgScore,
    totalQuestionsAnswered: totalQuestions,
    readinessLevel: readiness,
    skillMetrics: [
      { name: "Technical Accuracy", score: avgScore > 0 ? Math.round(avgScore * 10) : 0 },
      { name: "Communication & Tone", score: avgScore > 0 ? Math.min(100, Math.round(avgScore * 10 + 4)) : 0 },
      { name: "Question Relevance", score: avgScore > 0 ? Math.min(100, Math.round(avgScore * 10 + 6)) : 0 },
      { name: "Problem Solving Depth", score: avgScore > 0 ? Math.max(0, Math.round(avgScore * 10 - 5)) : 0 },
    ],
  };
}

