"use client";

import React, { useState } from "react";
import { SpaceSummary } from "../../../lib/types/dashboard";

interface SpaceDetailModalProps {
  space: SpaceSummary | null;
  isOpen: boolean;
  onClose: () => void;
  onAddExpenseToSpace?: (space: SpaceSummary) => void;
  onInviteMember?: (spaceId: string, memberName: string, memberEmail?: string) => void;
  onUpdateSpace?: (updatedSpace: SpaceSummary) => void;
  onDeleteSpace?: (spaceId: string) => void;
}

export function SpaceDetailModal({
  space,
  isOpen,
  onClose,
  onAddExpenseToSpace,
  onInviteMember,
  onUpdateSpace,
  onDeleteSpace,
}: SpaceDetailModalProps) {
  const [newMemberName, setNewMemberName] = useState("");
  const [newMemberEmail, setNewMemberEmail] = useState("");
  const [copiedLink, setCopiedLink] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  if (!isOpen || !space) return null;

  const handleCopyInvite = () => {
    const inviteUrl = `${typeof window !== "undefined" ? window.location.origin : ""}/join/${space.id}`;
    if (navigator?.clipboard) {
      navigator.clipboard.writeText(inviteUrl);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    }
  };

  const handleAddMember = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedName = newMemberName.trim();
    if (!trimmedName) return;

    if (space.memberNames.some((n) => n.toLowerCase() === trimmedName.toLowerCase())) {
      setFeedback("A member with this name is already in the trip.");
      setTimeout(() => setFeedback(null), 3000);
      return;
    }

    const trimmedEmail = newMemberEmail.trim();
    const finalEmail = trimmedEmail || `${trimmedName.toLowerCase().replace(/[^a-z0-9]/g, "")}@example.com`;

    const updatedEmails: Record<string, string> = {
      ...(space.memberEmails || {}),
      [trimmedName]: finalEmail,
    };

    const updatedParticipants = [
      ...(space.participants || space.memberNames.map((n) => ({
        name: n,
        email: space.memberEmails?.[n] || `${n.toLowerCase().replace(/[^a-z0-9]/g, "")}@example.com`,
      }))),
      { name: trimmedName, email: finalEmail },
    ];

    const updatedSpace: SpaceSummary = {
      ...space,
      membersCount: space.membersCount + 1,
      memberNames: [...space.memberNames, trimmedName],
      memberEmails: updatedEmails,
      participants: updatedParticipants,
      recentActivity: `Added ${trimmedName} (${finalEmail}) to circle`,
    };

    onUpdateSpace?.(updatedSpace);
    onInviteMember?.(space.id, trimmedName, finalEmail);

    setNewMemberName("");
    setNewMemberEmail("");
    setFeedback(`✓ Added ${trimmedName} with email notification!`);
    setTimeout(() => setFeedback(null), 3500);
  };

  const isOwed = space.balanceStatus === "owed";

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg bg-[#181d22] border border-[#2d3844] rounded-2xl overflow-hidden shadow-2xl relative text-[#fbf5eb]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Cover Header */}
        <div className="relative h-44 overflow-hidden">
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{
              backgroundImage: `url(${space.coverUrl})`,
              filter: "brightness(0.65) saturate(0.95)",
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#181d22] via-transparent to-black/40" />

          {/* Close button */}
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-black/60 text-[#e6edf3] hover:bg-black/90 flex items-center justify-center text-sm backdrop-blur-md transition-colors z-10"
          >
            ✕
          </button>

          {/* Space Info Overlay */}
          <div className="absolute bottom-4 left-5 right-5">
            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              {space.status}
            </span>
            <h2
              className="text-2xl font-bold text-white mt-1.5 leading-tight"
              style={{ fontFamily: "var(--font-display), Georgia, serif" }}
            >
              {space.name}
            </h2>
            <div className="flex items-center gap-2 text-xs text-[rgba(255,245,230,0.7)] mt-0.5">
              <span>📍 {space.location || "Trip Location"}</span>
              {space.dates && (
                <>
                  <span>·</span>
                  <span>🗓️ {space.dates}</span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-5">
          {/* Key Figures Strip */}
          <div className="grid grid-cols-2 gap-3 p-3.5 rounded-xl bg-[#12161a] border border-[#252f3a]">
            <div>
              <span className="text-[10px] uppercase tracking-wider text-[#8c9cae] block">
                Total Group Spend
              </span>
              <p
                className="text-xl font-bold text-[#fff7ec] mt-0.5"
                style={{ fontFamily: "var(--font-display), serif" }}
              >
                ₹{space.totalSpend.toLocaleString("en-IN")}
              </p>
            </div>
            <div>
              <span className="text-[10px] uppercase tracking-wider text-[#8c9cae] block">
                Your Status
              </span>
              <p
                className={`text-xl font-bold mt-0.5 ${
                  space.balanceStatus === "settled"
                    ? "text-[#8c9cae]"
                    : isOwed
                    ? "text-[#6ee7b7]"
                    : "text-[#fca5a5]"
                }`}
                style={{ fontFamily: "var(--font-display), serif" }}
              >
                {space.balanceStatus === "settled"
                  ? "All Settled"
                  : isOwed
                  ? `+₹${space.userBalance.toLocaleString("en-IN")} (owed)`
                  : `-₹${space.userBalance.toLocaleString("en-IN")} (owe)`}
              </p>
            </div>
          </div>

          {/* Members List with Emails */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-[#8c9cae] uppercase tracking-wider">
                Circle Members &amp; Emails ({space.memberNames.length})
              </span>
              <button
                type="button"
                onClick={handleCopyInvite}
                className="text-xs font-medium text-[#e0a875] hover:underline flex items-center gap-1"
              >
                {copiedLink ? "✓ Invite Copied!" : "📋 Copy Invite Link"}
              </button>
            </div>

            {/* List of members and their emails */}
            <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
              {space.memberNames.map((name, i) => {
                const email =
                  space.memberEmails?.[name] ||
                  space.participants?.find((p) => p.name === name)?.email;

                return (
                  <div
                    key={i}
                    className="flex items-center justify-between px-3 py-1.5 rounded-xl bg-[#13171b] border border-[#283440] text-xs text-[#e6edf3]"
                  >
                    <div className="flex items-center gap-2 truncate">
                      <span
                        className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold text-white shrink-0"
                        style={{ background: `hsl(${(i * 60 + 150) % 360}, 45%, 38%)` }}
                      >
                        {name[0]}
                      </span>
                      <strong className="font-medium text-[#fff7ec]">{name}</strong>
                      {email && (
                        <span className="text-[11px] text-[rgba(255,245,230,0.55)] font-mono truncate">
                          · ✉️ {email}
                        </span>
                      )}
                    </div>
                    {email ? (
                      <span className="text-[10px] font-semibold text-emerald-400 bg-emerald-500/15 border border-emerald-500/30 px-1.5 py-0.5 rounded-full shrink-0">
                        Notified
                      </span>
                    ) : (
                      <span className="text-[10px] text-[rgba(255,245,230,0.35)] shrink-0">
                        No email
                      </span>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Add Member with Email Form */}
            <form onSubmit={handleAddMember} className="mt-3.5 space-y-2">
              <span className="text-[11px] font-semibold text-[#e0a875] block">
                + Add Participant to this Trip:
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-2">
                <input
                  type="text"
                  placeholder="Name (e.g. Ananya)"
                  value={newMemberName}
                  onChange={(e) => setNewMemberName(e.target.value)}
                  className="sm:col-span-5 bg-[#13171b] border border-[#283440] focus:border-[#e0a875]/60 rounded-xl px-3 py-2 text-xs text-[#e6edf3] placeholder-[#5f6e7e] outline-none"
                />
                <input
                  type="email"
                  placeholder="Email (e.g. ananya@gmail.com)"
                  value={newMemberEmail}
                  onChange={(e) => setNewMemberEmail(e.target.value)}
                  className="sm:col-span-5 bg-[#13171b] border border-[#283440] focus:border-[#e0a875]/60 rounded-xl px-3 py-2 text-xs text-[#e6edf3] placeholder-[#5f6e7e] outline-none"
                />
                <button
                  type="submit"
                  disabled={!newMemberName.trim()}
                  className="sm:col-span-2 px-3 py-2 rounded-xl bg-[#e0a875] hover:bg-[#ebd9cb] text-xs font-bold text-[#12191b] transition-all disabled:opacity-40 shadow-sm"
                >
                  + Add
                </button>
              </div>
            </form>

            {feedback && (
              <p className="mt-2 text-xs text-emerald-400 bg-emerald-500/10 border border-emerald-500/25 px-2.5 py-1.5 rounded-lg animate-in fade-in">
                {feedback}
              </p>
            )}
          </div>

          {/* Action Footer */}
          <div className="pt-3 border-t border-[#232c35] flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              {onDeleteSpace && (
                <button
                  type="button"
                  onClick={() => {
                    if (window.confirm(`Are you sure you want to delete "${space.name}"? All associated group expenses will be removed.`)) {
                      onDeleteSpace(space.id);
                      onClose();
                    }
                  }}
                  className="px-3 py-1.5 rounded-xl border border-rose-500/30 text-rose-400 hover:bg-rose-500/10 text-xs font-semibold transition-colors flex items-center gap-1.5"
                  title="Delete this travel circle"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  Delete Space
                </button>
              )}
              <span className="text-[11px] text-[#6e7d8d] truncate max-w-[150px] hidden sm:inline">
                {space.recentActivity}
              </span>
            </div>
            <button
              type="button"
              onClick={() => {
                onClose();
                onAddExpenseToSpace?.(space);
              }}
              className="px-4 py-2 rounded-xl bg-[#e0a875] hover:bg-[#ebb98a] text-[#1a1208] text-xs font-bold uppercase tracking-wider shadow-md transition-colors"
            >
              + Add Expense to {space.name}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
