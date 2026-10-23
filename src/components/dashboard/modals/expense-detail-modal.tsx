"use client";

import React from "react";
import { SharedExpense } from "../../../lib/types/dashboard";

interface ExpenseDetailModalProps {
  expense: SharedExpense | null;
  isOpen: boolean;
  onClose: () => void;
  onDeleteExpense?: (expenseId: string) => void;
}

export function ExpenseDetailModal({
  expense,
  isOpen,
  onClose,
  onDeleteExpense,
}: ExpenseDetailModalProps) {
  if (!isOpen || !expense) return null;

  const isYours = expense.isPaidByYou;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md bg-[#181d22] border border-[#2d3844] rounded-2xl p-6 shadow-2xl relative text-[#fbf5eb]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div>
            <span className="text-xs font-semibold text-[#e0a875] uppercase tracking-wider">
              {expense.spaceName}
            </span>
            <h3
              className="text-xl font-bold text-[#e6edf3] mt-0.5"
              style={{ fontFamily: "var(--font-display), Georgia, serif" }}
            >
              {expense.description}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-7 h-7 rounded-lg bg-[#202830] text-[#7d8b99] hover:text-[#e6edf3] flex items-center justify-center text-sm transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Big Amount Card */}
        <div className="p-5 rounded-2xl bg-[#12161a] border border-[#252f3a] text-center mb-5">
          <span className="text-[10px] uppercase tracking-widest text-[#8c9cae]">
            Total Expense
          </span>
          <p
            className="text-3xl sm:text-4xl font-bold text-[#fff7ec] mt-1"
            style={{ fontFamily: "var(--font-display), serif" }}
          >
            {expense.currency}{expense.amount.toLocaleString("en-IN")}
          </p>
          <div className="inline-flex items-center gap-2 mt-2 px-3 py-1 rounded-full bg-[#1b232c] border border-[#2c3846] text-xs">
            <span className={isYours ? "text-[#6ee7b7] font-semibold" : "text-[#e6edf3]"}>
              {isYours ? "You paid the full bill" : `Paid by ${expense.paidBy}`}
            </span>
            <span className="text-[#556371]">·</span>
            <span className="text-[#8c9cae]">{expense.date}</span>
          </div>
        </div>

        {/* Split Breakdown */}
        <div className="space-y-3 mb-6">
          <span className="text-xs font-semibold text-[#8c9cae] uppercase tracking-wider block">
            Split Breakdown ({expense.splitType})
          </span>

          <div className="p-3.5 rounded-xl bg-[#13171b] border border-[#232c35] space-y-2.5 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-[#cad8d1]">Your Share</span>
              <span className="font-mono font-semibold text-[#fff7ec]">
                {expense.currency}{expense.userShare.toLocaleString("en-IN")}
              </span>
            </div>
            <div className="flex items-center justify-between text-[11px] text-[#7d8b99] pt-2 border-t border-[#232c35]">
              <span>Group Split Calculation</span>
              <span>
                {isYours
                  ? `You are owed ${expense.currency}${(expense.amount - expense.userShare).toLocaleString("en-IN")}`
                  : `You owe ${expense.currency}${expense.userShare.toLocaleString("en-IN")}`}
              </span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between pt-2">
          {onDeleteExpense && (
            <button
              type="button"
              onClick={() => {
                onDeleteExpense(expense.id);
                onClose();
              }}
              className="text-xs text-rose-400 hover:text-rose-300 hover:underline px-2 py-1"
            >
              Delete Expense
            </button>
          )}
          <button
            type="button"
            onClick={onClose}
            className="ml-auto px-5 py-2 rounded-xl bg-[#25303c] hover:bg-[#324050] text-[#e6edf3] text-xs font-semibold transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
