"use client";

import React from "react";
import Image from "next/image";

interface SplitLogoProps {
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  variant?: "full" | "icon" | "horizontal";
  className?: string;
  withGlow?: boolean;
}

export function SplitLogo({
  size = "md",
  variant = "horizontal",
  className = "",
  withGlow = true,
}: SplitLogoProps) {
  // Enhanced, prominent dimension mappings for the new 3D emblem
  const sizeMap = {
    xs: { width: 38, height: 26, text: "text-sm", fullH: "h-9" },
    sm: { width: 52, height: 35, text: "text-base sm:text-lg", fullH: "h-12" },
    md: { width: 72, height: 48, text: "text-xl sm:text-2xl", fullH: "h-16" },
    lg: { width: 98, height: 65, text: "text-2xl sm:text-3xl", fullH: "h-22" },
    xl: { width: 140, height: 93, text: "text-4xl sm:text-5xl", fullH: "h-32" },
  };

  const currentSize = sizeMap[size] || sizeMap.md;

  // 1. FULL ARTWORK
  if (variant === "full") {
    return (
      <div
        className={`relative inline-flex items-center justify-center transition-all duration-300 ${
          withGlow ? "filter drop-shadow-[0_0_25px_rgba(16,185,129,0.4)]" : ""
        } ${className}`}
      >
        <Image
          src="/images/split-logo.png"
          alt="SPL/IT Logo"
          width={currentSize.width * 2}
          height={currentSize.height * 2}
          className="object-contain"
          priority
        />
      </div>
    );
  }

  // 2. ICON ONLY
  if (variant === "icon") {
    return (
      <div
        className={`relative inline-flex items-center justify-center transition-transform duration-300 group-hover:scale-105 ${
          withGlow ? "filter drop-shadow-[0_4px_16px_rgba(16,185,129,0.35)]" : ""
        } ${className}`}
        style={{
          width: `${currentSize.width}px`,
          height: `${currentSize.height}px`,
        }}
      >
        <Image
          src="/images/split-logo.png"
          alt="SPL/IT Icon"
          width={currentSize.width}
          height={currentSize.height}
          className="w-full h-full object-contain"
          priority
        />
      </div>
    );
  }

  // 3. HORIZONTAL (Large 3D Emblem + Styled Wordmark SPL/IT)
  return (
    <div className={`inline-flex items-center gap-3 sm:gap-3.5 group ${className}`}>
      {/* Prominent 3D Emblem (Rupee + Group Cards) */}
      <div
        className={`relative inline-flex items-center justify-center shrink-0 transition-all duration-300 group-hover:scale-105 ${
          withGlow
            ? "filter drop-shadow-[0_4px_16px_rgba(16,185,129,0.4)] group-hover:drop-shadow-[0_6px_22px_rgba(16,185,129,0.6)]"
            : ""
        }`}
        style={{
          width: `${currentSize.width}px`,
          height: `${currentSize.height}px`,
        }}
      >
        <Image
          src="/images/split-logo.png"
          alt="SPL/IT Emblem"
          width={currentSize.width}
          height={currentSize.height}
          className="w-full h-full object-contain"
          priority
        />
      </div>

      {/* Kept Crisp Wordmark SPL/IT */}
      <div className="flex items-center select-none font-bold tracking-tight">
        <span className={`text-[#fbf5eb] font-extrabold ${currentSize.text} tracking-tight`}>
          SPL
        </span>
        <span
          className={`text-[#34d399] font-black ${currentSize.text} mx-[1.5px] drop-shadow-[0_0_12px_rgba(52,211,153,0.7)]`}
        >
          /
        </span>
        <span className={`text-[#fbf5eb] font-extrabold ${currentSize.text} tracking-tight`}>
          IT
        </span>
      </div>
    </div>
  );
}
