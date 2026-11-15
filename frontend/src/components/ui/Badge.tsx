import React from "react";
import { cn } from "@/lib/utils";

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "primary" | "secondary" | "success" | "warning" | "danger" | "purple" | "outline";
  size?: "sm" | "md";
}

export function Badge({
  children,
  className,
  variant = "primary",
  size = "md",
  ...props
}: BadgeProps) {
  const sizeStyles = {
    sm: "text-[11px] px-2 py-0.5",
    md: "text-xs px-2.5 py-1",
  };

  const variantStyles = {
    primary:
      "bg-sky-500/10 text-sky-400 border border-sky-500/30 font-medium",
    secondary:
      "bg-slate-800 text-slate-300 border border-slate-700 font-medium",
    success:
      "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-medium",
    warning:
      "bg-amber-500/10 text-amber-400 border border-amber-500/30 font-medium",
    danger:
      "bg-rose-500/10 text-rose-400 border border-rose-500/30 font-medium",
    purple:
      "bg-purple-500/10 text-purple-400 border border-purple-500/30 font-medium",
    outline:
      "bg-transparent text-slate-300 border border-slate-700 font-medium",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full font-medium tracking-wide transition-colors",
        sizeStyles[size],
        variantStyles[variant],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}

