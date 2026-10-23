"use client";

import React from "react";
import { SharedExpense, SpaceSummary } from "../../../lib/types/dashboard";
import {
  MOCK_TRIP_SPENDING_SERIES,
  MOCK_SHARED_EXPENSES,
  MOCK_SPACES,
  MOCK_RECENT_ACTIVITY,
} from "../../../lib/data/mock-data";
import { InteractiveDonutChart } from "../charts/interactive-donut-chart";
import { InteractiveTrendChart } from "../charts/interactive-trend-chart";

interface TripAnalyticsPageProps {
  userExpenses?: SharedExpense[];
  userSpaces?: SpaceSummary[];
}

export function TripAnalyticsPage({
  userExpenses = [],
  userSpaces = [],
}: TripAnalyticsPageProps) {
  const expenses = userExpenses.length > 0 ? userExpenses : MOCK_SHARED_EXPENSES;
  const spaces = userSpaces.length > 0 ? userSpaces : MOCK_SPACES.filter((s) => s.type === "trip");

  // Dynamic Category Breakdown
  const categoryColors: Record<string, string> = {
    "Food & Dining": "#e0a875",
    "Adventure & Activities": "#6ee7b7",
    Transport: "#67e8f9",
    Accommodation: "#c084fc",
    Sightseeing: "#fcd34d",
    Shopping: "#fca5a5",
    Entertainment: "#a78bfa",
    General: "#cbd5e1",
  };

  const defaultPalette = ["#e0a875", "#6ee7b7", "#67e8f9", "#c084fc", "#fcd34d", "#fca5a5", "#a78bfa"];

  const catMap: Record<string, number> = {};
  expenses.forEach((e) => {
    const cat = e.category || "General";
    catMap[cat] = (catMap[cat] || 0) + e.amount;
  });

  const totalExpenseAmount = expenses.reduce((s, e) => s + e.amount, 0);

  const categoryBreakdown = Object.entries(catMap)
    .sort((a, b) => b[1] - a[1])
    .map(([label, amount], idx) => ({
      label,
      amount,
      pct: totalExpenseAmount > 0 ? Math.round((amount / totalExpenseAmount) * 100) : 0,
      color: categoryColors[label] || defaultPalette[idx % defaultPalette.length],
    }));

  // Top Spender calculation
  const payerMap: Record<string, number> = {};
  expenses.forEach((e) => {
    const payer = e.isPaidByYou ? "You" : e.paidBy || "Member";
    payerMap[payer] = (payerMap[payer] || 0) + e.amount;
  });
  const topPayerEntry = Object.entries(payerMap).sort((a, b) => b[1] - a[1])[0];
  const topSpender = topPayerEntry ? topPayerEntry[0] : "You";

  // Daily / Velocity Data
  const dateMap: Record<string, number> = {};
  expenses.forEach((e) => {
    const d = e.date || "Recent";
    dateMap[d] = (dateMap[d] || 0) + e.amount;
  });

  const weekData = Object.keys(dateMap).length > 2
    ? Object.entries(dateMap).slice(-7).map(([label, amount]) => ({
        label,
        amount,
        previousAmount: Math.round(amount * 0.8),
      }))
    : MOCK_TRIP_SPENDING_SERIES;

  const totalWeek = totalExpenseAmount > 0 ? totalExpenseAmount : weekData.reduce((s, d) => s + d.amount, 0);
  const avgPerDay = Math.round(totalWeek / Math.max(1, Object.keys(dateMap).length || 7));

  return (
    <div className="space-y-6 text-[#fbf5eb]">
      {/* Header */}
      <section className="pt-1 animate-pop-in pop-delay-1">
        <span className="text-[11px] font-semibold tracking-[0.26em] text-[#e0a875] uppercase block mb-1">
          Spending Intelligence
        </span>
        <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight text-[#fff7ec]"
          style={{ fontFamily: "var(--font-display), Georgia, serif" }}>
          Analytics
        </h1>
        <p className="text-xs text-[rgba(255,245,230,0.65)] mt-1">
          How your group is spending across active trips
        </p>
      </section>

      {/* KPI Strip */}
      <div className="grid grid-cols-3 gap-3 animate-pop-in pop-delay-2">
        {[
          { label: "This Week", value: `₹${totalWeek.toLocaleString("en-IN")}`, sub: "Total group spend" },
          { label: "Avg / Day", value: `₹${avgPerDay.toLocaleString("en-IN")}`, sub: "Past 7 days" },
          { label: "Top Spender", value: topSpender, sub: "Most paid out" },
        ].map((kpi) => (
          <div
            key={kpi.label}
            className="rounded-2xl border border-[rgba(255,248,235,0.1)] bg-[rgba(22,30,33,0.7)] p-4 backdrop-blur-md"
          >
            <p className="text-[10px] uppercase tracking-widest text-[rgba(255,245,230,0.5)] mb-1">{kpi.label}</p>
            <p className="text-lg font-semibold leading-tight" style={{ fontFamily: "var(--font-display), serif" }}>
              {kpi.value}
            </p>
            <p className="text-[10px] text-[rgba(255,245,230,0.4)] mt-0.5">{kpi.sub}</p>
          </div>
        ))}
      </div>

      {/* Weekly Spend Interactive Trend Chart */}
      <div className="animate-pop-in pop-delay-3">
        <InteractiveTrendChart
          data={weekData.map((d) => ({
            label: d.label,
            amount: d.amount,
            previousAmount: d.previousAmount ?? Math.round(d.amount * 0.85),
          }))}
          title="Group Spend Velocity"
          subtitle="Daily expense distribution across trip members"
          currency="₹"
          theme="trip"
          periods={["7D", "14D", "All Trip"]}
          mode="bar"
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
              Click slices to inspect breakdown details
            </p>
          </div>
          <span className="text-xs font-semibold text-[#e0a875] bg-[#e0a875]/10 px-2.5 py-1 rounded-full border border-[#e0a875]/20">
            {categoryBreakdown.length} Categories
          </span>
        </div>

        <InteractiveDonutChart
          data={categoryBreakdown.map((c) => ({
            id: c.label.toLowerCase().replace(/[^a-z0-9]/g, "-"),
            label: c.label,
            amount: c.amount,
            pct: c.pct,
            color: c.color,
          }))}
          centerSubtitle="Trip Outlay"
          currency="₹"
          theme="trip"
        />
      </div>

      {/* Per-Space Breakdown */}
      <div className="rounded-2xl border border-[rgba(255,248,235,0.1)] bg-[rgba(22,30,33,0.7)] p-5 backdrop-blur-md animate-pop-in pop-delay-5">
        <p className="text-xs font-semibold uppercase tracking-widest text-[rgba(255,245,230,0.6)] mb-4">
          Spend per Space
        </p>
        <div className="space-y-3">
          {spaces.map((sp) => {
            const spaceExp = expenses.filter((e) => e.spaceId === sp.id || e.spaceName.toLowerCase() === sp.name.toLowerCase());
            const spaceTotal = spaceExp.length > 0 ? spaceExp.reduce((s, e) => s + e.amount, 0) : sp.totalSpend || 0;
            return (
              <div key={sp.id} className="flex items-center gap-4">
                <div
                  className="w-9 h-9 rounded-xl bg-cover bg-center flex-shrink-0 border border-[rgba(255,248,235,0.1)]"
                  style={{ backgroundImage: `url(${sp.coverUrl})`, filter: "brightness(0.8)" }}
                />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-[#fbf5eb] truncate">{sp.name}</p>
                  <p className="text-[10px] text-[rgba(255,245,230,0.45)]">{sp.membersCount} members · {spaceExp.length} expenses</p>
                </div>
                <p className="text-sm font-semibold flex-shrink-0" style={{ fontFamily: "var(--font-display), serif" }}>
                  ₹{spaceTotal.toLocaleString("en-IN")}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="rounded-2xl border border-[rgba(255,248,235,0.1)] bg-[rgba(22,30,33,0.7)] p-5 backdrop-blur-md">
        <p className="text-xs font-semibold uppercase tracking-widest text-[rgba(255,245,230,0.6)] mb-4">
          Recent Activity
        </p>
        <div className="space-y-3">
          {MOCK_RECENT_ACTIVITY.slice(0, 4).map((act) => {
            const colorMap: Record<string, string> = {
              emerald: "#6ee7b7", amber: "#fcd34d", sky: "#67e8f9", rose: "#fda4af",
            };
            const color = colorMap[act.badgeColor ?? "emerald"];
            return (
              <div key={act.id} className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0"
                  style={{ background: `${color}1a`, color }}>
                  {act.actorInitial}
                </div>
                <div className="flex-1">
                  <p className="text-xs text-[rgba(255,245,230,0.85)]">
                    <span className="font-semibold">{act.actor}</span>{" "}
                    <span className="text-[rgba(255,245,230,0.6)]">{act.action}</span>
                  </p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-[10px] text-[rgba(255,245,230,0.45)]">{act.spaceName}</span>
                    {act.amount && (
                      <>
                        <span className="text-[rgba(255,248,235,0.2)]">·</span>
                        <span className="text-[10px] font-semibold" style={{ color }}>
                          {act.currency}{act.amount.toLocaleString("en-IN")}
                        </span>
                      </>
                    )}
                    <span className="ml-auto text-[10px] text-[rgba(255,245,230,0.35)]">{act.timestamp}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
