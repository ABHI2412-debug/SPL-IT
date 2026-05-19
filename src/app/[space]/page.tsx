import Link from "next/link";
import { notFound } from "next/navigation";
import styles from "./zone.module.css";

const spaces = {
  trip: {
    label: "Trip",
    eyebrow: "Travel ledger",
    intro:
      "This space is for shared travel spending: tickets, hotel stays, fuel, cafe stops, group bookings, and the random little expenses that happen away from home.",
    vibe:
      "The colder, layered landscape keeps this world feeling adventurous and temporary, like a trip everyone remembers later.",
  },
  local: {
    label: "Local",
    eyebrow: "Everyday ledger",
    intro:
      "This space is for shared daily life: groceries, utilities, communal kitty items, subscriptions, snacks, and the routines you split with the people around you most often.",
    vibe:
      "The warmer room setting keeps this world grounded and intimate, so daily expense tracking feels close, calm, and familiar.",
  },
} as const;

type SpaceKey = keyof typeof spaces;

export function generateStaticParams() {
  return [{ space: "trip" }, { space: "local" }];
}

export default async function SpacePage({
  params,
}: {
  params: Promise<{ space: string }>;
}) {
  const { space } = await params;

  if (!(space in spaces)) {
    notFound();
  }

  const content = spaces[space as SpaceKey];

  return (
    <main className={`${styles.page} ${space === "trip" ? styles.trip : styles.local}`}>
      <div className={styles.overlay} />
      <section className={styles.card}>
        <span className={styles.eyebrow}>{content.eyebrow}</span>
        <h1>{content.label}</h1>
        <p>{content.intro}</p>
        <p>{content.vibe}</p>
        <div className={styles.actions}>
          <Link className={styles.primary} href="/">
            Back home
          </Link>
          <span className={styles.secondary}>Next step: connect this to auth and grouped expenses.</span>
        </div>
      </section>
    </main>
  );
}
