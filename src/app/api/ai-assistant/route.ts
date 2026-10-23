import { NextResponse } from "next/server";
import { InteractiveTableData, InteractiveTableMember, PersonRecord } from "@/lib/types/dashboard";
import {
  MOCK_CONTACTS,
  MOCK_SETTLEMENTS,
  MOCK_SHARED_EXPENSES,
  MOCK_SPACES,
} from "@/lib/data/mock-data";

export interface ChatMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

export interface ActionProposal {
  type: "create_trip" | "add_expense" | "settle_up" | "switch_space" | "open_modal" | "switch_tab" | "switch_realm" | "add_member";
  payload?: any;
  label: string;
}

export interface SpotlightTarget {
  id: string;
  label: string;
  description: string;
}

// ─── Destination → Scenic Unsplash visual map ─────────────────────────────
function getCoverForDestination(destination: string): string {
  const d = destination.toLowerCase();

  // India
  if (d.includes("ladakh") || d.includes("leh") || d.includes("pangong") || d.includes("nubra"))
    return "https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?auto=format&fit=crop&w=1200&q=80";
  if (d.includes("spiti") || d.includes("kinnaur") || d.includes("kaza"))
    return "https://images.unsplash.com/photo-1597579695523-cb7a99f89f6c?auto=format&fit=crop&w=1200&q=80";
  if (d.includes("manali") || d.includes("kullu") || d.includes("solang") || d.includes("kasol"))
    return "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=1200&q=80";
  if (d.includes("kashmir") || d.includes("srinagar") || d.includes("gulmarg") || d.includes("pahalgam"))
    return "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&w=1200&q=80";
  if (d.includes("goa") || d.includes("panjim") || d.includes("anjuna") || d.includes("palolem"))
    return "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=1200&q=80";
  if (d.includes("kerala") || d.includes("kochi") || d.includes("munnar") || d.includes("alleppey") || d.includes("varkala"))
    return "https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?auto=format&fit=crop&w=1200&q=80";
  if (d.includes("rajasthan") || d.includes("jaipur") || d.includes("jodhpur") || d.includes("udaipur") || d.includes("jaisalmer"))
    return "https://images.unsplash.com/photo-1548013146-72479768bada?auto=format&fit=crop&w=1200&q=80";
  if (d.includes("darjeeling") || d.includes("sikkim") || d.includes("gangtok") || d.includes("pelling"))
    return "https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=1200&q=80";
  if (d.includes("andaman") || d.includes("nicobar") || d.includes("havelock"))
    return "https://images.unsplash.com/photo-1559628376-f3fe5f782a2a?auto=format&fit=crop&w=1200&q=80";
  if (d.includes("mumbai") || d.includes("bombay"))
    return "https://images.unsplash.com/photo-1529253355930-ddbe423a2ac7?auto=format&fit=crop&w=1200&q=80";
  if (d.includes("delhi") || d.includes("new delhi"))
    return "https://images.unsplash.com/photo-1587474260584-136574528ed5?auto=format&fit=crop&w=1200&q=80";
  if (d.includes("rishikesh") || d.includes("haridwar") || d.includes("uttarakhand") || d.includes("kedarnath"))
    return "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=1200&q=80";
  if (d.includes("coorg") || d.includes("kodagu") || d.includes("ooty") || d.includes("wayanad"))
    return "https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=1200&q=80";

  // International
  if (d.includes("bali") || d.includes("indonesia") || d.includes("ubud"))
    return "https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=1200&q=80";
  if (d.includes("thailand") || d.includes("bangkok") || d.includes("phuket") || d.includes("chiang mai") || d.includes("krabi"))
    return "https://images.unsplash.com/photo-1528360983277-13d401cdc186?auto=format&fit=crop&w=1200&q=80";
  if (d.includes("paris") || d.includes("france"))
    return "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=1200&q=80";
  if (d.includes("tokyo") || d.includes("kyoto") || d.includes("japan") || d.includes("osaka"))
    return "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=1200&q=80";
  if (d.includes("switzerland") || d.includes("zurich") || d.includes("alps") || d.includes("interlaken"))
    return "https://images.unsplash.com/photo-1531366936337-7c912a4589a7?auto=format&fit=crop&w=1200&q=80";
  if (d.includes("dubai") || d.includes("uae") || d.includes("abu dhabi"))
    return "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=1200&q=80";
  if (d.includes("maldives") || d.includes("maldive"))
    return "https://images.unsplash.com/photo-1514282401047-d79a71a590e8?auto=format&fit=crop&w=1200&q=80";
  if (d.includes("singapore"))
    return "https://images.unsplash.com/photo-1525625293386-3f8f99389edd?auto=format&fit=crop&w=1200&q=80";
  if (d.includes("london") || d.includes("uk") || d.includes("england"))
    return "https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?auto=format&fit=crop&w=1200&q=80";
  if (d.includes("new york") || d.includes("nyc") || d.includes("usa") || d.includes("america"))
    return "https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?auto=format&fit=crop&w=1200&q=80";
  if (d.includes("santorini") || d.includes("greece") || d.includes("athens") || d.includes("mykonos"))
    return "https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?auto=format&fit=crop&w=1200&q=80";
  if (d.includes("amsterdam") || d.includes("netherlands"))
    return "https://images.unsplash.com/photo-1534351590666-13e3e96b5702?auto=format&fit=crop&w=1200&q=80";
  if (d.includes("rome") || d.includes("italy") || d.includes("venice") || d.includes("milan") || d.includes("florence"))
    return "https://images.unsplash.com/photo-1552832230-c0197dd311b5?auto=format&fit=crop&w=1200&q=80";
  if (d.includes("barcelona") || d.includes("spain") || d.includes("madrid"))
    return "https://images.unsplash.com/photo-1539037116277-4db20889f2d4?auto=format&fit=crop&w=1200&q=80";
  if (d.includes("vietnam") || d.includes("hanoi") || d.includes("da nang") || d.includes("hoi an"))
    return "https://images.unsplash.com/photo-1583417319070-4a69db38a482?auto=format&fit=crop&w=1200&q=80";
  if (d.includes("nepal") || d.includes("kathmandu") || d.includes("pokhara") || d.includes("everest"))
    return "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1200&q=80";
  if (d.includes("sri lanka") || d.includes("colombo") || d.includes("ella") || d.includes("galle"))
    return "https://images.unsplash.com/photo-1568454537842-d933259bb258?auto=format&fit=crop&w=1200&q=80";
  if (d.includes("beach") || d.includes("island") || d.includes("tropical"))
    return "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80";
  if (d.includes("mountain") || d.includes("trek") || d.includes("hike") || d.includes("camp"))
    return "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1200&q=80";
  if (d.includes("desert") || d.includes("sahara") || d.includes("dune"))
    return "https://images.unsplash.com/photo-1509316785289-025f5b846b35?auto=format&fit=crop&w=1200&q=80";

  return "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?auto=format&fit=crop&w=1200&q=80";
}

