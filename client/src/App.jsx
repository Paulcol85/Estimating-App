import { useState, useCallback } from "react";

// ─── CONSTANTS ────────────────────────────────────────────────────────────────

const PROJECT_TYPES = [
  "Bathroom Renovation",
  "Kitchen Renovation",
  "Main Floor Renovation",
  "Basement Suite Addition",
  "Full Home Renovation",
  "Addition",
  "Deck & Outdoor",
  "New Build",
  "Exterior Renovation",
  "Other",
];

const HOME_AGES = [
  "2000+ (newer)",
  "1980–2000",
  "1960–1980",
  "Pre-1960",
  "Unknown",
];

const MARKUP_OPTIONS = [
  "25% (small job <$50K)",
  "20% (standard)",
  "18% (large $400K+)",
];

const ROOM_PRESETS = [
  "Ensuite", "Main Bathroom", "Powder Room",
  "Kitchen", "Dining Room", "Living Room",
  "Primary Bedroom", "Bedroom", "Hallway",
  "Basement", "Laundry Room", "Garage",
  "Exterior / Front", "Exterior / Rear", "Deck",
  "Other",
];

const ROOM_FLAGS = [
  "Full demo", "Partial demo",
  "New shower", "New tub", "Tub → shower conversion",
  "Curbless / linear drain", "Tile shower",
  "New vanity (custom)", "New vanity (stock)",
  "In-floor heat", "Schluter system",
  "New cabinets", "New countertop", "Island", "Pantry",
  "New flooring", "Tile floor",
  "New plumbing fixtures", "Move plumbing",
  "New electrical / pot lights", "Panel upgrade",
  "Structural change / beam", "Wall removal",
  "Framing changes", "Drywall new", "Drywall patch only",
  "New windows", "New exterior door",
  "Siding changes", "New paint", "New trim",
  "Shower glass", "Closet shelving",
];

const SITE_FLAGS = [
  "Permits required",
  "Structural engineering likely",
  "Hazmat survey required",
  "Concrete cutting / new drain",
  "Exterior scaffolding",
  "Site access challenges",
  "Client living during reno",
  "Tight site / small lot",
  "Unknown structure / no drawings",
  "Aging electrical (Poly-B / Al wiring)",
  "Radon rough-in",
  "High-needs client",
];

const EMPTY_ROOM = () => ({ name: "", sqft: "", flags: [], notes: "" });

const EMPTY_FORM = () => ({
  clientName: "",
  address: "",
  phone: "",
  email: "",
  projectType: "",
  homeAge: "",
  budgetRange: "",
  timeline: "",
  markup: "20% (standard)",
  livingDuringReno: false,
  rooms: [EMPTY_ROOM()],
  electricalDays: "",
  plumbingFixtures: "",
  plumbingDays: "",
  tileSF: "",
  drywall: "",
  paintSF: "",
  siteFlags: [],
  dumpsterNeeded: false,
  portaPosty: true,
  blackSwans: "",
  generalNotes: "",
});

// ─── HELPERS ──────────────────────────────────────────────────────────────────

function toggle(arr, val) {
  return arr.includes(val) ? arr.filter((v) => v !== val) : [...arr, val];
}

const GOLD = "#C8A96E";
const BG = "#0C0C0C";
const SURFACE = "#111111";
const BORDER = "#2A2A2A";
const MUTED = "#666666";
const TEXT = "#E8E0D0";

const S = {
  input: {
    width: "100%",
    background: "#0F0F0F",
    border: `1px solid ${BORDER}`,
    borderRadius: 6,
    color: TEXT,
    padding: "12px 14px",
    fontSize: 16,
    fontFamily: "inherit",
    boxSizing: "border-box",
    outline: "none",
    WebkitAppearance: "none",
  },
  label: {
    display: "block",
    fontSize: 11,
    color: MUTED,
    marginBottom: 6,
    letterSpacing: "0.07em",
    textTransform: "uppercase",
  },
  chip: (active) => ({
    padding: "7px 13px",
    borderRadius: 5,
    border: `1.5px solid ${active ? GOLD : BORDER}`,
    background: active ? `${GOLD}18` : "transparent",
    color: active ? GOLD : MUTED,
    fontSize: 13,
    cursor: "pointer",
    fontFamily: "inherit",
    whiteSpace: "nowrap",
    lineHeight: 1,
  }),
  section: {
    fontSize: 10,
    letterSpacing: "0.14em",
    textTransform: "uppercase",
    color: GOLD,
    borderBottom: `1px solid ${GOLD}22`,
    paddingBottom: 7,
    marginBottom: 18,
    marginTop: 30,
  },
  btn: (variant = "primary") => ({
    padding: "13px 24px",
    background: variant === "primary" ? GOLD : "transparent",
    color: variant === "primary" ? BG : MUTED,
    border: variant === "primary" ? "none" : `1px solid ${BORDER}`,
    borderRadius: 6,
    fontSize: 15,
    fontWeight: 700,
    fontFamily: "inherit",
    cursor: "pointer",
    letterSpacing: "0.03em",
    WebkitAppearance: "none",
  }),
};

