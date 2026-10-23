"use client";

import React, { useState } from "react";
import { SpaceSummary } from "../../../lib/types/dashboard";
import { SupabaseClient } from "@supabase/supabase-js";

interface CreateSpaceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSpaceCreated: (space: SpaceSummary) => void;
  user: { id: string; phone?: string | null } | null;
  supabase: SupabaseClient;
}

interface ParticipantEntry {
  name: string;
  email: string;
}

export function CreateSpaceModal({
  isOpen,
  onClose,
  onSpaceCreated,
  user,
  supabase,
}: CreateSpaceModalProps) {
  const [name, setName] = useState("");
  const [location, setLocation] = useState("");
  const [dates, setDates] = useState("");
  const [type, setType] = useState<"trip" | "local">("trip");
  const [memberName, setMemberName] = useState("");
  const [memberEmail, setMemberEmail] = useState("");
  const [participants, setParticipants] = useState<ParticipantEntry[]>([
    { name: "You", email: user?.phone ? `${user.phone}@split.app` : "you@split.app" },
  ]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  if (!isOpen) return null;

  const handleAddParticipant = () => {
    const trimmedName = memberName.trim();
    const trimmedEmail = memberEmail.trim();
    if (!trimmedName) return;

    if (participants.some((p) => p.name.toLowerCase() === trimmedName.toLowerCase())) {
      setErrorMsg("A participant with this name already exists.");
      return;
    }

    const email = trimmedEmail || `${trimmedName.toLowerCase().replace(/[^a-z0-9]/g, "")}@example.com`;
    setParticipants([...participants, { name: trimmedName, email }]);
    setMemberName("");
    setMemberEmail("");
    setErrorMsg("");
  };

  const handleRemoveParticipant = (pName: string) => {
    if (pName !== "You") {
      setParticipants(participants.filter((item) => item.name !== pName));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setErrorMsg("Please provide a space name.");
      return;
    }

    setIsSubmitting(true);
    setErrorMsg("");

    const memberEmailsMap: Record<string, string> = {};
    participants.forEach((p) => {
      memberEmailsMap[p.name] = p.email;
    });

    const newSpace: SpaceSummary = {
      id: `space-${Date.now()}`,
      name: name.trim(),
      type: type,
      location: location.trim() || (type === "trip" ? "Destination TBD" : "Shared House"),
      dates: dates.trim() || "Active Now",
      membersCount: participants.length,
      memberNames: participants.map((p) => p.name),
      memberEmails: memberEmailsMap,
      participants: participants,
      totalSpend: 0,
      userBalance: 0,
      balanceStatus: "settled",
      recentActivity: "Space newly initialized",
      coverUrl:
        type === "trip"
          ? "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80"
          : "https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=1200&q=80",
      status: "Active",
    };

    if (user) {
      try {
        const { data, error } = await supabase
          .from("trips")
          .insert({
            owner_id: user.id,
            name: name.trim(),
            location: location.trim(),
            cover_url: newSpace.coverUrl,
          })
          .select("id")
          .single();

        if (error) {
          console.warn("Supabase trip insert note:", error.message);
        } else if (data?.id) {
          newSpace.id = data.id;
          // Also record owner in trip_members
          const { error: memberError } = await supabase.from("trip_members").insert({
            trip_id: data.id,
            user_id: user.id,
            display_name: "You",
            role: "owner",
          });
          if (memberError) {
            console.warn("Membership note:", memberError.message);
          }
        }
      } catch (err) {
        console.warn("Could not insert trip to DB:", err);
      }
    }

    onSpaceCreated(newSpace);
    setIsSubmitting(false);
    onClose();
    setName("");
    setLocation("");
    setDates("");
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
              New Space
            </span>
            <h3 className="text-lg font-bold text-[#e6edf3] mt-0.5">
              Create Trip or Shared Circle
            </h3>
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
          <div className="flex p-0.5 rounded-xl bg-[#161e25] border border-[#242f3a]">
            <button
              type="button"
              onClick={() => setType("trip")}
              className={`flex-1 py-1.5 text-xs font-medium rounded-lg transition-all ${
                type === "trip"
                  ? "bg-[#202933] text-emerald-400 font-semibold shadow-sm"
                  : "text-[#7b8a9b] hover:text-[#e6edf3]"
              }`}
            >
              ⛺ Travel Trip / Vacation
            </button>
            <button
              type="button"
              onClick={() => setType("local")}
              className={`flex-1 py-1.5 text-xs font-medium rounded-lg transition-all ${
                type === "local"
                  ? "bg-[#202933] text-emerald-400 font-semibold shadow-sm"
                  : "text-[#7b8a9b] hover:text-[#e6edf3]"
              }`}
            >
              🏡 Home / Shared Flat
            </button>
          </div>

          <div>
            <label className="block text-xs font-medium text-[#8c9cae] mb-1.5">Space Name</label>
            <input
              type="text"
              required
              placeholder="e.g. Kerala Backwaters, Indiranagar Flat 4B, Paris Tour"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-[#161e25] border border-[#25303c] focus:border-emerald-500/40 focus:ring-1 focus:ring-emerald-500/20 rounded-xl px-3.5 py-2 text-xs text-[#e6edf3] placeholder-[#5f6e7e] outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-[#8c9cae] mb-1.5">Location</label>
              <input
                type="text"
                placeholder="e.g. Alleppey, India"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full bg-[#161e25] border border-[#25303c] focus:border-emerald-500/40 focus:ring-1 focus:ring-emerald-500/20 rounded-xl px-3.5 py-2 text-xs text-[#e6edf3] placeholder-[#5f6e7e] outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#8c9cae] mb-1.5">Dates / Schedule</label>
              <input
                type="text"
                placeholder="e.g. 15 - 20 Nov 2025"
                value={dates}
                onChange={(e) => setDates(e.target.value)}
                className="w-full bg-[#161e25] border border-[#25303c] focus:border-emerald-500/40 focus:ring-1 focus:ring-emerald-500/20 rounded-xl px-3.5 py-2 text-xs text-[#e6edf3] placeholder-[#5f6e7e] outline-none"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-medium text-[#8c9cae]">
                Participants & Email Notifications
              </label>
              <span className="text-[10px] text-[rgba(255,245,230,0.45)]">
                Emails receive automated expense breakdowns
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 mb-2">
              <input
                type="text"
                placeholder="Participant name (e.g. Priya M.)"
                value={memberName}
                onChange={(e) => setMemberName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddParticipant();
                  }
                }}
                className="sm:col-span-5 bg-[#161e25] border border-[#25303c] focus:border-emerald-500/40 focus:ring-1 focus:ring-emerald-500/20 rounded-xl px-3.5 py-2 text-xs text-[#e6edf3] placeholder-[#5f6e7e] outline-none"
              />
              <input
                type="email"
                placeholder="Email (e.g. priya@gmail.com)"
                value={memberEmail}
                onChange={(e) => setMemberEmail(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddParticipant();
                  }
                }}
                className="sm:col-span-5 bg-[#161e25] border border-[#25303c] focus:border-emerald-500/40 focus:ring-1 focus:ring-emerald-500/20 rounded-xl px-3.5 py-2 text-xs text-[#e6edf3] placeholder-[#5f6e7e] outline-none"
              />
              <button
                type="button"
                onClick={handleAddParticipant}
                className="sm:col-span-2 px-3.5 py-2 rounded-xl bg-[#e0a875] hover:bg-[#ebdcd0] text-xs font-bold text-[#12191b] transition-all shadow-md"
              >
                + Add
              </button>
            </div>

            <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
              {participants.map((person) => (
                <div
                  key={person.name}
                  className="flex items-center justify-between px-3 py-1.5 rounded-xl bg-[#161f26] border border-[#24303c] text-xs"
                >
                  <div className="flex items-center gap-2 truncate">
                    <span className="w-5 h-5 rounded-full bg-[#e0a875]/20 text-[#e0a875] flex items-center justify-center text-[10px] font-bold">
                      {person.name[0]}
                    </span>
                    <strong className="text-[#e6edf3] font-medium">{person.name}</strong>
                    <span className="text-[11px] text-[rgba(255,245,230,0.45)] truncate">
                      · {person.email}
                    </span>
                  </div>
                  {person.name !== "You" && (
                    <button
                      type="button"
                      onClick={() => handleRemoveParticipant(person.name)}
                      className="text-[#7d8b99] hover:text-rose-400 text-sm px-1"
                      title="Remove participant"
                    >
                      ×
                    </button>
                  )}
                </div>
              ))}
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
              className="px-4 py-2 rounded-xl text-xs font-medium text-[#8c9cae] hover:text-[#e6edf3] hover:bg-[#182026] transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-[#09110d] font-semibold text-xs shadow-md transition-colors disabled:opacity-50"
            >
              {isSubmitting ? "Creating..." : "Create Space"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
