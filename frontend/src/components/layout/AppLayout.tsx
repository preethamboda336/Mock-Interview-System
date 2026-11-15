"use client";

import React from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { useSidebar } from "@/context/SidebarContext";

export function AppLayout({ children }: { children: React.ReactNode }) {
  const { isCollapsed } = useSidebar();

  return (
    <div className="relative min-h-screen flex bg-[#070d19] text-slate-100 radial-mesh">
      {/* Left Vertical Sidebar */}
      <Sidebar />

      {/* Main Content Area - Expands to remaining space */}
      <div
        className={`flex-1 flex flex-col min-h-screen transition-all duration-300 ease-in-out ${
          isCollapsed ? "lg:pl-20" : "lg:pl-64"
        }`}
      >
        <Header />
        <main className="flex-1 w-full px-4 sm:px-6 lg:px-8 py-6">
          {children}
        </main>
      </div>
    </div>
  );
}
