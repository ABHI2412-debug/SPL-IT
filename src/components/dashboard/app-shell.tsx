"use client";

import React, { useEffect, useState } from "react";
import { createClient } from "../../lib/supabase/client";
import {
  BackdropBlurMode,
  BudgetProgress,
  FinancialGoal,
  PersonRecord,
  PersonalTab,
  PersonalTransaction,
  Settlement,
  SharedExpense,
  SpaceSummary,
  SpaceType,
  TripTab,
} from "../../lib/types/dashboard";
import { BottomNav } from "./bottom-nav";
import { AiChatDrawer } from "./ai-chat-drawer";
import { SpotlightOverlay, SpotlightTarget } from "./spotlight-overlay";
import { AddExpenseModal } from "./modals/add-expense-modal";
import { AddPersonalTransactionModal } from "./modals/add-personal-transaction-modal";
import { AddBudgetModal } from "./modals/add-budget-modal";
import { AddGoalModal } from "./modals/add-goal-modal";
import { AuthModal } from "./modals/auth-modal";
import { CreateSpaceModal } from "./modals/create-space-modal";
import { ScanReceiptModal } from "./modals/scan-receipt-modal";
import { SettleUpModal } from "./modals/settle-up-modal";
import { ExportReceiptModal } from "./modals/export-receipt-modal";
import { SpaceDetailModal } from "./modals/space-detail-modal";
import { EmailNotificationPreviewModal, DispatchedEmailRecord } from "./modals/email-notification-preview-modal";
import { PersonalFinanceView } from "./personal-finance-view";
import { TopBar } from "./top-bar";
import { TripsSharedView } from "./trips-shared-view";
import { DashboardBackdrop } from "./dashboard-backdrop";
import { TripSpacesPage } from "./pages/trip-spaces-page";
import { TripExpensesPage } from "./pages/trip-expenses-page";
import { TripSettlementsPage } from "./pages/trip-settlements-page";
import { TripAnalyticsPage } from "./pages/trip-analytics-page";
import { PersonalTransactionsPage } from "./pages/personal-transactions-page";
import { PersonalBudgetsPage } from "./pages/personal-budgets-page";
import { PersonalAnalyticsPage } from "./pages/personal-analytics-page";
import { PersonalGoalsPage } from "./pages/personal-goals-page";
import { MOCK_CONTACTS, MOCK_SETTLEMENTS, MOCK_SPACES, MOCK_TRIP_BALANCE } from "../../lib/data/mock-data";
import { StorageService } from "../../lib/storage/persistence";
import { TypewriterPageTransition } from "../ui/typewriter-loader";

interface DashboardShellProps {
  initialSpace?: SpaceType;
  onReturnToLanding?: () => void;
}

