"use client";

import React, { useState, useEffect, useRef } from "react";
import QRCode from "qrcode";
import {
  SpaceSummary,
  SharedExpense,
  Settlement,
  PersonalTransaction,
} from "../../../lib/types/dashboard";
import {
  MOCK_SPACES,
  MOCK_SHARED_EXPENSES,
  MOCK_SETTLEMENTS,
  MOCK_PERSONAL_TRANSACTIONS,
} from "../../../lib/data/mock-data";
import { SplitLogo } from "../../ui/split-logo";

interface ExportReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
  spaces?: SpaceSummary[];
  expenses?: SharedExpense[];
  settlements?: Settlement[];
  personalTransactions?: PersonalTransaction[];
  initialSpaceId?: string;
  initialMode?: "trip" | "personal";
}

export function ExportReceiptModal({
  isOpen,
  onClose,
  spaces: propSpaces,
  expenses: propExpenses,
  settlements: propSettlements,
  personalTransactions: propTransactions,
  initialSpaceId,
  initialMode = "trip",
}: ExportReceiptModalProps) {
  // Merge user data with mock fallbacks
  const spaces = propSpaces && propSpaces.length > 0 ? propSpaces : MOCK_SPACES;
  const allExpenses = propExpenses && propExpenses.length > 0 ? propExpenses : MOCK_SHARED_EXPENSES;
  const allSettlements = propSettlements && propSettlements.length > 0 ? propSettlements : MOCK_SETTLEMENTS;
  const allTransactions = propTransactions && propTransactions.length > 0 ? propTransactions : MOCK_PERSONAL_TRANSACTIONS;

  const [mode, setMode] = useState<"trip" | "personal">(initialMode);
  const [selectedSpaceId, setSelectedSpaceId] = useState<string>(initialSpaceId || spaces[0]?.id || "all");
  const [theme, setTheme] = useState<"parchment" | "obsidian">("parchment");
  const [qrCodeUrl, setQrCodeUrl] = useState<string>("");
  const [copiedText, setCopiedText] = useState(false);
  const [receiptNumber] = useState(() => `SPL-${Math.floor(100000 + Math.random() * 900000)}`);
  const [issuedDate] = useState(() => {
    const now = new Date();
    return now.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  });

  const receiptRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (initialSpaceId) {
      setSelectedSpaceId(initialSpaceId);
    }
  }, [initialSpaceId]);

  useEffect(() => {
    if (initialMode) {
      setMode(initialMode);
    }
  }, [initialMode]);

  // Filter items based on mode and space selection
  const selectedSpace = spaces.find((s) => s.id === selectedSpaceId);

  const filteredExpenses = mode === "trip"
    ? (selectedSpaceId === "all"
        ? allExpenses
        : allExpenses.filter((e) => e.spaceId === selectedSpaceId || e.spaceName.toLowerCase() === selectedSpace?.name.toLowerCase()))
    : [];

  const filteredSettlements = mode === "trip"
    ? (selectedSpaceId === "all"
        ? allSettlements
        : allSettlements.filter((s) => selectedSpace && s.spaceName.toLowerCase() === selectedSpace.name.toLowerCase()))
    : [];

  const filteredPersonal = mode === "personal" ? allTransactions : [];

  // Summary calculations
  const totalTripSpend = filteredExpenses.reduce((sum, e) => sum + e.amount, 0);
  const youPaidOut = filteredExpenses
    .filter((e) => e.isPaidByYou || e.paidBy.toLowerCase() === "you")
    .reduce((sum, e) => sum + e.amount, 0);
  const yourShare = filteredExpenses.reduce((sum, e) => sum + (e.userShare || Math.round(e.amount / 4)), 0);
  const netBalance = youPaidOut - yourShare;

  // Personal finance calculations
  const personalIncome = filteredPersonal.filter((t) => t.type === "income").reduce((s, t) => s + t.amount, 0);
  const personalExpenses = filteredPersonal.filter((t) => t.type === "expense").reduce((s, t) => s + t.amount, 0);
  const personalNet = personalIncome - personalExpenses;

  // Generate QR code for UPI pay or verification
  useEffect(() => {
    const upiPayLink = `upi://pay?pa=sourabh@okhdfcbank&pn=Sourabh%20Patil&am=${Math.abs(netBalance || 1000)}&cu=INR&tn=SPLit%20Bill%20${receiptNumber}`;
    QRCode.toDataURL(upiPayLink, {
      width: 140,
      margin: 1,
      color: {
        dark: theme === "parchment" ? "#1a1a1a" : "#6ee7b7",
        light: theme === "parchment" ? "#faf7f0" : "#12181c",
      },
    })
      .then((url) => setQrCodeUrl(url))
      .catch(() => setQrCodeUrl(""));
  }, [netBalance, receiptNumber, theme]);

  if (!isOpen) return null;

  // 1. WhatsApp Formatted Receipt text
  const generateTextReceipt = () => {
    const spaceTitle = mode === "trip"
      ? (selectedSpace ? selectedSpace.name : "All Active Spaces")
      : "Personal Ledger (October 2026)";

    let text = `🧾 *SPLit DIGITAL RECEIPT*\n`;
    text += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
    text += `*Title:* ${spaceTitle}\n`;
    text += `*Receipt Ref:* #${receiptNumber}\n`;
    text += `*Issued:* ${issuedDate}\n`;
    text += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n`;

    text += `*ITEMIZED BREAKDOWN:*\n`;
    if (mode === "trip") {
      filteredExpenses.forEach((exp) => {
        text += `• ${exp.description} — ₹${exp.amount.toLocaleString("en-IN")} (${exp.paidBy})\n`;
      });
      text += `\n────────────────────────────\n`;
      text += `*TOTAL EXPENDITURE:* ₹${totalTripSpend.toLocaleString("en-IN")}\n`;
      text += `*You Paid Out:* ₹${youPaidOut.toLocaleString("en-IN")}\n`;
      text += `*Your Fair Share:* ₹${yourShare.toLocaleString("en-IN")}\n`;
      text += `*NET POSITION:* ${netBalance >= 0 ? `+₹${netBalance.toLocaleString("en-IN")} (TO RECEIVE)` : `-₹${Math.abs(netBalance).toLocaleString("en-IN")} (YOU OWE)`}\n`;

      if (filteredSettlements.length > 0) {
        text += `\n*WHO SETTLES WHAT:*\n`;
        filteredSettlements.forEach((s) => {
          text += `• ${s.fromUser} owes ${s.toUser}: ₹${s.amount.toLocaleString("en-IN")}\n`;
        });
      }
    } else {
      filteredPersonal.slice(0, 10).forEach((t) => {
        text += `• ${t.title} (${t.category}) — ${t.type === "income" ? "+" : "-"}₹${t.amount.toLocaleString("en-IN")}\n`;
      });
      text += `\n────────────────────────────\n`;
      text += `*TOTAL INCOME:* ₹${personalIncome.toLocaleString("en-IN")}\n`;
      text += `*TOTAL EXPENSES:* ₹${personalExpenses.toLocaleString("en-IN")}\n`;
      text += `*NET CASH FLOW:* ${personalNet >= 0 ? "+" : "-"}₹${Math.abs(personalNet).toLocaleString("en-IN")}\n`;
    }

    text += `\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
    text += `_Split fairly with SPLit App • www.split-app.local_`;
    return text;
  };

  const handleCopyText = async () => {
    const text = generateTextReceipt();
    await navigator.clipboard.writeText(text);
    setCopiedText(true);
    setTimeout(() => setCopiedText(false), 2200);
  };

  const handleShareWhatsApp = () => {
    const text = generateTextReceipt();
    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
    window.open(url, "_blank");
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadCSV = () => {
    let csv = "";
    if (mode === "trip") {
      csv = "Date,Description,Category/Space,Paid By,Amount,Your Share,Split Type\n";
      filteredExpenses.forEach((e) => {
        csv += `"${e.date}","${e.description.replace(/"/g, '""')}","${e.spaceName}","${e.paidBy}",${e.amount},${e.userShare || 0},"${e.splitType}"\n`;
      });
    } else {
      csv = "Date,Title,Type,Category,Account,Amount\n";
      filteredPersonal.forEach((t) => {
        csv += `"${t.date}","${t.title.replace(/"/g, '""')}","${t.type}","${t.category}","${t.account}",${t.amount}\n`;
      });
    }

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    const safeTitle = (mode === "trip" ? (selectedSpace?.name || "All_Spaces") : "Personal_Ledger").replace(/\s+/g, "_");
    link.href = url;
    link.download = `SPLit_Receipt_${safeTitle}_${Date.now()}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const isDark = theme === "obsidian";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 receipt-modal-overlay overflow-y-auto">
      {/* Dimmed backdrop */}
      <div
        className="fixed inset-0 bg-black/80 backdrop-blur-md receipt-modal-backdrop transition-opacity"
        onClick={onClose}
      />

      <div className="relative z-10 w-full max-w-2xl my-auto">
        {/* Controls Bar (Hidden during Print) */}
        <div className="receipt-modal-controls mb-3 flex flex-wrap items-center justify-between gap-2.5 p-3.5 rounded-2xl bg-[rgba(20,28,32,0.92)] border border-[rgba(255,248,235,0.14)] backdrop-blur-xl shadow-2xl">
          <div className="flex items-center gap-2">
            <span className="text-xl">🧾</span>
            <div>
              <h3 className="text-sm font-bold text-[#fff7ec] tracking-wide">Receipt Center</h3>
              <p className="text-[10px] text-[rgba(255,245,230,0.55)]">Itemized statement & export</p>
            </div>
          </div>

          {/* Mode Switcher */}
          <div className="flex items-center gap-1.5 p-1 rounded-xl bg-[rgba(255,248,235,0.06)] border border-[rgba(255,248,235,0.1)]">
            <button
              type="button"
              onClick={() => setMode("trip")}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                mode === "trip"
                  ? "bg-[#e0a875] text-[#1a1208] shadow-md"
                  : "text-[rgba(255,245,230,0.65)] hover:text-white"
              }`}
            >
              Trips
            </button>
            <button
              type="button"
              onClick={() => setMode("personal")}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                mode === "personal"
                  ? "bg-[#6ee7b7] text-[#0d2a1f] shadow-md"
                  : "text-[rgba(255,245,230,0.65)] hover:text-white"
              }`}
            >
              Personal
            </button>
          </div>

          {/* Space / Scope Filter */}
          {mode === "trip" && (
            <select
              value={selectedSpaceId}
              onChange={(e) => setSelectedSpaceId(e.target.value)}
              className="text-xs bg-[rgba(255,248,235,0.08)] border border-[rgba(255,248,235,0.18)] text-[#fff7ec] rounded-xl px-2.5 py-1.5 focus:outline-none focus:border-[#e0a875] cursor-pointer"
            >
              <option value="all" className="bg-[#141c20] text-[#fff7ec]">All Spaces Combined</option>
              {spaces.map((s) => (
                <option key={s.id} value={s.id} className="bg-[#141c20] text-[#fff7ec]">
                  {s.name}
                </option>
              ))}
            </select>
          )}

          {/* Theme Toggle (Paper Thermal vs Cyber Obsidian) */}
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setTheme(isDark ? "parchment" : "obsidian")}
              title="Toggle Receipt Paper Style"
              className="px-2.5 py-1.5 rounded-xl border border-[rgba(255,248,235,0.18)] bg-[rgba(255,248,235,0.06)] text-[11px] font-medium text-[rgba(255,245,230,0.8)] hover:bg-[rgba(255,248,235,0.14)] transition-all flex items-center gap-1"
            >
              <span>{isDark ? "📜 Paper" : "🛸 Dark"}</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 rounded-xl border border-[rgba(255,248,235,0.18)] bg-[rgba(255,248,235,0.06)] text-[rgba(255,245,230,0.7)] hover:text-white flex items-center justify-center transition-all"
            >
              ✕
            </button>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* THE PRINTABLE RECEIPT CARD                                                */}
        {/* ========================================================================= */}
        <div
          id="split-printable-receipt"
          ref={receiptRef}
          className={`relative mx-auto transition-all duration-300 font-mono text-xs shadow-2xl rounded-sm ${
            isDark
              ? "bg-[#12181c] text-[#f1f5f9] border border-[rgba(255,255,255,0.12)]"
              : "bg-[#faf7f0] text-[#1c1917] border border-[#e5e0d4]"
          }`}
          style={{
            maxWidth: "460px",
            boxShadow: isDark
              ? "0 25px 60px -15px rgba(0, 0, 0, 0.9), inset 0 1px 0 rgba(255, 255, 255, 0.08)"
              : "0 25px 60px -15px rgba(0, 0, 0, 0.45), inset 0 2px 4px rgba(255, 255, 255, 0.9)",
          }}
        >
          {/* Top Zig-Zag Sawtooth Edge */}
          <div className="w-full h-3 overflow-hidden flex items-center justify-between pointer-events-none select-none opacity-90">
            <svg
              className="w-full h-3"
              preserveAspectRatio="none"
              viewBox="0 0 460 12"
              fill={isDark ? "#0d1316" : "#ebe6db"}
            >
              <path d="M0,0 L10,12 L20,0 L30,12 L40,0 L50,12 L60,0 L70,12 L80,0 L90,12 L100,0 L110,12 L120,0 L130,12 L140,0 L150,12 L160,0 L170,12 L180,0 L190,12 L200,0 L210,12 L220,0 L230,12 L240,0 L250,12 L260,0 L270,12 L280,0 L290,12 L300,0 L310,12 L320,0 L330,12 L340,0 L350,12 L360,0 L370,12 L380,0 L390,12 L400,0 L410,12 L420,0 L430,12 L440,0 L450,12 L460,0 L460,0 L0,0 Z" />
            </svg>
          </div>

          <div className="p-6 sm:p-7 space-y-5">
            {/* 1. RECEIPT HEADER */}
            <div className="text-center space-y-1.5">
              <div className="flex items-center justify-center">
                <SplitLogo size="sm" variant="horizontal" withGlow={false} />
              </div>
              <p className={`text-[10px] tracking-widest uppercase ${isDark ? "text-emerald-400" : "text-[#78716c]"}`}>
                Digital Expense & Settlement Slip
              </p>
              <div className="py-1">
                <span className={`text-[9px] px-2 py-0.5 rounded border uppercase tracking-wider font-semibold ${
                  isDark ? "border-emerald-500/40 text-emerald-400 bg-emerald-950/30" : "border-stone-400 text-stone-700 bg-stone-200/50"
                }`}>
                  Official Itemized Ledger
                </span>
              </div>
            </div>

            {/* Separator */}
            <div className={`border-b border-dashed ${isDark ? "border-slate-700" : "border-stone-300"}`} />

            {/* 2. RECEIPT METADATA */}
            <div className="space-y-1 text-[11px]">
              <div className="flex justify-between">
                <span className={isDark ? "text-slate-400" : "text-stone-500"}>RECEIPT REF:</span>
                <span className="font-bold tracking-wider">#{receiptNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className={isDark ? "text-slate-400" : "text-stone-500"}>SCOPE:</span>
                <span className="font-bold uppercase truncate max-w-[220px]">
                  {mode === "trip" ? (selectedSpace ? selectedSpace.name : "All Spaces") : "Personal Ledger"}
                </span>
              </div>
              {mode === "trip" && selectedSpace?.location && (
                <div className="flex justify-between">
                  <span className={isDark ? "text-slate-400" : "text-stone-500"}>LOCATION:</span>
                  <span className="font-medium truncate max-w-[220px]">{selectedSpace.location}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className={isDark ? "text-slate-400" : "text-stone-500"}>DATE / TIME:</span>
                <span>{issuedDate}</span>
              </div>
              <div className="flex justify-between">
                <span className={isDark ? "text-slate-400" : "text-stone-500"}>CURRENCY:</span>
                <span className="font-bold">INR (₹) · Fair Split</span>
              </div>
            </div>

            {/* Separator */}
            <div className={`border-b border-dashed ${isDark ? "border-slate-700" : "border-stone-300"}`} />

            {/* 3. ITEMIZED EXPENSES TABLE */}
            <div className="space-y-3">
              <div className="flex justify-between text-[10px] font-bold uppercase tracking-wider">
                <span className={isDark ? "text-slate-400" : "text-stone-500"}>DESCRIPTION / PAYER</span>
                <span className={isDark ? "text-slate-400" : "text-stone-500"}>AMOUNT (₹)</span>
              </div>

              <div className="space-y-2.5 max-h-64 overflow-y-auto pr-1">
                {mode === "trip" ? (
                  filteredExpenses.map((exp) => (
                    <div key={exp.id} className="space-y-0.5">
                      <div className="flex items-baseline justify-between gap-2">
                        <span className="font-semibold truncate max-w-[260px]">{exp.description}</span>
                        <span className={`flex-1 border-b border-dotted mx-1 ${isDark ? "border-slate-700" : "border-stone-300"}`} />
                        <span className="font-bold whitespace-nowrap">₹{exp.amount.toLocaleString("en-IN")}</span>
                      </div>
                      <div className="flex items-center justify-between text-[10px]">
                        <span className={isDark ? "text-slate-400" : "text-stone-500"}>
                          Paid by {exp.paidBy} · {exp.date}
                        </span>
                        <span className={isDark ? "text-emerald-400" : "text-stone-600"}>
                          {exp.isPaidByYou ? "You covered full" : `Your share: ₹${exp.userShare?.toLocaleString("en-IN") || Math.round(exp.amount / 4)}`}
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  filteredPersonal.map((tx) => (
                    <div key={tx.id} className="space-y-0.5">
                      <div className="flex items-baseline justify-between gap-2">
                        <span className="font-semibold truncate max-w-[260px]">{tx.title}</span>
                        <span className={`flex-1 border-b border-dotted mx-1 ${isDark ? "border-slate-700" : "border-stone-300"}`} />
                        <span className={`font-bold whitespace-nowrap ${tx.type === "income" ? "text-emerald-500" : ""}`}>
                          {tx.type === "income" ? "+" : "-"}₹{tx.amount.toLocaleString("en-IN")}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-[10px]">
                        <span className={isDark ? "text-slate-400" : "text-stone-500"}>
                          {tx.category} · {tx.account}
                        </span>
                        <span className={isDark ? "text-slate-400" : "text-stone-500"}>{tx.date}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Separator */}
            <div className={`border-b-2 border-dashed ${isDark ? "border-slate-600" : "border-stone-400"}`} />

            {/* 4. FINANCIAL SUMMARY */}
            <div className="space-y-1.5 text-xs">
              {mode === "trip" ? (
                <>
                  <div className="flex justify-between">
                    <span className={isDark ? "text-slate-400" : "text-stone-600"}>TOTAL GROUP EXPENDITURE:</span>
                    <span className="font-bold">₹{totalTripSpend.toLocaleString("en-IN")}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className={isDark ? "text-slate-400" : "text-stone-600"}>YOU PAID OUT OF POCKET:</span>
                    <span className="font-medium">₹{youPaidOut.toLocaleString("en-IN")}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className={isDark ? "text-slate-400" : "text-stone-600"}>YOUR FAIR CONTRIBUTION:</span>
                    <span className="font-medium">₹{yourShare.toLocaleString("en-IN")}</span>
                  </div>

                  <div className={`mt-2 pt-2 border-t border-dotted flex items-center justify-between text-sm font-bold ${
                    isDark ? "border-slate-700" : "border-stone-300"
                  }`}>
                    <span>YOUR NET BALANCE:</span>
                    <span className={
                      netBalance > 0
                        ? "text-emerald-500"
                        : netBalance < 0
                        ? "text-rose-500"
                        : "text-stone-500"
                    }>
                      {netBalance > 0
                        ? `+₹${netBalance.toLocaleString("en-IN")} (TO RECEIVE)`
                        : netBalance < 0
                        ? `-₹${Math.abs(netBalance).toLocaleString("en-IN")} (YOU OWE)`
                        : "₹0 (ALL SETTLED)"}
                    </span>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex justify-between">
                    <span className={isDark ? "text-slate-400" : "text-stone-600"}>TOTAL RECORDED INCOME:</span>
                    <span className="font-bold text-emerald-500">+₹{personalIncome.toLocaleString("en-IN")}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className={isDark ? "text-slate-400" : "text-stone-600"}>TOTAL RECORDED EXPENSES:</span>
                    <span className="font-bold text-rose-500">-₹{personalExpenses.toLocaleString("en-IN")}</span>
                  </div>
                  <div className={`mt-2 pt-2 border-t border-dotted flex items-center justify-between text-sm font-bold ${
                    isDark ? "border-slate-700" : "border-stone-300"
                  }`}>
                    <span>NET CASH FLOW:</span>
                    <span className={personalNet >= 0 ? "text-emerald-500" : "text-rose-500"}>
                      {personalNet >= 0 ? "+" : "-"}₹{Math.abs(personalNet).toLocaleString("en-IN")}
                    </span>
                  </div>
                </>
              )}
            </div>

            {/* 5. OUTSTANDING SETTLEMENTS (WHO OWES WHO) */}
            {mode === "trip" && filteredSettlements.length > 0 && (
              <div className={`p-3 rounded-lg border border-dashed space-y-1.5 ${
                isDark ? "bg-[rgba(255,255,255,0.03)] border-slate-700" : "bg-stone-100 border-stone-300"
              }`}>
                <p className="text-[10px] font-bold uppercase tracking-wider text-center">
                  ✦ Settlement Balance Sheet ✦
                </p>
                <div className="space-y-1 text-[11px]">
                  {filteredSettlements.map((s) => (
                    <div key={s.id} className="flex justify-between items-center">
                      <span className={isDark ? "text-slate-300" : "text-stone-700"}>
                        {s.fromUser} → {s.toUser}
                      </span>
                      <span className="font-bold">
                        ₹{s.amount.toLocaleString("en-IN")}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Separator */}
            <div className={`border-b border-dashed ${isDark ? "border-slate-700" : "border-stone-300"}`} />

            {/* 6. QR CODE & VERIFICATION / UPI PAYMENT */}
            <div className="flex items-center justify-between gap-4 pt-1">
              <div className="space-y-1 max-w-[230px]">
                <p className="text-[10px] font-bold uppercase tracking-wider">
                  {netBalance < 0 ? "Scan to Settle Balance" : "Scan to Pay via UPI"}
                </p>
                <p className={`text-[9px] leading-relaxed ${isDark ? "text-slate-400" : "text-stone-500"}`}>
                  Supports Google Pay, PhonePe, Paytm, BHIM & all NPCI UPI banking apps.
                </p>
                <p className="text-[9px] font-mono tracking-tight text-emerald-500 font-semibold">
                  sourabh@okhdfcbank
                </p>
              </div>

              {qrCodeUrl && (
                <div className={`p-1.5 rounded-lg border ${
                  isDark ? "bg-black/60 border-slate-700" : "bg-white border-stone-300 shadow-sm"
                }`}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={qrCodeUrl} alt="UPI Payment QR Code" className="w-20 h-20" />
                </div>
              )}
            </div>

            {/* 7. BARCODE SIMULATION */}
            <div className="pt-2 text-center space-y-1">
              <div className="flex items-center justify-center h-8 gap-0.5 px-4 overflow-hidden select-none opacity-80">
                {[
                  2, 4, 1, 3, 2, 5, 1, 2, 4, 1, 3, 2, 4, 1, 2, 3, 5, 2, 1, 4,
                  2, 1, 3, 4, 2, 5, 1, 2, 4, 1, 3, 2, 4, 1, 2, 3, 5, 2, 1, 4,
                ].map((w, i) => (
                  <div
                    key={i}
                    className={`h-full ${isDark ? "bg-slate-300" : "bg-stone-900"}`}
                    style={{ width: `${w}px` }}
                  />
                ))}
              </div>
              <p className={`text-[8px] tracking-[0.28em] font-mono uppercase ${isDark ? "text-slate-400" : "text-stone-500"}`}>
                * SPLIT-{receiptNumber}-VERIFIED *
              </p>
            </div>

            {/* 8. FOOTER NOTES */}
            <div className={`text-center space-y-0.5 pt-1 text-[9px] ${isDark ? "text-slate-400" : "text-stone-500"}`}>
              <p className="font-semibold uppercase tracking-wider">✦ THANK YOU FOR SPLITTING FAIRLY ✦</p>
              <p>Keep this receipt for personal accounts or travel logs.</p>
              <p className="font-mono text-[8px] text-[rgba(255,255,255,0.4)]">SPLit Engine v2.4 · Powered by Supabase</p>
            </div>
          </div>

          {/* Bottom Zig-Zag Sawtooth Edge */}
          <div className="w-full h-3 overflow-hidden flex items-center justify-between pointer-events-none select-none opacity-90 rotate-180">
            <svg
              className="w-full h-3"
              preserveAspectRatio="none"
              viewBox="0 0 460 12"
              fill={isDark ? "#0d1316" : "#ebe6db"}
            >
              <path d="M0,0 L10,12 L20,0 L30,12 L40,0 L50,12 L60,0 L70,12 L80,0 L90,12 L100,0 L110,12 L120,0 L130,12 L140,0 L150,12 L160,0 L170,12 L180,0 L190,12 L200,0 L210,12 L220,0 L230,12 L240,0 L250,12 L260,0 L270,12 L280,0 L290,12 L300,0 L310,12 L320,0 L330,12 L340,0 L350,12 L360,0 L370,12 L380,0 L390,12 L400,0 L410,12 L420,0 L430,12 L440,0 L450,12 L460,0 L460,0 L0,0 Z" />
            </svg>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* ACTION BUTTONS TOOLBAR (Hidden during Print)                              */}
        {/* ========================================================================= */}
        <div className="receipt-modal-controls mt-3 grid grid-cols-2 sm:grid-cols-4 gap-2">
          {/* Print / Save PDF */}
          <button
            type="button"
            onClick={handlePrint}
            className="flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl bg-[#e0a875] text-[#1a1208] text-xs font-bold uppercase tracking-wider hover:bg-[#ebb98a] shadow-lg transition-all"
          >
            <span>🖨️</span>
            <span>Print / PDF</span>
          </button>

          {/* WhatsApp Share */}
          <button
            type="button"
            onClick={handleShareWhatsApp}
            className="flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl bg-[#25D366]/20 border border-[#25D366]/40 text-[#4ade80] hover:bg-[#25D366]/30 text-xs font-bold uppercase tracking-wider transition-all"
          >
            <span>💬</span>
            <span>WhatsApp</span>
          </button>

          {/* Copy Text Receipt */}
          <button
            type="button"
            onClick={handleCopyText}
            className="flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl bg-[rgba(255,248,235,0.08)] border border-[rgba(255,248,235,0.18)] text-[#fff7ec] hover:bg-[rgba(255,248,235,0.16)] text-xs font-bold uppercase tracking-wider transition-all"
          >
            <span>{copiedText ? "✓" : "📋"}</span>
            <span>{copiedText ? "Copied!" : "Copy Text"}</span>
          </button>

          {/* Download CSV */}
          <button
            type="button"
            onClick={handleDownloadCSV}
            className="flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl bg-[rgba(255,248,235,0.08)] border border-[rgba(255,248,235,0.18)] text-[rgba(255,245,230,0.85)] hover:bg-[rgba(255,248,235,0.16)] text-xs font-bold uppercase tracking-wider transition-all"
          >
            <span>📊</span>
            <span>Get CSV</span>
          </button>
        </div>
      </div>
    </div>
  );
}
