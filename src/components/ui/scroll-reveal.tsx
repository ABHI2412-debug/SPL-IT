"use client";

import React, { useEffect, useRef, useState } from "react";

interface ScrollRevealProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  threshold?: number;
  direction?: "flip-up" | "flip-down" | "fade-up";
}

/**
 * ScrollReveal — 3D Perspective Flip & Reveal on Scroll
 * Smoothly flips components into view as they scroll into the viewport,
 * with comfortable, eye-pleasing duration (780ms) and staggered delays.
 */
export function ScrollReveal({
  children,
  className = "",
  delay = 0,
  threshold = 0.08,
  direction = "flip-up",
}: ScrollRevealProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    // Only auto-reveal if element is comfortably within the upper visible viewport on initial load
    const rect = el.getBoundingClientRect();
    const inTopHalfOfViewport = rect.top < window.innerHeight * 0.55 && rect.bottom > 0;

    if (inTopHalfOfViewport) {
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, Math.max(delay, 50));
      return () => clearTimeout(timer);
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
            observer.unobserve(entry.target);
          }
        });
      },
      {
        threshold,
        rootMargin: "0px 0px -40px 0px",
      }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [delay, threshold]);

  const directionClass =
    direction === "flip-down"
      ? "scroll-flip-down"
      : direction === "fade-up"
      ? "scroll-fade-up"
      : "scroll-flip-up";

  return (
    <div
      ref={containerRef}
      className={`scroll-reveal-item ${directionClass} ${
        isVisible ? "scroll-reveal-visible" : "scroll-reveal-hidden"
      } ${className}`}
      style={{
        animationDelay: isVisible ? `${delay}ms` : "0ms",
      }}
    >
      {children}
    </div>
  );
}
