import { useState, useRef, useCallback } from "react";
import {
  Search, Plus, Settings, HelpCircle, FileDown, LayoutGrid, X,
  CheckCircle, AlertTriangle, XCircle, TrendingUp, BarChart3,
  ChevronLeft, ChevronRight, Circle, Info,
} from "lucide-react";

// ─── STSX Design Tokens ──────────────────────────────────────────────────────
const C = {
  bg:         "#DCE8F6",
  surface:    "#F1F6FC",
  surfaceAlt: "#D4E3F2",
  border:     "#ADBFD8",
  text:       "#1C1712",
  textSub:    "#3D3028",
  textMuted:  "#4A5870",
  primary:    "#00795D",
  primaryFg:  "#FDFAF5",
  accent:     "#A8C2EA",
  warning:    "#D4703A",
  warningBg:  "#FBF0E6",
  danger:     "#C44830",
  dangerBg:   "#FAEEE9",
  positiveBg: "#E4F6EE",
};

// ─── Grid Constants ───────────────────────────────────────────────────────────
const COLS = 12;
const ROWS = 4;
const GAP  = 10; // px

const ROW_H = [148, 162, 246, 254]; // px, rows 1–4

// ─── Types ────────────────────────────────────────────────────────────────────
type PanelDef = {
  id: string;
  colStart: number; colSpan: number;
  rowStart: number; rowSpan: number;
};

type ResizeDir = "col" | "row";

// ─── Initial Layout ───────────────────────────────────────────────────────────
const INIT: PanelDef[] = [
  { id: "stat1",     colStart: 1,  colSpan: 3, rowStart: 1, rowSpan: 1 },
  { id: "stat2",     colStart: 4,  colSpan: 3, rowStart: 1, rowSpan: 1 },
  { id: "stat3",     colStart: 7,  colSpan: 3, rowStart: 1, rowSpan: 1 },
  { id: "stat4",     colStart: 10, colSpan: 3, rowStart: 1, rowSpan: 1 },
  { id: "recent",    colStart: 1,  colSpan: 4, rowStart: 2, rowSpan: 3 },
  { id: "search",    colStart: 5,  colSpan: 8, rowStart: 2, rowSpan: 1 },
  { id: "tasks",     colStart: 5,  colSpan: 4, rowStart: 3, rowSpan: 2 },
  { id: "timelines", colStart: 9,  colSpan: 4, rowStart: 3, rowSpan: 1 },
  { id: "calendar",  colStart: 9,  colSpan: 4, rowStart: 4, rowSpan: 1 },
];

// ─── Panel Metadata ───────────────────────────────────────────────────────────
const PANEL_META: Record<string, { title: string; description: string }> = {
  stat1: {
    title: "Active Jobs",
    description:
      "Total number of jobs currently in production across all stages — from raw material cutting through to final QC sign-off. Includes jobs on hold.",
  },
  stat2: {
    title: "Scans Today",
    description:
      "Total barcodes and QR codes scanned today across all scanner units on the floor. The pass rate reflects first-pass quality without any re-scan events.",
  },
  stat3: {
    title: "Pending Reviews",
    description:
      "Parts flagged for manual quality review before they can be signed off and moved to the next stage. Items marked overdue have exceeded their review deadline.",
  },
  stat4: {
    title: "On-Time Rate",
    description:
      "Percentage of jobs delivered on or before the scheduled completion date. Calculated over a rolling 30-day window and compared to the previous period.",
  },
  recent: {
    title: "Recent Scans",
    description:
      "Live feed of the most recent part scans from all scanner units on the shop floor, sorted newest-first. Click any row to open the full scan record and traceability chain.",
  },
  search: {
    title: "Quick Search",
    description:
      "Search across all jobs, part numbers, customers, and scan records from one place. Use the filter pills to narrow by category, or type a partial string for fuzzy matching.",
  },
  tasks: {
    title: "Today's Tasks",
    description:
      "Your personal task list for the current working day. High-priority items are flagged in amber. Check off tasks as you complete them — progress is saved automatically.",
  },
  timelines: {
    title: "Project Timelines",
    description:
      "Gantt-style progress view for all active jobs. Progress is calculated from scanned milestones against the planned schedule. At-risk jobs are tracking behind their baseline.",
  },
  calendar: {
    title: "Calendar",
    description:
      "Monthly overview. Job deadlines, planned site visits, compliance review dates, and team events appear as marked days. Click any date to see what is scheduled.",
  },
};

