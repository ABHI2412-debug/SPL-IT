"use client";

import Image from "next/image";
import type { BackdropBlurMode, SpaceType } from "@/lib/types/dashboard";
import styles from "./dashboard-backdrop.module.css";

interface DashboardBackdropProps {
  currentSpace: SpaceType;
  blurMode?: BackdropBlurMode;
}

const BLUR_CONFIGS: Record<BackdropBlurMode, { blur: string; scale: string; brightness: string; saturate: string }> = {
  deep: { blur: "36px", scale: "1.14", brightness: "0.85", saturate: "1.28" },
  soft: { blur: "18px", scale: "1.08", brightness: "0.88", saturate: "1.18" },
  abstract: { blur: "68px", scale: "1.20", brightness: "0.82", saturate: "1.35" },
  off: { blur: "0px", scale: "1.00", brightness: "0.90", saturate: "1.00" },
};

export function DashboardBackdrop({ currentSpace, blurMode = "deep" }: DashboardBackdropProps) {
  const isTrip = currentSpace === "trip";
  const isLocal = currentSpace === "local";

  const cfg = BLUR_CONFIGS[blurMode] || BLUR_CONFIGS.deep;

  const styleVars = {
    "--backdrop-blur": cfg.blur,
    "--backdrop-scale": cfg.scale,
    "--backdrop-brightness": cfg.brightness,
    "--backdrop-saturate": cfg.saturate,
  } as React.CSSProperties;

  return (
    <div className={styles.backdropWrapper} style={styleVars} aria-hidden="true">
      {/* 1. Trip Scene (Forest Ledger Scenery) */}
      <div
        className={`${styles.scene} ${
          isTrip ? styles.sceneActive : styles.sceneInactive
        }`}
      >
        <div className={styles.tripBackdrop}>
          <div className={styles.sceneryCanvas}>
            <Image
              src="/images/trip-scenery.avif"
              alt="Forest scenery for the Trip section"
              fill
              priority
              sizes="100vw"
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
          {/* Forest Canopy Sunbeam & Morning Mist Entrance Sweep */}
          {isTrip && (
            <div className="absolute inset-0 pointer-events-none overflow-hidden z-[2] animate-forest-sweep">
              <div className="absolute -top-1/4 left-1/4 w-[750px] h-[1000px] bg-gradient-to-br from-[#e0a875]/25 via-[#6e8d80]/20 to-transparent rounded-full blur-3xl transform -rotate-12" />
              <div className="absolute top-1/3 -left-20 w-[900px] h-[500px] bg-gradient-to-r from-[#9cc79d]/20 via-[#5d7c87]/15 to-transparent rounded-full blur-2xl" />
            </div>
          )}
          {/* Dashboard contrast veil for readable widgets */}
          <div className={styles.tripVeil} />
        </div>
      </div>

      {/* 2. Room Scene (Local Sunset Room Scenery) */}
      <div
        className={`${styles.scene} ${
          isLocal ? styles.sceneActive : styles.sceneInactive
        }`}
      >
        <div className={styles.roomBackdrop}>
          <div className={styles.sceneryCanvas}>
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
          {/* Dashboard contrast veil for readable widgets */}
          <div className={styles.roomVeil} />
        </div>
      </div>

      {/* Peripheral Vignette for gentle focus framing */}
      <div className={styles.vignette} />

      {/* Atmospheric Texture Grain */}
      <div className={styles.grain} />
    </div>
  );
}
