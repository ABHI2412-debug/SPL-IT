"use client";

import React from "react";
import { PersonalTab, SpaceType, TripTab } from "../../lib/types/dashboard";

interface BottomNavProps {
  space: SpaceType;
  activeTripTab: TripTab;
  activePersonalTab: PersonalTab;
  onTripTabChange: (tab: TripTab) => void;
  onPersonalTabChange: (tab: PersonalTab) => void;
  onOpenQuickAction: () => void;
}

export function BottomNav({
  space,
  activeTripTab,
  activePersonalTab,
  onTripTabChange,
  onPersonalTabChange,
}: BottomNavProps) {
  const isTrip = space === "trip";

  const tripTabs: Array<{ id: TripTab; label: string; icon: React.ReactNode }> = [
    {
      id: "home",
      label: "Home",
      icon: (
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
          <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" />
        </svg>
      ),
    },
    {
      id: "spaces",
      label: "Spaces",
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.8}
            d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
          />
        </svg>
      ),
    },
    {
      id: "expenses",
      label: "Expenses",
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.8}
            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          />
        </svg>
      ),
    },
    {
      id: "settlements",
      label: "Settlements",
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.8}
            d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"
          />
        </svg>
      ),
    },
    {
      id: "analytics",
      label: "Analytics",
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.8}
            d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z"
          />
        </svg>
      ),
    },
  ];

  const personalTabs: Array<{ id: PersonalTab; label: string; icon: React.ReactNode }> = [
    {
      id: "home",
      label: "Home",
      icon: (
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
          <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" />
        </svg>
      ),
    },
    {
      id: "transactions",
      label: "Transactions",
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.8}
            d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
          />
        </svg>
      ),
    },
    {
      id: "budgets",
      label: "Budgets",
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.8}
            d="M3 6h18M3 12h18m-7 6h7M5 19h4"
          />
        </svg>
      ),
    },
    {
      id: "analytics",
      label: "Analytics",
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.8}
            d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
          />
        </svg>
      ),
    },
    {
      id: "goals",
      label: "Goals",
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.8}
            d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
          />
        </svg>
      ),
    },
  ];

  return (
    <nav
      aria-label="Bottom Navigation Dock"
      className="fixed bottom-4 sm:bottom-6 inset-x-0 z-50 flex justify-center px-4 pointer-events-none animate-bottom-nav-pop"
    >
      <div
        className={`pointer-events-auto flex items-center gap-1 sm:gap-2 px-3.5 py-1.5 rounded-full backdrop-blur-2xl border mx-auto transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${
          isTrip
            ? "bg-[rgba(22,34,38,0.78)] border-[rgba(235,248,246,0.22)] shadow-[0_20px_50px_rgba(6,12,14,0.45),inset_0_1px_0_rgba(255,255,255,0.16)]"
            : "bg-[rgba(46,30,36,0.78)] border-[rgba(255,238,225,0.22)] shadow-[0_20px_50px_rgba(18,10,12,0.45),inset_0_1px_0_rgba(255,255,255,0.16)]"
        }`}
      >
        <div key={space} className="flex items-center gap-1 sm:gap-2">
          {isTrip
            ? tripTabs.map((tab, idx) => {
                const isActive = activeTripTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    data-spotlight-id={`nav-${tab.id}`}
                    onClick={() => onTripTabChange(tab.id)}
                    style={{ animationDelay: `${idx * 40}ms` }}
                    className={`animate-bottom-tab flex flex-col items-center justify-center min-w-[56px] sm:min-w-[64px] py-1 px-2.5 rounded-full text-[10px] font-medium transition-all ${
                      isActive
                        ? "text-[#e0a875] font-bold"
                        : "text-[rgba(255,245,230,0.55)] hover:text-white"
                    }`}
                  >
                    <div
                      className={`w-9 h-6 rounded-full flex items-center justify-center transition-all ${
                        isActive
                          ? "bg-[#e0a875]/20 text-[#e0a875] border border-[#e0a875]/35 shadow-sm"
                          : ""
                      }`}
                    >
                      {tab.icon}
                    </div>
                    <span
                      className="mt-0.5 tracking-tight uppercase text-[9px]"
                      style={{ fontFamily: "var(--font-sans-ui), sans-serif" }}
                    >
                      {tab.label}
                    </span>
                  </button>
                );
              })
            : personalTabs.map((tab, idx) => {
                const isActive = activePersonalTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    data-spotlight-id={`nav-${tab.id}`}
                    onClick={() => onPersonalTabChange(tab.id)}
                    style={{ animationDelay: `${idx * 40}ms` }}
                    className={`animate-bottom-tab flex flex-col items-center justify-center min-w-[56px] sm:min-w-[64px] py-1 px-2.5 rounded-full text-[10px] font-medium transition-all ${
                      isActive
                        ? "text-[#f39850] font-bold"
                        : "text-[rgba(255,245,230,0.55)] hover:text-white"
                    }`}
                  >
                    <div
                      className={`w-9 h-6 rounded-full flex items-center justify-center transition-all ${
                        isActive
                          ? "bg-[#f39850]/20 text-[#f39850] border border-[#f39850]/35 shadow-sm"
                          : ""
                      }`}
                    >
                      {tab.icon}
                    </div>
                    <span
                      className="mt-0.5 tracking-tight uppercase text-[9px]"
                      style={{ fontFamily: "var(--font-sans-ui), sans-serif" }}
                    >
                      {tab.label}
                    </span>
                  </button>
                );
              })}
        </div>
      </div>
    </nav>
  );
}
