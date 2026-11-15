import { EvaluationFeedback } from "@/types/interview";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:7071";

export class ApiError extends Error {
  statusCode: number;
  details?: unknown;

  constructor(message: string, statusCode: number = 500, details?: unknown) {
    super(message);
    this.name = "ApiError";
    this.statusCode = statusCode;
    this.details = details;
  }
}

/**
 * Resilient request helper that tries the direct Azure Functions URL first,
 * and falls back to Next.js proxy route if a browser network/CORS error occurs.
 */
async function makePostRequest<T>(endpoint: string, payload: Record<string, unknown>): Promise<T> {
  const directUrl = `${API_BASE.replace(/\/$/, "")}/api/${endpoint}`;
  const proxyUrl = `/api/proxy/${endpoint}`;

  // First attempt: direct API call
  try {
    const res = await fetch(directUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (res.ok) {
      return (await res.json()) as T;
    }

    const errData = await res.json().catch(() => ({}));
    throw new ApiError(
      errData.error || `Server responded with status ${res.status}`,
      res.status,
      errData
    );
  } catch (err: unknown) {
    // If it's an ApiError (HTTP status like 400 or 500), don't retry proxy if it was a real backend error
    if (err instanceof ApiError && err.statusCode !== 0) {
      throw err;
    }

    // If it was a network error (like CORS blocked or local connection refused), attempt Next.js proxy fallback
    if (typeof window !== "undefined") {
      try {
        const proxyRes = await fetch(proxyUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        });

        if (proxyRes.ok) {
          return (await proxyRes.json()) as T;
        }

        const proxyErrData = await proxyRes.json().catch(() => ({}));
        throw new ApiError(
          proxyErrData.error || `Server responded with status ${proxyRes.status}`,
          proxyRes.status,
          proxyErrData
        );
      } catch (proxyErr) {
        if (proxyErr instanceof ApiError) {
          throw proxyErr;
        }
      }
    }

    // If both failed, provide a clear, helpful message
    const msg = err instanceof Error ? err.message : "Network error";
    throw new ApiError(
      `Unable to connect to Azure Function at ${directUrl}. Please ensure your Azure Functions backend is running (e.g. 'func start' on port 7071). Details: ${msg}`,
      503
    );
  }
}

/**
 * Generate technical interview questions based on resume text or job title
 */
export async function generateQuestions(resumeText: string): Promise<string[]> {
  if (!resumeText || !resumeText.trim()) {
    throw new ApiError("Please provide a resume or job description to generate questions.", 400);
  }

  const response = await makePostRequest<{ questions: string[]; error?: string }>(
    "generateQuestions",
    { resumeText: resumeText.trim() }
  );

  if (!response.questions || !Array.isArray(response.questions)) {
    throw new ApiError("Invalid response format received from question generator.", 500);
  }

  return response.questions;
}

/**
 * Submit candidate's answer for comprehensive AI evaluation
 */
export async function evaluateAnswer(
  question: string,
  answer: string
): Promise<EvaluationFeedback> {
  if (!question || !question.trim()) {
    throw new ApiError("Question cannot be empty.", 400);
  }

  if (!answer || !answer.trim()) {
    throw new ApiError("Please provide an answer to evaluate.", 400);
  }

  const response = await makePostRequest<{ feedback: EvaluationFeedback; error?: string }>(
    "evaluateAnswer",
    {
      question: question.trim(),
      answer: answer.trim(),
    }
  );

  if (!response.feedback) {
    throw new ApiError("No evaluation feedback returned by the evaluator.", 500);
  }

  return response.feedback;
}

