"use client";

import React, { useState } from "react";
import { MOCK_PERSONAL_TRANSACTIONS } from "../../../lib/data/mock-data";
import { PersonalTransaction } from "../../../lib/types/dashboard";

interface PersonalTransactionsPageProps {
  onAddTransaction: () => void;
  onScanReceipt?: () => void;
  onExportReceipt?: () => void;
  onDeleteTransaction?: (id: string) => void;
  userTransactions?: PersonalTransaction[];
  searchQuery?: string;
}

const categoryIcons: Record<string, string> = {
  "Salary / Income": "💼",
  "Freelance / Consulting": "💻",
  "Food & Groceries": "🛒",
  "Food & Dining": "☕",
  "Home & Furniture": "🪑",
  "Rent & Utilities": "🏠",
  "Shopping & Gear": "🛍️",
  "Transportation": "🚗",
  Investments: "📈",
  "Investments & Dividends": "📈",
  "Health & Fitness": "🏋️",
  "Savings Transfer": "🏦",
  "Credit Card Bill Pay": "💳",
};

const typeColors: Record<string, { text: string; bg: string }> = {
  income: { text: "#6ee7b7", bg: "rgba(110,231,183,0.12)" },
  expense: { text: "#fca5a5", bg: "rgba(252,165,165,0.12)" },
  transfer: { text: "#67e8f9", bg: "rgba(103,232,249,0.12)" },
};

