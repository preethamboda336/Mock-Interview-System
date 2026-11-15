import React from "react";
import { cn } from "@/lib/utils";

interface ProgressProps {
  value: number; // 0 to 100
  max?: number;
  className?: string;
  barClassName?: string;
  showLabel?: boolean;
}

export function Progress({
  value,
  max = 100,
  className,
  barClassName,
  showLabel = false,
}: ProgressProps) {
  const percentage = Math.min(100, Math.max(0, Math.round((value / max) * 100)));

  return (
    <div className={cn("w-full flex flex-col gap-1.5", className)}>
      <div className="w-full bg-slate-800/80 rounded-full h-2 overflow-hidden border border-slate-700/50 p-0.5">
        <div
          className={cn(
            "h-full rounded-full bg-gradient-to-r from-sky-500 to-blue-500 transition-all duration-500 ease-out",
            barClassName
          )}
          style={{ width: `${percentage}%` }}
        />
      </div>
      {showLabel && (
        <div className="flex justify-between items-center text-xs text-slate-400">
          <span>Progress</span>
          <span className="font-semibold text-slate-200">{percentage}%</span>
        </div>
      )}
    </div>
  );
}

