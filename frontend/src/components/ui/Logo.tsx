import React from "react";
import Image from "next/image";

interface LogoProps {
  size?: number;
  className?: string;
  showText?: boolean;
}

export function Logo({ size = 38, className = "", showText = false }: LogoProps) {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <div 
        className="relative flex items-center justify-center rounded-2xl overflow-hidden shadow-lg shadow-sky-950/50 border border-sky-400/30 group-hover:border-sky-400/60 transition-colors"
        style={{ width: size, height: size }}
      >
        <Image
          src="/logo.svg"
          alt="AI Career Coach Logo"
          width={size}
          height={size}
          className="w-full h-full object-contain"
          priority
        />
      </div>

      {showText && (
        <div>
          <div className="flex items-center gap-2">
            <span className="text-base font-bold tracking-tight text-white group-hover:text-sky-300 transition-colors">
              AI Career Coach
            </span>
          </div>
          <p className="text-[11px] text-slate-400">
            Azure Functions & GPT-4.1-mini
          </p>
        </div>
      )}
    </div>
  );
}