// ─── Spotlight Target Resolution ──────────────────────────────────────────
export function getSpotlightForMessage(msg: string): SpotlightTarget | null {
  const m = msg.toLowerCase();

  // 0. Website Overview & Top-to-Bottom
  if (
    m.includes("what else") ||
    m.includes("top to bottom") ||
    m.includes("what can this") ||
    m.includes("what can we do") ||
    m.includes("guide") ||
    m.includes("features") ||
    m.includes("walk me through")
  ) {
    return {
      id: "realm-switcher",
      label: "Forest & Room Realms 🌐",
      description: "SPL/IT combines Trip (Forest Ledger) for shared travel and Local (Room Ledger) for personal finance.",
    };
  }

  // 0.5 Contacts database
  if (
    m.includes("contact") ||
    m.includes("directory") ||
    m.includes("database") ||
    m.includes("who all are") ||
    m.includes("who is in my") ||
    m.includes("who's in my") ||
    m.includes("who is in the") ||
    m.includes("who are in") ||
    m.includes("who is saved") ||
    m.includes("saved people")
  ) {
    return {
      id: "nav-spaces",
      label: "Contacts & Spaces 👥",
      description: "Manage your travel companions, participant emails, and shared circles.",
    };
  }

  // 1. Participant email / members / invite / friend / who is in trip
  if (
    m.includes("email") ||
    m.includes("participant") ||
    m.includes("member") ||
    m.includes("invite") ||
    m.includes("friend") ||
    m.includes("who is in") ||
    m.includes("who's in") ||
    m.includes("people in") ||
    m.includes("circle")
  ) {
    if (m.includes("existing") || m.includes("current") || m.includes("list") || m.includes("view")) {
      return {
        id: "nav-spaces",
        label: "Spaces Tab 👥",
        description: "Click Spaces in the bottom dock to view your trip circles and manage participant emails.",
      };
    }
    return {
      id: "new-space",
      label: "NEW SPACE 🏕️",
      description: "Click NEW SPACE to add participant names and email addresses for automated expense breakdowns.",
    };
  }

  // 2. Add expense / bill / spent / paid / split
  if (
    m.includes("add expense") ||
    m.includes("log expense") ||
    m.includes("record expense") ||
    m.includes("split") ||
    (m.includes("how") && m.includes("expense")) ||
    (m.includes("spent") && /\d/.test(m)) ||
    (m.includes("paid") && /\d/.test(m))
  ) {
    return {
      id: "add-expense",
      label: "+ ADD EXPENSE",
      description: "Click this button to open the expense form, enter amounts, and automatically split among circle members.",
    };
  }

  // 3. Settle up / UPI / debts / payments / owe
  if (
    m.includes("settle") ||
    m.includes("upi") ||
    m.includes("pay") ||
    m.includes("debt") ||
    m.includes("owe") ||
    m.includes("phonepe") ||
    m.includes("gpay") ||
    m.includes("paytm")
  ) {
    return {
      id: "settle-up",
      label: "SETTLE UP ⚖️",
      description: "Click here to open the settlement drawer and pay pending debts via instant UPI QR codes.",
    };
  }

  // 4. Net balance / status
  if (
    m.includes("balance") ||
    m.includes("how much") ||
    m.includes("net balance") ||
    m.includes("my status") ||
    m.includes("ledger total")
  ) {
    return {
      id: "net-balance",
      label: "Your Net Balance 💳",
      description: "This card shows your live balance across all shared spaces.",
    };
  }

  // 5. Scan receipt / OCR
  if (
    m.includes("scan") ||
    m.includes("receipt") ||
    m.includes("bill") ||
    m.includes("ocr") ||
    m.includes("upload bill") ||
    m.includes("camera")
  ) {
    return {
      id: "scan-bill",
      label: "SCAN BILL 📷",
      description: "Click here to upload or drag & drop a bill photo. AI will parse the merchant, items, and total automatically.",
    };
  }

  // 6. Export / PDF / Download / Report
  if (
    m.includes("export") ||
    m.includes("pdf") ||
    m.includes("download") ||
    m.includes("report") ||
    m.includes("print")
  ) {
    return {
      id: "export-receipt",
      label: "RECEIPT 🧾",
      description: "Click here to export a formatted PDF receipt or reimbursement report for any trip.",
    };
  }

  // 7. Analytics / Charts / Spending breakdown
  if (
    m.includes("analytic") ||
    m.includes("chart") ||
    m.includes("spending") ||
    m.includes("breakdown") ||
    m.includes("insight") ||
    m.includes("trend")
  ) {
    return {
      id: "nav-analytics",
      label: "Analytics Tab 📊",
      description: "Tap Analytics in the bottom dock to see donut charts by category, monthly trends, and spending stats.",
    };
  }

  // 8. Spaces / Trips list
  if (
    m.includes("all space") ||
    m.includes("my trips") ||
    m.includes("view spaces") ||
    m.includes("spaces tab") ||
    m.includes("groups")
  ) {
    return {
      id: "nav-spaces",
      label: "Spaces Tab 👥",
      description: "Tap Spaces in the bottom dock to see all your active and upcoming shared travel ledgers.",
    };
  }

  // 9. Expenses list tab
  if (
    m.includes("all expense") ||
    m.includes("expenses list") ||
    m.includes("view expense") ||
    m.includes("transactions list")
  ) {
    return {
      id: "nav-expenses",
      label: "Expenses Tab 🧾",
      description: "Tap Expenses in the bottom dock to browse the complete ledger of all transactions.",
    };
  }

  // 10. Settlements tab
  if (
    m.includes("settlements tab") ||
    m.includes("ledger tab") ||
    m.includes("who owes")
  ) {
    return {
      id: "nav-settlements",
      label: "Settlements Tab ⚡",
      description: "Tap Settlements in the bottom dock to see who owes whom and pending debts.",
    };
  }

  // 11. Local / Room / Personal Finance
  if (
    m.includes("local") ||
    m.includes("room") ||
    m.includes("personal") ||
    m.includes("switch realm") ||
    m.includes("individual")
  ) {
    return {
      id: "realm-switcher",
      label: "Realm Switcher 🔄",
      description: "Toggle between Trip (Forest Ledger) for shared groups and Local (Room Ledger) for personal finance.",
    };
  }

  // 12. Budgets
  if (m.includes("budget") || m.includes("spending limit")) {
    return {
      id: "nav-budgets",
      label: "Budgets Tab 🎯",
      description: "Tap Budgets to set category spending limits with real-time warning indicators.",
    };
  }

  // 13. Goals
  if (m.includes("goal") || m.includes("savings") || m.includes("target")) {
    return {
      id: "nav-goals",
      label: "Goals Tab 🏆",
      description: "Tap Goals to track savings milestones towards vacations, gadgets, or emergency funds.",
    };
  }

  // 14. Search
  if (m.includes("search") || m.includes("find") || m.includes("filter")) {
    return {
      id: "search-bar",
      label: "Search Bar 🔍",
      description: "Use the top search bar to filter trips, expenses, members, and transactions in real time.",
    };
  }

  return null;
}

