"use client";

import React, { useState } from "react";
import { MOCK_FINANCIAL_GOALS } from "../../../lib/data/mock-data";
import { FinancialGoal } from "../../../lib/types/dashboard";

interface PersonalGoalsPageProps {
  onNewGoal: () => void;
  onDeleteGoal?: (id: string) => void;
  onContributeGoal?: (goalId: string, amount: number) => void;
  userGoals?: FinancialGoal[];
}

const categoryEmojis: Record<string, string> = {
  Travel: "✈️",
  "Safety Net": "🛡️",
  Hardware: "💻",
  Education: "🎓",
  Home: "🏠",
  Investments: "📈",
};

export function PersonalGoalsPage({
  onNewGoal,
  onDeleteGoal,
  onContributeGoal,
  userGoals = [],
}: PersonalGoalsPageProps) {
  const [selectedGoal, setSelectedGoal] = useState<string | null>(null);
  const [contributeGoalId, setContributeGoalId] = useState<string | null>(null);
  const [customAmount, setCustomAmount] = useState<string>("");

  const goals = userGoals.length > 0 ? userGoals : MOCK_FINANCIAL_GOALS;

  const totalSaved = goals.reduce((s, g) => s + g.currentAmount, 0);
  const totalTarget = goals.reduce((s, g) => s + g.targetAmount, 0);
  const overallPct = totalTarget > 0 ? Math.round((totalSaved / totalTarget) * 100) : 0;

  const handleDeposit = (goalId: string, amt: number) => {
    if (isNaN(amt) || amt <= 0) return;
    onContributeGoal?.(goalId, amt);
    setContributeGoalId(null);
    setCustomAmount("");
  };

  return (
    <div className="space-y-6 text-[#fbf5eb]">
      {/* Header */}
      <section className="flex items-start justify-between gap-4 pt-1 animate-pop-in pop-delay-1">
        <div>
          <span className="text-[11px] font-semibold tracking-[0.26em] text-[#6ee7b7] uppercase block mb-1">
            Future Vision
          </span>
          <h1
            className="text-3xl sm:text-4xl font-semibold tracking-tight text-[#fff7ec]"
            style={{ fontFamily: "var(--font-display), Georgia, serif" }}
          >
            Goals
          </h1>
          <p className="text-xs text-[rgba(255,245,230,0.65)] mt-1">
            {goals.length} active goal{goals.length !== 1 ? "s" : ""} · ₹{(totalTarget / 1000).toFixed(0)}k total target
          </p>
        </div>
        <button
          onClick={onNewGoal}
          className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-[#10b981] text-[#052e1a] text-xs font-bold uppercase tracking-widest shadow-lg hover:bg-[#34d399] transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          New Goal
        </button>
      </section>

      {/* Overall Progress Banner */}
      <div className="rounded-2xl border border-[rgba(110,231,183,0.2)] bg-gradient-to-br from-[rgba(5,46,26,0.5)] to-[rgba(22,30,33,0.7)] p-5 backdrop-blur-md animate-pop-in pop-delay-2">
        <div className="flex justify-between items-end mb-3">
          <div>
            <p className="text-[10px] uppercase tracking-widest text-[rgba(110,231,183,0.6)] mb-1">Total Saved</p>
            <p className="text-3xl font-semibold text-[#6ee7b7]" style={{ fontFamily: "var(--font-display), serif" }}>
              ₹{(totalSaved / 1000).toFixed(0)}k
            </p>
            <p className="text-xs text-[rgba(255,245,230,0.45)] mt-0.5">
              of ₹{(totalTarget / 1000).toFixed(0)}k across all goals
            </p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-semibold text-[#6ee7b7]" style={{ fontFamily: "var(--font-display), serif" }}>
              {overallPct}%
            </p>
            <p className="text-[10px] text-[rgba(110,231,183,0.5)]">Overall progress</p>
          </div>
        </div>
        <div className="h-2 bg-[rgba(255,248,235,0.08)] rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-700"
            style={{
              width: `${Math.min(overallPct, 100)}%`,
              background: "linear-gradient(to right, #059669, #6ee7b7)",
            }}
          />
        </div>
      </div>

      {/* Goals List */}
      <div className="space-y-4 animate-pop-in pop-delay-3">
        {goals.map((goal) => {
          const pct = Math.min(100, Math.round((goal.currentAmount / goal.targetAmount) * 100));
          const remaining = Math.max(0, goal.targetAmount - goal.currentAmount);
          const isExpanded = selectedGoal === goal.id;
          const isContributing = contributeGoalId === goal.id;
          const emoji = categoryEmojis[goal.category] || "🎯";

          return (
            <div
              key={goal.id}
              className="group rounded-2xl border border-[rgba(255,248,235,0.1)] bg-[rgba(22,30,33,0.7)] backdrop-blur-md overflow-hidden cursor-pointer hover:border-[rgba(16,185,129,0.3)] transition-all"
              onClick={() => setSelectedGoal(isExpanded ? null : goal.id)}
            >
              <div className="p-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-11 h-11 rounded-xl bg-[rgba(16,185,129,0.12)] flex items-center justify-center text-xl flex-shrink-0">
                    {emoji}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-[#fbf5eb] truncate">{goal.title}</p>
                    <p className="text-[10px] text-[rgba(255,245,230,0.45)] mt-0.5">
                      {goal.category} · Target: {goal.targetDate}
                    </p>
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <div className="text-right">
                      <p className="text-sm font-semibold text-[#6ee7b7]" style={{ fontFamily: "var(--font-display), serif" }}>
                        {pct}%
                      </p>
                      <svg
                        className={`w-4 h-4 text-[rgba(255,245,230,0.35)] ml-auto mt-0.5 transition-transform ${isExpanded ? "rotate-180" : ""}`}
                        fill="none" stroke="currentColor" viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                    {onDeleteGoal && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (window.confirm(`Delete goal "${goal.title}"?`)) {
                            onDeleteGoal(goal.id);
                          }
                        }}
                        title="Delete goal"
                        className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg text-[rgba(255,245,230,0.35)] hover:text-rose-400 hover:bg-rose-500/10 transition-all"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    )}
                  </div>
                </div>

                {/* Progress bar */}
                <div className="h-2 bg-[rgba(255,248,235,0.08)] rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-700"
                    style={{
                      width: `${pct}%`,
                      background: pct >= 75 ? "linear-gradient(to right, #059669, #6ee7b7)" : "linear-gradient(to right, #065f46, #10b981)",
                    }}
                  />
                </div>

                <div className="flex justify-between mt-1.5">
                  <span className="text-[10px] text-[rgba(255,245,230,0.4)]">
                    ₹{goal.currentAmount.toLocaleString("en-IN")} saved
                  </span>
                  <span className="text-[10px] text-[rgba(255,245,230,0.4)]">
                    ₹{goal.targetAmount.toLocaleString("en-IN")} goal
                  </span>
                </div>
              </div>

              {/* Expanded Detail */}
              {isExpanded && (
                <div className="px-4 pb-4 pt-1 border-t border-[rgba(255,248,235,0.08)] space-y-3">
                  <div className="grid grid-cols-3 gap-3 pt-2">
                    <div>
                      <p className="text-[9px] uppercase tracking-widest text-[rgba(255,245,230,0.4)]">Remaining</p>
                      <p className="text-sm font-semibold mt-0.5" style={{ fontFamily: "var(--font-display), serif" }}>
                        ₹{remaining.toLocaleString("en-IN")}
                      </p>
                    </div>
                    <div>
                      <p className="text-[9px] uppercase tracking-widest text-[rgba(255,245,230,0.4)]">Target Date</p>
                      <p className="text-sm font-semibold mt-0.5">{goal.targetDate}</p>
                    </div>
                    <div>
                      <p className="text-[9px] uppercase tracking-widest text-[rgba(255,245,230,0.4)]">Category</p>
                      <p className="text-sm font-semibold mt-0.5">{goal.category}</p>
                    </div>
                  </div>

                  {/* Inline Deposit / Contribution Section */}
                  {isContributing ? (
                    <div
                      className="p-3.5 rounded-xl bg-[rgba(255,248,235,0.04)] border border-[#6ee7b7]/30 space-y-3"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-[#6ee7b7]">Deposit to Goal</span>
                        <button
                          type="button"
                          onClick={() => setContributeGoalId(null)}
                          className="text-[10px] text-[rgba(255,245,230,0.4)] hover:text-white"
                        >
                          ✕ Cancel
                        </button>
                      </div>

                      {/* Quick Chips */}
                      <div className="flex flex-wrap gap-2">
                        {[500, 1000, 2500, 5000].map((chip) => (
                          <button
                            key={chip}
                            type="button"
                            onClick={() => handleDeposit(goal.id, chip)}
                            className="px-2.5 py-1 rounded-lg bg-[rgba(110,231,183,0.1)] hover:bg-[rgba(110,231,183,0.2)] text-[#6ee7b7] text-[11px] font-semibold border border-[rgba(110,231,183,0.25)] transition-all"
                          >
                            +₹{chip.toLocaleString("en-IN")}
                          </button>
                        ))}
                      </div>

                      {/* Custom input */}
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          placeholder="Or custom amount (₹)…"
                          value={customAmount}
                          onChange={(e) => setCustomAmount(e.target.value)}
                          className="flex-1 bg-[rgba(20,28,32,0.8)] border border-[rgba(255,248,235,0.15)] rounded-xl px-3 py-1.5 text-xs text-[#fff7ec] placeholder:text-[rgba(255,245,230,0.3)] outline-none focus:border-[#6ee7b7]/60"
                        />
                        <button
                          type="button"
                          onClick={() => handleDeposit(goal.id, parseFloat(customAmount))}
                          disabled={!customAmount || parseFloat(customAmount) <= 0}
                          className="px-3.5 py-1.5 rounded-xl bg-[#10b981] disabled:opacity-40 text-[#052e1a] text-xs font-bold uppercase tracking-wider hover:bg-[#34d399] transition-colors"
                        >
                          Deposit
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setContributeGoalId(goal.id);
                      }}
                      className="w-full py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest text-[#6ee7b7] border border-[rgba(110,231,183,0.3)] hover:bg-[rgba(110,231,183,0.08)] transition-colors"
                    >
                      + Add Contribution
                    </button>
                  )}
                </div>
              )}
            </div>
          );
        })}

        {/* Add new goal card */}
        <button
          onClick={onNewGoal}
          className="w-full py-8 rounded-2xl border-2 border-dashed border-[rgba(255,248,235,0.15)] text-[rgba(255,245,230,0.4)] hover:border-[rgba(16,185,129,0.35)] hover:text-[#6ee7b7]/70 transition-all flex flex-col items-center gap-2 group"
        >
          <div className="w-9 h-9 rounded-full border border-current flex items-center justify-center group-hover:scale-110 transition-transform">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 4v16m8-8H4" />
            </svg>
          </div>
          <span className="text-xs font-semibold uppercase tracking-widest">Set a new goal</span>
        </button>
      </div>
    </div>
  );
}
