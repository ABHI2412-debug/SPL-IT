import Link from "next/link";
import styles from "./split-landing.module.css";

const sections = [
  {
    href: "/trip",
    name: "Trip",
    subtitle: "Travel budgets and shared vacation expenses",
    amount: "$11,930.00",
    tone: "trip",
  },
  {
    href: "/local",
    name: "Local",
    subtitle: "Daily spends for home, groceries, and nearby plans",
    amount: "$6,080.00",
    tone: "local",
  },
] as const;

export function SplitLanding() {
  return (
    <main className={styles.page}>
      <section className={styles.shell}>
        <header className={styles.header}>
          <p className={styles.kicker}>SmartSplit</p>
          <h1>Choose your section</h1>
          <p className={styles.note}>Tap Trip or Local to view subtotal and all options inside that section.</p>
        </header>

        <div className={styles.stack}>
          {sections.map((section) => (
            <Link key={section.name} href={section.href} className={`${styles.card} ${styles[section.tone]}`}>
              <div>
                <p className={styles.label}>{section.name}</p>
                <p className={styles.subtitle}>{section.subtitle}</p>
              </div>
              <div className={styles.amountWrap}>
                <p className={styles.amountLabel}>Subtotal</p>
                <p className={styles.amount}>{section.amount}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
