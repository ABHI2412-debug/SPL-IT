"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import styles from "../app/[space]/zone.module.css";
import { createClient } from "../lib/supabase/client";

const trips = [
  ["Himalayan escape", "12 - 17 Oct 2025", "Manali, India", "4 people", "₹38,420", "you are owed ₹2,180", "mountains", "Upcoming", "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1600&q=85"],
  ["Goa long weekend", "08 - 11 Aug 2025", "North Goa, India", "6 people", "₹24,760", "you owe ₹840", "coast", "Active", "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1600&q=85"],
  ["Jaipur stories", "22 - 25 Mar 2025", "Jaipur, India", "3 people", "₹16,200", "settled", "desert", "Settled", "https://images.unsplash.com/photo-1599661046289-e31897846e41?auto=format&fit=crop&w=1600&q=85"],
] as const;

export default function TripDashboard({ space }: { space: "trip" | "local" }) {
  const [supabase] = useState(createClient);
  const [selected, setSelected] = useState<number | null>(null);
  const [user, setUser] = useState<{ id: string; phone?: string | null } | null>(null);
  const [showAuth, setShowAuth] = useState(false);
  const [authPhone, setAuthPhone] = useState("");
  const [authCode, setAuthCode] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [authMessage, setAuthMessage] = useState("");
  const [createdTrips, setCreatedTrips] = useState<string[][]>([]);
  const [remoteTrips, setRemoteTrips] = useState<string[][]>([]);
  const [showNewTrip, setShowNewTrip] = useState(false);
  const [newTrip, setNewTrip] = useState({ name: "", location: "", dates: "", participant: "", participants: ["You"] as string[], image: "", imageFile: null as File | null });
  const [showExpense, setShowExpense] = useState(false);
  const [expenseForm, setExpenseForm] = useState({ description: "", amount: "", paidBy: "You", participants: "You" });
  const [expenses, setExpenses] = useState<Array<{ description: string; amount: number; paidBy: string; participants: string[] }>>([]);
  const isTrip = space === "trip";

  useEffect(() => {
    let active = true;
    supabase.auth.getSession().then(({ data }) => {
      if (active && data.session) setUser({ id: data.session.user.id, phone: data.session.user.phone });
    });
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (active) setUser(session ? { id: session.user.id, phone: session.user.phone } : null);
    });
    return () => { active = false; listener.subscription.unsubscribe(); };
  }, [supabase.auth]);

  useEffect(() => {
    if (!user) return;
    void supabase.from("trips").select("id,name,location,cover_url,created_at").order("created_at", { ascending: false }).then(({ data }) => {
      setRemoteTrips((data ?? []).map((trip) => [trip.name, "", trip.location, "members", "₹0", "new trip", "custom", "Active", trip.cover_url || trips[0][8], trip.id]));
    });
  }, [supabase, user]);

  const sendOtp = async () => {
    setAuthMessage("");
    const { error } = await supabase.auth.signInWithOtp({ phone: authPhone.trim() });
    if (error) setAuthMessage(error.message);
    else { setOtpSent(true); setAuthMessage("Code sent. Check your phone."); }
  };

  const verifyOtp = async () => {
    setAuthMessage("");
    const { error } = await supabase.auth.verifyOtp({ phone: authPhone.trim(), token: authCode.trim(), type: "sms" });
    if (error) setAuthMessage(error.message);
    else { setShowAuth(false); setOtpSent(false); setAuthCode(""); }
  };

  useEffect(() => {
    const clear = (event: MouseEvent) => {
      if (!(event.target as HTMLElement).closest("[data-trip-card]")) setSelected(null);
    };
    document.addEventListener("click", clear);
    return () => document.removeEventListener("click", clear);
  }, []);

  const allTrips = [...trips, ...remoteTrips, ...createdTrips] as readonly (readonly string[])[];
  const selectedTripId = selected === null ? "" : allTrips[selected]?.[9] || "";
  const activeImage = selected === null ? undefined : allTrips[selected]?.[8];
  const addParticipant = () => {
    const name = newTrip.participant.trim();
    if (!name || newTrip.participants.includes(name)) return;
    setNewTrip((current) => ({ ...current, participant: "", participants: [...current.participants, name] }));
  };
  const pickContacts = async () => {
    const picker = (navigator as Navigator & { contacts?: { select: (properties: string[], options: { multiple: boolean }) => Promise<Array<{ name?: string[]; tel?: string[] }>> } }).contacts;
    if (!picker) {
      window.alert("Contact selection is not available in this browser. Add participants by name instead.");
      return;
    }
    try {
      const contacts = await picker.select(["name", "tel"], { multiple: true });
      const names = contacts.flatMap((contact) => {
        const name = contact.name?.[0];
        const phone = contact.tel?.[0];
        return name && phone ? [`${name} · ${phone}`] : name ? [name] : phone ? [phone] : [];
      });
      setNewTrip((current) => ({ ...current, participants: [...current.participants, ...names.filter((name) => !current.participants.includes(name))] }));
    } catch {
      // The user may close the native contact picker without selecting anyone.
    }
  };
  const choosePhoto = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setNewTrip((current) => ({ ...current, image: String(reader.result), imageFile: file }));
    reader.readAsDataURL(file);
  };
  const saveTrip = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    void (async () => {
      let tripId = "";
      if (user) {
        const { data, error } = await supabase.from("trips").insert({ owner_id: user.id, name: newTrip.name, location: newTrip.location }).select("id").single();
        if (error) { setAuthMessage(error.message); return; }
        tripId = data.id;
        if (newTrip.imageFile) {
          const path = `${user.id}/${tripId}-${newTrip.imageFile.name}`;
          const upload = await supabase.storage.from("trip-covers").upload(path, newTrip.imageFile, { upsert: true });
          if (!upload.error) {
            const coverUrl = supabase.storage.from("trip-covers").getPublicUrl(path).data.publicUrl;
            await supabase.from("trips").update({ cover_url: coverUrl }).eq("id", tripId);
          }
        }
        const memberRows = newTrip.participants.map((participant) => ({ trip_id: tripId, user_id: participant === "You" ? user.id : null, invited_phone: participant === "You" ? null : participant, display_name: participant, role: participant === "You" ? "owner" : "member" }));
        await supabase.from("trip_members").insert(memberRows);
      }
      setCreatedTrips((current) => [...current, [newTrip.name, newTrip.dates, newTrip.location, `${newTrip.participants.length} people`, "₹0", "new trip", "custom", "Upcoming", newTrip.image || trips[0][8], tripId]]);
      setNewTrip({ name: "", location: "", dates: "", participant: "", participants: ["You"], image: "", imageFile: null });
      setShowNewTrip(false);
    })();
  };
  const saveExpense = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const amount = Number(expenseForm.amount);
    const participants = expenseForm.participants.split(",").map((item) => item.trim()).filter(Boolean);
    if (!amount || participants.length === 0) return;
    void (async () => {
      if (user && selectedTripId && expenseForm.paidBy === "You") {
        const { data: expense, error } = await supabase.from("expenses").insert({ trip_id: selectedTripId, paid_by: user.id, description: expenseForm.description, amount, split_type: "equal" }).select("id").single();
        if (!error && expense) {
          const members = await supabase.from("trip_members").select("user_id").eq("trip_id", selectedTripId).not("user_id", "is", null);
          const share = amount / Math.max(participants.length, 1);
          await supabase.from("expense_splits").insert((members.data ?? []).map((member) => ({ expense_id: expense.id, user_id: member.user_id, share })));
        }
      }
      setExpenses((current) => [...current, { description: expenseForm.description, amount, paidBy: expenseForm.paidBy, participants }]);
      setExpenseForm({ description: "", amount: "", paidBy: "You", participants: "You" });
      setShowExpense(false);
    })();
  };
  const totalSpent = expenses.reduce((total, expense) => total + expense.amount, 0);
  const owedToYou = expenses.reduce((total, expense) => expense.paidBy === "You" ? total + expense.amount - expense.amount / expense.participants.length : total, 0);
  const youOwe = expenses.reduce((total, expense) => expense.paidBy !== "You" && expense.participants.includes("You") ? total + expense.amount / expense.participants.length : total, 0);

  return <main className={`${styles.page} ${isTrip ? styles.trip : styles.local}`} style={activeImage ? { "--selected-image": `url(${activeImage})` } as React.CSSProperties : undefined}>
    <div className={`${styles.selectedBackdrop} ${selected === null ? "" : styles.selectedBackdropVisible}`} style={activeImage ? { backgroundImage: `linear-gradient(180deg, rgba(12, 15, 16, .42), rgba(12, 15, 16, .84)), url(${activeImage})` } : undefined} />
    <div className={styles.texture} />
    <header className={styles.topbar}><Link className={styles.brand} href="/"><span className={styles.brandMark}>S</span><span>SPLit</span></Link><nav className={styles.nav}><Link className={styles.navActive} href={`/${space}`}>Overview</Link><Link href={`/${space}#trips`}>{isTrip ? "Trips" : "Groups"}</Link><Link href={`/${space}#activity`}>Activity</Link></nav><div className={styles.profile}><button className={styles.iconButton} aria-label="Notifications">◌</button><button className={styles.avatar} onClick={() => setShowAuth(true)} aria-label={user ? "Account" : "Sign in"}>{user ? "A" : "→"}</button></div></header>
    <div className={styles.shell}>
      <section className={styles.intro}><div><span className={styles.eyebrow}>{isTrip ? "Travel ledger" : "Everyday ledger"}</span><h1>Good morning, Abhi</h1><p>{isTrip ? "Keep every shared moment, booking, and rupee from the journey in one clear place." : "Your shared everyday expenses, organized without making life feel like accounting."}</p></div><button className={styles.primaryButton} onClick={() => setShowNewTrip(true)}>+ New {isTrip ? "trip" : "group"}</button></section>
      <section className={styles.summaryGrid} aria-label="Expense summary"><div className={styles.summaryCard}><span>Total balance</span><strong>₹{Math.round(owedToYou - youOwe).toLocaleString("en-IN")}</strong><small className={owedToYou >= youOwe ? styles.positive : styles.negative}>{owedToYou >= youOwe ? "↑ owed to you" : "↓ you owe"}</small></div><div className={styles.summaryCard}><span>You owe</span><strong>₹{Math.round(youOwe).toLocaleString("en-IN")}</strong><small>{expenses.length ? `${expenses.length} recorded expense${expenses.length === 1 ? "" : "s"}` : "Add your first expense"}</small></div><div className={`${styles.summaryCard} ${styles.summaryAccent}`}><span>Shared spending</span><strong>₹{Math.round(totalSpent).toLocaleString("en-IN")}</strong><small>in this session</small></div></section>
      <section className={styles.section} id="trips"><div className={styles.sectionHeading}><div><span className={styles.sectionKicker}>Your spaces</span><h2>{isTrip ? "Trips" : "Shared groups"}</h2></div><button className={styles.textButton} onClick={() => setShowExpense(true)}>+ Add expense</button></div><div className={styles.tripGrid}>{allTrips.map(([name, dates, location, people, total, balance, image, tag, imageUrl], index) => <article className={`${styles.tripCard} ${selected === index ? styles.tripCardSelected : ""}`} data-trip-card="true" key={`${name}-${index}`} onClick={(event) => { event.stopPropagation(); setSelected(selected === index ? null : index); }}><div className={`${styles.tripImage} ${styles[image] || ""}`} style={{ backgroundImage: `linear-gradient(180deg, rgba(12,18,19,.12), rgba(10,15,16,.84)), url(${imageUrl})`, backgroundPosition: "center", backgroundSize: "cover" }}><span className={styles.tripTag}>{tag}</span><button className={styles.cardMenu} aria-label={`More options for ${name}`}>•••</button><div className={styles.imageLabel}><span>{location}</span><h3>{name}</h3></div></div><div className={styles.tripDetails}><div className={styles.tripMeta}><span>{dates}</span><span>{people}</span></div><div className={styles.tripBottom}><strong>{total}</strong><span className={balance === "settled" ? styles.settled : balance.includes("owed") ? styles.positive : styles.negative}>{balance}</span></div></div></article>)}</div></section>
      <section className={styles.lowerGrid} id="activity"><div className={styles.activityCard}><div className={styles.sectionHeading}><div><span className={styles.sectionKicker}>Latest movement</span><h2>Recent activity</h2></div><button className={styles.textButton}>See history <span>→</span></button></div><div className={styles.activityRow}><span className={`${styles.activityIcon} ${styles.orange}`}>R</span><div><strong>Rahul added a dinner expense</strong><small>Goa long weekend · 2 hours ago</small></div><b>₹2,460</b></div><div className={styles.activityRow}><span className={`${styles.activityIcon} ${styles.blue}`}>A</span><div><strong>You settled with Priya</strong><small>Jaipur stories · Yesterday</small></div><b className={styles.positive}>₹1,200</b></div><div className={styles.activityRow}><span className={`${styles.activityIcon} ${styles.green}`}>M</span><div><strong>Manish added hotel booking</strong><small>Himalayan escape · 3 days ago</small></div><b>₹12,800</b></div></div><aside className={styles.inviteCard}><span className={styles.sectionKicker}>Make it easier</span><h2>Travel together.<br /><em>Settle better.</em></h2><p>Invite your travel crew and let SPLit handle the math while you handle the memories.</p><button className={styles.lightButton}>Invite people <span>→</span></button></aside></section>
    </div>
    {showNewTrip && <div className={styles.modalBackdrop} onClick={() => setShowNewTrip(false)}><section className={styles.modal} onClick={(event) => event.stopPropagation()}><div className={styles.modalHeader}><div><span className={styles.sectionKicker}>Start a shared space</span><h2>New {isTrip ? "trip" : "group"}</h2></div><button className={styles.modalClose} onClick={() => setShowNewTrip(false)} aria-label="Close">×</button></div><form onSubmit={saveTrip}><label className={styles.field}>Trip name<input required value={newTrip.name} onChange={(event) => setNewTrip({ ...newTrip, name: event.target.value })} placeholder="e.g. Kerala monsoon" /></label><div className={styles.fieldRow}><label className={styles.field}>Where are you going?<input required value={newTrip.location} onChange={(event) => setNewTrip({ ...newTrip, location: event.target.value })} placeholder="e.g. Kochi, India" /></label><label className={styles.field}>Dates<input required value={newTrip.dates} onChange={(event) => setNewTrip({ ...newTrip, dates: event.target.value })} placeholder="e.g. 04 - 08 Sep 2025" /></label></div><div className={styles.field}><span className={styles.fieldLabel}>Participants</span><div className={styles.participantInput}><input type="text" inputMode="tel" value={newTrip.participant} onChange={(event) => setNewTrip({ ...newTrip, participant: event.target.value })} onKeyDown={(event) => { if (event.key === "Enter") { event.preventDefault(); addParticipant(); } }} placeholder="Name or phone number" /><button type="button" onClick={addParticipant}>Add</button><button type="button" className={styles.contactButton} onClick={pickContacts}>From contacts</button></div><small className={styles.participantHint}>Add a name or number manually, or choose from contacts on supported mobile browsers.</small><div className={styles.chips}>{newTrip.participants.map((person) => <span className={styles.chip} key={person}>{person}{person !== "You" && <button type="button" onClick={() => setNewTrip((current) => ({ ...current, participants: current.participants.filter((item) => item !== person) }))}>×</button>}</span>)}</div></div><label className={`${styles.photoPicker} ${newTrip.image ? styles.photoPicked : ""}`} style={newTrip.image ? { backgroundImage: `linear-gradient(rgba(14,18,18,.2),rgba(14,18,18,.7)),url(${newTrip.image})` } : undefined}><input type="file" accept="image/*" onChange={choosePhoto} /><span>{newTrip.image ? "Photo selected · choose another" : "Add a cover photo"}</span><small>JPG, PNG or WEBP</small></label><div className={styles.modalActions}><button type="button" className={styles.cancelButton} onClick={() => setShowNewTrip(false)}>Cancel</button><button className={styles.primaryButton} type="submit">Create trip <span>→</span></button></div></form></section></div>}
    {showAuth && <div className={styles.modalBackdrop} onClick={() => setShowAuth(false)}><section className={styles.modal} onClick={(event) => event.stopPropagation()}><div className={styles.modalHeader}><div><span className={styles.sectionKicker}>Your account</span><h2>{user ? "Signed in" : "Sign in"}</h2></div><button className={styles.modalClose} onClick={() => setShowAuth(false)} aria-label="Close">×</button></div>{user ? <><p className={styles.authCopy}>You are signed in with {user.phone || "your phone"}. Your trips and expenses can now sync to Supabase.</p><button className={styles.primaryButton} onClick={async () => { await supabase.auth.signOut(); setShowAuth(false); }}>Sign out</button></> : <div className={styles.authForm}><label className={styles.field}>Phone number<input required type="tel" value={authPhone} onChange={(event) => setAuthPhone(event.target.value)} placeholder="+91 98765 43210" /></label>{otpSent && <label className={styles.field}>Verification code<input required inputMode="numeric" value={authCode} onChange={(event) => setAuthCode(event.target.value)} placeholder="123456" /></label>}<p className={styles.authCopy}>Use a number with country code. Supabase will send a one-time verification code.</p>{authMessage && <p className={styles.authMessage}>{authMessage}</p>}<button className={styles.primaryButton} onClick={otpSent ? verifyOtp : sendOtp}>{otpSent ? "Verify code" : "Send code"}</button></div>}</section></div>}
    {showExpense && <div className={styles.modalBackdrop} onClick={() => setShowExpense(false)}><section className={styles.modal} onClick={(event) => event.stopPropagation()}><div className={styles.modalHeader}><div><span className={styles.sectionKicker}>Shared spending</span><h2>Add expense</h2></div><button className={styles.modalClose} onClick={() => setShowExpense(false)} aria-label="Close">×</button></div><form onSubmit={saveExpense}><label className={styles.field}>What was it for?<input required value={expenseForm.description} onChange={(event) => setExpenseForm({ ...expenseForm, description: event.target.value })} placeholder="e.g. Dinner at Fort Kochi" /></label><div className={styles.fieldRow}><label className={styles.field}>Amount<input required type="number" min="1" step="0.01" value={expenseForm.amount} onChange={(event) => setExpenseForm({ ...expenseForm, amount: event.target.value })} placeholder="0.00" /></label><label className={styles.field}>Paid by<input required value={expenseForm.paidBy} onChange={(event) => setExpenseForm({ ...expenseForm, paidBy: event.target.value })} placeholder="You or a participant" /></label></div><label className={styles.field}>Split equally between<input required value={expenseForm.participants} onChange={(event) => setExpenseForm({ ...expenseForm, participants: event.target.value })} placeholder="You, Rahul, Priya" /><small className={styles.participantHint}>Separate participant names with commas.</small></label><div className={styles.modalActions}><button type="button" className={styles.cancelButton} onClick={() => setShowExpense(false)}>Cancel</button><button className={styles.primaryButton} type="submit">Save expense <span>→</span></button></div></form></section></div>}
  </main>;
}
