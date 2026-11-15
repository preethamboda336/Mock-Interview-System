"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  PlayCircle, 
  ChevronLeft, 
  ChevronRight, 
  Sparkles, 
  Send, 
  Mic, 
  MicOff, 
  RotateCcw, 
  CheckCircle2, 
  AlertCircle, 
  FileText, 
  HelpCircle,
  Clock,
  Award
} from "lucide-react";
import { useInterview } from "@/context/InterviewContext";
import { evaluateAnswer } from "@/lib/api";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Progress } from "@/components/ui/Progress";

// Fallback sample questions if user navigates to /interview directly without running resume generator first
const DEFAULT_FALLBACK_QUESTIONS = [
  "How would you design a scalable serverless architecture on Azure using Azure Functions and Cosmos DB to handle unpredictable traffic spikes?",
  "Explain the difference between synchronous and asynchronous operations in Node.js. How does the event loop handle long-running I/O tasks?",
  "What strategies and Azure services would you implement to secure REST API endpoints against unauthorized access and SQL/NoSQL injection attacks?",
];

export default function MockInterviewPage() {
  const router = useRouter();
  const { 
    activeSession, 
    updateAnswer, 
    saveEvaluationForCurrentQuestion, 
    nextQuestion, 
    prevQuestion, 
    goToQuestion,
    startNewSession,
    finishCurrentInterview 
  } = useInterview();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isListening, setIsListening] = useState(false);
  const [recognitionSupported, setRecognitionSupported] = useState(false);

  // If there's no active session, provide fallback initialization helper
  const handleStartQuickSession = () => {
    startNewSession(
      "Cloud & Backend Engineer",
      "Specialist in serverless systems, REST APIs, and microservices.",
      DEFAULT_FALLBACK_QUESTIONS
    );
  };

  const currentIdx = activeSession ? activeSession.currentQuestionIndex : 0;
  const currentQ = activeSession?.questions[currentIdx];
  const currentAnswer = (currentQ && activeSession?.answers[currentQ.id]) || "";
  const currentFeedback = currentQ && activeSession?.evaluations[currentQ.id];

  // Word count and character count
  const wordCount = currentAnswer.trim() ? currentAnswer.trim().split(/\s+/).length : 0;

  // Speech Recognition setup (Web Speech API)
  useEffect(() => {
    if (typeof window !== "undefined") {
      const SpeechRecognition =
        (window as unknown as { SpeechRecognition?: unknown }).SpeechRecognition ||
        (window as unknown as { webkitSpeechRecognition?: unknown }).webkitSpeechRecognition;
      setRecognitionSupported(!!SpeechRecognition);
    }
  }, []);

  const toggleSpeechRecognition = () => {
    if (!recognitionSupported || typeof window === "undefined") return;

    type SpeechRecognitionType = {
      continuous: boolean;
      interimResults: boolean;
      lang: string;
      onresult: (e: { results: Array<Array<{ transcript: string }>> }) => void;
      onerror: () => void;
      onend: () => void;
      start: () => void;
      stop: () => void;
    };

    const SpeechRecognitionConstructor = (window as unknown as {
      SpeechRecognition?: new () => SpeechRecognitionType;
      webkitSpeechRecognition?: new () => SpeechRecognitionType;
    }).SpeechRecognition || (window as unknown as {
      webkitSpeechRecognition?: new () => SpeechRecognitionType;
    }).webkitSpeechRecognition;

    if (!SpeechRecognitionConstructor) return;

    if (isListening) {
      setIsListening(false);
      return;
    }

    try {
      const recognition = new SpeechRecognitionConstructor();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = "en-US";

      recognition.onresult = (event: { results: Array<Array<{ transcript: string }>> }) => {
        let transcript = "";
        for (let i = 0; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript + " ";
        }
        if (currentQ) {
          updateAnswer(currentQ.id, (currentAnswer ? currentAnswer + " " : "") + transcript.trim());
        }
      };

      recognition.onerror = () => {
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.start();
      setIsListening(true);
    } catch {
      setIsListening(false);
    }
  };

  // Submit Answer to /api/evaluateAnswer
  const handleSubmitAnswer = async () => {
    if (!currentQ) return;
    if (!currentAnswer.trim()) {
      setErrorMessage("Please type or speak your answer before submitting.");
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      // Call Azure Functions API
      const feedback = await evaluateAnswer(currentQ.cleanText || currentQ.rawText, currentAnswer.trim());
      
      // Save feedback in context and local storage
      saveEvaluationForCurrentQuestion(feedback);

      // Redirect directly to AI Feedback screen to review detailed scorecard
      router.push("/feedback");
    } catch (err: unknown) {
      console.error("Evaluation failed:", err);
      const msg = err instanceof Error ? err.message : "Failed to evaluate answer. Ensure backend is running.";
      setErrorMessage(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!activeSession || !currentQ) {
    return (
      <div className="max-w-2xl mx-auto py-12 text-center space-y-6">
        <div className="w-16 h-16 rounded-3xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400 mx-auto">
          <PlayCircle className="w-8 h-8" />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-white">No Active Interview Session</h2>
          <p className="text-sm text-slate-400">
            You don&apos;t have an ongoing interview session right now. You can analyze your resume to generate questions, or launch a quick sample session immediately.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
          <Link href="/resume">
            <Button size="lg" leftIcon={<FileText className="w-4 h-4" />}>
              Analyze Resume First
            </Button>
          </Link>
          <Button
            variant="secondary"
            size="lg"
            onClick={handleStartQuickSession}
            rightIcon={<Sparkles className="w-4 h-4" />}
          >
            Launch Cloud Backend Sample Set
          </Button>
        </div>
      </div>
    );
  }

  const totalQuestions = activeSession.questions.length;
  const progressPercent = Math.round(((currentIdx + 1) / totalQuestions) * 100);
  const isLastQuestion = currentIdx === totalQuestions - 1;

  return (
    <div className="space-y-6 max-w-4xl mx-auto animate-in fade-in duration-500">
      {/* Session Progress Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-800/80">
        <div>
          <div className="flex items-center gap-2">
            <Badge variant="primary" size="sm">
              {activeSession.jobTitle}
            </Badge>
            <span className="text-xs text-slate-400">Mock Session</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-white mt-1">
            Question {currentIdx + 1} of {totalQuestions}
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <span className="text-xs font-semibold text-slate-300">{progressPercent}% Completed</span>
            <div className="w-32 mt-1">
              <Progress value={progressPercent} max={100} />
            </div>
          </div>

          <Link href="/feedback">
            <Button variant="ghost" size="sm" className="text-xs text-sky-400">
              View All Feedback
            </Button>
          </Link>
        </div>
      </div>

      {/* Stepper Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {activeSession.questions.map((q, idx) => {
          const hasAnswer = !!activeSession.answers[q.id]?.trim();
          const hasFeedback = !!activeSession.evaluations[q.id];
          const isCurrent = idx === currentIdx;

          return (
            <button
              key={q.id}
              onClick={() => goToQuestion(idx)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all shrink-0 ${
                isCurrent
                  ? "bg-sky-500 text-white shadow-lg shadow-sky-500/20"
                  : hasFeedback
                  ? "bg-emerald-950/40 text-emerald-300 border border-emerald-500/30"
                  : hasAnswer
                  ? "bg-slate-800 text-slate-200 border border-slate-700"
                  : "bg-slate-900/60 text-slate-400 border border-slate-800"
              }`}
            >
              <span>Q{idx + 1}</span>
              {hasFeedback && <CheckCircle2 className="w-3 h-3 text-emerald-400" />}
            </button>
          );
        })}
      </div>

      {/* Main Question Card */}
      <Card glow className="border-slate-800/90 shadow-2xl">
        <CardHeader>
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-sky-400 uppercase tracking-wider flex items-center gap-1.5">
              <HelpCircle className="w-3.5 h-3.5" /> Technical Question
            </span>
            <Badge variant="purple" size="sm">
              {currentQ.difficulty || "Technical Assessment"}
            </Badge>
          </div>
          <CardTitle className="text-lg sm:text-xl font-semibold text-white leading-relaxed mt-2">
            {currentQ.cleanText || currentQ.rawText}
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-4 pt-2">
          {/* Answer Textarea */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span className="font-medium text-slate-300">Your Technical Response:</span>
              <div className="flex items-center gap-3">
                <span>{wordCount} words</span>
                <span>•</span>
                <span>{currentAnswer.length} chars</span>
              </div>
            </div>

            <div className="relative">
              <textarea
                rows={9}
                value={currentAnswer}
                onChange={(e) => updateAnswer(currentQ.id, e.target.value)}
                placeholder="Structure your answer clearly:
1. Direct definition or core architectural approach
2. Technical components, patterns or Azure services involved
3. Real-world tradeoffs, performance, and failure modes..."
                className="w-full rounded-2xl bg-slate-950/80 border border-slate-700/80 p-4 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 leading-relaxed font-sans resize-y"
              />

              {/* Dictation voice button */}
              {recognitionSupported && (
                <button
                  type="button"
                  onClick={toggleSpeechRecognition}
                  className={`absolute bottom-4 right-4 p-2.5 rounded-xl border transition-all ${
                    isListening
                      ? "bg-rose-500 text-white border-rose-400 animate-pulse"
                      : "bg-slate-800/80 hover:bg-slate-700 text-slate-300 border-slate-700 hover:text-white"
                  }`}
                  title={isListening ? "Stop voice dictation" : "Dictate answer via microphone"}
                >
                  {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                </button>
              )}
            </div>
          </div>

          {/* Previous Evaluation Banner if already evaluated */}
          {currentFeedback && (
            <div className="rounded-xl border border-emerald-500/30 bg-emerald-950/20 p-4 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                  <Award className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-emerald-300">
                    Already Evaluated: {currentFeedback.score}
                  </p>
                  <p className="text-[11px] text-slate-400">
                    You can edit your answer and re-evaluate, or view the complete feedback.
                  </p>
                </div>
              </div>
              <Link href="/feedback">
                <Button size="sm" variant="outline" className="text-xs border-emerald-500/40 text-emerald-300">
                  Review Feedback
                </Button>
              </Link>
            </div>
          )}

          {/* Error Message */}
          {errorMessage && (
            <div className="rounded-xl border border-rose-500/30 bg-rose-950/30 p-3.5 text-xs text-rose-300 flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-rose-200">Evaluation Failed</p>
                <p className="mt-0.5">{errorMessage}</p>
              </div>
            </div>
          )}
        </CardContent>

        <CardFooter className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Button
              variant="secondary"
              size="md"
              onClick={prevQuestion}
              disabled={currentIdx === 0}
              leftIcon={<ChevronLeft className="w-4 h-4" />}
              className="flex-1 sm:flex-none"
            >
              Previous
            </Button>
            <Button
              variant="secondary"
              size="md"
              onClick={nextQuestion}
              disabled={isLastQuestion}
              rightIcon={<ChevronRight className="w-4 h-4" />}
              className="flex-1 sm:flex-none"
            >
              Next Question
            </Button>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <Button
              size="md"
              onClick={handleSubmitAnswer}
              isLoading={isSubmitting}
              className="w-full sm:w-auto shadow-sky-500/20"
              rightIcon={<Send className="w-4 h-4" />}
            >
              {isSubmitting ? "Evaluating with Azure AI..." : "Submit Answer & Grade"}
            </Button>
          </div>
        </CardFooter>
      </Card>

      {/* Bottom Completion Card when on last question */}
      {isLastQuestion && Object.keys(activeSession.evaluations).length > 0 && (
        <div className="rounded-2xl border border-sky-500/30 bg-gradient-to-r from-sky-950/40 to-slate-900/60 p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <h4 className="font-semibold text-white text-sm">Ready to wrap up this interview?</h4>
            <p className="text-xs text-slate-400">
              Mark this session completed to compute your final scorecard and view overall trends.
            </p>
          </div>
          <Button
            variant="success"
            size="md"
            onClick={() => {
              finishCurrentInterview();
              router.push("/feedback");
            }}
          >
            Finish Interview & View Report
          </Button>
        </div>
      )}
    </div>
  );
}