function Chip({ label, active, onClick }) {
  return (
    <button onClick={onClick} style={S.chip(active)}>
      {label}
    </button>
  );
}

function Field({ label, children }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <label style={S.label}>{label}</label>
      {children}
    </div>
  );
}

function Input({ value, onChange, placeholder, type = "text" }) {
  return (
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      style={S.input}
    />
  );
}

function Select({ value, onChange, options, placeholder }) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      style={{ ...S.input, appearance: "none", WebkitAppearance: "none" }}
    >
      {placeholder && <option value="">{placeholder}</option>}
      {options.map((o) => (
        <option key={o} value={o}>
          {o}
        </option>
      ))}
    </select>
  );
}

function Textarea({ value, onChange, placeholder, rows = 3 }) {
  return (
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      rows={rows}
      style={{ ...S.input, resize: "vertical", lineHeight: 1.6 }}
    />
  );
}

// ─── OUTPUT BUILDER ───────────────────────────────────────────────────────────

function buildOutput(form) {
  const lines = [];
  lines.push("# COLERIDGE CONSTRUCTION — SALES INTAKE");
  lines.push(`## ${form.clientName || "[Client Name]"} — ${form.projectType || "[Project Type]"}`);
  lines.push("");

  lines.push("### CLIENT");
  lines.push(`- Name: ${form.clientName || "—"}`);
  lines.push(`- Address: ${form.address || "—"}`);
  lines.push(`- Phone: ${form.phone || "—"}`);
  lines.push(`- Email: ${form.email || "—"}`);
  lines.push(`- Living during reno: ${form.livingDuringReno ? "YES" : "No"}`);
  lines.push("");

  lines.push("### PROJECT");
  lines.push(`- Type: ${form.projectType || "—"}`);
  lines.push(`- Home age: ${form.homeAge || "—"}`);
  lines.push(`- Budget range: ${form.budgetRange || "—"}`);
  lines.push(`- Timeline: ${form.timeline || "—"}`);
  lines.push(`- Markup target: ${form.markup}`);
  lines.push("");

  const activeRooms = form.rooms.filter((r) => r.name || r.flags.length || r.notes);
  if (activeRooms.length) {
    lines.push("### SCOPE BY ROOM");
    activeRooms.forEach((r) => {
      lines.push(`**${r.name || "Unnamed Room"}**${r.sqft ? ` (${r.sqft} SF)` : ""}`);
      if (r.flags.length) lines.push(`  Scope: ${r.flags.join(" · ")}`);
      if (r.notes) lines.push(`  Notes: ${r.notes}`);
    });
    lines.push("");
  }

  lines.push("### SUB-TRADE SCOPE");
  lines.push(`- Electrical: ${form.electricalDays ? form.electricalDays + " man-days" : "—"}`);
  lines.push(`- Plumbing: ${form.plumbingFixtures ? form.plumbingFixtures + " fixtures" : "—"}${form.plumbingDays ? ", ~" + form.plumbingDays + " days" : ""}`);
  lines.push(`- Tile SF: ${form.tileSF || "—"}`);
  lines.push(`- Drywall: ${form.drywall || "—"}`);
  lines.push(`- Paint SF: ${form.paintSF || "—"}`);
  lines.push("");

  if (form.siteFlags.length || form.dumpsterNeeded || form.portaPosty) {
    lines.push("### SITE FLAGS");
    form.siteFlags.forEach((f) => lines.push(`- ⚑ ${f}`));
    if (form.dumpsterNeeded) lines.push("- Dumpster required");
    if (form.portaPosty) lines.push("- Porta-potty required");
    lines.push("");
  }

  if (form.blackSwans) {
    lines.push("### BLACK SWANS / RISKS");
    lines.push(form.blackSwans);
    lines.push("");
  }

  if (form.generalNotes) {
    lines.push("### GENERAL NOTES");
    lines.push(form.generalNotes);
    lines.push("");
  }

  lines.push("---");
  lines.push('*Paste into Claude → "Build the budget for this project."*');
  return lines.join("\n");
}

