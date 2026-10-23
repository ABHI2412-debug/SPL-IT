import fs from "fs/promises";
import path from "path";
import {
  SpaceSummary,
  SharedExpense,
  Settlement,
  PersonalTransaction,
  BudgetProgress,
  FinancialGoal,
} from "../types/dashboard";

export interface DatabaseSchema {
  trips: SpaceSummary[];
  expenses: SharedExpense[];
  settlements: Settlement[];
  transactions: PersonalTransaction[];
  budgets: BudgetProgress[];
  goals: FinancialGoal[];
  lastUpdated: string;
}

export const INITIAL_SEED_DATABASE: DatabaseSchema = {
  trips: [
    {
      id: "a0000000-0000-0000-0000-000000000001",
      name: "Goa Beach & Sun Weekend",
      type: "trip",
      location: "North Goa, India",
      dates: "12 Nov - 16 Nov 2026",
      membersCount: 4,
      memberNames: ["You", "Aman", "Rhea", "Vikram"],
      totalSpend: 29500,
      userBalance: 6500,
      balanceStatus: "owed",
      recentActivity: "Aman paid Thalassa Dinner",
      coverUrl:
        "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80",
      status: "Active",
    },
    {
      id: "a0000000-0000-0000-0000-000000000002",
      name: "Himalayan Trek & Cabin",
      type: "trip",
      location: "Manali, Himachal Pradesh",
      dates: "05 Dec - 10 Dec 2026",
      membersCount: 2,
      memberNames: ["You", "Aman"],
      totalSpend: 5500,
      userBalance: 2750,
      balanceStatus: "owed",
      recentActivity: "You paid Camping Gear Deposit",
      coverUrl:
        "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1200&q=80",
      status: "Upcoming",
    },
    {
      id: "a0000000-0000-0000-0000-000000000003",
      name: "Jaipur Heritage Stories",
      type: "trip",
      location: "Jaipur, Rajasthan",
      dates: "18 Sep - 21 Sep 2026",
      membersCount: 2,
      memberNames: ["You", "Rhea"],
      totalSpend: 18200,
      userBalance: 0,
      balanceStatus: "settled",
      recentActivity: "All debts settled & closed",
      coverUrl:
        "https://images.unsplash.com/photo-1599661046289-e31897846e41?auto=format&fit=crop&w=1200&q=80",
      status: "Settled",
    },
  ],
  expenses: [
    {
      id: "e0000000-0000-0000-0000-000000000001",
      description: "Beachside Villa 3 Nights",
      amount: 18500,
      currency: "₹",
      paidBy: "You",
      isPaidByYou: true,
      spaceName: "Goa Beach & Sun Weekend",
      spaceId: "a0000000-0000-0000-0000-000000000001",
      date: "12 Nov",
      splitType: "equal",
      userShare: 4625,
    },
    {
      id: "e0000000-0000-0000-0000-000000000002",
      description: "Dinner at Thalassa Sunset Cafe",
      amount: 4800,
      currency: "₹",
      paidBy: "Aman",
      isPaidByYou: false,
      spaceName: "Goa Beach & Sun Weekend",
      spaceId: "a0000000-0000-0000-0000-000000000001",
      date: "13 Nov",
      splitType: "equal",
      userShare: 1200,
    },
    {
      id: "e0000000-0000-0000-0000-000000000003",
      description: "Self-Drive Thar & Fuel",
      amount: 6200,
      currency: "₹",
      paidBy: "Rhea",
      isPaidByYou: false,
      spaceName: "Goa Beach & Sun Weekend",
      spaceId: "a0000000-0000-0000-0000-000000000001",
      date: "14 Nov",
      splitType: "equal",
      userShare: 1550,
    },
    {
      id: "e0000000-0000-0000-0000-000000000004",
      description: "Trek Guide & Camping Gear Deposit",
      amount: 5500,
      currency: "₹",
      paidBy: "You",
      isPaidByYou: true,
      spaceName: "Himalayan Trek & Cabin",
      spaceId: "a0000000-0000-0000-0000-000000000002",
      date: "05 Dec",
      splitType: "equal",
      userShare: 2750,
    },
  ],
  settlements: [
    {
      id: "s0000000-0000-0000-0000-000000000001",
      fromUser: "Aman",
      toUser: "You",
      amount: 3425,
      currency: "₹",
      spaceName: "Goa Beach & Sun Weekend",
      status: "pending",
      date: "Today",
      isYouReceiving: true,
    },
    {
      id: "s0000000-0000-0000-0000-000000000002",
      fromUser: "Vikram",
      toUser: "You",
      amount: 3075,
      currency: "₹",
      spaceName: "Goa Beach & Sun Weekend",
      status: "pending",
      date: "Tomorrow",
      isYouReceiving: true,
    },
    {
      id: "s0000000-0000-0000-0000-000000000003",
      fromUser: "You",
      toUser: "Rhea",
      amount: 350,
      currency: "₹",
      spaceName: "Goa Beach & Sun Weekend",
      status: "completed",
      date: "15 Nov",
      isYouPaying: true,
    },
  ],
  transactions: [
    {
      id: "t0000000-0000-0000-0000-000000000001",
      title: "October Monthly Salary",
      amount: 85000,
      type: "income",
      category: "Salary / Income",
      account: "HDFC Salary Account",
      date: "Today, 21 Oct",
      notes: "Direct payroll credit",
    },
    {
      id: "t0000000-0000-0000-0000-000000000002",
      title: "Whole Foods & Nature Basket Grocery",
      amount: 3450,
      type: "expense",
      category: "Food & Groceries",
      account: "HDFC Salary Account",
      date: "Yesterday, 20 Oct",
      notes: "Organic veggies, almond milk, coffee",
    },
    {
      id: "t0000000-0000-0000-0000-000000000003",
      title: "High-Yield Savings Auto-Deposit",
      amount: 20000,
      type: "transfer",
      category: "Savings Transfer",
      account: "ICICI Savings",
      date: "18 Oct",
      notes: "Monthly discipline transfer",
    },
    {
      id: "t0000000-0000-0000-0000-000000000004",
      title: "Blue Tokai Specialty Coffee Roasters",
      amount: 420,
      type: "expense",
      category: "Food & Dining",
      account: "CRED / UPI Wallet",
      date: "17 Oct",
      notes: "Cold brew + croissant",
    },
    {
      id: "t0000000-0000-0000-0000-000000000005",
      title: "Cult.fit Gym & Fitness Pass",
      amount: 2999,
      type: "expense",
      category: "Health & Fitness",
      account: "HDFC Salary Account",
      date: "15 Oct",
      notes: "Quarterly elite membership",
    },
    {
      id: "t0000000-0000-0000-0000-000000000006",
      title: "Freelance UI/UX Advisory",
      amount: 24000,
      type: "income",
      category: "Freelance / Consulting",
      account: "ICICI Savings",
      date: "10 Oct",
      notes: "Fintech design sprint payout",
    },
  ],
  budgets: [
    {
      id: "b0000000-0000-0000-0000-000000000001",
      category: "Food & Groceries",
      categoryIcon: "🛒",
      allocated: 14000,
      spent: 8920,
      currency: "₹",
      warningThreshold: 80,
    },
    {
      id: "b0000000-0000-0000-0000-000000000002",
      category: "Dining Out & Cafes",
      categoryIcon: "☕",
      allocated: 9000,
      spent: 6400,
      currency: "₹",
      warningThreshold: 75,
    },
    {
      id: "b0000000-0000-0000-0000-000000000003",
      category: "Rent & Housing",
      categoryIcon: "🏠",
      allocated: 28000,
      spent: 28000,
      currency: "₹",
      warningThreshold: 95,
    },
    {
      id: "b0000000-0000-0000-0000-000000000004",
      category: "Transportation & Fuel",
      categoryIcon: "🚗",
      allocated: 6500,
      spent: 4200,
      currency: "₹",
      warningThreshold: 80,
    },
    {
      id: "b0000000-0000-0000-0000-000000000005",
      category: "Shopping & Gear",
      categoryIcon: "🛍️",
      allocated: 10000,
      spent: 3100,
      currency: "₹",
      warningThreshold: 70,
    },
    {
      id: "b0000000-0000-0000-0000-000000000006",
      category: "Health & Fitness",
      categoryIcon: "🏋️",
      allocated: 5000,
      spent: 2999,
      currency: "₹",
      warningThreshold: 80,
    },
  ],
  goals: [
    {
      id: "g0000000-0000-0000-0000-000000000001",
      title: "Kyoto Autumn Expedition",
      targetAmount: 180000,
      currentAmount: 92000,
      currency: "₹",
      targetDate: "Nov 2026",
      category: "Travel",
    },
    {
      id: "g0000000-0000-0000-0000-000000000002",
      title: "Emergency Safety Net (6 Months)",
      targetAmount: 250000,
      currentAmount: 165000,
      currency: "₹",
      targetDate: "Q1 2027",
      category: "Safety Net",
    },
    {
      id: "g0000000-0000-0000-0000-000000000003",
      title: "M4 Max Studio Setup",
      targetAmount: 220000,
      currentAmount: 140000,
      currency: "₹",
      targetDate: "Dec 2026",
      category: "Hardware",
    },
  ],
  lastUpdated: new Date().toISOString(),
};

