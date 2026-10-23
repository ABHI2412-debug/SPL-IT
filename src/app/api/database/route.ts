import { NextResponse } from "next/server";
import {
  getDatabase,
  saveDatabase,
  resetDatabase,
} from "../../../lib/db/database";
import {
  SpaceSummary,
  SharedExpense,
  PersonalTransaction,
  BudgetProgress,
  FinancialGoal,
  Settlement,
} from "../../../lib/types/dashboard";

export async function GET() {
  try {
    const db = await getDatabase();
    return NextResponse.json({
      success: true,
      data: db,
      meta: {
        totalTrips: db.trips.length,
        totalExpenses: db.expenses.length,
        totalTransactions: db.transactions.length,
        lastUpdated: db.lastUpdated,
        storage: "disk_json_database",
      },
    });
  } catch (error: any) {
    console.error("[API /api/database GET] Error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to load database" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { action, table, data } = body;

    if (action === "reset") {
      const fresh = await resetDatabase();
      return NextResponse.json({
        success: true,
        message: "Database successfully reset to seed data",
        data: fresh,
      });
    }

    const db = await getDatabase();

    switch (table) {
      case "trips": {
        const newTrip = data as SpaceSummary;
        // Check if exists
        const exists = db.trips.some((t) => t.id === newTrip.id);
        if (exists) {
          db.trips = db.trips.map((t) => (t.id === newTrip.id ? newTrip : t));
        } else {
          db.trips.unshift(newTrip);
        }
        await saveDatabase(db);
        return NextResponse.json({ success: true, item: newTrip });
      }

      case "expenses": {
        const newExpense = data as SharedExpense;
        const exists = db.expenses.some((e) => e.id === newExpense.id);
        if (exists) {
          db.expenses = db.expenses.map((e) => (e.id === newExpense.id ? newExpense : e));
        } else {
          db.expenses.unshift(newExpense);
        }

        // Update corresponding trip totalSpend
        if (newExpense.spaceId) {
          const trip = db.trips.find((t) => t.id === newExpense.spaceId);
          if (trip) {
            const tripTotal = db.expenses
              .filter((e) => e.spaceId === trip.id)
              .reduce((sum, e) => sum + e.amount, 0);
            trip.totalSpend = tripTotal;
            trip.recentActivity = `${newExpense.paidBy} added ${newExpense.description}`;
          }
        }

        await saveDatabase(db);
        return NextResponse.json({ success: true, item: newExpense });
      }

      case "transactions": {
        const newTx = data as PersonalTransaction;
        const exists = db.transactions.some((t) => t.id === newTx.id);
        if (exists) {
          db.transactions = db.transactions.map((t) => (t.id === newTx.id ? newTx : t));
        } else {
          db.transactions.unshift(newTx);
        }
        await saveDatabase(db);
        return NextResponse.json({ success: true, item: newTx });
      }

      case "budgets": {
        const newBudget = data as BudgetProgress;
        const exists = db.budgets.some((b) => b.id === newBudget.id);
        if (exists) {
          db.budgets = db.budgets.map((b) => (b.id === newBudget.id ? newBudget : b));
        } else {
          db.budgets.push(newBudget);
        }
        await saveDatabase(db);
        return NextResponse.json({ success: true, item: newBudget });
      }

      case "goals": {
        const newGoal = data as FinancialGoal;
        const exists = db.goals.some((g) => g.id === newGoal.id);
        if (exists) {
          db.goals = db.goals.map((g) => (g.id === newGoal.id ? newGoal : g));
        } else {
          db.goals.push(newGoal);
        }
        await saveDatabase(db);
        return NextResponse.json({ success: true, item: newGoal });
      }

      default:
        return NextResponse.json(
          { success: false, error: `Invalid table: ${table}` },
          { status: 400 }
        );
    }
  } catch (error: any) {
    console.error("[API /api/database POST] Error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to mutate database" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const table = searchParams.get("table");
    const id = searchParams.get("id");

    if (!table || !id) {
      return NextResponse.json(
        { success: false, error: "table and id parameters are required" },
        { status: 400 }
      );
    }

    const db = await getDatabase();

    switch (table) {
      case "trips":
        db.trips = db.trips.filter((t) => t.id !== id);
        // Also clean up expenses for this trip
        db.expenses = db.expenses.filter((e) => e.spaceId !== id);
        break;

      case "expenses": {
        const expenseToDelete = db.expenses.find((e) => e.id === id);
        db.expenses = db.expenses.filter((e) => e.id !== id);
        if (expenseToDelete && expenseToDelete.spaceId) {
          const trip = db.trips.find((t) => t.id === expenseToDelete.spaceId);
          if (trip) {
            trip.totalSpend = db.expenses
              .filter((e) => e.spaceId === trip.id)
              .reduce((sum, e) => sum + e.amount, 0);
          }
        }
        break;
      }

      case "transactions":
        db.transactions = db.transactions.filter((t) => t.id !== id);
        break;

      case "budgets":
        db.budgets = db.budgets.filter((b) => b.id !== id);
        break;

      case "goals":
        db.goals = db.goals.filter((g) => g.id !== id);
        break;

      default:
        return NextResponse.json(
          { success: false, error: `Unsupported table: ${table}` },
          { status: 400 }
        );
    }

    await saveDatabase(db);
    return NextResponse.json({ success: true, message: `Deleted ${id} from ${table}` });
  } catch (error: any) {
    console.error("[API /api/database DELETE] Error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to delete" },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { table, id, data } = body;

    const db = await getDatabase();

    if (table === "settlements") {
      const target = db.settlements.find((s) => s.id === id);
      if (target) {
        Object.assign(target, data);
        await saveDatabase(db);
        return NextResponse.json({ success: true, item: target });
      }
      return NextResponse.json({ success: false, error: "Settlement not found" }, { status: 404 });
    }

    if (table === "budgets") {
      const target = db.budgets.find((b) => b.id === id);
      if (target) {
        Object.assign(target, data);
        await saveDatabase(db);
        return NextResponse.json({ success: true, item: target });
      }
      return NextResponse.json({ success: false, error: "Budget not found" }, { status: 404 });
    }

    if (table === "goals") {
      const target = db.goals.find((g) => g.id === id);
      if (target) {
        Object.assign(target, data);
        await saveDatabase(db);
        return NextResponse.json({ success: true, item: target });
      }
      return NextResponse.json({ success: false, error: "Goal not found" }, { status: 404 });
    }

    return NextResponse.json({ success: false, error: `Unsupported table: ${table}` }, { status: 400 });
  } catch (error: any) {
    console.error("[API /api/database PUT] Error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to update" },
      { status: 500 }
    );
  }
}
