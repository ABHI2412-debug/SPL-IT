"use client";

import React, { useState } from "react";

export interface TrendDataPoint {
  label: string;
  amount: number;
  previousAmount?: number;
  date?: string;
  category?: string;
}

interface InteractiveTrendChartProps {
  data: TrendDataPoint[];
  periods?: string[];
  activePeriod?: string;
  onPeriodChange?: (period: string) => void;
  currency?: string;
  theme?: "trip" | "local";
  title?: string;
  subtitle?: string;
  mode?: "bar" | "area";
}

export function InteractiveTrendChart({
  data,
  periods = ["7D", "1M", "6M"],
  activePeriod = "7D",
  onPeriodChange,
  currency = "₹",
  theme = "trip",
  title = "Spending Trend",
  subtitle = "Daily volume & comparisons",
  mode = "bar",
}: InteractiveTrendChartProps) {
  const [selectedPeriod, setSelectedPeriod] = useState(activePeriod);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [displayMode, setDisplayMode] = useState<"bar" | "area">(mode);

  const isTrip = theme === "trip";
  const primaryColor = isTrip ? "#e0a875" : "#6ee7b7";
  const secondaryColor = isTrip ? "#5d7c87" : "#10b981";

  const handlePeriodClick = (p: string) => {
    setSelectedPeriod(p);
    onPeriodChange?.(p);
  };

  const amounts = data.map((d) => d.amount);
  const prevAmounts = data.map((d) => d.previousAmount || 0);
  const maxAmount = Math.max(...amounts, ...prevAmounts, 1);
  const totalAmount = amounts.reduce((acc, cur) => acc + cur, 0);

  const activePoint = hoveredIndex !== null ? data[hoveredIndex] : null;

  // Area Chart Calculations
  const chartHeight = 150;
  const chartWidth = 520;
  const paddingX = 30;
  const paddingBottom = 26;
  const effectiveWidth = chartWidth - paddingX * 2;
  const effectiveHeight = chartHeight - paddingBottom - 15;

  const points = data.map((d, i) => {
    const x = paddingX + (i / Math.max(data.length - 1, 1)) * effectiveWidth;
    const y = chartHeight - paddingBottom - (d.amount / maxAmount) * effectiveHeight;
    return { x, y, ...d };
  });

  const prevPoints = data.map((d, i) => {
    const x = paddingX + (i / Math.max(data.length - 1, 1)) * effectiveWidth;
    const val = d.previousAmount || 0;
    const y = chartHeight - paddingBottom - (val / maxAmount) * effectiveHeight;
    return { x, y };
  });

  const linePath = points.length > 0
    ? `M ${points.map((p) => `${p.x},${p.y}`).join(" L ")}`
    : "";

  const areaPath = points.length > 0
    ? `M ${points[0].x},${chartHeight - paddingBottom} L ${points.map((p) => `${p.x},${p.y}`).join(" L ")} L ${points[points.length - 1].x},${chartHeight - paddingBottom} Z`
    : "";

  const prevLinePath = prevPoints.length > 0
    ? `M ${prevPoints.map((p) => `${p.x},${p.y}`).join(" L ")}`
    : "";

  return (
    <div className="rounded-2xl border border-[rgba(255,248,235,0.1)] bg-[rgba(22,30,33,0.7)] p-5 backdrop-blur-md relative overflow-hidden">
      {/* Chart Top Controls & Info */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
        <div>
          <div className="flex items-center gap-2">
            <p className="text-xs font-semibold uppercase tracking-widest text-[rgba(255,245,230,0.6)]">
              {title}
            </p>
            <div className="flex items-center gap-1 bg-[rgba(255,248,235,0.06)] p-0.5 rounded-lg border border-[rgba(255,248,235,0.08)]">
              <button
                type="button"
                onClick={() => setDisplayMode("bar")}
                className={`px-2 py-0.5 text-[10px] font-medium rounded transition-all ${
                  displayMode === "bar"
                    ? "bg-[#fff7ec]/20 text-[#fff7ec] shadow-sm font-semibold"
                    : "text-[rgba(255,245,230,0.5)] hover:text-[#fff7ec]"
                }`}
                title="Bar Chart Mode"
              >
                Bars
              </button>
              <button
                type="button"
                onClick={() => setDisplayMode("area")}
                className={`px-2 py-0.5 text-[10px] font-medium rounded transition-all ${
                  displayMode === "area"
                    ? "bg-[#fff7ec]/20 text-[#fff7ec] shadow-sm font-semibold"
                    : "text-[rgba(255,245,230,0.5)] hover:text-[#fff7ec]"
                }`}
                title="Area Curve Mode"
              >
                Line
              </button>
            </div>
          </div>
          <p className="text-[11px] text-[rgba(255,245,230,0.45)] mt-0.5">
            {activePoint
              ? `${activePoint.label} · ${currency}${activePoint.amount.toLocaleString("en-IN")}${activePoint.previousAmount ? ` (vs ${currency}${activePoint.previousAmount.toLocaleString("en-IN")})` : ""}`
              : `${subtitle} · Total: ${currency}${totalAmount.toLocaleString("en-IN")}`}
          </p>
        </div>

        {/* Time period pill toggle */}
        <div className="flex items-center gap-1.5 self-start sm:self-auto bg-[rgba(255,248,235,0.04)] p-1 rounded-xl border border-[rgba(255,248,235,0.08)]">
          {periods.map((p) => {
            const isSelected = selectedPeriod === p;
            return (
              <button
                key={p}
                type="button"
                onClick={() => handlePeriodClick(p)}
                className={`px-2.5 py-1 text-[11px] font-medium rounded-lg transition-all ${
                  isSelected
                    ? isTrip
                      ? "bg-[#e0a875] text-[#12191b] font-bold shadow-md shadow-[#e0a875]/20"
                      : "bg-[#6ee7b7] text-[#0f241a] font-bold shadow-md shadow-[#6ee7b7]/20"
                    : "text-[rgba(255,245,230,0.6)] hover:text-[#fff7ec] hover:bg-[rgba(255,248,235,0.05)]"
                }`}
              >
                {p}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Interactive Chart Canvas */}
      {displayMode === "bar" ? (
        <div className="relative pt-4">
          <div className="flex items-end gap-2 sm:gap-4 h-36">
            {data.map((d, i) => {
              const heightPct = Math.max((d.amount / maxAmount) * 100, 6);
              const prevHeightPct = d.previousAmount ? (d.previousAmount / maxAmount) * 100 : 0;
              const isHovered = hoveredIndex === i;

              return (
                <div
                  key={d.label}
                  className="flex-1 flex flex-col items-center gap-2 cursor-pointer group"
                  onMouseEnter={() => setHoveredIndex(i)}
                  onMouseLeave={() => setHoveredIndex(null)}
                >
                  {/* Floating tooltip above hovered bar */}
                  <div
                    className={`transition-all duration-200 text-center ${
                      isHovered ? "opacity-100 -translate-y-1" : "opacity-0 translate-y-1 pointer-events-none"
                    }`}
                  >
                    <span
                      className="text-[10px] font-bold px-1.5 py-0.5 rounded shadow-lg text-white"
                      style={{ backgroundColor: primaryColor }}
                    >
                      {currency}{d.amount >= 1000 ? `${(d.amount / 1000).toFixed(1)}k` : d.amount}
                    </span>
                  </div>

                  {/* Bars Container */}
                  <div className="w-full relative flex items-end justify-center gap-1" style={{ height: "100px" }}>
                    {/* Ghost Bar (Previous Period) */}
                    {d.previousAmount !== undefined && (
                      <div
                        className="w-1.5 sm:w-2 rounded-t-md opacity-25 transition-all duration-500"
                        style={{
                          height: `${prevHeightPct}%`,
                          backgroundColor: secondaryColor,
                        }}
                      />
                    )}

                    {/* Primary Bar */}
                    <div
                      className={`w-full max-w-[28px] rounded-t-xl transition-all duration-300 relative ${
                        isHovered ? "scale-x-110 shadow-lg" : "opacity-85"
                      }`}
                      style={{
                        height: `${heightPct}%`,
                        background: isHovered
                          ? primaryColor
                          : `linear-gradient(to top, ${primaryColor}dd, ${primaryColor}44)`,
                        boxShadow: isHovered ? `0 0 16px ${primaryColor}66` : "none",
                      }}
                    />
                  </div>

                  {/* Label */}
                  <span
                    className={`text-[10px] transition-colors truncate max-w-full ${
                      isHovered ? "text-[#fff7ec] font-bold" : "text-[rgba(255,245,230,0.5)]"
                    }`}
                  >
                    {d.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        /* Area / Line SVG interactive view */
        <div className="relative w-full overflow-hidden">
          <svg
            viewBox={`0 0 ${chartWidth} ${chartHeight}`}
            className="w-full h-44 overflow-visible select-none"
          >
            <defs>
              <linearGradient id={`trendGrad-${theme}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={primaryColor} stopOpacity="0.45" />
                <stop offset="90%" stopColor={primaryColor} stopOpacity="0.0" />
              </linearGradient>
            </defs>

            {/* Grid horizontal guidelines */}
            {[0.25, 0.5, 0.75, 1.0].map((ratio) => {
              const y = chartHeight - paddingBottom - ratio * effectiveHeight;
              return (
                <line
                  key={ratio}
                  x1={paddingX}
                  y1={y}
                  x2={chartWidth - paddingX}
                  y2={y}
                  stroke="rgba(255, 255, 255, 0.06)"
                  strokeDasharray="4 4"
                />
              );
            })}

            {/* Previous period line */}
            {prevPoints.some((p) => p.y !== chartHeight - paddingBottom) && (
              <path
                d={prevLinePath}
                fill="none"
                stroke={secondaryColor}
                strokeWidth="1.5"
                strokeDasharray="4 4"
                opacity="0.4"
              />
            )}

            {/* Area Fill */}
            <path d={areaPath} fill={`url(#trendGrad-${theme})`} />

            {/* Primary Trend Stroke */}
            <path
              d={linePath}
              fill="none"
              stroke={primaryColor}
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="filter drop-shadow-md"
            />

            {/* Data interactive points */}
            {points.map((p, i) => {
              const isHovered = hoveredIndex === i;
              return (
                <g key={p.label}>
                  {/* Invisible hitzone circle for easy hovering */}
                  <circle
                    cx={p.x}
                    cy={p.y}
                    r="16"
                    fill="transparent"
                    className="cursor-pointer"
                    onMouseEnter={() => setHoveredIndex(i)}
                    onMouseLeave={() => setHoveredIndex(null)}
                  />

                  {/* Visual Node */}
                  <circle
                    cx={p.x}
                    cy={p.y}
                    r={isHovered ? 6 : 3.5}
                    fill={isHovered ? "#fff" : primaryColor}
                    stroke={primaryColor}
                    strokeWidth={isHovered ? 3 : 1.5}
                    className="transition-all duration-200 pointer-events-none"
                    style={{
                      filter: isHovered ? `drop-shadow(0 0 8px ${primaryColor})` : "none",
                    }}
                  />

                  {/* X Axis Label */}
                  <text
                    x={p.x}
                    y={chartHeight - 8}
                    textAnchor="middle"
                    fontSize="10"
                    fill={isHovered ? "#fff" : "rgba(255,245,230,0.5)"}
                    fontWeight={isHovered ? "bold" : "normal"}
                    className="pointer-events-none transition-colors"
                  >
                    {p.label}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>
      )}

      {/* Legend & Summary Footer */}
      <div className="flex flex-wrap items-center justify-between gap-3 mt-4 pt-3 border-t border-[rgba(255,248,235,0.08)] text-[10px] text-[rgba(255,245,230,0.5)]">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: primaryColor }} />
            <span>Current Period</span>
          </div>
          {data.some((d) => d.previousAmount !== undefined) && (
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full opacity-40" style={{ backgroundColor: secondaryColor }} />
              <span>Previous Period</span>
            </div>
          )}
        </div>

        <div className="text-[10px] text-[rgba(255,245,230,0.4)]">
          Hover over data points for exact figures
        </div>
      </div>
    </div>
  );
}
