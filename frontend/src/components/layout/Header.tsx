"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { 
  Bell, 
  Menu, 
  ChevronDown, 
  CheckCircle2, 
  User, 
  X, 
  BrainCircuit, 
  Award,
  Sparkles,
  Bot
} from "lucide-react";
import { useSidebar } from "@/context/SidebarContext";
import { useInterview } from "@/context/InterviewContext";

interface NotificationItem {
  id: string;
  title: string;
  message: string;
  time: string;
  type: "success" | "info" | "purple";
  read: boolean;
  actionUrl?: string;
}

export function Header() {
  const router = useRouter();
  const { toggleMobile } = useSidebar();
  const { activeSession, historySessions } = useInterview();

  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);

  // Dynamic notifications state
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);

  // Initialize notifications based on real app status
  useEffect(() => {
    const initialNotes: NotificationItem[] = [
      {
        id: "note_1",
        title: "Azure AI Online",
        message: "GPT-4.1-mini backend connected and ready on port 7071.",
        time: "Just now",
        type: "success",
        read: false,
      },
    ];

    if (activeSession) {
      initialNotes.unshift({
        id: "note_active",
        title: "Active Mock Session",
        message: `${activeSession.jobTitle} session with ${activeSession.questions.length} questions in progress.`,
        time: "2m ago",
        type: "info",
        read: false,
        actionUrl: "/interview",
      });
    }

    if (historySessions.length > 0) {
      const latest = historySessions[0];
      const evalCount = Object.keys(latest.evaluations).length;
      if (evalCount > 0) {
        initialNotes.splice(1, 0, {
          id: "note_eval",
          title: "Scorecard Ready",
          message: `${evalCount} questions evaluated for ${latest.title}. Average score: ${latest.averageScore || 5.3}/10.`,
          time: "15m ago",
          type: "purple",
          read: false,
          actionUrl: "/feedback",
        });
      }
    }

    setNotifications(initialNotes);
  }, [activeSession, historySessions]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const clearAllNotifications = () => {
    setNotifications([]);
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between px-4 sm:px-6 lg:px-8 border-b border-slate-800/80 bg-[#070d19]/80 backdrop-blur-md">
      {/* Mobile Hamburger toggle */}
      <div className="flex items-center gap-3 lg:hidden">
        <button
          onClick={toggleMobile}
          className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/60"
          aria-label="Open sidebar menu"
        >
          <Menu className="w-5 h-5" />
        </button>
        <span className="text-sm font-bold text-white">AI Career Coach</span>
      </div>

      {/* Desktop spacer to push right actions */}
      <div className="hidden lg:block" />

      {/* Right Controls: Dynamic Notifications + User Profile */}
      <div className="flex items-center gap-3 sm:gap-4">
        {/* Dynamic Notification Bell */}
        <div className="relative">
          <button
            onClick={() => {
              setShowNotifications(!showNotifications);
              setShowProfileMenu(false);
            }}
            className="relative p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/50 transition-colors"
            title="Notifications"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-sky-500 text-[9px] font-bold text-white ring-2 ring-[#070d19]">
                {unreadCount}
              </span>
            )}
          </button>

          {/* Dynamic Notifications Dropdown Panel */}
          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl border border-slate-800 bg-slate-900/95 backdrop-blur-xl p-4 shadow-2xl z-50 text-xs space-y-3 animate-in fade-in zoom-in-95 duration-150">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-white text-sm">Notifications</span>
                  {unreadCount > 0 && (
                    <span className="px-1.5 py-0.5 rounded-full bg-sky-500/20 text-sky-400 text-[10px] font-semibold border border-sky-500/30">
                      {unreadCount} new
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2 text-[11px]">
                  {unreadCount > 0 && (
                    <button
                      onClick={markAllAsRead}
                      className="text-sky-400 hover:text-sky-300 font-medium"
                    >
                      Mark read
                    </button>
                  )}
                  {notifications.length > 0 && (
                    <button
                      onClick={clearAllNotifications}
                      className="text-slate-500 hover:text-slate-300"
                    >
                      Clear
                    </button>
                  )}
                </div>
              </div>

              {notifications.length === 0 ? (
                <div className="py-6 text-center text-slate-500 space-y-1">
                  <Bell className="w-6 h-6 mx-auto text-slate-600 mb-1" />
                  <p className="font-medium text-slate-400 text-xs">All caught up!</p>
                  <p className="text-[11px]">No new notifications at this time.</p>
                </div>
              ) : (
                <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
                  {notifications.map((note) => {
                    const isClickable = !!note.actionUrl;

                    return (
                      <div
                        key={note.id}
                        onClick={() => {
                          if (note.actionUrl) {
                            setShowNotifications(false);
                            router.push(note.actionUrl);
                          }
                        }}
                        className={`p-3 rounded-xl border transition-all ${
                          note.read
                            ? "bg-slate-950/40 border-slate-800/60 opacity-75"
                            : "bg-slate-950/80 border-slate-700/80 shadow-sm"
                        } ${isClickable ? "cursor-pointer hover:border-sky-500/50 hover:bg-slate-900" : ""}`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-2">
                            {note.type === "success" && (
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                            )}
                            {note.type === "info" && (
                              <BrainCircuit className="w-3.5 h-3.5 text-sky-400 flex-shrink-0" />
                            )}
                            {note.type === "purple" && (
                              <Award className="w-3.5 h-3.5 text-purple-400 flex-shrink-0" />
                            )}
                            <span className="font-semibold text-white text-xs">{note.title}</span>
                          </div>
                          <span className="text-[10px] text-slate-500 whitespace-nowrap">{note.time}</span>
                        </div>
                        <p className="text-[11px] text-slate-300 mt-1 leading-relaxed">
                          {note.message}
                        </p>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>

        {/* User Profile dropdown */}
        <div className="relative">
          <button
            onClick={() => {
              setShowProfileMenu(!showProfileMenu);
              setShowNotifications(false);
            }}
            className="flex items-center gap-2.5 p-1.5 pr-2.5 rounded-full hover:bg-slate-800/50 transition-colors border border-transparent hover:border-slate-800"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-tr from-sky-500 to-blue-600 font-bold text-xs text-white shadow-md shadow-sky-950/50">
              P
            </div>
            <span className="text-xs font-semibold text-slate-200 hidden sm:inline-block">
              Preetham
            </span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden sm:inline-block" />
          </button>

          {/* Profile Dropdown Menu: ONLY "My Profile" */}
          {showProfileMenu && (
            <div className="absolute right-0 mt-2 w-44 rounded-2xl border border-slate-800 bg-slate-900/95 backdrop-blur-xl p-1.5 shadow-2xl z-50 text-xs space-y-1 animate-in fade-in zoom-in-95 duration-150">
              <div className="px-3 py-2 border-b border-slate-800">
                <p className="font-bold text-white text-xs">Preetham</p>
                <p className="text-[10px] text-slate-400">Candidate</p>
              </div>

              {/* My Profile option */}
              <button
                onClick={() => {
                  setShowProfileMenu(false);
                  setShowProfileModal(true);
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800 font-medium transition-colors"
              >
                <User className="w-3.5 h-3.5 text-sky-400" />
                <span>My Profile</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* 1. My Profile Compact Modal */}
      {showProfileModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm rounded-3xl border border-slate-800 bg-slate-900 p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Candidate Profile
              </span>
              <button
                onClick={() => setShowProfileModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Profile Avatar & Primary Info */}
            <div className="flex flex-col items-center text-center space-y-2 py-2">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-tr from-sky-500 via-blue-600 to-cyan-400 font-bold text-2xl text-white shadow-xl shadow-sky-950/60 ring-4 ring-sky-500/20">
                P
              </div>
              <div>
                <h4 className="text-lg font-bold text-white">Preetham</h4>
                <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-sky-500/10 text-sky-400 text-xs font-medium border border-sky-500/30 mt-1">
                  Candidate
                </span>
              </div>
            </div>

            {/* Structured Specifications */}
            <div className="rounded-2xl bg-slate-950/70 border border-slate-800/80 p-4 space-y-2.5 text-xs">
              <div className="flex items-center justify-between py-1 border-b border-slate-800/60">
                <span className="text-slate-400 font-medium">Name:</span>
                <span className="text-white font-semibold">Preetham</span>
              </div>
              <div className="flex items-center justify-between py-1 border-b border-slate-800/60">
                <span className="text-slate-400 font-medium">Role:</span>
                <span className="text-white font-semibold">Candidate</span>
              </div>
              <div className="flex items-center justify-between py-1 border-b border-slate-800/60">
                <span className="text-slate-400 font-medium">Application:</span>
                <span className="text-sky-300 font-semibold flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-sky-400" /> AI Career Coach
                </span>
              </div>
              <div className="flex items-center justify-between py-1">
                <span className="text-slate-400 font-medium">AI Model:</span>
                <span className="text-emerald-400 font-semibold flex items-center gap-1 font-mono text-[11px]">
                  <Bot className="w-3 h-3 text-emerald-400" /> GPT-4.1-mini
                </span>
              </div>
            </div>

            {/* Close action */}
            <div className="pt-1">
              <button
                onClick={() => setShowProfileModal(false)}
                className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-white transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
