import { useState, useEffect, useCallback } from "react";

// ─── Helpers ───────────────────────────────────────────────────────────────
const STORE_KEY = "tinydesk_v4";
const genId = () => Math.random().toString(36).slice(2, 10);
const fmtDate = (d) => new Date(d + "T12:00:00").toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", year: "numeric" });
const fmtDateShort = (d) => new Date(d + "T12:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric" });

const load = () => { try { const r = localStorage.getItem(STORE_KEY); return r ? JSON.parse(r) : null; } catch { return null; } };
const save = (d) => { try { localStorage.setItem(STORE_KEY, JSON.stringify(d)); } catch (e) { console.error(e); } };

const defaultState = { guests: [], concerts: [] };

// ─── Icons ─────────────────────────────────────────────────────────────────
const Icon = ({ type, size = 18 }) => {
  const s = { width: size, height: size, display: "inline-block", verticalAlign: "middle", flexShrink: 0 };
  const p = { width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 2, strokeLinecap: "round", strokeLinejoin: "round" };
  switch (type) {
    case "plus": return <svg {...p} style={s}><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>;
    case "users": return <svg {...p} style={s}><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>;
    case "music": return <svg {...p} style={s}><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>;
    case "calendar": return <svg {...p} style={s}><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>;
    case "send": return <svg {...p} style={s}><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>;
    case "check": return <svg {...p} style={s}><polyline points="20 6 9 17 4 12"/></svg>;
    case "x": return <svg {...p} style={s}><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>;
    case "trash": return <svg {...p} style={s}><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>;
    case "edit": return <svg {...p} style={s}><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.12 2.12 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>;
    case "mail": return <svg {...p} style={s}><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>;
    case "copy": return <svg {...p} style={s}><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>;
    case "bell": return <svg {...p} style={s}><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>;
    case "back": return <svg {...p} style={s}><polyline points="15 18 9 12 15 6"/></svg>;
    case "msg": return <svg {...p} style={s}><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>;
    case "phone": return <svg {...p} style={s}><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.88.36 1.74.7 2.57a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.83.34 1.69.57 2.57.7A2 2 0 0 1 22 16.92z"/></svg>;
    default: return null;
  }
};

// ─── Palette ───────────────────────────────────────────────────────────────
const P = {
  bg: "#0e0e10", surface: "#18181c", hover: "#1f1f24",
  border: "rgba(255,255,255,0.07)", accent: "#e85d45",
  accentSoft: "rgba(232,93,69,0.12)", text: "#f0ede8",
  muted: "rgba(240,237,232,0.5)", dim: "rgba(240,237,232,0.3)",
};
const F = {
  display: "'Playfair Display', Georgia, serif",
  body: "'DM Sans', 'Helvetica Neue', sans-serif",
  mono: "'JetBrains Mono', monospace",
};

// ─── Shared Components ─────────────────────────────────────────────────────
function Badge({ children, color = "default" }) {
  const m = {
    default: ["rgba(255,255,255,0.06)", "#ccc", "rgba(255,255,255,0.1)"],
    green: ["rgba(74,222,128,0.12)", "#4ade80", "rgba(74,222,128,0.25)"],
    amber: ["rgba(251,191,36,0.12)", "#fbbf24", "rgba(251,191,36,0.25)"],
    red: ["rgba(248,113,113,0.12)", "#f87171", "rgba(248,113,113,0.25)"],
    blue: ["rgba(96,165,250,0.12)", "#60a5fa", "rgba(96,165,250,0.25)"],
    purple: ["rgba(192,132,252,0.12)", "#c084fc", "rgba(192,132,252,0.25)"],
  };
  const [bg, fg, b] = m[color] || m.default;
  return <span style={{ display: "inline-flex", padding: "2px 8px", fontSize: 10, fontWeight: 700, letterSpacing: "0.05em", textTransform: "uppercase", borderRadius: 99, background: bg, color: fg, border: `1px solid ${b}` }}>{children}</span>;
}

function Btn({ children, onClick, bg, color, border, disabled, href, style: sx, ...rest }) {
  const base = {
    display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 6,
    padding: "9px 14px", borderRadius: 8, border: border || "none",
    background: disabled ? "rgba(255,255,255,0.04)" : (bg || P.accent),
    color: disabled ? P.dim : (color || "#fff"),
    fontFamily: F.body, fontSize: 13, fontWeight: 600,
    cursor: disabled ? "not-allowed" : "pointer",
    transition: "all 0.12s", whiteSpace: "nowrap", textDecoration: "none", ...sx,
  };
  if (href) return <a href={href} style={base} {...rest}>{children}</a>;
  return <button onClick={disabled ? undefined : onClick} style={base} {...rest}>{children}</button>;
}

function Modal({ children, onClose }) {
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.75)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 200, backdropFilter: "blur(6px)", padding: 16, overflow: "auto" }} onClick={onClose}>
      <div style={{ background: P.surface, borderRadius: 16, border: `1px solid ${P.border}`, padding: "22px 20px", width: "100%", maxWidth: 460, maxHeight: "88vh", overflow: "auto", boxShadow: "0 24px 64px rgba(0,0,0,0.5)" }} onClick={(e) => e.stopPropagation()}>
        {children}
      </div>
    </div>
  );
}

