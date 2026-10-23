"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  SpaceSummary,
  SharedExpense,
  Settlement,
  PersonRecord,
  InteractiveTableData,
  InteractiveTableMember,
  ParticipantMember,
} from "../../lib/types/dashboard";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  proposedAction?: {
    type: "create_trip" | "add_expense" | "settle_up" | "switch_space" | "open_modal" | "switch_tab" | "switch_realm" | "add_member";
    label: string;
    payload?: any;
  } | null;
  generatedImageUrl?: string | null;
  spotlightTarget?: { id: string; label: string; description: string } | null;
  interactiveTable?: InteractiveTableData | null;
  tableCompleted?: boolean;
  timestamp: string;
}

interface AiChatDrawerProps {
  currentSpace: "trip" | "local";
  activeTripTab?: string;
  activePersonalTab?: string;
  userSpaces?: SpaceSummary[];
  userExpenses?: SharedExpense[];
  settlements?: Settlement[];
  userBalance?: number;
  contacts?: PersonRecord[];
  onBatchSaveContacts?: (contacts: PersonRecord[]) => void;
  onSpaceCreated: (space: SpaceSummary) => void;
  onOpenNewSpace?: () => void;
  onOpenAddExpense: () => void;
  onOpenSettleUp: () => void;
  onOpenScanBill?: () => void;
  onOpenExportReceipt?: () => void;
  onOpenAddBudget?: () => void;
  onOpenAddGoal?: () => void;
  onOpenAddTransaction?: () => void;
  onNavigateTab?: (tab: any) => void;
  onSwitchRealm?: (realm: "trip" | "local") => void;
  onSpotlight: (target: { id: string; label: string; description: string }) => void;
}

interface AiTripMemberTableProps {
  tableData: InteractiveTableData;
  isCompleted?: boolean;
  onSaveAndCreateTrip: (
    newPersons: PersonRecord[],
    selectedMatched: InteractiveTableMember[],
    destination: string,
    dates: string,
    coverUrl: string
  ) => void;
  onSaveContactsOnly: (newPersons: PersonRecord[]) => void;
}

