"use client";

import Link from "next/link";
import React, { useState } from "react";
import { BackdropBlurMode, SpaceType } from "../../lib/types/dashboard";
import { SplitLogo } from "../ui/split-logo";

interface TopBarProps {
  currentSpace: SpaceType;
  onSpaceChange: (space: SpaceType) => void;
  user: { id: string; phone?: string | null } | null;
  onOpenAuth: () => void;
  onSignOut: () => void;
  onResetData?: () => void;
  searchQuery?: string;
  onSearchQueryChange?: (q: string) => void;
  blurMode?: BackdropBlurMode;
  onBlurModeChange?: (mode: BackdropBlurMode) => void;
  onReturnToLanding?: () => void;
}

export function TopBar({
  currentSpace,
  onSpaceChange,
  user,
  onOpenAuth,
  onSignOut,
  onResetData,
  searchQuery: externalSearchQuery,
  onSearchQueryChange,
  blurMode = "deep",
  onBlurModeChange,
  onReturnToLanding,
}: TopBarProps) {
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showBlurMenu, setShowBlurMenu] = useState(false);
  const [internalSearchQuery, setInternalSearchQuery] = useState("");

  const searchQuery = externalSearchQuery !== undefined ? externalSearchQuery : internalSearchQuery;
  const setSearchQuery = onSearchQueryChange || setInternalSearchQuery;

  const [notifications, setNotifications] = useState([
    { id: "n1", title: "Aman added Dinner at Thalassa", sub: "Goa Trip · ₹2,400" },
    { id: "n2", title: "Spotify Auto-Debit in 5 days", sub: "Room Ledger · ₹119" },
  ]);

  const isTrip = currentSpace === "trip";

  const handleLogoClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (onReturnToLanding) {
      onReturnToLanding();
    } else {
      window.location.href = "/";
    }
  };

  return (
    <header className={`sticky top-0 z-40 w-full ${isTrip ? "bg-[rgba(18,28,32,0.65)]" : "bg-[rgba(38,24,30,0.65)]"} backdrop-blur-2xl border-b border-[rgba(255,248,235,0.14)] px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between gap-4 transition-colors duration-500 shadow-lg`}>
      {/* Left: Exact Landing Brand Mark & Wordmark */}
      <div className="flex items-center gap-5 sm:gap-6">
        <Link
          href="/"
          onClick={handleLogoClick}
          className="flex items-center group transition-opacity hover:opacity-95 cursor-pointer"
          title="Return to Landing Portal"
        >
          <SplitLogo size="md" variant="horizontal" />
        </Link>

        {/* Environment Switcher: Trip (Forest) vs Local (Room) with sliding animated pill */}
        <div
          data-spotlight-id="realm-switcher"
          className={`relative hidden md:flex items-center p-1 rounded-full ${isTrip ? "bg-[rgba(16,24,28,0.75)]" : "bg-[rgba(32,20,26,0.75)]"} border border-[rgba(255,248,235,0.18)] backdrop-blur-md transition-colors duration-500`}
        >
          {/* Animated Sliding Pill Highlight */}
          <div
            className="absolute top-1 bottom-1 rounded-full transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] pointer-events-none"
            style={{
              left: isTrip ? "4px" : "calc(50% + 1px)",
              width: "calc(50% - 5px)",
              background: isTrip
                ? "linear-gradient(135deg, #253236 0%, #1d272a 100%)"
                : "linear-gradient(135deg, #38262a 0%, #2a1c20 100%)",
              border: isTrip
                ? "1px solid rgba(224, 168, 117, 0.45)"
                : "1px solid rgba(243, 152, 80, 0.45)",
              boxShadow: isTrip
                ? "0 2px 10px rgba(224, 168, 117, 0.22), inset 0 1px 0 rgba(255, 255, 255, 0.08)"
                : "0 2px 10px rgba(243, 152, 80, 0.22), inset 0 1px 0 rgba(255, 255, 255, 0.08)",
            }}
          />
          <button
            type="button"
            onClick={() => onSpaceChange("trip")}
            className={`relative z-10 px-3.5 py-1 rounded-full text-xs font-semibold tracking-wide transition-all duration-200 ${
              isTrip
                ? "text-[#e0a875] scale-[1.02]"
                : "text-[rgba(255,245,230,0.6)] hover:text-white"
            }`}
          >
            Trip (Forest)
          </button>
          <button
            type="button"
            onClick={() => onSpaceChange("local")}
            className={`relative z-10 px-3.5 py-1 rounded-full text-xs font-semibold tracking-wide transition-all duration-200 ${
              !isTrip
                ? "text-[#f39850] scale-[1.02]"
                : "text-[rgba(255,245,230,0.6)] hover:text-white"
            }`}
          >
            Local (Room)
          </button>
        </div>
      </div>

      {/* Center: Frosted Pill Search */}
      <div className="flex-1 max-w-sm sm:max-w-md mx-auto" data-spotlight-id="search-bar">
        <div className="relative">
          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs text-[rgba(255,245,230,0.45)]">
            <svg
              className="w-3.5 h-3.5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </span>
          <input
            type="text"
            placeholder={
              isTrip
                ? "Search trips, expenses, members..."
                : "Search transactions, categories, budgets..."
            }
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[rgba(255,248,235,0.06)] border border-[rgba(255,248,235,0.14)] hover:border-[rgba(255,248,235,0.25)] focus:border-[#e0a875]/60 rounded-full pl-9 pr-4 py-1.5 text-xs text-[#fff7eb] placeholder-[rgba(255,245,230,0.45)] outline-none transition-all"
          />
        </div>
      </div>

      {/* Right: Notifications & Profile Avatar */}
      <div className="flex items-center gap-3">
        {/* Mobile Switcher Toggle */}
        <button
          type="button"
          onClick={() => onSpaceChange(isTrip ? "local" : "trip")}
          className="md:hidden text-xs px-3 py-1 rounded-full bg-[rgba(255,248,235,0.08)] border border-[rgba(255,248,235,0.18)] text-[#e0a875] font-medium"
        >
          {isTrip ? "Local" : "Trip"} ⇄
        </button>

        {/* Backdrop Ambience / Blur Mode Toggle */}
        <div className="relative">
          <button
            type="button"
            onClick={() => {
              setShowBlurMenu(!showBlurMenu);
              setShowNotifications(false);
              setShowProfileMenu(false);
            }}
            aria-label="Dashboard background blur ambience"
            title="Adjust background blur"
            className={`h-8 px-2.5 sm:px-3 rounded-full flex items-center gap-1.5 text-xs font-medium transition-all border ${
              blurMode !== "off"
                ? isTrip
                  ? "bg-[rgba(224,168,117,0.14)] border-[#e0a875]/40 text-[#e0a875] hover:bg-[#e0a875]/22 shadow-sm"
                  : "bg-[rgba(243,152,80,0.14)] border-[#f39850]/40 text-[#f39850] hover:bg-[#f39850]/22 shadow-sm"
                : "bg-[rgba(255,248,235,0.08)] border-[rgba(255,248,235,0.18)] text-[rgba(255,245,230,0.65)] hover:text-white"
            }`}
          >
            {/* Luminous Bokeh / Focus Icon */}
            <svg
              className="w-3.5 h-3.5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <circle cx="12" cy="12" r="4.5" strokeWidth={1.8} />
              <circle cx="19" cy="8" r="2.5" strokeWidth={1.5} opacity="0.75" />
              <circle cx="5" cy="16" r="3" strokeWidth={1.5} opacity="0.75" />
            </svg>
            <span className="hidden sm:inline text-[11px] font-semibold tracking-wide">
              {blurMode === "deep" ? "Blurred" : blurMode === "soft" ? "Soft Blur" : blurMode === "abstract" ? "Aura" : "Art"}
            </span>
          </button>

          {showBlurMenu && (
            <div className="absolute right-0 mt-2 w-60 bg-[#162124] border border-[rgba(255,248,235,0.2)] rounded-2xl shadow-2xl p-2 z-50 text-[#fff5e7] animate-in fade-in duration-150">
              <div className="px-3 py-1.5 border-b border-[rgba(255,248,235,0.1)] mb-1 flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[rgba(255,245,230,0.55)]">
                  Backdrop Ambience
                </span>
                <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded-full ${isTrip ? "bg-[#e0a875]/15 text-[#e0a875]" : "bg-[#f39850]/15 text-[#f39850]"}`}>
                  {blurMode === "deep" ? "36px" : blurMode === "soft" ? "18px" : blurMode === "abstract" ? "68px" : "0px"}
                </span>
              </div>
              <div className="space-y-1">
                {[
                  { id: "deep", label: "Deep Bokeh", sub: "Blurred out, optimal card contrast", badge: "Default" },
                  { id: "soft", label: "Soft Mist", sub: "Gentle blur, soft silhouettes" },
                  { id: "abstract", label: "Abstract Aura", sub: "Ultra-diffused ambient glow" },
                  { id: "off", label: "Sharp Art", sub: "Original high-detail illustration" },
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      onBlurModeChange?.(item.id as BackdropBlurMode);
                      setShowBlurMenu(false);
                    }}
                    className={`w-full text-left px-3 py-2 rounded-xl text-xs transition-all flex items-center justify-between ${
                      blurMode === item.id
                        ? isTrip
                          ? "bg-[#25373d] text-[#e0a875] font-semibold border border-[#e0a875]/35"
                          : "bg-[#3d2532] text-[#f39850] font-semibold border border-[#f39850]/35"
                        : "text-[rgba(255,245,230,0.8)] hover:bg-[rgba(255,248,235,0.06)] hover:text-white"
                    }`}
                  >
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span>{item.label}</span>
                        {item.badge && (
                          <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-emerald-500/20 text-emerald-300 font-mono">
                            {item.badge}
                          </span>
                        )}
                      </div>
                      <p className="text-[10px] text-[rgba(255,245,230,0.45)] mt-0.5">{item.sub}</p>
                    </div>
                    {blurMode === item.id && (
                      <span className="text-sm font-bold">✓</span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Notification Bell */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowNotifications(!showNotifications)}
            aria-label="Notifications"
            className="w-8 h-8 rounded-full bg-[rgba(255,248,235,0.08)] hover:bg-[rgba(255,248,235,0.14)] border border-[rgba(255,248,235,0.18)] flex items-center justify-center text-[#fff5e7] transition-colors"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.8}
                d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
              />
            </svg>
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-72 bg-[#172124] border border-[rgba(255,248,235,0.2)] rounded-2xl shadow-2xl p-3 z-50 animate-in fade-in duration-150 text-[#fff5e7]">
              <div className="flex items-center justify-between pb-2 border-b border-[rgba(255,248,235,0.1)]">
                <span className="text-xs font-semibold">Notifications</span>
                {notifications.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setNotifications([])}
                    className="text-[10px] text-[#e0a875] hover:underline"
                  >
                    Clear all
                  </button>
                )}
              </div>
              <div className="py-2 space-y-2 text-xs">
                {notifications.map((n) => (
                  <div
                    key={n.id}
                    className="p-2.5 rounded-xl bg-[rgba(255,248,235,0.05)] border border-[rgba(255,248,235,0.08)] flex items-start justify-between gap-2"
                  >
                    <div>
                      <p className="font-semibold text-[#fff5e7]">{n.title}</p>
                      <p className="text-[11px] text-[rgba(255,245,230,0.6)]">{n.sub}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setNotifications((prev) => prev.filter((item) => item.id !== n.id))}
                      className="text-[#7d8b99] hover:text-[#fff5e7] text-xs px-1"
                    >
                      ✕
                    </button>
                  </div>
                ))}

                {notifications.length === 0 && (
                  <div className="py-4 text-center text-[#7d8b99]">
                    <p className="text-xs">No new notifications</p>
                    <p className="text-[10px] text-[#556371] mt-0.5">You're all caught up!</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Live Database Status Indicator */}
        <div className="hidden lg:flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-emerald-300 text-[11px] font-medium tracking-wide">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span>Live Database Active</span>
        </div>

        {/* Profile Avatar Badge: 'SP' in Serif */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="w-8 h-8 rounded-full border border-[rgba(255,248,236,0.35)] bg-[rgba(255,248,236,0.1)] text-[#fff5e7] flex items-center justify-center text-xs font-semibold hover:border-[#e0a875] transition-all shadow-sm"
            style={{ fontFamily: "var(--font-display), Georgia, serif" }}
            aria-label="Profile"
          >
            {user?.phone ? user.phone.slice(-2) : "SP"}
          </button>

          {showProfileMenu && (
            <div className="absolute right-0 mt-2 w-60 bg-[#172124] border border-[rgba(255,248,235,0.2)] rounded-2xl shadow-2xl p-2 z-50 text-[#fff5e7] animate-in fade-in duration-150">
              <div className="px-3 py-2 border-b border-[rgba(255,248,235,0.1)]">
                <p className="text-xs font-semibold text-[#fff7ec]">Sourabh Patil</p>
                <p className="text-[11px] text-[rgba(255,245,230,0.6)] truncate">
                  {user ? (user.phone || "Synced Account") : "Local Database Mode"}
                </p>
                <div className="mt-1 flex items-center gap-1 text-[10px] text-emerald-400">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  <span>DB: data/split-database.json</span>
                </div>
              </div>
              <div className="py-1 space-y-0.5">
                {!user ? (
                  <button
                    type="button"
                    onClick={() => {
                      setShowProfileMenu(false);
                      onOpenAuth();
                    }}
                    className="w-full text-left px-3 py-1.5 text-xs text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10 rounded-lg transition-colors font-semibold"
                  >
                    ⚡ Cloud Phone Login
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      setShowProfileMenu(false);
                      onOpenAuth();
                    }}
                    className="w-full text-left px-3 py-1.5 text-xs text-[#cad8d1] hover:text-white hover:bg-[rgba(255,248,235,0.08)] rounded-lg transition-colors"
                  >
                    Account Settings
                  </button>
                )}

                {onResetData && (
                  <button
                    type="button"
                    onClick={() => {
                      setShowProfileMenu(false);
                      if (window.confirm("Restore database with fresh seed trips, expenses, and transactions?")) {
                        onResetData();
                      }
                    }}
                    className="w-full text-left px-3 py-1.5 text-xs text-amber-300/80 hover:text-amber-200 hover:bg-amber-500/10 rounded-lg transition-colors"
                  >
                    ↺ Re-seed Database
                  </button>
                )}

                {user && (
                  <button
                    type="button"
                    onClick={() => {
                      setShowProfileMenu(false);
                      onSignOut();
                    }}
                    className="w-full text-left px-3 py-1.5 text-xs text-rose-300 hover:text-rose-200 hover:bg-rose-500/10 rounded-lg transition-colors"
                  >
                    Sign Out
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