function FormModal({ title, fields, onSubmit, onClose, submitLabel }) {
  const [vals, setVals] = useState(() => Object.fromEntries(fields.map((f) => [f.key, f.defaultValue || ""])));
  const submit = () => {
    if (fields.filter((f) => f.required).some((f) => !vals[f.key]?.trim())) return;
    onSubmit(vals);
  };
  return (
    <Modal onClose={onClose}>
      <h3 style={{ fontFamily: F.display, fontSize: 19, fontWeight: 700, margin: "0 0 16px" }}>{title}</h3>
      {fields.map((f, i) => (
        <div key={f.key} style={{ marginBottom: 12 }}>
          <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: P.muted, marginBottom: 5, textTransform: "uppercase", letterSpacing: "0.05em" }}>
            {f.label}{f.required && <span style={{ color: P.accent }}> *</span>}
          </label>
          <input type={f.type || "text"} value={vals[f.key]}
            onChange={(e) => setVals((v) => ({ ...v, [f.key]: e.target.value }))}
            onKeyDown={(e) => e.key === "Enter" && submit()}
            autoFocus={i === 0}
            style={{ width: "100%", padding: "10px 12px", borderRadius: 8, border: `1px solid ${P.border}`, background: "rgba(255,255,255,0.04)", color: P.text, fontFamily: F.body, fontSize: 14, outline: "none" }}
            onFocus={(e) => (e.target.style.borderColor = P.accent)}
            onBlur={(e) => (e.target.style.borderColor = P.border)}
          />
        </div>
      ))}
      <div style={{ display: "flex", gap: 8, marginTop: 16 }}>
        <Btn onClick={submit} style={{ flex: 1 }}>{submitLabel}</Btn>
        <Btn onClick={onClose} bg="transparent" color={P.muted} border={`1px solid ${P.border}`}>Cancel</Btn>
      </div>
    </Modal>
  );
}