export function DashboardShell({
  initialSpace = "trip",
  onReturnToLanding,
}: DashboardShellProps) {
  const [supabase] = useState(createClient);
  const [currentSpace, setCurrentSpace] = useState<SpaceType>(initialSpace);
  const [activeTripTab, setActiveTripTab] = useState<TripTab>("home");
  const [activePersonalTab, setActivePersonalTab] = useState<PersonalTab>("home");

  // Typewriter Page Transition State
  const [pageTransition, setPageTransition] = useState<{
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

  const handleSpaceChange = (newSpace: SpaceType) => {
    if (newSpace === currentSpace) return;

    setPageTransition({
      isVisible: true,
      message: newSpace === "trip" ? "Opening Forest Ledger..." : "Opening Room Ledger...",
      subMessage:
        newSpace === "trip"
          ? "Setting up shared travel expenses & group circles"
          : "Loading household balances & everyday budgets",
      theme: newSpace === "trip" ? "forest" : "room",
    });

    const timer = setTimeout(() => {
      setCurrentSpace(newSpace);
      if (newSpace === "trip") {
        setActiveTripTab("home");
      } else {
        setActivePersonalTab("home");
      }
      window.history.pushState(null, "", `/${newSpace}`);

      const hideTimer = setTimeout(() => {
        setPageTransition((prev) => ({ ...prev, isVisible: false }));
      }, 260);

      return () => clearTimeout(hideTimer);
    }, 550);

    return () => clearTimeout(timer);
  };

  const handleTripTabChange = (newTab: TripTab) => {
    if (newTab === activeTripTab && currentSpace === "trip") return;

    const tabDescriptions: Record<TripTab, { title: string; sub: string }> = {
      home: { title: "Opening Trip Home...", sub: "Collating trip balances & recent ledger" },
      spaces: { title: "Loading Travel Spaces...", sub: "Retrieving active trip groups & circles" },
      expenses: { title: "Drafting Expenses Ledger...", sub: "Loading itemized receipts & splits" },
      settlements: { title: "Calculating Settlements...", sub: "Generating UPI settle-ups & balances" },
      analytics: { title: "Compiling Travel Analytics...", sub: "Calculating category distributions & trends" },
    };

    const info = tabDescriptions[newTab] || { title: "Loading Page...", sub: "" };
    setPageTransition({
      isVisible: true,
      message: info.title,
      subMessage: info.sub,
      theme: "forest",
    });

    const timer = setTimeout(() => {
      setCurrentSpace("trip");
      setActiveTripTab(newTab);
      const hideTimer = setTimeout(() => {
        setPageTransition((prev) => ({ ...prev, isVisible: false }));
      }, 240);
      return () => clearTimeout(hideTimer);
    }, 480);

    return () => clearTimeout(timer);
  };

  const handlePersonalTabChange = (newTab: PersonalTab) => {
    if (newTab === activePersonalTab && currentSpace === "local") return;

    const tabDescriptions: Record<PersonalTab, { title: string; sub: string }> = {
      home: { title: "Opening Room Home...", sub: "Loading financial health & quick accounts" },
      transactions: { title: "Loading Transactions...", sub: "Compiling personal spending history" },
      budgets: { title: "Checking Budgets...", sub: "Tracking monthly caps & category limits" },
      analytics: { title: "Preparing Financial Insights...", sub: "Analyzing cash flow & savings rate" },
      goals: { title: "Loading Savings Goals...", sub: "Retrieving target balances & milestones" },
    };

    const info = tabDescriptions[newTab] || { title: "Loading Page...", sub: "" };
    setPageTransition({
      isVisible: true,
      message: info.title,
      subMessage: info.sub,
      theme: "room",
    });

    const timer = setTimeout(() => {
      setCurrentSpace("local");
      setActivePersonalTab(newTab);
      const hideTimer = setTimeout(() => {
        setPageTransition((prev) => ({ ...prev, isVisible: false }));
      }, 240);
      return () => clearTimeout(hideTimer);
    }, 480);

    return () => clearTimeout(timer);
  };

  const handleNavigateTab = (tab: string) => {
    if (["home", "spaces", "expenses", "settlements", "analytics"].includes(tab)) {
      handleTripTabChange(tab as TripTab);
    } else if (["transactions", "budgets", "goals"].includes(tab)) {
      handlePersonalTabChange(tab as PersonalTab);
    }
  };

  // Track space switch for cinematic space-transition animation
  const prevSpaceRef = React.useRef<SpaceType>(initialSpace);
  const isSpaceSwitch = prevSpaceRef.current !== currentSpace;
  React.useEffect(() => {
    prevSpaceRef.current = currentSpace;
  }, [currentSpace]);

  // User state
  const [user, setUser] = useState<{ id: string; phone?: string | null } | null>(null);

  // Ambience / Backdrop Blur state (default: "deep" = 36px bokeh blur)
  const [blurMode, setBlurMode] = useState<BackdropBlurMode>("deep");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("split_backdrop_blur") as BackdropBlurMode | null;
      if (saved && ["deep", "soft", "abstract", "off"].includes(saved)) {
        setBlurMode(saved);
      }
    }
  }, []);

  const handleBlurModeChange = (mode: BackdropBlurMode) => {
    setBlurMode(mode);
    if (typeof window !== "undefined") {
      localStorage.setItem("split_backdrop_blur", mode);
    }
  };

  // Dynamic user data combined with mock data
  const [userExpenses, setUserExpenses] = useState<SharedExpense[]>([]);
  const [userSpaces, setUserSpaces] = useState<SpaceSummary[]>([]);
  const [settlements, setSettlements] = useState(MOCK_SETTLEMENTS);

  // Dynamic personal finance data
  const [userTransactions, setUserTransactions] = useState<PersonalTransaction[]>([]);
  const [userBudgets, setUserBudgets] = useState<BudgetProgress[]>([]);
  const [userGoals, setUserGoals] = useState<FinancialGoal[]>([]);

  // Contacts directory database
  const [contacts, setContacts] = useState<PersonRecord[]>([]);

  useEffect(() => {
    setContacts(StorageService.loadContacts(MOCK_CONTACTS));
  }, []);

  const handleBatchSaveContacts = (newContacts: PersonRecord[]) => {
    setContacts((prev) => {
      const existingEmails = new Set(prev.map((c) => c.email.toLowerCase()));
      const toAdd = newContacts.filter((c) => !existingEmails.has(c.email.toLowerCase()));
      const updated = [...prev, ...toAdd];
      StorageService.saveContacts(updated);
      return updated;
    });
    showToast(`Saved ${newContacts.length} new contact(s) to database!`);
  };

  // Modals state
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showAddExpense, setShowAddExpense] = useState(false);
  const [showAddTransaction, setShowAddTransaction] = useState(false);
  const [showAddBudget, setShowAddBudget] = useState(false);
  const [showAddGoal, setShowAddGoal] = useState(false);
  const [showCreateSpace, setShowCreateSpace] = useState(false);
  const [showSettleUp, setShowSettleUp] = useState(false);
  const [selectedSettlementId, setSelectedSettlementId] = useState<string | undefined>(undefined);
  const [showScanReceipt, setShowScanReceipt] = useState(false);
  const [showExportReceipt, setShowExportReceipt] = useState(false);
  const [receiptSpaceId, setReceiptSpaceId] = useState<string | undefined>(undefined);
  const [receiptMode, setReceiptMode] = useState<"trip" | "personal">("trip");
  const [selectedSpaceForDetail, setSelectedSpaceForDetail] = useState<SpaceSummary | null>(null);

  // Email Notification Dispatch Preview state
  const [showEmailPreview, setShowEmailPreview] = useState(false);
  const [emailDispatchData, setEmailDispatchData] = useState<{
    dispatches: DispatchedEmailRecord[];
    spaceName: string;
    expenseDescription: string;
    totalAmount: number;
    paidBy: string;
  } | null>(null);

  // AI Spotlight state
  const [spotlightTarget, setSpotlightTarget] = useState<SpotlightTarget | null>(null);

  const handleSpotlight = (target: { id: string; label: string; description: string }) => {
    setSpotlightTarget(target);
  };

  const handleSpotlightDismiss = () => {
    setSpotlightTarget(null);
  };

  const handleOpenReceipt = (spaceId?: string, mode: "trip" | "personal" = "trip") => {
    setReceiptSpaceId(spaceId);
    setReceiptMode(mode);
    setShowExportReceipt(true);
  };

  // Global Search
  const [globalSearchQuery, setGlobalSearchQuery] = useState("");

  // Toast / notification feedback
  const [feedbackToast, setFeedbackToast] = useState<string | null>(null);

  const isHydrated = React.useRef(false);

  // 1. Initial hydration from /api/database with localStorage fallback
  useEffect(() => {
    let isMounted = true;

    async function loadFromDatabase() {
      try {
        const res = await fetch("/api/database");
        const json = await res.json();
        if (isMounted && json.success && json.data) {
          const { trips, expenses, settlements: sets, transactions, budgets, goals } = json.data;
          if (Array.isArray(trips) && trips.length > 0) setUserSpaces(trips);
          if (Array.isArray(expenses) && expenses.length > 0) setUserExpenses(expenses);
          if (Array.isArray(sets) && sets.length > 0) setSettlements(sets);
          if (Array.isArray(transactions) && transactions.length > 0) setUserTransactions(transactions);
          if (Array.isArray(budgets) && budgets.length > 0) setUserBudgets(budgets);
          if (Array.isArray(goals) && goals.length > 0) setUserGoals(goals);

          isHydrated.current = true;
          return;
        }
      } catch (err) {
        console.warn("[AppShell] Database fetch failed, falling back to local storage:", err);
      }

      // Fallback to localStorage if fetch failed
      if (isMounted) {
        const savedSpaces = StorageService.loadSpaces([]);
        const savedExpenses = StorageService.loadExpenses([]);
        const savedSettlements = StorageService.loadSettlements(MOCK_SETTLEMENTS);
        const savedTransactions = StorageService.loadTransactions([]);
        const savedBudgets = StorageService.loadBudgets([]);
        const savedGoals = StorageService.loadGoals([]);

        if (savedSpaces.length > 0) setUserSpaces(savedSpaces);
        if (savedExpenses.length > 0) setUserExpenses(savedExpenses);
        if (savedSettlements.length > 0) setSettlements(savedSettlements);
        if (savedTransactions.length > 0) setUserTransactions(savedTransactions);
        if (savedBudgets.length > 0) setUserBudgets(savedBudgets);
        if (savedGoals.length > 0) setUserGoals(savedGoals);

        isHydrated.current = true;
      }
    }

    void loadFromDatabase();

    return () => {
      isMounted = false;
    };
  }, []);

  // 2. Persist to localStorage whenever state changes as secondary offline cache
  useEffect(() => {
    if (!isHydrated.current) return;
    StorageService.saveSpaces(userSpaces);
  }, [userSpaces]);

  useEffect(() => {
    if (!isHydrated.current) return;
    StorageService.saveExpenses(userExpenses);
  }, [userExpenses]);

  useEffect(() => {
    if (!isHydrated.current) return;
    StorageService.saveSettlements(settlements);
  }, [settlements]);

  useEffect(() => {
    if (!isHydrated.current) return;
    StorageService.saveTransactions(userTransactions);
  }, [userTransactions]);

  useEffect(() => {
    if (!isHydrated.current) return;
    StorageService.saveBudgets(userBudgets);
  }, [userBudgets]);

  useEffect(() => {
    if (!isHydrated.current) return;
    StorageService.saveGoals(userGoals);
  }, [userGoals]);

  // Supabase Auth Listener
  useEffect(() => {
    let isMounted = true;
    supabase.auth.getSession().then(({ data }) => {
      if (isMounted && data.session) {
        setUser({ id: data.session.user.id, phone: data.session.user.phone });
      }
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (isMounted) {
        setUser(session ? { id: session.user.id, phone: session.user.phone } : null);
      }
    });

    return () => {
      isMounted = false;
      listener.subscription.unsubscribe();
    };
  }, [supabase.auth]);

  const showToast = (message: string) => {
    setFeedbackToast(message);
    setTimeout(() => setFeedbackToast(null), 3000);
  };

  const handleExpenseAdded = async (expense: SharedExpense) => {
    setUserExpenses((prev) => [expense, ...prev]);

    // Find the target space to get participant list
    const targetSpace = userSpaces.find((s) => s.id === expense.spaceId) ||
      MOCK_SPACES.find((s) => s.id === expense.spaceId) || {
        id: expense.spaceId,
        name: expense.spaceName,
        membersCount: 4,
        memberNames: ["You", "Rahul S.", "Priya M.", "Karan V."],
      };

    const members = (targetSpace.memberNames && targetSpace.memberNames.length > 0)
      ? targetSpace.memberNames
      : ["You", "Rahul S.", "Priya M.", "Karan V."];

    const sharePerPerson = Math.round(expense.amount / Math.max(members.length, 1));
    const isPaidByYou = expense.paidBy === "You";

    const newSettlements: Settlement[] = [];

    if (isPaidByYou) {
      // You paid -> every other participant owes You their share
      members
        .filter((m) => m !== "You")
        .forEach((m) => {
          newSettlements.push({
            id: `set-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
            fromUser: m,
            toUser: "You",
            amount: sharePerPerson,
            currency: expense.currency || "₹",
            spaceName: expense.spaceName,
            status: "pending",
            date: "Due now",
            isYouPaying: false,
            isYouReceiving: true,
          });
        });
    } else {
      // Someone else paid -> You owe the payer your share
      newSettlements.push({
        id: `set-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        fromUser: "You",
        toUser: expense.paidBy,
        amount: sharePerPerson,
        currency: expense.currency || "₹",
        spaceName: expense.spaceName,
        status: "pending",
        date: "Due now",
        isYouPaying: true,
        isYouReceiving: false,
      });
    }

    if (newSettlements.length > 0) {
      setSettlements((prev) => [...newSettlements, ...prev]);
    }

    // Update space totalSpend & userBalance locally
    setUserSpaces((prev) =>
      prev.map((s) => {
        if (s.id === expense.spaceId) {
          const deltaBalance = isPaidByYou ? expense.amount - sharePerPerson : -sharePerPerson;
          const updatedBalance = (s.userBalance || 0) + deltaBalance;
          return {
            ...s,
            totalSpend: (s.totalSpend || 0) + expense.amount,
            userBalance: updatedBalance,
            balanceStatus: updatedBalance > 0 ? "owed" : updatedBalance < 0 ? "owe" : "settled",
            recentActivity: `${expense.paidBy} added ${expense.description}`,
          };
        }
        return s;
      })
    );

    showToast(`Saved to Database: "${expense.description}" (₹${expense.amount.toLocaleString("en-IN")})`);

    // Persist expense & new settlements to server database
    try {
      await fetch("/api/database", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ table: "expenses", data: expense }),
      });

      for (const st of newSettlements) {
        await fetch("/api/database", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ table: "settlements", data: st }),
        });
      }
    } catch (err) {
      console.warn("[AppShell] Failed saving expense/settlements to server DB:", err);
    }

    // Optional Supabase cloud sync
    try {
      await supabase.from("expenses").insert({
        trip_id: expense.spaceId,
        description: expense.description,
        amount: expense.amount,
        paid_by_name: expense.paidBy,
        split_type: expense.splitType,
      });
    } catch {
      // Ignored if cloud DB offline
    }
  };

  const handleDeleteExpense = async (expenseId: string) => {
    const deletedExp = userExpenses.find((e) => e.id === expenseId);
    setUserExpenses((prev) => prev.filter((e) => e.id !== expenseId));

    if (deletedExp && deletedExp.spaceId) {
      setUserSpaces((prev) =>
        prev.map((s) => {
          if (s.id === deletedExp.spaceId) {
            return {
              ...s,
              totalSpend: Math.max(0, (s.totalSpend || 0) - deletedExp.amount),
            };
          }
          return s;
        })
      );
    }

    showToast("Expense removed from database.");

    // Delete from server database
    try {
      await fetch(`/api/database?table=expenses&id=${encodeURIComponent(expenseId)}`, {
        method: "DELETE",
      });
    } catch (err) {
      console.warn("[AppShell] Failed deleting expense from server DB:", err);
    }

    // Optional Supabase sync
    try {
      await supabase.from("expenses").delete().eq("id", expenseId);
    } catch {
      // Ignored
    }
  };

  const handleResetData = async () => {
    StorageService.clearAllData();

    try {
      const res = await fetch("/api/database", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "reset" }),
      });
      const json = await res.json();
      if (json.success && json.data) {
        setUserSpaces(json.data.trips);
        setUserExpenses(json.data.expenses);
        setSettlements(json.data.settlements);
        setUserTransactions(json.data.transactions);
        setUserBudgets(json.data.budgets);
        setUserGoals(json.data.goals);
        setContacts(MOCK_CONTACTS);
        StorageService.saveContacts(MOCK_CONTACTS);
        showToast("Database restored to fresh seed trips & expenses!");
        return;
      }
    } catch (err) {
      console.warn("[AppShell] Error resetting DB:", err);
    }

    setUserExpenses([]);
    setUserSpaces([]);
    setSettlements(MOCK_SETTLEMENTS);
    setUserTransactions([]);
    setUserBudgets([]);
    setUserGoals([]);
    setContacts(MOCK_CONTACTS);
    StorageService.saveContacts(MOCK_CONTACTS);
    showToast("Local ledger reset.");
  };

  const handleSpaceCreated = async (space: SpaceSummary) => {
    setUserSpaces((prev) => [space, ...prev]);
    showToast(`Saved to Database: "${space.name}"`);

    // Persist to server database
    try {
      await fetch("/api/database", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ table: "trips", data: space }),
      });
    } catch (err) {
      console.warn("[AppShell] Failed saving trip to server DB:", err);
    }

    // Optional Supabase sync
    try {
      await supabase.from("trips").insert({
        id: space.id,
        name: space.name,
        location: space.location,
        cover_url: space.coverUrl,
        status: space.status,
      });
    } catch {
      // Ignored
    }
  };

  const handleUpdateSpace = async (updatedSpace: SpaceSummary) => {
    setUserSpaces((prev) =>
      prev.map((s) => (s.id === updatedSpace.id ? updatedSpace : s))
    );
    showToast(`Updated "${updatedSpace.name}" members & emails.`);

    try {
      await fetch("/api/database", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ table: "trips", data: updatedSpace }),
      });
    } catch (err) {
      console.warn("[AppShell] Failed updating trip in DB:", err);
    }
  };

  const handleSettled = async (settlementId: string) => {
    setSettlements((prev) =>
      prev.map((s) => (s.id === settlementId ? { ...s, status: "completed" as const } : s))
    );
    showToast("Settlement recorded and cleared.");

    try {
      await fetch("/api/database", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          table: "settlements",
          id: settlementId,
          data: { status: "completed" },
        }),
      });
    } catch (err) {
      console.warn("[AppShell] Failed updating settlement:", err);
    }
  };

  const handleReceiptScanned = async (extracted: { description: string; amount: number; category?: string }) => {
    if (currentSpace === "local") {
      const todayStr = new Date().toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
      });
      const newTx: PersonalTransaction = {
        id: `tx-${Date.now()}`,
        title: extracted.description || "Scanned Receipt Expense",
        amount: extracted.amount,
        type: "expense",
        category: extracted.category || "Food & Dining",
        account: "Scanned Receipt",
        date: `Today, ${todayStr}`,
        notes: "Recorded via SPLit receipt scan",
      };
      await handleTransactionAdded(newTx);
      showToast(`Receipt Scanned & Recorded: ₹${extracted.amount.toLocaleString("en-IN")}`);
      return;
    }

    const targetSpace = userSpaces[0] || { id: "a0000000-0000-0000-0000-000000000001", name: "Goa Beach & Sun Weekend" };
    const newExpense: SharedExpense = {
      id: `e-${Date.now()}`,
      description: extracted.description,
      amount: extracted.amount,
      currency: "₹",
      paidBy: "You",
      isPaidByYou: true,
      spaceName: targetSpace.name,
      spaceId: targetSpace.id,
      date: new Date().toLocaleDateString("en-IN", { day: "numeric", month: "short" }),
      splitType: "equal",
      userShare: Math.round(extracted.amount / 2),
    };
    await handleExpenseAdded(newExpense);
    showToast(`Receipt Scanned & Saved to Database: ₹${extracted.amount.toLocaleString("en-IN")}`);
  };

  const handleTransactionAdded = async (tx: PersonalTransaction) => {
    setUserTransactions((prev) => [tx, ...prev]);

    // If expense, dynamically update matching budget's spent amount
    if (tx.type === "expense") {
      setUserBudgets((prev) =>
        prev.map((b) => {
          if (
            b.category.toLowerCase().includes(tx.category.toLowerCase()) ||
            tx.category.toLowerCase().includes(b.category.toLowerCase())
          ) {
            const updatedSpent = b.spent + tx.amount;
            fetch("/api/database", {
              method: "PUT",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                table: "budgets",
                id: b.id,
                data: { spent: updatedSpent },
              }),
            }).catch((err) => console.warn("[AppShell] Failed updating budget spent in DB:", err));
            return { ...b, spent: updatedSpent };
          }
          return b;
        })
      );
    }

    showToast(`Saved to Database: "${tx.title}" (₹${tx.amount.toLocaleString("en-IN")})`);

    // Persist to server database
    try {
      await fetch("/api/database", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ table: "transactions", data: tx }),
      });
    } catch (err) {
      console.warn("[AppShell] Failed saving transaction to server DB:", err);
    }

    try {
      await supabase.from("personal_transactions").insert({
        title: tx.title,
        amount: tx.amount,
        type: tx.type,
        category: tx.category,
        account: tx.account,
        date: tx.date,
        notes: tx.notes || null,
      });
    } catch {
      // Ignored
    }
  };

  const handleDeleteTransaction = async (txId: string) => {
    const deletedTx = userTransactions.find((t) => t.id === txId);
    setUserTransactions((prev) => prev.filter((t) => t.id !== txId));

    // If it was an expense, adjust matching budget
    if (deletedTx && deletedTx.type === "expense") {
      setUserBudgets((prev) =>
        prev.map((b) => {
          if (
            b.category.toLowerCase().includes(deletedTx.category.toLowerCase()) ||
            deletedTx.category.toLowerCase().includes(b.category.toLowerCase())
          ) {
            const updatedSpent = Math.max(0, b.spent - deletedTx.amount);
            fetch("/api/database", {
              method: "PUT",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                table: "budgets",
                id: b.id,
                data: { spent: updatedSpent },
              }),
            }).catch((err) => console.warn("[AppShell] Failed updating budget spent in DB:", err));
            return { ...b, spent: updatedSpent };
          }
          return b;
        })
      );
    }

    showToast("Transaction removed from history.");

    try {
      await fetch(`/api/database?table=transactions&id=${encodeURIComponent(txId)}`, {
        method: "DELETE",
      });
    } catch (err) {
      console.warn("[AppShell] Failed deleting transaction from server DB:", err);
    }

    try {
      await supabase.from("personal_transactions").delete().eq("id", txId);
    } catch {
      // Ignored
    }
  };

  const handleBudgetAdded = async (bgt: BudgetProgress) => {
    setUserBudgets((prev) => [bgt, ...prev]);
    showToast(`Budget for "${bgt.category}" saved to Database (₹${bgt.allocated.toLocaleString("en-IN")})`);

    // Persist to server database
    try {
      await fetch("/api/database", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ table: "budgets", data: bgt }),
      });
    } catch (err) {
      console.warn("[AppShell] Failed saving budget to server DB:", err);
    }

    try {
      await supabase.from("personal_budgets").insert({
        category: bgt.category,
        category_icon: bgt.categoryIcon,
        allocated: bgt.allocated,
        spent: bgt.spent,
        currency: bgt.currency,
        warning_threshold: bgt.warningThreshold,
      });
    } catch {
      // Ignored
    }
  };

  const handleDeleteBudget = async (budgetId: string) => {
    setUserBudgets((prev) => prev.filter((b) => b.id !== budgetId));
    showToast("Budget removed from database.");

    try {
      await fetch(`/api/database?table=budgets&id=${encodeURIComponent(budgetId)}`, {
        method: "DELETE",
      });
    } catch (err) {
      console.warn("[AppShell] Failed deleting budget from server DB:", err);
    }

    try {
      await supabase.from("personal_budgets").delete().eq("id", budgetId);
    } catch {
      // Ignored
    }
  };

  const handleGoalAdded = async (goal: FinancialGoal) => {
    setUserGoals((prev) => [goal, ...prev]);
    showToast(`Goal "${goal.title}" saved to Database (₹${goal.targetAmount.toLocaleString("en-IN")})`);

    // Persist to server database
    try {
      await fetch("/api/database", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ table: "goals", data: goal }),
      });
    } catch (err) {
      console.warn("[AppShell] Failed saving goal to server DB:", err);
    }

    try {
      await supabase.from("personal_goals").insert({
        title: goal.title,
        target_amount: goal.targetAmount,
        current_amount: goal.currentAmount,
        currency: goal.currency,
        target_date: goal.targetDate,
        category: goal.category,
      });
    } catch {
      // Ignored
    }
  };

  const handleDeleteGoal = async (goalId: string) => {
    setUserGoals((prev) => prev.filter((g) => g.id !== goalId));
    showToast("Goal removed from database.");

    try {
      await fetch(`/api/database?table=goals&id=${encodeURIComponent(goalId)}`, {
        method: "DELETE",
      });
    } catch (err) {
      console.warn("[AppShell] Failed deleting goal from server DB:", err);
    }

    try {
      await supabase.from("personal_goals").delete().eq("id", goalId);
    } catch {
      // Ignored
    }
  };

  const handleDeleteSpace = async (spaceId: string) => {
    const target = userSpaces.find((s) => s.id === spaceId);
    setUserSpaces((prev) => prev.filter((s) => s.id !== spaceId));
    setUserExpenses((prev) => prev.filter((e) => e.spaceId !== spaceId));
    showToast(`Removed space "${target?.name || "Trip"}" and related expenses.`);

    try {
      await fetch(`/api/database?table=trips&id=${encodeURIComponent(spaceId)}`, {
        method: "DELETE",
      });
    } catch (err) {
      console.warn("[AppShell] Failed deleting space in server DB:", err);
    }
  };

  const handleContributeGoal = async (goalId: string, amount: number) => {
    let targetGoalTitle = "";
    setUserGoals((prev) =>
      prev.map((g) => {
        if (g.id === goalId) {
          targetGoalTitle = g.title;
          return {
            ...g,
            currentAmount: g.currentAmount + amount,
          };
        }
        return g;
      })
    );

    showToast(`💎 Deposited ₹${amount.toLocaleString("en-IN")} toward "${targetGoalTitle || "Goal"}"!`);

    try {
      const targetGoal = userGoals.find((g) => g.id === goalId);
      if (targetGoal) {
        await fetch("/api/database", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            table: "goals",
            id: goalId,
            data: { currentAmount: targetGoal.currentAmount + amount },
          }),
        });
      }
    } catch (err) {
      console.warn("[AppShell] Failed updating goal in DB:", err);
    }
  };

  const handleQuickAction = () => {
    if (currentSpace === "trip") {
      setShowAddExpense(true);
    } else {
      setShowAddTransaction(true);
    }
  };

  const isTrip = currentSpace === "trip";

  return (
    <div className="min-h-screen bg-[#0d1417] text-[#fbf5eb] flex flex-col font-sans selection:bg-[#dda071]/35 selection:text-[#fff7ec] relative">
      {/* Rich Atmospheric Landing Background */}
      <DashboardBackdrop currentSpace={currentSpace} blurMode={blurMode} />

      {/* Top Application Header - Sticky Navigation */}
      <TopBar
        currentSpace={currentSpace}
        onSpaceChange={handleSpaceChange}
          user={user}
          onOpenAuth={() => setShowAuthModal(true)}
          onSignOut={async () => {
            await supabase.auth.signOut();
            setUser(null);
            showToast("Signed out successfully.");
          }}
          onResetData={handleResetData}
          searchQuery={globalSearchQuery}
          onSearchQueryChange={setGlobalSearchQuery}
          blurMode={blurMode}
          onBlurModeChange={handleBlurModeChange}
          onReturnToLanding={onReturnToLanding}
        />

      {/* Toast Feedback Notification */}
      {feedbackToast && (
        <div className="fixed top-16 right-4 sm:right-8 z-50 bg-[#1a2528] border border-[#dda071]/40 text-[#fbf5eb] text-xs px-4 py-2.5 rounded-full shadow-2xl flex items-center gap-2 animate-in fade-in slide-in-from-top-2 duration-200 backdrop-blur-md">
          <span className="w-2 h-2 rounded-full bg-[#dda071]" />
          {feedbackToast}
        </div>
      )}

      {/* Main Dashboard Content Canvas */}
      <main className="flex-1 w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-36 relative z-10">
        <PageView
          key={isTrip ? `trip-${activeTripTab}` : `local-${activePersonalTab}`}
          isSpaceSwitch={isSpaceSwitch}
          isTrip={isTrip}
        >
          {isTrip ? (
            activeTripTab === "home" ? (
              <TripsSharedView
                onAddExpense={() => setShowAddExpense(true)}
                onCreateSpace={() => setShowCreateSpace(true)}
                onSettleUp={(id) => {
                  setSelectedSettlementId(id);
                  setShowSettleUp(true);
                }}
                onScanReceipt={() => setShowScanReceipt(true)}
                onExportReceipt={(spaceId) => handleOpenReceipt(spaceId, "trip")}
                onNavigateTab={(tab) => handleTripTabChange(tab)}
                onSelectSpace={(space) => setSelectedSpaceForDetail(space)}
                userExpenses={userExpenses}
                userSpaces={userSpaces}
                settlements={settlements}
              />
            ) : activeTripTab === "spaces" ? (
              <TripSpacesPage
                onCreateSpace={() => setShowCreateSpace(true)}
                onExportReceipt={(spaceId) => handleOpenReceipt(spaceId, "trip")}
                userSpaces={userSpaces}
                searchQuery={globalSearchQuery}
                onUpdateSpace={handleUpdateSpace}
                onDeleteSpace={handleDeleteSpace}
              />
            ) : activeTripTab === "expenses" ? (
              <TripExpensesPage
                onAddExpense={() => setShowAddExpense(true)}
                onScanReceipt={() => setShowScanReceipt(true)}
                onExportReceipt={() => handleOpenReceipt(undefined, "trip")}
                userExpenses={userExpenses}
                onDeleteExpense={handleDeleteExpense}
                searchQuery={globalSearchQuery}
              />
            ) : activeTripTab === "settlements" ? (
              <TripSettlementsPage
                onSettleUp={(id) => {
                  setSelectedSettlementId(id);
                  setShowSettleUp(true);
                }}
                onExportReceipt={() => handleOpenReceipt(undefined, "trip")}
                settlements={settlements}
              />
            ) : (
              <TripAnalyticsPage
                userExpenses={userExpenses}
                userSpaces={userSpaces}
              />
            )
          ) : (
            activePersonalTab === "home" ? (
              <PersonalFinanceView
                onAddTransaction={() => setShowAddTransaction(true)}
                onNewBudget={() => setShowAddBudget(true)}
                onNewGoal={() => setShowAddGoal(true)}
                onExportReceipt={() => handleOpenReceipt(undefined, "personal")}
                onScanReceipt={() => setShowScanReceipt(true)}
                onNavigateTab={(tab) => handlePersonalTabChange(tab)}
                onDeleteTransaction={handleDeleteTransaction}
                userTransactions={userTransactions}
                userBudgets={userBudgets}
                userGoals={userGoals}
              />
            ) : activePersonalTab === "transactions" ? (
              <PersonalTransactionsPage
                onAddTransaction={() => setShowAddTransaction(true)}
                onScanReceipt={() => setShowScanReceipt(true)}
                onExportReceipt={() => handleOpenReceipt(undefined, "personal")}
                onDeleteTransaction={handleDeleteTransaction}
                userTransactions={userTransactions}
                searchQuery={globalSearchQuery}
              />
            ) : activePersonalTab === "budgets" ? (
              <PersonalBudgetsPage
                onNewBudget={() => setShowAddBudget(true)}
                onDeleteBudget={handleDeleteBudget}
                userBudgets={userBudgets}
              />
            ) : activePersonalTab === "analytics" ? (
              <PersonalAnalyticsPage
                userTransactions={userTransactions}
                userBudgets={userBudgets}
                userGoals={userGoals}
              />
            ) : (
              <PersonalGoalsPage
                onNewGoal={() => setShowAddGoal(true)}
                onDeleteGoal={handleDeleteGoal}
                onContributeGoal={handleContributeGoal}
                userGoals={userGoals}
              />
            )
          )}
        </PageView>

        {/* Bottom Environment Indicator & Switcher Pills with sliding animated pill */}
        <div className="mt-10 pt-4 pb-2 flex items-center justify-center animate-pop-in pop-delay-5">
          <div className={`relative inline-flex items-center p-1 rounded-full border border-[rgba(255,248,235,0.18)] ${isTrip ? "bg-[rgba(20,32,36,0.65)]" : "bg-[rgba(44,28,34,0.65)]"} backdrop-blur-2xl shadow-xl transition-colors duration-500`}>
            {/* Animated Sliding Pill Highlight */}
            <div
              className="absolute top-1 bottom-1 rounded-full transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] pointer-events-none shadow-md"
              style={{
                left: isTrip ? "4px" : "calc(50% + 2px)",
                width: "calc(50% - 6px)",
                background: isTrip
                  ? "linear-gradient(135deg, #253236 0%, #1d272a 100%)"
                  : "linear-gradient(135deg, #38262a 0%, #2a1c20 100%)",
                border: isTrip
                  ? "1px solid rgba(224, 168, 117, 0.45)"
                  : "1px solid rgba(243, 152, 80, 0.45)",
                boxShadow: isTrip
                  ? "0 2px 10px rgba(224, 168, 117, 0.25)"
                  : "0 2px 10px rgba(243, 152, 80, 0.25)",
              }}
            />
            <button
              type="button"
              onClick={() => handleSpaceChange("trip")}
              className={`relative z-10 px-5 py-2 rounded-full text-xs font-bold uppercase tracking-[0.18em] transition-all duration-200 ${
                isTrip
                  ? "text-[#e0a875] scale-[1.02]"
                  : "text-[rgba(255,245,230,0.55)] hover:text-white"
              }`}
            >
              Trip (Forest Ledger)
            </button>

            <button
              type="button"
              onClick={() => handleSpaceChange("local")}
              className={`relative z-10 px-5 py-2 rounded-full text-xs font-bold uppercase tracking-[0.18em] transition-all duration-200 ${
                !isTrip
                  ? "text-[#f39850] scale-[1.02]"
                  : "text-[rgba(255,245,230,0.55)] hover:text-white"
              }`}
            >
              Local (Room Ledger)
            </button>
          </div>
        </div>
      </main>

      {/* Persistent Bottom Navigation Dock */}
      <BottomNav
        space={currentSpace}
        activeTripTab={activeTripTab}
        activePersonalTab={activePersonalTab}
        onTripTabChange={handleTripTabChange}
        onPersonalTabChange={handlePersonalTabChange}
        onOpenQuickAction={handleQuickAction}
      />

      {/* Interactive Modals */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        user={user}
        supabase={supabase}
      />

      <AddExpenseModal
        isOpen={showAddExpense}
        onClose={() => setShowAddExpense(false)}
        spaces={userSpaces.length > 0 ? [...userSpaces, ...MOCK_SPACES] : MOCK_SPACES}
        onExpenseAdded={handleExpenseAdded}
        user={user}
        supabase={supabase}
        onEmailsDispatched={(dispatchData) => {
          setEmailDispatchData(dispatchData);
          setShowEmailPreview(true);
          showToast(`✉️ Sent email breakdown to ${dispatchData.dispatches.length} participants`);
        }}
      />

      <CreateSpaceModal
        isOpen={showCreateSpace}
        onClose={() => setShowCreateSpace(false)}
        onSpaceCreated={handleSpaceCreated}
        user={user}
        supabase={supabase}
      />

      <SettleUpModal
        isOpen={showSettleUp}
        onClose={() => {
          setShowSettleUp(false);
          setSelectedSettlementId(undefined);
        }}
        settlements={settlements}
        onSettled={handleSettled}
        initialSettlementId={selectedSettlementId}
      />

      <ScanReceiptModal
        isOpen={showScanReceipt}
        onClose={() => setShowScanReceipt(false)}
        onReceiptScanned={handleReceiptScanned}
      />

      <ExportReceiptModal
        isOpen={showExportReceipt}
        onClose={() => {
          setShowExportReceipt(false);
          setReceiptSpaceId(undefined);
        }}
        spaces={userSpaces}
        expenses={userExpenses}
        settlements={settlements}
        personalTransactions={userTransactions}
        initialSpaceId={receiptSpaceId}
        initialMode={receiptMode}
      />

      <AddPersonalTransactionModal
        isOpen={showAddTransaction}
        onClose={() => setShowAddTransaction(false)}
        onTransactionAdded={handleTransactionAdded}
      />

      <AddBudgetModal
        isOpen={showAddBudget}
        onClose={() => setShowAddBudget(false)}
        onBudgetAdded={handleBudgetAdded}
      />

      <AddGoalModal
        isOpen={showAddGoal}
        onClose={() => setShowAddGoal(false)}
        onGoalAdded={handleGoalAdded}
      />

      <SpaceDetailModal
        space={selectedSpaceForDetail}
        isOpen={Boolean(selectedSpaceForDetail)}
        onClose={() => setSelectedSpaceForDetail(null)}
        onUpdateSpace={handleUpdateSpace}
        onDeleteSpace={handleDeleteSpace}
        onAddExpenseToSpace={(space) => {
          setSelectedSpaceForDetail(null);
          setShowAddExpense(true);
        }}
      />

      {emailDispatchData && (
        <EmailNotificationPreviewModal
          isOpen={showEmailPreview}
          onClose={() => setShowEmailPreview(false)}
          dispatches={emailDispatchData.dispatches}
          spaceName={emailDispatchData.spaceName}
          expenseDescription={emailDispatchData.expenseDescription}
          totalAmount={emailDispatchData.totalAmount}
          paidBy={emailDispatchData.paidBy}
        />
      )}

      {/* Floating Bottom-Right AI Copilot & Full Right-Side Chat Drawer */}
      <AiChatDrawer
        currentSpace={currentSpace}
        activeTripTab={activeTripTab}
        activePersonalTab={activePersonalTab}
        userSpaces={userSpaces.length > 0 ? userSpaces : MOCK_SPACES}
        userExpenses={userExpenses}
        settlements={settlements}
        userBalance={MOCK_TRIP_BALANCE.totalNet}
        contacts={contacts}
        onBatchSaveContacts={handleBatchSaveContacts}
        onSpaceCreated={handleSpaceCreated}
        onOpenNewSpace={() => setShowCreateSpace(true)}
        onOpenAddExpense={() => setShowAddExpense(true)}
        onOpenSettleUp={() => setShowSettleUp(true)}
        onOpenScanBill={() => setShowScanReceipt(true)}
        onOpenExportReceipt={() => handleOpenReceipt(undefined, "trip")}
        onOpenAddBudget={() => setShowAddBudget(true)}
        onOpenAddGoal={() => setShowAddGoal(true)}
        onOpenAddTransaction={() => setShowAddTransaction(true)}
        onNavigateTab={handleNavigateTab}
        onSwitchRealm={(realm) => handleSpaceChange(realm)}
        onSpotlight={handleSpotlight}
      />

      {/* AI-Guided Spotlight Overlay — dims screen & highlights specific UI element */}
      <SpotlightOverlay
        target={spotlightTarget}
        onDismiss={handleSpotlightDismiss}
      />

      {/* Typewriter Page Transition Overlay */}
      <TypewriterPageTransition
        isVisible={pageTransition.isVisible}
        message={pageTransition.message}
        subMessage={pageTransition.subMessage}
        theme={pageTransition.theme}
      />
    </div>
  );
}

/**
 * PageView — animated wrapper that runs an entrance animation
 * whenever it mounts (triggered by `key` prop change in app-shell).
 * Uses cinematic spaceSwitchIn when transitioning between Forest & Room realms,
 * and pageViewIn when navigating tabs inside a realm.
 */
function PageView({
  children,
  isSpaceSwitch,
  isTrip,
}: {
  children: React.ReactNode;
  isSpaceSwitch?: boolean;
  isTrip?: boolean;
}) {
  return (
    <div className={`relative ${isSpaceSwitch ? "animate-space-switch" : "animate-page-view"}`}>
      {/* Forest Canopy Sunbeam & Morning Mist Entrance Sweep */}
      {isTrip && (
        <div className="absolute -top-8 left-0 right-0 h-44 pointer-events-none overflow-hidden z-20 animate-forest-sweep">
          <div className="w-full h-full bg-gradient-to-b from-[#e0a875]/15 via-[#6e8d80]/10 to-transparent blur-xl" />
        </div>
      )}
      {children}
    </div>
  );
}