// ─── Advanced Contextual Q&A Reasoning Engine ──────────────────────────────
function advancedAnswer(
  userMsg: string,
  dashboardContext: any,
  _history: ChatMessage[]
): { reply: string; spotlightTarget?: SpotlightTarget | null; proposedAction?: ActionProposal | null } {
  const msg = userMsg.toLowerCase();

  // ── 0. Comprehensive Top-to-Bottom Master Guide ("What else can we do with the site?") ──
  if (
    msg.includes("what else") ||
    msg.includes("top to bottom") ||
    msg.includes("everything about") ||
    msg.includes("what can this website do") ||
    msg.includes("what can we do") ||
    msg.includes("what can i do") ||
    msg.includes("guide to the website") ||
    msg.includes("all features") ||
    msg.includes("how does split work") ||
    msg.includes("walk me through") ||
    msg.includes("tell me about the site") ||
    (msg.includes("what is") && msg.includes("split"))
  ) {
    return {
      reply: `🌟 **SPL/IT — The Complete Top-to-Bottom Master Guide**

SPL/IT is an advanced dual-realm financial copilot combining **Group Travel Ledgers (Trip)** and **Personal Wealth Management (Local)** with cinematic visual immersion:

---

### 🌲 1. TRIP REALM (Forest Ledger — Group Travel & Splitting)
*Designed for mountain treks, beach getaways, road trips, and shared expenses:*
- **🏕️ Spaces & Groups:** Create dedicated trip spaces with scenic destination covers, travel dates, and participant rosters.
- **👥 Smart Contacts Database:**
  - Save companions with **Name, Email, Phone Number, and Custom Notes/Roles** (e.g. *Treasurer, Photographer, Vegan foodie, Driver*).
  - When you tell me: *"Plan a trip to Manali with Rahul and Natasha"*, I will check your database, ask if you want to re-add existing members, and pop up an interactive table to register new contacts with their details!
- **🧾 Multi-Type Expense Splitting:**
  - Split costs **Equally**, by **Exact Amounts**, **Percentages (%)**, or **Shares**.
  - Track who paid: You or any friend.
- **📧 Automated Email Breakdown Receipts:** Keep the *"Email Participants"* toggle turned ON when logging expenses. SPL/IT computes everyone's exact share and automatically dispatches itemized email breakdowns to each member!
- **⚡ Instant UPI QR Settlements:**
  - Resolves circular debts into the minimum number of transactions.
  - Dynamically generates **UPI QR codes** ready to scan with **Google Pay, PhonePe, Paytm, or BHIM**, plus a 1-click copy link.
- **📷 AI Bill & Receipt Scanner (OCR):**
  - Click **SCAN BILL** to upload or drag & drop a restaurant or hotel receipt. Our OCR extracts the merchant, date, items, and total into the Add Expense form.
- **📄 Executive PDF Receipt & Ledger Export:**
  - Click **RECEIPT** to generate print-ready PDF vouchers for corporate reimbursements or group records.
- **📊 Spending Analytics:**
  - Interactive SVG donut charts by category (Dining, Stays, Transport, Fuel) and monthly spending trend lines.

---

### 🏠 2. LOCAL REALM (Room Ledger — Personal Finance Hub)
*Your private personal space for budgeting and wealth building:*
- **💳 Cash Flow & Savings Rate:** Track recorded income, expenses, and real-time net savings rate.
- **🎯 Category Monthly Budgets:** Set spending limits (Dining, Groceries, Shopping) with live progress bars, yellow warning badges (>80%), and red alerts (>100%).
- **🏆 Financial Savings Goals:** Track milestones for travel, emergency funds, or tech upgrades. Add quick deposits anytime!
- **📈 Personal Category Donut & Trends:** Visual breakdown of where every rupee goes.

---

### ⚡ 3. SHORTCUTS & INTERFACE POLISH
- **🎯 Spotlight Command Palette (\`Ctrl+K\` / \`Cmd+K\`):** Instant quick launcher across all actions.
- **🔍 Quick Search (\`/\`):** Instant filter across trips, transactions, and circle friends.
- **🎨 Atmospheric Backdrop Blur:** Customize your visual ambience (Deep Bokeh 36px, Soft 18px, Abstract 8px, or Off).
- **💾 100% Offline-First:** Works with zero internet using localStorage, and syncs to Supabase cloud when connected!

👉 *Try asking me: "Plan a trip to Manali with Rahul and Natasha" to see our contact directory and interactive table in action!*`,
      spotlightTarget: {
        id: "realm-switcher",
        label: "Forest & Room Realms 🌐",
        description: "Switch between Trip (Group) and Local (Personal) finance realms anytime.",
      },
      proposedAction: {
        type: "open_modal",
        payload: { modal: "new_space" },
        label: "🏕️ Create New Space",
      },
    };
  }

  // ── 0.3 Re-seed / Database Reset Inquiry ─────────────────────────────────
  if (
    msg.includes("re-seed") ||
    msg.includes("reseed") ||
    msg.includes("re seed") ||
    (msg.includes("reset") && (msg.includes("database") || msg.includes("data") || msg.includes("ledger")))
  ) {
    return {
      reply: `🔄 **Yes! The "Re-seed Database" button is fully working.**

### Where to Find It:
1. Look at the top-right corner of the **Top Bar**.
2. Click your circular **Profile Avatar**.
3. In the dropdown menu, click **"↺ Re-seed Database"** (highlighted in amber).

### What Happens When Clicked:
- A browser confirmation prompt appears to prevent accidental resets.
- The server database (\`data/database.json\`) is cleanly overwritten with pristine seed data (*Himalayan Escape, Goa Long Weekend, South Goa Retreat*).
- All shared expenses, settlements, personal transactions, budgets, goals, and directory contacts are restored.
- Your local browser storage is cleared, and all dashboard tabs update in real time!`,
      spotlightTarget: null,
      proposedAction: {
        type: "switch_tab",
        payload: { tab: "spaces" },
        label: "👥 View Seed Spaces",
      },
    };
  }

  // ── 0.5 Contacts Database & Directory Inspection ─────────────────────────
  const isContactsDatabaseQuery =
    (msg.includes("database") && !msg.includes("re-seed") && !msg.includes("reseed") && !msg.includes("reset")) ||
    msg.includes("contact") ||
    msg.includes("directory") ||
    msg.includes("who all are in") ||
    msg.includes("who all is in") ||
    msg.includes("who is in my database") ||
    msg.includes("who is in the database") ||
    msg.includes("who are in my database") ||
    msg.includes("who are in the database") ||
    msg.includes("who is in database") ||
    msg.includes("who are in database") ||
    msg.includes("who all are") ||
    msg.includes("who is saved") ||
    msg.includes("saved contacts") ||
    msg.includes("saved people") ||
    msg.includes("who do you know") ||
    msg.includes("list people") ||
    msg.includes("list contacts") ||
    msg.includes("show contacts");

  if (isContactsDatabaseQuery) {
    const contacts: PersonRecord[] =
      dashboardContext?.contacts && dashboardContext.contacts.length > 0
        ? dashboardContext.contacts
        : MOCK_CONTACTS;

    const list = contacts
      .map(
        (c: PersonRecord, idx: number) =>
          `**${idx + 1}. ${c.name}**\n   📧 \`${c.email}\` • 📞 \`${c.phone || "+91 98000 00000"}\`\n   🏷️ *Role / Notes:* ${c.description || "Travel Companion"}${c.lastTrip ? `\n   📍 *Recent Trip:* ${c.lastTrip}` : ""}`
      )
      .join("\n\n");

    return {
      reply: `👥 **Your Contacts Database (${contacts.length} companions registered):**

Here is everyone currently in your permanent contacts directory:

${list}

---
💡 **How Intelligent Trip Planning Works With This Database:**
Whenever you ask me to plan a trip with any companions (e.g. *"Plan a trip to Manali with ${contacts[0]?.name.split(" ")[0] || "Aman"} and ${contacts[1]?.name.split(" ")[0] || "Priya"}"*):
1. **Existing Contacts Check:** I'll automatically recognize them from this database, verify their email & phone, and ask if you want to re-add them.
2. **Missing Contacts:** If you mention someone not in this database, an interactive registration table will appear right here in the chat so you can enter their name, email, phone, and role notes to save them directly to your database!`,
      spotlightTarget: {
        id: "nav-spaces",
        label: "Spaces & Circles 👥",
        description: "View and manage your travel circles and saved companions.",
      },
      proposedAction: {
        type: "open_modal",
        payload: { modal: "new_space" },
        label: "🏕️ Create Trip with Contacts",
      },
    };
  }

  // ── 1. Participant Emails & Member Inquiries (PRIMARY FOCUS) ─────────────
  if (
    msg.includes("email") ||
    (msg.includes("participant") && (msg.includes("add") || msg.includes("how") || msg.includes("where") || msg.includes("invite"))) ||
    (msg.includes("member") && (msg.includes("add") || msg.includes("how") || msg.includes("where") || msg.includes("invite") || msg.includes("email"))) ||
    msg.includes("add person") ||
    msg.includes("add friend")
  ) {
    // Check if user is asking to list current participants/emails
    if (msg.includes("who is in") || msg.includes("who is") || msg.includes("list") || msg.includes("what are their email")) {
      const trips = dashboardContext?.trips || [];
      if (trips.length > 0) {
        const tripList = trips
          .map((t: any) => {
            const memberDetails = (t.members || [])
              .map((mName: string) => {
                const email = t.memberEmails?.[mName] || "you@split.app";
                return `  • **${mName}** — \`${email}\``;
              })
              .join("\n");
            return `📍 **${t.name}** (${t.location || "Trip"})\n${memberDetails}`;
          })
          .join("\n\n");

        return {
          reply: `👥 **Your Current Trip Participants & Emails:**\n\n${tripList}\n\n*These email addresses receive automated ledger breakdowns whenever an expense is logged!*`,
          spotlightTarget: {
            id: "nav-spaces",
            label: "Spaces Tab 👥",
            description: "Click Spaces to view all circles and manage member details.",
          },
          proposedAction: {
            type: "switch_tab",
            payload: { tab: "spaces" },
            label: "👥 View All Spaces & Members",
          },
        };
      }
    }

    // Comprehensive, exact guide on adding participant emails
    return {
      reply: `📧 **Adding Participant Emails in SPL/IT:**

You can add participant emails in **two convenient ways**:

### 1. When Creating a New Trip / Space:
1. Click the **"NEW SPACE"** button *(highlighted in gold on your screen!)* in the top action bar.
2. Fill in the trip **Name**, **Location**, and **Dates**.
3. In the **"Participants & Email Notifications"** section:
   - Enter the participant's **Name** (e.g., *Priya M.*)
   - Enter their **Email Address** (e.g., *priya@gmail.com*)
   - Click **"+ Add"**
4. Click **"Create Space"** — your group is now ready with registered emails!

### 2. In an Existing Trip:
1. Tap the **"Spaces"** tab in the bottom dock.
2. Click on your trip card to open **Space Details**.
3. Under **"Circle Members & Emails"**, view current members and use the **"+ Add Participant to this Trip"** form with their **Name & Email**, then click **"+ Add"**!

---
⚡ **Automated Expense Breakdown Emails:**
When adding an expense via **"+ ADD EXPENSE"**, leave the **"Email Participants"** toggle turned ON. SPL/IT will calculate each person's exact share and automatically dispatch an itemized email breakdown to everyone!`,
      spotlightTarget: {
        id: "new-space",
        label: "NEW SPACE 🏕️",
        description: "Click here to create a new space and add participant names & email addresses.",
      },
      proposedAction: {
        type: "open_modal",
        payload: { modal: "new_space" },
        label: "🏕️ Open 'New Space' Form (Add Emails)",
      },
    };
  }

  // ── 2. Net Balance & "What Do I Owe" ─────────────────────────────────────
  if (
    msg.includes("balance") ||
    msg.includes("how much") ||
    msg.includes("owe") ||
    msg.includes("owed") ||
    msg.includes("my status") ||
    msg.includes("net balance")
  ) {
    const balance = dashboardContext?.userBalance ?? 2180;
    const isOwed = balance > 0;
    const absBal = Math.abs(balance).toLocaleString("en-IN");

    return {
      reply: `💰 **Your Live Net Balance:**
Currently, your net balance across all shared spaces is **${isOwed ? `+₹${absBal} (You are owed)` : balance < 0 ? `-₹${absBal} (You owe)` : "₹0 (All Settled)"}**.

- 🟢 **Green / Positive** = Others owe you money for expenses you paid.
- 🔴 **Red / Negative** = You owe money to someone in the circle.

To view itemized settlement pairs or pay via dynamic UPI QR code, click **"SETTLE UP"**!`,
      spotlightTarget: {
        id: "net-balance",
        label: "Your Net Balance 💳",
        description: "Your net balance card shows your live position across all trip spaces.",
      },
      proposedAction: {
        type: "open_modal",
        payload: { modal: "settle_up" },
        label: "⚖️ Open Settle Up Drawer",
      },
    };
  }

  // ── 3. Settle Up & UPI QR Payments ──────────────────────────────────────
  if (
    msg.includes("settle") ||
    msg.includes("upi") ||
    msg.includes("pay") ||
    msg.includes("phonepe") ||
    msg.includes("gpay") ||
    msg.includes("paytm") ||
    msg.includes("qr") ||
    msg.includes("clear debt")
  ) {
    return {
      reply: `⚡ **Settling Debts via Instant UPI:**

1. Click the **"SETTLE UP"** button *(highlighted on your screen)*.
2. Select any **Pending Debt** to see who you owe and the exact amount.
3. A dynamic **UPI QR code** is generated automatically:
   - Scan with **Google Pay**, **PhonePe**, **Paytm**, or **BHIM**.
   - Or click **"Copy UPI ID"** to paste into your banking app.
4. After transferring, click **"Confirm Settle & Save"** — your debt is marked completed and updated in the server ledger immediately!`,
      spotlightTarget: {
        id: "settle-up",
        label: "SETTLE UP ⚖️",
        description: "Open the Settle Up modal to clear balances using instant UPI QR codes.",
      },
      proposedAction: {
        type: "open_modal",
        payload: { modal: "settle_up" },
        label: "⚖️ Open Settle Up (UPI QR)",
      },
    };
  }

  // ── 4. Logging Expenses & Splits ─────────────────────────────────────────
  if (
    msg.includes("add expense") ||
    msg.includes("log expense") ||
    msg.includes("record expense") ||
    (msg.includes("how") && msg.includes("expense")) ||
    (msg.includes("split") && !msg.includes("split-it"))
  ) {
    return {
      reply: `🧾 **How to Log an Expense in SPL/IT:**

1. Click **"+ ADD EXPENSE"** in the top action bar.
2. Pick which **Trip Space** the expense belongs to.
3. Type the **Description** (e.g., *Beach Shack Dinner*) and **Amount (₹)**.
4. Select who **Paid** (You or a friend).
5. Ensure **"Email Participants"** is turned ON so everyone receives their individualized split breakdown.
6. Click **"Add Expense"** — balances update instantly across all members!`,
      spotlightTarget: {
        id: "add-expense",
        label: "+ ADD EXPENSE",
        description: "Click to log an expense and split it across trip members.",
      },
      proposedAction: {
        type: "open_modal",
        payload: { modal: "add_expense" },
        label: "🧾 Open Add Expense Form",
      },
    };
  }

  // ── 5. Receipt Scanning & OCR ────────────────────────────────────────────
  if (
    msg.includes("scan") ||
    msg.includes("receipt") ||
    msg.includes("bill") ||
    msg.includes("ocr") ||
    msg.includes("photo")
  ) {
    return {
      reply: `📸 **AI Receipt & Bill Scanner:**

Click **"SCAN BILL"** in the top action bar:
- **Upload** a photo of any printed bill, restaurant check, or invoice.
- **Drag & drop** an image from your computer.
- Or tap **"Use Sample Receipt"** to test it out!

Our smart OCR extracts the merchant name, date, itemized lines, and total amount, then **auto-fills the Add Expense form** for you!`,
      spotlightTarget: {
        id: "scan-bill",
        label: "SCAN BILL 📷",
        description: "Click here to open the AI receipt scanner.",
      },
      proposedAction: {
        type: "open_modal",
        payload: { modal: "scan_bill" },
        label: "📷 Open Bill Scanner",
      },
    };
  }

  // ── 6. Exporting PDF Receipts ────────────────────────────────────────────
  if (
    msg.includes("export") ||
    msg.includes("pdf") ||
    msg.includes("download") ||
    msg.includes("report") ||
    msg.includes("print")
  ) {
    return {
      reply: `📄 **Exporting PDF Receipts & Reports:**

Click the **"RECEIPT"** button in the top action bar:
- Choose any shared trip space or your personal ledger.
- Generates an executive, print-ready **PDF Ledger Document** complete with:
  • Itemized expenses list with dates & payers
  • Participant breakdown and shares
  • Settlement status & outstanding debts
- Click **"Print / Save PDF"** to save locally or submit for reimbursements!`,
      spotlightTarget: {
        id: "export-receipt",
        label: "RECEIPT 🧾",
        description: "Click here to generate and download PDF receipts.",
      },
      proposedAction: {
        type: "open_modal",
        payload: { modal: "export_receipt" },
        label: "🧾 Open Receipt Export",
      },
    };
  }

  // ── 7. Analytics & Spending Insights ─────────────────────────────────────
  if (
    msg.includes("analytic") ||
    msg.includes("chart") ||
    msg.includes("spending") ||
    msg.includes("breakdown") ||
    msg.includes("trend") ||
    msg.includes("category")
  ) {
    return {
      reply: `📊 **Analytics & Spending Intelligence:**

Tap **"Analytics"** in the bottom dock:
- **Spending by Category:** Interactive donut chart (Dining, Accommodation, Transport, Activities, Fuel).
- **Monthly Trajectory:** Trend graphs tracking total group spend over time.
- **Top Contributors:** See who has contributed the most to group costs.
- Automatically calculates in real time as expenses are logged!`,
      spotlightTarget: {
        id: "nav-analytics",
        label: "Analytics Tab 📊",
        description: "Tap here to explore category breakdowns and spending charts.",
      },
      proposedAction: {
        type: "switch_tab",
        payload: { tab: "analytics" },
        label: "📊 View Analytics Tab",
      },
    };
  }

  // ── 8. Personal Finance / Realm Switcher ──────────────────────────────────
  if (
    msg.includes("personal") ||
    msg.includes("room") ||
    msg.includes("local") ||
    msg.includes("individual") ||
    msg.includes("budget") ||
    msg.includes("goal")
  ) {
    return {
      reply: `🏡 **Local (Room Ledger) — Personal Finance Mode:**

SPL/IT includes two integrated realms:
- 🌲 **Trip (Forest Ledger):** Group expense splitting, participant emails, and UPI settlements.
- 🏠 **Local (Room Ledger):** Your private personal finances — track income & expenses, set category monthly budgets with warning limits, and track savings goals.

Use the **Realm Switcher** pill in the top header or click below to switch realms!`,
      spotlightTarget: {
        id: "realm-switcher",
        label: "Realm Switcher 🔄",
        description: "Switch between Trip (Forest Ledger) and Local (Room Ledger).",
      },
      proposedAction: {
        type: "switch_realm",
        payload: { realm: "local" },
        label: "🏠 Switch to Personal Finance",
      },
    };
  }

  // ── 9. Backdrop Blur & UI Ambience ───────────────────────────────────────
  if (
    msg.includes("blur") ||
    msg.includes("backdrop") ||
    msg.includes("background") ||
    msg.includes("theme") ||
    msg.includes("dark mode")
  ) {
    return {
      reply: `✨ **Atmospheric Backdrop Blur:**

In the top right of the navigation bar, click the **Blur Dropdown** to customize your visual ambience:
- 🌌 **Deep Bokeh (36px):** Maximum cinematic glassmorphism.
- 🌫️ **Soft Blur (18px):** Balanced frosted elegance.
- 🎨 **Abstract (8px):** High visual clarity.
- ⚡ **Off:** Pure performance crisp contrast.

Your preference is saved locally across sessions!`,
      spotlightTarget: {
        id: "blur-switcher",
        label: "Blur Settings 🎨",
        description: "Customize the cinematic frosted backdrop blur.",
      },
    };
  }

  // ── 9.5 Current Active Trips & Spaces ────────────────────────────────────
  if (
    msg.includes("my trips") ||
    msg.includes("what trips") ||
    msg.includes("show trips") ||
    msg.includes("list trips") ||
    msg.includes("all trips") ||
    msg.includes("my spaces") ||
    msg.includes("what spaces") ||
    (msg.includes("trip") && (msg.includes("have") || msg.includes("list") || msg.includes("active")))
  ) {
    const rawTrips =
      dashboardContext?.trips && dashboardContext.trips.length > 0
        ? dashboardContext.trips
        : MOCK_SPACES.filter((s: any) => s.type === "trip");

    const tripList = rawTrips
      .map((t: any) => {
        const members = (t.members || []).join(", ");
        return `📍 **${t.name}** (${t.location || "Trip"})\n   📅 *Dates:* ${t.dates || "Active"}\n   👥 *Members (${t.members?.length || 0}):* ${members}\n   💰 *Total Spend:* ₹${(t.totalSpend || 0).toLocaleString("en-IN")}`;
      })
      .join("\n\n");

    return {
      reply: `🏕️ **Your Active Trip Spaces (${rawTrips.length}):**\n\n${tripList}\n\n*Tap any space in the Spaces tab to view receipts, add participants, or export PDFs!*`,
      spotlightTarget: {
        id: "nav-spaces",
        label: "Spaces Tab 👥",
        description: "Click here to view your trip circles and member lists.",
      },
      proposedAction: {
        type: "switch_tab",
        payload: { tab: "spaces" },
        label: "👥 View Spaces Tab",
      },
    };
  }

  // ── 9.6 Recent Expenses & Spending History ────────────────────────────────
  if (
    (msg.includes("expense") || msg.includes("spent") || msg.includes("spending") || msg.includes("ledger")) &&
    (msg.includes("recent") || msg.includes("show") || msg.includes("what") || msg.includes("list") || msg.includes("history"))
  ) {
    const rawExpenses =
      dashboardContext?.recentExpenses && dashboardContext.recentExpenses.length > 0
        ? dashboardContext.recentExpenses
        : MOCK_SHARED_EXPENSES.slice(0, 5);

    const expenseList = rawExpenses
      .map(
        (e: any) =>
          `• **${e.description}** — ₹${(e.amount || 0).toLocaleString("en-IN")} (${e.spaceName || "Trip"})\n  *Paid by:* ${e.paidBy || "You"} • *Date:* ${e.date || "Recent"}`
      )
      .join("\n\n");

    return {
      reply: `🧾 **Recent Shared Expenses:**\n\n${expenseList}\n\n*Click "+ ADD EXPENSE" in the top bar to log a new receipt with automatic email dispatch!*`,
      spotlightTarget: {
        id: "nav-expenses",
        label: "Expenses Tab 🧾",
        description: "Explore all logged expenses and itemized splits.",
      },
      proposedAction: {
        type: "switch_tab",
        payload: { tab: "expenses" },
        label: "🧾 View All Expenses",
      },
    };
  }

  // ── 9.7 Outstanding Settlements & Debts ──────────────────────────────────
  if (
    (msg.includes("settle") || msg.includes("debt") || msg.includes("owe") || msg.includes("pending")) &&
    (msg.includes("who") || msg.includes("what") || msg.includes("show") || msg.includes("list") || msg.includes("status"))
  ) {
    const settlements =
      dashboardContext?.pendingSettlements && dashboardContext.pendingSettlements.length > 0
        ? dashboardContext.pendingSettlements
        : MOCK_SETTLEMENTS.filter((s: any) => s.status === "pending");

    if (settlements.length > 0) {
      const debtList = settlements
        .map(
          (s: any) =>
            `• **${s.from}** owes **${s.to}**: **₹${(s.amount || 0).toLocaleString("en-IN")}** (${s.space || "Trip"})`
        )
        .join("\n");

      return {
        reply: `⚖️ **Outstanding Settlements (${settlements.length} pending):**\n\n${debtList}\n\n*Click "SETTLE UP" to generate an instant dynamic UPI QR code to clear debts via Google Pay, PhonePe, or Paytm!*`,
        spotlightTarget: {
          id: "settle-up",
          label: "SETTLE UP ⚖️",
          description: "Clear pending debts instantly with dynamic UPI QR codes.",
        },
        proposedAction: {
          type: "open_modal",
          payload: { modal: "settle_up" },
          label: "⚖️ Open Settle Up (UPI QR)",
        },
      };
    }
  }

  // ── 10. General / Greeting / Fallback ────────────────────────────────────
  const isGreeting =
    msg.trim() === "hi" ||
    msg.trim() === "hello" ||
    msg.trim() === "hey" ||
    msg.trim() === "help" ||
    msg.startsWith("hi ") ||
    msg.startsWith("hello ") ||
    msg.startsWith("hey ");

  if (isGreeting) {
    return {
      reply: `👋 Hi! I'm **SPL/IT AI**, your travel & group finance copilot.

Here are popular things you can ask me:
- 👥 **"Who all are in my database?"** → I'll list all registered companions with their emails and roles!
- 🗺️ **"Schedule a trip to Ladakh with Rahul and Natasha"** → I'll verify contacts and launch an interactive table!
- 📧 **"How can we add emails of the participants in a trip?"** → I'll guide you step-by-step!
- 🧾 **"How do I log and split an expense?"** → I'll explain equal splits & automated email notifications.
- ⚡ **"How do I settle up using UPI?"** → I'll explain dynamic QR codes and settlements.
- 📸 **"How does the receipt scanner work?"** → I'll guide you through AI OCR bill parsing.
- 📊 **"Show spending breakdown"** → I'll guide you to Analytics.`,
      spotlightTarget: null,
      proposedAction: {
        type: "open_modal",
        payload: { modal: "new_space" },
        label: "🏕️ Create New Space",
      },
    };
  }

  // Conversational response when intent is open-ended
  return {
    reply: `💡 I understand you're asking: *"${userMsg}"*

Here is what you can do in SPL/IT:
- 👥 **Contacts Database:** Ask *"Who all are in my database?"* to see your saved travel companions.
- ✈️ **Trip Planning:** Say *"Plan a trip to Manali with friends"* to auto-match contacts and add missing people via an interactive table.
- 🧾 **Shared Expenses:** Ask *"How to log an expense"* or click **"+ ADD EXPENSE"** to split bills with automated email receipts.
- ⚖️ **Instant UPI Settle Up:** Click **"SETTLE UP"** to generate dynamic Google Pay / PhonePe QR codes.
- 🏡 **Personal Wealth (Room Ledger):** Toggle to the **Local** realm for monthly budgets and savings goals.`,
    spotlightTarget: {
      id: "realm-switcher",
      label: "Explore SPL/IT 🌐",
      description: "Ask about trips, contacts, expenses, settlements, or personal budgets anytime.",
    },
    proposedAction: {
      type: "open_modal",
      payload: { modal: "new_space" },
      label: "🏕️ Plan a Trip",
    },
  };
}

