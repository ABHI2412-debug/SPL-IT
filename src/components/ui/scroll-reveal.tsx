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

    // Check if element is anywhere within or near the visible window on mount
    const rect = el.getBoundingClientRect();
    const isInInitialView = rect.top < window.innerHeight + 250 && rect.bottom > -100;

    if (isInInitialView) {
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, Math.max(delay, 30));
      return () => clearTimeout(timer);
    }

    // Failsafe timer: ensures content never gets stuck invisible (opacity: 0) on any viewport
    const safetyTimer = setTimeout(() => {
      setIsVisible(true);
    }, 450 + Math.max(delay, 50));

    if (typeof IntersectionObserver === "undefined") {
      setIsVisible(true);
      return () => clearTimeout(safetyTimer);
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
        threshold: 0,
        rootMargin: "80px 0px 80px 0px",
      }
    );

    observer.observe(el);
    return () => {
      observer.disconnect();
      clearTimeout(safetyTimer);
    };
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
