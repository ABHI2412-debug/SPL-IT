"use client";

import React, { useState } from "react";
import { MOCK_SETTLEMENTS } from "../../../lib/data/mock-data";
import { Settlement } from "../../../lib/types/dashboard";

interface TripSettlementsPageProps {
  onSettleUp: (settlementId?: string) => void;
  onExportReceipt?: () => void;
  settlements?: Settlement[];
}

export function TripSettlementsPage({
  onSettleUp,
  onExportReceipt,
  settlements: propSettlements,
}: TripSettlementsPageProps) {
  const [filter, setFilter] = useState<"all" | "pending" | "completed">("all");

  const settlements = propSettlements || MOCK_SETTLEMENTS;
  const filtered = filter === "all" ? settlements : settlements.filter((s) => s.status === filter);

  const totalPending = settlements
    .filter((s) => s.status === "pending" && s.isYouPaying)
    .reduce((sum, s) => sum + s.amount, 0);
  const totalReceivable = settlements
    .filter((s) => s.status === "pending" && s.isYouReceiving)
    .reduce((sum, s) => sum + s.amount, 0);

  return (
    <div className="space-y-6 text-[#fbf5eb]">
      {/* Header */}
      <section className="flex items-start justify-between gap-4 pt-1 animate-pop-in pop-delay-1">
        <div>
          <span className="text-[11px] font-semibold tracking-[0.26em] text-[#e0a875] uppercase block mb-1">
            Balance Resolution
          </span>
          <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight text-[#fff7ec]"
            style={{ fontFamily: "var(--font-display), Georgia, serif" }}>
            Settlements
          </h1>
          <p className="text-xs text-[rgba(255,245,230,0.65)] mt-1">
            Settle balances and clear up outstanding amounts
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
            onClick={() => onSettleUp()}
            className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-[#e0a875] text-[#1a1208] text-xs font-bold uppercase tracking-widest shadow-lg hover:bg-[#ebb98a] transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
            </svg>
            Settle Up
          </button>
        </div>
      </section>

      {/* Overview Cards */}
      <div className="grid grid-cols-2 gap-3 animate-pop-in pop-delay-2">
        <div className="rounded-2xl border border-[rgba(252,165,165,0.2)] bg-[rgba(252,165,165,0.07)] p-4 backdrop-blur-md">
          <p className="text-[10px] uppercase tracking-widest text-[rgba(252,165,165,0.65)] mb-1">You Owe</p>
          <p className="text-2xl font-semibold text-[#fca5a5]" style={{ fontFamily: "var(--font-display), serif" }}>
            ₹{totalPending.toLocaleString("en-IN")}
          </p>
          <p className="text-[10px] text-[rgba(252,165,165,0.5)] mt-0.5">Pending payment</p>
        </div>
        <div className="rounded-2xl border border-[rgba(110,231,183,0.2)] bg-[rgba(110,231,183,0.07)] p-4 backdrop-blur-md">
          <p className="text-[10px] uppercase tracking-widest text-[rgba(110,231,183,0.65)] mb-1">You're Owed</p>
          <p className="text-2xl font-semibold text-[#6ee7b7]" style={{ fontFamily: "var(--font-display), serif" }}>
            ₹{totalReceivable.toLocaleString("en-IN")}
          </p>
          <p className="text-[10px] text-[rgba(110,231,183,0.5)] mt-0.5">Awaiting payment</p>
        </div>
      </div>

      {/* Filter Pills */}
      <div className="flex gap-2 animate-pop-in pop-delay-3">
        {(["all", "pending", "completed"] as const).map((f) => (
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

      {/* Settlements List */}
      <div className="space-y-3 animate-pop-in pop-delay-4">
        {filtered.map((s) => (
          <SettlementCard key={s.id} settlement={s} onSettle={() => onSettleUp(s.id)} />
        ))}
        {filtered.length === 0 && (
          <div className="text-center py-16 text-[rgba(255,245,230,0.35)]">
            <p className="text-4xl mb-3">✅</p>
            <p className="text-sm font-medium">All clear!</p>
            <p className="text-xs mt-1">No {filter} settlements</p>
          </div>
        )}
      </div>
    </div>
  );
}

function SettlementCard({ settlement, onSettle }: { settlement: Settlement; onSettle: () => void }) {
  const isReceiving = settlement.isYouReceiving;
  const isPending = settlement.status === "pending";

  return (
    <div className="flex items-center gap-4 p-4 rounded-2xl border border-[rgba(255,248,235,0.1)] bg-[rgba(22,30,33,0.7)] hover:border-[rgba(224,168,117,0.25)] transition-all backdrop-blur-md">
      {/* Avatar */}
      <div className={`w-11 h-11 rounded-xl flex items-center justify-center text-base font-bold flex-shrink-0 ${
        isReceiving ? "bg-[rgba(110,231,183,0.12)] text-[#6ee7b7]" : "bg-[rgba(252,165,165,0.1)] text-[#fca5a5]"
      }`}>
        {isReceiving ? settlement.fromUser[0] : settlement.toUser[0]}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="text-sm font-medium text-[#fbf5eb] truncate">
            {isReceiving ? settlement.fromUser : settlement.toUser}
          </p>
          {settlement.status === "completed" && (
            <span className="text-[9px] font-bold uppercase tracking-wider text-[rgba(110,231,183,0.7)] bg-[rgba(110,231,183,0.1)] px-2 py-0.5 rounded-full border border-[rgba(110,231,183,0.2)]">
              Settled
            </span>
          )}
        </div>
        <p className="text-[10px] text-[rgba(255,245,230,0.5)] mt-0.5">
          {isReceiving ? "owes you from" : "you owe from"} {settlement.spaceName}
        </p>
        <p className="text-[10px] text-[rgba(255,245,230,0.4)] mt-0.5">{settlement.date}</p>
      </div>

      {/* Amount & Action */}
      <div className="text-right flex-shrink-0 flex flex-col items-end gap-2">
        <p className={`text-lg font-semibold ${isReceiving ? "text-[#6ee7b7]" : "text-[#fca5a5]"}`}
          style={{ fontFamily: "var(--font-display), serif" }}>
          {settlement.currency}{settlement.amount.toLocaleString("en-IN")}
        </p>
        {isPending && (
          <button
            onClick={onSettle}
            className="text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-xl transition-all border"
            style={
              isReceiving
                ? { borderColor: "rgba(110,231,183,0.35)", color: "#6ee7b7" }
                : { borderColor: "rgba(224,168,117,0.35)", color: "#e0a875" }
            }
          >
            {isReceiving ? "Remind" : "Pay Now"}
          </button>
        )}
      </div>
    </div>
  );
}