export function PersonalTransactionsPage({
  onAddTransaction,
  onScanReceipt,
  onExportReceipt,
  onDeleteTransaction,
  userTransactions = [],
  searchQuery: externalQuery,
}: PersonalTransactionsPageProps) {
  const [filter, setFilter] = useState<"all" | "income" | "expense" | "transfer">("all");
  const [internalQuery, setInternalQuery] = useState("");
  const [expandedTxId, setExpandedTxId] = useState<string | null>(null);

  const activeQuery = externalQuery !== undefined ? externalQuery : internalQuery;

  const transactions = userTransactions.length > 0 ? userTransactions : MOCK_PERSONAL_TRANSACTIONS;
  const filtered = transactions.filter((t) => {
    const matchType = filter === "all" || t.type === filter;
    const matchSearch =
      !activeQuery ||
      t.title.toLowerCase().includes(activeQuery.toLowerCase()) ||
      t.category.toLowerCase().includes(activeQuery.toLowerCase()) ||
      t.account.toLowerCase().includes(activeQuery.toLowerCase()) ||
      (t.notes && t.notes.toLowerCase().includes(activeQuery.toLowerCase()));
    return matchType && matchSearch;
  });

  const totalIncome = transactions.filter((t) => t.type === "income").reduce((s, t) => s + t.amount, 0);
  const totalExpenses = transactions.filter((t) => t.type === "expense").reduce((s, t) => s + t.amount, 0);

  return (
    <div className="space-y-6 text-[#fbf5eb]">
      {/* Header */}
      <section className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-1 animate-pop-in pop-delay-1">
        <div>
          <span className="text-[11px] font-semibold tracking-[0.26em] text-[#6ee7b7] uppercase block mb-1">
            Money Ledger
          </span>
          <h1
            className="text-3xl sm:text-4xl font-semibold tracking-tight text-[#fff7ec]"
            style={{ fontFamily: "var(--font-display), Georgia, serif" }}
          >
            Transaction History
          </h1>
          <p className="text-xs text-[rgba(255,245,230,0.65)] mt-1">
            {transactions.length} record{transactions.length === 1 ? "" : "s"} · Every rupee in and out, in one place
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {onScanReceipt && (
            <button
              onClick={onScanReceipt}
              className="flex items-center gap-1.5 px-3 py-2 rounded-2xl border border-[rgba(255,248,235,0.15)] text-[rgba(255,245,230,0.85)] text-xs font-semibold uppercase tracking-wider hover:border-[#f39850]/40 hover:text-[#f39850] transition-all"
            >
              <span>📷</span>
              Scan Bill
            </button>
          )}
          {onExportReceipt && (
            <button
              onClick={onExportReceipt}
              className="flex items-center gap-1.5 px-3 py-2 rounded-2xl border border-[rgba(255,248,235,0.15)] text-[rgba(255,245,230,0.85)] text-xs font-semibold uppercase tracking-wider hover:border-[#fcd34d]/40 hover:text-[#fcd34d] transition-all"
            >
              <span>🧾</span>
              Statement Slip
            </button>
          )}
          <button
            onClick={onAddTransaction}
            className="flex items-center gap-1.5 px-4 py-2 rounded-2xl bg-[#10b981] text-[#052e1a] text-xs font-bold uppercase tracking-wider shadow-lg hover:bg-[#34d399] transition-colors"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
            </svg>
            Record Entry
          </button>
        </div>
      </section>

      {/* Summary Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 animate-pop-in pop-delay-2">
        <div className="rounded-2xl border border-[rgba(110,231,183,0.2)] bg-[rgba(110,231,183,0.07)] p-4 backdrop-blur-md">
          <p className="text-[10px] uppercase tracking-widest text-[rgba(110,231,183,0.65)] mb-1">Total Income</p>
          <p className="text-2xl font-semibold text-[#6ee7b7]" style={{ fontFamily: "var(--font-display), serif" }}>
            ₹{totalIncome.toLocaleString("en-IN")}
          </p>
          <p className="text-[10px] text-[rgba(110,231,183,0.5)] mt-0.5">Recorded inflows</p>
        </div>
        <div className="rounded-2xl border border-[rgba(252,165,165,0.2)] bg-[rgba(252,165,165,0.07)] p-4 backdrop-blur-md">
          <p className="text-[10px] uppercase tracking-widest text-[rgba(252,165,165,0.65)] mb-1">Total Expenses</p>
          <p className="text-2xl font-semibold text-[#fca5a5]" style={{ fontFamily: "var(--font-display), serif" }}>
            ₹{totalExpenses.toLocaleString("en-IN")}
          </p>
          <p className="text-[10px] text-[rgba(252,165,165,0.5)] mt-0.5">Recorded outflows</p>
        </div>
        <div className="col-span-2 sm:col-span-1 rounded-2xl border border-[rgba(255,248,235,0.12)] bg-[rgba(255,248,235,0.04)] p-4 backdrop-blur-md">
          <p className="text-[10px] uppercase tracking-widest text-[rgba(255,245,230,0.5)] mb-1">Net Balance</p>
          <p
            className={`text-2xl font-semibold ${totalIncome - totalExpenses >= 0 ? "text-[#9cc79d]" : "text-[#fca5a5]"}`}
            style={{ fontFamily: "var(--font-display), serif" }}
          >
            {totalIncome - totalExpenses >= 0 ? "+" : ""}₹{(totalIncome - totalExpenses).toLocaleString("en-IN")}
          </p>
          <p className="text-[10px] text-[rgba(255,245,230,0.4)] mt-0.5">Cashflow position</p>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="space-y-3 animate-pop-in pop-delay-3">
        <div className="relative">
          <svg className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[rgba(255,245,230,0.4)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            value={activeQuery}
            onChange={(e) => setInternalQuery(e.target.value)}
            placeholder="Search transactions by title, category, account, or notes…"
            className="w-full bg-[rgba(22,30,33,0.7)] border border-[rgba(255,248,235,0.1)] rounded-2xl pl-10 pr-4 py-2.5 text-sm text-[#fbf5eb] placeholder:text-[rgba(255,245,230,0.35)] outline-none focus:border-[#6ee7b7]/40 transition-colors"
          />
        </div>
        <div className="flex gap-2">
          {(["all", "income", "expense", "transfer"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold uppercase tracking-widest transition-all capitalize ${
                filter === f
                  ? "bg-[#10b981]/20 text-[#6ee7b7] border border-[#10b981]/40"
                  : "text-[rgba(255,245,230,0.5)] border border-[rgba(255,248,235,0.1)] hover:border-[rgba(255,248,235,0.25)]"
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Transaction List */}
      <div className="space-y-3 animate-pop-in pop-delay-4">
        {filtered.map((tx) => {
          const colors = typeColors[tx.type] || typeColors.expense;
          const icon = categoryIcons[tx.category] || "💳";
          const isExpanded = expandedTxId === tx.id;

          return (
            <div
              key={tx.id}
              onClick={() => setExpandedTxId(isExpanded ? null : tx.id)}
              className="rounded-2xl border border-[rgba(255,238,225,0.18)] bg-[rgba(48,32,40,0.60)] hover:border-[#f39850]/40 transition-all cursor-pointer backdrop-blur-2xl shadow-sm hover:shadow-md overflow-hidden"
            >
              <div className="p-4 flex items-center gap-4">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center text-lg flex-shrink-0"
                  style={{ background: colors.bg }}
                >
                  {icon}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-[#fbf5eb] truncate">{tx.title}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-[10px] text-[rgba(255,245,230,0.55)]">{tx.category}</span>
                    <span className="text-[rgba(255,248,235,0.2)]">·</span>
                    <span className="text-[10px] text-[rgba(255,245,230,0.45)]">{tx.account}</span>
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  <p
                    className="text-sm sm:text-base font-semibold"
                    style={{ fontFamily: "var(--font-display), serif", color: colors.text }}
                  >
                    {tx.type === "expense" ? "-" : tx.type === "income" ? "+" : "→"} ₹{tx.amount.toLocaleString("en-IN")}
                  </p>
                  <p className="text-[10px] text-[rgba(255,245,230,0.45)] mt-0.5">{tx.date}</p>
                </div>
                {onDeleteTransaction && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (window.confirm(`Delete "${tx.title}" from history?`)) {
                        onDeleteTransaction(tx.id);
                      }
                    }}
                    title="Delete transaction"
                    className="p-2 rounded-xl text-[rgba(255,245,230,0.35)] hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                )}
              </div>

              {/* Expanded Note & Metadata details */}
              {isExpanded && (
                <div className="px-4 pb-3 pt-1 border-t border-[rgba(255,248,235,0.08)] bg-[rgba(255,248,235,0.02)] flex flex-wrap items-center justify-between gap-2 text-xs text-[rgba(255,245,230,0.65)]">
                  <div>
                    {tx.notes ? (
                      <p className="italic text-[11px] text-[rgba(255,245,230,0.75)]">
                        &ldquo;{tx.notes}&rdquo;
                      </p>
                    ) : (
                      <p className="text-[10px] text-[rgba(255,245,230,0.35)]">No additional notes provided</p>
                    )}
                  </div>
                  <div className="flex items-center gap-3 text-[10px] font-mono">
                    <span className="uppercase tracking-wider px-2 py-0.5 rounded-full bg-[rgba(255,248,235,0.06)] border border-[rgba(255,248,235,0.12)]">
                      Type: {tx.type}
                    </span>
                    <span>Account: {tx.account}</span>
                  </div>
                </div>
              )}
            </div>
          );
        })}

        {filtered.length === 0 && (
          <div className="text-center py-16 text-[rgba(255,245,230,0.4)] rounded-3xl border border-dashed border-[rgba(255,248,235,0.15)] bg-[rgba(48,32,40,0.3)]">
            <p className="text-4xl mb-3">💳</p>
            <p className="text-sm font-medium text-[#fff7ec]">No transactions found</p>
            <p className="text-xs mt-1">Try a different filter or record a new transaction to begin</p>
            <button
              onClick={onAddTransaction}
              className="mt-4 px-4 py-2 rounded-xl bg-[#10b981] text-[#052e1a] text-xs font-bold uppercase tracking-wider hover:bg-[#34d399] transition-colors"
            >
              + Record Transaction
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
