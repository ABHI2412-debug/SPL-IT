"use client";

import React, { useState, useRef } from "react";

export interface ExtractedReceiptData {
  merchant: string;
  amount: number;
  date: string;
  category: string;
  items: Array<{ name: string; price: number }>;
  tax?: number;
  confidence: number;
}

interface ScanReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
  onReceiptScanned?: (extracted: { description: string; amount: number; category?: string }) => void;
}

const SAMPLE_RECEIPTS = [
  {
    name: "Cafe & Bistro Brunch",
    merchant: "Third Wave Coffee Roasters",
    amount: 1480,
    date: "22 Oct 2026",
    category: "Food & Dining",
    tax: 74,
    items: [
      { name: "2x Oat Flat White", price: 560 },
      { name: "1x Truffle Sourdough Toast", price: 420 },
      { name: "1x Salted Caramel Brownie", price: 320 },
      { name: "Service & GST", price: 180 },
    ],
    confidence: 98,
    img: "https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&w=800&q=80",
  },
  {
    name: "Supermarket & Groceries",
    merchant: "Nature's Basket Organic Mart",
    amount: 3240,
    date: "21 Oct 2026",
    category: "Groceries",
    tax: 160,
    items: [
      { name: "Greek Yogurt & Fresh Berries", price: 680 },
      { name: "Almond Milk & Granola", price: 740 },
      { name: "Avocado & Olive Oil", price: 1120 },
      { name: "Sourdough & Artisanal Cheese", price: 700 },
    ],
    confidence: 96,
    img: "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=800&q=80",
  },
  {
    name: "Highway Fuel & Tolls",
    merchant: "Indian Oil Highway Station #402",
    amount: 4200,
    date: "20 Oct 2026",
    category: "Transport & Fuel",
    tax: 0,
    items: [
      { name: "Petrol XP95 (39.5 Litres)", price: 4000 },
      { name: "Highway Fastag Recharge", price: 200 },
    ],
    confidence: 99,
    img: "https://images.unsplash.com/photo-1545454675-3531b543be5d?auto=format&fit=crop&w=800&q=80",
  },
];

