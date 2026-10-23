"use client";

import React, { useState } from "react";
import { FinancialGoal } from "../../../lib/types/dashboard";

interface AddGoalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onGoalAdded: (goal: FinancialGoal) => void;
}

const goalCategories = [
  { name: "Travel", icon: "✈️" },
  { name: "Safety Net", icon: "🛡️" },
  { name: "Hardware", icon: "💻" },
  { name: "Education", icon: "🎓" },
  { name: "Home", icon: "🏠" },
  { name: "Investments", icon: "📈" },
];

export function AddGoalModal({
  isOpen,
  onClose,
  onGoalAdded,
}: AddGoalModalProps) {
  const [title, setTitle] = useState("");
  const [targetAmount, setTargetAmount] = useState("");
  const [currentAmount, setCurrentAmount] = useState("0");
  const [targetDate, setTargetDate] = useState("");
  const [category, setCategory] = useState(goalCategories[0].name);
  const [errorMsg, setErrorMsg] = useState("");

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const numTarget = parseFloat(targetAmount);
    const numCurrent = parseFloat(currentAmount) || 0;

    if (!title.trim() || isNaN(numTarget) || numTarget <= 0) {
      setErrorMsg("Please enter a valid goal title and target amount.");
      return;
    }

    const newGoal: FinancialGoal = {
      id: `goal-${Date.now()}`,
      title: title.trim(),
      targetAmount: numTarget,
      currentAmount: Math.max(0, numCurrent),
      currency: "₹",
      targetDate: targetDate.trim() || "Dec 2026",
      category,
    };

    onGoalAdded(newGoal);
    onClose();
    setTitle("");
    setTargetAmount("");
    setCurrentAmount("0");
    setTargetDate("");
    setErrorMsg("");
  };

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
            <span className="text-xs font-semibold text-[#6ee7b7] uppercase tracking-wider">
              Future Vision
            </span>
            <h3 className="text-lg font-bold text-[#e6edf3] mt-0.5">
              Set Financial Goal
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

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-[#8c9cae] mb-1.5">
              Goal Name / Objective
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Kyoto Cherry Blossom Trip, Emergency Fund 6mo, MacBook Pro"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-[#13171b] border border-[#283440] focus:border-[#6ee7b7]/60 focus:ring-1 focus:ring-[#6ee7b7]/20 rounded-xl px-3.5 py-2 text-xs text-[#e6edf3] placeholder-[#5f6e7e] outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-[#8c9cae] mb-1.5">
              Category
            </label>
            <div className="grid grid-cols-3 gap-2">
              {goalCategories.map((cat) => {
                const isSelected = category === cat.name;
                return (
                  <button
                    key={cat.name}
                    type="button"
                    onClick={() => setCategory(cat.name)}
                    className={`flex items-center justify-center gap-1.5 py-2 px-2 rounded-xl text-xs font-medium border transition-all ${
                      isSelected
                        ? "bg-[#6ee7b7]/15 border-[#6ee7b7]/50 text-[#6ee7b7]"
                        : "bg-[#13171b] border-[#25303c] text-[#8c9cae] hover:border-[#3d4b5a] hover:text-[#e6edf3]"
                    }`}
                  >
                    <span>{cat.icon}</span>
                    <span>{cat.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-[#8c9cae] mb-1.5">
                Target Amount (₹ INR)
              </label>
              <input
                type="number"
                step="500"
                min="500"
                required
                placeholder="e.g. 150000"
                value={targetAmount}
                onChange={(e) => setTargetAmount(e.target.value)}
                className="w-full bg-[#13171b] border border-[#283440] focus:border-[#6ee7b7]/60 focus:ring-1 focus:ring-[#6ee7b7]/20 rounded-xl px-3.5 py-2 text-xs text-[#e6edf3] font-mono outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-[#8c9cae] mb-1.5">
                Saved So Far (₹ INR)
              </label>
              <input
                type="number"
                step="500"
                min="0"
                placeholder="0"
                value={currentAmount}
                onChange={(e) => setCurrentAmount(e.target.value)}
                className="w-full bg-[#13171b] border border-[#283440] focus:border-[#6ee7b7]/60 focus:ring-1 focus:ring-[#6ee7b7]/20 rounded-xl px-3.5 py-2 text-xs text-[#e6edf3] font-mono outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-[#8c9cae] mb-1.5">
              Target Completion Horizon
            </label>
            <input
              type="text"
              placeholder="e.g. November 2026 or Q3 2027"
              value={targetDate}
              onChange={(e) => setTargetDate(e.target.value)}
              className="w-full bg-[#13171b] border border-[#283440] focus:border-[#6ee7b7]/60 focus:ring-1 focus:ring-[#6ee7b7]/20 rounded-xl px-3.5 py-2 text-xs text-[#e6edf3] placeholder-[#5f6e7e] outline-none"
            />
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
              className="px-5 py-2 rounded-xl bg-[#10b981] hover:bg-[#34d399] text-[#052e1a] font-bold text-xs shadow-md transition-colors"
            >
              Create Goal
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
