"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState, useTransition } from "react";
import { DashboardShell } from "@/components/dashboard/app-shell";
import { SplitLogo } from "./ui/split-logo";
import { TypewriterPageTransition } from "./ui/typewriter-loader";
import styles from "./split-landing.module.css";

type Space = "trip" | "local";

const panels: Record<
  Space,
  {
    eyebrow: string;
    title: string;
    body: string;
    caption: string;
    bullets: string[];
  }
> = {
  trip: {
    eyebrow: "Forest ledger",
    title: "Trip",
    body: "For mountain plans, beach weekends, train tickets, cabins, food stops, and every expense the group shares while away.",
    caption: "Shared travel costs for groups on the move.",
    bullets: ["Transport, stays, food runs", "Great for temporary groups", "Feels open, distant, adventurous"],
  },
  local: {
    eyebrow: "Room ledger",
    title: "Local",
    body: "For home groceries, rent-side costs, snacks, subscriptions, cleaning supplies, and everyday spending with your close circle.",
    caption: "Shared local expenses for the people around you every day.",
    bullets: ["Household and nearby spending", "Built for regular day-to-day use", "Feels warm, close, and personal"],
  },
};

export function SplitLanding() {
  const [, startTransition] = useTransition();
  const [active, setActive] = useState<Space | null>(null);
  const [hovered, setHovered] = useState<Space | null>(null);
  const [dashboardMounted, setDashboardMounted] = useState<Space | null>(null);
  const [dashboardVisible, setDashboardVisible] = useState(false);
  const [transitionLoader, setTransitionLoader] = useState<{
    isVisible: boolean;
    message: string;
    subMessage: string;
    theme: "classic" | "forest" | "room";
  }>({
    isVisible: false,
    message: "",
    subMessage: "",
    theme: "classic",
  });

  // Synchronize browser history and support the Back button effortlessly
  useEffect(() => {
    const handlePopState = () => {
      if (window.location.pathname === "/" || window.location.pathname === "") {
        setDashboardVisible(false);
        setActive(null);
        const timer = setTimeout(() => {
          setDashboardMounted(null);
        }, 350);
        return () => clearTimeout(timer);
      }
    };
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  const handleSelect = (space: Space) => {
    if (active) return;

    // 1. Immediately trigger the GPU-accelerated panel expansion
    setActive(space);
    window.history.pushState(null, "", `/${space}`);

    // 2. Display the typewriter loader transition
    setTransitionLoader({
      isVisible: true,
      message: space === "trip" ? "Opening Forest Ledger..." : "Opening Room Ledger...",
      subMessage:
        space === "trip"
          ? "Setting up shared travel expenses & group circles"
          : "Loading household balances & everyday budgets",
      theme: space === "trip" ? "forest" : "room",
    });

    // 3. Mount and reveal dashboard smoothly after giving typewriter animation full visibility
    const timer = setTimeout(() => {
      setDashboardMounted(space);
      requestAnimationFrame(() => {
        setDashboardVisible(true);
        setTimeout(() => {
          setTransitionLoader((prev) => ({ ...prev, isVisible: false }));
        }, 300);
      });
    }, 750);

    return () => clearTimeout(timer);
  };

  return (
    <main className={styles.page}>
      {/* 1. Portal Scene (Smoothly expands and dissolves) */}
      <div
        className={`${styles.portalContainer} ${
          active ? styles.portalContainerActive : ""
        }`}
      >
        <div className={styles.grain} />
        <header className={styles.topbar}>
          <Link className={styles.brand} href="/" style={{ textDecoration: "none" }}>
            <SplitLogo size="sm" variant="horizontal" />
          </Link>
          <p className={styles.brandNote}>Choose the world your shared money belongs to.</p>
        </header>

        <section
          className={styles.hero}
          data-active={active || undefined}
          data-hovered={active ? undefined : (hovered || undefined)}
        >
          <button
            type="button"
            className={`${styles.panel} ${styles.tripPanel}`}
            onClick={() => handleSelect("trip")}
            onMouseEnter={() => !active && setHovered("trip")}
            onMouseLeave={() => !active && setHovered(null)}
            onFocus={() => !active && setHovered("trip")}
            onBlur={() => !active && setHovered(null)}
            aria-label="Open the Trip expenses space"
          >
            <div className={styles.tripBackdrop}>
              <Image
                src="/images/trip-scenery.avif"
                alt="Forest scenery for the Trip section"
                fill
                priority
                className={styles.tripPhoto}
              />
              <span className={styles.tripSky} />
              <span className={styles.tripGlow} />
              <span className={styles.tripMist} />
              <span className={`${styles.mountain} ${styles.mountainFar}`} />
              <span className={`${styles.mountain} ${styles.mountainMid}`} />
              <span className={`${styles.mountain} ${styles.mountainNear}`} />
              <span className={styles.river} />
              <span className={styles.riverShine} />
              <span className={`${styles.forest} ${styles.forestBack}`} />
              <span className={`${styles.forest} ${styles.forestMid}`} />
              <span className={`${styles.forest} ${styles.forestFront}`} />
            </div>

            <PanelCopy panel={panels.trip} isActive={active === "trip"} />
          </button>

          <button
            type="button"
            className={`${styles.panel} ${styles.localPanel}`}
            onClick={() => handleSelect("local")}
            onMouseEnter={() => !active && setHovered("local")}
            onMouseLeave={() => !active && setHovered(null)}
            onFocus={() => !active && setHovered("local")}
            onBlur={() => !active && setHovered(null)}
            aria-label="Open the Local expenses space"
          >
            <div className={styles.roomBackdrop}>
              <span className={styles.roomSkyline} />
              <span className={styles.roomWall} />
              <span className={styles.wallTexture} />
              <span className={styles.windowGlow} />
              <span className={styles.sunBeam} />
              <span className={styles.windowFrame} />
              <span className={styles.bed} />
              <span className={styles.pillowLeft} />
              <span className={styles.pillowRight} />
              <span className={styles.blanket} />
              <span className={styles.sideTable} />
              <span className={styles.lampBase} />
              <span className={styles.lampGlow} />
              <span className={styles.rug} />
              <span className={styles.desk} />
              <span className={styles.laptop} />
              <span className={styles.phone} />
              <span className={styles.mug} />
              <span className={styles.plant} />
              <span className={styles.floorBoards} />
            </div>

            <PanelCopy panel={panels.local} isActive={active === "local"} />
          </button>

          <div className={styles.divider} />
          <div className={styles.portalVeil} />

          <div className={styles.centerCopy}>
            <div className="flex justify-center mb-4">
              <SplitLogo size="lg" variant="horizontal" withGlow />
            </div>
            <h1>Split by feeling, not just by amount.</h1>
            <p>
              One side holds your travel stories. The other keeps the everyday circle tidy.
              Pick a side and the page leans fully into that space.
            </p>
          </div>
        </section>
      </div>

      {/* 2. Seamless In-Place Dashboard Reveal (Zero unmount, 60fps) */}
      {dashboardMounted && (
        <div
          className={`${styles.dashboardWrapper} ${
            dashboardVisible ? styles.dashboardVisible : styles.dashboardHidden
          }`}
        >
          <DashboardShell
            initialSpace={dashboardMounted}
            onReturnToLanding={() => {
              setTransitionLoader({
                isVisible: true,
                message: "Closing Ledger...",
                subMessage: "Safely returning to realm portal",
                theme: "classic",
              });
              window.history.pushState(null, "", "/");
              setDashboardVisible(false);
              setActive(null);
              const timer = setTimeout(() => {
                setDashboardMounted(null);
                setTransitionLoader((prev) => ({ ...prev, isVisible: false }));
              }, 650);
              return () => clearTimeout(timer);
            }}
          />
        </div>
      )}

      {/* 3. Global Typewriter Page Transition Overlay */}
      <TypewriterPageTransition
        isVisible={transitionLoader.isVisible}
        message={transitionLoader.message}
        subMessage={transitionLoader.subMessage}
        theme={transitionLoader.theme}
      />
    </main>
  );
}

function PanelCopy({
  panel,
  isActive,
}: {
  panel: (typeof panels)[Space];
  isActive: boolean;
}) {
  return (
    <div className={styles.panelCopy}>
      <span className={styles.eyebrow}>{panel.eyebrow}</span>
      <h2>{panel.title}</h2>
      <p className={styles.panelBody}>{panel.body}</p>
      <p className={styles.caption}>{panel.caption}</p>
      <ul className={styles.bullets}>
        {panel.bullets.map((bullet) => (
          <li key={bullet}>{bullet}</li>
        ))}
      </ul>
      <span className={`${styles.cta} ${isActive ? styles.ctaActive : ""}`}>
        {isActive ? (
          <span className={styles.ctaActiveWrapper}>
            <span className={styles.ctaPulseDot} />
            <span>Entering {panel.title}...</span>
          </span>
        ) : (
          <span className={styles.ctaContent}>
            <span>Enter {panel.title}</span>
            <span className={styles.ctaArrow}>→</span>
          </span>
        )}
      </span>
    </div>
  );
}

