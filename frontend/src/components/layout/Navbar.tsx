"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  Sparkles, 
  Menu, 
  X, 
  BrainCircuit, 
  Compass, 
  FileText, 
  PlayCircle, 
  BarChart3
} from "lucide-react";
import { useInterview } from "@/context/InterviewContext";
import { Badge } from "@/components/ui/Badge";
import { Logo } from "@/components/ui/Logo";

export function Navbar() {
  const pathname = usePathname();
  const { activeSession } = useInterview();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { href: "/", label: "Dashboard", icon: Compass },
    { href: "/resume", label: "Resume Analysis", icon: FileText },
    { href: "/interview", label: "Mock Interview", icon: PlayCircle },
    { href: "/feedback", label: "AI Feedback", icon: BrainCircuit },
    { href: "/performance", label: "Performance", icon: BarChart3 },
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800/80 bg-[#070d19]/90 backdrop-blur-xl">
      <div className="w-full flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Left Side: Logo + Brand + Dashboard Navigation Items */}
        <div className="flex items-center gap-6 lg:gap-8">
          <Link href="/" className="flex items-center gap-3 group">
            <Logo size={38} />
            <div>
              <div className="flex items-center gap-2">
                <span className="text-base font-bold tracking-tight text-white group-hover:text-sky-300 transition-colors">
                  AI Career Coach
                </span>
                <span className="hidden sm:inline-flex items-center gap-1 rounded bg-sky-500/10 px-1.5 py-0.5 text-[10px] font-semibold text-sky-400 border border-sky-500/20">
                  <Sparkles className="w-2.5 h-2.5" /> Azure AI
                </span>
              </div>
              <p className="text-[11px] text-slate-400 hidden sm:block">
                Powered by Azure Functions & GPT-4.1-mini
              </p>
            </div>
          </Link>

          {/* Dashboard Navigation Items - Placed on the left side of the application */}
          <nav className="hidden md:flex items-center gap-1.5 pl-4 border-l border-slate-800/80">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                    isActive
                      ? "bg-slate-800/90 text-sky-300 shadow-sm border border-slate-700/80"
                      : "text-slate-400 hover:text-slate-100 hover:bg-slate-800/40"
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? "text-sky-400" : "text-slate-400"}`} />
                  {link.label}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Right Side: Active Session chip only (No Browser Local Storage or Port button) */}
        <div className="hidden lg:flex items-center gap-3">
          {activeSession && (
            <Link href="/interview">
              <Badge variant="primary" size="sm" className="gap-1.5 cursor-pointer hover:bg-sky-500/20">
                <span className="w-1.5 h-1.5 rounded-full bg-sky-400 animate-pulse" />
                Active Session ({activeSession.questions.length} Qs)
              </Badge>
            </Link>
          )}
        </div>

        {/* Mobile menu button */}
        <div className="flex md:hidden items-center gap-2">
          {activeSession && (
            <Link href="/interview">
              <Badge variant="primary" size="sm" className="gap-1 text-[10px]">
                <span className="w-1.5 h-1.5 rounded-full bg-sky-400 animate-pulse" />
                Active
              </Badge>
            </Link>
          )}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/60"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-slate-800 bg-[#070d19]/95 px-4 pt-2 pb-4 space-y-1">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium ${
                  isActive
                    ? "bg-slate-800 text-sky-400 border border-slate-700"
                    : "text-slate-300 hover:bg-slate-800/50"
                }`}
              >
                <Icon className="w-4 h-4 text-sky-400" />
                {link.label}
              </Link>
            );
          })}
        </div>
      )}
    </header>
  );
}