// ─── Dummy Data ───────────────────────────────────────────────────────────────
const STATS = [
  { id: "stat1", label: "Active Jobs",     value: "47",    sub: "+3 since yesterday", color: C.primary, Icon: BarChart3 },
  { id: "stat2", label: "Scans Today",     value: "183",   sub: "94.0% pass rate",    color: C.primary, Icon: CheckCircle },
  { id: "stat3", label: "Pending Reviews", value: "12",    sub: "3 overdue",          color: C.warning, Icon: AlertTriangle },
  { id: "stat4", label: "On-Time Rate",    value: "94.2%", sub: "↑ 2.1pp this week", color: C.primary, Icon: TrendingUp },
];

const SCANS = [
  { id: "SC-2847", part: "PT-1042-A", desc: "Beam Flange Cut",    qty: 24, time: "09:41", status: "passed" },
  { id: "SC-2846", part: "PT-0837-B", desc: "Web Plate 12 mm",    qty: 12, time: "09:38", status: "passed" },
  { id: "SC-2845", part: "PT-2201",   desc: "Angle Brace L75",    qty:  8, time: "09:22", status: "review" },
  { id: "SC-2844", part: "PT-0442",   desc: "End Plate 20 mm",    qty: 16, time: "09:15", status: "passed" },
  { id: "SC-2843", part: "PT-1199-C", desc: "Column Cap Plate",   qty:  4, time: "08:57", status: "passed" },
  { id: "SC-2842", part: "PT-0672",   desc: "Gusset Plate",       qty: 32, time: "08:43", status: "passed" },
  { id: "SC-2841", part: "PT-3301",   desc: "Purlin Z200",        qty: 48, time: "08:30", status: "failed" },
  { id: "SC-2840", part: "PT-1042-B", desc: "Beam Flange Cut",    qty: 24, time: "08:21", status: "passed" },
  { id: "SC-2839", part: "PT-0837-A", desc: "Web Plate 10 mm",    qty: 12, time: "08:18", status: "passed" },
  { id: "SC-2838", part: "PT-4401",   desc: "Baseplate 25 mm",    qty:  6, time: "08:05", status: "review" },
  { id: "SC-2837", part: "PT-2890",   desc: "Splice Plate",       qty: 20, time: "07:52", status: "passed" },
  { id: "SC-2836", part: "PT-0109",   desc: "Stiffener Plate",    qty: 28, time: "07:41", status: "passed" },
  { id: "SC-2835", part: "PT-5502",   desc: "Flange Plate 16 mm", qty: 10, time: "07:33", status: "passed" },
  { id: "SC-2834", part: "PT-0672-A", desc: "Gusset Plate Alt",   qty: 14, time: "07:22", status: "passed" },
  { id: "SC-2833", part: "PT-3802",   desc: "Column Base",        qty:  8, time: "07:10", status: "passed" },
];

const INIT_TASKS = [
  { id: 1, done: false, text: "Review PT-1042-A inspection report",  priority: "high"   },
  { id: 2, done: false, text: "Sign off SC-2840 batch",               priority: "normal" },
  { id: 3, done: true,  text: "Update material certs for J-0912",     priority: "normal" },
  { id: 4, done: false, text: "Call supplier re: delayed shipment",   priority: "high"   },
  { id: 5, done: false, text: "Submit weekly compliance report",       priority: "normal" },
  { id: 6, done: false, text: "Calibration check — scanner unit 3",  priority: "normal" },
  { id: 7, done: true,  text: "Archive SC-2800 to SC-2830 records",   priority: "normal" },
  { id: 8, done: false, text: "Review and approve quotes for J-1056", priority: "normal" },
];

const PROJECTS = [
  { name: "J-0912  Steel Frame", progress: 80, due: "Aug 15", status: "on-track" },
  { name: "J-1034  Purlin Set",  progress: 52, due: "Aug 28", status: "on-track" },
  { name: "J-1056  Quote Prep",  progress: 20, due: "Aug  8", status: "at-risk"  },
];