// ─── Reminder Center ───────────────────────────────────────────────────────
function ReminderCenter({ concert, guestById, onClose }) {
  const [copied, setCopied] = useState({});

  const mkMsg = (name, role, timing) => {
    if (role === "confirmed" && timing === "day-before") return `Hey ${name}! 🎵 Reminder — you're confirmed for the ${concert.artist} Tiny Desk concert tomorrow (${fmtDate(concert.date)}). Details to follow in the morning!`;
    if (role === "confirmed" && timing === "morning") return `Good morning ${name}! 🎶 Today's the day — ${concert.artist} at the Tiny Desk! Please arrive by the designated time. See you there!`;
    if (role === "alternate" && timing === "day-before") return `Hey ${name}! Heads-up — you're the alternate for tomorrow's ${concert.artist} Tiny Desk concert (${fmtDate(concert.date)}). I'll reach out ASAP if a spot opens up. Keep your schedule flexible!`;
    if (role === "alternate" && timing === "morning") return `Morning ${name}! You're the alternate for today's ${concert.artist} Tiny Desk. I'll text you right away if a spot opens. Fingers crossed! 🤞`;
    return "";
  };

  const doCopy = (key, text) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied((c) => ({ ...c, [key]: true }));
      setTimeout(() => setCopied((c) => ({ ...c, [key]: false })), 1800);
    });
  };

  const items = [];
  concert.slotIds.forEach((sid, i) => {
    const g = guestById(sid);
    if (!g) return;
    items.push({ key: `s${i}d`, name: g.name, role: "Confirmed", roleColor: "green", timing: "Day Before", text: mkMsg(g.name, "confirmed", "day-before"), contact: g.phone || g.email || "" });
    items.push({ key: `s${i}m`, name: g.name, role: "Confirmed", roleColor: "green", timing: "Morning Of", text: mkMsg(g.name, "confirmed", "morning"), contact: g.phone || g.email || "" });
  });
  if (concert.alternateId) {
    const g = guestById(concert.alternateId);
    if (g) {
      items.push({ key: "ad", name: g.name, role: "Alternate", roleColor: "amber", timing: "Day Before", text: mkMsg(g.name, "alternate", "day-before"), contact: g.phone || g.email || "" });
      items.push({ key: "am", name: g.name, role: "Alternate", roleColor: "amber", timing: "Morning Of", text: mkMsg(g.name, "alternate", "morning"), contact: g.phone || g.email || "" });
    }
  }

  return (
    <Modal onClose={onClose}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
        <h3 style={{ fontFamily: F.display, fontSize: 17, fontWeight: 700, margin: 0, display: "flex", alignItems: "center", gap: 7 }}>
          <Icon type="bell" size={16} /> Reminders
        </h3>
        <button onClick={onClose} style={{ background: "none", border: "none", color: P.dim, cursor: "pointer" }}><Icon type="x" size={16} /></button>
      </div>
      <p style={{ fontSize: 12, color: P.muted, margin: "0 0 14px" }}>
        Tap Copy or Text/Email to send. Different language for confirmed vs. alternate.
      </p>
      {items.length === 0 ? (
        <div style={{ textAlign: "center", padding: 20, color: P.muted, fontSize: 13 }}>Assign guests to slots first.</div>
      ) : items.map((it) => (
        <div key={it.key} style={{ marginBottom: 10, background: "rgba(255,255,255,0.025)", borderRadius: 10, border: `1px solid ${P.border}`, padding: "11px 13px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 5, flexWrap: "wrap", gap: 4 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
              <span style={{ fontSize: 13, fontWeight: 600 }}>{it.name}</span>
              <Badge color={it.roleColor}>{it.role}</Badge>
              <Badge>{it.timing}</Badge>
            </div>
          </div>
          <div style={{ fontSize: 12, color: P.muted, lineHeight: 1.5, background: "rgba(255,255,255,0.02)", borderRadius: 7, padding: "7px 9px", marginBottom: 7 }}>
            {it.text}
          </div>
          <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
            <Btn onClick={() => doCopy(it.key, it.text)} bg={copied[it.key] ? "rgba(74,222,128,0.15)" : "rgba(255,255,255,0.06)"} color={copied[it.key] ? "#4ade80" : P.muted} style={{ padding: "4px 9px", fontSize: 11 }}>
              <Icon type={copied[it.key] ? "check" : "copy"} size={11} /> {copied[it.key] ? "Copied!" : "Copy"}
            </Btn>
            {it.contact && it.contact.includes("@") ? (
              <Btn href={`mailto:${it.contact}?subject=Tiny Desk Reminder: ${concert.artist}&body=${encodeURIComponent(it.text)}`} bg="transparent" color={P.muted} border={`1px solid ${P.border}`} style={{ padding: "4px 9px", fontSize: 11 }}>
                <Icon type="mail" size={11} /> Email
              </Btn>
            ) : it.contact ? (
              <Btn href={`sms:${it.contact}&body=${encodeURIComponent(it.text)}`} bg="transparent" color={P.muted} border={`1px solid ${P.border}`} style={{ padding: "4px 9px", fontSize: 11 }}>
                <Icon type="msg" size={11} /> Text
              </Btn>
            ) : null}
          </div>
        </div>
      ))}
    </Modal>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
//  MAIN APP
// ═══════════════════════════════════════════════════════════════════════════
export default function App() {
  const [state, setState] = useState(() => load() || defaultState);
  const [view, setView] = useState("concerts");
  const [selConcert, setSelConcert] = useState(null);
  const [modal, setModal] = useState(null);
  const [editTarget, setEditTarget] = useState(null);
  const [blastTarget, setBlastTarget] = useState(null);
  const [reminderTarget, setReminderTarget] = useState(null);
  const [toast, setToast] = useState(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => { save(state); }, [state]);

  const flash = (m) => { setToast(m); setTimeout(() => setToast(null), 2500); };
  const gById = (id) => state.guests.find((g) => g.id === id);

  // ── Eligibility ─────────────────────────────
  const getEligible = useCallback(() => {
    if (state.guests.length === 0) return [];
    const min = Math.min(...state.guests.map((g) => g.timesAttended));
    return state.guests.filter((g) => g.timesAttended <= min);
  }, [state.guests]);

  const getQueue = useCallback(() => {
    return [...state.guests].sort((a, b) => {
      if (a.timesAttended !== b.timesAttended) return a.timesAttended - b.timesAttended;
      if (!a.lastAttended && b.lastAttended) return -1;
      if (a.lastAttended && !b.lastAttended) return 1;
      if (a.lastAttended && b.lastAttended) return new Date(a.lastAttended) - new Date(b.lastAttended);
      return new Date(a.addedDate) - new Date(b.addedDate);
    });
  }, [state.guests]);

  // ── Guest CRUD ──────────────────────────────
  const addGuest = (g) => {
    setState((s) => ({ ...s, guests: [...s.guests, { ...g, id: genId(), timesAttended: 0, lastAttended: null, addedDate: new Date().toISOString() }] }));
    setModal(null); flash("Guest added!");
  };
  const updateGuest = (id, u) => {
    setState((s) => ({ ...s, guests: s.guests.map((g) => g.id === id ? { ...g, ...u } : g) }));
    setModal(null); setEditTarget(null); flash("Guest updated!");
  };
  const removeGuest = (id) => {
    setState((s) => ({
      ...s, guests: s.guests.filter((g) => g.id !== id),
      concerts: s.concerts.map((c) => ({
        ...c, slotIds: c.slotIds.filter((x) => x !== id),
        alternateId: c.alternateId === id ? null : c.alternateId,
        responses: (c.responses || []).filter((r) => r.guestId !== id),
      })),
    }));
    flash("Guest removed");
  };

  // ── Concert CRUD ────────────────────────────
  const addConcert = (c) => {
    setState((s) => ({ ...s, concerts: [...s.concerts, { ...c, id: genId(), status: "upcoming", blasted: false, slotIds: [], alternateId: null, responses: [] }] }));
    setModal(null); flash("Concert added!");
  };
  const removeConcert = (id) => {
    setState((s) => ({ ...s, concerts: s.concerts.filter((c) => c.id !== id) }));
    if (selConcert === id) { setSelConcert(null); setView("concerts"); }
    flash("Concert removed");
  };

  // ── RSVP ────────────────────────────────────
  const rsvpGuest = (concertId, guestId) => {
    setState((s) => ({
      ...s,
      concerts: s.concerts.map((c) => {
        if (c.id !== concertId) return c;
        if ((c.responses || []).find((r) => r.guestId === guestId)) return c;
        const responses = [...(c.responses || []), { guestId, timestamp: new Date().toISOString() }];
        const slotIds = [...c.slotIds];
        let alternateId = c.alternateId;
        if (slotIds.length < 2) slotIds.push(guestId);
        else if (!alternateId) alternateId = guestId;
        return { ...c, responses, slotIds, alternateId };
      }),
    }));
    flash("RSVP recorded!");
  };

  const removeRsvp = (concertId, guestId) => {
    setState((s) => ({
      ...s,
      concerts: s.concerts.map((c) => {
        if (c.id !== concertId) return c;
        const responses = (c.responses || []).filter((r) => r.guestId !== guestId);
        let slotIds = c.slotIds.filter((x) => x !== guestId);
        let alternateId = c.alternateId === guestId ? null : c.alternateId;
        if (slotIds.length < 2 && alternateId) { slotIds.push(alternateId); alternateId = null; }
        if (!alternateId && slotIds.length >= 2) {
          const next = responses.find((r) => !slotIds.includes(r.guestId));
          if (next) alternateId = next.guestId;
        }
        return { ...c, responses, slotIds, alternateId };
      }),
    }));
    flash("RSVP removed");
  };

  // ── Complete ────────────────────────────────
  const completeConcert = (id) => {
    const c = state.concerts.find((x) => x.id === id);
    if (!c) return;
    const now = new Date().toISOString();
    setState((s) => ({
      ...s,
      guests: s.guests.map((g) => c.slotIds.includes(g.id) ? { ...g, timesAttended: g.timesAttended + 1, lastAttended: now } : g),
      concerts: s.concerts.map((x) => x.id === id ? { ...x, status: "completed", completedDate: now } : x),
    }));
    flash("Concert completed! Attendance updated.");
    setSelConcert(null); setView("concerts");
  };

  // ── Blast (eligible only) ───────────────────
  const getBlastMsg = (c) => `🎵 Tiny Desk Alert!\n\n${c.artist} is performing at NPR's Tiny Desk on ${fmtDate(c.date)}!\n\nI have 2 guest spots — first come, first served. Text me back to claim yours!\n\nFirst 2 replies get confirmed, #3 is the alternate.`;

  const getSmsUrl = (c) => {
    const eligible = getEligible();
    const phones = eligible.filter((g) => g.phone).map((g) => g.phone).join(",");
    return `sms:${phones}?body=${encodeURIComponent(getBlastMsg(c))}`;
  };
  const getEmailUrl = (c) => {
    const eligible = getEligible();
    const emails = eligible.filter((g) => g.email).map((g) => g.email).join(",");
    return `mailto:${emails}?subject=${encodeURIComponent(`Tiny Desk: ${c.artist} — ${fmtDate(c.date)}`)}&body=${encodeURIComponent(getBlastMsg(c))}`;
  };

  // ── Derived ─────────────────────────────────
  const upcoming = state.concerts.filter((c) => c.status === "upcoming").sort((a, b) => new Date(a.date) - new Date(b.date));
  const completed = state.concerts.filter((c) => c.status === "completed").sort((a, b) => new Date(b.completedDate) - new Date(a.completedDate));
  const detail = state.concerts.find((c) => c.id === selConcert);
  const eligible = getEligible();
  const eligibleIds = eligible.map((g) => g.id);

  return (
    <>
      <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700;800&family=DM+Sans:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet" />
      <div style={{ minHeight: "100vh", minHeight: "100dvh", background: P.bg, color: P.text, fontFamily: F.body, fontSize: 14, lineHeight: 1.5 }}>
        <div style={{ position: "fixed", inset: 0, pointerEvents: "none", background: `radial-gradient(ellipse at 20% 0%, rgba(232,93,69,0.04) 0%, transparent 50%), radial-gradient(ellipse at 80% 100%, rgba(96,165,250,0.03) 0%, transparent 50%)` }} />

        <div style={{ position: "relative", zIndex: 1, maxWidth: 860, margin: "0 auto", padding: "0 16px", paddingBottom: 40 }}>
          {/* ── HEADER ── */}
          <header style={{ padding: "max(env(safe-area-inset-top, 12px), 24px) 0 20px", borderBottom: `1px solid ${P.border}`, marginBottom: 20 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
              <div style={{ width: 30, height: 30, borderRadius: 7, background: `linear-gradient(135deg, ${P.accent}, #c04830)`, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 2px 10px rgba(232,93,69,0.3)", flexShrink: 0 }}>
                <Icon type="music" size={15} />
              </div>
              <h1 style={{ fontFamily: F.display, fontSize: "clamp(18px, 5vw, 26px)", fontWeight: 700, letterSpacing: "-0.02em", margin: 0 }}>
                Tiny Desk <span style={{ color: P.accent }}>Guest Manager</span>
              </h1>
            </div>

            <nav style={{ display: "flex", gap: 4, marginTop: 16 }}>
              {[
                { k: "concerts", label: "Concerts", icon: "calendar", n: upcoming.length },
                { k: "guests", label: "Guests", icon: "users", n: state.guests.length },
              ].map((t) => (
                <button key={t.k} onClick={() => { setView(t.k); setSelConcert(null); }} style={{
                  padding: "7px 14px", borderRadius: 8, border: "none",
                  background: (view === t.k || (view === "detail" && t.k === "concerts")) ? "rgba(255,255,255,0.08)" : "transparent",
                  color: (view === t.k || (view === "detail" && t.k === "concerts")) ? P.text : P.muted,
                  fontFamily: F.body, fontSize: 13, fontWeight: 600, cursor: "pointer",
                  display: "flex", alignItems: "center", gap: 6,
                }}>
                  <Icon type={t.icon} size={14} /> {t.label}
                  {t.n > 0 && <span style={{ background: P.accentSoft, color: P.accent, fontSize: 10, fontWeight: 700, padding: "1px 6px", borderRadius: 99 }}>{t.n}</span>}
                </button>
              ))}
            </nav>
          </header>

          {/* ═══ CONCERTS LIST ═══ */}
          {view === "concerts" && (
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14, gap: 8, flexWrap: "wrap" }}>
                <h2 style={{ fontFamily: F.display, fontSize: 19, fontWeight: 700, margin: 0 }}>Upcoming</h2>
                <Btn onClick={() => setModal("addConcert")}><Icon type="plus" size={14} /> Add Concert</Btn>
              </div>

              {upcoming.length === 0 ? (
                <div style={{ textAlign: "center", padding: 44, opacity: 0.4 }}>
                  <Icon type="calendar" size={34} />
                  <div style={{ marginTop: 8, fontWeight: 600 }}>No upcoming concerts</div>
                  <div style={{ fontSize: 12, marginTop: 4 }}>Add one to get started</div>
                </div>
              ) : upcoming.map((c) => (
                <div key={c.id} onClick={() => { setSelConcert(c.id); setView("detail"); }} style={{
                  background: P.surface, border: `1px solid ${P.border}`, borderRadius: 12,
                  padding: "14px 16px", marginBottom: 8, cursor: "pointer", transition: "background .15s",
                }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = P.hover)}
                  onMouseLeave={(e) => (e.currentTarget.style.background = P.surface)}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 6, flexWrap: "wrap" }}>
                    <div>
                      <div style={{ fontFamily: F.display, fontSize: 17, fontWeight: 700, marginBottom: 2 }}>{c.artist}</div>
                      <div style={{ color: P.muted, fontSize: 12, display: "flex", alignItems: "center", gap: 4 }}>
                        <Icon type="calendar" size={11} /> {fmtDate(c.date)}
                      </div>
                    </div>
                    <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
                      {c.blasted && <Badge color="blue">Blasted</Badge>}
                      <Badge color={c.slotIds.length >= 2 ? "green" : "amber"}>{c.slotIds.length}/2</Badge>
                      {c.alternateId && <Badge color="purple">+alt</Badge>}
                    </div>
                  </div>
                  {(c.slotIds.length > 0 || c.alternateId) && (
                    <div style={{ marginTop: 8, display: "flex", gap: 5, flexWrap: "wrap" }}>
                      {c.slotIds.map((sid) => { const g = gById(sid); return g ? <span key={sid} style={{ fontSize: 11, color: P.muted, background: "rgba(255,255,255,0.04)", padding: "2px 7px", borderRadius: 5 }}><span style={{ color: "#4ade80" }}>● </span>{g.name}</span> : null; })}
                      {c.alternateId && (() => { const g = gById(c.alternateId); return g ? <span style={{ fontSize: 11, color: P.muted, background: "rgba(255,255,255,0.04)", padding: "2px 7px", borderRadius: 5 }}><span style={{ color: "#fbbf24" }}>● </span>{g.name} (alt)</span> : null; })()}
                    </div>
                  )}
                </div>
              ))}

              {completed.length > 0 && (
                <div style={{ marginTop: 32 }}>
                  <h2 style={{ fontFamily: F.display, fontSize: 16, fontWeight: 700, margin: "0 0 10px", opacity: 0.4 }}>Past</h2>
                  {completed.map((c) => (
                    <div key={c.id} style={{ background: P.surface, border: `1px solid ${P.border}`, borderRadius: 10, padding: "10px 14px", marginBottom: 5, opacity: 0.4, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 6 }}>
                      <span><span style={{ fontFamily: F.display, fontWeight: 600 }}>{c.artist}</span> <span style={{ color: P.muted, fontSize: 11, marginLeft: 6 }}>{fmtDate(c.date)}</span></span>
                      <div style={{ display: "flex", gap: 5, alignItems: "center" }}>
                        {c.slotIds.map((sid) => { const g = gById(sid); return g ? <span key={sid} style={{ fontSize: 11, color: P.muted }}>{g.name}</span> : null; })}
                        <button onClick={(e) => { e.stopPropagation(); removeConcert(c.id); }} style={{ background: "none", border: "none", color: P.dim, cursor: "pointer" }}><Icon type="trash" size={12} /></button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ═══ CONCERT DETAIL ═══ */}
          {view === "detail" && detail && (
            <div>
              <button onClick={() => { setView("concerts"); setSelConcert(null); }} style={{ background: "none", border: "none", color: P.muted, fontFamily: F.body, fontSize: 13, cursor: "pointer", padding: 0, marginBottom: 14, display: "flex", alignItems: "center", gap: 4 }}>
                <Icon type="back" size={13} /> Back
              </button>

              <h2 style={{ fontFamily: F.display, fontSize: "clamp(20px, 5vw, 26px)", fontWeight: 800, margin: "0 0 3px" }}>{detail.artist}</h2>
              <div style={{ color: P.muted, fontSize: 13, display: "flex", alignItems: "center", gap: 5, marginBottom: 18 }}>
                <Icon type="calendar" size={13} /> {fmtDate(detail.date)}
              </div>

              {/* Actions */}
              {detail.status === "upcoming" && (
                <div style={{ display: "flex", gap: 6, marginBottom: 22, flexWrap: "wrap" }}>
                  <Btn onClick={() => { setBlastTarget(detail); setModal("blast"); }} bg={P.surface} color={P.text} border={`1px solid ${P.border}`}>
                    <Icon type="send" size={13} /> Blast
                  </Btn>
                  <Btn onClick={() => { setReminderTarget(detail); setModal("reminders"); }} bg="rgba(251,191,36,0.08)" color="#fbbf24" border="1px solid rgba(251,191,36,0.2)">
                    <Icon type="bell" size={13} /> Reminders
                  </Btn>
                  <Btn onClick={() => { if (confirm("Mark completed? Attendance updates.")) completeConcert(detail.id); }} bg="rgba(74,222,128,0.12)" color="#4ade80">
                    <Icon type="check" size={13} /> Complete
                  </Btn>
                  <Btn onClick={() => { if (confirm("Delete?")) removeConcert(detail.id); }} bg="rgba(248,113,113,0.08)" color="#f87171" border="1px solid rgba(248,113,113,0.2)">
                    <Icon type="trash" size={13} />
                  </Btn>
                </div>
              )}

              {/* Slots */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 8, marginBottom: 22 }}>
                {[0, 1].map((i) => {
                  const sid = detail.slotIds[i]; const g = sid ? gById(sid) : null;
                  return (
                    <div key={i} style={{ background: g ? "rgba(74,222,128,0.05)" : P.surface, border: `1px solid ${g ? "rgba(74,222,128,0.2)" : P.border}`, borderRadius: 11, padding: 13 }}>
                      <div style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: P.muted, marginBottom: 5 }}>Slot {i + 1}</div>
                      {g ? (
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                          <div>
                            <div style={{ fontWeight: 600, fontSize: 14 }}>{g.name}</div>
                            <div style={{ fontSize: 11, color: P.muted }}>{g.phone || g.email || ""}</div>
                          </div>
                          {detail.status === "upcoming" && <button onClick={() => removeRsvp(detail.id, sid)} style={{ background: "none", border: "none", color: P.dim, cursor: "pointer" }}><Icon type="x" size={14} /></button>}
                        </div>
                      ) : <div style={{ color: P.dim, fontSize: 12, fontStyle: "italic" }}>Open</div>}
                    </div>
                  );
                })}
                <div style={{ background: detail.alternateId ? "rgba(251,191,36,0.05)" : P.surface, border: `1px solid ${detail.alternateId ? "rgba(251,191,36,0.2)" : P.border}`, borderRadius: 11, padding: 13 }}>
                  <div style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: P.muted, marginBottom: 5 }}>Alternate</div>
                  {detail.alternateId ? (() => {
                    const g = gById(detail.alternateId);
                    return g ? (
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <div>
                          <div style={{ fontWeight: 600, fontSize: 14 }}>{g.name}</div>
                          <div style={{ fontSize: 11, color: P.muted }}>{g.phone || g.email || ""}</div>
                        </div>
                        {detail.status === "upcoming" && <button onClick={() => removeRsvp(detail.id, detail.alternateId)} style={{ background: "none", border: "none", color: P.dim, cursor: "pointer" }}><Icon type="x" size={14} /></button>}
                      </div>
                    ) : null;
                  })() : <div style={{ color: P.dim, fontSize: 12, fontStyle: "italic" }}>Open</div>}
                </div>
              </div>

              {/* Record RSVP */}
              {detail.status === "upcoming" && (() => {
                const respondedIds = (detail.responses || []).map((r) => r.guestId);
                const avail = state.guests.filter((g) => !respondedIds.includes(g.id));
                if (avail.length === 0) return null;
                return (
                  <div style={{ marginBottom: 22 }}>
                    <h3 style={{ fontFamily: F.display, fontSize: 15, fontWeight: 700, margin: "0 0 4px" }}>Record RSVP</h3>
                    <p style={{ fontSize: 11, color: P.dim, margin: "0 0 10px" }}>When someone texts you back, tap RSVP next to their name (in order received).</p>
                    <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                      {avail.map((g) => {
                        const isElig = eligibleIds.includes(g.id);
                        return (
                          <div key={g.id} style={{
                            display: "flex", justifyContent: "space-between", alignItems: "center",
                            background: P.surface, border: `1px solid ${P.border}`, borderRadius: 9,
                            padding: "8px 13px", opacity: isElig ? 1 : 0.35,
                          }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                              <span style={{ fontWeight: 500, fontSize: 13 }}>{g.name}</span>
                              {!isElig && <Badge color="red">Must wait</Badge>}
                              {isElig && g.timesAttended === 0 && <Badge color="green">New</Badge>}
                            </div>
                            <Btn onClick={() => rsvpGuest(detail.id, g.id)} disabled={!isElig} style={{ padding: "4px 10px", fontSize: 11 }}>RSVP</Btn>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })()}

              {/* Response log */}
              {(detail.responses || []).length > 0 && (
                <div>
                  <h3 style={{ fontFamily: F.display, fontSize: 14, fontWeight: 700, margin: "0 0 8px", opacity: 0.5 }}>Response Log</h3>
                  {detail.responses.map((r, i) => {
                    const g = gById(r.guestId);
                    return (
                      <div key={r.guestId} style={{ display: "flex", alignItems: "center", gap: 7, fontSize: 12, color: P.muted, padding: "4px 0" }}>
                        <span style={{ fontFamily: F.mono, fontSize: 10, color: P.dim }}>#{i + 1}</span>
                        <span style={{ color: P.text, fontWeight: 500 }}>{g?.name || "?"}</span>
                        <span style={{ fontSize: 10 }}>{new Date(r.timestamp).toLocaleString()}</span>
                        {detail.slotIds.includes(r.guestId) && <Badge color="green">Confirmed</Badge>}
                        {detail.alternateId === r.guestId && <Badge color="amber">Alternate</Badge>}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* ═══ GUESTS ═══ */}
          {view === "guests" && (
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14, gap: 8, flexWrap: "wrap" }}>
                <h2 style={{ fontFamily: F.display, fontSize: 19, fontWeight: 700, margin: 0 }}>Guest List</h2>
                <Btn onClick={() => setModal("addGuest")}><Icon type="plus" size={14} /> Add Guest</Btn>
              </div>

              {state.guests.length > 0 && (
                <div style={{ background: P.surface, border: `1px solid ${P.border}`, borderRadius: 9, padding: "9px 13px", marginBottom: 12, fontSize: 11, color: P.muted, display: "flex", gap: 12, flexWrap: "wrap" }}>
                  <span><strong style={{ color: P.text }}>Queue:</strong> Least-attended first</span>
                  <span><span style={{ color: "#4ade80" }}>●</span> Eligible</span>
                  <span><span style={{ color: "#f87171" }}>●</span> Must wait</span>
                </div>
              )}

              {state.guests.length === 0 ? (
                <div style={{ textAlign: "center", padding: 44, opacity: 0.4 }}>
                  <Icon type="users" size={34} />
                  <div style={{ marginTop: 8, fontWeight: 600 }}>No guests yet</div>
                  <div style={{ fontSize: 12, marginTop: 4 }}>Add people to your invite list</div>
                </div>
              ) : getQueue().map((g, idx) => {
                const elig = eligibleIds.includes(g.id);
                return (
                  <div key={g.id} style={{
                    display: "flex", justifyContent: "space-between", alignItems: "center",
                    background: P.surface, border: `1px solid ${P.border}`, borderRadius: 10,
                    padding: "11px 14px", marginBottom: 5, gap: 8, flexWrap: "wrap",
                  }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
                      <span style={{ fontFamily: F.mono, fontSize: 11, color: P.dim, minWidth: 20, textAlign: "right" }}>#{idx + 1}</span>
                      <div style={{ width: 7, height: 7, borderRadius: 99, background: elig ? "#4ade80" : "#f87171", flexShrink: 0 }} />
                      <div>
                        <div style={{ fontWeight: 600, fontSize: 14 }}>{g.name}</div>
                        <div style={{ fontSize: 11, color: P.muted }}>{[g.email, g.phone].filter(Boolean).join(" · ") || "No contact"}</div>
                      </div>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <div style={{ textAlign: "right" }}>
                        <div style={{ fontSize: 11, color: P.muted }}>Attended: <strong style={{ color: P.text }}>{g.timesAttended}</strong></div>
                        {g.lastAttended && <div style={{ fontSize: 10, color: P.dim }}>Last: {fmtDateShort(g.lastAttended.slice(0, 10))}</div>}
                      </div>
                      <button onClick={() => { setEditTarget(g); setModal("editGuest"); }} style={{ background: "none", border: "none", color: P.dim, cursor: "pointer", padding: 2 }}><Icon type="edit" size={13} /></button>
                      <button onClick={() => { if (confirm(`Remove ${g.name}?`)) removeGuest(g.id); }} style={{ background: "none", border: "none", color: P.dim, cursor: "pointer", padding: 2 }}><Icon type="trash" size={13} /></button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* ═══ MODALS ═══ */}
        {modal === "addGuest" && <FormModal title="Add Guest" fields={[
          { key: "name", label: "Name", required: true },
          { key: "email", label: "Email", type: "email" },
          { key: "phone", label: "Phone" },
        ]} onSubmit={addGuest} onClose={() => setModal(null)} submitLabel="Add Guest" />}

        {modal === "editGuest" && editTarget && <FormModal title="Edit Guest" fields={[
          { key: "name", label: "Name", required: true, defaultValue: editTarget.name },
          { key: "email", label: "Email", type: "email", defaultValue: editTarget.email },
          { key: "phone", label: "Phone", defaultValue: editTarget.phone },
        ]} onSubmit={(d) => updateGuest(editTarget.id, d)} onClose={() => { setModal(null); setEditTarget(null); }} submitLabel="Save" />}

        {modal === "addConcert" && <FormModal title="Add Concert" fields={[
          { key: "artist", label: "Artist / Band", required: true },
          { key: "date", label: "Date", type: "date", required: true },
          { key: "notes", label: "Notes" },
        ]} onSubmit={addConcert} onClose={() => setModal(null)} submitLabel="Add Concert" />}

        {modal === "blast" && blastTarget && (
          <Modal onClose={() => { setModal(null); setBlastTarget(null); }}>
            <h3 style={{ fontFamily: F.display, fontSize: 17, fontWeight: 700, margin: "0 0 4px" }}>Blast to Eligible</h3>
            <p style={{ fontSize: 12, color: P.muted, margin: "0 0 3px" }}>
              Sending to {eligible.length} eligible guest{eligible.length !== 1 ? "s" : ""} only.
            </p>
            <div style={{ fontSize: 11, color: P.dim, margin: "0 0 12px" }}>
              {eligible.map((g) => g.name).join(", ")}
            </div>
            <div style={{ background: "rgba(255,255,255,0.03)", borderRadius: 9, border: `1px solid ${P.border}`, padding: 12, fontFamily: F.mono, fontSize: 12, lineHeight: 1.6, whiteSpace: "pre-wrap", color: P.muted, marginBottom: 12, maxHeight: 160, overflow: "auto" }}>
              {getBlastMsg(blastTarget)}
            </div>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              <Btn onClick={() => {
                navigator.clipboard.writeText(getBlastMsg(blastTarget));
                setCopied(true); setTimeout(() => setCopied(false), 1800);
                setState((s) => ({ ...s, concerts: s.concerts.map((c) => c.id === blastTarget.id ? { ...c, blasted: true } : c) }));
              }} style={{ flex: 1 }}>
                <Icon type={copied ? "check" : "copy"} size={13} /> {copied ? "Copied!" : "Copy"}
              </Btn>
              <Btn href={getSmsUrl(blastTarget)} onClick={() => setState((s) => ({ ...s, concerts: s.concerts.map((c) => c.id === blastTarget.id ? { ...c, blasted: true } : c) }))} bg={P.hover} color={P.text} border={`1px solid ${P.border}`} style={{ flex: 1 }}>
                <Icon type="msg" size={13} /> Text Blast
              </Btn>
              <Btn href={getEmailUrl(blastTarget)} onClick={() => setState((s) => ({ ...s, concerts: s.concerts.map((c) => c.id === blastTarget.id ? { ...c, blasted: true } : c) }))} bg={P.hover} color={P.text} border={`1px solid ${P.border}`} style={{ flex: 1 }}>
                <Icon type="mail" size={13} /> Email
              </Btn>
            </div>
            <button onClick={() => { setModal(null); setBlastTarget(null); }} style={{ width: "100%", marginTop: 8, padding: 6, borderRadius: 8, border: "none", background: "transparent", color: P.muted, fontFamily: F.body, fontSize: 12, cursor: "pointer" }}>Close</button>
          </Modal>
        )}

        {modal === "reminders" && reminderTarget && (
          <ReminderCenter concert={reminderTarget} guestById={gById} onClose={() => { setModal(null); setReminderTarget(null); }} />
        )}

        {/* Toast */}
        {toast && (
          <div style={{ position: "fixed", bottom: 20, left: "50%", transform: "translateX(-50%)", background: P.surface, border: `1px solid ${P.border}`, borderRadius: 9, padding: "9px 18px", fontFamily: F.body, fontSize: 13, fontWeight: 500, color: P.text, boxShadow: "0 8px 32px rgba(0,0,0,0.4)", zIndex: 300, animation: "fadeUp .2s ease" }}>
            {toast}
          </div>
        )}

        <style>{`
          @keyframes fadeUp { from { opacity:0; transform:translateX(-50%) translateY(8px); } to { opacity:1; transform:translateX(-50%) translateY(0); } }
          * { box-sizing: border-box; -webkit-tap-highlight-color: transparent; }
          body { margin: 0; }
          ::-webkit-scrollbar { width: 5px; }
          ::-webkit-scrollbar-track { background: transparent; }
          ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.08); border-radius: 3px; }
          @media (max-width: 500px) {
            header nav { flex-wrap: wrap; }
          }
        `}</style>
      </div>
    </>
  );
}
