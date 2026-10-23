"use client";

import { FormEvent, ReactNode, useMemo, useState } from "react";
import styles from "./zone.module.css";

type Option = {
  name: string;
  amount: number;
};

type SpaceContent = {
  label: string;
  eyebrow: string;
  options: readonly Option[];
};

export function SpacePanel({
  space,
  content,
  backLink,
}: {
  space: "trip" | "local";
  content: SpaceContent;
  backLink: ReactNode;
}) {
  const [options, setOptions] = useState<Option[]>([...content.options]);
  const [tripName, setTripName] = useState("");
  const [tripAmount, setTripAmount] = useState("");

  const subtotal = useMemo(
    () => options.reduce((sum, item) => sum + item.amount, 0),
    [options]
  );

  const canAdd = tripName.trim().length > 0 && Number(tripAmount) > 0;

  const handleAddTrip = (event: FormEvent) => {
    event.preventDefault();
    if (!canAdd) {
      return;
    }

    setOptions((current) => [
      ...current,
      { name: tripName.trim(), amount: Number(tripAmount) },
    ]);
    setTripName("");
    setTripAmount("");
  };

  return (
    <section className={styles.panel}>
      <span className={styles.eyebrow}>{content.eyebrow}</span>
      <h1>{content.label}</h1>
      <p className={styles.subtotalLabel}>Subtotal</p>
      <p className={styles.subtotal}>{formatCurrency(subtotal)}</p>

      <div className={styles.options}>
        {options.map((option) => (
          <article className={styles.optionCard} key={`${option.name}-${option.amount}`}>
            <h2>{option.name}</h2>
            <p>{formatCurrency(option.amount)}</p>
          </article>
        ))}
      </div>

      {space === "trip" ? (
        <form className={styles.addForm} onSubmit={handleAddTrip}>
          <h3>Add trip option</h3>
          <div className={styles.fieldRow}>
            <input
              className={styles.field}
              value={tripName}
              onChange={(event) => setTripName(event.target.value)}
              placeholder="Trip name"
            />
            <input
              className={styles.field}
              type="number"
              min="1"
              value={tripAmount}
              onChange={(event) => setTripAmount(event.target.value)}
              placeholder="Amount"
            />
            <button className={styles.addButton} type="submit" disabled={!canAdd}>
              + Add trip option
            </button>
          </div>
        </form>
      ) : null}

      <div className={styles.actions}>{backLink}</div>
    </section>
  );
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
  }).format(value);
}