const AUG_OFFSET = 5; // Monday-first: blank cells before Aug 1 (Saturday)
const AUG_DAYS   = 31;
const TODAY       = 2; // August 2, 2026

// ─── Panel content components ─────────────────────────────────────────────────

function PanelHeader({ title }: { title: string }) {
  return (
    <div
      className="flex-none flex items-center px-4 py-2.5"
      style={{
        background: C.surfaceAlt,
        borderBottom: `0.8px solid ${C.border}`,
        minHeight: 36,
      }}
    >
      <span
        style={{
          fontFamily: "'DM Mono', monospace",
          fontSize: 11,
          fontWeight: 500,
          color: C.text,
          letterSpacing: "0.07em",
          textTransform: "uppercase",
        }}
      >
        {title}
      </span>
    </div>
  );
}

function StatContent({ id }: { id: string }) {
  const s = STATS.find((x) => x.id === id)!;
  const { Icon } = s;
  return (
    <div className="flex flex-col justify-between h-full p-4">
      <div className="flex items-start justify-between">
        <span style={{ fontFamily: "'Lato', sans-serif", fontSize: 11, color: C.textMuted, textTransform: "uppercase", letterSpacing: "0.06em" }}>
          {s.label}
        </span>
        <Icon size={16} color={s.color} strokeWidth={1.8} />
      </div>
      <div>
        <p style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 600, fontSize: 38, color: C.text, lineHeight: 1 }}>
          {s.value}
        </p>
        <p style={{ fontFamily: "'Lato', sans-serif", fontSize: 11, color: s.color, marginTop: 7 }}>
          {s.sub}
        </p>
      </div>
    </div>
  );
}

