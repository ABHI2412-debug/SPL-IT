"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { startTransition, useEffect, useState } from "react";
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
  const router = useRouter();
  const [active, setActive] = useState<Space | null>(null);

  useEffect(() => {
    if (!active) {
      return;
    }

    const timeout = window.setTimeout(() => {
      router.push(`/${active}`);
    }, 900);

    return () => window.clearTimeout(timeout);
  }, [active, router]);

  const handleSelect = (space: Space) => {
    if (active) {
      return;
    }

    startTransition(() => {
      setActive(space);
    });
  };

  return (
    <main className={styles.page}>
      <div className={styles.grain} />
      <header className={styles.topbar}>
        <Link className={styles.brand} href="/">
          <span className={styles.brandMark}>S</span>
          <span>SPLit</span>
        </Link>
        <p className={styles.brandNote}>Choose the world your shared money belongs to.</p>
      </header>

      <section className={styles.hero} data-active={active ?? ""}>
        <button
          type="button"
          className={`${styles.panel} ${styles.tripPanel}`}
          onClick={() => handleSelect("trip")}
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
        <div className={styles.centerCopy}>
          <span className={styles.centerLabel}>SPLit</span>
          <h1>Split by feeling, not just by amount.</h1>
          <p>
            One side holds your travel stories. The other keeps the everyday circle tidy.
            Pick a side and the page leans fully into that space.
          </p>
        </div>
      </section>
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
      <span className={styles.cta}>{isActive ? "Opening..." : `Enter ${panel.title}`}</span>
    </div>
  );
}