function AiTripMemberTable({
  tableData,
  isCompleted,
  onSaveAndCreateTrip,
  onSaveContactsOnly,
}: AiTripMemberTableProps) {
  const [matched, setMatched] = useState<InteractiveTableMember[]>(
    tableData.matchedMembers.map((m) => ({ ...m, selected: true }))
  );

  const [rows, setRows] = useState<
    Array<{ id: string; name: string; email: string; phone: string; description: string }>
  >(() => {
    if (tableData.missingNames && tableData.missingNames.length > 0) {
      return tableData.missingNames.map((name, idx) => ({
        id: `row-${idx}-${Date.now()}`,
        name,
        email: "",
        phone: "",
        description: "",
      }));
    }
    return [
      {
        id: `row-new-${Date.now()}`,
        name: "",
        email: "",
        phone: "",
        description: "",
      },
    ];
  });

  const toggleMatched = (index: number) => {
    setMatched((prev) =>
      prev.map((item, i) => (i === index ? { ...item, selected: !item.selected } : item))
    );
  };

  const handleUpdateRow = (id: string, field: string, val: string) => {
    setRows((prev) =>
      prev.map((r) => (r.id === id ? { ...r, [field]: val } : r))
    );
  };

  const handleAddRow = () => {
    setRows((prev) => [
      ...prev,
      {
        id: `row-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        name: "",
        email: "",
        phone: "",
        description: "",
      },
    ]);
  };

  const handleRemoveRow = (id: string) => {
    setRows((prev) => prev.filter((r) => r.id !== id));
  };

  const buildNewPersons = (): PersonRecord[] => {
    return rows
      .filter((r) => r.name.trim().length > 0)
      .map((r) => {
        const cleanName = r.name.trim();
        const fallbackEmail = `${cleanName.toLowerCase().replace(/[^a-z0-9]/g, "")}@split.app`;
        return {
          id: `cont-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          name: cleanName,
          email: r.email.trim() || fallbackEmail,
          phone: r.phone.trim() || "+91 98000 00000",
          description: r.description.trim() || "Registered via AI Assistant",
          lastTrip: tableData.destination,
          createdAt: new Date().toISOString(),
        };
      });
  };

  if (isCompleted) {
    return (
      <div className="mt-3 p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/40 text-[11px] text-emerald-300 flex items-center gap-2">
        <span>✅</span>
        <span>
          Contacts registered to database &amp; <strong>{tableData.destination} Trip</strong> created!
        </span>
      </div>
    );
  }

  return (
    <div className="mt-3 rounded-xl border border-[rgba(255,248,235,0.18)] bg-[rgba(18,25,27,0.85)] backdrop-blur-md overflow-hidden text-xs shadow-xl animate-in fade-in duration-300">
      {/* Table Banner Header */}
      <div className="relative px-3.5 py-2.5 bg-gradient-to-r from-[#202d30] to-[#162124] border-b border-[rgba(255,248,235,0.1)] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-base">✨</span>
          <div>
            <h4 className="font-bold text-white text-[12px] leading-tight">
              Trip to {tableData.destination}
            </h4>
            <p className="text-[10px] text-[rgba(255,245,230,0.5)] font-mono">
              {tableData.dates}
            </p>
          </div>
        </div>
        <span className="px-2 py-0.5 rounded-full bg-[#e0a875]/20 border border-[#e0a875]/40 text-[#e0a875] text-[9px] font-mono">
          AI Contact Manager
        </span>
      </div>

      {/* 1. Existing Contacts in Database */}
      {matched.length > 0 && (
        <div className="p-3 border-b border-[rgba(255,248,235,0.08)] bg-[rgba(255,248,235,0.02)]">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-semibold text-emerald-300 flex items-center gap-1.5">
              <span>🔍</span> Found in Contacts Database ({matched.length})
            </span>
            <span className="text-[9px] text-[rgba(255,245,230,0.45)]">
              Re-add to this trip?
            </span>
          </div>

          <div className="space-y-1.5">
            {matched.map((m, idx) => (
              <label
                key={m.id || idx}
                className={`flex items-start gap-2.5 p-2 rounded-lg border transition-all cursor-pointer ${
                  m.selected
                    ? "bg-emerald-950/25 border-emerald-500/35 text-white"
                    : "bg-black/20 border-white/5 text-[rgba(255,245,230,0.4)] opacity-60"
                }`}
              >
                <input
                  type="checkbox"
                  checked={m.selected}
                  onChange={() => toggleMatched(idx)}
                  className="mt-0.5 rounded border-white/20 text-[#6ee7b7] focus:ring-0 accent-emerald-500 cursor-pointer"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1">
                    <span className="font-semibold text-[11px] text-white truncate">
                      {m.name}
                    </span>
                    <span className="text-[9px] font-mono text-[rgba(255,245,230,0.5)]">
                      {m.phone}
                    </span>
                  </div>
                  <div className="text-[10px] text-emerald-400 font-mono truncate">
                    {m.email}
                  </div>
                  {m.description && (
                    <p className="text-[9px] text-[rgba(255,245,230,0.5)] italic mt-0.5 truncate">
                      Role / Note: {m.description}
                    </p>
                  )}
                </div>
              </label>
            ))}
          </div>
        </div>
      )}

      {/* 2. New Contacts Registration Table */}
      <div className="p-3">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[11px] font-semibold text-[#e0a875] flex items-center gap-1.5">
            <span>📝</span> Register New People to Database ({rows.filter((r) => r.name.trim()).length || rows.length})
          </span>
          <span className="text-[9px] text-[rgba(255,245,230,0.45)]">
            Permanent Directory
          </span>
        </div>

        {rows.length === 0 ? (
          <div className="py-3 px-2 text-center text-[10px] text-[rgba(255,245,230,0.4)] bg-black/20 rounded-lg border border-dashed border-white/10">
            All mentioned members exist in your database! Click below if you want to add another person.
          </div>
        ) : (
          <div className="space-y-2">
            {rows.map((row) => (
              <div
                key={row.id}
                className="p-2.5 rounded-lg bg-[rgba(255,248,235,0.03)] border border-[rgba(255,248,235,0.08)] space-y-1.5"
              >
                <div className="flex items-center gap-2">
                  <div className="flex-1">
                    <label className="block text-[8px] uppercase tracking-wider text-[rgba(255,245,230,0.4)] font-mono mb-0.5">
                      Name *
                    </label>
                    <input
                      type="text"
                      value={row.name}
                      onChange={(e) => handleUpdateRow(row.id, "name", e.target.value)}
                      placeholder="e.g. Natasha"
                      className="w-full bg-black/40 border border-white/10 rounded px-2 py-1 text-[11px] text-white placeholder-white/20 focus:border-[#e0a875] outline-none"
                    />
                  </div>

                  <div className="flex-1">
                    <label className="block text-[8px] uppercase tracking-wider text-[rgba(255,245,230,0.4)] font-mono mb-0.5">
                      Email Address
                    </label>
                    <input
                      type="email"
                      value={row.email}
                      onChange={(e) => handleUpdateRow(row.id, "email", e.target.value)}
                      placeholder="e.g. natasha@example.com"
                      className="w-full bg-black/40 border border-white/10 rounded px-2 py-1 text-[11px] text-white placeholder-white/20 focus:border-[#e0a875] outline-none"
                    />
                  </div>

                  {rows.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveRow(row.id)}
                      className="self-end mb-0.5 w-6 h-6 rounded bg-rose-500/10 hover:bg-rose-500/25 text-rose-400 flex items-center justify-center text-xs cursor-pointer"
                      title="Remove row"
                    >
                      ✕
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <div className="w-1/3">
                    <label className="block text-[8px] uppercase tracking-wider text-[rgba(255,245,230,0.4)] font-mono mb-0.5">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      value={row.phone}
                      onChange={(e) => handleUpdateRow(row.id, "phone", e.target.value)}
                      placeholder="+91 98765 43210"
                      className="w-full bg-black/40 border border-white/10 rounded px-2 py-1 text-[10px] text-white placeholder-white/20 focus:border-[#e0a875] outline-none font-mono"
                    />
                  </div>

                  <div className="flex-1">
                    <label className="block text-[8px] uppercase tracking-wider text-[rgba(255,245,230,0.4)] font-mono mb-0.5">
                      Description / Role / Notes
                    </label>
                    <input
                      type="text"
                      value={row.description}
                      onChange={(e) => handleUpdateRow(row.id, "description", e.target.value)}
                      placeholder="e.g. Vegetarian, handles bookings, photographer..."
                      className="w-full bg-black/40 border border-white/10 rounded px-2 py-1 text-[10px] text-white placeholder-white/20 focus:border-[#e0a875] outline-none"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <button
          type="button"
          onClick={handleAddRow}
          className="mt-2 w-full py-1.5 rounded-lg border border-dashed border-[rgba(255,248,235,0.15)] hover:border-[#e0a875]/50 text-[10px] text-[rgba(255,245,230,0.6)] hover:text-[#e0a875] flex items-center justify-center gap-1 transition-all cursor-pointer"
        >
          <span>+</span> Add Another Person to Table
        </button>
      </div>

      {/* Action Footer */}
      <div className="p-3 bg-black/30 border-t border-white/5 flex flex-col gap-1.5">
        <button
          type="button"
          onClick={() => {
            const newPersons = buildNewPersons();
            onSaveAndCreateTrip(
              newPersons,
              matched.filter((m) => m.selected),
              tableData.destination,
              tableData.dates,
              tableData.coverUrl
            );
          }}
          className="w-full py-2 px-3 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-bold transition-all shadow-md flex items-center justify-center gap-1.5 cursor-pointer"
        >
          <span>💾</span>
          <span>Save to Database &amp; Create Trip</span>
        </button>

        {rows.some((r) => r.name.trim().length > 0) && (
          <button
            type="button"
            onClick={() => {
              const newPersons = buildNewPersons();
              onSaveContactsOnly(newPersons);
            }}
            className="w-full py-1 text-[10px] text-[rgba(255,245,230,0.5)] hover:text-white transition-all underline text-center cursor-pointer"
          >
            Save New People to Database Only
          </button>
        )}
      </div>
    </div>
  );
}

export function AiChatDrawer({
  currentSpace,
  activeTripTab = "home",
  activePersonalTab = "home",
  userSpaces = [],
  userExpenses = [],
  settlements = [],
  userBalance = 2180,
  contacts = [],
  onBatchSaveContacts,
  onSpaceCreated,
  onOpenNewSpace,
  onOpenAddExpense,
  onOpenSettleUp,
  onOpenScanBill,
  onOpenExportReceipt,
  onOpenAddBudget,
  onOpenAddGoal,
  onOpenAddTransaction,
  onNavigateTab,
  onSwitchRealm,
  onSpotlight,
}: AiChatDrawerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "msg-welcome",
      role: "assistant",
      content:
        "👋 Hello! I'm **SPL/IT AI**, your advanced travel copilot and financial companion.\n\nAsk me anything: adding participant emails, scheduling trips with AI visuals, logging expenses, settling up with UPI QR codes, or navigating any feature on your screen!",
      timestamp: "Just now",
    },
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus();
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [isOpen, messages]);

  const handleSendMessage = async (userText?: string) => {
    const textToSend = userText || input.trim();
    if (!textToSend || isLoading) return;

    const userMessage: Message = {
      id: `usr-${Date.now()}`,
      role: "user",
      content: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const res = await fetch("/api/ai-assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [...messages, userMessage].map((m) => ({
            role: m.role,
            content: m.content,
          })),
          dashboardContext: {
            currentSpace,
            activeTab: currentSpace === "trip" ? activeTripTab : activePersonalTab,
            userBalance,
            contacts,
            trips: userSpaces.map((s) => ({
              id: s.id,
              name: s.name,
              location: s.location,
              dates: s.dates,
              members: s.memberNames,
              memberEmails: s.memberEmails || {},
              totalSpend: s.totalSpend,
              balance: s.userBalance,
              status: s.status,
            })),
            recentExpenses: userExpenses.slice(0, 5).map((e) => ({
              description: e.description,
              amount: e.amount,
              paidBy: e.paidBy,
              spaceName: e.spaceName,
              date: e.date,
            })),
            pendingSettlements: settlements
              .filter((s) => s.status === "pending")
              .map((s) => ({
                from: s.fromUser,
                to: s.toUser,
                amount: s.amount,
                space: s.spaceName,
              })),
          },
        }),
      });

      const data = await res.json();

      if (data.success) {
        const newMsg: Message = {
          id: `ai-${Date.now()}`,
          role: "assistant",
          content: data.reply,
          proposedAction: data.proposedAction,
          generatedImageUrl: data.generatedImageUrl,
          spotlightTarget: data.spotlightTarget,
          interactiveTable: data.interactiveTable || null,
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        };
        setMessages((prev) => [...prev, newMsg]);

        // Trigger spotlight with smooth delay to allow user to view the answer
        if (data.spotlightTarget) {
          setTimeout(() => onSpotlight(data.spotlightTarget), 500);
        }
      } else {
        throw new Error(data.error || "Failed to fetch response");
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: `ai-err-${Date.now()}`,
          role: "assistant",
          content:
            "I ran into an issue connecting to the AI server. You can ask me how to add participant emails, schedule trips, or settle balances!",
          timestamp: "Just now",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const executeAction = (action: NonNullable<Message["proposedAction"]>) => {
    if (action.type === "create_trip") {
      const { name, location, dates, members, coverUrl } = action.payload;
      const memberEmailsMap: Record<string, string> = {};
      const memberNames: string[] = [];

      members.forEach((m: { name: string; email: string }) => {
        memberNames.push(m.name);
        memberEmailsMap[m.name] = m.email;
      });

      const newSpace: SpaceSummary = {
        id: `space-${Date.now()}`,
        name,
        type: "trip",
        location,
        dates,
        membersCount: members.length,
        memberNames,
        memberEmails: memberEmailsMap,
        participants: members,
        totalSpend: 0,
        userBalance: 0,
        balanceStatus: "settled",
        recentActivity: "AI generated voyage initialized",
        coverUrl,
        status: "Active",
      };

      onSpaceCreated(newSpace);

      setMessages((prev) => [
        ...prev,
        {
          id: `ai-done-${Date.now()}`,
          role: "assistant",
          content: `🎉 Done! **${name}** has been created with registered participant emails and added to your dashboard!`,
          timestamp: "Just now",
        },
      ]);
    } else if (action.type === "add_expense") {
      onOpenAddExpense();
    } else if (action.type === "settle_up") {
      onOpenSettleUp();
    } else if (action.type === "open_modal") {
      const modal = action.payload?.modal;
      if (modal === "new_space") onOpenNewSpace?.();
      else if (modal === "add_expense") onOpenAddExpense();
      else if (modal === "settle_up") onOpenSettleUp();
      else if (modal === "scan_bill") onOpenScanBill?.();
      else if (modal === "export_receipt") onOpenExportReceipt?.();
      else if (modal === "add_budget") onOpenAddBudget?.();
      else if (modal === "add_goal") onOpenAddGoal?.();
      else if (modal === "add_transaction") onOpenAddTransaction?.();
    } else if (action.type === "switch_tab") {
      onNavigateTab?.(action.payload?.tab);
    } else if (action.type === "switch_realm") {
      onSwitchRealm?.(action.payload?.realm || "local");
    }
  };

  const handleSaveAndCreateTrip = (
    msgId: string,
    newPersons: PersonRecord[],
    selectedMatched: InteractiveTableMember[],
    destination: string,
    dates: string,
    coverUrl: string
  ) => {
    // 1. Save new contacts to directory database
    if (newPersons.length > 0 && onBatchSaveContacts) {
      onBatchSaveContacts(newPersons);
    }

    // 2. Build participants list
    const participants: ParticipantMember[] = [
      { name: "You", email: "you@split.app" },
      ...selectedMatched.map((m) => ({
        name: m.name,
        email: m.email,
        phone: m.phone,
        description: m.description,
      })),
      ...newPersons.map((p) => ({
        name: p.name,
        email: p.email,
        phone: p.phone,
        description: p.description,
      })),
    ];

    const memberNames: string[] = [];
    const memberEmailsMap: Record<string, string> = {};

    participants.forEach((p) => {
      memberNames.push(p.name);
      memberEmailsMap[p.name] = p.email;
    });

    const newSpace: SpaceSummary = {
      id: `space-${Date.now()}`,
      name: `${destination} Trip`,
      type: "trip",
      location: destination,
      dates,
      membersCount: participants.length,
      memberNames,
      memberEmails: memberEmailsMap,
      participants,
      totalSpend: 0,
      userBalance: 0,
      balanceStatus: "settled",
      recentActivity: "AI generated voyage initialized with registered directory contacts",
      coverUrl,
      status: "Active",
    };

    onSpaceCreated(newSpace);

    // Mark table as completed
    setMessages((prev) =>
      prev.map((m) => (m.id === msgId ? { ...m, tableCompleted: true } : m))
    );

    // Send confirmation message
    const savedNames = newPersons.map((p) => p.name).join(", ");
    setMessages((prev) => [
      ...prev,
      {
        id: `ai-done-${Date.now()}`,
        role: "assistant",
        content: `🎉 **${destination} Trip Created Successfully!**\n\n${
          newPersons.length > 0
            ? `✅ Added **${savedNames}** to your permanent Contacts database with their phone numbers and notes.\n`
            : ""
        }${
          selectedMatched.length > 0
            ? `✅ Re-added **${selectedMatched.map((m) => m.name).join(", ")}** from your database to this trip.\n`
            : ""
        }\nAll participant email addresses have been registered for automated expense breakdown alerts!`,
        proposedAction: {
          type: "switch_tab",
          payload: { tab: "spaces" },
          label: `📍 View "${destination} Trip" Space`,
        },
        timestamp: "Just now",
      },
    ]);
  };

  const handleSaveContactsOnly = (msgId: string, newPersons: PersonRecord[]) => {
    if (newPersons.length > 0 && onBatchSaveContacts) {
      onBatchSaveContacts(newPersons);
      setMessages((prev) =>
        prev.map((m) => (m.id === msgId ? { ...m, tableCompleted: true } : m))
      );
      setMessages((prev) => [
        ...prev,
        {
          id: `ai-contacts-${Date.now()}`,
          role: "assistant",
          content: `✅ Successfully saved **${newPersons.map((p) => p.name).join(", ")}** to your permanent Contacts database! You can now re-add them to any trip in the future with 1 click.`,
          timestamp: "Just now",
        },
      ]);
    }
  };

  return (
    <>
      {/* 1. Floating Bottom-Right Trigger Button */}
      <div className="fixed bottom-6 right-6 z-40">
        <button
          type="button"
          onClick={() => setIsOpen((prev) => !prev)}
          className={`flex items-center gap-2.5 px-4 py-3 rounded-full shadow-2xl backdrop-blur-xl border transition-all duration-300 group hover:scale-105 ${
            isOpen
              ? "bg-[#e0a875] text-[#12191b] border-[#e0a875] shadow-[#e0a875]/30"
              : "bg-[#182428]/90 text-[#fff7ec] border-[#e0a875]/40 hover:border-[#e0a875] shadow-black/60"
          }`}
          style={{
            boxShadow: isOpen
              ? "0 0 25px rgba(224, 168, 117, 0.4)"
              : "0 10px 30px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.15)",
          }}
          title="Open SPL/IT AI Copilot"
        >
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#6ee7b7] opacity-75" />
            <span className="relative inline-flex rounded-full h-3 w-3 bg-[#6ee7b7]" />
          </span>
          <span className="text-base">✨</span>
          <span className="text-xs font-bold tracking-wide">
            {isOpen ? "Close Copilot" : "SPL/IT AI"}
          </span>
        </button>
      </div>

      {/* 2. Floating Right-Side Pop-Open Chat Drawer */}
      {isOpen && (
        <div
          role="dialog"
          aria-label="SPLIT AI Copilot"
          className="fixed inset-y-0 right-0 z-50 w-full sm:w-[440px] lg:w-[480px] bg-[#12191c]/95 backdrop-blur-2xl border-l border-[rgba(255,248,235,0.15)] shadow-2xl flex flex-col animate-in slide-in-from-right duration-300"
          style={{
            boxShadow: "-20px 0 60px rgba(0, 0, 0, 0.7), inset 1px 0 0 rgba(255, 255, 255, 0.1)",
          }}
        >
          {/* Header */}
          <div className="p-4 sm:p-5 border-b border-[rgba(255,248,235,0.1)] flex items-center justify-between relative overflow-hidden">
            {/* Ambient subtle glow */}
            <div className="absolute top-0 right-0 w-40 h-40 bg-[radial-gradient(circle_at_top_right,rgba(224,168,117,0.15),transparent_70%)] pointer-events-none" />

            <div className="flex items-center gap-3 relative z-10">
              <div className="w-10 h-10 rounded-2xl bg-[#e0a875]/15 border border-[#e0a875]/35 text-[#e0a875] flex items-center justify-center text-lg shadow-inner">
                ✨
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3
                    className="text-base font-semibold text-[#fff7ec]"
                    style={{ fontFamily: "var(--font-display), Georgia, serif" }}
                  >
                    SPL/IT Copilot
                  </h3>
                  <span className="text-[9px] font-mono font-bold uppercase tracking-widest px-1.5 py-0.5 rounded bg-[#6ee7b7]/15 text-[#6ee7b7] border border-[#6ee7b7]/30">
                    Pro AI
                  </span>
                </div>
                <p className="text-[11px] text-[rgba(255,245,230,0.5)]">
                  Trip scheduling, participant emails &amp; ledger advice
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="w-8 h-8 rounded-full bg-[rgba(255,248,235,0.06)] hover:bg-[rgba(255,248,235,0.14)] text-[rgba(255,245,230,0.6)] hover:text-white flex items-center justify-center text-sm transition-all"
            >
              ✕
            </button>
          </div>

          {/* Quick Prompt Pills */}
          <div
            className="px-4 py-2 border-b border-[rgba(255,248,235,0.06)] bg-[rgba(255,248,235,0.02)] flex items-center gap-1.5 overflow-x-auto no-scrollbar scrollbar-none [&::-webkit-scrollbar]:hidden [scrollbar-width:none] [-ms-overflow-style:none] text-[11px]"
            style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
          >
            <button
              type="button"
              onClick={() => handleSendMessage("Plan a trip to Manali with Rahul and Natasha")}
              className="px-2.5 py-1 rounded-full bg-[#e0a875]/20 hover:bg-[#e0a875]/35 hover:text-[#e0a875] text-[#e0a875] border border-[#e0a875]/50 whitespace-nowrap transition-all flex items-center gap-1 font-semibold cursor-pointer shadow-sm"
            >
              <span>✈️</span> Trip with Rahul &amp; Natasha
            </button>
            <button
              type="button"
              onClick={() => handleSendMessage("What else can we do with the site?")}
              className="px-2.5 py-1 rounded-full bg-[rgba(255,248,235,0.05)] hover:bg-[#e0a875]/20 hover:text-[#e0a875] text-[rgba(255,245,230,0.85)] border border-[rgba(255,248,235,0.15)] whitespace-nowrap transition-all flex items-center gap-1 font-medium cursor-pointer"
            >
              <span>🌟</span> Top to Bottom Guide
            </button>
            <button
              type="button"
              onClick={() => handleSendMessage("Show all contacts in my database")}
              className="px-2.5 py-1 rounded-full bg-[rgba(255,248,235,0.05)] hover:bg-[#e0a875]/20 hover:text-[#e0a875] text-[rgba(255,245,230,0.85)] border border-[rgba(255,248,235,0.15)] whitespace-nowrap transition-all flex items-center gap-1 font-medium cursor-pointer"
            >
              <span>👥</span> Saved Contacts
            </button>
            <button
              type="button"
              onClick={() => handleSendMessage("How can we add emails of the participants in a trip?")}
              className="px-2.5 py-1 rounded-full bg-[rgba(255,248,235,0.05)] hover:bg-[#e0a875]/20 hover:text-[#e0a875] text-[rgba(255,245,230,0.7)] border border-[rgba(255,248,235,0.08)] whitespace-nowrap transition-all flex items-center gap-1 cursor-pointer"
            >
              <span>📧</span> Add Emails
            </button>
            <button
              type="button"
              onClick={() => handleSendMessage("How do I settle my balance via UPI?")}
              className="px-2.5 py-1 rounded-full bg-[rgba(255,248,235,0.05)] hover:bg-[#e0a875]/20 hover:text-[#e0a875] text-[rgba(255,245,230,0.7)] border border-[rgba(255,248,235,0.08)] whitespace-nowrap transition-all cursor-pointer"
            >
              ⚡ Settle UPI
            </button>
            <button
              type="button"
              onClick={() => handleSendMessage("How does the bill scanner work?")}
              className="px-2.5 py-1 rounded-full bg-[rgba(255,248,235,0.05)] hover:bg-[#e0a875]/20 hover:text-[#e0a875] text-[rgba(255,245,230,0.7)] border border-[rgba(255,248,235,0.08)] whitespace-nowrap transition-all cursor-pointer"
            >
              📷 Scan Bill
            </button>
          </div>

          {/* Messages Feed */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
            {messages.map((m) => {
              const isUser = m.role === "user";
              return (
                <div
                  key={m.id}
                  className={`flex flex-col ${isUser ? "items-end" : "items-start"} space-y-1.5`}
                >
                  <div
                    className={`max-w-[92%] rounded-2xl p-3.5 text-xs leading-relaxed ${
                      isUser
                        ? "bg-[#e0a875] text-[#12191b] font-medium rounded-tr-sm shadow-md"
                        : "bg-[rgba(255,248,235,0.05)] text-[#fff7ec] border border-[rgba(255,248,235,0.1)] rounded-tl-sm shadow-inner"
                    }`}
                  >
                    <div className="whitespace-pre-wrap">{m.content}</div>

                    {/* Spotlight Indicator Badge */}
                    {m.spotlightTarget && (
                      <div className="mt-2.5 flex items-center justify-between gap-2 px-3 py-1.5 rounded-xl bg-[#e0a875]/15 border border-[#e0a875]/35 text-[11px] text-[#e0a875] animate-in fade-in">
                        <div className="flex items-center gap-1.5 truncate">
                          <span className="text-sm">🎯</span>
                          <span className="truncate">
                            Pointed out: <strong>{m.spotlightTarget.label}</strong>
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => onSpotlight(m.spotlightTarget!)}
                          className="underline hover:text-white shrink-0 font-semibold text-[10px]"
                        >
                          Highlight
                        </button>
                      </div>
                    )}

                    {/* AI Generated Image Visual Card */}
                    {m.generatedImageUrl && (
                      <div className="mt-3 rounded-xl overflow-hidden border border-[rgba(255,248,235,0.15)] relative group shadow-lg">
                        <div
                          className="w-full h-36 bg-cover bg-center transition-transform group-hover:scale-105 duration-500"
                          style={{ backgroundImage: `url(${m.generatedImageUrl})` }}
                        />
                        <div className="absolute top-2 right-2 px-2 py-0.5 rounded-full bg-black/60 backdrop-blur-md text-[9px] font-mono text-[#6ee7b7] border border-[#6ee7b7]/30">
                          ✨ AI Visual
                        </div>
                      </div>
                    )}

                    {/* Interactive Contacts & Trip Member Table Section */}
                    {m.interactiveTable && (
                      <AiTripMemberTable
                        tableData={m.interactiveTable}
                        isCompleted={m.tableCompleted}
                        onSaveAndCreateTrip={(newPersons, selectedMatched, dest, dates, cover) =>
                          handleSaveAndCreateTrip(m.id, newPersons, selectedMatched, dest, dates, cover)
                        }
                        onSaveContactsOnly={(newPersons) =>
                          handleSaveContactsOnly(m.id, newPersons)
                        }
                      />
                    )}

                    {/* Action Proposal Button */}
                    {m.proposedAction && !m.interactiveTable && (
                      <div className="mt-3 pt-2.5 border-t border-[rgba(255,248,235,0.15)]">
                        <button
                          type="button"
                          onClick={() => executeAction(m.proposedAction!)}
                          className="w-full py-2 px-3 rounded-xl bg-[#6ee7b7] hover:bg-[#a7f3d0] text-[#091811] text-xs font-bold transition-all shadow-md flex items-center justify-center gap-1.5"
                        >
                          <span>⚡</span>
                          <span>{m.proposedAction.label}</span>
                        </button>
                      </div>
                    )}
                  </div>
                  <span className="text-[9px] text-[rgba(255,245,230,0.35)] font-mono px-1">
                    {m.timestamp}
                  </span>
                </div>
              );
            })}

            {isLoading && (
              <div className="flex items-center gap-2 p-3 rounded-2xl bg-[rgba(255,248,235,0.04)] border border-[rgba(255,248,235,0.08)] max-w-[160px]">
                <div className="w-2 h-2 rounded-full bg-[#e0a875] animate-ping" />
                <span className="text-xs text-[rgba(255,245,230,0.6)] font-mono">
                  Thinking...
                </span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Chat Input Bar */}
          <div className="p-4 border-t border-[rgba(255,248,235,0.1)] bg-[#0d1315]">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="flex items-center gap-2"
            >
              <input
                ref={inputRef}
                type="text"
                placeholder="Ask e.g. 'How do I add participant emails?'..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                disabled={isLoading}
                className="flex-1 bg-[rgba(255,248,235,0.05)] border border-[rgba(255,248,235,0.14)] focus:border-[#e0a875]/60 focus:ring-1 focus:ring-[#e0a875]/30 rounded-xl px-3.5 py-2.5 text-xs text-[#fff7ec] placeholder-[rgba(255,245,230,0.35)] outline-none transition-all"
              />
              <button
                type="submit"
                disabled={!input.trim() || isLoading}
                className="px-4 py-2.5 rounded-xl bg-[#e0a875] hover:bg-[#ebdcd0] text-[#12191b] font-bold text-xs shadow-md transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center"
              >
                Send
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
