"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";

export interface SpotlightTarget {
  id: string;
  label: string;
  description?: string;
}

interface SpotlightRect {
  left: number;
  top: number;
  width: number;
  height: number;
}

interface SpotlightOverlayProps {
  target: SpotlightTarget | null;
  onDismiss: () => void;
}

const PAD = 10; // padding around highlighted element
const BORDER_RADIUS = 14;

export function SpotlightOverlay({ target, onDismiss }: SpotlightOverlayProps) {
  const [rect, setRect] = useState<SpotlightRect | null>(null);
  const [labelPos, setLabelPos] = useState<"above" | "below">("below");
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearTimer = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  useEffect(() => {
    clearTimer();

    if (!target) {
      setRect(null);
      return;
    }

    const resolveRect = () => {
      const el = document.querySelector(`[data-spotlight-id="${target.id}"]`);
      if (!el) return false;

      // Scroll element into view smoothly
      el.scrollIntoView({ behavior: "smooth", block: "center", inline: "nearest" });

      // Wait for scroll to settle before measuring
      setTimeout(() => {
        const r = el.getBoundingClientRect();
        setRect({ left: r.left, top: r.top, width: r.width, height: r.height });
        // Place label below if there's room, otherwise above
        setLabelPos(r.top + r.height + 80 < window.innerHeight ? "below" : "above");
      }, 420);

      return true;
    };

    // Try immediately
    if (!resolveRect()) {
      // Element might not be mounted yet, retry after a tick
      const retry = setTimeout(resolveRect, 150);
      return () => clearTimeout(retry);
    }

    // Auto-dismiss after 7 seconds
    timerRef.current = setTimeout(onDismiss, 7000);

    return clearTimer;
  }, [target, onDismiss, clearTimer]);

  // Recompute rect on window resize/scroll
  useEffect(() => {
    if (!target || !rect) return;
    const recompute = () => {
      const el = document.querySelector(`[data-spotlight-id="${target.id}"]`);
      if (!el) return;
      const r = el.getBoundingClientRect();
      setRect({ left: r.left, top: r.top, width: r.width, height: r.height });
    };
    window.addEventListener("scroll", recompute, { passive: true });
    window.addEventListener("resize", recompute, { passive: true });
    return () => {
      window.removeEventListener("scroll", recompute);
      window.removeEventListener("resize", recompute);
    };
  }, [target, rect]);

  if (!target || !rect) return null;

  const vw = typeof window !== "undefined" ? window.innerWidth : 1440;
  const vh = typeof window !== "undefined" ? window.innerHeight : 900;

  const hLeft = rect.left - PAD;
  const hTop = rect.top - PAD;
  const hWidth = rect.width + PAD * 2;
  const hHeight = rect.height + PAD * 2;

  // Center X of the highlighted element for the label
  const labelCenterX = Math.min(Math.max(rect.left + rect.width / 2, 120), vw - 120);
  const labelY = labelPos === "below" ? hTop + hHeight + 14 : hTop - 80;

  return (
    <div
      className="fixed inset-0 z-[9998] pointer-events-auto"
      onClick={onDismiss}
      role="dialog"
      aria-label="AI Spotlight Guide"
    >
      {/* ── SVG Mask: full-screen dim with cutout hole ────────── */}
      <svg
        width={vw}
        height={vh}
        className="absolute inset-0"
        style={{ display: "block" }}
      >
        <defs>
          <mask id="spotlight-cutout">
            {/* White = visible (dim) */}
            <rect width={vw} height={vh} fill="white" />
            {/* Black = transparent (hole / spotlight area) */}
            <rect
              x={hLeft}
              y={hTop}
              width={hWidth}
              height={hHeight}
              rx={BORDER_RADIUS}
              ry={BORDER_RADIUS}
              fill="black"
            />
          </mask>
        </defs>
        {/* Darkened overlay everywhere except the hole */}
        <rect
          width={vw}
          height={vh}
          fill="rgba(5, 10, 12, 0.72)"
          mask="url(#spotlight-cutout)"
        />
      </svg>

      {/* ── Pulsing ring 1 (outer glow) ──────────────────────── */}
      <div
        className="absolute pointer-events-none"
        style={{
          left: hLeft - 6,
          top: hTop - 6,
          width: hWidth + 12,
          height: hHeight + 12,
          borderRadius: BORDER_RADIUS + 4,
          border: "2px solid rgba(224, 168, 117, 0.35)",
          animation: "spotlightRingOuter 2s ease-in-out infinite",
          boxShadow: "0 0 28px 8px rgba(224, 168, 117, 0.18)",
        }}
      />

      {/* ── Pulsing ring 2 (sharp accent border) ─────────────── */}
      <div
        className="absolute pointer-events-none"
        style={{
          left: hLeft,
          top: hTop,
          width: hWidth,
          height: hHeight,
          borderRadius: BORDER_RADIUS,
          border: "2.5px solid #e0a875",
          animation: "spotlightRingInner 1.4s ease-in-out infinite alternate",
          boxShadow: "0 0 14px 3px rgba(224, 168, 117, 0.45), inset 0 0 10px rgba(224, 168, 117, 0.08)",
        }}
      />

      {/* ── Corner ping dots ─────────────────────────────────── */}
      {[
        { left: hLeft - 4, top: hTop - 4 },
        { left: hLeft + hWidth - 6, top: hTop - 4 },
        { left: hLeft - 4, top: hTop + hHeight - 6 },
        { left: hLeft + hWidth - 6, top: hTop + hHeight - 6 },
      ].map((pos, i) => (
        <span
          key={i}
          className="absolute pointer-events-none"
          style={{ ...pos, width: 10, height: 10 }}
        >
          <span
            className="absolute inline-flex rounded-full"
            style={{
              width: 10,
              height: 10,
              background: "#e0a875",
              opacity: 0.9,
              animation: `spotlightPing 1.8s ${i * 0.25}s cubic-bezier(0,0,0.2,1) infinite`,
              transformOrigin: "center",
            }}
          />
          <span
            className="absolute inline-flex rounded-full"
            style={{ width: 10, height: 10, background: "#e0a875" }}
          />
        </span>
      ))}

      {/* ── Floating label card ───────────────────────────────── */}
      <div
        className="absolute pointer-events-none"
        style={{
          left: labelCenterX,
          top: labelY,
          transform: "translateX(-50%)",
          animation: "spotlightLabelIn 0.35s cubic-bezier(0.16,1,0.3,1) both",
          whiteSpace: "nowrap",
          zIndex: 1,
        }}
      >
        {/* Connector line */}
        {labelPos === "below" ? (
          <div
            style={{
              width: 2,
              height: 14,
              background: "linear-gradient(to bottom, #e0a875, transparent)",
              margin: "0 auto -1px",
            }}
          />
        ) : (
          <div
            style={{
              width: 2,
              height: 14,
              background: "linear-gradient(to top, #e0a875, transparent)",
              margin: "-1px auto 0",
              order: 2,
            }}
          />
        )}

        <div
          style={{
            background: "rgba(18, 28, 32, 0.96)",
            border: "1.5px solid rgba(224, 168, 117, 0.55)",
            borderRadius: 14,
            padding: "10px 16px",
            backdropFilter: "blur(20px)",
            boxShadow: "0 12px 40px rgba(0,0,0,0.6), 0 0 20px rgba(224,168,117,0.15)",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            {/* Pulse indicator */}
            <span
              style={{
                width: 8,
                height: 8,
                borderRadius: "50%",
                background: "#6ee7b7",
                display: "inline-block",
                animation: "spotlightPulse 1.2s ease-in-out infinite",
                flexShrink: 0,
              }}
            />
            <span
              style={{
                fontSize: 11,
                fontWeight: 700,
                color: "#e0a875",
                letterSpacing: "0.04em",
                fontFamily: "var(--font-sans-ui), system-ui, sans-serif",
              }}
            >
              ✨ {target.label}
            </span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDismiss();
              }}
              style={{
                background: "rgba(255,248,235,0.08)",
                border: "1px solid rgba(255,248,235,0.15)",
                borderRadius: 6,
                color: "rgba(255,245,230,0.6)",
                fontSize: 10,
                padding: "1px 6px",
                cursor: "pointer",
                pointerEvents: "auto",
                transition: "all 0.15s",
              }}
              className="hover:bg-[rgba(255,248,235,0.16)] hover:text-white"
            >
              ✕
            </button>
          </div>

          {target.description && (
            <p
              style={{
                fontSize: 10,
                color: "rgba(255,245,230,0.65)",
                marginTop: 4,
                maxWidth: 260,
                lineHeight: 1.5,
                fontFamily: "var(--font-sans-ui), system-ui, sans-serif",
                whiteSpace: "normal",
              }}
            >
              {target.description}
            </p>
          )}

          <p
            style={{
              fontSize: 9,
              color: "rgba(255,245,230,0.35)",
              marginTop: 5,
              fontFamily: "var(--font-mono, monospace)",
              letterSpacing: "0.06em",
            }}
          >
            Click anywhere to dismiss
          </p>
        </div>
      </div>

      {/* ── Keyframe injection ────────────────────────────────── */}
      <style>{`
        @keyframes spotlightRingOuter {
          0%, 100% { opacity: 0.4; transform: scale(1); }
          50%       { opacity: 0.9; transform: scale(1.04); }
        }
        @keyframes spotlightRingInner {
          from { box-shadow: 0 0 14px 3px rgba(224,168,117,0.45), inset 0 0 10px rgba(224,168,117,0.08); }
          to   { box-shadow: 0 0 28px 8px rgba(224,168,117,0.65), inset 0 0 16px rgba(224,168,117,0.14); }
        }
        @keyframes spotlightPing {
          0%   { transform: scale(1); opacity: 0.9; }
          70%  { transform: scale(2.6); opacity: 0; }
          100% { transform: scale(1); opacity: 0; }
        }
        @keyframes spotlightPulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50%       { opacity: 0.4; transform: scale(0.7); }
        }
        @keyframes spotlightLabelIn {
          from { opacity: 0; transform: translateX(-50%) translateY(8px) scale(0.95); }
          to   { opacity: 1; transform: translateX(-50%) translateY(0) scale(1); }
        }
      `}</style>
    </div>
  );
}
