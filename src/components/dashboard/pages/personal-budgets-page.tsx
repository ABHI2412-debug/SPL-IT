"use client";

import React, { useState } from "react";
import { BudgetProgress } from "../../../lib/types/dashboard";
import { MOCK_BUDGETS, MOCK_UPCOMING_PAYMENTS } from "../../../lib/data/mock-data";

interface PersonalBudgetsPageProps {
  onNewBudget: () => void;
  onDeleteBudget?: (id: string) => void;
  userBudgets?: BudgetProgress[];
}

export function PersonalBudgetsPage({
  onNewBudget,
  onDeleteBudget,
  userBudgets = [],
}: PersonalBudgetsPageProps) {
  // Merge user budgets with mock budgets (user budgets take precedence for same category)
  const budgets = [
    ...userBudgets,
    ...MOCK_BUDGETS.filter(
      (mb) => !userBudgets.some((ub) => ub.category.toLowerCase() === mb.category.toLowerCase())
    ),
  ];

  const [paidPaymentIds, setPaidPaymentIds] = useState<string[]>([]);

  const totalAllocated = budgets.reduce((s, b) => s + b.allocated, 0);
  const totalSpent = budgets.reduce((s, b) => s + b.spent, 0);
  const overallPct = totalAllocated > 0 ? Math.round((totalSpent / totalAllocated) * 100) : 0;

  const handleTogglePaid = (paymentId: string) => {
    setPaidPaymentIds((prev) =>
      prev.includes(paymentId) ? prev.filter((id) => id !== paymentId) : [...prev, paymentId]
    );
  };

  return (
    <div className="space-y-6 text-[#fbf5eb]">
      {/* Header */}
      <section className="flex items-start justify-between gap-4 pt-1 animate-pop-in pop-delay-1">
        <div>
          <span className="text-[11px] font-semibold tracking-[0.26em] text-[#6ee7b7] uppercase block mb-1">
            Spending Control
          </span>
          <h1
            className="text-3xl sm:text-4xl font-semibold tracking-tight text-[#fff7ec]"
            style={{ fontFamily: "var(--font-display), Georgia, serif" }}
          >
            Budgets
          </h1>
          <p className="text-xs text-[rgba(255,245,230,0.65)] mt-1">
            Set limits, track progress, stay in control
          </p>
        </div>
        <button
          onClick={onNewBudget}
          className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-[#10b981] text-[#052e1a] text-xs font-bold uppercase tracking-widest shadow-lg hover:bg-[#34d399] transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add Budget
        </button>
      </section>

      {/* Overall Budget Card */}
      <div className="rounded-2xl border border-[rgba(255,248,235,0.12)] bg-[rgba(22,30,33,0.75)] p-5 backdrop-blur-md animate-pop-in pop-delay-2">
        <div className="flex justify-between items-start mb-3">
          <div>
            <p className="text-[10px] uppercase tracking-widest text-[rgba(255,245,230,0.5)]">Overall Budget</p>
            <p className="text-2xl font-semibold mt-0.5" style={{ fontFamily: "var(--font-display), serif" }}>
              ₹{totalSpent.toLocaleString("en-IN")}
              <span className="text-base font-normal text-[rgba(255,245,230,0.45)] ml-1">
                / ₹{totalAllocated.toLocaleString("en-IN")}
              </span>
            </p>
          </div>
          <div className="text-right">
            <p
              className="text-2xl font-semibold"
              style={{
                fontFamily: "var(--font-display), serif",
                color: overallPct >= 90 ? "#fca5a5" : overallPct >= 75 ? "#fcd34d" : "#6ee7b7",
              }}
            >
              {overallPct}%
            </p>
            <p className="text-[10px] text-[rgba(255,245,230,0.45)]">Used this month</p>
          </div>
        </div>
        <div className="h-2 bg-[rgba(255,248,235,0.08)] rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-700"
            style={{
              width: `${Math.min(overallPct, 100)}%`,
              background:
                overallPct >= 90
                  ? "linear-gradient(to right, #ef4444, #fca5a5)"
                  : overallPct >= 75
                  ? "linear-gradient(to right, #f59e0b, #fcd34d)"
                  : "linear-gradient(to right, #059669, #6ee7b7)",
            }}
          />
        </div>
        <p className="text-[10px] text-[rgba(255,245,230,0.4)] mt-2">
          ₹{Math.max(0, totalAllocated - totalSpent).toLocaleString("en-IN")} remaining
        </p>
      </div>

      {/* Category Budgets */}
      <div className="space-y-3 animate-pop-in pop-delay-3">
        <div className="flex items-center justify-between">
          <p className="text-xs font-semibold uppercase tracking-widest text-[rgba(255,245,230,0.5)]">
            Category Limits ({budgets.length})
          </p>
        </div>
        {budgets.map((b) => {
          const pct = Math.min(100, Math.round((b.spent / b.allocated) * 100));
          const isWarning = pct >= b.warningThreshold;
          const isDanger = pct >= 95;
          const barColor = isDanger ? "#ef4444" : isWarning ? "#f59e0b" : "#10b981";

          return (
            <div
              key={b.id}
              className="group rounded-2xl border border-[rgba(255,248,235,0.1)] bg-[rgba(22,30,33,0.7)] p-4 backdrop-blur-md hover:border-[rgba(255,248,235,0.2)] transition-all"
            >
              <div className="flex items-center gap-3 mb-3">
                <span className="text-xl">{b.categoryIcon}</span>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-[#fbf5eb]">{b.category}</p>
                </div>
                <div className="text-right flex items-center gap-3">
                  <div>
                    <p
                      className="text-sm font-semibold"
                      style={{
                        fontFamily: "var(--font-display), serif",
                        color: isDanger ? "#fca5a5" : isWarning ? "#fcd34d" : "#fbf5eb",
                      }}
                    >
                      {b.currency || "₹"}{b.spent.toLocaleString("en-IN")}
                      <span className="text-[rgba(255,245,230,0.4)] font-normal text-xs">
                        {" "}/ {b.currency || "₹"}{b.allocated.toLocaleString("en-IN")}
                      </span>
                    </p>
                    <p className="text-[10px] mt-0.5" style={{ color: barColor }}>
                      {pct}% used
                      {isDanger && " · ⚠️ Near limit"}
                    </p>
                  </div>
                  {onDeleteBudget && (
                    <button
                      type="button"
                      onClick={() => {
                        if (window.confirm(`Delete budget for "${b.category}"?`)) {
                          onDeleteBudget(b.id);
                        }
                      }}
                      title="Delete budget"
                      className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg text-[rgba(255,245,230,0.35)] hover:text-rose-400 hover:bg-rose-500/10 transition-all"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  )}
                </div>
              </div>
              <div className="h-1.5 bg-[rgba(255,248,235,0.08)] rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{ width: `${Math.min(pct, 100)}%`, backgroundColor: barColor }}
                />
              </div>
              <div className="flex justify-between mt-1.5">
                <span className="text-[9px] text-[rgba(255,245,230,0.35)]">₹0</span>
                <span className="text-[9px] text-[rgba(255,245,230,0.35)]">
                  ₹{Math.max(0, b.allocated - b.spent).toLocaleString("en-IN")} left
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Upcoming Payments */}
      <div className="space-y-3">
        <p className="text-xs font-semibold uppercase tracking-widest text-[rgba(255,245,230,0.5)]">Upcoming Payments</p>
        {MOCK_UPCOMING_PAYMENTS.map((up) => {
          const isPaid = paidPaymentIds.includes(up.id);
          return (
            <div
              key={up.id}
              className={`flex items-center gap-4 p-4 rounded-2xl border transition-all ${
                isPaid
                  ? "border-[#6ee7b7]/30 bg-[rgba(110,231,183,0.05)]"
                  : "border-[rgba(255,248,235,0.1)] bg-[rgba(22,30,33,0.7)] backdrop-blur-md"
              }`}
            >
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                  isPaid
                    ? "bg-[#6ee7b7]/20 text-[#6ee7b7]"
                    : up.daysRemaining <= 3
                    ? "bg-[rgba(252,165,165,0.1)] text-[#fca5a5]"
                    : "bg-[rgba(255,248,235,0.06)] text-[rgba(255,245,230,0.6)]"
                }`}
              >
                {isPaid ? "✓" : `${up.daysRemaining}d`}
              </div>
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-medium truncate ${isPaid ? "line-through text-[rgba(255,245,230,0.5)]" : "text-[#fbf5eb]"}`}>
                  {up.title}
                </p>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-[10px] text-[rgba(255,245,230,0.5)]">{up.category}</span>
                  <span className="text-[rgba(255,248,235,0.2)]">·</span>
                  <span className="text-[10px] text-[rgba(255,245,230,0.45)]">{up.dueDate}</span>
                  {up.autoPay && (
                    <>
                      <span className="text-[rgba(255,248,235,0.2)]">·</span>
                      <span className="text-[9px] font-bold text-[#6ee7b7] uppercase tracking-wider">Auto</span>
                    </>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-3 flex-shrink-0">
                <p className="text-sm font-semibold" style={{ fontFamily: "var(--font-display), serif" }}>
                  {up.currency}{up.amount.toLocaleString("en-IN")}
                </p>
                <button
                  type="button"
                  onClick={() => handleTogglePaid(up.id)}
                  className={`px-2.5 py-1 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all ${
                    isPaid
                      ? "bg-[#6ee7b7]/15 text-[#6ee7b7] border border-[#6ee7b7]/30"
                      : "bg-[rgba(255,248,235,0.06)] hover:bg-[rgba(255,248,235,0.12)] text-[rgba(255,245,230,0.7)] border border-[rgba(255,248,235,0.12)]"
                  }`}
                >
                  {isPaid ? "Paid ✓" : "Mark Paid"}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
