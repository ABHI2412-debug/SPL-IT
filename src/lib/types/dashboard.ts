export type SpaceType = "trip" | "local";

export type BackdropBlurMode = "deep" | "soft" | "abstract" | "off";

export type TripTab = "home" | "spaces" | "expenses" | "settlements" | "analytics";
export type PersonalTab = "home" | "transactions" | "budgets" | "analytics" | "goals";

export interface BalanceOverviewData {
  totalNet: number;
  youOwe: number;
  othersOwe: number;
  currency: string;
  trend: string;
}

export interface ParticipantMember {
  name: string;
  email: string;
  phone?: string;
  description?: string;
  avatar?: string;
}

export interface PersonRecord {
  id: string;
  name: string;
  email: string;
  phone?: string;
  description?: string;
  avatar?: string;
  lastTrip?: string;
  createdAt?: string;
}

export interface InteractiveTableMember {
  id?: string;
  name: string;
  email: string;
  phone: string;
  description: string;
  selected?: boolean;
  isExisting?: boolean;
}

export interface InteractiveTableData {
  destination: string;
  dates: string;
  coverUrl: string;
  matchedMembers: InteractiveTableMember[];
  missingNames: string[];
}

export interface SpaceSummary {
  id: string;
  name: string;
  type: "trip" | "local";
  location?: string;
  membersCount: number;
  memberNames: string[];
  memberEmails?: Record<string, string>; // e.g. { "Aman K.": "aman@example.com" }
  participants?: ParticipantMember[];
  totalSpend: number;
  userBalance: number;
  balanceStatus: "owed" | "owe" | "settled";
  recentActivity: string;
  coverUrl: string;
  status: "Active" | "Upcoming" | "Settled";
  dates?: string;
}

export interface SharedExpense {
  id: string;
  description: string;
  amount: number;
  currency: string;
  category?: string;
  paidBy: string;
  paidByAvatar?: string;
  isPaidByYou: boolean;
  spaceName: string;
  spaceId: string;
  date: string;
  splitType: "equal" | "exact" | "percentage" | "shares";
  userShare: number;
}

export interface Settlement {
  id: string;
  fromUser: string;
  toUser: string;
  amount: number;
  currency: string;
  spaceName: string;
  status: "pending" | "completed";
  date: string;
  isYouPaying?: boolean;
  isYouReceiving?: boolean;
}

export interface ActivityItem {
  id: string;
  actor: string;
  actorInitial: string;
  action: string;
  spaceName: string;
  amount?: number;
  currency?: string;
  timestamp: string;
  badgeColor?: "emerald" | "amber" | "sky" | "rose";
}

export interface PersonalSummary {
  recordedIncome: number;
  recordedExpenses: number;
  netCashFlow: number;
  currency: string;
  savingsRate: number;
  monthChangePercent: number;
}

export interface PersonalTransaction {
  id: string;
  title: string;
  amount: number;
  type: "income" | "expense" | "transfer";
  category: string;
  account: string;
  date: string;
  notes?: string;
}

export interface BudgetProgress {
  id: string;
  category: string;
  categoryIcon: string;
  allocated: number;
  spent: number;
  currency: string;
  warningThreshold: number;
}

export interface UpcomingPayment {
  id: string;
  title: string;
  amount: number;
  currency: string;
  dueDate: string;
  frequency: "monthly" | "yearly" | "weekly";
  category: string;
  autoPay: boolean;
  daysRemaining: number;
}

export interface FinancialGoal {
  id: string;
  title: string;
  currentAmount: number;
  targetAmount: number;
  currency: string;
  targetDate: string;
  category: string;
}

export interface SpendingDataPoint {
  label: string;
  amount: number;
  previousAmount?: number;
}

export interface CategorySpending {
  category: string;
  amount: number;
  percentage: number;
  color: string;
}
