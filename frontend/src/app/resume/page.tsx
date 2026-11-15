"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { 
  FileText, 
  Sparkles, 
  UploadCloud, 
  CheckCircle2, 
  AlertCircle, 
  ArrowRight, 
  Bot, 
  Briefcase, 
  ListOrdered,
  RotateCcw,
  BookOpen
} from "lucide-react";
import { useInterview } from "@/context/InterviewContext";
import { generateQuestions } from "@/lib/api";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { cleanQuestionText } from "@/lib/utils";

// Sample resume templates for instant 1-click testing
const RESUME_PRESETS = [
  {
    title: "Azure Cloud & Python Engineer",
    role: "Senior Azure Python Developer",
    text: "Senior Backend Developer with 5 years experience specializing in Python, FastAPI, and Azure Functions. Built scalable microservices using Azure Service Bus, Cosmos DB, and Blob Storage. Proficient in Docker, CI/CD with GitHub Actions, and REST API design.",
  },
  {
    title: "Full-Stack Node.js & React Developer",
    role: "Full-Stack Engineer",
    text: "Full-Stack Engineer with expertise in TypeScript, React, Next.js, and Node.js backend services. Experienced in PostgreSQL, Redis caching, Tailwind CSS, and deploying serverless applications on Azure Cloud. Strong advocate for clean architecture and unit testing.",
  },
  {
    title: "AI & Machine Learning Engineer",
    role: "AI / ML Solutions Engineer",
    text: "AI Engineer experienced in Python, PyTorch, LangChain, and Azure OpenAI Service. Designed RAG pipelines, fine-tuned transformer models, and integrated vector databases for enterprise semantic search and conversational agents.",
  },
];

