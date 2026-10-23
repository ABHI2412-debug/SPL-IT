"use client";

import React, { useState } from "react";
import { BudgetProgress, FinancialGoal, PersonalTab, PersonalTransaction } from "../../lib/types/dashboard";
import { MOCK_PERSONAL_TRANSACTIONS, MOCK_BUDGETS, MOCK_FINANCIAL_GOALS, MOCK_UPCOMING_PAYMENTS } from "../../lib/data/mock-data";
import { LiveClock } from "./live-clock";
import { ScrollReveal } from "../ui/scroll-reveal";

interface PersonalFinanceViewProps {
  onAddTransaction: () => void;
  onNewBudget: () => void;
  onNewGoal: () => void;
  onExportReceipt?: () => void;
  onScanReceipt?: () => void;
  onNavigateTab?: (tab: PersonalTab) => void;
  onDeleteTransaction?: (id: string) => void;
  userTransactions?: PersonalTransaction[];
  userBudgets?: BudgetProgress[];
  userGoals?: FinancialGoal[];
}

const categoryPalette = [
  { color: "#f39850", bg: "rgba(243,152,80,0.2)" },
  { color: "#dda071", bg: "rgba(221,160,113,0.2)" },
  { color: "#5d7c87", bg: "rgba(93,124,135,0.2)" },
  { color: "#b3644c", bg: "rgba(179,100,76,0.2)" },
  { color: "#8b6873", bg: "rgba(139,104,115,0.2)" },
  { color: "#10b981", bg: "rgba(16,185,129,0.2)" },
  { color: "#f59e0b", bg: "rgba(245,158,11,0.2)" },
  { color: "#605256", bg: "rgba(96,82,86,0.2)" },
];