const DB_DIR = path.join(process.cwd(), "data");
const DB_FILE = path.join(DB_DIR, "split-database.json");

let memoryCache: DatabaseSchema | null = null;

async function ensureDbFile(): Promise<DatabaseSchema> {
  try {
    await fs.mkdir(DB_DIR, { recursive: true });
    const raw = await fs.readFile(DB_FILE, "utf-8");
    const parsed = JSON.parse(raw) as DatabaseSchema;
    if (parsed && Array.isArray(parsed.trips) && Array.isArray(parsed.expenses)) {
      memoryCache = parsed;
      return parsed;
    }
  } catch {
    // Missing or invalid, initialize seed database
  }

  try {
    await fs.mkdir(DB_DIR, { recursive: true });
    await fs.writeFile(DB_FILE, JSON.stringify(INITIAL_SEED_DATABASE, null, 2), "utf-8");
  } catch (err) {
    // Read-only serverless filesystem (e.g. Vercel Lambda), fallback to memory cache
    console.warn("[Database] Disk write skipped (serverless filesystem):", err);
  }
  memoryCache = INITIAL_SEED_DATABASE;
  return INITIAL_SEED_DATABASE;
}

export async function getDatabase(): Promise<DatabaseSchema> {
  if (memoryCache) {
    return memoryCache;
  }
  return ensureDbFile();
}

export async function saveDatabase(data: DatabaseSchema): Promise<void> {
  data.lastUpdated = new Date().toISOString();
  memoryCache = data;
  try {
    await fs.mkdir(DB_DIR, { recursive: true });
    await fs.writeFile(DB_FILE, JSON.stringify(data, null, 2), "utf-8");
  } catch (err) {
    console.warn("[Database] Disk save skipped (serverless filesystem):", err);
  }
}

export async function resetDatabase(): Promise<DatabaseSchema> {
  const fresh = JSON.parse(JSON.stringify(INITIAL_SEED_DATABASE)) as DatabaseSchema;
  fresh.lastUpdated = new Date().toISOString();
  await saveDatabase(fresh);
  return fresh;
}