export default function ResumeAnalysisPage() {
  const router = useRouter();
  const { startNewSession } = useInterview();

  const [jobTitle, setJobTitle] = useState("Azure Backend Developer");
  const [resumeText, setResumeText] = useState(RESUME_PRESETS[0].text);
  const [seniority, setSeniority] = useState("Mid-Senior Level");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [generatedQuestions, setGeneratedQuestions] = useState<string[]>([]);
  const [fileName, setFileName] = useState<string | null>(null);

  // File upload handler (reads plain text or extracts text from file)
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        setResumeText(content);
      }
    };
    reader.readAsText(file);
  };

  const handleApplyPreset = (preset: typeof RESUME_PRESETS[0]) => {
    setJobTitle(preset.role);
    setResumeText(preset.text);
    setFileName(null);
  };

  const handleGenerateQuestions = async () => {
    if (!resumeText.trim()) {
      setErrorMessage("Please paste your resume or job experience description.");
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);
    setGeneratedQuestions([]);

    try {
      // Combines target role and resume for higher relevance prompt to Azure OpenAI
      const combinedPrompt = `Target Job Title: ${jobTitle || "Software Engineer"} (${seniority})\n\nCandidate Resume / Experience:\n${resumeText.trim()}`;
      
      const questions = await generateQuestions(combinedPrompt);
      setGeneratedQuestions(questions);
    } catch (err: unknown) {
      console.error("Question generation failed:", err);
      const msg = err instanceof Error ? err.message : "Failed to generate questions. Please ensure the backend is running.";
      setErrorMessage(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLaunchInterview = () => {
    if (generatedQuestions.length === 0) return;
    startNewSession(jobTitle, resumeText, generatedQuestions);
    router.push("/interview");
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-500/10 border border-sky-500/20 text-xs font-semibold text-sky-400 mb-2">
            <Sparkles className="w-3.5 h-3.5" /> Stage 1: Question Generation
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Resume Analysis & Tailored Questions
          </h1>
          <p className="text-sm text-slate-300 mt-1">
            Input your target role and resume to generate 3 focused technical interview questions using Azure OpenAI.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column (7 cols): Input Form & File Upload */}
        <div className="lg:col-span-7 space-y-6">
          <Card className="border-slate-800/80">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-sky-400" /> Target Role & Experience
              </CardTitle>
              <CardDescription>
                Define the job profile you are interviewing for
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-5">
              {/* Job Title and Seniority */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">
                    Target Job Title
                  </label>
                  <input
                    type="text"
                    value={jobTitle}
                    onChange={(e) => setJobTitle(e.target.value)}
                    placeholder="e.g. Senior Backend Engineer"
                    className="w-full rounded-xl bg-slate-950/80 border border-slate-700/80 px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">
                    Experience Level
                  </label>
                  <select
                    value={seniority}
                    onChange={(e) => setSeniority(e.target.value)}
                    className="w-full rounded-xl bg-slate-950/80 border border-slate-700/80 px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
                  >
                    <option value="Entry / Graduate Level">Entry / Graduate Level (0-2 yrs)</option>
                    <option value="Mid-Level Engineer">Mid-Level Engineer (2-5 yrs)</option>
                    <option value="Mid-Senior Level">Mid-Senior Level (5-8 yrs)</option>
                    <option value="Principal / Staff Engineer">Principal / Staff Engineer (8+ yrs)</option>
                  </select>
                </div>
              </div>

              {/* Presets */}
              <div className="space-y-2 pt-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-slate-400">Quick Test Presets:</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {RESUME_PRESETS.map((preset) => (
                    <button
                      key={preset.title}
                      type="button"
                      onClick={() => handleApplyPreset(preset)}
                      className="text-xs px-3 py-1.5 rounded-lg border border-slate-700 bg-slate-800/60 hover:bg-slate-700 hover:border-sky-500/50 text-slate-300 hover:text-white transition-all flex items-center gap-1.5"
                    >
                      <BookOpen className="w-3 h-3 text-sky-400" />
                      {preset.title}
                    </button>
                  ))}
                </div>
              </div>

              {/* File Upload Zone */}
              <div className="space-y-1.5 pt-2">
                <label className="text-xs font-semibold text-slate-300 flex items-center justify-between">
                  <span>Resume Content</span>
                  {fileName && (
                    <span className="text-[11px] text-emerald-400 font-normal flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> Loaded: {fileName}
                    </span>
                  )}
                </label>

                <div className="relative border-2 border-dashed border-slate-700/80 hover:border-sky-500/50 rounded-2xl p-4 bg-slate-950/40 text-center transition-colors group">
                  <input
                    type="file"
                    accept=".txt,.md,.json,.pdf,.doc,.docx"
                    onChange={handleFileUpload}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  <div className="flex flex-col items-center justify-center gap-1.5 pointer-events-none">
                    <UploadCloud className="w-7 h-7 text-sky-400 group-hover:scale-110 transition-transform" />
                    <p className="text-xs font-medium text-slate-300">
                      Drop resume file here, or <span className="text-sky-400 underline">browse</span>
                    </p>
                    <p className="text-[11px] text-slate-500">
                      Supports plain text, Markdown, and text-based files
                    </p>
                  </div>
                </div>
              </div>

              {/* Textarea */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-400">Or paste your resume text / key technical skills:</span>
                  <span className="text-slate-500">{resumeText.length} characters</span>
                </div>
                <textarea
                  rows={7}
                  value={resumeText}
                  onChange={(e) => setResumeText(e.target.value)}
                  placeholder="Paste your professional experience, technical stack, key projects and certifications..."
                  className="w-full rounded-xl bg-slate-950/80 border border-slate-700/80 p-3.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 font-mono text-xs leading-relaxed resize-y"
                />
              </div>

              {/* Error message */}
              {errorMessage && (
                <div className="rounded-xl border border-rose-500/30 bg-rose-950/30 p-3.5 text-xs text-rose-300 flex items-start gap-2.5">
                  <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-rose-200">Generation Failed</p>
                    <p className="mt-0.5">{errorMessage}</p>
                  </div>
                </div>
              )}

              {/* Submit Button */}
              <Button
                size="lg"
                onClick={handleGenerateQuestions}
                isLoading={isLoading}
                className="w-full shadow-lg shadow-sky-500/20"
                rightIcon={<Sparkles className="w-4 h-4" />}
              >
                {isLoading ? "Generating Technical Questions with Azure AI..." : "Generate Interview Questions"}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Right Column (5 cols): Generated Questions Preview */}
        <div className="lg:col-span-5 space-y-6">
          <Card className="border-slate-800/80 h-full flex flex-col justify-between">
            <div>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <ListOrdered className="w-5 h-5 text-sky-400" /> Generated Questions
                  </CardTitle>
                  {generatedQuestions.length > 0 && (
                    <Badge variant="success" size="sm">
                      {generatedQuestions.length} Ready
                    </Badge>
                  )}
                </div>
                <CardDescription>
                  Curated technical questions based on your profile
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-4">
                {isLoading && (
                  <div className="space-y-4 py-8">
                    <div className="flex flex-col items-center justify-center text-center space-y-3">
                      <div className="w-12 h-12 rounded-2xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400 animate-pulse">
                        <Bot className="w-6 h-6 animate-bounce" />
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm font-semibold text-white">Analyzing profile with GPT-4.1-mini</p>
                        <p className="text-xs text-slate-400">Synthesizing real-world technical interview prompts...</p>
                      </div>
                    </div>
                    <div className="space-y-3 pt-4">
                      <div className="h-16 rounded-xl bg-slate-800/40 animate-pulse border border-slate-800" />
                      <div className="h-16 rounded-xl bg-slate-800/40 animate-pulse border border-slate-800" />
                      <div className="h-16 rounded-xl bg-slate-800/40 animate-pulse border border-slate-800" />
                    </div>
                  </div>
                )}

                {!isLoading && generatedQuestions.length === 0 && (
                  <div className="rounded-2xl border border-dashed border-slate-800 p-8 text-center my-6 space-y-3">
                    <div className="w-10 h-10 rounded-full bg-slate-800/80 flex items-center justify-center text-slate-500 mx-auto">
                      <FileText className="w-5 h-5" />
                    </div>
                    <p className="text-sm font-medium text-slate-300">No questions generated yet</p>
                    <p className="text-xs text-slate-500 max-w-xs mx-auto">
                      Click the &quot;Generate Interview Questions&quot; button to call the Azure backend API.
                    </p>
                  </div>
                )}

                {!isLoading && generatedQuestions.length > 0 && (
                  <div className="space-y-3.5">
                    {generatedQuestions.map((question, index) => {
                      const cleanText = cleanQuestionText(question);
                      const difficulty = index === 0 ? "Foundational" : index === 1 ? "Intermediate" : "Advanced";
                      const diffVariant = index === 0 ? "primary" : index === 1 ? "purple" : "warning";

                      return (
                        <div
                          key={index}
                          className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 space-y-2 hover:border-slate-700 transition-colors"
                        >
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-xs font-bold text-sky-400 uppercase tracking-wider">
                              Question {index + 1}
                            </span>
                            <Badge variant={diffVariant} size="sm">
                              {difficulty}
                            </Badge>
                          </div>
                          <p className="text-sm text-slate-200 font-medium leading-relaxed">
                            {cleanText}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </div>

            {/* Launch Button when questions exist */}
            {generatedQuestions.length > 0 && (
              <div className="p-6 pt-0">
                <Button
                  size="lg"
                  onClick={handleLaunchInterview}
                  className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 shadow-emerald-950/50"
                  rightIcon={<ArrowRight className="w-4 h-4" />}
                >
                  Start Mock Interview Now
                </Button>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}

