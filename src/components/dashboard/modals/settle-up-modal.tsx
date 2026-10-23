"use client";

import React, { useState, useEffect } from "react";
import QRCode from "qrcode";
import { Settlement } from "../../../lib/types/dashboard";
import {
  buildUpiUri,
  getUpiAppLinks,
  getMemberVpa,
  buildWhatsAppShareUrl,
  UpiPaymentDetails,
} from "../../../lib/upi/upi-service";

interface SettleUpModalProps {
  isOpen: boolean;
  onClose: () => void;
  settlements: Settlement[];
  onSettled: (settlementId: string) => void;
  initialSettlementId?: string;
}

export function SettleUpModal({
  isOpen,
  onClose,
  settlements,
  onSettled,
  initialSettlementId,
}: SettleUpModalProps) {
  const [selectedSettlementId, setSelectedSettlementId] = useState(
    initialSettlementId || settlements.find((s) => s.status === "pending")?.id || ""
  );

  const [paymentMode, setPaymentMode] = useState<"upi" | "cash" | "bank">("upi");
  const [customVpa, setCustomVpa] = useState<string>("");
  const [qrDataUrl, setQrDataUrl] = useState<string>("");
  const [copiedText, setCopiedText] = useState<string | null>(null);
  const [notes, setNotes] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);
  const [isEditingVpa, setIsEditingVpa] = useState(false);

  useEffect(() => {
    if (initialSettlementId) {
      setSelectedSettlementId(initialSettlementId);
    } else if (!selectedSettlementId && settlements.length > 0) {
      const pending = settlements.find((s) => s.status === "pending") || settlements[0];
      setSelectedSettlementId(pending.id);
    }
  }, [initialSettlementId, isOpen, settlements, selectedSettlementId]);

  const currentSettlement = settlements.find((s) => s.id === selectedSettlementId);

  // Determine payee name and VPA
  const isPaying = currentSettlement?.isYouPaying;
  const payeeName = isPaying ? currentSettlement?.toUser || "Recipient" : "You (Sourabh Patil)";
  const debtorName = isPaying ? "You" : currentSettlement?.fromUser || "Member";
  const defaultVpa = getMemberVpa(payeeName);
  const activeVpa = customVpa || defaultVpa;

  // Build UPI URI & generate live QR Code
  useEffect(() => {
    if (!currentSettlement) return;

    const details: UpiPaymentDetails = {
      payeeVpa: activeVpa,
      payeeName: payeeName,
      amount: currentSettlement.amount,
      transactionNote: `Settlement for ${currentSettlement.spaceName}`,
      referenceId: `SPLIT-${currentSettlement.id.slice(0, 8)}`,
    };

    const upiUri = buildUpiUri(details);

    QRCode.toDataURL(upiUri, {
      width: 280,
      margin: 1,
      color: {
        dark: "#141d20",
        light: "#ffffff",
      },
      errorCorrectionLevel: "M",
    })
      .then((url) => setQrDataUrl(url))
      .catch((err) => {
        console.warn("[UPI QR] Failed generating canvas QR, using fallback:", err);
        setQrDataUrl(getUpiAppLinks(details).webFallbackQr);
      });
  }, [currentSettlement, activeVpa, payeeName]);

  if (!isOpen) return null;

  const upiDetails: UpiPaymentDetails = currentSettlement
    ? {
        payeeVpa: activeVpa,
        payeeName: payeeName,
        amount: currentSettlement.amount,
        transactionNote: `Settlement for ${currentSettlement.spaceName}`,
        referenceId: `SPLIT-${currentSettlement.id.slice(0, 8)}`,
      }
    : { payeeVpa: activeVpa, payeeName: "SPLit", amount: 0 };

  const appLinks = getUpiAppLinks(upiDetails);
  const upiUri = buildUpiUri(upiDetails);

  const handleCopy = (text: string, label: string) => {
    if (navigator?.clipboard) {
      navigator.clipboard.writeText(text);
      setCopiedText(label);
      setTimeout(() => setCopiedText(null), 2500);
    }
  };

  const handleConfirmSettle = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSettlementId) return;

    onSettled(selectedSettlementId);
    setIsSuccess(true);
    setTimeout(() => {
      setIsSuccess(false);
      onClose();
    }, 1200);
  };

  const whatsappUrl = currentSettlement
    ? buildWhatsAppShareUrl(
        debtorName,
        payeeName,
        currentSettlement.amount,
        activeVpa,
        currentSettlement.spaceName
      )
    : "";

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg bg-[#141f23] border border-[rgba(235,248,246,0.18)] rounded-3xl p-5 sm:p-6 shadow-2xl relative text-[#fbf5eb] max-h-[92vh] overflow-y-auto"
        style={{
          boxShadow: "0 24px 60px rgba(0, 0, 0, 0.6), inset 0 1px 0 rgba(255, 255, 255, 0.12)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-[rgba(235,248,246,0.1)]">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#dda071]" />
              <span className="text-[10px] font-bold text-[#dda071] uppercase tracking-[0.22em]">
                Instant UPI Settlement
              </span>
            </div>
            <h3
              className="text-xl font-semibold text-[#fff7ec] mt-1 tracking-tight"
              style={{ fontFamily: "var(--font-display), Georgia, serif" }}
            >
              {isPaying ? `Pay ${payeeName}` : `Request from ${debtorName}`}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[rgba(255,248,235,0.06)] hover:bg-[rgba(255,248,235,0.12)] text-[rgba(255,245,230,0.7)] flex items-center justify-center text-sm transition-colors border border-[rgba(255,248,235,0.12)]"
          >
            ✕
          </button>
        </div>

        {isSuccess ? (
          <div className="py-12 text-center space-y-3 animate-in zoom-in-95 duration-200">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 text-3xl flex items-center justify-center mx-auto border border-emerald-500/40 shadow-lg shadow-emerald-500/20">
              ✓
            </div>
            <p
              className="text-lg font-bold text-[#fff7ec]"
              style={{ fontFamily: "var(--font-display), Georgia, serif" }}
            >
              Settlement Verified &amp; Saved!
            </p>
            <p className="text-xs text-[rgba(255,245,230,0.65)] max-w-xs mx-auto">
              The balance has been settled in the database and updated across all shared spaces.
            </p>
          </div>
        ) : (
          <form onSubmit={handleConfirmSettle} className="space-y-4 pt-4">
            {/* Settlement Picker */}
            <div>
              <label className="block text-[11px] font-semibold text-[rgba(255,245,230,0.7)] uppercase tracking-wider mb-1.5">
                Select Active Settlement
              </label>
              <select
                value={selectedSettlementId}
                onChange={(e) => {
                  setSelectedSettlementId(e.target.value);
                  setCustomVpa("");
                }}
                className="w-full bg-[rgba(255,248,235,0.05)] border border-[rgba(255,248,235,0.14)] focus:border-[#dda071]/60 rounded-xl px-3.5 py-2.5 text-xs text-[#fff7ec] outline-none"
              >
                {settlements.filter((s) => s.status === "pending").length > 0 && (
                  <optgroup label="Pending Debts & Requests" className="bg-[#141f23] text-[#e0a875] font-semibold">
                    {settlements
                      .filter((s) => s.status === "pending")
                      .map((s) => (
                        <option key={s.id} value={s.id} className="bg-[#141f23] text-white font-normal">
                          {s.isYouPaying ? `You owe ${s.toUser}` : `${s.fromUser} owes you`} (₹
                          {s.amount.toLocaleString("en-IN")}) — {s.spaceName} [pending]
                        </option>
                      ))}
                  </optgroup>
                )}
                {settlements.filter((s) => s.status === "completed").length > 0 && (
                  <optgroup label="Settled History" className="bg-[#141f23] text-[rgba(255,245,230,0.4)]">
                    {settlements
                      .filter((s) => s.status === "completed")
                      .map((s) => (
                        <option key={s.id} value={s.id} className="bg-[#141f23] text-[rgba(255,245,230,0.6)] font-normal">
                          {s.isYouPaying ? `You owed ${s.toUser}` : `${s.fromUser} paid you`} (₹
                          {s.amount.toLocaleString("en-IN")}) — {s.spaceName} [settled]
                        </option>
                      ))}
                  </optgroup>
                )}
              </select>
            </div>

            {/* Amount Banner Card */}
            {currentSettlement && (
              <div className="p-4 rounded-2xl bg-[rgba(25,38,44,0.75)] border border-[rgba(235,248,246,0.18)] flex items-center justify-between shadow-inner">
                <div>
                  <span className="text-[10px] uppercase tracking-[0.18em] text-[rgba(255,245,230,0.6)] block">
                    {isPaying ? "Amount to Pay" : "Amount to Receive"}
                  </span>
                  <strong
                    className={`text-2xl sm:text-3xl font-semibold tracking-tight ${
                      isPaying ? "text-[#db9b83]" : "text-[#9cc79d]"
                    }`}
                    style={{ fontFamily: "var(--font-display), Georgia, serif" }}
                  >
                    ₹{currentSettlement.amount.toLocaleString("en-IN")}
                  </strong>
                </div>
                <div className="text-right">
                  <span className="text-[11px] text-[#dda071] font-semibold block">
                    {currentSettlement.spaceName}
                  </span>
                  <span className="text-[10px] text-[rgba(255,245,230,0.5)]">
                    Status: <strong className="capitalize">{currentSettlement.status}</strong>
                  </span>
                </div>
              </div>
            )}

            {/* Payment Mode Selector Pills */}
            <div className="flex gap-2 p-1 rounded-xl bg-[rgba(255,248,235,0.04)] border border-[rgba(255,248,235,0.1)]">
              <button
                type="button"
                onClick={() => setPaymentMode("upi")}
                className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-1.5 ${
                  paymentMode === "upi"
                    ? "bg-[#dda071] text-[#1a1208] shadow-sm font-bold"
                    : "text-[rgba(255,245,230,0.6)] hover:text-white"
                }`}
              >
                <span>⚡</span> UPI / QR Code
              </button>
              <button
                type="button"
                onClick={() => setPaymentMode("cash")}
                className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-1.5 ${
                  paymentMode === "cash"
                    ? "bg-[#dda071] text-[#1a1208] shadow-sm font-bold"
                    : "text-[rgba(255,245,230,0.6)] hover:text-white"
                }`}
              >
                <span>💵</span> Cash Handover
              </button>
              <button
                type="button"
                onClick={() => setPaymentMode("bank")}
                className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-1.5 ${
                  paymentMode === "bank"
                    ? "bg-[#dda071] text-[#1a1208] shadow-sm font-bold"
                    : "text-[rgba(255,245,230,0.6)] hover:text-white"
                }`}
              >
                <span>🏦</span> Bank Transfer
              </button>
            </div>

            {/* UPI Section */}
            {paymentMode === "upi" && (
              <div className="space-y-4 pt-1">
                {/* Payee VPA Header & Edit */}
                <div className="p-3 rounded-xl bg-[rgba(255,248,235,0.04)] border border-[rgba(255,248,235,0.08)] flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <span className="text-[10px] text-[rgba(255,245,230,0.55)] uppercase tracking-wider block">
                      Payee UPI ID (VPA)
                    </span>
                    {isEditingVpa ? (
                      <input
                        type="text"
                        value={customVpa}
                        placeholder={defaultVpa}
                        onChange={(e) => setCustomVpa(e.target.value)}
                        className="bg-black/40 border border-[#dda071]/50 rounded-lg px-2 py-1 text-xs text-white outline-none w-full mt-1 font-mono"
                      />
                    ) : (
                      <span
                        className="text-xs font-mono font-bold text-[#e0a875] truncate block mt-0.5"
                        title={activeVpa}
                      >
                        {activeVpa}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button
                      type="button"
                      onClick={() => setIsEditingVpa(!isEditingVpa)}
                      className="text-[10px] text-[rgba(255,245,230,0.6)] hover:text-white underline"
                    >
                      {isEditingVpa ? "Done" : "Edit"}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleCopy(activeVpa, "vpa")}
                      className="px-2.5 py-1 rounded-lg bg-[rgba(255,248,235,0.08)] hover:bg-[rgba(255,248,235,0.14)] text-xs text-[#fff7ec] transition-colors border border-[rgba(255,248,235,0.12)]"
                    >
                      {copiedText === "vpa" ? "✓ Copied!" : "Copy ID"}
                    </button>
                  </div>
                </div>

                {/* Live QR Code Display */}
                <div className="flex flex-col items-center justify-center p-4 rounded-2xl bg-[#0e1619] border border-[rgba(235,248,246,0.14)] shadow-xl relative overflow-hidden group">
                  <div className="absolute top-2 left-3 flex items-center gap-1.5 text-[9px] uppercase tracking-widest text-[#dda071] font-semibold">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#dda071]" />
                    <span>Scan with GPay / PhonePe / Paytm</span>
                  </div>

                  <div className="mt-5 p-3 rounded-2xl bg-white shadow-2xl relative">
                    {qrDataUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={qrDataUrl}
                        alt="UPI Payment QR Code"
                        className="w-48 h-48 sm:w-52 sm:h-52 object-contain"
                      />
                    ) : (
                      <div className="w-48 h-48 flex items-center justify-center text-xs text-black">
                        Generating QR...
                      </div>
                    )}
                    {/* Badge Overlay */}
                    <div className="absolute -bottom-2.5 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-[#1a2528] border border-[#dda071] text-[#e0a875] text-[10px] font-bold shadow-md whitespace-nowrap">
                      ₹{currentSettlement ? currentSettlement.amount.toLocaleString("en-IN") : "0"}
                    </div>
                  </div>

                  <p className="text-[11px] text-[rgba(255,245,230,0.55)] mt-4 text-center">
                    Pre-filled with exact amount and reference note
                  </p>
                </div>

                {/* One-Tap UPI App Deep Links */}
                <div>
                  <span className="text-[10px] font-semibold text-[rgba(255,245,230,0.55)] uppercase tracking-wider block mb-2">
                    One-Tap App Launch (Mobile)
                  </span>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    <a
                      href={appLinks.gpay}
                      className="px-2.5 py-2 rounded-xl bg-[rgba(255,248,235,0.06)] hover:bg-[rgba(255,248,235,0.12)] border border-[rgba(255,248,235,0.12)] text-xs text-center font-medium text-white transition-all hover:scale-[1.02] flex items-center justify-center gap-1.5"
                    >
                      <span className="text-sm">🇬</span> Google Pay
                    </a>
                    <a
                      href={appLinks.phonepe}
                      className="px-2.5 py-2 rounded-xl bg-[rgba(255,248,235,0.06)] hover:bg-[rgba(255,248,235,0.12)] border border-[rgba(255,248,235,0.12)] text-xs text-center font-medium text-white transition-all hover:scale-[1.02] flex items-center justify-center gap-1.5"
                    >
                      <span className="text-sm">🟣</span> PhonePe
                    </a>
                    <a
                      href={appLinks.paytm}
                      className="px-2.5 py-2 rounded-xl bg-[rgba(255,248,235,0.06)] hover:bg-[rgba(255,248,235,0.12)] border border-[rgba(255,248,235,0.12)] text-xs text-center font-medium text-white transition-all hover:scale-[1.02] flex items-center justify-center gap-1.5"
                    >
                      <span className="text-sm">🔵</span> Paytm
                    </a>
                    <a
                      href={appLinks.generic}
                      className="px-2.5 py-2 rounded-xl bg-[rgba(255,248,235,0.06)] hover:bg-[rgba(255,248,235,0.12)] border border-[rgba(255,248,235,0.12)] text-xs text-center font-medium text-white transition-all hover:scale-[1.02] flex items-center justify-center gap-1.5"
                    >
                      <span className="text-sm">⚡</span> Other UPI
                    </a>
                  </div>
                </div>

                {/* WhatsApp Payment Request Sharing */}
                <div className="pt-1 flex flex-wrap items-center gap-2">
                  <a
                    href={whatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 min-w-[180px] py-2 px-3 rounded-xl bg-[#25D366]/20 hover:bg-[#25D366]/30 border border-[#25D366]/40 text-[#25D366] text-xs font-semibold flex items-center justify-center gap-2 transition-all shadow-sm"
                  >
                    <span>💬</span>
                    <span>Send WhatsApp Request</span>
                  </a>

                  <button
                    type="button"
                    onClick={() => handleCopy(upiUri, "link")}
                    className="py-2 px-3 rounded-xl bg-[rgba(255,248,235,0.08)] hover:bg-[rgba(255,248,235,0.14)] text-xs text-[#fff7ec] transition-colors border border-[rgba(255,248,235,0.14)]"
                  >
                    {copiedText === "link" ? "✓ Copied Link!" : "Copy UPI Link"}
                  </button>
                </div>
              </div>
            )}

            {/* Cash Mode Details */}
            {paymentMode === "cash" && (
              <div className="p-4 rounded-2xl bg-[rgba(255,248,235,0.04)] border border-[rgba(255,248,235,0.08)] space-y-2 text-xs">
                <p className="font-semibold text-[#fff7ec]">💵 Cash Settlement Handover</p>
                <p className="text-[rgba(255,245,230,0.65)] leading-relaxed">
                  Hand over physical cash of{" "}
                  <strong className="text-white">
                    ₹{currentSettlement ? currentSettlement.amount.toLocaleString("en-IN") : "0"}
                  </strong>{" "}
                  directly to {payeeName}. Once handed over, click below to log the settlement.
                </p>
              </div>
            )}

            {/* Bank Transfer Details */}
            {paymentMode === "bank" && (
              <div className="p-4 rounded-2xl bg-[rgba(255,248,235,0.04)] border border-[rgba(255,248,235,0.08)] space-y-2 text-xs font-mono">
                <p className="font-sans font-semibold text-[#fff7ec]">🏦 Direct Bank IMPS / NEFT</p>
                <div className="space-y-1 text-[11px] text-[rgba(255,245,230,0.7)]">
                  <p>Account Name: {payeeName}</p>
                  <p>Bank: HDFC Bank / ICICI Bank</p>
                  <p>Account No: •••• •••• 9410</p>
                  <p>IFSC: HDFC0001234</p>
                </div>
              </div>
            )}

            {/* Notes Field */}
            <div>
              <label className="block text-[11px] font-semibold text-[rgba(255,245,230,0.7)] uppercase tracking-wider mb-1.5">
                Reference / Transaction Note (Optional)
              </label>
              <input
                type="text"
                placeholder="e.g. Paid via GPay ref #9084 1029 4810"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full bg-[rgba(255,248,235,0.05)] border border-[rgba(255,248,235,0.14)] focus:border-[#dda071]/60 rounded-xl px-3.5 py-2.5 text-xs text-[#fff7ec] placeholder-[rgba(255,245,230,0.35)] outline-none"
              />
            </div>

            {/* Action Buttons */}
            <div className="pt-2 flex items-center justify-end gap-3 border-t border-[rgba(235,248,246,0.1)]">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl text-xs font-medium text-[rgba(255,245,230,0.65)] hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl bg-[#dda071] text-[#1a1208] text-xs font-bold uppercase tracking-wider shadow-lg hover:bg-[#e6ab7c] transition-all flex items-center gap-1.5"
              >
                <span>✓</span>
                <span>Confirm Settle &amp; Save</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
