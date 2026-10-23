"use client";

import React, { useState } from "react";
import { MOCK_SHARED_EXPENSES, MOCK_SPACES } from "../../../lib/data/mock-data";
import { SharedExpense } from "../../../lib/types/dashboard";
import { ExpenseDetailModal } from "../modals/expense-detail-modal";

interface TripExpensesPageProps {
  onAddExpense: () => void;
  onScanReceipt: () => void;
  onExportReceipt?: () => void;
  userExpenses?: SharedExpense[];
  onDeleteExpense?: (expenseId: string) => void;
  searchQuery?: string;
}

export function TripExpensesPage({
  onAddExpense,
  onScanReceipt,
  onExportReceipt,
  userExpenses = [],
  onDeleteExpense,
  searchQuery: externalQuery,
}: TripExpensesPageProps) {
  const [activeSpace, setActiveSpace] = useState<string>("all");
  const [internalQuery, setInternalQuery] = useState("");
  const [selectedExpense, setSelectedExpense] = useState<SharedExpense | null>(null);

  const activeQuery = externalQuery ? externalQuery : internalQuery;

  const allExpenses = userExpenses.length > 0 ? userExpenses : MOCK_SHARED_EXPENSES;
  const spaceOptions = ["all", ...Array.from(new Set(allExpenses.map((e) => e.spaceName)))];

  const filtered = allExpenses.filter((exp) => {
    const matchSpace = activeSpace === "all" || (exp as SharedExpense).spaceName === activeSpace;
    const matchSearch =
      !activeQuery || (exp as SharedExpense).description.toLowerCase().includes(activeQuery.toLowerCase());
    return matchSpace && matchSearch;
  }) as SharedExpense[];

  const total = filtered.reduce((sum, e) => sum + e.amount, 0);
  const myShare = filtered.reduce((sum, e) => sum + e.userShare, 0);

  return (
    <div className="space-y-6 text-[#fbf5eb]">
      {/* Header */}
      <section className="flex items-start justify-between gap-4 pt-1 animate-pop-in pop-delay-1">
        <div>
          <span className="text-[11px] font-semibold tracking-[0.26em] text-[#e0a875] uppercase block mb-1">
            Group Expenses
          </span>
          <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight text-[#fff7ec]"
            style={{ fontFamily: "var(--font-display), Georgia, serif" }}>
            All Expenses
          </h1>
          <p className="text-xs text-[rgba(255,245,230,0.65)] mt-1">
            Track every rupee split across your trips &amp; groups
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={onExportReceipt}
            className="flex items-center gap-1.5 px-3 py-2.5 rounded-2xl border border-[rgba(255,248,235,0.15)] text-[rgba(255,245,230,0.85)] text-xs font-semibold uppercase tracking-widest hover:border-[#fcd34d]/40 hover:text-[#fcd34d] transition-all"
          >
            <span>🧾</span>
            Receipt
          </button>
          <button
            onClick={onScanReceipt}
            className="flex items-center gap-1.5 px-3 py-2.5 rounded-2xl border border-[rgba(255,248,235,0.15)] text-[rgba(255,245,230,0.75)] text-xs font-semibold uppercase tracking-widest hover:border-[#e0a875]/40 hover:text-[#e0a875] transition-all"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            Scan
          </button>
          <button
            onClick={onAddExpense}
            className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-[#e0a875] text-[#1a1208] text-xs font-bold uppercase tracking-widest shadow-lg hover:bg-[#ebb98a] transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add
          </button>
        </div>
      </section>

      {/* Summary Strip */}
      <div className="grid grid-cols-2 gap-3 animate-pop-in pop-delay-2">
        <div className="rounded-2xl border border-[rgba(255,248,235,0.18)] bg-[rgba(25,38,44,0.60)] p-4 backdrop-blur-2xl shadow-lg">
          <p className="text-[10px] uppercase tracking-widest text-[rgba(255,245,230,0.6)] mb-1">Total Spend</p>
          <p className="text-2xl font-semibold" style={{ fontFamily: "var(--font-display), serif" }}>
            ₹{total.toLocaleString("en-IN")}
          </p>
          <p className="text-[10px] text-[rgba(255,245,230,0.5)] mt-0.5">{filtered.length} transactions</p>
        </div>
        <div className="rounded-2xl border border-[rgba(255,248,235,0.18)] bg-[rgba(25,38,44,0.60)] p-4 backdrop-blur-2xl shadow-lg">
          <p className="text-[10px] uppercase tracking-widest text-[rgba(255,245,230,0.6)] mb-1">My Share</p>
          <p className="text-2xl font-semibold text-[#fca5a5]" style={{ fontFamily: "var(--font-display), serif" }}>
            ₹{myShare.toLocaleString("en-IN")}
          </p>
          <p className="text-[10px] text-[rgba(255,245,230,0.5)] mt-0.5">Across all splits</p>
        </div>
      </div>

      {/* Search & Filter */}
      <div className="flex flex-col sm:flex-row gap-3 animate-pop-in pop-delay-3">
        <div className="flex-1 relative">
          <svg className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[rgba(255,245,230,0.4)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            value={activeQuery}
            onChange={(e) => setInternalQuery(e.target.value)}
            placeholder="Search expenses…"
            className="w-full bg-[rgba(22,30,33,0.7)] border border-[rgba(255,248,235,0.1)] rounded-2xl pl-10 pr-4 py-2.5 text-sm text-[#fbf5eb] placeholder:text-[rgba(255,245,230,0.35)] outline-none focus:border-[#e0a875]/40 transition-colors"
          />
        </div>
        <div
          className="flex gap-2 overflow-x-auto pb-0.5 scrollbar-none no-scrollbar [&::-webkit-scrollbar]:hidden [scrollbar-width:none] [-ms-overflow-style:none]"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {spaceOptions.map((sp) => (
            <button
              key={sp}
              onClick={() => setActiveSpace(sp)}
              className={`whitespace-nowrap px-3 py-2 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all flex-shrink-0 ${
                activeSpace === sp
                  ? "bg-[#e0a875]/20 text-[#e0a875] border border-[#e0a875]/40"
                  : "text-[rgba(255,245,230,0.5)] border border-[rgba(255,248,235,0.1)] hover:border-[rgba(255,248,235,0.25)]"
              }`}
            >
              {sp === "all" ? "All Spaces" : sp}
            </button>
          ))}
        </div>
      </div>

      {/* Expense List */}
      <div className="space-y-3 animate-pop-in pop-delay-4">
        {filtered.map((expense) => {
          const isYours = expense.isPaidByYou;
          return (
            <div
              key={expense.id}
              onClick={() => setSelectedExpense(expense)}
              className="flex items-center gap-4 p-4 rounded-2xl border border-[rgba(255,248,235,0.18)] bg-[rgba(25,38,44,0.60)] hover:border-[rgba(224,168,117,0.4)] transition-all cursor-pointer backdrop-blur-2xl group shadow-sm hover:shadow-md"
            >
              {/* Paid indicator */}
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 text-sm ${
                isYours ? "bg-[rgba(110,231,183,0.12)] text-[#6ee7b7]" : "bg-[rgba(252,165,165,0.1)] text-[#fca5a5]"
              }`}>
                {isYours ? "↑" : "↓"}
              </div>

              {/* Details */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-[#fbf5eb] truncate">{expense.description}</p>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-[10px] text-[rgba(255,245,230,0.5)]">{expense.spaceName}</span>
                  <span className="text-[rgba(255,248,235,0.2)]">·</span>
                  <span className="text-[10px] text-[rgba(255,245,230,0.5)]">{expense.date}</span>
                  <span className="text-[rgba(255,248,235,0.2)]">·</span>
                  <span className={`text-[10px] font-semibold ${isYours ? "text-[#6ee7b7]" : "text-[rgba(255,245,230,0.5)]"}`}>
                    {isYours ? "You paid" : `Paid by ${expense.paidBy}`}
                  </span>
                </div>
              </div>

              {/* Amounts */}
              <div className="text-right flex-shrink-0">
                <p className="text-sm font-semibold" style={{ fontFamily: "var(--font-display), serif" }}>
                  {expense.currency}{expense.amount.toLocaleString("en-IN")}
                </p>
                <p className={`text-[10px] mt-0.5 ${isYours ? "text-[#6ee7b7]" : "text-[#fca5a5]"}`}>
                  {isYours ? "+" : "-"}{expense.currency}{expense.userShare.toLocaleString("en-IN")} your share
                </p>
              </div>
            </div>
          );
        })}

        {filtered.length === 0 && (
          <div className="text-center py-16 text-[rgba(255,245,230,0.35)]">
            <p className="text-4xl mb-3">🧾</p>
            <p className="text-sm font-medium">No expenses found</p>
            <p className="text-xs mt-1">Try adjusting the filters above</p>
          </div>
        )}
      </div>

      <ExpenseDetailModal
        expense={selectedExpense}
        isOpen={!!selectedExpense}
        onClose={() => setSelectedExpense(null)}
        onDeleteExpense={onDeleteExpense}
      />
    </div>
  );
}
