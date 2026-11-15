"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  FileText, 
  PlayCircle, 
  BrainCircuit, 
  BarChart3, 
  HelpCircle, 
  ChevronLeft, 
  ChevronRight, 
  X
} from "lucide-react";
import { useInterview } from "@/context/InterviewContext";
import { useSidebar } from "@/context/SidebarContext";
import { Logo } from "@/components/ui/Logo";

export function Sidebar() {
  const pathname = usePathname();
  const { activeSession } = useInterview();
  const { isCollapsed, toggleCollapse, isMobileOpen, closeMobile } = useSidebar();
  const [showHelpModal, setShowHelpModal] = useState(false);

  const navLinks = [
    { href: "/", label: "Dashboard", icon: LayoutDashboard },
    { href: "/resume", label: "Resume Analysis", icon: FileText },
    { href: "/interview", label: "Mock Interview", icon: PlayCircle },
    { href: "/feedback", label: "AI Feedback", icon: BrainCircuit },
    { href: "/performance", label: "Performance", icon: BarChart3 },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm lg:hidden transition-opacity"
          onClick={closeMobile}
          aria-hidden="true"
        />
      )}

      {/* Main Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 flex flex-col justify-between border-r border-slate-800/80 bg-[#070d19]/95 lg:bg-[#070d19]/90 backdrop-blur-xl transition-all duration-300 ease-in-out ${
          isCollapsed ? "w-20" : "w-64"
        } ${
          isMobileOpen
            ? "translate-x-0"
            : "-translate-x-full lg:translate-x-0"
        }`}
      >
        {/* Top Header & Brand */}
        <div>
          <div className="flex h-20 items-center justify-between px-4 border-b border-slate-800/60">
            <Link
              href="/"
              onClick={closeMobile}
              className="flex items-center gap-3 overflow-hidden group"
            >
              <div className="flex-shrink-0">
                <Logo size={36} />
              </div>
              {!isCollapsed && (
                <div className="truncate">
                  <h1 className="text-sm font-bold text-white tracking-tight leading-tight group-hover:text-sky-300 transition-colors">
                    AI Career Coach
                  </h1>
                  <p className="text-[10px] text-sky-400 font-medium tracking-wide">
                    Azure AI-Powered Prep
                  </p>
                </div>
              )}
            </Link>

            {/* Mobile close button */}
            <button
              onClick={closeMobile}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 lg:hidden"
              aria-label="Close menu"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Primary Navigation Links */}
          <nav className="p-3 space-y-1.5 mt-2">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href;

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={closeMobile}
                  title={isCollapsed ? link.label : undefined}
                  className={`relative flex items-center gap-3.5 px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all duration-200 group ${
                    isActive
                      ? "bg-sky-600 text-white shadow-lg shadow-sky-600/30 font-semibold"
                      : "text-slate-400 hover:text-slate-100 hover:bg-slate-800/50"
                  } ${isCollapsed ? "justify-center px-0" : ""}`}
                >
                  <Icon
                    className={`w-4 h-4 flex-shrink-0 transition-transform duration-200 ${
                      isActive ? "text-white" : "text-slate-400 group-hover:text-slate-200 group-hover:scale-110"
                    }`}
                  />
                  {!isCollapsed && <span className="truncate">{link.label}</span>}

                  {/* Active Indicator Bar on Edge */}
                  {isActive && !isCollapsed && (
                    <span className="absolute right-2 w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                  )}

                  {/* Tooltip for collapsed state */}
                  {isCollapsed && (
                    <div className="absolute left-full ml-3 hidden group-hover:flex items-center px-2.5 py-1 rounded-md bg-slate-900 border border-slate-700 text-white text-[11px] whitespace-nowrap shadow-xl z-50">
                      {link.label}
                    </div>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Bottom Section: Active Session Chip + Help & Support + Collapse Toggle */}
        <div className="p-3 border-t border-slate-800/60 space-y-2">
          {/* Active Session Indicator */}
          {activeSession && !isCollapsed && (
            <Link
              href="/interview"
              onClick={closeMobile}
              className="block rounded-xl bg-gradient-to-r from-sky-950/60 to-blue-950/40 border border-sky-500/30 p-2.5 hover:border-sky-500/60 transition-colors group"
            >
              <div className="flex items-center justify-between text-[11px] font-semibold text-sky-300">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-sky-400 animate-pulse" />
                  Active Interview
                </span>
                <span className="text-slate-400 font-normal">
                  {activeSession.questions.length} Qs
                </span>
              </div>
              <p className="text-[10px] text-slate-400 truncate mt-1">
                {activeSession.jobTitle}
              </p>
            </Link>
          )}

          {/* Help & Support Button */}
          <div className="space-y-1">
            <button
              onClick={() => setShowHelpModal(true)}
              title={isCollapsed ? "Help & Support" : undefined}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 transition-colors group ${
                isCollapsed ? "justify-center px-0" : ""
              }`}
            >
              <HelpCircle className="w-4 h-4 text-slate-400 group-hover:text-slate-200" />
              {!isCollapsed && <span>Help & Support</span>}
              {isCollapsed && (
                <div className="absolute left-full ml-3 hidden group-hover:flex items-center px-2.5 py-1 rounded-md bg-slate-900 border border-slate-700 text-white text-[11px] whitespace-nowrap shadow-xl z-50">
                  Help & Support
                </div>
              )}
            </button>
          </div>

          {/* Desktop Collapse / Expand Toggle Button */}
          <button
            onClick={toggleCollapse}
            className="hidden lg:flex w-full items-center justify-center p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/60 border border-slate-800/60 transition-colors text-xs font-medium gap-2"
            title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {isCollapsed ? (
              <ChevronRight className="w-4 h-4" />
            ) : (
              <>
                <ChevronLeft className="w-4 h-4" />
                <span>Collapse</span>
              </>
            )}
          </button>
        </div>
      </aside>

      {/* Help & Support Modal */}
      {showHelpModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-sky-400" /> Help & Support
              </h3>
              <button
                onClick={() => setShowHelpModal(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-3 text-xs text-slate-300 leading-relaxed">
              <p>
                <strong>How to practice with AI Career Coach:</strong>
              </p>
              <ol className="list-decimal pl-4 space-y-1.5 text-slate-400">
                <li>Go to <strong>Resume Analysis</strong> to generate custom technical questions.</li>
                <li>Enter the <strong>Mock Interview</strong> to record answers (text or microphone).</li>
                <li>Submit your answers to receive instant grading from Azure OpenAI.</li>
                <li>Review the <strong>AI Feedback</strong> and track your improvement under <strong>Performance</strong>.</li>
              </ol>
            </div>
            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setShowHelpModal(false)}
                className="px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-xs font-medium text-white"
              >
                Got it
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