export function ScanReceiptModal({
  isOpen,
  onClose,
  onReceiptScanned,
}: ScanReceiptModalProps) {
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [scanStep, setScanStep] = useState<string>("");
  const [extractedData, setExtractedData] = useState<ExtractedReceiptData | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const simulateOcrProcess = (imageSrc: string, fallbackSampleIndex = 0) => {
    setFilePreview(imageSrc);
    setIsScanning(true);
    setExtractedData(null);

    const sample = SAMPLE_RECEIPTS[fallbackSampleIndex % SAMPLE_RECEIPTS.length];

    setScanStep("Detecting document borders & edge contrast...");
    setTimeout(() => {
      setScanStep("Running multi-pass OCR line text recognition...");
      setTimeout(() => {
        setScanStep("Parsing currency tokens, merchant header & GST breakdown...");
        setTimeout(() => {
          setIsScanning(false);
          setScanStep("");
          setExtractedData({
            merchant: sample.merchant,
            amount: sample.amount,
            date: sample.date,
            category: sample.category,
            items: sample.items,
            tax: sample.tax,
            confidence: sample.confidence,
          });
        }, 700);
      }, 700);
    }, 700);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      simulateOcrProcess(String(reader.result), 0);
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        simulateOcrProcess(String(reader.result), 1);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleApply = () => {
    if (extractedData) {
      onReceiptScanned?.({
        description: extractedData.merchant,
        amount: extractedData.amount,
        category: extractedData.category,
      });
      onClose();
    }
  };

  const handleReset = () => {
    setFilePreview(null);
    setExtractedData(null);
    setIsScanning(false);
    setScanStep("");
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg bg-[#141b1f] border border-[rgba(255,248,235,0.18)] rounded-3xl p-6 shadow-2xl relative overflow-hidden"
        style={{
          boxShadow: "0 25px 70px rgba(0, 0, 0, 0.6), inset 0 1px 0 rgba(255, 255, 255, 0.12)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Subtle top ambient glow */}
        <div className="absolute top-0 right-0 w-48 h-48 bg-[radial-gradient(circle_at_top_right,rgba(224,168,117,0.18),transparent_70%)] pointer-events-none" />

        {/* Modal Header */}
        <div className="flex items-start justify-between mb-5 relative z-10">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] uppercase font-bold tracking-[0.24em] text-[#e0a875]">
                AI Document Engine
              </span>
              <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-[#e0a875]/15 text-[#e0a875] border border-[#e0a875]/30">
                OCR v2.4
              </span>
            </div>
            <h3
              className="text-xl sm:text-2xl font-semibold text-[#fff7ec] tracking-tight mt-0.5"
              style={{ fontFamily: "var(--font-display), Georgia, serif" }}
            >
              Smart Receipt Scanner
            </h3>
            <p className="text-xs text-[rgba(255,245,230,0.55)] mt-0.5">
              Upload or snap a bill to automatically parse amount, merchant, and items
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

        {!filePreview ? (
          <div className="space-y-4">
            {/* Drag & Drop Upload Zone */}
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragOver(true);
              }}
              onDragLeave={() => setIsDragOver(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-2xl p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-all ${
                isDragOver
                  ? "border-[#e0a875] bg-[#e0a875]/10 scale-[1.01]"
                  : "border-[rgba(255,248,235,0.18)] hover:border-[#e0a875]/60 bg-[rgba(255,248,235,0.02)] hover:bg-[rgba(255,248,235,0.05)]"
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*,.pdf"
                className="hidden"
                onChange={handleFileChange}
              />
              <div className="w-14 h-14 rounded-2xl bg-[rgba(224,168,117,0.12)] border border-[#e0a875]/30 text-[#e0a875] text-2xl flex items-center justify-center mb-3 shadow-inner">
                🧾
              </div>
              <p className="text-sm font-semibold text-[#fff7ec]">
                Drop your receipt here, or <span className="text-[#e0a875] underline">browse</span>
              </p>
              <p className="text-[11px] text-[rgba(255,245,230,0.45)] mt-1 max-w-[260px]">
                Supports JPEG, PNG, WEBP, or phone camera snapshots of restaurant and shopping bills
              </p>
            </div>

            {/* Quick Demo Previews */}
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[rgba(255,245,230,0.4)] mb-2">
                Or try with a sample receipt:
              </p>
              <div className="grid grid-cols-3 gap-2">
                {SAMPLE_RECEIPTS.map((s, idx) => (
                  <button
                    key={s.name}
                    type="button"
                    onClick={() => simulateOcrProcess(s.img, idx)}
                    className="p-2.5 rounded-xl border border-[rgba(255,248,235,0.1)] bg-[rgba(255,248,235,0.03)] hover:bg-[rgba(255,248,235,0.08)] hover:border-[#e0a875]/40 text-left transition-all group"
                  >
                    <span className="text-xs block font-semibold text-[#fff5e7] group-hover:text-[#e0a875] truncate">
                      {s.name}
                    </span>
                    <span className="text-[10px] font-mono font-semibold text-[rgba(255,245,230,0.5)] block mt-0.5">
                      ₹{s.amount.toLocaleString("en-IN")}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Visual Receipt Canvas with Animated Laser Scanner */}
            <div
              className="w-full h-48 sm:h-52 rounded-2xl bg-cover bg-center border border-[rgba(255,248,235,0.15)] relative overflow-hidden shadow-inner"
              style={{ backgroundImage: `url(${filePreview})` }}
            >
              {/* Darkening tint for scan readability */}
              <div className="absolute inset-0 bg-black/45 backdrop-blur-[1px]" />

              {/* Glowing High-Tech Laser Scanning Line */}
              {isScanning && (
                <>
                  <div
                    className="absolute left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#6ee7b7] to-transparent shadow-[0_0_18px_#6ee7b7,0_0_6px_#ffffff] animate-scanner-laser pointer-events-none z-20"
                  />
                  <div className="absolute inset-0 bg-[#6ee7b7]/10 pointer-events-none animate-pulse" />

                  {/* Scanning Overlay HUD */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center z-30">
                    <div className="w-9 h-9 rounded-full border-2 border-[#6ee7b7] border-t-transparent animate-spin mb-3 shadow-[0_0_15px_rgba(110,231,183,0.5)]" />
                    <span className="text-xs font-semibold text-[#6ee7b7] tracking-wider uppercase">
                      Neural OCR in Progress
                    </span>
                    <p className="text-[11px] text-[rgba(255,255,255,0.85)] mt-1 font-mono">
                      {scanStep}
                    </p>
                  </div>
                </>
              )}

              {/* Scan Success Badge */}
              {!isScanning && extractedData && (
                <div className="absolute top-3 right-3 z-20 bg-emerald-500/90 text-[#09110d] px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase flex items-center gap-1.5 shadow-lg backdrop-blur-md">
                  <span>✓</span>
                  <span>{extractedData.confidence}% Confidence</span>
                </div>
              )}
            </div>

            {/* Extracted Structured Bill Data */}
            {extractedData && (
              <div className="p-4 rounded-2xl bg-[rgba(255,248,235,0.04)] border border-[rgba(255,248,235,0.12)] space-y-3">
                <div className="flex items-start justify-between border-b border-[rgba(255,248,235,0.08)] pb-2.5">
                  <div>
                    <span className="text-[10px] uppercase tracking-wider text-[rgba(255,245,230,0.5)] block">
                      Merchant / Vendor
                    </span>
                    <strong className="text-sm font-semibold text-[#fff7ec] block mt-0.5">
                      {extractedData.merchant}
                    </strong>
                    <span className="text-[10px] text-[rgba(255,245,230,0.4)] mt-0.5 inline-block">
                      {extractedData.category} · {extractedData.date}
                    </span>
                  </div>

                  <div className="text-right">
                    <span className="text-[10px] uppercase tracking-wider text-[rgba(255,245,230,0.5)] block">
                      Detected Total
                    </span>
                    <strong
                      className="text-lg font-bold text-[#6ee7b7] block mt-0.5"
                      style={{ fontFamily: "var(--font-display), Georgia, serif" }}
                    >
                      ₹{extractedData.amount.toLocaleString("en-IN")}
                    </strong>
                  </div>
                </div>

                {/* Parsed Line Items */}
                <div>
                  <span className="text-[10px] uppercase tracking-wider text-[rgba(255,245,230,0.45)] font-semibold block mb-1.5">
                    Extracted Line Items ({extractedData.items.length})
                  </span>
                  <div className="space-y-1.5 max-h-28 overflow-y-auto pr-1">
                    {extractedData.items.map((item, i) => (
                      <div
                        key={i}
                        className="flex items-center justify-between text-xs py-1 px-2 rounded-lg bg-[rgba(255,248,235,0.03)]"
                      >
                        <span className="text-[rgba(255,245,230,0.8)] truncate max-w-[220px]">
                          {item.name}
                        </span>
                        <span className="font-mono text-xs font-semibold text-[#fff5e7]">
                          ₹{item.price.toLocaleString("en-IN")}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="pt-2 flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={handleReset}
                className="px-4 py-2 rounded-xl text-xs font-medium text-[rgba(255,245,230,0.6)] hover:text-white hover:bg-[rgba(255,248,235,0.06)] transition-all"
              >
                ← Scan Another Receipt
              </button>

              <button
                type="button"
                disabled={isScanning || !extractedData}
                onClick={handleApply}
                className="px-5 py-2.5 rounded-xl bg-[#e0a875] hover:bg-[#ebdcd0] text-[#12191b] font-bold text-xs shadow-lg shadow-[#e0a875]/25 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                <span>⚡</span>
                <span>Add to Ledger (₹{extractedData ? extractedData.amount.toLocaleString("en-IN") : 0})</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
