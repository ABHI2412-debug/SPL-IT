"use client";

import React from "react";

export interface DispatchedEmailRecord {
  recipientName: string;
  email: string;
  share: number;
  subject: string;
  htmlBody: string;
  status: string;
  timestamp: string;
}

interface EmailNotificationPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  dispatches: DispatchedEmailRecord[];
  spaceName: string;
  expenseDescription: string;
  totalAmount: number;
  paidBy: string;
}

export function EmailNotificationPreviewModal({
  isOpen,
  onClose,
  dispatches,
  spaceName,
  expenseDescription,
  totalAmount,
  paidBy,
}: EmailNotificationPreviewModalProps) {
  const [selectedRecipientIndex, setSelectedRecipientIndex] = React.useState(0);

  if (!isOpen || dispatches.length === 0) return null;

  const currentEmail = dispatches[selectedRecipientIndex] || dispatches[0];

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl bg-[#141b1f] border border-[rgba(255,248,235,0.18)] rounded-3xl p-6 shadow-2xl relative flex flex-col max-h-[90vh] overflow-hidden"
        style={{
          boxShadow: "0 25px 70px rgba(0, 0, 0, 0.6), inset 0 1px 0 rgba(255, 255, 255, 0.12)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-[rgba(255,248,235,0.1)]">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#6ee7b7] animate-pulse" />
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#6ee7b7]">
                Live Dispatch Center
              </span>
              <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-[#6ee7b7]/15 text-[#6ee7b7] border border-[#6ee7b7]/30">
                {dispatches.length} Delivered
              </span>
            </div>
            <h3
              className="text-xl sm:text-2xl font-semibold text-[#fff7ec] tracking-tight mt-1"
              style={{ fontFamily: "var(--font-display), Georgia, serif" }}
            >
              Participant Email Notifications
            </h3>
            <p className="text-xs text-[rgba(255,245,230,0.55)] mt-0.5">
              Expense &quot;{expenseDescription}&quot; (₹{totalAmount.toLocaleString("en-IN")}) by {paidBy} sent to {spaceName} members
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[rgba(255,248,235,0.06)] hover:bg-[rgba(255,248,235,0.14)] text-[rgba(255,245,230,0.6)] hover:text-white flex items-center justify-center text-sm transition-all"
          >
            ✕
          </button>
        </div>

        {/* Content Body: Left Recipient List & Right Email Template Preview */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 my-4 flex-1 overflow-hidden min-h-[360px]">
          {/* Recipient Picker */}
          <div className="md:col-span-5 space-y-2 overflow-y-auto pr-1">
            <span className="text-[10px] uppercase tracking-wider text-[rgba(255,245,230,0.45)] font-semibold block mb-1">
              Delivered Inboxes
            </span>
            {dispatches.map((d, idx) => {
              const isSelected = selectedRecipientIndex === idx;
              return (
                <button
                  key={d.email}
                  type="button"
                  onClick={() => setSelectedRecipientIndex(idx)}
                  className={`w-full text-left p-3 rounded-2xl border transition-all ${
                    isSelected
                      ? "bg-[#253236] border-[#e0a875]/50 shadow-md scale-[1.01]"
                      : "bg-[rgba(255,248,235,0.03)] border-[rgba(255,248,235,0.08)] hover:bg-[rgba(255,248,235,0.06)]"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <strong className="text-xs font-semibold text-[#fff7ec] truncate">
                      {d.recipientName}
                    </strong>
                    <span className="text-[9px] font-mono text-[#6ee7b7] font-bold">
                      ₹{d.share.toLocaleString("en-IN")}
                    </span>
                  </div>
                  <p className="text-[11px] text-[rgba(255,245,230,0.5)] truncate font-mono">
                    {d.email}
                  </p>
                  <div className="flex items-center gap-1.5 mt-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#6ee7b7]" />
                    <span className="text-[9px] uppercase tracking-wider text-[#6ee7b7] font-semibold">
                      SMTP 250 OK
                    </span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Email Preview Frame */}
          <div className="md:col-span-7 bg-[#0b1012] border border-[rgba(255,248,235,0.12)] rounded-2xl p-4 flex flex-col overflow-y-auto">
            <div className="border-b border-[rgba(255,248,235,0.08)] pb-2 mb-3 text-[11px] space-y-1">
              <div>
                <span className="text-[rgba(255,245,230,0.45)]">To: </span>
                <span className="font-mono text-[#e0a875]">{currentEmail.recipientName} &lt;{currentEmail.email}&gt;</span>
              </div>
              <div>
                <span className="text-[rgba(255,245,230,0.45)]">Subject: </span>
                <span className="text-[#fff5e7] font-medium">{currentEmail.subject}</span>
              </div>
            </div>

            {/* Email Rendered Body */}
            <div
              className="flex-1 overflow-y-auto rounded-xl p-2 bg-[#090d0f]"
              dangerouslySetInnerHTML={{ __html: currentEmail.htmlBody }}
            />
          </div>
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-[rgba(255,248,235,0.1)] flex items-center justify-between text-xs text-[rgba(255,245,230,0.5)]">
          <span>✨ Dispatched via automated background queue</span>
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-[#e0a875] hover:bg-[#ebdcd0] text-[#12191b] font-bold text-xs shadow-md transition-all"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
