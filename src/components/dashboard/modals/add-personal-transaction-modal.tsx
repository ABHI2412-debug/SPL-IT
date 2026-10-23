"use client";

import React, { useState } from "react";
import { PersonalTransaction } from "../../../lib/types/dashboard";

interface AddPersonalTransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTransactionAdded: (transaction: PersonalTransaction) => void;
}

const expenseCategories = [
  "Food & Groceries",
  "Food & Dining",
  "Rent & Utilities",
  "Shopping & Gear",
  "Transportation",
  "Health & Fitness",
  "Entertainment",
  "Home & Furniture",
  "Other Expense",
];

const incomeCategories = [
  "Salary / Income",
  "Freelance / Consulting",
  "Investments & Dividends",
  "Gifts & Refunds",
  "Other Income",
];

const transferCategories = [
  "Savings Transfer",
  "Credit Card Bill Pay",
  "Investment Deposit",
  "Emergency Fund",
  "Internal Account Transfer",
];

const accountOptions = [
  "HDFC Salary Account",
  "ICICI Savings",
  "Axis Bank Account",
  "CRED / UPI Wallet",
  "Cash",
];

export function AddPersonalTransactionModal({
  isOpen,
  onClose,
  onTransactionAdded,
}: AddPersonalTransactionModalProps) {
  const [type, setType] = useState<"expense" | "income" | "transfer">("expense");
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState(expenseCategories[0]);
  const [account, setAccount] = useState(accountOptions[0]);
  const [notes, setNotes] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  if (!isOpen) return null;

  const handleTypeChange = (newType: "expense" | "income" | "transfer") => {
    setType(newType);
    if (newType === "expense") setCategory(expenseCategories[0]);
    else if (newType === "income") setCategory(incomeCategories[0]);
    else setCategory(transferCategories[0]);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = parseFloat(amount);
    if (!title.trim() || isNaN(numAmount) || numAmount <= 0) {
      setErrorMsg("Please enter a valid title and positive amount.");
      return;
    }

    const todayStr = new Date().toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
    });

    const newTx: PersonalTransaction = {
      id: `tx-${Date.now()}`,
      title: title.trim(),
      amount: numAmount,
      type,
      category,
      account,
      date: `Today, ${todayStr}`,
      notes: notes.trim() || undefined,
    };

    onTransactionAdded(newTx);
    onClose();
    setTitle("");
    setAmount("");
    setNotes("");
    setErrorMsg("");
  };

  const currentCategories =
    type === "expense"
      ? expenseCategories
      : type === "income"
      ? incomeCategories
      : transferCategories;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg bg-[#181d22] border border-[#2d3844] rounded-2xl p-6 shadow-2xl relative text-[#fbf5eb]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between mb-5">
          <div>
            <span className="text-xs font-semibold text-[#f39850] uppercase tracking-wider">
              Room Ledger
            </span>
            <h3 className="text-lg font-bold text-[#e6edf3] mt-0.5">
              Record Personal Transaction
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

        {/* Type Selector Tabs */}
        <div className="grid grid-cols-3 gap-2 p-1 bg-[#12161a] rounded-xl border border-[#252f3a] mb-4">
          <button
            type="button"
            onClick={() => handleTypeChange("expense")}
            className={`py-2 text-xs font-semibold rounded-lg transition-all ${
              type === "expense"
                ? "bg-rose-500/20 text-rose-300 border border-rose-500/40 shadow-sm"
                : "text-[#7d8b99] hover:text-[#e6edf3]"
            }`}
          >
            ↓ Expense
          </button>
          <button
            type="button"
            onClick={() => handleTypeChange("income")}
            className={`py-2 text-xs font-semibold rounded-lg transition-all ${
              type === "income"
                ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm"
                : "text-[#7d8b99] hover:text-[#e6edf3]"
            }`}
          >
            ↑ Income
          </button>
          <button
            type="button"
            onClick={() => handleTypeChange("transfer")}
            className={`py-2 text-xs font-semibold rounded-lg transition-all ${
              type === "transfer"
                ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm"
                : "text-[#7d8b99] hover:text-[#e6edf3]"
            }`}
          >
            ⇄ Transfer
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-[#8c9cae] mb-1.5">
              Description / Payee
            </label>
            <input
              type="text"
              required
              placeholder={
                type === "expense"
                  ? "e.g. Whole Foods grocery run, Coffee, Electric bill"
                  : type === "income"
                  ? "e.g. October monthly salary, Freelance design payout"
                  : "e.g. Transfer to High-Yield Savings, Credit card payment"
              }
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-[#13171b] border border-[#283440] focus:border-[#f39850]/60 focus:ring-1 focus:ring-[#f39850]/20 rounded-xl px-3.5 py-2 text-xs text-[#e6edf3] placeholder-[#5f6e7e] outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-[#8c9cae] mb-1.5">
                Amount (₹ INR)
              </label>
              <input
                type="number"
                step="0.01"
                min="0.5"
                required
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full bg-[#13171b] border border-[#283440] focus:border-[#f39850]/60 focus:ring-1 focus:ring-[#f39850]/20 rounded-xl px-3.5 py-2 text-xs text-[#e6edf3] font-mono outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-[#8c9cae] mb-1.5">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-[#13171b] border border-[#283440] focus:border-[#f39850]/60 focus:ring-1 focus:ring-[#f39850]/20 rounded-xl px-3.5 py-2 text-xs text-[#e6edf3] outline-none"
              >
                {currentCategories.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-[#8c9cae] mb-1.5">
                Payment Account / Mode
              </label>
              <select
                value={account}
                onChange={(e) => setAccount(e.target.value)}
                className="w-full bg-[#13171b] border border-[#283440] focus:border-[#f39850]/60 focus:ring-1 focus:ring-[#f39850]/20 rounded-xl px-3.5 py-2 text-xs text-[#e6edf3] outline-none"
              >
                {accountOptions.map((acc) => (
                  <option key={acc} value={acc}>
                    {acc}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-[#8c9cae] mb-1.5">
                Notes (Optional)
              </label>
              <input
                type="text"
                placeholder="Tags, tax deductible, split reference..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full bg-[#13171b] border border-[#283440] focus:border-[#f39850]/60 focus:ring-1 focus:ring-[#f39850]/20 rounded-xl px-3.5 py-2 text-xs text-[#e6edf3] placeholder-[#5f6e7e] outline-none"
              />
            </div>
          </div>

          {errorMsg && (
            <p className="text-xs text-rose-400 bg-rose-500/10 p-2.5 rounded-lg border border-rose-500/20">
              {errorMsg}
            </p>
          )}

          <div className="pt-2 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-medium text-[#8c9cae] hover:text-[#e6edf3] hover:bg-[#202830] transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-[#f39850] hover:bg-[#e08942] text-[#1a1208] font-bold text-xs shadow-md transition-colors"
            >
              Save Transaction
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