// ─── ROOM CARD ────────────────────────────────────────────────────────────────

function RoomCard({ room, index, onChange, onRemove }) {
  const update = (key, val) => onChange(index, { ...room, [key]: val });

  return (
    <div
      style={{
        background: SURFACE,
        border: `1px solid ${BORDER}`,
        borderRadius: 8,
        padding: 16,
        marginBottom: 12,
      }}
    >
      <div style={{ display: "flex", gap: 10, marginBottom: 12 }}>
        <div style={{ flex: 2 }}>
          <Select
            value={room.name}
            onChange={(v) => update("name", v)}
            options={ROOM_PRESETS}
            placeholder="Room…"
          />
        </div>
        <div style={{ flex: 1 }}>
          <Input
            value={room.sqft}
            onChange={(v) => update("sqft", v)}
            placeholder="SF"
          />
        </div>
        <button
          onClick={() => onRemove(index)}
          style={{
            background: "none",
            border: `1px solid ${BORDER}`,
            borderRadius: 6,
            color: MUTED,
            cursor: "pointer",
            padding: "0 14px",
            fontSize: 18,
            flexShrink: 0,
          }}
        >
          ×
        </button>
      </div>

      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: 6,
          marginBottom: 10,
        }}
      >
        {ROOM_FLAGS.map((f) => (
          <Chip
            key={f}
            label={f}
            active={room.flags.includes(f)}
            onClick={() => update("flags", toggle(room.flags, f))}
          />
        ))}
      </div>

      <Textarea
        value={room.notes}
        onChange={(v) => update("notes", v)}
        placeholder="Room notes…"
        rows={2}
      />
    </div>
  );
}

// ─── MAIN APP ─────────────────────────────────────────────────────────────────

