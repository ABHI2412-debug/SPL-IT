"use client";

import React, { useEffect, useState } from "react";

interface LiveClockProps {
  className?: string;
}

export function LiveClock({ className = "text-right" }: LiveClockProps) {
  // Use state with initial values to avoid SSR hydration mismatch
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    // Set initial date immediately upon mounting in the browser
    setNow(new Date());

    // Update every second
    const interval = setInterval(() => {
      setNow(new Date());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // Format date: e.g. "Thursday, 22 October" or fallback for SSR
  const formattedDate = now
    ? now.toLocaleDateString("en-US", {
        weekday: "long",
        day: "2-digit",
        month: "long",
      })
    : "Loading date...";

  // Format time: e.g. "9:10 AM" or "9:10:45 AM"
  const formattedTime = now
    ? now.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      })
    : "--:--";

  return (
    <div className={className}>
      <span
        className="text-xs text-[rgba(255,245,230,0.6)] font-medium uppercase tracking-[0.14em] block"
        style={{ fontFamily: "var(--font-mono-ui), monospace" }}
      >
        {formattedDate}
      </span>
      <span
        className="text-2xl sm:text-4xl font-semibold tracking-tight text-[#fff7ec] block mt-0.5 tabular-nums"
        style={{ fontFamily: "var(--font-display), Georgia, serif" }}
      >
        {formattedTime}
      </span>
    </div>
  );
}
