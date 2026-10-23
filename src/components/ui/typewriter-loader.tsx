"use client";

import React from "react";

interface TypewriterLoaderProps {
  message?: string;
  subMessage?: string;
  size?: "sm" | "md" | "lg";
  theme?: "classic" | "forest" | "room";
  fullScreen?: boolean;
  className?: string;
}

/**
 * TypewriterAnimation — Exact HTML and CSS animation provided by user from Uiverse.io by uxRakhal
 * Contains the animated typewriter with sliding carriage, emerging paper, and pressing keys.
 */
export function TypewriterAnimation({
  size = "md",
  theme = "classic",
  className = "",
}: {
  size?: "sm" | "md" | "lg";
  theme?: "classic" | "forest" | "room";
  className?: string;
}) {
  const scale = size === "sm" ? 0.8 : size === "lg" ? 1.25 : 1;
  const themeClass =
    theme === "forest"
      ? "typewriter-theme-forest"
      : theme === "room"
      ? "typewriter-theme-room"
      : "";

  return (
    <div
      className={`relative flex items-center justify-center select-none ${className}`}
      style={{
        transform: `scale(${scale})`,
        transformOrigin: "center center",
        width: 124,
        height: 76,
      }}
      aria-label="Loading animation"
    >
      <div className={`typewriter ${themeClass}`}>
        <div className="slide">
          <i />
        </div>
        <div className="paper" />
        <div className="keyboard" />
      </div>
    </div>
  );
}

/**
 * TypewriterLoader — A complete, premium presentation card
 * with radial backlight halo and cinematic status text.
 */
export function TypewriterLoader({
  message = "Drafting ledger...",
  subMessage,
  size = "md",
  theme = "classic",
  fullScreen = false,
  className = "",
}: TypewriterLoaderProps) {
  const glowGradient =
    theme === "forest"
      ? "radial-gradient(circle, rgba(224,168,117,0.28) 0%, rgba(110,231,183,0.12) 45%, transparent 72%)"
      : theme === "room"
      ? "radial-gradient(circle, rgba(243,152,80,0.28) 0%, rgba(179,100,76,0.14) 45%, transparent 72%)"
      : "radial-gradient(circle, rgba(92,187,255,0.32) 0%, rgba(22,45,114,0.18) 50%, transparent 75%)";

  const content = (
    <div
      className={`flex flex-col items-center justify-center gap-4 text-center select-none ${className}`}
    >
      {/* Ambient Radial Backlight Glow */}
      <div className="relative flex items-center justify-center p-2">
        <div
          className="absolute -inset-10 rounded-full blur-2xl opacity-70 pointer-events-none transition-all duration-700"
          style={{ background: glowGradient }}
        />
        <TypewriterAnimation size={size} theme={theme} />
      </div>

      {/* Narrative Status Labels */}
      {(message || subMessage) && (
        <div className="space-y-1.5 max-w-sm px-6 animate-in fade-in duration-500">
          {message && (
            <p
              className="text-sm sm:text-base font-semibold tracking-wide text-[#fff7ec] drop-shadow-sm"
              style={{ fontFamily: "var(--font-display), Georgia, serif" }}
            >
              {message}
            </p>
          )}
          {subMessage && (
            <p
              className="text-xs text-[rgba(255,245,230,0.62)] tracking-normal font-sans"
              style={{ fontFamily: "var(--font-sans-ui), sans-serif" }}
            >
              {subMessage}
            </p>
          )}
        </div>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0d1417]/88 backdrop-blur-xl animate-in fade-in duration-300">
        {content}
      </div>
    );
  }

  return content;
}

/**
 * TypewriterPageTransition — Fullscreen / Canvas smooth transitional veil.
 * Used whenever navigating between tabs, spaces, or routes to guarantee
 * smooth visual continuity and allow the typewriter animation to be enjoyed.
 */
export function TypewriterPageTransition({
  isVisible,
  message = "Loading...",
  subMessage,
  theme = "classic",
}: {
  isVisible: boolean;
  message?: string;
  subMessage?: string;
  theme?: "classic" | "forest" | "room";
}) {
  if (!isVisible) return null;

  return (
    <div
      className="fixed inset-0 z-[120] flex flex-col items-center justify-center bg-[#0d1417]/82 backdrop-blur-2xl transition-all duration-300 animate-in fade-in"
      style={{
        animationDuration: "260ms",
      }}
    >
      <TypewriterLoader
        message={message}
        subMessage={subMessage}
        size="lg"
        theme={theme}
      />
    </div>
  );
}
