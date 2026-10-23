"use client";

import React, { useState } from "react";
import { BudgetProgress } from "../../../lib/types/dashboard";

interface AddBudgetModalProps {
  isOpen: boolean;
  onClose: () => void;
  onBudgetAdded: (budget: BudgetProgress) => void;
  existingCategories?: string[];
}

const predefinedCategories = [
  { name: "Food & Groceries", icon: "🛒" },
  { name: "Dining Out & Cafes", icon: "☕" },
  { name: "Rent & Housing", icon: "🏠" },
  { name: "Transportation & Fuel", icon: "🚗" },
  { name: "Shopping & Lifestyle", icon: "🛍️" },
  { name: "Entertainment & Subs", icon: "🎬" },
  { name: "Health & Fitness", icon: "🏋️" },
  { name: "Personal Care", icon: "✨" },
  { name: "Travel & Exploration", icon: "✈️" },
  { name: "Education & Books", icon: "📚" },
];

export function AddBudgetModal({
  isOpen,
  onClose,
  onBudgetAdded,
  existingCategories = [],
}: AddBudgetModalProps) {
  const [selectedCategory, setSelectedCategory] = useState(predefinedCategories[0].name);
  const [selectedIcon, setSelectedIcon] = useState(predefinedCategories[0].icon);
  const [allocated, setAllocated] = useState("");
  const [initialSpent, setInitialSpent] = useState("0");
  const [warningThreshold, setWarningThreshold] = useState("80");
  const [errorMsg, setErrorMsg] = useState("");

  if (!isOpen) return null;

  const handleCategorySelect = (cat: { name: string; icon: string }) => {
    setSelectedCategory(cat.name);
    setSelectedIcon(cat.icon);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const numAllocated = parseFloat(allocated);
    const numSpent = parseFloat(initialSpent) || 0;

    if (!selectedCategory.trim() || isNaN(numAllocated) || numAllocated <= 0) {
      setErrorMsg("Please enter a valid category and budget allocation amount.");
      return;
    }

    const newBudget: BudgetProgress = {
      id: `bgt-${Date.now()}`,
      category: selectedCategory.trim(),
      categoryIcon: selectedIcon,
      allocated: numAllocated,
      spent: Math.max(0, numSpent),
      currency: "₹",
      warningThreshold: parseInt(warningThreshold, 10) || 80,
    };

    onBudgetAdded(newBudget);
    onClose();
    setAllocated("");
    setInitialSpent("0");
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
              Spending Control
            </span>
            <h3 className="text-lg font-bold text-[#e6edf3] mt-0.5">
              Create Category Budget
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
          {/* Category Icons Quick Selector */}
          <div>
            <label className="block text-xs font-medium text-[#8c9cae] mb-2">
              Select Category
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-40 overflow-y-auto pr-1">
              {predefinedCategories.map((cat) => {
                const isSelected = selectedCategory === cat.name;
                return (
                  <button
                    key={cat.name}
                    type="button"
                    onClick={() => handleCategorySelect(cat)}
                    className={`flex items-center gap-2 px-2.5 py-2 rounded-xl text-xs text-left border transition-all ${
                      isSelected
                        ? "bg-[#6ee7b7]/15 border-[#6ee7b7]/50 text-[#e6edf3]"
                        : "bg-[#13171b] border-[#25303c] text-[#8c9cae] hover:border-[#3d4b5a] hover:text-[#e6edf3]"
                    }`}
                  >
                    <span className="text-base">{cat.icon}</span>
                    <span className="truncate">{cat.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-[#8c9cae] mb-1.5">
                Monthly Limit (₹ INR)
              </label>
              <input
                type="number"
                step="100"
                min="100"
                required
                placeholder="e.g. 12000"
                value={allocated}
                onChange={(e) => setAllocated(e.target.value)}
                className="w-full bg-[#13171b] border border-[#283440] focus:border-[#6ee7b7]/60 focus:ring-1 focus:ring-[#6ee7b7]/20 rounded-xl px-3.5 py-2 text-xs text-[#e6edf3] font-mono outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-[#8c9cae] mb-1.5">
                Already Spent This Month (₹)
              </label>
              <input
                type="number"
                step="50"
                min="0"
                placeholder="0"
                value={initialSpent}
                onChange={(e) => setInitialSpent(e.target.value)}
                className="w-full bg-[#13171b] border border-[#283440] focus:border-[#6ee7b7]/60 focus:ring-1 focus:ring-[#6ee7b7]/20 rounded-xl px-3.5 py-2 text-xs text-[#e6edf3] font-mono outline-none"
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="text-xs font-medium text-[#8c9cae]">
                Warning Alert Threshold
              </label>
              <span className="text-xs font-mono font-semibold text-[#6ee7b7]">
                {warningThreshold}% of budget
              </span>
            </div>
            <input
              type="range"
              min="50"
              max="95"
              step="5"
              value={warningThreshold}
              onChange={(e) => setWarningThreshold(e.target.value)}
              className="w-full accent-[#6ee7b7] cursor-pointer"
            />
            <p className="text-[11px] text-[#6e7d8d] mt-1">
              You'll be alerted with a warning badge when spending crosses this percentage.
            </p>
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
              Create Budget
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