export function PersonalFinanceView({
  onAddTransaction,
  onNewBudget,
  onNewGoal,
  onExportReceipt,
  onScanReceipt,
  onNavigateTab,
  onDeleteTransaction,
  userTransactions = [],
  userBudgets = [],
  userGoals = [],
}: PersonalFinanceViewProps) {
  const [selectedMonth] = useState("This Month");

  const allTransactions = userTransactions.length > 0 ? userTransactions : MOCK_PERSONAL_TRANSACTIONS;
  const incomeTxns = allTransactions.filter((t) => t.type === "income");
  const expenseTxns = allTransactions.filter((t) => t.type === "expense");

  const dynamicIncome = incomeTxns.reduce((s, t) => s + t.amount, 0);
  const dynamicExpense = expenseTxns.reduce((s, t) => s + t.amount, 0);
  const dynamicBalance = dynamicIncome - dynamicExpense;

  // Aggregate spending by category for real-time Donut Chart
  const categoryMap = new Map<string, number>();
  expenseTxns.forEach((t) => {
    categoryMap.set(t.category, (categoryMap.get(t.category) || 0) + t.amount);
  });

  const totalExpenseAmount = dynamicExpense > 0 ? dynamicExpense : 1;
  const computedCategories = Array.from(categoryMap.entries())
    .map(([cat, amt], idx) => {
      const pct = Math.max(1, Math.round((amt / totalExpenseAmount) * 100));
      return {
        category: cat,
        amount: amt,
        percentage: pct,
        color: categoryPalette[idx % categoryPalette.length].color,
      };
    })
    .sort((a, b) => b.amount - a.amount);

  const displayCategories = computedCategories.length > 0
    ? computedCategories
    : [
        { category: "Food & Dining", amount: 9500, percentage: 32, color: "#f39850" },
        { category: "Shopping", amount: 5400, percentage: 18, color: "#dda071" },
        { category: "Transport", amount: 4800, percentage: 16, color: "#5d7c87" },
        { category: "Subscriptions", amount: 3600, percentage: 12, color: "#b3644c" },
        { category: "Bills & Utilities", amount: 3000, percentage: 10, color: "#8b6873" },
        { category: "Others", amount: 3450, percentage: 12, color: "#605256" },
      ];

  // Circumference for 2 * PI * 46 ≈ 289.027
  const CIRCLE_CIRCUMFERENCE = 289.027;

  // Real-time Cash Flow bars generated from recent transactions
  const cashFlowBars = (() => {
    if (allTransactions.length === 0) {
      return [
        { label: "1 Jun", income: 32, expense: 18, rawIncome: 32000, rawExpense: 18000 },
        { label: "8 Jun", income: 38, expense: 22, rawIncome: 38000, rawExpense: 22000 },
        { label: "15 Jun", income: 28, expense: 19, rawIncome: 28000, rawExpense: 19000 },
        { label: "22 Jun", income: 34, expense: 23, rawIncome: 34000, rawExpense: 23000 },
        { label: "30 Jun", income: 39, expense: 29, rawIncome: 39000, rawExpense: 29000 },
      ];
    }

    // Group transactions by date
    const dateGroups = new Map<string, { income: number; expense: number }>();
    allTransactions.forEach((tx) => {
      const dateLabel = tx.date.replace(/Today,\s*|Yesterday,\s*/i, "").trim().split(" ").slice(0, 2).join(" ");
      const current = dateGroups.get(dateLabel) || { income: 0, expense: 0 };
      if (tx.type === "income") current.income += tx.amount;
      else if (tx.type === "expense") current.expense += tx.amount;
      dateGroups.set(dateLabel, current);
    });

    const entries = Array.from(dateGroups.entries()).slice(0, 5);
    const maxVal = Math.max(
      ...entries.map(([, vals]) => Math.max(vals.income, vals.expense)),
      1000
    );

    return entries.map(([label, vals]) => ({
      label,
      income: (vals.income / maxVal) * 36 + 4,
      expense: (vals.expense / maxVal) * 36 + 4,
      rawIncome: vals.income,
      rawExpense: vals.expense,
    }));
  })();

  const displayGoals = userGoals.length > 0 ? userGoals : MOCK_FINANCIAL_GOALS;
  const displayBudgets = userBudgets.length > 0 ? userBudgets : MOCK_BUDGETS;
  const displayUpcoming = MOCK_UPCOMING_PAYMENTS;

  return (
    <div className="space-y-6 text-[#fbf5eb]">
      {/* ========================================================= */}
      {/* 1. GREETING & CLOCK HEADER (ROOM LEDGER)                  */}
      {/* ========================================================= */}
      <ScrollReveal delay={40} direction="flip-up">
        <section className="flex items-start justify-between gap-4 pt-1 pb-1">
          <div>
            <span
              className="text-[11px] font-semibold tracking-[0.26em] text-[#f39850] uppercase block mb-1"
              style={{ fontFamily: "var(--font-sans-ui), sans-serif" }}
            >
              Room Ledger
            </span>
            <div className="flex items-baseline gap-2.5">
              <span className="text-sm font-normal text-[rgba(255,245,230,0.65)]">Good evening,</span>
              <h1
                className="text-3xl sm:text-4xl font-semibold tracking-tight text-[#fff7ec]"
                style={{ fontFamily: "var(--font-display), Georgia, serif" }}
              >
                Sourabh
              </h1>
            </div>
            <p className="text-xs text-[rgba(255,245,230,0.65)] mt-1 font-medium">
              Shared local expenses and personal finance for the people around you every day.
            </p>
            <div className="flex flex-wrap items-center gap-2 mt-3">
              <button
                type="button"
                onClick={onAddTransaction}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#f39850] text-[#1a1208] text-xs font-bold uppercase tracking-wider shadow-md hover:bg-[#e08942] transition-colors"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
                </svg>
                Record Transaction
              </button>
              {onScanReceipt && (
                <button
                  type="button"
                  onClick={onScanReceipt}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[rgba(255,248,235,0.08)] border border-[rgba(255,248,235,0.18)] text-[rgba(255,245,230,0.85)] text-xs font-semibold uppercase tracking-wider hover:border-[#f39850]/40 hover:text-[#f39850] transition-all"
                >
                  <span>📷</span>
                  Scan Bill
                </button>
              )}
              <button
                type="button"
                onClick={onNewBudget}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[rgba(255,248,235,0.08)] border border-[rgba(255,248,235,0.18)] text-[#6ee7b7] text-xs font-semibold uppercase tracking-wider hover:bg-[rgba(255,248,235,0.14)] transition-all"
              >
                <span>🎯</span>
                Set Budget
              </button>
              <button
                type="button"
                onClick={onNewGoal}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[rgba(255,248,235,0.08)] border border-[rgba(255,248,235,0.18)] text-[#67e8f9] text-xs font-semibold uppercase tracking-wider hover:bg-[rgba(255,248,235,0.14)] transition-all"
              >
                <span>💎</span>
                New Goal
              </button>
              <button
                type="button"
                onClick={onExportReceipt}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[rgba(255,248,235,0.08)] border border-[rgba(255,248,235,0.18)] text-[#fcd34d] text-xs font-semibold uppercase tracking-wider hover:bg-[rgba(255,248,235,0.14)] hover:border-[#fcd34d]/40 transition-all"
              >
                <span>🧾</span>
                Statement Slip
              </button>
            </div>
          </div>

          <LiveClock />
        </section>
      </ScrollReveal>

      {/* ========================================================= */}
      {/* 2. TOP ROW: 3 FINANCIAL METRICS CARDS                     */}
      {/* ========================================================= */}
      <ScrollReveal delay={80} direction="flip-up">
        <section className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Total Balance */}
          <div
            className="bg-[rgba(48,32,40,0.60)] backdrop-blur-2xl border border-[rgba(255,238,225,0.18)] rounded-3xl p-5 sm:p-6 flex flex-col justify-between shadow-2xl hover:border-[#f39850]/45 transition-all relative overflow-hidden smooth-hover-card"
            style={{
              boxShadow: "0 16px 45px rgba(18, 10, 12, 0.35), inset 0 1px 0 rgba(255, 255, 255, 0.14)",
            }}
          >
            {/* Subtle warm glow from Room lighting */}
            <div className="absolute top-0 right-0 w-36 h-36 bg-[radial-gradient(circle_at_top_right,rgba(243,152,80,0.18),transparent_70%)] pointer-events-none" />

            <div className="flex items-start justify-between">
              <div>
                <span
                  className="text-[10px] uppercase tracking-[0.24em] text-[rgba(255,240,214,0.72)] font-semibold block"
                  style={{ fontFamily: "var(--font-sans-ui), sans-serif" }}
                >
                  Total Balance
                </span>
                <strong
                  className={`text-3xl sm:text-4xl font-semibold ${dynamicBalance >= 0 ? "text-[#fff7ec]" : "text-[#fca5a5]"} block mt-2 tracking-tight`}
                  style={{ fontFamily: "var(--font-display), Georgia, serif" }}
                >
                  ₹{dynamicBalance.toLocaleString("en-IN")}
                </strong>
              </div>
              <div className="w-8 h-8 rounded-full border border-[rgba(255,248,235,0.24)] bg-[rgba(243,152,80,0.15)] text-[#f39850] flex items-center justify-center text-sm shadow-sm">
                {dynamicBalance >= 0 ? "↗" : "↘"}
              </div>
            </div>
            <div className="mt-4 pt-3 border-t border-[rgba(255,238,225,0.08)] flex items-center justify-between">
              <span className={`text-[10px] uppercase tracking-[0.14em] font-semibold flex items-center gap-1.5 px-2.5 py-1 rounded-full ${
                dynamicBalance >= 0
                  ? "text-[#9cc79d] bg-[#9cc79d]/10 border border-[#9cc79d]/25"
                  : "text-[#fca5a5] bg-[#fca5a5]/10 border border-[#fca5a5]/25"
              }`}>
                <span className={`w-1.5 h-1.5 rounded-full ${dynamicBalance >= 0 ? "bg-[#9cc79d]" : "bg-[#fca5a5]"}`} />
                {dynamicBalance >= 0 ? "Healthy Net Cashflow" : "Deficit this cycle"}
              </span>
              <span
                className="text-[10px] text-[rgba(255,245,230,0.5)] uppercase tracking-wider"
                style={{ fontFamily: "var(--font-mono-ui), monospace" }}
              >
                Live Sync
              </span>
            </div>
          </div>

          {/* Total Income */}
          <div
            className="bg-[rgba(48,32,40,0.60)] backdrop-blur-2xl border border-[rgba(255,238,225,0.18)] rounded-3xl p-5 sm:p-6 flex flex-col justify-between shadow-2xl hover:border-[#f39850]/45 transition-all relative overflow-hidden smooth-hover-card"
            style={{
              boxShadow: "0 16px 45px rgba(18, 10, 12, 0.35), inset 0 1px 0 rgba(255, 255, 255, 0.14)",
            }}
          >
            <div className="flex items-start justify-between">
              <div>
                <span
                  className="text-[10px] uppercase tracking-[0.24em] text-[rgba(255,240,214,0.72)] font-semibold block"
                  style={{ fontFamily: "var(--font-sans-ui), sans-serif" }}
                >
                  Total Income
                </span>
                <strong
                  className="text-3xl sm:text-4xl font-semibold text-[#6ee7b7] block mt-2 tracking-tight"
                  style={{ fontFamily: "var(--font-display), Georgia, serif" }}
                >
                  ₹{dynamicIncome.toLocaleString("en-IN")}
                </strong>
              </div>
              <div className="w-8 h-8 rounded-full border border-[rgba(255,248,235,0.24)] bg-[rgba(110,231,183,0.15)] text-[#6ee7b7] flex items-center justify-center text-sm shadow-sm">
                +
              </div>
            </div>
            <div className="mt-4 pt-3 border-t border-[rgba(255,238,225,0.08)] flex items-center justify-between">
              <span className="text-[10px] uppercase tracking-[0.14em] font-semibold text-[#6ee7b7] flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#6ee7b7]/10 border border-[#6ee7b7]/25">
                Active ledger
              </span>
              <span
                className="text-[10px] text-[rgba(255,245,230,0.5)] uppercase tracking-wider"
                style={{ fontFamily: "var(--font-mono-ui), monospace" }}
              >
                {incomeTxns.length} Credit{incomeTxns.length === 1 ? "" : "s"}
              </span>
            </div>
          </div>

          {/* Total Expenses */}
          <div
            className="bg-[rgba(48,32,40,0.60)] backdrop-blur-2xl border border-[rgba(255,238,225,0.18)] rounded-3xl p-5 sm:p-6 flex flex-col justify-between shadow-2xl hover:border-[#db9b83]/45 transition-all relative overflow-hidden smooth-hover-card"
            style={{
              boxShadow: "0 16px 45px rgba(18, 10, 12, 0.35), inset 0 1px 0 rgba(255, 255, 255, 0.14)",
            }}
          >
            <div className="flex items-start justify-between">
              <div>
                <span
                  className="text-[10px] uppercase tracking-[0.24em] text-[rgba(255,240,214,0.72)] font-semibold block"
                  style={{ fontFamily: "var(--font-sans-ui), sans-serif" }}
                >
                  Total Expenses
                </span>
                <strong
                  className="text-3xl sm:text-4xl font-semibold text-[#fca5a5] block mt-2 tracking-tight"
                  style={{ fontFamily: "var(--font-display), Georgia, serif" }}
                >
                  ₹{dynamicExpense.toLocaleString("en-IN")}
                </strong>
              </div>
              <div className="w-8 h-8 rounded-full border border-[rgba(255,248,235,0.24)] bg-[rgba(244,63,94,0.15)] text-[#fca5a5] flex items-center justify-center text-sm shadow-sm">
                -
              </div>
            </div>
            <div className="mt-4 pt-3 border-t border-[rgba(255,238,225,0.08)] flex items-center justify-between">
              <span className="text-[10px] uppercase tracking-[0.14em] font-semibold text-[#fca5a5] flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#fca5a5]/10 border border-[#fca5a5]/25">
                Spending Total
              </span>
              <span
                className="text-[10px] text-[rgba(255,245,230,0.5)] uppercase tracking-wider"
                style={{ fontFamily: "var(--font-mono-ui), monospace" }}
              >
                {expenseTxns.length} Txn{expenseTxns.length === 1 ? "" : "s"}
              </span>
            </div>
          </div>
        </section>
      </ScrollReveal>

      {/* ========================================================= */}
      {/* 3. MIDDLE ROW: INCOME VS EXPENSES + SPENDING BY CATEGORY  */}
      {/* ========================================================= */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Income vs Expenses Dynamic Cash Flow */}
        <ScrollReveal delay={40} direction="flip-up" className="lg:col-span-6 flex flex-col">
          <div
            className="h-full bg-[rgba(48,32,40,0.60)] backdrop-blur-2xl border border-[rgba(255,238,225,0.18)] rounded-3xl p-5 sm:p-6 shadow-2xl flex flex-col justify-between"
            style={{
              boxShadow: "0 16px 45px rgba(18, 10, 12, 0.35), inset 0 1px 0 rgba(255, 255, 255, 0.14)",
            }}
          >
            <div className="flex items-center justify-between mb-4">
              <div>
                <span
                  className="text-[10px] uppercase tracking-[0.24em] text-[rgba(243,152,80,0.85)] font-semibold block mb-0.5"
                  style={{ fontFamily: "var(--font-sans-ui), sans-serif" }}
                >
                  Cash Flow
                </span>
                <h2
                  className="text-base sm:text-lg font-semibold text-[#fff5e7] tracking-tight"
                  style={{ fontFamily: "var(--font-display), Georgia, serif" }}
                >
                  Income vs Expenses
                </h2>
              </div>
              <div className="px-3.5 py-1.5 rounded-full border border-[rgba(255,244,225,0.24)] bg-[rgba(255,247,235,0.08)] text-[10px] font-bold text-[#f39850] uppercase tracking-[0.16em] flex items-center gap-1.5 backdrop-blur-md">
                <span>{selectedMonth}</span>
              </div>
            </div>

            <div className="pt-2 pb-1">
              <div className="h-44 w-full flex items-end justify-between gap-2 px-1">
                {/* Y Axis Guide */}
                <div className="h-full flex flex-col justify-between text-[10px] text-[rgba(255,245,230,0.4)] font-mono pr-2 py-1 select-none">
                  <span>High</span>
                  <span>Mid</span>
                  <span>Low</span>
                  <span>0</span>
                </div>

                {/* Dynamic Cash Flow Groups */}
                {cashFlowBars.map((grp) => (
                  <div key={grp.label} className="flex-1 flex flex-col items-center gap-2">
                    <div className="h-32 w-full flex items-end justify-center gap-2 pb-1 border-b border-[rgba(255,245,230,0.1)]">
                      {/* Income Bar (Warm Apricot / Ochre) */}
                      <div
                        style={{ height: `${Math.min(100, (grp.income / 40) * 100)}%` }}
                        className="w-3 sm:w-3.5 bg-[#6ee7b7] rounded-t-md transition-all duration-300 shadow-sm"
                        title={grp.rawIncome ? `Income: ₹${grp.rawIncome.toLocaleString("en-IN")}` : undefined}
                      />
                      {/* Expense Bar (Desert Terracotta) */}
                      <div
                        style={{ height: `${Math.min(100, (grp.expense / 40) * 100)}%` }}
                        className="w-3 sm:w-3.5 bg-[#f39850] rounded-t-md transition-all duration-300 shadow-sm"
                        title={grp.rawExpense ? `Expense: ₹${grp.rawExpense.toLocaleString("en-IN")}` : undefined}
                      />
                    </div>
                    <span
                      className="text-[10px] text-[rgba(255,245,230,0.6)] font-medium uppercase tracking-wider truncate max-w-[50px] text-center"
                      style={{ fontFamily: "var(--font-mono-ui), monospace" }}
                    >
                      {grp.label}
                    </span>
                  </div>
                ))}
              </div>

              {/* Legend */}
              <div className="flex items-center justify-center gap-6 pt-4 text-xs text-[rgba(255,245,230,0.75)]">
                <span className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-sm bg-[#6ee7b7]" />
                  Income
                </span>
                <span className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-sm bg-[#f39850]" />
                  Expenses
                </span>
              </div>
            </div>
          </div>
        </ScrollReveal>

        {/* Dynamic Spending by Category Donut */}
        <ScrollReveal delay={160} direction="flip-up" className="lg:col-span-6 flex flex-col">
          <div
            className="h-full bg-[rgba(48,32,40,0.60)] backdrop-blur-2xl border border-[rgba(255,238,225,0.18)] rounded-3xl p-5 sm:p-6 shadow-2xl flex flex-col justify-between"
            style={{
              boxShadow: "0 16px 45px rgba(18, 10, 12, 0.35), inset 0 1px 0 rgba(255, 255, 255, 0.14)",
            }}
          >
            <div className="flex items-center justify-between mb-4">
              <div>
                <span
                  className="text-[10px] uppercase tracking-[0.24em] text-[rgba(243,152,80,0.85)] font-semibold block mb-0.5"
                  style={{ fontFamily: "var(--font-sans-ui), sans-serif" }}
                >
                  Analytics
                </span>
                <h2
                  className="text-base sm:text-lg font-semibold text-[#fff5e7] tracking-tight"
                  style={{ fontFamily: "var(--font-display), Georgia, serif" }}
                >
                  Spending by Category
                </h2>
              </div>
              <div className="px-3.5 py-1.5 rounded-full border border-[rgba(255,244,225,0.24)] bg-[rgba(255,247,235,0.08)] text-[10px] font-bold text-[#f39850] uppercase tracking-[0.16em] flex items-center gap-1.5 backdrop-blur-md">
                <span>{displayCategories.length} Categories</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-6 pt-2">
              {/* Dynamic Donut Chart SVG */}
              <div className="relative w-40 h-40 flex-shrink-0 flex items-center justify-center">
                <svg className="w-40 h-40 -rotate-90 transform" viewBox="0 0 120 120">
                  {(() => {
                    let runningOffset = 0;
                    return displayCategories.slice(0, 6).map((cat) => {
                      const dashLength = (cat.percentage / 100) * CIRCLE_CIRCUMFERENCE;
                      const gapLength = CIRCLE_CIRCUMFERENCE - dashLength;
                      const currentOffset = runningOffset;
                      runningOffset += dashLength;

                      return (
                        <circle
                          key={cat.category}
                          cx="60"
                          cy="60"
                          r="46"
                          fill="transparent"
                          stroke={cat.color}
                          strokeWidth="14"
                          strokeDasharray={`${dashLength} ${gapLength}`}
                          strokeDashoffset={-currentOffset}
                          className="transition-all duration-500"
                        />
                      );
                    });
                  })()}
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                  <span
                    className="text-base sm:text-lg font-bold text-[#fff7ec] tracking-tight"
                    style={{ fontFamily: "var(--font-display), Georgia, serif" }}
                  >
                    ₹{dynamicExpense.toLocaleString("en-IN")}
                  </span>
                  <span
                    className="text-[9px] uppercase tracking-[0.16em] text-[rgba(255,245,230,0.6)] font-semibold mt-0.5"
                    style={{ fontFamily: "var(--font-sans-ui), sans-serif" }}
                  >
                    Total Spent
                  </span>
                </div>
              </div>

              {/* Dynamic Legend */}
              <div className="flex-1 space-y-2.5 text-xs w-full max-h-48 overflow-y-auto pr-1">
                {displayCategories.slice(0, 6).map((cat) => (
                  <div key={cat.category} className="flex items-center justify-between">
                    <span className="flex items-center gap-2 text-[#ebdcd0] truncate">
                      <span
                        className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                        style={{ backgroundColor: cat.color }}
                      />
                      <span className="truncate">{cat.category}</span>
                    </span>
                    <div className="flex items-center gap-2 flex-shrink-0 ml-2">
                      <span className="text-[11px] text-[rgba(255,245,230,0.5)]">
                        ₹{cat.amount.toLocaleString("en-IN")}
                      </span>
                      <span className="font-semibold text-[#fff5e7] min-w-[32px] text-right">
                        {cat.percentage}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </ScrollReveal>
      </section>

      {/* ========================================================= */}
      {/* 4. LOWER ROW: RECENT TRANSACTIONS + BUDGETS               */}
      {/* ========================================================= */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Recent Transactions / History */}
        <ScrollReveal delay={40} direction="flip-up" className="lg:col-span-6 flex flex-col">
          <div
            className="h-full bg-[rgba(48,32,40,0.60)] backdrop-blur-2xl border border-[rgba(255,238,225,0.18)] rounded-3xl p-5 sm:p-6 shadow-2xl flex flex-col justify-between"
            style={{
              boxShadow: "0 16px 45px rgba(18, 10, 12, 0.35), inset 0 1px 0 rgba(255, 255, 255, 0.14)",
            }}
          >
            <div className="flex items-center justify-between mb-4">
              <div>
                <span
                  className="text-[10px] uppercase tracking-[0.24em] text-[rgba(243,152,80,0.85)] font-semibold block mb-0.5"
                  style={{ fontFamily: "var(--font-sans-ui), sans-serif" }}
                >
                  Entries
                </span>
                <h2
                  className="text-base sm:text-lg font-semibold text-[#fff5e7] tracking-tight"
                  style={{ fontFamily: "var(--font-display), Georgia, serif" }}
                >
                  Recent Transactions
                </h2>
              </div>
              <button
                type="button"
                onClick={() => (onNavigateTab ? onNavigateTab("transactions") : onAddTransaction())}
                className="px-3.5 py-1.5 rounded-full border border-[rgba(255,244,225,0.24)] bg-[rgba(255,247,235,0.08)] hover:bg-[#f39850]/15 hover:border-[#f39850]/40 text-[#fff5e7] text-[10px] font-bold uppercase tracking-[0.16em] transition-all backdrop-blur-md"
              >
                View history →
              </button>
            </div>

            <div className="space-y-3">
              {allTransactions.slice(0, 4).map((tx) => {
                const isIncome = tx.type === "income";
                const isTransfer = tx.type === "transfer";
                return (
                  <div
                    key={tx.id}
                    className="group flex items-center justify-between gap-3 p-2.5 rounded-2xl bg-[rgba(255,248,235,0.04)] border border-[rgba(255,248,235,0.08)] hover:border-[rgba(255,248,235,0.18)] transition-all"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className={`w-9 h-9 rounded-xl flex items-center justify-center text-sm flex-shrink-0 font-bold border ${
                          isIncome
                            ? "bg-[rgba(156,199,157,0.25)] border-[#9cc79d]/30 text-[#9cc79d]"
                            : isTransfer
                            ? "bg-[rgba(103,232,249,0.2)] border-[#67e8f9]/30 text-[#67e8f9]"
                            : "bg-[rgba(179,100,76,0.25)] border-[#b3644c]/30 text-[#e89178]"
                        }`}
                      >
                        {isIncome ? "💼" : isTransfer ? "🏦" : "🧾"}
                      </div>
                      <div className="min-w-0">
                        <h4 className="text-xs font-semibold text-[#fff5e7] truncate">{tx.title}</h4>
                        <p
                          className="text-[10px] text-[rgba(255,245,230,0.5)] truncate mt-0.5 tracking-wider uppercase"
                          style={{ fontFamily: "var(--font-mono-ui), monospace" }}
                        >
                          {tx.category} · {tx.account}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <div className="text-right">
                        <strong
                          className={`text-xs sm:text-sm font-semibold ${
                            isIncome ? "text-[#9cc79d]" : isTransfer ? "text-[#67e8f9]" : "text-[#db9b83]"
                          } block`}
                          style={{ fontFamily: "var(--font-display), Georgia, serif" }}
                        >
                          {isIncome ? "+" : isTransfer ? "→" : "-"} ₹{tx.amount.toLocaleString("en-IN")}
                        </strong>
                        <span
                          className="text-[10px] text-[rgba(255,245,230,0.5)] uppercase tracking-wider"
                          style={{ fontFamily: "var(--font-mono-ui), monospace" }}
                        >
                          {tx.date}
                        </span>
                      </div>
                      {onDeleteTransaction && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onDeleteTransaction(tx.id);
                          }}
                          title="Delete transaction"
                          className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg hover:bg-rose-500/20 text-rose-400 text-xs transition-all"
                        >
                          ✕
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </ScrollReveal>

        {/* Budgets */}
        <ScrollReveal delay={160} direction="flip-up" className="lg:col-span-6 flex flex-col">
          <div
            className="h-full bg-[rgba(48,32,40,0.60)] backdrop-blur-2xl border border-[rgba(255,238,225,0.18)] rounded-3xl p-5 sm:p-6 shadow-2xl flex flex-col justify-between"
            style={{
              boxShadow: "0 16px 45px rgba(18, 10, 12, 0.35), inset 0 1px 0 rgba(255, 255, 255, 0.14)",
            }}
          >
            <div className="flex items-center justify-between mb-4">
              <div>
                <span
                  className="text-[10px] uppercase tracking-[0.24em] text-[rgba(243,152,80,0.85)] font-semibold block mb-0.5"
                  style={{ fontFamily: "var(--font-sans-ui), sans-serif" }}
                >
                  Spending Limits
                </span>
                <h2
                  className="text-base sm:text-lg font-semibold text-[#fff5e7] tracking-tight"
                  style={{ fontFamily: "var(--font-display), Georgia, serif" }}
                >
                  Budgets
                </h2>
              </div>
              <button
                type="button"
                onClick={() => (onNavigateTab ? onNavigateTab("budgets") : onNewBudget())}
                className="px-3.5 py-1.5 rounded-full border border-[rgba(255,244,225,0.24)] bg-[rgba(255,247,235,0.08)] hover:bg-[#f39850]/15 hover:border-[#f39850]/40 text-[#fff5e7] text-[10px] font-bold uppercase tracking-[0.16em] transition-all backdrop-blur-md"
              >
                View all →
              </button>
            </div>

            <div className="space-y-3.5">
              {displayBudgets.slice(0, 4).map((b) => {
                const pct = Math.min(100, Math.round((b.spent / b.allocated) * 100));
                const isOver = pct >= (b.warningThreshold || 80);
                return (
                  <div key={b.id} className="p-2.5 rounded-2xl bg-[rgba(255,248,235,0.04)] border border-[rgba(255,248,235,0.08)]">
                    <div className="flex items-center justify-between text-xs mb-1.5">
                      <span className="flex items-center gap-2 text-[#fff5e7] font-semibold">
                        <span className="w-5 h-5 rounded-md bg-[rgba(243,152,80,0.25)] text-[#f39850] text-[10px] flex items-center justify-center">
                          {b.categoryIcon || "🏷️"}
                        </span>
                        {b.category}
                      </span>
                      <div className="flex items-center gap-2 text-[11px]">
                        <span className="text-[rgba(255,245,230,0.6)]">
                          ₹{b.spent.toLocaleString("en-IN")} / ₹{b.allocated.toLocaleString("en-IN")}
                        </span>
                        <span className={isOver ? "text-amber-400 font-bold" : "text-[#f39850] font-bold"}>
                          {pct}%
                        </span>
                      </div>
                    </div>
                    <div className="w-full h-2 rounded-full bg-[rgba(255,245,230,0.1)] overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${isOver ? "bg-amber-400" : "bg-[#f39850]"}`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </ScrollReveal>
      </section>

      {/* ========================================================= */}
      {/* 5. BOTTOM ROW: UPCOMING PAYMENTS + FINANCIAL GOALS        */}
      {/* ========================================================= */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Upcoming Payments */}
        <ScrollReveal delay={40} direction="flip-up" className="lg:col-span-6 flex flex-col">
          <div
            className="h-full bg-[rgba(36,25,28,0.78)] backdrop-blur-2xl border border-[rgba(255,238,225,0.15)] rounded-3xl p-5 sm:p-6 shadow-2xl flex flex-col justify-between"
            style={{
              boxShadow: "0 20px 60px rgba(18, 10, 12, 0.45), inset 0 1px 0 rgba(255, 255, 255, 0.08)",
            }}
          >
            <div className="flex items-center justify-between mb-4">
              <div>
                <span
                  className="text-[10px] uppercase tracking-[0.24em] text-[rgba(243,152,80,0.85)] font-semibold block mb-0.5"
                  style={{ fontFamily: "var(--font-sans-ui), sans-serif" }}
                >
                  Scheduled
                </span>
                <h2
                  className="text-base sm:text-lg font-semibold text-[#fff5e7] tracking-tight"
                  style={{ fontFamily: "var(--font-display), Georgia, serif" }}
                >
                  Upcoming Payments
                </h2>
              </div>
              <button
                type="button"
                onClick={() => onNavigateTab?.("budgets")}
                className="px-3.5 py-1.5 rounded-full border border-[rgba(255,244,225,0.24)] bg-[rgba(255,247,235,0.08)] hover:bg-[#f39850]/15 hover:border-[#f39850]/40 text-[#fff5e7] text-[10px] font-bold uppercase tracking-[0.16em] transition-all backdrop-blur-md"
              >
                View in Budgets →
              </button>
            </div>

            <div className="grid grid-cols-3 gap-3">
              {displayUpcoming.slice(0, 3).map((up) => (
                <div
                  key={up.id}
                  className="p-3.5 rounded-2xl bg-[rgba(255,248,235,0.04)] border border-[rgba(255,248,235,0.08)] flex flex-col justify-between"
                >
                  <div>
                    <span className="text-xs font-semibold text-[#fff5e7] block truncate">{up.title}</span>
                    <span
                      className="text-[10px] text-[rgba(255,245,230,0.5)] block mt-0.5 uppercase tracking-wider"
                      style={{ fontFamily: "var(--font-mono-ui), monospace" }}
                    >
                      {up.dueDate}
                    </span>
                  </div>
                  <strong
                    className="text-xs sm:text-sm font-bold text-[#fff7ec] block mt-2.5"
                    style={{ fontFamily: "var(--font-display), Georgia, serif" }}
                  >
                    ₹{up.amount.toLocaleString("en-IN")}
                  </strong>
                </div>
              ))}
            </div>
          </div>
        </ScrollReveal>

        {/* Financial Goals */}
        <ScrollReveal delay={160} direction="flip-up" className="lg:col-span-6 flex flex-col">
          <div
            className="h-full bg-[rgba(36,25,28,0.78)] backdrop-blur-2xl border border-[rgba(255,238,225,0.15)] rounded-3xl p-5 sm:p-6 shadow-2xl flex flex-col justify-between"
            style={{
              boxShadow: "0 20px 60px rgba(18, 10, 12, 0.45), inset 0 1px 0 rgba(255, 255, 255, 0.08)",
            }}
          >
            <div className="flex items-center justify-between mb-4">
              <div>
                <span
                  className="text-[10px] uppercase tracking-[0.24em] text-[rgba(243,152,80,0.85)] font-semibold block mb-0.5"
                  style={{ fontFamily: "var(--font-sans-ui), sans-serif" }}
                >
                  Targets
                </span>
                <h2
                  className="text-base sm:text-lg font-semibold text-[#fff5e7] tracking-tight"
                  style={{ fontFamily: "var(--font-display), Georgia, serif" }}
                >
                  Financial Goals
                </h2>
              </div>
              <button
                type="button"
                onClick={() => (onNavigateTab ? onNavigateTab("goals") : onNewGoal())}
                className="px-3.5 py-1.5 rounded-full border border-[rgba(255,244,225,0.24)] bg-[rgba(255,247,235,0.08)] hover:bg-[#f39850]/15 hover:border-[#f39850]/40 text-[#fff5e7] text-[10px] font-bold uppercase tracking-[0.16em] transition-all backdrop-blur-md"
              >
                View all →
              </button>
            </div>

            <div className="space-y-3.5">
              {displayGoals.slice(0, 2).map((goal, idx) => {
                const pct = Math.min(100, Math.round((goal.currentAmount / goal.targetAmount) * 100));
                const coverImages = [
                  "https://images.unsplash.com/photo-1499856871958-5b9627545d1a?auto=format&fit=crop&w=400&q=80",
                  "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&w=400&q=80",
                  "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=400&q=80",
                ];
                const coverImg = coverImages[idx % coverImages.length];

                return (
                  <div
                    key={goal.id}
                    className="flex items-center gap-3.5 p-2.5 rounded-2xl bg-[rgba(255,248,235,0.04)] border border-[rgba(255,248,235,0.08)] hover:border-[rgba(255,248,235,0.18)] transition-all cursor-pointer"
                    onClick={() => onNavigateTab?.("goals")}
                  >
                    <div
                      className="w-14 h-12 rounded-xl bg-cover bg-center border border-[rgba(255,245,230,0.12)] flex-shrink-0 relative overflow-hidden"
                      style={{ backgroundImage: `url('${coverImg}')` }}
                    >
                      <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between text-xs mb-1.5">
                        <span
                          className="font-semibold text-[#fff5e7] truncate"
                          style={{ fontFamily: "var(--font-display), Georgia, serif" }}
                        >
                          {goal.title}
                        </span>
                        <span
                          className="text-[10px] text-[rgba(255,245,230,0.6)] uppercase tracking-wider"
                          style={{ fontFamily: "var(--font-mono-ui), monospace" }}
                        >
                          ₹{(goal.currentAmount / 1000).toFixed(0)}K / ₹{(goal.targetAmount / 1000).toFixed(0)}K
                        </span>
                      </div>
                      <div className="flex items-center gap-2.5">
                        <div className="flex-1 h-2 rounded-full bg-[rgba(255,245,230,0.1)] overflow-hidden">
                          <div
                            className="h-full rounded-full bg-[#f39850] transition-all duration-500"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                        <span className="text-[10px] text-[#f39850] font-bold font-mono">{pct}%</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </ScrollReveal>
      </section>
    </div>
  );
}
