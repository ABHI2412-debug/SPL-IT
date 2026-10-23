"use client";

import {
  BudgetProgress,
  FinancialGoal,
  PersonRecord,
  PersonalTransaction,
  Settlement,
  SharedExpense,
  SpaceSummary,
} from "../types/dashboard";

const KEYS = {
  SPACES: "split_user_spaces",
  EXPENSES: "split_user_expenses",
  SETTLEMENTS: "split_user_settlements",
  TRANSACTIONS: "split_user_transactions",
  BUDGETS: "split_user_budgets",
  GOALS: "split_user_goals",
  CONTACTS: "split_user_contacts",
} as const;

function safeGetItem<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch (err) {
    console.warn(`[Persistence] Error reading ${key} from localStorage:`, err);
    return fallback;
  }
}

function safeSetItem<T>(key: string, value: T): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch (err) {
    console.warn(`[Persistence] Error saving ${key} to localStorage:`, err);
  }
}

export const StorageService = {
  loadSpaces: (fallback: SpaceSummary[] = []): SpaceSummary[] =>
    safeGetItem(KEYS.SPACES, fallback),
  saveSpaces: (spaces: SpaceSummary[]): void =>
    safeSetItem(KEYS.SPACES, spaces),

  loadExpenses: (fallback: SharedExpense[] = []): SharedExpense[] =>
    safeGetItem(KEYS.EXPENSES, fallback),
  saveExpenses: (expenses: SharedExpense[]): void =>
    safeSetItem(KEYS.EXPENSES, expenses),

  loadSettlements: (fallback: Settlement[] = []): Settlement[] =>
    safeGetItem(KEYS.SETTLEMENTS, fallback),
  saveSettlements: (settlements: Settlement[]): void =>
    safeSetItem(KEYS.SETTLEMENTS, settlements),

  loadTransactions: (fallback: PersonalTransaction[] = []): PersonalTransaction[] =>
    safeGetItem(KEYS.TRANSACTIONS, fallback),
  saveTransactions: (transactions: PersonalTransaction[]): void =>
    safeSetItem(KEYS.TRANSACTIONS, transactions),

  loadBudgets: (fallback: BudgetProgress[] = []): BudgetProgress[] =>
    safeGetItem(KEYS.BUDGETS, fallback),
  saveBudgets: (budgets: BudgetProgress[]): void =>
    safeSetItem(KEYS.BUDGETS, budgets),

  loadGoals: (fallback: FinancialGoal[] = []): FinancialGoal[] =>
    safeGetItem(KEYS.GOALS, fallback),
  saveGoals: (goals: FinancialGoal[]): void =>
    safeSetItem(KEYS.GOALS, goals),

  loadContacts: (fallback: PersonRecord[] = []): PersonRecord[] =>
    safeGetItem(KEYS.CONTACTS, fallback),
  saveContacts: (contacts: PersonRecord[]): void =>
    safeSetItem(KEYS.CONTACTS, contacts),

  clearAllData: (): void => {
    if (typeof window === "undefined") return;
    Object.values(KEYS).forEach((k) => window.localStorage.removeItem(k));
  },
};