export default function App() {
  const [tab, setTab] = useState("manual");
  const [form, setForm] = useState(EMPTY_FORM());
  const [transcript, setTranscript] = useState("");
  const [parsing, setParsing] = useState(false);
  const [parseError, setParseError] = useState("");
  const [copied, setCopied] = useState(false);

  const set = useCallback((key, val) => {
    setForm((f) => ({ ...f, [key]: val }));
  }, []);

  const setRoom = useCallback((index, room) => {
    setForm((f) => {
      const rooms = [...f.rooms];
      rooms[index] = room;
      return { ...f, rooms };
    });
  }, []);

  const addRoom = () =>
    setForm((f) => ({ ...f, rooms: [...f.rooms, EMPTY_ROOM()] }));

  const removeRoom = (index) =>
    setForm((f) => ({ ...f, rooms: f.rooms.filter((_, i) => i !== index) }));

  const handleParse = async () => {
    if (!transcript.trim()) return;
    setParsing(true);
    setParseError("");
    try {
      const res = await fetch("/api/parse", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ transcript }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Server error");
      }
      const parsed = await res.json();
      setForm((f) => ({
        ...f,
        clientName: parsed.clientName || f.clientName,
        address: parsed.address || f.address,
        phone: parsed.phone || f.phone,
        email: parsed.email || f.email,
        projectType: parsed.projectType || f.projectType,
        homeAge: parsed.homeAge || f.homeAge,
        budgetRange: parsed.budgetRange || f.budgetRange,
        timeline: parsed.timeline || f.timeline,
        livingDuringReno: parsed.livingDuringReno ?? f.livingDuringReno,
        rooms: parsed.rooms?.length ? parsed.rooms : f.rooms,
        electricalDays: parsed.electricalDays || f.electricalDays,
        plumbingFixtures: parsed.plumbingFixtures || f.plumbingFixtures,
        plumbingDays: parsed.plumbingDays || f.plumbingDays,
        tileSF: parsed.tileSF || f.tileSF,
        drywall: parsed.drywall || f.drywall,
        paintSF: parsed.paintSF || f.paintSF,
        siteFlags: parsed.siteFlags?.length ? parsed.siteFlags : f.siteFlags,
        dumpsterNeeded: parsed.dumpsterNeeded ?? f.dumpsterNeeded,
        portaPosty: parsed.portaPosty ?? f.portaPosty,
        blackSwans: parsed.blackSwans || f.blackSwans,
        generalNotes: parsed.generalNotes || f.generalNotes,
      }));
      setTab("manual");
    } catch (e) {
      setParseError("Parse failed: " + e.message);
    }
    setParsing(false);
  };

  const output = buildOutput(form);

  const handleCopy = () => {
    navigator.clipboard.writeText(output).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const tabStyle = (active) => ({
    flex: 1,
    padding: "14px 8px",
    background: "none",
    border: "none",
    borderBottom: `2px solid ${active ? GOLD : "transparent"}`,
    color: active ? GOLD : MUTED,
    fontSize: 13,
    fontFamily: "inherit",
    cursor: "pointer",
    letterSpacing: "0.04em",
    fontWeight: active ? 600 : 400,
  });

  return (
    <div style={{ minHeight: "100vh", background: BG, color: TEXT }}>
      {/* Header */}
      <div
        style={{
          background: "#0E0E0E",
          borderBottom: `1px solid ${BORDER}`,
          padding: "16px 20px 0",
          position: "sticky",
          top: 0,
          zIndex: 100,
        }}
      >
        <div style={{ marginBottom: 12 }}>
          <div
            style={{
              fontSize: 10,
              letterSpacing: "0.16em",
              color: GOLD,
              textTransform: "uppercase",
            }}
          >
            Coleridge Construction
          </div>
          <div style={{ fontSize: 20, fontWeight: 700, lineHeight: 1.2 }}>
            Sales Intake
          </div>
        </div>
        <div style={{ display: "flex" }}>
          <button style={tabStyle(tab === "transcript")} onClick={() => setTab("transcript")}>
            Voice Notes
          </button>
          <button style={tabStyle(tab === "manual")} onClick={() => setTab("manual")}>
            Form
          </button>
          <button style={tabStyle(tab === "output")} onClick={() => setTab("output")}>
            Output
          </button>
        </div>
      </div>

      {/* Content */}
      <div style={{ padding: "20px 16px 80px" }}>

        {/* ── TRANSCRIPT TAB ── */}
        {tab === "transcript" && (
          <div>
            <p style={{ color: MUTED, fontSize: 14, marginBottom: 16, lineHeight: 1.6 }}>
              Paste your Granola transcript or voice notes. Claude will extract the data and pre-fill the form.
            </p>
            <Textarea
              value={transcript}
              onChange={setTranscript}
              placeholder="Paste Granola transcript or voice notes here…"
              rows={14}
            />
            {parseError && (
              <div style={{ color: "#E07070", fontSize: 13, marginTop: 10 }}>
                {parseError}
              </div>
            )}
            <button
              onClick={handleParse}
              disabled={parsing || !transcript.trim()}
              style={{
                ...S.btn("primary"),
                marginTop: 16,
                width: "100%",
                opacity: parsing || !transcript.trim() ? 0.5 : 1,
              }}
            >
              {parsing ? "Parsing…" : "Parse Notes → Fill Form"}
            </button>
          </div>
        )}

        {/* ── FORM TAB ── */}
        {tab === "manual" && (
          <div>
            {/* Client */}
            <div style={S.section}>Client</div>
            <Field label="Client Name">
              <Input value={form.clientName} onChange={(v) => set("clientName", v)} placeholder="Last name or full name" />
            </Field>
            <Field label="Address">
              <Input value={form.address} onChange={(v) => set("address", v)} placeholder="Site address" />
            </Field>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <Field label="Phone">
                <Input value={form.phone} onChange={(v) => set("phone", v)} placeholder="604-xxx-xxxx" />
              </Field>
              <Field label="Email">
                <Input value={form.email} onChange={(v) => set("email", v)} placeholder="email@…" />
              </Field>
            </div>

            {/* Project */}
            <div style={S.section}>Project</div>
            <Field label="Project Type">
              <Select value={form.projectType} onChange={(v) => set("projectType", v)} options={PROJECT_TYPES} placeholder="Select…" />
            </Field>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <Field label="Home Age">
                <Select value={form.homeAge} onChange={(v) => set("homeAge", v)} options={HOME_AGES} placeholder="Select…" />
              </Field>
              <Field label="Markup">
                <Select value={form.markup} onChange={(v) => set("markup", v)} options={MARKUP_OPTIONS} />
              </Field>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <Field label="Budget Range">
                <Input value={form.budgetRange} onChange={(v) => set("budgetRange", v)} placeholder="$80K–$120K" />
              </Field>
              <Field label="Timeline">
                <Input value={form.timeline} onChange={(v) => set("timeline", v)} placeholder="Start / end" />
              </Field>
            </div>
            <Field label="Living During Reno?">
              <div style={{ display: "flex", gap: 10 }}>
                {["Yes", "No"].map((o) => (
                  <Chip
                    key={o}
                    label={o}
                    active={(o === "Yes") === form.livingDuringReno}
                    onClick={() => set("livingDuringReno", o === "Yes")}
                  />
                ))}
              </div>
            </Field>

            {/* Rooms */}
            <div style={S.section}>Rooms & Scope</div>
            {form.rooms.map((room, i) => (
              <RoomCard key={i} room={room} index={i} onChange={setRoom} onRemove={removeRoom} />
            ))}
            <button
              onClick={addRoom}
              style={{
                background: "none",
                border: `1px dashed ${BORDER}`,
                borderRadius: 6,
                color: MUTED,
                padding: "12px",
                cursor: "pointer",
                fontFamily: "inherit",
                fontSize: 14,
                width: "100%",
                marginBottom: 4,
              }}
            >
              + Add Room
            </button>

            {/* Sub-trades */}
            <div style={S.section}>Sub-Trade Scope</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <Field label="Electrical (man-days)">
                <Input value={form.electricalDays} onChange={(v) => set("electricalDays", v)} placeholder="e.g. 1.5" />
              </Field>
              <Field label="Plumbing (fixtures)">
                <Input value={form.plumbingFixtures} onChange={(v) => set("plumbingFixtures", v)} placeholder="e.g. 4" />
              </Field>
              <Field label="Plumbing (days)">
                <Input value={form.plumbingDays} onChange={(v) => set("plumbingDays", v)} placeholder="e.g. 2" />
              </Field>
              <Field label="Tile (SF)">
                <Input value={form.tileSF} onChange={(v) => set("tileSF", v)} placeholder="e.g. 150" />
              </Field>
              <Field label="Drywall (floor SF)">
                <Input value={form.drywall} onChange={(v) => set("drywall", v)} placeholder="e.g. 80 SF" />
              </Field>
              <Field label="Paint (floor SF)">
                <Input value={form.paintSF} onChange={(v) => set("paintSF", v)} placeholder="e.g. 120" />
              </Field>
            </div>

            {/* Site flags */}
            <div style={S.section}>Site Flags</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 7, marginBottom: 14 }}>
              {SITE_FLAGS.map((f) => (
                <Chip
                  key={f}
                  label={f}
                  active={form.siteFlags.includes(f)}
                  onClick={() => set("siteFlags", toggle(form.siteFlags, f))}
                />
              ))}
            </div>
            <div style={{ display: "flex", gap: 8, marginBottom: 4 }}>
              <Chip label="Dumpster required" active={form.dumpsterNeeded} onClick={() => set("dumpsterNeeded", !form.dumpsterNeeded)} />
              <Chip label="Porta-potty" active={form.portaPosty} onClick={() => set("portaPosty", !form.portaPosty)} />
            </div>

            {/* Risks */}
            <div style={S.section}>Black Swans / Risks</div>
            <Textarea
              value={form.blackSwans}
              onChange={(v) => set("blackSwans", v)}
              placeholder="Hidden unknowns, aging systems, structural concerns…"
              rows={3}
            />

            {/* Notes */}
            <div style={S.section}>General Notes</div>
            <Textarea
              value={form.generalNotes}
              onChange={(v) => set("generalNotes", v)}
              placeholder="Client personality, timeline pressure, ideas discussed…"
              rows={3}
            />

            {/* Actions */}
            <div style={{ marginTop: 24, display: "flex", gap: 12 }}>
              <button onClick={() => setTab("output")} style={{ ...S.btn("primary"), flex: 1 }}>
                Generate Output →
              </button>
              <button onClick={() => setForm(EMPTY_FORM())} style={S.btn("secondary")}>
                Clear
              </button>
            </div>
          </div>
        )}

        {/* ── OUTPUT TAB ── */}
        {tab === "output" && (
          <div>
            <p style={{ color: MUTED, fontSize: 13, marginBottom: 14, lineHeight: 1.6 }}>
              Copy this and paste into Claude → <em>"Build the budget for this project."</em>
            </p>
            <button
              onClick={handleCopy}
              style={{
                ...S.btn("primary"),
                width: "100%",
                marginBottom: 16,
                background: copied ? "#3A5A3A" : GOLD,
                color: copied ? "#8FBC8F" : BG,
              }}
            >
              {copied ? "✓ Copied to Clipboard" : "Copy to Clipboard"}
            </button>
            <pre
              style={{
                background: "#0A0A0A",
                border: `1px solid ${BORDER}`,
                borderRadius: 8,
                padding: 16,
                color: "#C8D8B0",
                fontSize: 13,
                lineHeight: 1.7,
                whiteSpace: "pre-wrap",
                fontFamily: "'Courier New', monospace",
                overflowX: "auto",
              }}
            >
              {output}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}
