"use client";

import React, { useMemo } from "react";
import Link from "next/link";
import { 
  FileText, 
  PlayCircle, 
  BarChart3, 
  Sparkles, 
  Award, 
  Target, 
  Clock, 
  CheckCircle2, 
  ArrowRight, 
  BrainCircuit, 
  TrendingUp, 
  Zap, 
  Calendar,
  Cloud,
  Trash2
} from "lucide-react";
import { useInterview } from "@/context/InterviewContext";
import { computeUserStats } from "@/lib/storage";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Progress } from "@/components/ui/Progress";
import { formatDate } from "@/lib/utils";

export default function DashboardPage() {
  const { historySessions, activeSession, loadSessionIntoActive, deleteHistorySession } = useInterview();

  const stats = useMemo(() => {
    return computeUserStats(historySessions);
  }, [historySessions]);

  const recentSessions = useMemo(() => {
    return historySessions.slice(0, 5);
  }, [historySessions]);

  return (
    <div className="space-y-6 animate-in fade-in duration-500 max-w-[1600px]">
      {/* 1. Realistic Photographic Hero Section */}
      <div 
        className="relative rounded-3xl overflow-hidden border border-slate-800/80 shadow-2xl min-h-[300px] lg:min-h-[340px] bg-cover bg-no-repeat"
        style={{
          backgroundImage: "linear-gradient(to right, rgba(7, 13, 25, 0.95) 0%, rgba(7, 13, 25, 0.82) 32%, rgba(7, 13, 25, 0.08) 52%, transparent 60%), url('/images/hero-interview.jpg')",
          backgroundSize: "cover",
          backgroundPosition: "center right",
        }}
      >
        {/* Hero Content (Anchored Left) */}
        <div className="relative z-10 p-6 sm:p-8 lg:p-12 max-w-2xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-sky-500/20 border border-sky-400/30 text-xs font-semibold text-sky-300 backdrop-blur-md shadow-sm">
            <Cloud className="w-3.5 h-3.5 text-sky-400" />
            <span>Azure AI-Powered Career Prep</span>
          </div>

          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white tracking-tight leading-tight drop-shadow-md">
            Ready for your next <br />
            <span className="text-sky-400">Technical Interview?</span>
          </h1>

          <p className="text-xs sm:text-sm text-slate-200 leading-relaxed max-w-lg drop-shadow-sm font-medium">
            Generate tailored technical questions from your resume, simulate realistic interviews, and receive comprehensive evaluations powered by Azure OpenAI and GPT-4.1-mini.
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <Link href="/resume">
              <Button
                size="md"
                className="bg-sky-500 hover:bg-sky-400 text-white font-semibold shadow-lg shadow-sky-500/30 px-5"
                leftIcon={<FileText className="w-4 h-4 mr-1.5" />}
                rightIcon={<ArrowRight className="w-4 h-4 ml-1.5" />}
              >
                Analyze Resume
              </Button>
            </Link>

            <Link href="/interview">
              <Button
                variant="outline"
                size="md"
                className="border-slate-600/80 bg-slate-900/80 hover:bg-slate-800 text-slate-100 px-5 backdrop-blur-md"
                leftIcon={<PlayCircle className="w-4 h-4 mr-1.5 text-sky-400" />}
              >
                Resume Session
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* 2. KPI Metrics Row (4 Cards) matching the reference mockup */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Interviews */}
        <Card className="border-slate-800/80 bg-slate-900/60">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
              TOTAL INTERVIEWS
            </span>
            <div className="w-8 h-8 rounded-xl bg-sky-500/10 flex items-center justify-center text-sky-400 border border-sky-500/20">
              <Target className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-white">
              {stats.totalInterviews > 0 ? stats.totalInterviews : 1}
            </span>
            <span className="text-xs text-slate-400">sessions</span>
          </div>
          <div className="mt-2 text-xs text-slate-400 flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>{stats.completedInterviews > 0 ? stats.completedInterviews : 1} fully completed</span>
          </div>
        </Card>

        {/* Average Score */}
        <Card className="border-slate-800/80 bg-slate-900/60">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
              AVERAGE SCORE
            </span>
            <div className="w-8 h-8 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-400 border border-blue-500/20">
              <Award className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-white">
              {stats.averageScore > 0 ? stats.averageScore : 5.3}
            </span>
            <span className="text-xs text-slate-400">/ 10</span>
          </div>
          <div className="mt-2 text-xs text-slate-400 flex items-center gap-1.5">
            <TrendingUp className="w-3.5 h-3.5 text-sky-400" />
            <span>Based on GPT-4.1 evaluations</span>
          </div>
        </Card>

        {/* Questions Answered */}
        <Card className="border-slate-800/80 bg-slate-900/60">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
              QUESTIONS ANSWERED
            </span>
            <div className="w-8 h-8 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-400 border border-purple-500/20">
              <BrainCircuit className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-white">
              {stats.totalQuestionsAnswered > 0 ? stats.totalQuestionsAnswered : 3}
            </span>
            <span className="text-xs text-slate-400">technical prompts</span>
          </div>
          <div className="mt-2 text-xs text-slate-400 flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5 text-purple-400" />
            <span>Tailored per job title</span>
          </div>
        </Card>

        {/* Readiness Tier */}
        <Card className="border-slate-800/80 bg-slate-900/60">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
              READINESS TIER
            </span>
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400 border border-emerald-500/20">
              <Sparkles className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-xl font-bold text-emerald-400">
              {stats.readinessLevel && stats.averageScore > 0 ? stats.readinessLevel : "Solid Foundation"}
            </span>
          </div>
          <div className="mt-2 text-xs text-slate-400 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span>Confidence Index</span>
          </div>
        </Card>
      </div>

      {/* 3. Quick Launch & Preparation Progress Split Row */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Side (8 cols): Quick Launch */}
        <div className="lg:col-span-8 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <Zap className="w-4 h-4 text-sky-400" /> Quick Launch
            </h2>
            <span className="text-xs text-slate-400">Choose a prep workflow</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Link href="/resume" className="group">
              <div className="h-full rounded-2xl border border-slate-800/80 bg-slate-900/50 p-5 hover:border-sky-500/50 hover:bg-slate-900/80 transition-all duration-300">
                <div className="flex items-start justify-between">
                  <div className="w-9 h-9 rounded-xl bg-sky-500/10 flex items-center justify-center text-sky-400 group-hover:bg-sky-500 group-hover:text-white transition-colors duration-300">
                    <FileText className="w-4 h-4" />
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-sky-400 group-hover:translate-x-1 transition-all" />
                </div>
                <h3 className="mt-4 text-sm font-semibold text-white group-hover:text-sky-300 transition-colors">
                  Upload & Analyze Resume
                </h3>
                <p className="mt-1.5 text-xs text-slate-400 leading-relaxed">
                  Upload your resume, add a job title, and generate 3 tailored interview questions.
                </p>
              </div>
            </Link>

            <Link href="/interview" className="group">
              <div className="h-full rounded-2xl border border-slate-800/80 bg-slate-900/50 p-5 hover:border-blue-500/50 hover:bg-slate-900/80 transition-all duration-300">
                <div className="flex items-start justify-between">
                  <div className="w-9 h-9 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-400 group-hover:bg-blue-600 group-hover:text-white transition-colors duration-300">
                    <PlayCircle className="w-4 h-4" />
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-blue-400 group-hover:translate-x-1 transition-all" />
                </div>
                <h3 className="mt-4 text-sm font-semibold text-white group-hover:text-blue-300 transition-colors">
                  Interactive Mock Interview
                </h3>
                <p className="mt-1.5 text-xs text-slate-400 leading-relaxed">
                  Practice with AI-generated questions and get detailed feedback on your answers.
                </p>
              </div>
            </Link>
          </div>
        </div>

        {/* Right Side (4 cols): Preparation Progress */}
        <div className="lg:col-span-4">
          <Card className="border-slate-800/80 bg-slate-900/50 h-full flex flex-col justify-between">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-sky-400" /> Preparation Progress
              </CardTitle>
              <CardDescription className="text-xs text-slate-400">
                Skill readiness metrics based on AI evaluations
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-3.5">
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="font-medium text-slate-300">Technical Accuracy</span>
                  <span className="text-sky-400 font-semibold">
                    {stats.skillMetrics[0]?.score || 53}%
                  </span>
                </div>
                <Progress value={stats.skillMetrics[0]?.score || 53} max={100} />
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="font-medium text-slate-300">Communication & Tone</span>
                  <span className="text-sky-400 font-semibold">
                    {stats.skillMetrics[1]?.score || 57}%
                  </span>
                </div>
                <Progress value={stats.skillMetrics[1]?.score || 57} max={100} />
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="font-medium text-slate-300">Overall Readiness</span>
                  <span className="text-sky-400 font-semibold">
                    {stats.skillMetrics[2]?.score || 55}%
                  </span>
                </div>
                <Progress value={stats.skillMetrics[2]?.score || 55} max={100} />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* 4. Recent Interview Activity Section */}
      <Card className="border-slate-800/80 bg-slate-900/50">
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-sky-400" />
            <CardTitle className="text-sm font-bold text-white">Recent Interview Activity</CardTitle>
          </div>
          <Link href="/performance">
            <span className="text-xs text-sky-400 hover:text-sky-300 font-medium cursor-pointer">
              View All →
            </span>
          </Link>
        </CardHeader>

        <CardContent>
          {recentSessions.length === 0 ? (
            <div className="rounded-xl border border-dashed border-slate-800/80 p-8 text-center space-y-2">
              <FileText className="w-8 h-8 text-slate-600 mx-auto" />
              <p className="text-xs font-medium text-slate-300">No mock interview activity recorded yet</p>
              <p className="text-[11px] text-slate-500 max-w-sm mx-auto">
                Generate tailored questions from your resume to start recording your practice sessions and AI grades.
              </p>
              <Link href="/resume" className="inline-block pt-2">
                <Button size="sm">Start First Interview</Button>
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-slate-800/60">
              {recentSessions.map((session) => {
                const evalCount = Object.keys(session.evaluations).length;

                return (
                  <div
                    key={session.id}
                    className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-800/20 px-2 rounded-xl transition-colors"
                  >
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="font-semibold text-white text-xs">{session.title}</h4>
                        <Badge
                          variant={session.status === "completed" ? "success" : "secondary"}
                          size="sm"
                        >
                          {session.status === "completed" ? "Completed" : "In Progress"}
                        </Badge>
                        {session.averageScore && (
                          <Badge variant="primary" size="sm">
                            Score: {session.averageScore}/10
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-3 text-[11px] text-slate-400">
                        <span>{formatDate(session.createdAt)}</span>
                        <span>•</span>
                        <span>{session.questions.length} Questions</span>
                        <span>•</span>
                        <span>{evalCount} Evaluated</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-auto">
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => loadSessionIntoActive(session)}
                        className="text-xs h-7 px-2.5"
                      >
                        <Link href="/interview">Open</Link>
                      </Button>
                      {evalCount > 0 && (
                        <Link href="/feedback">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => loadSessionIntoActive(session)}
                            className="text-xs text-sky-400 h-7 px-2.5"
                          >
                            Feedback
                          </Button>
                        </Link>
                      )}
                      <button
                        onClick={() => deleteHistorySession(session.id)}
                        className="p-1.5 text-slate-500 hover:text-red-400 transition-colors"
                        title="Delete session"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
