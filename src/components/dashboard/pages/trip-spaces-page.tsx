"use client";

import React, { useState } from "react";
import { MOCK_SPACES } from "../../../lib/data/mock-data";
import { SpaceSummary } from "../../../lib/types/dashboard";
import { SpaceDetailModal } from "../modals/space-detail-modal";

interface TripSpacesPageProps {
  onCreateSpace: () => void;
  onExportReceipt?: (spaceId?: string) => void;
  userSpaces?: SpaceSummary[];
  searchQuery?: string;
  onUpdateSpace?: (space: SpaceSummary) => void;
  onDeleteSpace?: (spaceId: string) => void;
}

export function TripSpacesPage({
  onCreateSpace,
  onExportReceipt,
  userSpaces = [],
  searchQuery = "",
  onUpdateSpace,
  onDeleteSpace,
}: TripSpacesPageProps) {
  const [filter, setFilter] = useState<"all" | "active" | "settled">("all");
  const [selectedSpace, setSelectedSpace] = useState<SpaceSummary | null>(null);

  const allSpaces = userSpaces.length > 0 ? userSpaces : MOCK_SPACES.filter((s) => s.type === "trip");
  const filtered = allSpaces.filter((s) => {
    const matchFilter = filter === "all" || s.status.toLowerCase() === filter;
    const matchSearch =
      !searchQuery ||
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (s.location && s.location.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchFilter && matchSearch;
  });

  return (
    <div className="space-y-6 text-[#fbf5eb]">
      {/* Header */}
      <section className="flex items-start justify-between gap-4 pt-1 animate-pop-in pop-delay-1">
        <div>
          <span className="text-[11px] font-semibold tracking-[0.26em] text-[#e0a875] uppercase block mb-1">
            Shared Circles
          </span>
          <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight text-[#fff7ec]"
            style={{ fontFamily: "var(--font-display), Georgia, serif" }}>
            Your Spaces
          </h1>
          <p className="text-xs text-[rgba(255,245,230,0.65)] mt-1">
            {allSpaces.length} shared ledger{allSpaces.length !== 1 ? "s" : ""} across trips &amp; groups
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => onExportReceipt?.()}
            className="flex items-center gap-1.5 px-3 py-2.5 rounded-2xl border border-[rgba(255,248,235,0.15)] text-[rgba(255,245,230,0.85)] text-xs font-semibold uppercase tracking-widest hover:border-[#fcd34d]/40 hover:text-[#fcd34d] transition-all"
          >
            <span>🧾</span>
            Receipt
          </button>
          <button
            onClick={onCreateSpace}
            className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-[#e0a875] text-[#1a1208] text-xs font-bold uppercase tracking-widest shadow-lg hover:bg-[#ebb98a] transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            New Space
          </button>
        </div>
      </section>

      {/* Filter Pills */}
      <div className="flex gap-2 animate-pop-in pop-delay-2">
        {(["all", "active", "settled"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-1.5 rounded-full text-xs font-semibold uppercase tracking-widest transition-all ${
              filter === f
                ? "bg-[#e0a875]/20 text-[#e0a875] border border-[#e0a875]/40"
                : "text-[rgba(255,245,230,0.5)] border border-[rgba(255,248,235,0.1)] hover:border-[rgba(255,248,235,0.25)]"
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Spaces Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 animate-pop-in pop-delay-3">
        {filtered.map((space) => (
          <SpaceCard
            key={space.id}
            space={space}
            onClick={() => setSelectedSpace(space)}
          />
        ))}

        {/* Create New Card */}
        <button
          onClick={onCreateSpace}
          data-spotlight-id="new-space-card"
          className="flex flex-col items-center justify-center gap-3 min-h-[200px] rounded-2xl border-2 border-dashed border-[rgba(255,248,235,0.15)] text-[rgba(255,245,230,0.4)] hover:border-[#e0a875]/40 hover:text-[#e0a875]/70 transition-all group"
        >
          <div className="w-10 h-10 rounded-full border border-current flex items-center justify-center group-hover:scale-110 transition-transform">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 4v16m8-8H4" />
            </svg>
          </div>
          <span className="text-xs font-semibold uppercase tracking-widest">Start a new space</span>
        </button>
      </div>

      <SpaceDetailModal
        space={selectedSpace}
        isOpen={!!selectedSpace}
        onClose={() => setSelectedSpace(null)}
        onDeleteSpace={(id) => {
          setSelectedSpace(null);
          onDeleteSpace?.(id);
        }}
        onUpdateSpace={(updated) => {
          setSelectedSpace(updated);
          onUpdateSpace?.(updated);
        }}
      />
    </div>
  );
}

function SpaceCard({
  space,
  onClick,
}: {
  space: SpaceSummary;
  onClick: () => void;
}) {
  const isOwed = space.balanceStatus === "owed";
  const isOwe = space.balanceStatus === "owe";

  return (
    <div
      onClick={onClick}
      className="relative rounded-2xl overflow-hidden border border-[rgba(255,248,235,0.18)] bg-[rgba(25,38,44,0.60)] backdrop-blur-2xl hover:border-[rgba(224,168,117,0.5)] transition-all group cursor-pointer shadow-lg hover:shadow-2xl"
    >
      {/* Cover Image */}
      <div className="relative h-32 overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center scale-105 group-hover:scale-110 transition-transform duration-500"
          style={{ backgroundImage: `url(${space.coverUrl})`, filter: "brightness(0.65) saturate(0.9)" }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[rgba(10,14,16,0.8)]" />

        {/* Status Badge */}
        <div className="absolute top-3 left-3">
          <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
            space.status === "Active"
              ? "bg-[rgba(16,185,129,0.25)] text-[#6ee7b7] border border-[#10b981]/30"
              : space.status === "Upcoming"
              ? "bg-[rgba(245,158,11,0.2)] text-[#fcd34d] border border-[#f59e0b]/30"
              : "bg-[rgba(100,116,139,0.2)] text-[rgba(255,245,230,0.5)] border border-[rgba(255,248,235,0.15)]"
          }`}>
            {space.status}
          </span>
        </div>

        {/* Space name on cover */}
        <div className="absolute bottom-3 left-3 right-3">
          <h3 className="text-sm font-semibold text-white leading-tight"
            style={{ fontFamily: "var(--font-display), serif" }}>
            {space.name}
          </h3>
          {space.location && (
            <p className="text-[10px] text-[rgba(255,245,230,0.65)] mt-0.5">{space.location}</p>
          )}
        </div>
      </div>

      {/* Card Body */}
      <div className="p-4 space-y-3">
        {/* Members */}
        <div className="flex items-center gap-2">
          <div className="flex -space-x-1.5">
            {space.memberNames.slice(0, 4).map((name, i) => (
              <div
                key={i}
                className="w-6 h-6 rounded-full border border-[rgba(22,30,33,1)] flex items-center justify-center text-[9px] font-bold"
                style={{ background: `hsl(${(i * 60 + 150) % 360}, 45%, 38%)`, color: "#fff" }}
              >
                {name[0]}
              </div>
            ))}
          </div>
          <span className="text-[10px] text-[rgba(255,245,230,0.55)]">
            {space.membersCount} member{space.membersCount !== 1 ? "s" : ""}
          </span>
          {space.dates && (
            <span className="ml-auto text-[10px] text-[rgba(255,245,230,0.4)]">{space.dates}</span>
          )}
        </div>

        {/* Spend & Balance */}
        <div className="flex items-end justify-between pt-1 border-t border-[rgba(255,248,235,0.08)]">
          <div>
            <p className="text-[10px] text-[rgba(255,245,230,0.45)] uppercase tracking-wider mb-0.5">Total Spend</p>
            <p className="text-base font-semibold" style={{ fontFamily: "var(--font-display), serif" }}>
              ₹{space.totalSpend.toLocaleString("en-IN")}
            </p>
          </div>
          {space.balanceStatus !== "settled" && (
            <div className="text-right">
              <p className="text-[10px] uppercase tracking-wider mb-0.5"
                style={{ color: isOwed ? "rgba(110,231,183,0.7)" : "rgba(252,165,165,0.7)" }}>
                {isOwed ? "You're owed" : "You owe"}
              </p>
              <p className={`text-base font-semibold ${isOwed ? "text-[#6ee7b7]" : "text-[#fca5a5]"}`}
                style={{ fontFamily: "var(--font-display), serif" }}>
                ₹{space.userBalance.toLocaleString("en-IN")}
              </p>
            </div>
          )}
          {space.balanceStatus === "settled" && (
            <span className="text-[10px] font-bold text-[rgba(255,245,230,0.4)] uppercase tracking-widest">All Settled</span>
          )}
        </div>
      </div>
    </div>
  );
}
