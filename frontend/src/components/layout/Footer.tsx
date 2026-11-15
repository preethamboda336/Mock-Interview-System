import React from "react";
import { Sparkles, Terminal, ShieldCheck } from "lucide-react";

export function Footer() {
  return (
    <footer className="w-full border-t border-slate-800/60 bg-[#070d19]/80 py-6 px-4 sm:px-6 lg:px-8 text-xs text-slate-400">
      <div className="w-full max-w-[1600px] flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-sky-400" />
          <span className="font-semibold text-slate-200">AI Career Coach</span>
          <span>— Azure Functions & Microsoft Foundry (GPT-4.1-mini)</span>
        </div>

        <div className="flex flex-wrap items-center gap-6 text-slate-400">
          <span className="flex items-center gap-1.5">
            <Terminal className="w-3.5 h-3.5 text-blue-400" />
            Backend: /api/generateQuestions & /api/evaluateAnswer
          </span>
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            Zero Credentials in Browser
          </span>
        </div>
      </div>
    </footer>
  );
}
