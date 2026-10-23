"use client";

import React, { ReactNode } from "react";

interface WidgetCardProps {
  title: string;
  subtitle?: string;
  eyebrow?: string;
  icon?: ReactNode;
  headerAction?: ReactNode;
  children: ReactNode;
  className?: string;
  bodyClassName?: string;
  isLoading?: boolean;
  isEmpty?: boolean;
  emptyMessage?: string;
  emptyAction?: ReactNode;
  isError?: boolean;
  errorMessage?: string;
  onRetry?: () => void;
  badge?: string;
  badgeVariant?: "copper" | "apricot" | "sage" | "terracotta" | "neutral";
  theme?: "trip" | "local";
}

export function WidgetCard({
  title,
  subtitle,
  eyebrow,
  icon,
  headerAction,
  children,
  className = "",
  bodyClassName = "",
  isLoading = false,
  isEmpty = false,
  emptyMessage = "No items to display yet.",
  emptyAction,
  isError = false,
  errorMessage = "Unable to load data.",
  onRetry,
  badge,
  badgeVariant = "copper",
  theme = "trip",
}: WidgetCardProps) {
  const isTrip = theme === "trip";

  const badgeColors = {
    copper: "bg-[#e0a875]/15 text-[#e0a875] border-[#e0a875]/35",
    apricot: "bg-[#f39850]/15 text-[#f39850] border-[#f39850]/35",
    sage: "bg-[#9cc79d]/15 text-[#9cc79d] border-[#9cc79d]/35",
    terracotta: "bg-[#db9b83]/15 text-[#db9b83] border-[#db9b83]/35",
    neutral: "bg-white/10 text-white/70 border-white/15",
  };

  return (
    <article
      className={`group relative flex flex-col rounded-3xl transition-all duration-300 overflow-hidden shadow-2xl ${
        isTrip
          ? "bg-[rgba(25,38,44,0.60)] hover:bg-[rgba(32,48,55,0.70)] border border-[rgba(235,248,246,0.18)] hover:border-[#e0a875]/50"
          : "bg-[rgba(48,32,40,0.60)] hover:bg-[rgba(58,40,49,0.70)] border border-[rgba(255,238,225,0.18)] hover:border-[#f39850]/50"
      } backdrop-blur-2xl ${className}`}
      style={{
        boxShadow: isTrip
          ? "0 16px 45px rgba(6, 12, 14, 0.35), inset 0 1px 0 rgba(255, 255, 255, 0.14)"
          : "0 16px 45px rgba(18, 10, 12, 0.35), inset 0 1px 0 rgba(255, 255, 255, 0.14)",
      }}
    >
      {/* Widget Header with Landing Editorial Style */}
      <header
        className={`flex items-start justify-between gap-3 px-5 sm:px-6 pt-5 pb-3.5 border-b ${
          isTrip ? "border-[rgba(235,248,246,0.08)]" : "border-[rgba(255,238,225,0.08)]"
        }`}
      >
        <div className="flex items-center gap-3 min-w-0">
          {icon && (
            <div
              className={`w-9 h-9 rounded-2xl flex items-center justify-center flex-shrink-0 text-base ${
                isTrip
                  ? "bg-[rgba(224,168,117,0.12)] border border-[#e0a875]/25 text-[#e0a875]"
                  : "bg-[rgba(243,152,80,0.12)] border border-[#f39850]/25 text-[#f39850]"
              }`}
            >
              {icon}
            </div>
          )}
          <div className="min-w-0">
            {eyebrow && (
              <span
                className="text-[10px] uppercase tracking-[0.24em] font-semibold block mb-0.5"
                style={{
                  color: isTrip ? "rgba(224, 168, 117, 0.85)" : "rgba(243, 152, 80, 0.85)",
                  fontFamily: "var(--font-sans-ui), sans-serif",
                }}
              >
                {eyebrow}
              </span>
            )}
            <div className="flex items-center gap-2.5">
              <h3
                className="text-base font-semibold tracking-tight text-[#fff7ec] truncate"
                style={{ fontFamily: "var(--font-display), Georgia, serif" }}
              >
                {title}
              </h3>
              {badge && (
                <span
                  className={`text-[10px] font-semibold uppercase tracking-[0.14em] px-2.5 py-0.5 rounded-full border ${badgeColors[badgeVariant]}`}
                >
                  {badge}
                </span>
              )}
            </div>
            {subtitle && (
              <p className="text-xs text-[rgba(255,245,230,0.6)] tracking-normal truncate mt-0.5">
                {subtitle}
              </p>
            )}
          </div>
        </div>

        {headerAction && (
          <div className="flex items-center gap-2 flex-shrink-0">
            {headerAction}
          </div>
        )}
      </header>

      {/* Widget Body */}
      <div className={`p-5 sm:p-6 flex-1 flex flex-col ${bodyClassName}`}>
        {isLoading ? (
          <div className="space-y-3 py-4 animate-pulse" aria-label="Loading widget content">
            <div className="h-4 bg-white/5 rounded w-3/4" />
            <div className="h-12 bg-white/5 rounded-2xl" />
            <div className="h-4 bg-white/5 rounded w-1/2" />
          </div>
        ) : isError ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <span className="text-[#db9b83] text-2xl mb-2">⚠</span>
            <p className="text-xs text-[rgba(255,245,230,0.7)] mb-3">{errorMessage}</p>
            {onRetry && (
              <button
                type="button"
                onClick={onRetry}
                className="text-xs text-[#e0a875] hover:text-[#fff5e7] font-semibold uppercase tracking-[0.18em] px-4 py-1.5 rounded-full border border-[#e0a875]/30 hover:border-[#e0a875] bg-[#e0a875]/10 transition-all"
              >
                Retry
              </button>
            )}
          </div>
        ) : isEmpty ? (
          <div className="flex flex-col items-center justify-center py-10 text-center my-auto">
            <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-[rgba(255,245,230,0.5)] mb-3">
              ◌
            </div>
            <p className="text-xs text-[rgba(255,245,230,0.65)] max-w-[220px] leading-relaxed">
              {emptyMessage}
            </p>
            {emptyAction && <div className="mt-3.5">{emptyAction}</div>}
          </div>
        ) : (
          children
        )}
      </div>
    </article>
  );
}