// ─── Smart Trip & Participant Natural Language Parser With Contact Lookup ──
function parseTripWithContacts(
  message: string,
  contacts: PersonRecord[] = []
): {
  destination: string;
  dates: string;
  coverUrl: string;
  matchedMembers: InteractiveTableMember[];
  missingNames: string[];
  estimatedBudget: number;
} {
  // 1. Destination parsing
  let destination = "Goa Beach";
  const destMatch =
    message.match(/(?:trip to|to|visit|heading to|travel to)\s+([A-Za-z\s&'-]+?)(?:\s+(?:with|and add|and include|for|in|from|next|this|[.!?]|$))/i) ||
    message.match(/(?:schedule|create|plan|book|make|start|organize)\s+(?:a\s+)?(?:trip\s+to\s+)?([A-Za-z\s]+?)(?:\s+trip)?[.!?]?$/i);

  if (destMatch && destMatch[1]) {
    const rawDest = destMatch[1].trim();
    if (rawDest && !["a", "the", "my", "our", "new", "these", "participants", "people", "someone", "somewhere"].includes(rawDest.toLowerCase())) {
      destination = rawDest;
    }
  }

  // 2. Participants parsing
  const rawNames: string[] = [];
  const withMatch = message.match(/(?:with|and add|add|include|including|participants(?:\s*:\s*|\s+are\s+))\s+([^.!?]+)/i);

  if (withMatch && withMatch[1]) {
    let rawParticipants = withMatch[1];
    rawParticipants = rawParticipants.replace(/(?:next|this|for\s+\d+|starting|budget|cost).*/i, "").trim();

    const tokens = rawParticipants
      .split(/,\s*|\s+and\s+|\s+&\s+|\s+\+\s+/i)
      .map((t) => t.trim())
      .filter(Boolean);

    const excludedWords = [
      "friends", "family", "everyone", "buddies", "people", "folks", "them",
      "guys", "us", "me", "myself", "these", "participants", "participant", "someone"
    ];

    tokens.forEach((token) => {
      const emailInParen = token.match(/^([A-Za-z\s.'-]+?)\s*[\(<\[]([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})[\)>\]]$/);
      const emailOnly = token.match(/^([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})$/);

      if (emailInParen) {
        rawNames.push(emailInParen[1].trim());
      } else if (emailOnly) {
        rawNames.push(emailOnly[1].split("@")[0]);
      } else {
        const cleanName = token.replace(/[^A-Za-z\s.'-]/g, "").trim();
        if (cleanName && cleanName.length > 1 && !excludedWords.includes(cleanName.toLowerCase())) {
          rawNames.push(cleanName);
        }
      }
    });
  }

  // Fallback names if none given
  if (rawNames.length === 0) {
    if (contacts.length >= 2) {
      rawNames.push(contacts[0].name.split(" ")[0]);
      rawNames.push("Natasha");
    } else {
      rawNames.push("Rahul");
      rawNames.push("Natasha");
    }
  }

  const matchedMembers: InteractiveTableMember[] = [];
  const missingNames: string[] = [];

  rawNames.forEach((rawName) => {
    const lower = rawName.toLowerCase();
    const found = contacts.find((c) => {
      const cLower = c.name.toLowerCase();
      const firstPart = cLower.split(" ")[0];
      return (
        cLower === lower ||
        firstPart === lower ||
        cLower.includes(lower) ||
        lower.includes(firstPart)
      );
    });

    if (found) {
      if (!matchedMembers.some((m) => m.name.toLowerCase() === found.name.toLowerCase())) {
        matchedMembers.push({
          id: found.id,
          name: found.name,
          email: found.email,
          phone: found.phone || "+91 98000 00000",
          description: found.description || "Saved contact in directory",
          selected: true,
          isExisting: true,
        });
      }
    } else {
      if (!missingNames.some((n) => n.toLowerCase() === rawName.toLowerCase())) {
        missingNames.push(rawName);
      }
    }
  });

  const startDate = new Date();
  startDate.setDate(startDate.getDate() + 14);
  const endDate = new Date(startDate);
  endDate.setDate(endDate.getDate() + 5);
  const dates = `${startDate.getDate()} - ${endDate.getDate()} ${endDate.toLocaleString("en-IN", { month: "short" })} ${endDate.getFullYear()}`;

  const totalMembersCount = 1 + matchedMembers.length + missingNames.length;
  const estimatedBudget = totalMembersCount * 11500;
  const coverUrl = getCoverForDestination(destination);

  return {
    destination,
    dates,
    coverUrl,
    matchedMembers,
    missingNames,
    estimatedBudget,
  };
}

// ─── POST API Route Handler ───────────────────────────────────────────────
export async function POST(request: Request) {
  try {
    const { messages, dashboardContext } = await request.json();

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: "Invalid messages format" }, { status: 400 });
    }

    const lastMessage = messages[messages.length - 1]?.content || "";
    const lowerMsg = lastMessage.toLowerCase();

    // Check for optional GEMINI_API_KEY
    const geminiApiKey = process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY;

    let responseText = "";
    let proposedAction: ActionProposal | null = null;
    let generatedImageUrl: string | null = null;
    let spotlightTarget: SpotlightTarget | null = null;
    let interactiveTable: InteractiveTableData | null = null;

    // Intent detection
    const isScheduleTripIntent =
      lowerMsg.includes("schedule a trip") ||
      lowerMsg.includes("plan a trip") ||
      lowerMsg.includes("create a trip") ||
      lowerMsg.includes("make a trip") ||
      lowerMsg.includes("start a trip") ||
      lowerMsg.includes("organize a trip") ||
      lowerMsg.includes("new trip") ||
      lowerMsg.includes("trip to ") ||
      lowerMsg.includes("book a trip") ||
      lowerMsg.includes("want to make a trip") ||
      lowerMsg.includes("want to plan a trip") ||
      (lowerMsg.includes("trip") &&
        (lowerMsg.includes("with") ||
          lowerMsg.includes("participants") ||
          lowerMsg.includes("add") ||
          lowerMsg.includes("people") ||
          lowerMsg.includes("names") ||
          lowerMsg.includes("members")));

    const isAddExpenseWithAmount =
      (lowerMsg.includes("add expense") || lowerMsg.includes("log expense") || lowerMsg.includes("record expense") || lowerMsg.includes("spent") || lowerMsg.includes("paid")) &&
      /\d+/.test(lowerMsg);

    // ── Schedule Trip Intent (Checks contacts database, asks to re-add existing, asks info for missing)
    if (isScheduleTripIntent) {
      const contacts: PersonRecord[] =
        dashboardContext?.contacts && dashboardContext.contacts.length > 0
          ? dashboardContext.contacts
          : MOCK_CONTACTS;
      const parsed = parseTripWithContacts(lastMessage, contacts);
      const destination = parsed.destination;
      const cover = parsed.coverUrl;
      generatedImageUrl = cover;

      let memberBreakdownText = "";
      if (parsed.matchedMembers.length > 0) {
        const matchedList = parsed.matchedMembers
          .map((m) => `  • ✅ **${m.name}** (\`${m.email}\` • 📞 \`${m.phone}\`)\n    *Role / Notes:* ${m.description}`)
          .join("\n");
        memberBreakdownText += `🔍 **Existing Contacts Found in Database:**\n${matchedList}\n\n👉 *Do you want to re-add ${parsed.matchedMembers.length === 1 ? 'this member' : 'these members'} to the trip?* (Checked by default in the interactive card below)\n\n`;
      }

      if (parsed.missingNames.length > 0) {
        const missingList = parsed.missingNames
          .map((n) => `  • ❓ **${n}** (Not found in directory)`)
          .join("\n");
        memberBreakdownText += `📝 **Missing from Contacts Database (Need Information):**\n${missingList}\n\n👉 *Please fill in their information (Email, Phone No, and any Description/Notes) in the registration table below. Once saved, they will be registered to your permanent contacts database and added to this trip!*`;
      } else if (parsed.matchedMembers.length > 0) {
        memberBreakdownText += `🎉 *All requested members were located in your contacts database! You can confirm them below, or add extra companions in the table.*`;
      }

      responseText = `✨ **Planning Trip to ${destination}!**

${memberBreakdownText}

- 📍 **Destination:** ${destination}
- 📅 **Dates:** ${parsed.dates}
- 💰 **Estimated Budget:** ₹${parsed.estimatedBudget.toLocaleString("en-IN")}

*Use the interactive table below to review existing members, add contact information for new members, and save them directly to your database!*`;

      interactiveTable = {
        destination,
        dates: parsed.dates,
        coverUrl: cover,
        matchedMembers: parsed.matchedMembers,
        missingNames: parsed.missingNames,
      };

      proposedAction = {
        type: "create_trip",
        label: `✈️ Create "${destination}" Space`,
        payload: {
          name: `${destination} Trip`,
          location: destination,
          dates: parsed.dates,
          members: [
            { name: "You", email: "you@split.app" },
            ...parsed.matchedMembers.map((m) => ({ name: m.name, email: m.email, phone: m.phone, description: m.description })),
          ],
          coverUrl: cover,
        },
      };

      spotlightTarget = {
        id: "new-space",
        label: "NEW SPACE 🏕️",
        description: "New spaces store participants and emails for automated expense breakdowns.",
      };
    } else if (isAddExpenseWithAmount) {
      const amountMatch = lastMessage.match(/(\d[\d,]*)/);
      const parsedAmount = amountMatch
        ? parseInt(amountMatch[1].replace(/,/g, ""), 10)
        : 2400;

      responseText = `🧾 **Expense Detected: ₹${parsedAmount.toLocaleString("en-IN")}**

I parsed an expense of **₹${parsedAmount.toLocaleString("en-IN")}** from your message. 

When you log this, SPL/IT will split the cost among your circle members and automatically dispatch itemized email breakdown receipts!

Click below to open the form pre-filled:`;

      proposedAction = {
        type: "add_expense",
        label: `Log ₹${parsedAmount.toLocaleString("en-IN")} Expense`,
        payload: {
          description: "Group Activity",
          amount: parsedAmount,
          paidBy: "You",
        },
      };

      spotlightTarget = {
        id: "add-expense",
        label: "+ ADD EXPENSE",
        description: "Click to log this expense with automated splitting.",
      };
    } else {
      // ── Real Gemini API path (if key configured) ──────────────────────────
      if (geminiApiKey) {
        try {
          const systemInstruction = `You are SPL/IT AI — the advanced, intelligent travel copilot and financial companion integrated into SPL/IT (a Next.js group expense ledger app).

App Capabilities & Workflows:
1. Participant Emails:
   - When creating a space (NEW SPACE button in top bar), users enter participant Names and Email Addresses.
   - For existing spaces, users go to Spaces tab -> click trip card -> under Circle Members & Emails, enter Name & Email and click + Add.
   - When adding an expense (+ ADD EXPENSE button), enabling the "Email Participants" toggle automatically dispatches split breakdown emails to everyone.
2. Settle Up (SETTLE UP button): Generates dynamic UPI QR codes for instant payments via GPay, PhonePe, Paytm.
3. Bill Scanner (SCAN BILL button): AI OCR extracts merchant, items, and total from receipt images.
4. Export Receipt (RECEIPT button): Generates print-ready PDF summaries of trip expenses.
5. Realm Switcher: Toggles between Trip (Forest Ledger) for groups and Local (Room Ledger) for personal finance with Budgets and Goals.

Current Live Dashboard Context:
- Active Realm: ${dashboardContext?.currentSpace || "trip"}
- Active Tab: ${dashboardContext?.activeTab || "home"}
- User Net Balance: ₹${dashboardContext?.userBalance ?? "2,180"}
- Active Trips: ${JSON.stringify(dashboardContext?.trips || [])}

Rules:
- Be warm, extremely knowledgeable, and concise. Use markdown and emojis.
- Point out specific UI buttons with their exact labels.
- Do NOT prefix responses with "As an AI language model".`;

          const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiApiKey}`;

          const contents = [
            {
              role: "user",
              parts: [{ text: systemInstruction }],
            },
            {
              role: "model",
              parts: [{ text: "Understood! I'm SPL/IT AI, your travel and group finance copilot. How can I help you today?" }],
            },
            ...messages
              .filter((m: ChatMessage) => m.role !== "system")
              .map((m: ChatMessage) => ({
                role: m.role === "assistant" ? "model" : "user",
                parts: [{ text: m.content }],
              })),
          ];

          const geminiRes = await fetch(geminiUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              contents,
              generationConfig: {
                temperature: 0.6,
                maxOutputTokens: 512,
              },
            }),
          });

          if (geminiRes.ok) {
            const data = await geminiRes.json();
            responseText = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || "";
          }
        } catch (err) {
          console.warn("[Gemini API] Failed, using advanced reasoning engine:", err);
        }
      }

      // If Gemini wasn't used or failed, run our advanced contextual engine
      if (!responseText) {
        const result = advancedAnswer(lastMessage, dashboardContext, messages);
        responseText = result.reply;
        spotlightTarget = result.spotlightTarget || null;
        proposedAction = result.proposedAction || null;
      }

      // Always ensure spotlight is set if not yet resolved
      if (!spotlightTarget) {
        spotlightTarget = getSpotlightForMessage(lastMessage);
      }
    }

    return NextResponse.json({
      success: true,
      reply: responseText,
      proposedAction,
      generatedImageUrl,
      spotlightTarget,
      interactiveTable,
    });
  } catch (error) {
    console.error("[API/ai-assistant] Error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to process AI chat message" },
      { status: 500 }
    );
  }
}
