"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import { 
  BarChart3, 
  TrendingUp, 
  Award, 
  Clock, 
  Calendar, 
  CheckCircle2, 
  AlertCircle, 
  Trash2, 
  Download, 
  Database, 
  ArrowRight, 
  Sparkles, 
  FileText,
  RotateCcw
} from "lucide-react";
import { useInterview } from "@/context/InterviewContext";
import { computeUserStats, clearAllLocalSessions } from "@/lib/storage";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Progress } from "@/components/ui/Progress";
import { formatDate, extractNumericalScore } from "@/lib/utils";

export default function PerformancePage() {
  const { historySessions, deleteHistorySession, loadSessionIntoActive, storageLabel } = useInterview();

  const stats = useMemo(() => {
    return computeUserStats(historySessions);
  }, [historySessions]);

  // Extract trend data points
  const scoreTrends = useMemo(() => {
    const list: { title: string; score: number; date: string }[] = [];
    // Take sessions that have evaluations, reverse chronological or chronological
    [...historySessions]
      .reverse()
      .forEach((s) => {
        const scores = Object.values(s.evaluations).map((e) => extractNumericalScore(e.score));
        if (scores.length > 0) {
          const avg = Number((scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(1));
          list.push({
            title: s.jobTitle || "Mock Session",
            score: avg,
            date: formatDate(s.createdAt),
          });
        }
      });
    return list;
  }, [historySessions]);

  const handleExportData = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(historySessions, null, 2));
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `ai_career_coach_history_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleClearHistory = () => {
    if (confirm("Are you sure you want to reset all locally saved interview records? This cannot be undone.")) {
      clearAllLocalSessions();
      window.location.reload();
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800/80">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-500/10 border border-sky-500/20 text-xs font-semibold text-sky-400 mb-2">
            <Sparkles className="w-3.5 h-3.5" /> Stage 4: Analytics & Continuous Improvement
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Performance Analytics & Interview History
          </h1>
          <p className="text-sm text-slate-300 mt-1">
            Track evaluation trajectories, skill mastery distributions, and review past mock interviews.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {historySessions.length > 0 && (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={handleExportData}
                leftIcon={<Download className="w-3.5 h-3.5" />}
                className="text-xs"
              >
                Export JSON
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClearHistory}
                leftIcon={<Trash2 className="w-3.5 h-3.5 text-rose-400" />}
                className="text-xs text-rose-400 hover:text-rose-300 hover:bg-rose-950/20"
              >
                Clear History
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Storage Architecture Distinction Alert (Requirement 6) */}
      <div className="rounded-2xl border border-sky-500/30 bg-sky-950/20 p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-xl bg-sky-500/20 border border-sky-500/30 flex items-center justify-center text-sky-400 flex-shrink-0 mt-0.5">
            <Database className="w-4 h-4" />
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-sky-300 uppercase tracking-wider">
                Storage Architecture Notice
              </span>
              <Badge variant="primary" size="sm">
                {storageLabel}
              </Badge>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Interview sessions and scorecards are currently stored locally in your browser (<code className="font-mono text-sky-300">localStorage</code>). When you connect an Azure Cosmos DB or SQL instance, sessions can synchronize seamlessly across all your devices.
            </p>
          </div>
        </div>
      </div>

      {/* Top Level Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-slate-800/80">
          <span className="text-xs font-medium uppercase text-slate-400 tracking-wider">Total Mock Sessions</span>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-white">{stats.totalInterviews}</span>
            <span className="text-xs text-slate-400">recorded</span>
          </div>
          <div className="mt-2 text-xs text-slate-400 flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>{stats.completedInterviews} completed sessions</span>
          </div>
        </Card>

        <Card className="border-slate-800/80">
          <span className="text-xs font-medium uppercase text-slate-400 tracking-wider">Historical Average</span>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-white">
              {stats.averageScore > 0 ? stats.averageScore : "—"}
            </span>
            <span className="text-xs text-slate-400">/ 10</span>
          </div>
          <div className="mt-2 text-xs text-slate-400 flex items-center gap-1.5">
            <Award className="w-3.5 h-3.5 text-sky-400" />
            <span>Across all evaluated questions</span>
          </div>
        </Card>

        <Card className="border-slate-800/80">
          <span className="text-xs font-medium uppercase text-slate-400 tracking-wider">Questions Answered</span>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-white">{stats.totalQuestionsAnswered}</span>
            <span className="text-xs text-slate-400">answers</span>
          </div>
          <div className="mt-2 text-xs text-slate-400 flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-purple-400" />
            <span>Technical practice depth</span>
          </div>
        </Card>

        <Card className="border-slate-800/80">
          <span className="text-xs font-medium uppercase text-slate-400 tracking-wider">Current Mastery Tier</span>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-xl font-bold text-emerald-400">{stats.readinessLevel}</span>
          </div>
          <div className="mt-2 text-xs text-slate-400 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
            <span>Azure readiness index</span>
          </div>
        </Card>
      </div>

      {/* Middle Grid: Score Trends + Skill Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Score Trends (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          <Card className="border-slate-800/80 h-full">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-sky-400" /> Score Progression Trajectory
              </CardTitle>
              <CardDescription>
                Chronological score trend across past mock interview sessions
              </CardDescription>
            </CardHeader>

            <CardContent>
              {scoreTrends.length === 0 ? (
                <div className="rounded-xl border border-dashed border-slate-800 p-8 text-center my-6">
                  <BarChart3 className="w-10 h-10 text-slate-600 mx-auto mb-2" />
                  <p className="text-sm font-medium text-slate-300">No score history available yet</p>
                  <p className="text-xs text-slate-500 mt-1">
                    Complete your first mock interview evaluation to begin charting your trajectory.
                  </p>
                </div>
              ) : (
                <div className="space-y-4 pt-2">
                  <div className="space-y-3">
                    {scoreTrends.map((point, index) => {
                      const barPercent = Math.min(100, Math.round((point.score / 10) * 100));
                      return (
                        <div key={index} className="space-y-1">
                          <div className="flex justify-between text-xs">
                            <span className="font-medium text-slate-200">
                              Session {index + 1}: {point.title}
                            </span>
                            <span className="font-bold text-sky-400">{point.score}/10</span>
                          </div>
                          <div className="w-full bg-slate-800/80 rounded-full h-3 overflow-hidden border border-slate-700/50 p-0.5">
                            <div
                              className="h-full rounded-full bg-gradient-to-r from-sky-500 via-blue-500 to-cyan-400 transition-all duration-700"
                              style={{ width: `${barPercent}%` }}
                            />
                          </div>
                          <div className="text-[10px] text-slate-500">{point.date}</div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Skill Improvement Insights (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <Card className="border-slate-800/80 h-full">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Award className="w-5 h-5 text-sky-400" /> Skill Improvement Insights
              </CardTitle>
              <CardDescription>
                Competency breakdown from GPT-4.1-mini evaluation criteria
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-5">
              {stats.skillMetrics.map((skill) => (
                <div key={skill.name} className="space-y-1.5">
                  <div className="flex justify-between text-xs">
                    <span className="font-medium text-slate-300">{skill.name}</span>
                    <span className="text-sky-400 font-semibold">{skill.score}%</span>
                  </div>
                  <Progress value={skill.score} max={100} />
                </div>
              ))}

              <div className="rounded-xl border border-slate-800/80 bg-slate-950/40 p-4 space-y-2 mt-4">
                <div className="flex items-center gap-2 text-xs font-semibold text-slate-200">
                  <Sparkles className="w-4 h-4 text-emerald-400" />
                  <span>Recommendation for Next Session</span>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Consistently structure technical answers using the STAR or Problem-Solution-Tradeoff method to maximize your Technical Accuracy score.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Full Interview History Table */}
      <Card className="border-slate-800/80">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg flex items-center gap-2">
                <Calendar className="w-5 h-5 text-sky-400" /> All Past Interview Sessions
              </CardTitle>
              <CardDescription>
                Detailed log of all recorded mock sessions with questions and scores
              </CardDescription>
            </div>
            <Badge variant="secondary" size="sm">
              {historySessions.length} Sessions
            </Badge>
          </div>
        </CardHeader>

        <CardContent>
          {historySessions.length === 0 ? (
            <div className="rounded-xl border border-dashed border-slate-800 p-8 text-center">
              <FileText className="w-10 h-10 text-slate-600 mx-auto mb-3" />
              <p className="text-sm font-medium text-slate-300">No session history yet</p>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                Generate questions from your resume and practice answers to view complete logs here.
              </p>
              <Link href="/resume" className="inline-block mt-4">
                <Button size="sm">Create First Session</Button>
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400">
                    <th className="pb-3 font-semibold">Job Title / Role</th>
                    <th className="pb-3 font-semibold">Date</th>
                    <th className="pb-3 font-semibold">Questions</th>
                    <th className="pb-3 font-semibold">Status</th>
                    <th className="pb-3 font-semibold">Average Score</th>
                    <th className="pb-3 font-semibold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-slate-200">
                  {historySessions.map((session) => {
                    const evalCount = Object.keys(session.evaluations).length;

                    return (
                      <tr key={session.id} className="hover:bg-slate-800/30 transition-colors">
                        <td className="py-3.5 pr-4">
                          <div className="font-semibold text-white">{session.title}</div>
                          <div className="text-[11px] text-slate-400 truncate max-w-xs">
                            {session.resumeSnippet || "No snippet recorded"}
                          </div>
                        </td>
                        <td className="py-3.5 pr-4 text-slate-400 whitespace-nowrap">
                          {formatDate(session.createdAt)}
                        </td>
                        <td className="py-3.5 pr-4 whitespace-nowrap">
                          {session.questions.length} questions ({evalCount} evaluated)
                        </td>
                        <td className="py-3.5 pr-4 whitespace-nowrap">
                          <Badge
                            variant={session.status === "completed" ? "success" : "secondary"}
                            size="sm"
                          >
                            {session.status === "completed" ? "Completed" : "In Progress"}
                          </Badge>
                        </td>
                        <td className="py-3.5 pr-4 whitespace-nowrap">
                          {session.averageScore ? (
                            <span className="font-bold text-sky-400">{session.averageScore} / 10</span>
                          ) : (
                            <span className="text-slate-500">—</span>
                          )}
                        </td>
                        <td className="py-3.5 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-2">
                            <Link href="/interview">
                              <Button
                                variant="secondary"
                                size="sm"
                                onClick={() => loadSessionIntoActive(session)}
                                className="text-xs"
                              >
                                Open
                              </Button>
                            </Link>
                            {evalCount > 0 && (
                              <Link href="/feedback">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => loadSessionIntoActive(session)}
                                  className="text-xs text-sky-400"
                                >
                                  Feedback
                                </Button>
                              </Link>
                            )}
                            <button
                              onClick={() => deleteHistorySession(session.id)}
                              className="p-1.5 text-slate-500 hover:text-red-400 transition-colors"
                              title="Delete record"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

