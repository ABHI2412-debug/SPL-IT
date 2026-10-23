"use client";

import React, { useState } from "react";
import { SharedExpense, SpaceSummary } from "../../../lib/types/dashboard";
import { SupabaseClient } from "@supabase/supabase-js";

interface AddExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  spaces: SpaceSummary[];
  onExpenseAdded: (expense: SharedExpense) => void;
  user: { id: string; phone?: string | null } | null;
  supabase: SupabaseClient;
  onEmailsDispatched?: (dispatchData: {
    dispatches: any[];
    spaceName: string;
    expenseDescription: string;
    totalAmount: number;
    paidBy: string;
  }) => void;
}

export function AddExpenseModal({
  isOpen,
  onClose,
  spaces,
  onExpenseAdded,
  user,
  supabase,
  onEmailsDispatched,
}: AddExpenseModalProps) {
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [selectedSpaceId, setSelectedSpaceId] = useState(spaces[0]?.id || "");
  const [paidBy, setPaidBy] = useState("You");
  const [splitWith, setSplitWith] = useState("All space members");
  const [notifyViaEmail, setNotifyViaEmail] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const targetSpace = spaces.find((s) => s.id === selectedSpaceId) || spaces[0];
  const participantCount = targetSpace ? targetSpace.membersCount : 4;
  const availableParticipants = targetSpace?.memberNames && targetSpace.memberNames.length > 0
    ? targetSpace.memberNames
    : ["You"];

  // Ensure paidBy always defaults to a valid member of the selected trip
  React.useEffect(() => {
    if (availableParticipants.length > 0 && !availableParticipants.includes(paidBy)) {
      setPaidBy(availableParticipants[0] || "You");
    }
  }, [selectedSpaceId, availableParticipants, paidBy]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = parseFloat(amount);
    if (!description.trim() || isNaN(numAmount) || numAmount <= 0) {
      setErrorMsg("Please enter a valid description and positive amount.");
      return;
    }

    setIsSubmitting(true);
    setErrorMsg("");

    const spaceMemberCount = targetSpace ? targetSpace.membersCount : 4;
    const userShare = Math.round(numAmount / Math.max(spaceMemberCount, 1));

    const newExpense: SharedExpense = {
      id: `exp-${Date.now()}`,
      description: description.trim(),
      amount: numAmount,
      currency: "₹",
      paidBy: paidBy,
      isPaidByYou: paidBy === "You",
      spaceName: targetSpace ? targetSpace.name : "Active Group",
      spaceId: targetSpace ? targetSpace.id : "space-1",
      date: "Just now",
      splitType: "equal",
      userShare: paidBy === "You" ? userShare : userShare,
    };

    // Dispatch email notifications if enabled
    if (notifyViaEmail && targetSpace) {
      const memberNames = targetSpace.memberNames || ["You", "Rahul S.", "Priya M.", "Karan V."];
      const memberEmailsMap = targetSpace.memberEmails || {};

      const recipients = memberNames
        .filter((name) => name !== paidBy)
        .map((name) => ({
          name,
          email: memberEmailsMap[name] || `${name.toLowerCase().replace(/[^a-z0-9]/g, "")}@example.com`,
          share: userShare,
        }));

      try {
        const res = await fetch("/api/send-expense-email", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            expenseDescription: description.trim(),
            totalAmount: numAmount,
            currency: "₹",
            paidBy,
            spaceName: targetSpace.name,
            recipients,
          }),
        });

        const data = await res.json();
        if (data.success && data.dispatches) {
          onEmailsDispatched?.({
            dispatches: data.dispatches,
            spaceName: targetSpace.name,
            expenseDescription: description.trim(),
            totalAmount: numAmount,
            paidBy,
          });
        }
      } catch (err) {
        console.warn("[AddExpenseModal] Email dispatch notice:", err);
      }
    }

    // If user is authenticated and this is a real DB trip, save to Supabase
    if (user && selectedSpaceId && !selectedSpaceId.startsWith("space-")) {
      try {
        const { data, error } = await supabase
          .from("expenses")
          .insert({
            trip_id: selectedSpaceId,
            paid_by: user.id,
            description: description.trim(),
            amount: numAmount,
            split_type: "equal",
          })
          .select("id")
          .single();

        if (error) {
          console.warn("Supabase expense insert note:", error.message);
        } else if (data?.id) {
          newExpense.id = data.id;
          // Also record the user's split in expense_splits
          const { error: splitError } = await supabase.from("expense_splits").insert({
            expense_id: data.id,
            user_id: user.id,
            share: userShare,
            settled: false,
          });
          if (splitError) {
            console.warn("Split insert note:", splitError.message);
          }
        }
      } catch (err) {
        console.warn("Could not insert expense to DB:", err);
      }
    }

    onExpenseAdded(newExpense);
    setIsSubmitting(false);
    onClose();
    setDescription("");
    setAmount("");
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg bg-[#12171c] border border-[#242f3a] rounded-2xl p-6 shadow-2xl relative"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between mb-5">
          <div>
            <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">
              Expense Entry
            </span>
            <h3 className="text-lg font-bold text-[#e6edf3] mt-0.5">Record Shared Expense</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-7 h-7 rounded-lg bg-[#182026] text-[#7d8b99] hover:text-[#e6edf3] flex items-center justify-center text-sm transition-colors"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-[#8c9cae] mb-1.5">
              What was this for?
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Dinner at Fort Kochi, Gas Refill, Groceries"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-[#161e25] border border-[#25303c] focus:border-emerald-500/40 focus:ring-1 focus:ring-emerald-500/20 rounded-xl px-3.5 py-2 text-xs text-[#e6edf3] placeholder-[#5f6e7e] outline-none"
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
                min="1"
                required
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full bg-[#161e25] border border-[#25303c] focus:border-emerald-500/40 focus:ring-1 focus:ring-emerald-500/20 rounded-xl px-3.5 py-2 text-xs text-[#e6edf3] font-mono outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-[#8c9cae] mb-1.5">
                Target Space / Trip
              </label>
              <select
                value={selectedSpaceId}
                onChange={(e) => setSelectedSpaceId(e.target.value)}
                className="w-full bg-[#161e25] border border-[#25303c] focus:border-emerald-500/40 focus:ring-1 focus:ring-emerald-500/20 rounded-xl px-3.5 py-2 text-xs text-[#e6edf3] outline-none"
              >
                {spaces.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-[#8c9cae] mb-1.5">
                Paid by
              </label>
              <select
                value={paidBy}
                onChange={(e) => setPaidBy(e.target.value)}
                className="w-full bg-[#161e25] border border-[#25303c] focus:border-emerald-500/40 focus:ring-1 focus:ring-emerald-500/20 rounded-xl px-3.5 py-2 text-xs text-[#e6edf3] outline-none"
              >
                {availableParticipants.map((member) => (
                  <option key={member} value={member}>
                    {member}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-[#8c9cae] mb-1.5">
                Split Type
              </label>
              <select
                value={splitWith}
                onChange={(e) => setSplitWith(e.target.value)}
                className="w-full bg-[#161e25] border border-[#25303c] focus:border-emerald-500/40 focus:ring-1 focus:ring-emerald-500/20 rounded-xl px-3.5 py-2 text-xs text-[#e6edf3] outline-none"
              >
                <option value="All space members">Split Equally with All</option>
                <option value="Exact amounts">Exact Amounts</option>
                <option value="Percentage">Percentage Split</option>
              </select>
            </div>
          </div>

          {/* Email Notification Option */}
          <div className="p-3 rounded-xl bg-[rgba(224,168,117,0.06)] border border-[rgba(224,168,117,0.2)] flex items-center justify-between cursor-pointer">
            <div className="flex items-center gap-2.5">
              <input
                id="notify-email-check"
                type="checkbox"
                checked={notifyViaEmail}
                onChange={(e) => setNotifyViaEmail(e.target.checked)}
                className="w-4 h-4 rounded text-[#e0a875] bg-[#161e25] border-[#25303c] focus:ring-0 cursor-pointer"
              />
              <label htmlFor="notify-email-check" className="text-xs text-[#e6edf3] cursor-pointer">
                <strong>Notify all {participantCount} participants via Email</strong>
                <span className="block text-[10px] text-[rgba(255,245,230,0.5)] mt-0.5">
                  Sends automated breakdown slip &amp; individual share calculation
                </span>
              </label>
            </div>
            <span className="text-base">✉️</span>
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
              className="px-4 py-2 rounded-xl text-xs font-medium text-[#8c9cae] hover:text-[#e6edf3] hover:bg-[#182026] transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-[#09110d] font-semibold text-xs shadow-md transition-colors disabled:opacity-50"
            >
              {isSubmitting ? "Saving..." : "Save Expense"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
