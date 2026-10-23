"use client";

import React from "react";
import { BudgetProgress, FinancialGoal, PersonalTransaction } from "../../../lib/types/dashboard";
import {
  MOCK_PERSONAL_ANALYTICS_MONTHS,
  MOCK_CATEGORY_SPENDING,
  MOCK_PERSONAL_TRANSACTIONS,
} from "../../../lib/data/mock-data";
import { InteractiveDonutChart } from "../charts/interactive-donut-chart";
import { InteractiveTrendChart } from "../charts/interactive-trend-chart";

interface PersonalAnalyticsPageProps {
  userTransactions?: PersonalTransaction[];
  userBudgets?: BudgetProgress[];
  userGoals?: FinancialGoal[];
}

const categoryPalette = [
  "#f39850",
  "#dda071",
  "#5d7c87",
  "#b3644c",
  "#8b6873",
  "#10b981",
  "#f59e0b",
  "#605256",
];

export function PersonalAnalyticsPage({
  userTransactions = [],
}: PersonalAnalyticsPageProps) {
  const allTransactions = userTransactions.length > 0 ? userTransactions : MOCK_PERSONAL_TRANSACTIONS;
  const incomeTxns = allTransactions.filter((t) => t.type === "income");
  const expenseTxns = allTransactions.filter((t) => t.type === "expense");

  const totalIncome = incomeTxns.reduce((s, t) => s + t.amount, 0);
  const totalExpenses = expenseTxns.reduce((s, t) => s + t.amount, 0);
  const netCashFlow = totalIncome - totalExpenses;
  const savingsRate = totalIncome > 0 ? Math.round((Math.max(0, netCashFlow) / totalIncome) * 100) : 0;

  // Real-time category breakdown
  const categoryMap = new Map<string, number>();
  expenseTxns.forEach((t) => {
    categoryMap.set(t.category, (categoryMap.get(t.category) || 0) + t.amount);
  });

  const totalExp = totalExpenses > 0 ? totalExpenses : 1;
  const dynamicCategories = Array.from(categoryMap.entries())
    .map(([cat, amt], idx) => ({
      category: cat,
      amount: amt,
      percentage: Math.max(1, Math.round((amt / totalExp) * 100)),
      color: categoryPalette[idx % categoryPalette.length],
    }))
    .sort((a, b) => b.amount - a.amount);

  const topCategories = dynamicCategories.length > 0 ? dynamicCategories : MOCK_CATEGORY_SPENDING;

  const topExpenses = expenseTxns.length > 0
    ? [...expenseTxns].sort((a, b) => b.amount - a.amount).slice(0, 3)
    : MOCK_PERSONAL_TRANSACTIONS.filter((t) => t.type === "expense").slice(0, 3);

  return (
    <div className="space-y-6 text-[#fbf5eb]">
      {/* Header */}
      <section className="pt-1 animate-pop-in pop-delay-1">
        <span className="text-[11px] font-semibold tracking-[0.26em] text-[#6ee7b7] uppercase block mb-1">
          Financial Intelligence
        </span>
        <h1
          className="text-3xl sm:text-4xl font-semibold tracking-tight text-[#fff7ec]"
          style={{ fontFamily: "var(--font-display), Georgia, serif" }}
        >
          Analytics & Insights
        </h1>
        <p className="text-xs text-[rgba(255,245,230,0.65)] mt-1">
          Real-time dynamic breakdown of your money ledger and cash flow patterns
        </p>
      </section>

      {/* KPI Strip */}
      <div className="grid grid-cols-3 gap-3 animate-pop-in pop-delay-2">
        {[
          {
            label: "Net Cash Flow",
            value: `${netCashFlow >= 0 ? "+" : "-"}₹${(Math.abs(netCashFlow) / 1000).toFixed(1)}k`,
            sub: "Income – Expenses",
            color: netCashFlow >= 0 ? "#6ee7b7" : "#fca5a5",
          },
          {
            label: "Savings Rate",
            value: `${savingsRate}%`,
            sub: "Of recorded income",
            color: "#67e8f9",
          },
          {
            label: "Inflows / Outflows",
            value: `${incomeTxns.length} / ${expenseTxns.length}`,
            sub: "Credits vs Expenses",
            color: "#fcd34d",
          },
        ].map((kpi) => (
          <div
            key={kpi.label}
            className="rounded-2xl border border-[rgba(255,248,235,0.1)] bg-[rgba(22,30,33,0.7)] p-4 backdrop-blur-md"
          >
            <p className="text-[10px] uppercase tracking-widest text-[rgba(255,245,230,0.5)] mb-1">{kpi.label}</p>
            <p className="text-lg sm:text-xl font-semibold leading-tight" style={{ fontFamily: "var(--font-display), serif", color: kpi.color }}>
              {kpi.value}
            </p>
            <p className="text-[10px] text-[rgba(255,245,230,0.4)] mt-0.5">{kpi.sub}</p>
          </div>
        ))}
      </div>

      {/* Monthly Spend Interactive Trend / Cash Flow Chart */}
      <div className="animate-pop-in pop-delay-3">
        <InteractiveTrendChart
          data={MOCK_PERSONAL_ANALYTICS_MONTHS.map((m) => ({
            label: m.label,
            amount: m.amount,
            previousAmount: m.previousAmount,
          }))}
          title="Monthly Cash Outflow"
          subtitle="Historical spending compared to previous periods"
          currency="₹"
          theme="local"
          periods={["3M", "6M", "1Y"]}
          mode="area"
        />
      </div>

      {/* Category Breakdown with Interactive Donut Chart */}
      <div className="rounded-2xl border border-[rgba(255,248,235,0.1)] bg-[rgba(22,30,33,0.7)] p-5 backdrop-blur-md animate-pop-in pop-delay-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-[rgba(255,245,230,0.6)]">
              Spend by Category
            </p>
            <p className="text-[11px] text-[rgba(255,245,230,0.45)] mt-0.5">
              Interactive allocation of your recorded expenses
            </p>
          </div>
          <span className="text-xs font-semibold text-[#6ee7b7] bg-[#6ee7b7]/10 px-2.5 py-1 rounded-full border border-[#6ee7b7]/20">
            {topCategories.length} Categories
          </span>
        </div>

        <InteractiveDonutChart
          data={topCategories.map((cat) => ({
            id: cat.category.toLowerCase().replace(/[^a-z0-9]/g, "-"),
            label: cat.category,
            amount: cat.amount,
            pct: cat.percentage,
            color: cat.color,
            sub: `${cat.percentage}% of spent budget`,
          }))}
          centerSubtitle="Personal Spend"
          currency="₹"
          theme="local"
        />
      </div>

      {/* Income vs Expense Summary */}
      <div className="rounded-2xl border border-[rgba(255,248,235,0.1)] bg-[rgba(22,30,33,0.7)] p-5 backdrop-blur-md">
        <p className="text-xs font-semibold uppercase tracking-widest text-[rgba(255,245,230,0.6)] mb-4">
          Cash Flow Summary · Live Ledger
        </p>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-[#6ee7b7]" />
              <span className="text-xs text-[rgba(255,245,230,0.75)]">Total Income</span>
            </div>
            <span className="text-sm font-semibold text-[#6ee7b7]" style={{ fontFamily: "var(--font-display), serif" }}>
              +₹{totalIncome.toLocaleString("en-IN")}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-[#fca5a5]" />
              <span className="text-xs text-[rgba(255,245,230,0.75)]">Total Expenses</span>
            </div>
            <span className="text-sm font-semibold text-[#fca5a5]" style={{ fontFamily: "var(--font-display), serif" }}>
              -₹{totalExpenses.toLocaleString("en-IN")}
            </span>
          </div>
          <div className="border-t border-[rgba(255,248,235,0.1)] pt-3 flex items-center justify-between">
            <span className="text-xs font-semibold text-[rgba(255,245,230,0.9)]">Net Cash Flow</span>
            <span
              className={`text-base font-semibold ${netCashFlow >= 0 ? "text-[#6ee7b7]" : "text-[#fca5a5]"}`}
              style={{ fontFamily: "var(--font-display), serif" }}
            >
              {netCashFlow >= 0 ? "+" : ""}₹{netCashFlow.toLocaleString("en-IN")}
            </span>
          </div>
        </div>
      </div>

      {/* Top Transactions (insight) */}
      <div className="rounded-2xl border border-[rgba(255,248,235,0.1)] bg-[rgba(22,30,33,0.7)] p-5 backdrop-blur-md">
        <p className="text-xs font-semibold uppercase tracking-widest text-[rgba(255,245,230,0.6)] mb-4">
          Top Expense Transactions
        </p>
        <div className="space-y-3">
          {topExpenses.map((t) => (
            <div key={t.id} className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-[#fbf5eb] truncate max-w-[200px]">{t.title}</p>
                <p className="text-[10px] text-[rgba(255,245,230,0.45)] mt-0.5">{t.category} · {t.date}</p>
              </div>
              <span className="text-sm font-semibold text-[#fca5a5]" style={{ fontFamily: "var(--font-display), serif" }}>
                -₹{t.amount.toLocaleString("en-IN")}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