function RecentScansContent() {
  return (
    <div className="flex flex-col overflow-hidden h-full">
      <div
        className="flex-none flex items-center py-1.5"
        style={{ borderBottom: `0.8px solid ${C.border}`, background: C.surfaceAlt }}
      >
        {(["Scan ID", "Part No.", "Description", "Qty", "Time", ""] as const).map((label, i) => (
          <div
            key={i}
            className={i === 2 ? "flex-1 px-2" : "shrink-0 px-2"}
            style={{
              width: [72, 74, undefined, 32, 42, 28][i],
              fontFamily: "'DM Mono', monospace",
              fontSize: 10,
              color: C.textMuted,
              textTransform: "uppercase",
              letterSpacing: "0.05em",
            }}
          >
            {label}
          </div>
        ))}
      </div>
      <div className="flex-1 overflow-y-auto">
        {SCANS.map((s, i) => (
          <div
            key={s.id}
            className="flex items-center py-[6px]"
            style={{ borderBottom: `0.8px solid ${C.border}`, background: i % 2 === 0 ? "transparent" : `${C.surfaceAlt}55` }}
          >
            <div className="w-[72px] shrink-0 px-2" style={{ fontFamily: "'DM Mono', monospace", fontSize: 10, color: C.primary }}>{s.id}</div>
            <div className="w-[74px] shrink-0 px-2" style={{ fontFamily: "'DM Mono', monospace", fontSize: 10, color: C.text }}>{s.part}</div>
            <div className="flex-1 px-2 truncate" style={{ fontFamily: "'Lato', sans-serif", fontSize: 11, color: C.textSub }}>{s.desc}</div>
            <div className="w-[32px] shrink-0 px-2" style={{ fontFamily: "'DM Mono', monospace", fontSize: 10, color: C.textMuted }}>{s.qty}</div>
            <div className="w-[42px] shrink-0 px-2" style={{ fontFamily: "'DM Mono', monospace", fontSize: 10, color: C.textMuted }}>{s.time}</div>
            <div className="w-[28px] shrink-0 px-2 flex items-center">
              {s.status === "passed" && <CheckCircle size={12} color={C.primary} />}
              {s.status === "review" && <AlertTriangle size={12} color={C.warning} />}
              {s.status === "failed" && <XCircle size={12} color={C.danger} />}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function QuickSearchContent() {
  const [filter, setFilter] = useState("All");
  const filters = ["All", "Job No.", "Part No.", "Customer", "Material"];
  const recent  = ["PT-1042-A", "J-0912", "SC-2840", "PT-3301"];
  return (
    <div className="flex flex-col gap-4 p-4 h-full">
      <div
        className="flex items-center gap-3 px-4 rounded-md"
        style={{ background: C.surfaceAlt, border: `0.8px solid ${C.border}`, height: 42 }}
      >
        <Search size={15} color={C.textMuted} strokeWidth={1.8} />
        <input
          placeholder="Search by part, job, customer or scan ID…"
          className="flex-1 bg-transparent outline-none"
          style={{ fontFamily: "'Lato', sans-serif", fontSize: 13, color: C.text }}
        />
      </div>
      <div className="flex items-center gap-2">
        {filters.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className="px-3 py-1 rounded-full transition-all"
            style={{
              fontFamily: "'Lato', sans-serif",
              fontSize: 11,
              background: filter === f ? C.primary : C.surfaceAlt,
              color:      filter === f ? C.primaryFg : C.textMuted,
              border:     `0.8px solid ${filter === f ? C.primary : C.border}`,
              cursor: "pointer",
            }}
          >
            {f}
          </button>
        ))}
      </div>
      <div>
        <p className="mb-2" style={{ fontFamily: "'Lato', sans-serif", fontSize: 10, color: C.textMuted, textTransform: "uppercase", letterSpacing: "0.06em" }}>
          Recent searches
        </p>
        <div className="flex flex-wrap gap-2">
          {recent.map((r) => (
            <span
              key={r}
              className="px-3 py-1 rounded"
              style={{ fontFamily: "'DM Mono', monospace", fontSize: 11, color: C.primary, background: C.positiveBg, border: `0.8px solid ${C.border}`, cursor: "pointer" }}
            >
              {r}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

function TasksContent() {
  const [tasks, setTasks] = useState(INIT_TASKS);
  const toggle = (id: number) =>
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, done: !t.done } : t)));
  return (
    <div className="flex flex-col overflow-hidden h-full">
      <div
        className="flex-none flex items-center justify-between px-4 py-2"
        style={{ borderBottom: `0.8px solid ${C.border}`, background: C.surfaceAlt }}
      >
        <span style={{ fontFamily: "'Lato', sans-serif", fontSize: 11, color: C.textMuted }}>
          {tasks.filter((t) => t.done).length}/{tasks.length} complete
        </span>
        <button
          className="flex items-center gap-1 px-2 py-1 rounded"
          style={{ fontFamily: "'Lato', sans-serif", fontSize: 11, color: C.primary, background: C.positiveBg, border: `0.8px solid ${C.border}`, cursor: "pointer" }}
        >
          <Plus size={11} /> Add task
        </button>
      </div>
      <div className="flex-1 overflow-y-auto">
        {tasks.map((t) => (
          <div key={t.id} className="flex items-start gap-3 px-4 py-2.5" style={{ borderBottom: `0.8px solid ${C.border}` }}>
            <button onClick={() => toggle(t.id)} className="mt-0.5 flex-none" style={{ cursor: "pointer", color: t.done ? C.primary : C.border }}>
              {t.done ? <CheckCircle size={14} /> : <Circle size={14} />}
            </button>
            <span style={{ fontFamily: "'Lato', sans-serif", fontSize: 12, color: t.done ? C.textMuted : C.text, textDecoration: t.done ? "line-through" : "none", flex: 1, lineHeight: 1.5 }}>
              {t.text}
            </span>
            {t.priority === "high" && !t.done && (
              <span className="flex-none px-1.5 py-0.5 rounded" style={{ fontFamily: "'DM Mono', monospace", fontSize: 9, color: C.warning, background: C.warningBg, border: `0.8px solid ${C.warning}44` }}>
                HIGH
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function TimelinesContent() {
  return (
    <div className="flex flex-col gap-0 overflow-hidden h-full px-4 py-3">
      {PROJECTS.map((p) => (
        <div key={p.name} className="py-3" style={{ borderBottom: `0.8px solid ${C.border}` }}>
          <div className="flex items-center justify-between mb-2">
            <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 11, color: C.text }}>{p.name}</span>
            <div className="flex items-center gap-2">
              <span style={{ fontFamily: "'Lato', sans-serif", fontSize: 10, color: C.textMuted }}>Due {p.due}</span>
              <span className="px-1.5 py-0.5 rounded" style={{ fontFamily: "'DM Mono', monospace", fontSize: 9, color: p.status === "at-risk" ? C.warning : C.primary, background: p.status === "at-risk" ? C.warningBg : C.positiveBg, border: `0.8px solid ${p.status === "at-risk" ? C.warning : C.primary}44` }}>
                {p.status === "at-risk" ? "AT RISK" : "ON TRACK"}
              </span>
            </div>
          </div>
          <div className="h-2 rounded-full overflow-hidden" style={{ background: C.surfaceAlt, border: `0.8px solid ${C.border}` }}>
            <div className="h-full rounded-full transition-all" style={{ width: `${p.progress}%`, background: p.status === "at-risk" ? C.warning : C.primary }} />
          </div>
          <div className="flex justify-between mt-1">
            {["0%", `${p.progress}%`, "100%"].map((v) => (
              <span key={v} style={{ fontFamily: "'DM Mono', monospace", fontSize: 9, color: C.textMuted }}>{v}</span>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function CalendarContent() {
  const days  = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"];
  const cells: (number | null)[] = [
    ...Array(AUG_OFFSET).fill(null),
    ...Array.from({ length: AUG_DAYS }, (_, i) => i + 1),
  ];
  while (cells.length % 7 !== 0) cells.push(null);
  return (
    <div className="flex flex-col h-full px-4 py-3 gap-2">
      <div className="flex items-center justify-between mb-1">
        <button style={{ color: C.textMuted, cursor: "pointer" }}><ChevronLeft size={14} /></button>
        <span style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 600, fontSize: 13, color: C.text }}>August 2026</span>
        <button style={{ color: C.textMuted, cursor: "pointer" }}><ChevronRight size={14} /></button>
      </div>
      <div className="grid grid-cols-7">
        {days.map((d) => (
          <div key={d} className="text-center py-1" style={{ fontFamily: "'DM Mono', monospace", fontSize: 9, color: C.textMuted, textTransform: "uppercase", letterSpacing: "0.05em" }}>{d}</div>
        ))}
      </div>
      <div className="grid grid-cols-7 flex-1">
        {cells.map((d, i) => {
          const isToday = d === TODAY;
          return (
            <div key={i} className="flex items-center justify-center" style={{ minHeight: 28 }}>
              {d !== null && (
                <span
                  className="flex items-center justify-center rounded-full w-6 h-6 cursor-pointer"
                  style={{
                    fontFamily: "'DM Mono', monospace",
                    fontSize: isToday ? 11 : 10,
                    fontWeight: isToday ? 500 : 400,
                    color:      isToday ? C.primaryFg : d < TODAY ? C.textMuted : C.text,
                    background: isToday ? C.primary    : "transparent",
                  }}
                >
                  {d}
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function PanelContent({ id }: { id: string }) {
  if (id.startsWith("stat")) return <StatContent id={id} />;
  if (id === "recent")       return <RecentScansContent />;
  if (id === "search")       return <QuickSearchContent />;
  if (id === "tasks")        return <TasksContent />;
  if (id === "timelines")    return <TimelinesContent />;
  if (id === "calendar")     return <CalendarContent />;
  return null;
}

// ─── Info Tooltip Overlay ─────────────────────────────────────────────────────
// Rendered inside the panel — slides up from bottom on click
function InfoOverlay({
  id,
  visible,
  onClose,
}: {
  id: string;
  visible: boolean;
  onClose: (e: React.MouseEvent) => void;
}) {
  const meta = PANEL_META[id];
  return (
    <div
      className="absolute inset-0 flex flex-col justify-start z-30 pointer-events-none"
      style={{ transition: "opacity 200ms ease" }}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 pointer-events-auto"
        style={{
          background: `${C.text}18`,
          backdropFilter: "blur(2px)",
          WebkitBackdropFilter: "blur(2px)",
          opacity: visible ? 1 : 0,
          transition: "opacity 200ms ease",
        }}
        onClick={onClose}
      />
      {/* Card */}
      <div
        className="relative m-3 rounded-lg overflow-hidden pointer-events-auto"
        style={{
          background: C.surface,
          border: `0.8px solid ${C.border}`,
          boxShadow: `0 8px 24px ${C.text}18`,
          transform: visible ? "translateY(0)" : "translateY(-16px)",
          opacity: visible ? 1 : 0,
          transition: "transform 220ms cubic-bezier(.22,.8,.36,1), opacity 200ms ease",
        }}
      >
        {/* Card header */}
        <div
          className="flex items-center justify-between px-4 py-3"
          style={{ borderBottom: `0.8px solid ${C.border}`, background: C.positiveBg }}
        >
          <div className="flex items-center gap-2">
            <Info size={13} color={C.primary} strokeWidth={2} />
            <span
              style={{
                fontFamily: "'DM Mono', monospace",
                fontSize: 11,
                fontWeight: 500,
                color: C.primary,
                letterSpacing: "0.06em",
                textTransform: "uppercase",
              }}
            >
              {meta.title}
            </span>
          </div>
          <button
            onClick={onClose}
            style={{ color: C.textMuted, cursor: "pointer", lineHeight: 0 }}
          >
            <X size={14} />
          </button>
        </div>
        {/* Card body */}
        <div className="px-4 py-3">
          <p
            style={{
              fontFamily: "'Lato', sans-serif",
              fontSize: 12,
              color: C.textSub,
              lineHeight: 1.7,
            }}
          >
            {meta.description}
          </p>
        </div>
      </div>
    </div>
  );
}

// ─── Bento Panel ──────────────────────────────────────────────────────────────
function BentoPanel({
  panel,
  isEditing,
  isHovered,
  isGhosted,
  isActive,
  onMouseEnter,
  onMouseLeave,
  onClick,
  onCloseInfo,
  onStartResize,
}: {
  panel: PanelDef;
  isEditing:   boolean;
  isHovered:   boolean;
  isGhosted:   boolean;
  isActive:    boolean;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
  onClick:     (e: React.MouseEvent) => void;
  onCloseInfo: (e: React.MouseEvent) => void;
  onStartResize: (e: React.MouseEvent, id: string, dir: ResizeDir) => void;
}) {
  const { id, colStart, colSpan, rowStart, rowSpan } = panel;
  const isStat = id.startsWith("stat");

  return (
    <div
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      onClick={onClick}
      style={{
        gridColumn: `${colStart} / ${colStart + colSpan}`,
        gridRow:    `${rowStart} / ${rowStart + rowSpan}`,
        background: C.surface,
        border: isEditing
          ? `1.5px dashed ${C.primary}`
          : `0.8px solid ${C.border}`,
        borderRadius: 8,
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        position: "relative",
        cursor: isEditing ? "default" : "pointer",
        // Hover / ghost transitions
        opacity:   isGhosted ? 0.35 : 1,
        filter:    isGhosted ? "saturate(0.3)" : "none",
        transform: isHovered && !isEditing ? "scale(1.008)" : "scale(1)",
        boxShadow: isHovered && !isEditing
          ? `0 6px 24px ${C.text}18, 0 0 0 1.5px ${C.border}`
          : isEditing
          ? `0 0 0 1px ${C.primary}22, inset 0 0 0 1000px ${C.primary}03`
          : "none",
        transition: "opacity 180ms ease, filter 180ms ease, transform 180ms ease, box-shadow 180ms ease, border 150ms ease",
        zIndex: isHovered ? 2 : 1,
      }}
    >
      {/* Panel header — not shown for stat cards */}
      {!isStat && <PanelHeader title={PANEL_META[id].title} />}

      {/* Content */}
      <div className="flex-1 min-h-0 overflow-hidden">
        <PanelContent id={id} />
      </div>

      {/* ── Info tooltip overlay ── */}
      {!isEditing && <InfoOverlay id={id} visible={isActive} onClose={onCloseInfo} />}

      {/* ── Edit mode UI ── */}
      {isEditing && (
        <>
          {/* Size badge */}
          <div
            className="absolute top-2 left-2 px-1.5 py-0.5 rounded z-20"
            style={{ fontFamily: "'DM Mono', monospace", fontSize: 9, color: C.primaryFg, background: C.primary, letterSpacing: "0.04em" }}
          >
            {colSpan}×{rowSpan}
          </div>

          {/* Right-edge col-resize handle */}
          <div
            onMouseDown={(e) => { e.stopPropagation(); onStartResize(e, id, "col"); }}
            className="absolute top-0 right-0 bottom-0 flex items-center justify-center z-20"
            style={{ width: 18, cursor: "col-resize" }}
          >
            <div
              className="rounded-full"
              style={{ width: 4, height: 36, background: C.primary, opacity: 0.55 }}
              onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.opacity = "1")}
              onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.opacity = "0.55")}
            />
          </div>

          {/* Bottom-edge row-resize handle */}
          <div
            onMouseDown={(e) => { e.stopPropagation(); onStartResize(e, id, "row"); }}
            className="absolute left-0 right-0 bottom-0 flex items-center justify-center z-20"
            style={{ height: 18, cursor: "row-resize" }}
          >
            <div
              className="rounded-full"
              style={{ height: 4, width: 36, background: C.primary, opacity: 0.55 }}
              onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.opacity = "1")}
              onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.opacity = "0.55")}
            />
          </div>
        </>
      )}
    </div>
  );
}

// ─── Taskbar Button ───────────────────────────────────────────────────────────
function TaskbarBtn({
  icon: Icon,
  label,
  onClick,
  primary = false,
  active  = false,
}: {
  icon: React.ElementType;
  label: string;
  onClick?: () => void;
  primary?: boolean;
  active?:  boolean;
}) {
  return (
    <button
      onClick={onClick}
      className="flex flex-col items-center justify-center gap-1 px-4 py-1.5 rounded-md transition-all"
      style={{
        background: active  ? C.primary
                  : primary ? `${C.primary}1a`
                  : `${C.primary}0a`,
        color:      active  ? C.primaryFg
                  : primary ? C.primary
                  :           C.textMuted,
        border:     active  ? `0.8px solid ${C.primary}`
                  : primary ? `0.8px solid ${C.primary}55`
                  :           `0.8px solid transparent`,
        cursor:     "pointer",
        minWidth:   68,
      }}
    >
      <Icon size={18} strokeWidth={1.8} />
      <span
        style={{
          fontFamily:    "'DM Mono', monospace",
          fontSize:       9,
          letterSpacing: "0.05em",
          textTransform: "uppercase",
          lineHeight:     1.3,
          textAlign:     "center",
        }}
      >
        {label}
      </span>
    </button>
  );
}

// ─── App ──────────────────────────────────────────────────────────────────────
export default function App() {
  const [isEditing, setIsEditing] = useState(false);
  const [panels, setPanels]       = useState<PanelDef[]>(INIT);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [activeId, setActiveId]   = useState<string | null>(null);
  const gridRef = useRef<HTMLDivElement>(null);

  // Click: open/close info tooltip
  const handlePanelClick = useCallback(
    (e: React.MouseEvent, id: string) => {
      if (isEditing) return;
      e.stopPropagation();
      setActiveId((prev) => (prev === id ? null : id));
    },
    [isEditing]
  );

  const handleCloseInfo = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setActiveId(null);
  }, []);

  // Click on grid background dismisses any open tooltip
  const handleGridClick = useCallback(() => {
    setActiveId(null);
  }, []);

  // Drag-resize logic
  const startResize = useCallback(
    (e: React.MouseEvent, panelId: string, dir: ResizeDir) => {
      e.preventDefault();
      e.stopPropagation();

      const startPanel = panels.find((p) => p.id === panelId);
      if (!startPanel) return;

      const handleMove = (ev: MouseEvent) => {
        if (!gridRef.current) return;
        const rect = gridRef.current.getBoundingClientRect();

        if (dir === "col") {
          const colW = (rect.width - (COLS - 1) * GAP) / COLS;
          const relX = ev.clientX - rect.left;
          const nearestN = Math.round((relX + GAP) / (colW + GAP));
          const clampedN = Math.max(startPanel.colStart, Math.min(COLS, nearestN));
          const newSpan  = Math.max(1, clampedN - startPanel.colStart + 1);
          setPanels((prev) => prev.map((p) => p.id === panelId ? { ...p, colSpan: newSpan } : p));
        }

        if (dir === "row") {
          const rowBottoms: number[] = [];
          let acc = 0;
          for (let i = 0; i < ROWS; i++) {
            acc += ROW_H[i] + (i < ROWS - 1 ? GAP : 0);
            rowBottoms.push(acc);
          }
          const relY  = ev.clientY - rect.top;
          let bestR = startPanel.rowStart, bestD = Infinity;
          for (let r = startPanel.rowStart; r <= ROWS; r++) {
            const d = Math.abs(relY - rowBottoms[r - 1]);
            if (d < bestD) { bestD = d; bestR = r; }
          }
          const newSpan = Math.max(1, bestR - startPanel.rowStart + 1);
          setPanels((prev) => prev.map((p) => p.id === panelId ? { ...p, rowSpan: newSpan } : p));
        }
      };

      const handleUp = () => {
        document.removeEventListener("mousemove", handleMove);
        document.removeEventListener("mouseup", handleUp);
      };
      document.addEventListener("mousemove", handleMove);
      document.addEventListener("mouseup", handleUp);
    },
    [panels]
  );

  const toggleEdit = () => {
    setIsEditing((v) => !v);
    setActiveId(null);
    setHoveredId(null);
  };

  const anyHovered = hoveredId !== null;

  return (
    <div
      className="h-screen flex flex-col select-none"
      style={{ background: C.bg }}
    >
      {/* Edit mode banner */}
      {isEditing && (
        <div
          className="flex-none flex items-center justify-center gap-2 py-1.5"
          style={{ background: C.primary, color: C.primaryFg, fontFamily: "'DM Mono', monospace", fontSize: 11, letterSpacing: "0.06em" }}
        >
          <LayoutGrid size={13} />
          DASHBOARD EDIT MODE — drag the green handles on any panel to resize along the 12-column grid
        </div>
      )}

      {/* Bento grid area */}
      <div className="flex-1 min-h-0 overflow-auto p-4 pb-3" onClick={handleGridClick}>
        <div
          ref={gridRef}
          className="relative grid"
          style={{
            gridTemplateColumns: `repeat(${COLS}, 1fr)`,
            gridTemplateRows: ROW_H.map((h) => `${h}px`).join(" "),
            gap: GAP,
          }}
        >
          {/* Column overlay in edit mode */}
          {isEditing && (
            <div
              className="absolute inset-0 grid pointer-events-none"
              style={{ gridTemplateColumns: `repeat(${COLS}, 1fr)`, gap: GAP, zIndex: 0 }}
            >
              {Array.from({ length: COLS }).map((_, i) => (
                <div
                  key={i}
                  className="rounded-md"
                  style={{ background: `${C.primary}06`, border: `1px dashed ${C.primary}18` }}
                />
              ))}
            </div>
          )}

          {/* Panels */}
          {panels.map((panel) => {
            const isHovered = hoveredId === panel.id;
            const isGhosted = anyHovered && !isHovered && !isEditing;
            const isActive  = activeId === panel.id;
            return (
              <BentoPanel
                key={panel.id}
                panel={panel}
                isEditing={isEditing}
                isHovered={isHovered}
                isGhosted={isGhosted}
                isActive={isActive}
                onMouseEnter={() => !isEditing && setHoveredId(panel.id)}
                onMouseLeave={() => setHoveredId(null)}
                onClick={(e) => handlePanelClick(e, panel.id)}
                onCloseInfo={handleCloseInfo}
                onStartResize={startResize}
              />
            );
          })}
        </div>
      </div>

      {/* Fixed taskbar — light green, buttons equally spaced and centered */}
      <div
        className="flex-none flex items-center justify-center gap-3 px-6"
        style={{
          height: 75,
          background: C.positiveBg,
          borderTop: `0.8px solid ${C.border}`,
        }}
      >
        <TaskbarBtn icon={Settings}   label="Settings"      />
        <TaskbarBtn icon={HelpCircle} label="FAQ & Support" />
        <TaskbarBtn icon={Plus}       label="Add New Job"   primary />
        <TaskbarBtn icon={FileDown}   label="Report PDF"    />
        <TaskbarBtn
          icon={isEditing ? X : LayoutGrid}
          label={isEditing ? "Exit Edit" : "Edit Dashboard"}
          onClick={toggleEdit}
          active={isEditing}
        />
      </div>
    </div>
  );
}
