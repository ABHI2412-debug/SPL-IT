"use client";

import React, { useState } from "react";

export interface InteractiveDonutItem {
  id: string;
  label: string;
  amount: number;
  pct: number;
  color: string;
  icon?: string;
  sub?: string;
}

interface InteractiveDonutChartProps {
  data: InteractiveDonutItem[];
  totalAmount?: number;
  centerTitle?: string;
  centerSubtitle?: string;
  currency?: string;
  theme?: "trip" | "local";
  onSelectCategory?: (item: InteractiveDonutItem | null) => void;
}

export function InteractiveDonutChart({
  data,
  totalAmount,
  centerTitle,
  centerSubtitle = "Total Spent",
  currency = "₹",
  theme = "trip",
  onSelectCategory,
}: InteractiveDonutChartProps) {
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const isTrip = theme === "trip";
  const computedTotal = totalAmount ?? data.reduce((sum, item) => sum + item.amount, 0);

  const activeId = hoveredId || selectedId;
  const activeItem = data.find((d) => d.id === activeId) || null;

  // SVG Donut geometry
  const size = 200;
  const strokeWidth = 22;
  const radius = (size - strokeWidth) / 2; // ~89
  const circumference = 2 * Math.PI * radius; // ~559.2

  let accumulatedPct = 0;
  const segments = data.map((item) => {
    const strokeDasharray = `${(item.pct / 100) * circumference} ${circumference}`;
    const strokeDashoffset = -((accumulatedPct / 100) * circumference);
    accumulatedPct += item.pct;

    const isHovered = activeId === item.id;

    return {
      ...item,
      strokeDasharray,
      strokeDashoffset,
      isHovered,
    };
  });

  const handleSegmentClick = (item: InteractiveDonutItem) => {
    const next = selectedId === item.id ? null : item.id;
    setSelectedId(next);
    onSelectCategory?.(next ? item : null);
  };

  return (
    <div className="flex flex-col sm:flex-row items-center gap-6 w-full">
      {/* 1. Interactive SVG Donut Wheel */}
      <div className="relative flex-shrink-0 flex items-center justify-center">
        <svg
          width={size}
          height={size}
          viewBox={`0 0 ${size} ${size}`}
          className="transform -rotate-90 filter drop-shadow-xl overflow-visible"
        >
          {/* Subtle track background */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="transparent"
            stroke="rgba(255, 255, 255, 0.05)"
            strokeWidth={strokeWidth}
          />

          {/* Interactive Segments */}
          {segments.map((seg) => {
            const isTarget = activeId === seg.id;
            return (
              <circle
                key={seg.id}
                cx={size / 2}
                cy={size / 2}
                r={radius}
                fill="transparent"
                stroke={seg.color}
                strokeWidth={isTarget ? strokeWidth + 6 : strokeWidth}
                strokeDasharray={seg.strokeDasharray}
                strokeDashoffset={seg.strokeDashoffset}
                strokeLinecap="round"
                className="transition-all duration-300 cursor-pointer"
                style={{
                  opacity: activeId ? (isTarget ? 1 : 0.35) : 0.95,
                  transformOrigin: "center",
                  filter: isTarget ? `drop-shadow(0 0 10px ${seg.color}88)` : "none",
                }}
                onMouseEnter={() => setHoveredId(seg.id)}
                onMouseLeave={() => setHoveredId(null)}
                onClick={() => handleSegmentClick(seg)}
              />
            );
          })}
        </svg>

        {/* Center Hover Details Badge */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none px-3">
          <span
            className="text-lg sm:text-xl font-bold tracking-tight text-[#fff7ec] transition-all duration-200"
            style={{
              fontFamily: "var(--font-display), Georgia, serif",
              color: activeItem ? activeItem.color : "#fff7ec",
            }}
          >
            {activeItem
              ? `${currency}${activeItem.amount.toLocaleString("en-IN")}`
              : centerTitle || `${currency}${computedTotal.toLocaleString("en-IN")}`}
          </span>
          <span className="text-[10px] uppercase tracking-[0.2em] font-semibold text-[rgba(255,245,230,0.65)] mt-0.5 truncate max-w-[130px]">
            {activeItem ? `${activeItem.label} (${activeItem.pct}%)` : centerSubtitle}
          </span>
        </div>
      </div>

      {/* 2. Interactive Interactive Legend */}
      <div className="flex-1 space-y-2 w-full">
        {data.map((cat) => {
          const isTarget = activeId === cat.id;
          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => handleSegmentClick(cat)}
              onMouseEnter={() => setHoveredId(cat.id)}
              onMouseLeave={() => setHoveredId(null)}
              className={`w-full text-left p-2.5 rounded-xl transition-all flex items-center justify-between border ${
                isTarget
                  ? isTrip
                    ? "bg-[#253236] border-[#e0a875]/50 shadow-md scale-[1.01]"
                    : "bg-[#38262a] border-[#f39850]/50 shadow-md scale-[1.01]"
                  : "bg-[rgba(255,248,235,0.03)] border-[rgba(255,248,235,0.08)] hover:bg-[rgba(255,248,235,0.06)]"
              }`}
            >
              <div className="flex items-center gap-3 min-w-0">
                <span
                  className="w-3.5 h-3.5 rounded-full flex-shrink-0 transition-transform shadow-sm"
                  style={{
                    backgroundColor: cat.color,
                    boxShadow: isTarget ? `0 0 10px ${cat.color}` : "none",
                    transform: isTarget ? "scale(1.2)" : "scale(1)",
                  }}
                />
                <div className="truncate">
                  <p className="text-xs font-medium text-[#fff7ec] truncate">{cat.label}</p>
                  {cat.sub && <p className="text-[10px] text-[rgba(255,245,230,0.45)] truncate">{cat.sub}</p>}
                </div>
              </div>

              <div className="text-right flex-shrink-0 flex items-center gap-2.5">
                <span className="text-xs font-semibold text-[#fff5e7]">
                  {currency}{cat.amount.toLocaleString("en-IN")}
                </span>
                <span
                  className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded-md text-white/90"
                  style={{ backgroundColor: `${cat.color}35` }}
                >
                  {cat.pct}%
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
