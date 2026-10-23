"use client";

import React, { useState } from "react";
import { Settlement, SharedExpense, SpaceSummary } from "../../lib/types/dashboard";
import { InteractiveDonutChart } from "./charts/interactive-donut-chart";
import { LiveClock } from "./live-clock";
import { ScrollReveal } from "../ui/scroll-reveal";

interface TripsSharedViewProps {
  onAddExpense: () => void;
  onCreateSpace: () => void;
  onSettleUp: (settlementId?: string) => void;
  onScanReceipt: () => void;
  onExportReceipt?: (spaceId?: string) => void;
  onNavigateTab?: (tab: "spaces" | "expenses" | "settlements" | "analytics") => void;
  onSelectSpace?: (space: SpaceSummary) => void;
  userExpenses?: SharedExpense[];
  userSpaces?: SpaceSummary[];
  settlements?: Settlement[];
}

export function TripsSharedView({
  onAddExpense,
  onCreateSpace,
  onSettleUp,
  onScanReceipt,
  onExportReceipt,
  onNavigateTab,
  onSelectSpace,
  userExpenses = [],
  userSpaces = [],
  settlements = [],
}: TripsSharedViewProps) {
  const [selectedMonth] = useState("This Month");

  const totalOwedToYou = userExpenses
    .filter((e) => e.isPaidByYou)
    .reduce((sum, e) => sum + (e.amount - (e.userShare || Math.round(e.amount / 2))), 0);

  const totalYouOwe = userExpenses
    .filter((e) => !e.isPaidByYou)
    .reduce((sum, e) => sum + (e.userShare || Math.round(e.amount / 2)), 0);

  const netBalance = totalOwedToYou - totalYouOwe;

  const displayExpenses = userExpenses.length > 0 ? userExpenses.slice(0, 4) : [];

  return (
    <div className="space-y-6 text-[#fbf5eb]">
      {/* ========================================================= */}
      {/* 1. GREETING & CLOCK HEADER (FOREST LEDGER)                */}
      {/* ========================================================= */}
      <ScrollReveal delay={60} direction="flip-up">
        <section className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pt-1 pb-1">
          <div>
            <span
              className="text-[11px] font-semibold tracking-[0.26em] text-[#e0a875] uppercase block mb-1"
              style={{ fontFamily: "var(--font-sans-ui), sans-serif" }}
            >
              Forest Ledger
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
              Shared travel costs for groups on the move.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 self-start sm:self-center">
            <button
              type="button"
              data-spotlight-id="scan-bill"
              onClick={onScanReceipt}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[rgba(255,248,235,0.08)] border border-[rgba(255,248,235,0.18)] text-[rgba(255,245,230,0.85)] text-xs font-semibold uppercase tracking-wider hover:border-[#e0a875]/40 hover:text-[#e0a875] transition-all"
            >
              <span>📷</span>
              Scan Bill
            </button>
            <button
              type="button"
              data-spotlight-id="export-receipt"
              onClick={() => onExportReceipt?.()}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[rgba(255,248,235,0.08)] border border-[rgba(255,248,235,0.18)] text-[#fcd34d] text-xs font-semibold uppercase tracking-wider hover:bg-[rgba(255,248,235,0.14)] hover:border-[#fcd34d]/40 transition-all"
            >
              <span>🧾</span>
              Receipt
            </button>
          </div>
        </section>
      </ScrollReveal>

      {/* ========================================================= */}
      {/* 2. TOP ROW: NET BALANCE CARD + 4 QUICK ACTIONS            */}
      {/* ========================================================= */}
      <ScrollReveal delay={160} direction="flip-up">
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          {/* Your Net Balance Card (Floating Frosted Center-Card Style) */}
          <div
            data-spotlight-id="net-balance"
            className="lg:col-span-5 bg-[rgba(25,38,44,0.60)] backdrop-blur-2xl border border-[rgba(235,248,246,0.18)] rounded-3xl p-5 sm:p-6 flex flex-col justify-between shadow-2xl hover:border-[#e0a875]/45 smooth-hover-card relative overflow-hidden"
          style={{
            boxShadow: "0 16px 45px rgba(6, 12, 14, 0.35), inset 0 1px 0 rgba(255, 255, 255, 0.14)",
          }}
        >
          {/* Subtle top ambient glow */}
          <div className="absolute top-0 right-0 w-40 h-40 bg-[radial-gradient(circle_at_top_right,rgba(224,168,117,0.15),transparent_70%)] pointer-events-none" />

          <div>
            <div className="flex items-center justify-between">
              <span
                className="text-[10px] uppercase tracking-[0.24em] text-[rgba(255,240,214,0.72)] font-semibold block"
                style={{ fontFamily: "var(--font-sans-ui), sans-serif" }}
              >
                Your Net Balance
              </span>
              <button
                type="button"
                onClick={() => onSettleUp()}
                aria-label="View balance details"
                className="w-8 h-8 rounded-full border border-[rgba(255,248,235,0.24)] bg-[rgba(255,247,235,0.08)] hover:bg-[#e0a875]/20 text-[rgba(255,245,230,0.8)] hover:text-[#fff5e7] flex items-center justify-center transition-all backdrop-blur-md"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>

            <div className="mt-2 mb-4">
              <strong
                className={`text-3xl sm:text-4xl font-semibold ${
                  netBalance >= 0 ? "text-[#9cc79d]" : "text-[#db9b83]"
                } block tracking-tight`}
                style={{ fontFamily: "var(--font-display), Georgia, serif" }}
              >
                {netBalance >= 0 ? "+" : "-"} ₹{Math.abs(netBalance).toLocaleString("en-IN")}
              </strong>
            </div>
          </div>

          <div className="flex items-center justify-between pt-3 border-t border-[rgba(235,248,246,0.1)] text-xs">
            <span className="text-[#9cc79d] font-semibold flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#9cc79d]/10 border border-[#9cc79d]/25">
              <span className="w-1.5 h-1.5 rounded-full bg-[#9cc79d]" />
              You are owed ₹{totalOwedToYou.toLocaleString("en-IN")}
            </span>
            <span className="text-[#db9b83] font-semibold flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#db9b83]/10 border border-[#db9b83]/25">
              <span className="w-1.5 h-1.5 rounded-full bg-[#db9b83]" />
              You owe ₹{totalYouOwe.toLocaleString("en-IN")}
            </span>
          </div>
        </div>

        {/* 4 Quick Actions (Interactive Frosted Pill & Stone Cards) */}
        <div className="lg:col-span-7 grid grid-cols-2 sm:grid-cols-4 gap-3">
          {/* Add Expense (Warm Copper Landing Accent) */}
          <button
            type="button"
            onClick={onAddExpense}
            className="p-4 rounded-3xl bg-[rgba(25,38,44,0.60)] hover:bg-[rgba(32,48,55,0.70)] border border-[rgba(235,248,246,0.18)] hover:border-[#dda071]/60 flex flex-col items-center justify-center text-center transition-all group shadow-xl backdrop-blur-xl"
            style={{
              boxShadow: "0 16px 40px rgba(6, 12, 14, 0.35), inset 0 1px 0 rgba(255, 255, 255, 0.14)",
            }}
          >
            <div className="w-11 h-11 rounded-full bg-[#dda071] text-[#1a130e] font-bold text-2xl flex items-center justify-center shadow-lg shadow-[#dda071]/25 group-hover:scale-105 transition-transform">
              +
            </div>
            <span
              className="text-xs font-bold text-[#e0a875] mt-3 uppercase tracking-[0.16em]"
              style={{ fontFamily: "var(--font-sans-ui), sans-serif" }}
            >
              Add Expense
            </span>
          </button>

          {/* Create Space (Mountain Mist Slate) */}
          <button
            type="button"
            onClick={onCreateSpace}
            className="p-4 rounded-3xl bg-[rgba(25,38,44,0.60)] hover:bg-[rgba(32,48,55,0.70)] border border-[rgba(235,248,246,0.18)] hover:border-[#5d7c87]/60 flex flex-col items-center justify-center text-center transition-all group shadow-xl backdrop-blur-xl"
            style={{
              boxShadow: "0 16px 40px rgba(6, 12, 14, 0.35), inset 0 1px 0 rgba(255, 255, 255, 0.14)",
            }}
          >
            <div className="w-11 h-11 rounded-full bg-[rgba(93,124,135,0.25)] border border-[rgba(93,124,135,0.45)] text-[#a3c2cd] text-base flex items-center justify-center group-hover:scale-105 transition-transform">
              👥
            </div>
            <span
              className="text-xs font-semibold text-[#f0e7dc] mt-3 uppercase tracking-[0.16em]"
              style={{ fontFamily: "var(--font-sans-ui), sans-serif" }}
            >
              Create Space
            </span>
          </button>

          {/* Settle Up (Plum Dusk) */}
          <button
            type="button"
            onClick={() => onSettleUp()}
            className="p-4 rounded-3xl bg-[rgba(25,38,44,0.60)] hover:bg-[rgba(32,48,55,0.70)] border border-[rgba(235,248,246,0.18)] hover:border-[#8b6873]/60 flex flex-col items-center justify-center text-center transition-all group shadow-xl backdrop-blur-xl"
            style={{
              boxShadow: "0 16px 40px rgba(6, 12, 14, 0.35), inset 0 1px 0 rgba(255, 255, 255, 0.14)",
            }}
          >
            <div className="w-11 h-11 rounded-full bg-[rgba(139,104,115,0.25)] border border-[rgba(139,104,115,0.45)] text-[#e2bec8] text-base flex items-center justify-center group-hover:scale-105 transition-transform">
              ⇄
            </div>
            <span
              className="text-xs font-semibold text-[#f0e7dc] mt-3 uppercase tracking-[0.16em]"
              style={{ fontFamily: "var(--font-sans-ui), sans-serif" }}
            >
              Settle Up
            </span>
          </button>

          {/* Scan Receipt (Warm Ochre) */}
          <button
            type="button"
            onClick={onScanReceipt}
            className="p-4 rounded-3xl bg-[rgba(25,38,44,0.60)] hover:bg-[rgba(32,48,55,0.70)] border border-[rgba(235,248,246,0.18)] hover:border-[#dda071]/60 flex flex-col items-center justify-center text-center transition-all group shadow-xl backdrop-blur-xl"
            style={{
              boxShadow: "0 16px 40px rgba(6, 12, 14, 0.35), inset 0 1px 0 rgba(255, 255, 255, 0.14)",
            }}
          >
            <div className="w-11 h-11 rounded-full bg-[rgba(221,160,113,0.2)] border border-[rgba(221,160,113,0.4)] text-[#f3ca9e] text-base flex items-center justify-center group-hover:scale-105 transition-transform">
              📷
            </div>
            <span
              className="text-xs font-semibold text-[#f0e7dc] mt-3 uppercase tracking-[0.16em]"
              style={{ fontFamily: "var(--font-sans-ui), sans-serif" }}
            >
              Scan Receipt
            </span>
          </button>
        </div>
      </section>
      </ScrollReveal>

      {/* ========================================================= */}
      {/* 3. MIDDLE ROW: YOUR SPACES + RECENT EXPENSES              */}
      {/* ========================================================= */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Your Spaces */}
        <ScrollReveal delay={40} direction="flip-up" className="lg:col-span-7 flex flex-col">
          <div
            className="h-full bg-[rgba(25,38,44,0.60)] backdrop-blur-2xl border border-[rgba(235,248,246,0.18)] rounded-3xl p-5 sm:p-6 shadow-2xl flex flex-col justify-between smooth-hover-card"
            style={{
              boxShadow: "0 16px 45px rgba(6, 12, 14, 0.35), inset 0 1px 0 rgba(255, 255, 255, 0.14)",
            }}
          >
            <div className="flex items-center justify-between mb-4">
              <div>
                <span
                  className="text-[10px] uppercase tracking-[0.24em] text-[rgba(224,168,117,0.85)] font-semibold block mb-0.5"
                  style={{ fontFamily: "var(--font-sans-ui), sans-serif" }}
                >
                  Shared Circles
                </span>
                <h2
                  className="text-base sm:text-lg font-semibold text-[#fff5e7] tracking-tight"
                  style={{ fontFamily: "var(--font-display), Georgia, serif" }}
                >
                  Your Spaces
                </h2>
              </div>
              <button
                type="button"
                onClick={() => (onNavigateTab ? onNavigateTab("spaces") : onCreateSpace())}
                className="px-3.5 py-1.5 rounded-full border border-[rgba(255,244,225,0.24)] bg-[rgba(255,247,235,0.08)] hover:bg-[#e0a875]/15 hover:border-[#e0a875]/40 text-[#fff5e7] text-[10px] font-bold uppercase tracking-[0.16em] transition-all backdrop-blur-md"
              >
                View all →
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {userSpaces.slice(0, 3).map((space) => {
                const spaceExpenses = userExpenses.filter((e) => e.spaceId === space.id);
                const spaceTotal =
                  spaceExpenses.length > 0
                    ? spaceExpenses.reduce((s, e) => s + e.amount, 0)
                    : space.totalSpend || 0;
                const isOwed = space.balanceStatus === "owed";
                const isDue = space.balanceStatus === "owe";

                return (
                  <div
                    key={space.id}
                    onClick={() => (onSelectSpace ? onSelectSpace(space) : onNavigateTab?.("spaces"))}
                    className="p-3 rounded-2xl bg-[rgba(255,248,235,0.05)] border border-[rgba(255,248,235,0.12)] hover:border-[#e0a875]/50 transition-all flex flex-col justify-between group cursor-pointer shadow-md hover:scale-[1.01]"
                  >
                    <div>
                      <div
                        className="w-full h-24 rounded-xl bg-cover bg-center border border-[rgba(255,248,235,0.12)] relative overflow-hidden"
                        style={{
                          backgroundImage: `url('${space.coverUrl || "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=400&q=80"}')`,
                        }}
                      >
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                      </div>
                      <h3
                        className="text-sm font-semibold text-[#fff5e7] mt-2.5 group-hover:text-[#e0a875] transition-colors truncate"
                        style={{ fontFamily: "var(--font-display), Georgia, serif" }}
                      >
                        {space.name}
                      </h3>
                      {/* Avatars */}
                      <div className="flex items-center -space-x-1.5 mt-1.5 mb-2.5">
                        {(space.memberNames || ["You"]).slice(0, 3).map((m, idx) => (
                          <div
                            key={idx}
                            className="w-5 h-5 rounded-full bg-[#5d7c87] border border-[#141d20] text-[9px] flex items-center justify-center font-bold text-white uppercase"
                          >
                            {m[0]}
                          </div>
                        ))}
                        {(space.memberNames || []).length > 3 && (
                          <div className="w-5 h-5 rounded-full bg-[rgba(255,248,235,0.15)] border border-[#141d20] text-[8px] flex items-center justify-center text-[#e0a875] font-semibold">
                            +{space.memberNames.length - 3}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="pt-2 border-t border-[rgba(255,248,235,0.08)] flex items-center justify-between">
                      <div>
                        <strong
                          className={`text-xs font-bold ${
                            isOwed ? "text-[#9cc79d]" : isDue ? "text-[#db9b83]" : "text-[#fff5e7]"
                          } block`}
                          style={{ fontFamily: "var(--font-display), Georgia, serif" }}
                        >
                          ₹{spaceTotal.toLocaleString("en-IN")}
                        </strong>
                        <span className="text-[10px] text-[rgba(255,245,230,0.5)] block">
                          {spaceExpenses.length} expense{spaceExpenses.length !== 1 ? "s" : ""}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onExportReceipt?.(space.id);
                          }}
                          title="View Space Receipt"
                          className="px-1.5 py-0.5 rounded-lg border border-[rgba(255,248,235,0.18)] bg-[rgba(255,248,235,0.06)] hover:bg-[#e0a875]/20 text-[rgba(255,245,230,0.7)] hover:text-[#fff5e7] text-[10px] transition-all"
                        >
                          🧾
                        </button>
                        <span
                          className={`text-[9px] uppercase tracking-[0.14em] px-2 py-0.5 rounded-full font-semibold border ${
                            space.status === "Settled"
                              ? "bg-[rgba(255,248,235,0.08)] text-[rgba(255,245,230,0.6)] border-[rgba(255,248,235,0.15)]"
                              : "bg-[#9cc79d]/15 text-[#9cc79d] border-[#9cc79d]/30"
                          }`}
                        >
                          {space.status || "Active"}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </ScrollReveal>

        {/* Recent Expenses */}
        <ScrollReveal delay={160} direction="flip-up" className="lg:col-span-5 flex flex-col">
          <div
            className="h-full bg-[rgba(25,38,44,0.60)] backdrop-blur-2xl border border-[rgba(235,248,246,0.18)] rounded-3xl p-5 sm:p-6 shadow-2xl flex flex-col justify-between smooth-hover-card"
            style={{
              boxShadow: "0 16px 45px rgba(6, 12, 14, 0.35), inset 0 1px 0 rgba(255, 255, 255, 0.14)",
            }}
          >
            <div className="flex items-center justify-between mb-4">
              <div>
                <span
                  className="text-[10px] uppercase tracking-[0.24em] text-[rgba(224,168,117,0.85)] font-semibold block mb-0.5"
                  style={{ fontFamily: "var(--font-sans-ui), sans-serif" }}
                >
                  Ledger Entries
                </span>
                <h2
                  className="text-base sm:text-lg font-semibold text-[#fff5e7] tracking-tight"
                  style={{ fontFamily: "var(--font-display), Georgia, serif" }}
                >
                  Recent Expenses
                </h2>
              </div>
              <button
                type="button"
                onClick={() => (onNavigateTab ? onNavigateTab("expenses") : onAddExpense())}
                className="px-3.5 py-1.5 rounded-full border border-[rgba(255,244,225,0.24)] bg-[rgba(255,247,235,0.08)] hover:bg-[#e0a875]/15 hover:border-[#e0a875]/40 text-[#fff5e7] text-[10px] font-bold uppercase tracking-[0.16em] transition-all backdrop-blur-md"
              >
                View all →
              </button>
            </div>

            <div className="space-y-3">
              {userExpenses.slice(0, 4).map((exp) => (
                <div
                  key={exp.id}
                  className="flex items-center justify-between gap-3 p-2.5 rounded-2xl bg-[rgba(255,248,235,0.04)] border border-[rgba(255,248,235,0.08)] hover:border-[rgba(255,248,235,0.18)] transition-all"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-9 h-9 rounded-xl bg-[rgba(224,168,117,0.15)] border border-[#e0a875]/30 text-[#e0a875] flex items-center justify-center text-sm flex-shrink-0">
                      🧾
                    </div>
                    <div className="min-w-0">
                      <h4 className="text-xs font-semibold text-[#fff5e7] truncate">{exp.description}</h4>
                      <p
                        className="text-[10px] text-[rgba(255,245,230,0.5)] truncate mt-0.5 tracking-wider uppercase"
                        style={{ fontFamily: "var(--font-mono-ui), monospace" }}
                      >
                        {exp.spaceName} · Paid by {exp.paidBy}
                      </p>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <strong
                      className="text-xs sm:text-sm font-semibold text-[#fff7ec] block"
                      style={{ fontFamily: "var(--font-display), Georgia, serif" }}
                    >
                      ₹{exp.amount.toLocaleString("en-IN")}
                    </strong>
                    <span
                      className="text-[10px] text-[rgba(255,245,230,0.5)] uppercase tracking-wider"
                      style={{ fontFamily: "var(--font-mono-ui), monospace" }}
                    >
                      {exp.date}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </ScrollReveal>
      </section>

      {/* ========================================================= */}
      {/* 4. LOWER ROW: SPENDING BY CATEGORY + SETTLEMENTS          */}
      {/* ========================================================= */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Spending by Category Donut */}
        <ScrollReveal delay={40} direction="flip-up" className="lg:col-span-6 flex flex-col">
          <div
            className="h-full bg-[rgba(25,38,44,0.60)] backdrop-blur-2xl border border-[rgba(235,248,246,0.18)] rounded-3xl p-5 sm:p-6 shadow-2xl smooth-hover-card flex flex-col justify-between"
            style={{
              boxShadow: "0 16px 45px rgba(6, 12, 14, 0.35), inset 0 1px 0 rgba(255, 255, 255, 0.14)",
            }}
          >
            <div className="flex items-center justify-between mb-4">
              <div>
                <span
                  className="text-[10px] uppercase tracking-[0.24em] text-[rgba(224,168,117,0.85)] font-semibold block mb-0.5"
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
              <div className="px-3.5 py-1.5 rounded-full border border-[rgba(255,244,225,0.24)] bg-[rgba(255,247,235,0.08)] text-[10px] font-bold text-[#e0a875] uppercase tracking-[0.16em] flex items-center gap-1.5 cursor-pointer backdrop-blur-md">
                <span>{selectedMonth}</span>
                <span>▾</span>
              </div>
            </div>

            <div className="pt-2 w-full">
              <InteractiveDonutChart
                data={[
                  { id: "food", label: "Food & Drinks", amount: 4742, pct: 38, color: "#e0a875" },
                  { id: "travel", label: "Travel & Fuel", amount: 2995, pct: 24, color: "#5d7c87" },
                  { id: "stay", label: "Accommodation", amount: 2246, pct: 18, color: "#8b6873" },
                  { id: "activities", label: "Activities", amount: 1498, pct: 12, color: "#6e8d80" },
                  { id: "others", label: "Others", amount: 999, pct: 8, color: "#546066" },
                ]}
                totalAmount={12480}
                centerTitle="₹12,480"
                centerSubtitle="Total Spent"
                currency="₹"
                theme="trip"
              />
            </div>
          </div>
        </ScrollReveal>

        {/* Outstanding Settlements */}
        <ScrollReveal delay={160} direction="flip-up" className="lg:col-span-6 flex flex-col">
          <div
            className="h-full bg-[rgba(25,38,44,0.60)] backdrop-blur-2xl border border-[rgba(235,248,246,0.18)] rounded-3xl p-5 sm:p-6 shadow-2xl flex flex-col justify-between smooth-hover-card"
            style={{
              boxShadow: "0 16px 45px rgba(6, 12, 14, 0.35), inset 0 1px 0 rgba(255, 255, 255, 0.14)",
            }}
          >
            <div className="flex items-center justify-between mb-4">
              <div>
                <span
                  className="text-[10px] uppercase tracking-[0.24em] text-[rgba(224,168,117,0.85)] font-semibold block mb-0.5"
                  style={{ fontFamily: "var(--font-sans-ui), sans-serif" }}
                >
                  Clear Balances
                </span>
                <h2
                  className="text-base sm:text-lg font-semibold text-[#fff5e7] tracking-tight"
                  style={{ fontFamily: "var(--font-display), Georgia, serif" }}
                >
                  Outstanding Settlements
                </h2>
              </div>
              <button
                type="button"
                onClick={() => (onNavigateTab ? onNavigateTab("settlements") : onSettleUp())}
                className="px-3.5 py-1.5 rounded-full border border-[rgba(255,244,225,0.24)] bg-[rgba(255,247,235,0.08)] hover:bg-[#e0a875]/15 hover:border-[#e0a875]/40 text-[#fff5e7] text-[10px] font-bold uppercase tracking-[0.16em] transition-all backdrop-blur-md"
              >
                View all →
              </button>
            </div>

            <div className="space-y-3">
              {settlements
                .filter((s) => s.status === "pending")
                .slice(0, 3)
                .map((s) => {
                  const isReceiving = s.isYouReceiving;
                  const counterparty = isReceiving ? s.fromUser : s.toUser;

                  return (
                    <div
                      key={s.id}
                      className="flex items-center justify-between gap-3 p-2.5 rounded-2xl bg-[rgba(255,248,235,0.04)] border border-[rgba(255,248,235,0.08)] hover:border-[rgba(255,248,235,0.18)] transition-all"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div
                          className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold uppercase border flex-shrink-0 ${
                            isReceiving
                              ? "bg-[#9cc79d]/20 border-[#9cc79d]/40 text-[#9cc79d]"
                              : "bg-[#db9b83]/20 border-[#db9b83]/40 text-[#db9b83]"
                          }`}
                        >
                          {counterparty[0] || "U"}
                        </div>
                        <div className="min-w-0">
                          <h4 className="text-xs font-semibold text-[#fff5e7] truncate">
                            {counterparty}
                          </h4>
                          <p
                            className={`text-[10px] uppercase tracking-wider font-semibold ${
                              isReceiving ? "text-[#9cc79d]" : "text-[#db9b83]"
                            }`}
                          >
                            {isReceiving ? "owes you" : "you owe"} · {s.spaceName}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2.5 flex-shrink-0">
                        <strong
                          className={`text-xs sm:text-sm font-bold ${
                            isReceiving ? "text-[#9cc79d]" : "text-[#db9b83]"
                          }`}
                          style={{ fontFamily: "var(--font-display), Georgia, serif" }}
                        >
                          ₹{s.amount.toLocaleString("en-IN")}
                        </strong>
                        <button
                          type="button"
                          onClick={() => onSettleUp(s.id)}
                          className={`px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-[0.14em] transition-all backdrop-blur-md border ${
                            isReceiving
                              ? "bg-[#e0a875]/15 hover:bg-[#e0a875]/25 text-[#e0a875] border-[#e0a875]/40"
                              : "bg-[#db9b83]/15 hover:bg-[#db9b83]/25 text-[#db9b83] border-[#db9b83]/40"
                          }`}
                        >
                          {isReceiving ? "⚡ UPI Request" : "⚡ Pay Now"}
                        </button>
                      </div>
                    </div>
                  );
                })}

              {settlements.filter((s) => s.status === "pending").length === 0 && (
                <div className="py-8 text-center text-[rgba(255,245,230,0.45)] text-xs">
                  <span>✨ All debts settled &amp; cleared!</span>
                </div>
              )}
            </div>
          </div>
        </ScrollReveal>
      </section>

      {/* ========================================================= */}
      {/* 5. BOTTOM ROW: RECENT ACTIVITY                            */}
      {/* ========================================================= */}
      <ScrollReveal delay={50} direction="flip-up">
        <section
          className="bg-[rgba(18,27,31,0.78)] backdrop-blur-2xl border border-[rgba(235,248,246,0.15)] rounded-3xl p-5 sm:p-6 shadow-2xl smooth-hover-card"
          style={{
            boxShadow: "0 20px 60px rgba(6, 12, 14, 0.45), inset 0 1px 0 rgba(255, 255, 255, 0.08)",
          }}
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <span
                className="text-[10px] uppercase tracking-[0.24em] text-[rgba(224,168,117,0.85)] font-semibold block mb-0.5"
                style={{ fontFamily: "var(--font-sans-ui), sans-serif" }}
              >
                Timeline
              </span>
              <h2
                className="text-base sm:text-lg font-semibold text-[#fff5e7] tracking-tight"
                style={{ fontFamily: "var(--font-display), Georgia, serif" }}
              >
                Recent Activity
              </h2>
            </div>
            <button
              type="button"
              onClick={() => onNavigateTab && onNavigateTab("analytics")}
              className="px-3.5 py-1.5 rounded-full border border-[rgba(255,244,225,0.24)] bg-[rgba(255,247,235,0.08)] hover:bg-[#e0a875]/15 hover:border-[#e0a875]/40 text-[#fff5e7] text-[10px] font-bold uppercase tracking-[0.16em] transition-all backdrop-blur-md"
            >
              View all →
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {/* 1 */}
            <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-[rgba(255,248,235,0.04)] border border-[rgba(255,248,235,0.08)]">
              <div className="w-9 h-9 rounded-xl bg-[rgba(93,124,135,0.25)] border border-[rgba(93,124,135,0.4)] text-[#a3c2cd] flex items-center justify-center text-xs flex-shrink-0 font-bold">
                ⤢
              </div>
              <div className="min-w-0">
                <p className="text-xs font-semibold text-[#fff5e7] truncate">Aman added an expense</p>
                <p className="text-[10px] text-[rgba(255,245,230,0.5)] truncate uppercase tracking-wider mt-0.5">
                  Dinner at Thalassa · Goa Trip
                </p>
              </div>
            </div>

            {/* 2 */}
            <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-[rgba(255,248,235,0.04)] border border-[rgba(255,248,235,0.08)]">
              <div className="w-9 h-9 rounded-xl bg-[rgba(110,141,128,0.25)] border border-[rgba(110,141,128,0.4)] text-[#9cc79d] flex items-center justify-center text-xs flex-shrink-0 font-bold">
                ⇄
              </div>
              <div className="min-w-0">
                <p className="text-xs font-semibold text-[#fff5e7] truncate">You settled ₹1,000 with Rahul</p>
                <p className="text-[10px] text-[rgba(255,245,230,0.5)] truncate uppercase tracking-wider mt-0.5">
                  Goa Trip
                </p>
              </div>
            </div>

            {/* 3 */}
            <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-[rgba(255,248,235,0.04)] border border-[rgba(255,248,235,0.08)]">
              <div
                className="w-9 h-9 rounded-full bg-cover bg-center border border-[rgba(255,248,235,0.2)] flex-shrink-0"
                style={{
                  backgroundImage:
                    "url('https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=120&q=80')",
                }}
              />
              <div className="min-w-0">
                <p className="text-xs font-semibold text-[#fff5e7] truncate">Priya joined College Friends</p>
                <p className="text-[10px] text-[rgba(255,245,230,0.5)] truncate uppercase tracking-wider mt-0.5">
                  2 days ago
                </p>
              </div>
            </div>
          </div>
        </section>
      </ScrollReveal>
    </div>
  );
}
