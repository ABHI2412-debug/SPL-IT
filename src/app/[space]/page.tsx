import Link from "next/link";
import { notFound } from "next/navigation";
import styles from "./zone.module.css";
import { SpacePanel } from "./space-panel";

const spaces = {
  trip: {
    label: "Trip",
    eyebrow: "Travel section",
    options: [
      { name: "Manali Trip", amount: 3420 },
      { name: "Paris Trip", amount: 5860 },
      { name: "Goa Trip", amount: 2650 },
    ],
  },
  local: {
    label: "Local",
    eyebrow: "Everyday section",
    options: [
      { name: "Home Groceries", amount: 2420 },
      { name: "Rent + Utilities", amount: 2900 },
      { name: "Weekend Local Hangout", amount: 760 },
    ],
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
      <SpacePanel
        space={space as SpaceKey}
        content={content}
        backLink={
          <Link className={styles.primary} href="/">
            Back home
          </Link>
        }
      />
    </main>
  );
}
