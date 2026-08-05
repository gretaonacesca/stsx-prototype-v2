import { useState, useRef, useCallback, useEffect } from "react";
import {
  Search, Plus, Settings, HelpCircle, FileDown, LayoutGrid, X,
  CheckCircle, AlertTriangle, XCircle, TrendingUp, BarChart3,
  ChevronLeft, ChevronRight, ChevronDown, Circle, Clock, ScanLine,
  Truck, Users, ArrowLeftRight, Package, Moon, Sun,
} from "lucide-react";

/** Mobile + tablet stacked layout below this width (desktop bento at ≥1024). */
const COMPACT_BREAKPOINT = 1024;

function useIsCompact() {
  const [compact, setCompact] = useState(() =>
    typeof window !== "undefined" ? window.innerWidth < COMPACT_BREAKPOINT : false
  );
  useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${COMPACT_BREAKPOINT - 1}px)`);
    const onChange = () => setCompact(mql.matches);
    onChange();
    mql.addEventListener("change", onChange);
    return () => mql.removeEventListener("change", onChange);
  }, []);
  return compact;
}

const MOBILE_WIDGET_ORDER = ["recent", "tasks", "search", "calendar", "timelines"] as const;
type MobileWidgetId = (typeof MOBILE_WIDGET_ORDER)[number];

const MOBILE_DEFAULT_OPEN: Record<MobileWidgetId, boolean> = {
  recent: true,
  tasks: true,
  search: false,
  calendar: true,
  timelines: false,
};

// ─── STSX Design Tokens (light + dark from brand palette) ─────────────────────
// Source: Figma STSX-UX colour tokens — https://www.figma.com/design/NZX7yDDzpHmYc6uwcf7ZBQ/STSX-UX?node-id=70-5180
type ColorTokens = {
  bg: string;
  surface: string;
  surfaceAlt: string;
  border: string;
  text: string;
  textSub: string;
  textMuted: string;
  primary: string;
  primaryFg: string;
  accent: string;
  warning: string;
  warningBg: string;
  danger: string;
  dangerBg: string;
  positiveBg: string;
};

const LIGHT: ColorTokens = {
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

/** Dark alternate set — from Figma node 70:5180 (UI Concept Variations dark mode) */
const DARK: ColorTokens = {
  bg:         "#131C25",
  surface:    "#1C2836",
  surfaceAlt: "#243344",
  border:     "#3A4555",
  text:       "#EAE5DE",
  textSub:    "#C2BBB4",
  textMuted:  "#8097B4",
  primary:    "#009E76",
  primaryFg:  "#FDFAF5",
  accent:     "#A8C2EA",
  warning:    "#EFA483",
  warningBg:  "#1E1008",
  danger:     "#E05A44",
  dangerBg:   "#1E0806",
  positiveBg: "#071A10",
};

const C: ColorTokens = { ...LIGHT };

function applyColorTokens(dark: boolean) {
  Object.assign(C, dark ? DARK : LIGHT);
}

// ─── Grid Constants ───────────────────────────────────────────────────────────
const COLS = 12;
const ROWS = 8;
const GAP  = 10; // px
const MIN_COL_SPAN = 1;
const MIN_ROW_SPAN = 1;

// ─── Types ────────────────────────────────────────────────────────────────────
type PanelDef = {
  id: string;
  colStart: number; colSpan: number;
  rowStart: number; rowSpan: number;
};

type ResizeEdge = "n" | "s" | "e" | "w" | "ne" | "nw" | "se" | "sw";

type WidgetTypeId =
  | "stat1" | "stat2" | "stat3" | "stat4"
  | "recent" | "search" | "tasks" | "timelines" | "calendar"
  | "active-loads" | "employees" | "import-export" | "inventory";

type WidgetCatalogEntry = {
  id: WidgetTypeId;
  title: string;
  description: string;
  blurb: string;
  defaultColSpan: number;
  defaultRowSpan: number;
  Icon: React.ElementType;
};

const WIDGET_CATALOG: WidgetCatalogEntry[] = [
  { id: "stat1", title: "Active Jobs", blurb: "KPI — jobs in production", description: "Total number of jobs currently in production across all stages — from raw material cutting through to final QC sign-off. Includes jobs on hold.", defaultColSpan: 2, defaultRowSpan: 1, Icon: BarChart3 },
  { id: "stat2", title: "Scans Today", blurb: "KPI — daily scan volume", description: "Total barcodes and QR codes scanned today across all scanner units on the floor. The pass rate reflects first-pass quality without any re-scan events.", defaultColSpan: 2, defaultRowSpan: 1, Icon: CheckCircle },
  { id: "stat3", title: "Pending Reviews", blurb: "KPI — QC backlog", description: "Parts flagged for manual quality review before they can be signed off and moved to the next stage. Items marked overdue have exceeded their review deadline.", defaultColSpan: 2, defaultRowSpan: 1, Icon: AlertTriangle },
  { id: "stat4", title: "On-Time Rate", blurb: "KPI — delivery performance", description: "Percentage of jobs delivered on or before the scheduled completion date. Calculated over a rolling 30-day window and compared to the previous period.", defaultColSpan: 2, defaultRowSpan: 1, Icon: TrendingUp },
  { id: "recent", title: "Recent Scans", blurb: "Live shop-floor scan feed", description: "Live feed of the most recent part scans from all scanner units on the shop floor, sorted newest-first. Click any row to open the full scan record and traceability chain.", defaultColSpan: 4, defaultRowSpan: 2, Icon: ScanLine },
  { id: "search", title: "Quick Search", blurb: "Search jobs, parts, customers", description: "Search across all jobs, part numbers, customers, and scan records from one place. Use the filter pills to narrow by category, or type a partial string for fuzzy matching.", defaultColSpan: 4, defaultRowSpan: 2, Icon: Search },
  { id: "tasks", title: "Today's Tasks", blurb: "Personal daily checklist", description: "Your personal task list for the current working day. High-priority items are flagged in amber. Check off tasks as you complete them — progress is saved automatically.", defaultColSpan: 4, defaultRowSpan: 2, Icon: CheckCircle },
  { id: "timelines", title: "Project Timelines", blurb: "Job progress vs schedule", description: "Gantt-style progress view for all active jobs. Progress is calculated from scanned milestones against the planned schedule. At-risk jobs are tracking behind their baseline.", defaultColSpan: 4, defaultRowSpan: 2, Icon: BarChart3 },
  { id: "calendar", title: "Calendar", blurb: "Deadlines and events", description: "Monthly overview. Job deadlines, planned site visits, compliance review dates, and team events appear as marked days. Click any date to see what is scheduled.", defaultColSpan: 4, defaultRowSpan: 2, Icon: Circle },
  { id: "active-loads", title: "Active Loads", blurb: "Loads in transit / staging", description: "Track active outbound and inbound loads — staging status, destination, and estimated departure or arrival times across the yard.", defaultColSpan: 4, defaultRowSpan: 2, Icon: Truck },
  { id: "employees", title: "Manage Employees", blurb: "Crew roster and roles", description: "View shop-floor crew, shift assignments, and role coverage. Use this panel to spot understaffed stations and reassign people quickly.", defaultColSpan: 4, defaultRowSpan: 2, Icon: Users },
  { id: "import-export", title: "Import / Export Queue", blurb: "Data sync jobs waiting", description: "Queue of pending imports and exports — nesting files, ERP sync, and label batches. Monitor failures and retry stuck jobs from here.", defaultColSpan: 4, defaultRowSpan: 2, Icon: ArrowLeftRight },
  { id: "inventory", title: "Stock & Inventory", blurb: "Levels and capacity", description: "Current stock levels against warehouse capacity. Highlights materials below reorder point and bins approaching max fill.", defaultColSpan: 4, defaultRowSpan: 2, Icon: Package },
];

const PANEL_META: Record<string, { title: string; description: string }> = Object.fromEntries(
  WIDGET_CATALOG.map((w) => [w.id, { title: w.title, description: w.description }])
);

// ─── Initial Layout (12×8) ────────────────────────────────────────────────────
const INIT: PanelDef[] = [
  { id: "stat1",     colStart: 1,  colSpan: 2, rowStart: 1, rowSpan: 2 },
  { id: "stat2",     colStart: 3,  colSpan: 2, rowStart: 1, rowSpan: 2 },
  { id: "stat3",     colStart: 5,  colSpan: 2, rowStart: 1, rowSpan: 2 },
  { id: "stat4",     colStart: 7,  colSpan: 2, rowStart: 1, rowSpan: 2 },
  { id: "timelines", colStart: 9,  colSpan: 4, rowStart: 1, rowSpan: 4 },
  { id: "recent",    colStart: 1,  colSpan: 4, rowStart: 3, rowSpan: 6 },
  { id: "search",    colStart: 5,  colSpan: 4, rowStart: 3, rowSpan: 2 },
  { id: "tasks",     colStart: 5,  colSpan: 4, rowStart: 5, rowSpan: 4 },
  { id: "calendar",  colStart: 9,  colSpan: 4, rowStart: 5, rowSpan: 4 },
];

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

function rectsOverlap(
  a: { colStart: number; colSpan: number; rowStart: number; rowSpan: number },
  b: { colStart: number; colSpan: number; rowStart: number; rowSpan: number },
) {
  return !(
    a.colStart + a.colSpan <= b.colStart ||
    b.colStart + b.colSpan <= a.colStart ||
    a.rowStart + a.rowSpan <= b.rowStart ||
    b.rowStart + b.rowSpan <= a.rowStart
  );
}

function isRectFree(
  panels: PanelDef[],
  colStart: number,
  rowStart: number,
  colSpan: number,
  rowSpan: number,
) {
  if (colStart < 1 || rowStart < 1) return false;
  if (colStart + colSpan - 1 > COLS || rowStart + rowSpan - 1 > ROWS) return false;
  const candidate = { colStart, colSpan, rowStart, rowSpan };
  return panels.every((p) => !rectsOverlap(candidate, p));
}

function getEmptyCells(panels: PanelDef[]) {
  const occupied = new Set<string>();
  for (const p of panels) {
    for (let c = p.colStart; c < p.colStart + p.colSpan; c++) {
      for (let r = p.rowStart; r < p.rowStart + p.rowSpan; r++) {
        occupied.add(`${c},${r}`);
      }
    }
  }
  const empty: { col: number; row: number }[] = [];
  for (let r = 1; r <= ROWS; r++) {
    for (let c = 1; c <= COLS; c++) {
      if (!occupied.has(`${c},${r}`)) empty.push({ col: c, row: r });
    }
  }
  return empty;
}

/** Place widget at cell, shrinking from catalog default until it fits. */
function fitNewPanel(
  panels: PanelDef[],
  id: WidgetTypeId,
  col: number,
  row: number,
): PanelDef | null {
  const entry = WIDGET_CATALOG.find((w) => w.id === id);
  if (!entry) return null;
  let colSpan = Math.min(entry.defaultColSpan, COLS - col + 1);
  let rowSpan = Math.min(entry.defaultRowSpan, ROWS - row + 1);
  while (colSpan >= 1 && rowSpan >= 1) {
    if (isRectFree(panels, col, row, colSpan, rowSpan)) {
      return { id, colStart: col, colSpan, rowStart: row, rowSpan };
    }
    if (colSpan >= rowSpan && colSpan > 1) colSpan -= 1;
    else if (rowSpan > 1) rowSpan -= 1;
    else break;
  }
  return null;
}

/** Map pointer X to nearest vertical grid line (1 … COLS+1). */
function nearestColLine(relX: number, gridW: number) {
  const cell = (gridW - (COLS - 1) * GAP) / COLS + GAP;
  return clamp(Math.round(relX / cell) + 1, 1, COLS + 1);
}

/** Map pointer Y to nearest horizontal grid line (1 … ROWS+1). */
function nearestRowLine(relY: number, gridH: number) {
  const cell = (gridH - (ROWS - 1) * GAP) / ROWS + GAP;
  return clamp(Math.round(relY / cell) + 1, 1, ROWS + 1);
}

function applyResize(panel: PanelDef, edge: ResizeEdge, colLine: number, rowLine: number): PanelDef {
  let { colStart, colSpan, rowStart, rowSpan } = panel;
  const colEnd = colStart + colSpan;
  const rowEnd = rowStart + rowSpan;

  if (edge.includes("e")) {
    const nextEnd = clamp(colLine, colStart + MIN_COL_SPAN, COLS + 1);
    colSpan = nextEnd - colStart;
  }
  if (edge.includes("w")) {
    const nextStart = clamp(colLine, 1, colEnd - MIN_COL_SPAN);
    colSpan = colEnd - nextStart;
    colStart = nextStart;
  }
  if (edge.includes("s")) {
    const nextEnd = clamp(rowLine, rowStart + MIN_ROW_SPAN, ROWS + 1);
    rowSpan = nextEnd - rowStart;
  }
  if (edge.includes("n")) {
    const nextStart = clamp(rowLine, 1, rowEnd - MIN_ROW_SPAN);
    rowSpan = rowEnd - nextStart;
    rowStart = nextStart;
  }

  return { ...panel, colStart, colSpan, rowStart, rowSpan };
}

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

type TaskStatus = "todo" | "progress" | "done";

const INIT_TASKS: { id: number; status: TaskStatus; text: string; priority: "high" | "normal" }[] = [
  { id: 1, status: "todo",     text: "Review PT-1042-A inspection report",  priority: "high"   },
  { id: 2, status: "todo",     text: "Sign off SC-2840 batch",               priority: "normal" },
  { id: 3, status: "done",     text: "Update material certs for J-0912",     priority: "normal" },
  { id: 4, status: "todo",     text: "Call supplier re: delayed shipment",   priority: "high"   },
  { id: 5, status: "todo",     text: "Submit weekly compliance report",       priority: "normal" },
  { id: 6, status: "todo",     text: "Calibration check — scanner unit 3",  priority: "normal" },
  { id: 7, status: "done",     text: "Archive SC-2800 to SC-2830 records",   priority: "normal" },
  { id: 8, status: "todo",     text: "Review and approve quotes for J-1056", priority: "normal" },
];

const TASK_STATUS_CYCLE: Record<TaskStatus, TaskStatus> = {
  todo: "progress",
  progress: "done",
  done: "todo",
};

const PROJECTS = [
  { name: "J-0912  Steel Frame", progress: 80, due: "Aug 15", status: "on-track" },
  { name: "J-1034  Purlin Set",  progress: 52, due: "Aug 28", status: "on-track" },
  { name: "J-1056  Quote Prep",  progress: 20, due: "Aug  8", status: "at-risk"  },
];

const ACTIVE_LOADS = [
  {
    id: "LD-4412",
    dest: "Bal Harbour Site",
    status: "Staging",
    eta: "14:20",
    shipFrom: "Shop Dock A",
    truck: "TRK-18",
    driver: "M. Ortiz",
    weightLbs: "42,800",
    pieces: 128,
    piecemarks: [
      { mark: "B-1042-A", qty: 24, desc: "Beam Flange" },
      { mark: "GP-0672", qty: 40, desc: "Gusset Plate" },
      { mark: "EP-0442", qty: 64, desc: "End Plate 20 mm" },
    ],
    notes: "Hold for QC sign-off on EP-0442 before release.",
  },
  {
    id: "LD-4418",
    dest: "Yard Bay 3",
    status: "Loading",
    eta: "15:05",
    shipFrom: "Cut Line",
    truck: "TRK-04",
    driver: "J. Brooks",
    weightLbs: "18,240",
    pieces: 56,
    piecemarks: [
      { mark: "W12-58", qty: 12, desc: "W12×58 Beam" },
      { mark: "PLT-16", qty: 44, desc: "Plate 16 mm" },
    ],
    notes: "Internal transfer — no BOL required.",
  },
  {
    id: "LD-4421",
    dest: "Port Melbourne",
    status: "In transit",
    eta: "16:40",
    shipFrom: "Yard Bay 1",
    truck: "TRK-22",
    driver: "A. Nguyen",
    weightLbs: "61,100",
    pieces: 210,
    piecemarks: [
      { mark: "COL-C1", qty: 8, desc: "Column Cap" },
      { mark: "BR-L75", qty: 96, desc: "Angle Brace L75" },
      { mark: "BP-25", qty: 106, desc: "Baseplate 25 mm" },
    ],
    notes: "Customer delivery window 16:00–17:30.",
  },
  {
    id: "LD-4427",
    dest: "Shop Dock B",
    status: "Arriving",
    eta: "13:55",
    shipFrom: "Supplier — Apex Steel",
    truck: "EXT-903",
    driver: "External",
    weightLbs: "9,640",
    pieces: 32,
    piecemarks: [
      { mark: "IN-HEAT", qty: 32, desc: "Inbound plate pack" },
    ],
    notes: "Inbound material — verify heat certs on arrival.",
  },
];

type ActiveLoad = (typeof ACTIVE_LOADS)[number];

const EMPLOYEES = [
  { name: "A. Nguyen", role: "Fitter", station: "Bay 2", shift: "Day" },
  { name: "M. Ortiz", role: "Welder", station: "Bay 5", shift: "Day" },
  { name: "S. Patel", role: "QC", station: "Inspect", shift: "Day" },
  { name: "J. Brooks", role: "Crane", station: "Yard", shift: "Swing" },
  { name: "L. Chen", role: "Saw", station: "Cut line", shift: "Day" },
];

const IMPORT_EXPORT_QUEUE = [
  { id: "IE-901", type: "Import", name: "Nesting batch 14", status: "Queued" },
  { id: "IE-902", type: "Export", name: "ERP job sync", status: "Running" },
  { id: "IE-903", type: "Import", name: "Heat certs PDF", status: "Failed" },
  { id: "IE-904", type: "Export", name: "Label batch L-22", status: "Queued" },
];

const INVENTORY_STOCK = [
  { sku: "PLT-20", name: "Plate 20 mm", level: 72, capacity: 100 },
  { sku: "IBEAM-W12", name: "W12×58 Beam", level: 18, capacity: 40 },
  { sku: "BOLT-M20", name: "M20 Bolt kit", level: 9, capacity: 120 },
  { sku: "GUSSET-A", name: "Gusset A", level: 54, capacity: 60 },
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
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, status: TASK_STATUS_CYCLE[t.status] } : t))
    );
  return (
    <div className="flex flex-col overflow-hidden h-full">
      <div
        className="flex-none flex items-center justify-between px-4 py-2"
        style={{ borderBottom: `0.8px solid ${C.border}`, background: C.surfaceAlt }}
      >
        <span style={{ fontFamily: "'Lato', sans-serif", fontSize: 11, color: C.textMuted }}>
          {tasks.filter((t) => t.status === "done").length}/{tasks.length} complete
        </span>
        <button
          className="flex items-center gap-1 px-2 py-1 rounded"
          style={{ fontFamily: "'Lato', sans-serif", fontSize: 11, color: C.primary, background: C.positiveBg, border: `0.8px solid ${C.border}`, cursor: "pointer" }}
        >
          <Plus size={11} /> Add task
        </button>
      </div>
      <div className="flex-1 overflow-y-auto">
        {tasks.map((t) => {
          const isDone = t.status === "done";
          const isProgress = t.status === "progress";
          return (
            <div key={t.id} className="flex items-start gap-3 px-4 py-2.5" style={{ borderBottom: `0.8px solid ${C.border}` }}>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  toggle(t.id);
                }}
                className="mt-0.5 flex-none"
                style={{
                  cursor: "pointer",
                  color: isDone ? C.primary : isProgress ? C.warning : C.border,
                  lineHeight: 0,
                }}
                title={isDone ? "Done" : isProgress ? "In progress" : "To do"}
                aria-label={isDone ? "Mark to do" : isProgress ? "Mark done" : "Mark in progress"}
              >
                {isDone ? <CheckCircle size={14} /> : isProgress ? <Clock size={14} /> : <Circle size={14} />}
              </button>
              <span style={{ fontFamily: "'Lato', sans-serif", fontSize: 12, color: isDone ? C.textMuted : C.text, textDecoration: isDone ? "line-through" : "none", flex: 1, lineHeight: 1.5 }}>
                {t.text}
              </span>
              {t.priority === "high" && !isDone && (
                <span className="flex-none px-1.5 py-0.5 rounded" style={{ fontFamily: "'DM Mono', monospace", fontSize: 9, color: C.warning, background: C.warningBg, border: `0.8px solid ${C.warning}44` }}>
                  HIGH
                </span>
              )}
            </div>
          );
        })}
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

function ActiveLoadsContent({
  selectedKey,
  onSelect,
}: {
  selectedKey?: string | null;
  onSelect?: (key: string) => void;
} = {}) {
  return (
    <div className="flex flex-col overflow-hidden h-full">
      {ACTIVE_LOADS.map((l, i) => {
        const selected = selectedKey === l.id;
        return (
          <div
            key={l.id}
            role={onSelect ? "button" : undefined}
            tabIndex={onSelect ? 0 : undefined}
            onClick={onSelect ? () => onSelect(l.id) : undefined}
            onKeyDown={onSelect ? (e) => { if (e.key === "Enter" || e.key === " ") onSelect(l.id); } : undefined}
            className="flex items-center gap-2 px-4 py-2.5"
            style={{
              borderBottom: `0.8px solid ${C.border}`,
              background: selected ? `${C.primary}18` : i % 2 === 0 ? "transparent" : `${C.surfaceAlt}55`,
              cursor: onSelect ? "pointer" : "default",
              outline: selected ? `1px solid ${C.primary}44` : "none",
            }}
          >
            <Truck size={14} color={C.primary} />
            <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 11, color: C.primary, width: 64 }}>{l.id}</span>
            <span className="flex-1 truncate" style={{ fontFamily: "'Lato', sans-serif", fontSize: 12, color: C.text }}>{l.dest}</span>
            <span className="px-1.5 py-0.5 rounded" style={{ fontFamily: "'DM Mono', monospace", fontSize: 9, color: C.primary, background: C.positiveBg }}>{l.status}</span>
            <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 10, color: C.textMuted }}>{l.eta}</span>
          </div>
        );
      })}
    </div>
  );
}

function EmployeesContent({
  selectedKey,
  onSelect,
}: {
  selectedKey?: string | null;
  onSelect?: (key: string) => void;
} = {}) {
  return (
    <div className="flex flex-col overflow-hidden h-full">
      <div className="flex-none flex px-4 py-1.5" style={{ borderBottom: `0.8px solid ${C.border}`, background: C.surfaceAlt }}>
        {["Name", "Role", "Station", "Shift"].map((h) => (
          <div key={h} className="flex-1" style={{ fontFamily: "'DM Mono', monospace", fontSize: 9, color: C.textMuted, textTransform: "uppercase" }}>{h}</div>
        ))}
      </div>
      <div className="flex-1 overflow-y-auto">
        {EMPLOYEES.map((e, i) => {
          const selected = selectedKey === e.name;
          return (
            <div
              key={e.name}
              role={onSelect ? "button" : undefined}
              onClick={onSelect ? () => onSelect(e.name) : undefined}
              className="flex px-4 py-2"
              style={{
                borderBottom: `0.8px solid ${C.border}`,
                background: selected ? `${C.primary}18` : i % 2 === 0 ? "transparent" : `${C.surfaceAlt}55`,
                cursor: onSelect ? "pointer" : "default",
              }}
            >
              <div className="flex-1" style={{ fontFamily: "'Lato', sans-serif", fontSize: 12, color: C.text }}>{e.name}</div>
              <div className="flex-1" style={{ fontFamily: "'Lato', sans-serif", fontSize: 12, color: C.textSub }}>{e.role}</div>
              <div className="flex-1" style={{ fontFamily: "'DM Mono', monospace", fontSize: 11, color: C.textMuted }}>{e.station}</div>
              <div className="flex-1" style={{ fontFamily: "'DM Mono', monospace", fontSize: 11, color: C.primary }}>{e.shift}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function ImportExportContent({
  selectedKey,
  onSelect,
}: {
  selectedKey?: string | null;
  onSelect?: (key: string) => void;
} = {}) {
  return (
    <div className="flex flex-col overflow-hidden h-full">
      {IMPORT_EXPORT_QUEUE.map((q, i) => {
        const selected = selectedKey === q.id;
        return (
          <div
            key={q.id}
            role={onSelect ? "button" : undefined}
            onClick={onSelect ? () => onSelect(q.id) : undefined}
            className="flex items-center gap-2 px-4 py-2.5"
            style={{
              borderBottom: `0.8px solid ${C.border}`,
              background: selected ? `${C.primary}18` : i % 2 === 0 ? "transparent" : `${C.surfaceAlt}55`,
              cursor: onSelect ? "pointer" : "default",
            }}
          >
            <ArrowLeftRight size={14} color={C.textMuted} />
            <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 10, color: C.primary, width: 52 }}>{q.id}</span>
            <span className="px-1.5 py-0.5 rounded" style={{ fontFamily: "'DM Mono', monospace", fontSize: 9, color: C.textMuted, background: C.surfaceAlt }}>{q.type}</span>
            <span className="flex-1 truncate" style={{ fontFamily: "'Lato', sans-serif", fontSize: 12, color: C.text }}>{q.name}</span>
            <span
              className="px-1.5 py-0.5 rounded"
              style={{
                fontFamily: "'DM Mono', monospace",
                fontSize: 9,
                color: q.status === "Failed" ? C.danger : q.status === "Running" ? C.primary : C.textMuted,
                background: q.status === "Failed" ? C.dangerBg : q.status === "Running" ? C.positiveBg : C.surfaceAlt,
              }}
            >
              {q.status}
            </span>
          </div>
        );
      })}
    </div>
  );
}

function InventoryContent({
  selectedKey,
  onSelect,
}: {
  selectedKey?: string | null;
  onSelect?: (key: string) => void;
} = {}) {
  return (
    <div className="flex flex-col gap-0 overflow-hidden h-full px-4 py-2">
      {INVENTORY_STOCK.map((s) => {
        const pct = Math.round((s.level / s.capacity) * 100);
        const low = pct < 25;
        const high = pct > 85;
        const selected = selectedKey === s.sku;
        return (
          <div
            key={s.sku}
            role={onSelect ? "button" : undefined}
            onClick={onSelect ? () => onSelect(s.sku) : undefined}
            className="py-2.5 px-1 rounded"
            style={{
              borderBottom: `0.8px solid ${C.border}`,
              background: selected ? `${C.primary}12` : "transparent",
              cursor: onSelect ? "pointer" : "default",
            }}
          >
            <div className="flex items-center justify-between mb-1.5">
              <div>
                <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 10, color: C.primary }}>{s.sku}</span>
                <span className="ml-2" style={{ fontFamily: "'Lato', sans-serif", fontSize: 12, color: C.text }}>{s.name}</span>
              </div>
              <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 10, color: low ? C.danger : high ? C.warning : C.textMuted }}>
                {s.level}/{s.capacity}
              </span>
            </div>
            <div className="h-1.5 rounded-full overflow-hidden" style={{ background: C.surfaceAlt, border: `0.8px solid ${C.border}` }}>
              <div
                className="h-full rounded-full"
                style={{ width: `${pct}%`, background: low ? C.danger : high ? C.warning : C.primary }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

function PanelContent({
  id,
  selectedKey,
  onSelect,
}: {
  id: string;
  selectedKey?: string | null;
  onSelect?: (key: string) => void;
}) {
  if (id.startsWith("stat")) return <StatContent id={id} />;
  if (id === "recent")         return <RecentScansContent />;
  if (id === "search")         return <QuickSearchContent />;
  if (id === "tasks")          return <TasksContent />;
  if (id === "timelines")      return <TimelinesContent />;
  if (id === "calendar")       return <CalendarContent />;
  if (id === "active-loads")   return <ActiveLoadsContent selectedKey={selectedKey} onSelect={onSelect} />;
  if (id === "employees")      return <EmployeesContent selectedKey={selectedKey} onSelect={onSelect} />;
  if (id === "import-export")  return <ImportExportContent selectedKey={selectedKey} onSelect={onSelect} />;
  if (id === "inventory")      return <InventoryContent selectedKey={selectedKey} onSelect={onSelect} />;
  return null;
}

// ─── Widget detail popup (left: widget, right: related tabs) ───────────────────
type DetailTab = { id: string; label: string };

const WIDGET_DETAIL_TABS: Record<string, DetailTab[]> = {
  "active-loads": [
    { id: "info", label: "Load Information" },
    { id: "status", label: "Status Summary Info" },
    { id: "piecemark", label: "Piecemark Info" },
  ],
  employees: [
    { id: "profile", label: "Profile" },
    { id: "assign", label: "Assignments" },
    { id: "avail", label: "Availability" },
  ],
  "import-export": [
    { id: "detail", label: "Job Detail" },
    { id: "logs", label: "Logs" },
    { id: "retry", label: "Retry / Actions" },
  ],
  inventory: [
    { id: "item", label: "Item Detail" },
    { id: "reorder", label: "Reorder" },
    { id: "capacity", label: "Capacity" },
  ],
  recent: [
    { id: "scan", label: "Scan Detail" },
    { id: "trace", label: "Traceability" },
    { id: "qc", label: "QC Notes" },
  ],
  tasks: [
    { id: "task", label: "Task Detail" },
    { id: "notes", label: "Notes" },
    { id: "links", label: "Linked Jobs" },
  ],
  timelines: [
    { id: "schedule", label: "Schedule" },
    { id: "milestones", label: "Milestones" },
    { id: "risk", label: "Risk" },
  ],
  calendar: [
    { id: "events", label: "Day Events" },
    { id: "add", label: "Add Event" },
    { id: "reminders", label: "Reminders" },
  ],
  search: [
    { id: "results", label: "Results" },
    { id: "filters", label: "Filters" },
    { id: "history", label: "History" },
  ],
  default: [
    { id: "overview", label: "Overview" },
    { id: "details", label: "Details" },
    { id: "actions", label: "Actions" },
  ],
};

function detailField(label: string, value: string) {
  return (
    <div className="flex flex-col gap-1">
      <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 9, color: C.textMuted, textTransform: "uppercase", letterSpacing: "0.05em" }}>
        {label}
      </span>
      <span style={{ fontFamily: "'Lato', sans-serif", fontSize: 13, color: C.text }}>{value || "—"}</span>
    </div>
  );
}

function LoadInfoRow({
  label,
  children,
  trailing,
  highlight = false,
}: {
  label: string;
  children: React.ReactNode;
  trailing?: React.ReactNode;
  highlight?: boolean;
}) {
  return (
    <div className="flex items-center gap-3">
      <label
        className="shrink-0 text-right"
        style={{
          width: 118,
          fontFamily: "'Lato', sans-serif",
          fontSize: 12,
          color: C.textSub,
        }}
      >
        {label}
      </label>
      <div className="flex-1 min-w-0 flex items-center gap-3">
        <div
          className="flex-1 min-w-0"
          style={{
            background: C.surfaceAlt,
            border: `1px solid ${C.border}`,
            borderRadius: 4,
            height: 28,
            display: "flex",
            alignItems: "center",
            padding: "0 8px",
          }}
        >
          {children}
        </div>
        {trailing}
      </div>
    </div>
  );
}

function LoadInfoSelect({
  value,
  options,
}: {
  value: string;
  options?: string[];
}) {
  return (
    <select
      defaultValue={value}
      style={{
        width: "100%",
        height: "100%",
        border: "none",
        background: "transparent",
        outline: "none",
        fontFamily: "'Lato', sans-serif",
        fontSize: 12,
        color: C.text,
        cursor: "pointer",
      }}
    >
      {(options ?? [value, ""]).filter((o, i, arr) => arr.indexOf(o) === i).map((o) => (
        <option key={o || "__empty"} value={o}>{o || " "}</option>
      ))}
    </select>
  );
}

function LoadInfoInput({ value }: { value: string }) {
  return (
    <input
      defaultValue={value}
      style={{
        width: "100%",
        height: "100%",
        border: "none",
        background: "transparent",
        outline: "none",
        fontFamily: "'Lato', sans-serif",
        fontSize: 12,
        color: C.text,
      }}
    />
  );
}

function ActiveLoadInformationForm({ load }: { load: ActiveLoad }) {
  const jobNumber = load.id.replace("LD-", "J-");
  const totalMarks = load.piecemarks.length;
  const totalPieces = load.pieces;
  const [hideEmpty, setHideEmpty] = useState(false);
  const [includeMinor, setIncludeMinor] = useState(false);

  const fieldStyle = {
    fontFamily: "'Lato', sans-serif" as const,
    fontSize: 12,
    color: C.textSub,
  };

  return (
    <div className="h-full overflow-y-auto p-4" style={{ background: C.surface }}>
      <div className="flex flex-col gap-2 max-w-3xl">
        <LoadInfoRow label="Job Number" highlight>
          <LoadInfoSelect value={jobNumber} options={[jobNumber, "J-0912", "J-1034", "J-1056"]} />
        </LoadInfoRow>
        <LoadInfoRow label="Job Title">
          <LoadInfoInput value={load.dest.includes("Bal") ? "Bal Harbour Shops - Expansion" : `${load.dest} Job`} />
        </LoadInfoRow>
        <LoadInfoRow label="Customer #">
          <LoadInfoSelect value="P2PROG" options={["P2PROG", "ACME01", "SITE22"]} />
        </LoadInfoRow>
        <LoadInfoRow label="Customer Name">
          <LoadInfoInput value="P2 Programs" />
        </LoadInfoRow>
        <LoadInfoRow
          label="Location"
          trailing={
            <label className="flex items-center gap-1.5 shrink-0 whitespace-nowrap" style={fieldStyle}>
              <input type="checkbox" checked={hideEmpty} onChange={(e) => setHideEmpty(e.target.checked)} />
              Hide Empty Columns
            </label>
          }
        >
          <LoadInfoSelect value={load.dest} options={[load.dest, "Shop Dock A", "Yard Bay 3", "Port Melbourne"]} />
        </LoadInfoRow>
        <LoadInfoRow label="Parent Piecemark">
          <LoadInfoSelect value={load.piecemarks[0]?.mark ?? ""} options={["", ...load.piecemarks.map((p) => p.mark)]} />
        </LoadInfoRow>
        <LoadInfoRow label="Status">
          <LoadInfoSelect value={load.status} options={["Staging", "Loading", "In transit", "Arriving", "Delivered", "On hold"]} />
        </LoadInfoRow>
        <LoadInfoRow label="Sheet #">
          <LoadInfoSelect value="" options={["", "S-01", "S-02", "S-03"]} />
        </LoadInfoRow>
        <LoadInfoRow label="Seq #">
          <LoadInfoSelect value="" options={["", "1", "2", "3", "4"]} />
        </LoadInfoRow>
        <LoadInfoRow label="Lot #">
          <LoadInfoSelect value="" options={["", "LOT-A", "LOT-B"]} />
        </LoadInfoRow>
        <LoadInfoRow label="Bndl #">
          <LoadInfoSelect value="" options={["", "BND-1", "BND-2"]} />
        </LoadInfoRow>
        <LoadInfoRow label="Load #">
          <LoadInfoSelect value={load.id} options={ACTIVE_LOADS.map((l) => l.id)} />
        </LoadInfoRow>
        <LoadInfoRow
          label="Load Rel"
          trailing={
            <label className="flex items-center gap-1.5 shrink-0 whitespace-nowrap" style={fieldStyle}>
              <input type="checkbox" checked={includeMinor} onChange={(e) => setIncludeMinor(e.target.checked)} />
              Include Minor Marks
            </label>
          }
        >
          <LoadInfoSelect value="" options={["", "REL-1", "REL-2"]} />
        </LoadInfoRow>
        <LoadInfoRow label="Shop Order #">
          <LoadInfoSelect value="" options={["", "SO-2201", "SO-2208"]} />
        </LoadInfoRow>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto] gap-4 items-end mt-1">
          <div className="flex flex-col gap-2">
            <LoadInfoRow label="ID number">
              <LoadInfoSelect value="" options={["", "ID-1001", "ID-1002"]} />
            </LoadInfoRow>
            <LoadInfoRow label="Pc Release">
              <LoadInfoSelect value="" options={["", "PR-01", "PR-02"]} />
            </LoadInfoRow>
            <LoadInfoRow label="Pkg #">
              <LoadInfoSelect value="" options={["", "PKG-1", "PKG-2"]} />
            </LoadInfoRow>
            <LoadInfoRow label="Batch">
              <LoadInfoSelect value="" options={["", "BATCH-A", "BATCH-B"]} />
            </LoadInfoRow>
            <LoadInfoRow label="COW Code">
              <LoadInfoSelect value="" options={["", "COW-01", "COW-02"]} />
            </LoadInfoRow>
          </div>

          <div className="flex flex-col gap-1.5 pb-1 min-w-[200px]" style={{ fontFamily: "'Lato', sans-serif", fontSize: 12, color: C.textSub }}>
            <div className="flex justify-between gap-4"><span>Bar Code ID Numbers:</span><span style={{ fontFamily: "'DM Mono', monospace" }}>{totalMarks}</span></div>
            <div className="flex justify-between gap-4"><span>Total Pieces:</span><span style={{ fontFamily: "'DM Mono', monospace" }}>{totalPieces}</span></div>
            <div className="flex justify-between gap-4"><span>Total Weight:</span><span style={{ fontFamily: "'DM Mono', monospace" }}>{load.weightLbs}</span></div>
            <div className="flex justify-between gap-4"><span>Number of Piece Marks:</span><span style={{ fontFamily: "'DM Mono', monospace" }}>{totalMarks}</span></div>
          </div>
        </div>

        <div className="flex flex-wrap justify-end gap-2 mt-4 pt-3" style={{ borderTop: `1px solid ${C.border}` }}>
          {[
            { label: "Get Information", primary: false },
            { label: "Browse", primary: false },
            { label: "Clear", primary: true },
            { label: "Close", primary: true },
          ].map((btn) => (
            <button
              key={btn.label}
              type="button"
              className="px-3 py-1.5 rounded-sm"
              style={{
                fontFamily: "'Lato', sans-serif",
                fontSize: 12,
                minWidth: 110,
                cursor: "pointer",
                background: btn.primary ? C.primary : C.surfaceAlt,
                color: btn.primary ? C.primaryFg : C.textMuted,
                border: `1px solid ${btn.primary ? C.primary : C.border}`,
              }}
            >
              {btn.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function WidgetDetailTabBody({
  widgetId,
  tabId,
  selectedKey,
}: {
  widgetId: string;
  tabId: string;
  selectedKey: string | null;
}) {
  if (!selectedKey && !widgetId.startsWith("stat") && widgetId !== "search" && widgetId !== "calendar") {
    return (
      <div className="flex items-center justify-center h-full px-6 text-center">
        <p style={{ fontFamily: "'Lato', sans-serif", fontSize: 13, color: C.textMuted, lineHeight: 1.6 }}>
          Select an item in the list on the left to view and edit related details here.
        </p>
      </div>
    );
  }

  if (widgetId === "active-loads") {
    const load = ACTIVE_LOADS.find((l) => l.id === selectedKey);
    if (!load) return null;
    if (tabId === "info") {
      return <ActiveLoadInformationForm load={load} />;
    }
    if (tabId === "status") {
      return (
        <div className="flex flex-col gap-3 p-4 max-w-md">
          <label className="flex flex-col gap-1">
            <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 9, color: C.textMuted, textTransform: "uppercase" }}>Status</span>
            <select defaultValue={load.status} style={{ height: 36, borderRadius: 6, border: `1px solid ${C.border}`, background: C.surfaceAlt, padding: "0 10px", fontFamily: "'Lato', sans-serif", fontSize: 13 }}>
              {["Staging", "Loading", "In transit", "Arriving", "Delivered", "On hold"].map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-1">
            <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 9, color: C.textMuted, textTransform: "uppercase" }}>ETA</span>
            <input defaultValue={load.eta} style={{ height: 36, borderRadius: 6, border: `1px solid ${C.border}`, background: C.surfaceAlt, padding: "0 10px", fontFamily: "'Lato', sans-serif", fontSize: 13 }} />
          </label>
          <label className="flex flex-col gap-1">
            <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 9, color: C.textMuted, textTransform: "uppercase" }}>Status note</span>
            <textarea defaultValue={load.notes} rows={4} style={{ borderRadius: 6, border: `1px solid ${C.border}`, background: C.surfaceAlt, padding: 10, fontFamily: "'Lato', sans-serif", fontSize: 13, resize: "vertical" }} />
          </label>
          <button type="button" className="self-start px-3 py-1.5 rounded-md" style={{ background: C.primary, color: C.primaryFg, border: "none", fontFamily: "'DM Mono', monospace", fontSize: 10, cursor: "pointer" }}>
            Save Status
          </button>
        </div>
      );
    }
    if (tabId === "piecemark") {
      return (
        <div className="flex flex-col h-full overflow-hidden">
          <div className="flex-none flex px-4 py-2" style={{ borderBottom: `0.8px solid ${C.border}`, background: C.surfaceAlt }}>
            {["Mark", "Qty", "Description"].map((h) => (
              <div key={h} className={h === "Description" ? "flex-1" : "w-24"} style={{ fontFamily: "'DM Mono', monospace", fontSize: 9, color: C.textMuted, textTransform: "uppercase" }}>{h}</div>
            ))}
          </div>
          <div className="flex-1 overflow-y-auto">
            {load.piecemarks.map((pm, i) => (
              <div key={pm.mark} className="flex px-4 py-2.5" style={{ borderBottom: `0.8px solid ${C.border}`, background: i % 2 ? `${C.surfaceAlt}55` : "transparent" }}>
                <div className="w-24" style={{ fontFamily: "'DM Mono', monospace", fontSize: 11, color: C.primary }}>{pm.mark}</div>
                <div className="w-24" style={{ fontFamily: "'DM Mono', monospace", fontSize: 11, color: C.textMuted }}>{pm.qty}</div>
                <div className="flex-1" style={{ fontFamily: "'Lato', sans-serif", fontSize: 12, color: C.text }}>{pm.desc}</div>
              </div>
            ))}
          </div>
        </div>
      );
    }
  }

  if (widgetId === "employees") {
    const emp = EMPLOYEES.find((e) => e.name === selectedKey);
    if (!emp) return null;
    if (tabId === "profile") {
      return <div className="grid grid-cols-2 gap-4 p-4">{detailField("Name", emp.name)}{detailField("Role", emp.role)}{detailField("Station", emp.station)}{detailField("Shift", emp.shift)}</div>;
    }
    if (tabId === "assign") {
      return <div className="p-4"><p style={{ fontFamily: "'Lato', sans-serif", fontSize: 13, color: C.textSub, lineHeight: 1.6 }}>{emp.name} is assigned to <strong>{emp.station}</strong> as {emp.role} for the {emp.shift} shift.</p></div>;
    }
    return <div className="p-4"><p style={{ fontFamily: "'Lato', sans-serif", fontSize: 13, color: C.textSub }}>Availability: On shift · no leave requests.</p></div>;
  }

  if (widgetId === "inventory") {
    const item = INVENTORY_STOCK.find((s) => s.sku === selectedKey);
    if (!item) return null;
    const pct = Math.round((item.level / item.capacity) * 100);
    if (tabId === "item") return <div className="grid grid-cols-2 gap-4 p-4">{detailField("SKU", item.sku)}{detailField("Name", item.name)}{detailField("On hand", String(item.level))}{detailField("Capacity", String(item.capacity))}{detailField("Fill", `${pct}%`)}</div>;
    if (tabId === "reorder") return <div className="p-4 flex flex-col gap-3"><p style={{ fontFamily: "'Lato', sans-serif", fontSize: 13, color: C.textSub }}>Reorder point: {Math.round(item.capacity * 0.25)}. Suggested order: {Math.max(0, Math.round(item.capacity * 0.6) - item.level)} units.</p><button type="button" className="self-start px-3 py-1.5 rounded-md" style={{ background: C.primary, color: C.primaryFg, fontFamily: "'DM Mono', monospace", fontSize: 10, border: "none", cursor: "pointer" }}>Create PO</button></div>;
    return <div className="p-4"><p style={{ fontFamily: "'Lato', sans-serif", fontSize: 13, color: C.textSub }}>Bin capacity utilization is {pct}%. {pct > 85 ? "Near max — consider relocating overflow." : pct < 25 ? "Below reorder threshold." : "Within normal range."}</p></div>;
  }

  if (widgetId === "import-export") {
    const job = IMPORT_EXPORT_QUEUE.find((q) => q.id === selectedKey);
    if (!job) return null;
    if (tabId === "detail") return <div className="grid grid-cols-2 gap-4 p-4">{detailField("ID", job.id)}{detailField("Type", job.type)}{detailField("Name", job.name)}{detailField("Status", job.status)}</div>;
    if (tabId === "logs") return <div className="p-4"><p style={{ fontFamily: "'DM Mono', monospace", fontSize: 11, color: C.textMuted, lineHeight: 1.8 }}>[{job.id}] queued<br />[{job.id}] worker claimed<br />[{job.id}] {job.status.toLowerCase()}</p></div>;
    return <div className="p-4 flex gap-2"><button type="button" className="px-3 py-1.5 rounded-md" style={{ background: C.primary, color: C.primaryFg, fontFamily: "'DM Mono', monospace", fontSize: 10, border: "none", cursor: "pointer" }}>Retry</button><button type="button" className="px-3 py-1.5 rounded-md" style={{ background: C.surfaceAlt, color: C.textMuted, fontFamily: "'DM Mono', monospace", fontSize: 10, border: `1px solid ${C.border}`, cursor: "pointer" }}>Cancel</button></div>;
  }

  const meta = PANEL_META[widgetId];
  return (
    <div className="p-4 flex flex-col gap-3">
      <p style={{ fontFamily: "'Lato', sans-serif", fontSize: 13, color: C.textSub, lineHeight: 1.7 }}>
        {meta?.description ?? "Related details for this widget."}
      </p>
      {selectedKey && detailField("Selected", selectedKey)}
      <p style={{ fontFamily: "'DM Mono', monospace", fontSize: 10, color: C.textMuted, textTransform: "uppercase" }}>
        Tab: {tabId}
      </p>
    </div>
  );
}

function WidgetDetailModal({
  open,
  widgetId,
  isCompact,
  onClose,
}: {
  open: boolean;
  widgetId: string | null;
  isCompact: boolean;
  onClose: () => void;
}) {
  const [tabId, setTabId] = useState("info");
  const [selectedKey, setSelectedKey] = useState<string | null>(null);

  useEffect(() => {
    if (!open || !widgetId) return;
    const tabs = WIDGET_DETAIL_TABS[widgetId] ?? WIDGET_DETAIL_TABS.default;
    setTabId(tabs[0].id);
    setSelectedKey(
      widgetId === "active-loads" ? ACTIVE_LOADS[0]?.id ?? null
        : widgetId === "employees" ? EMPLOYEES[0]?.name ?? null
        : widgetId === "inventory" ? INVENTORY_STOCK[0]?.sku ?? null
        : widgetId === "import-export" ? IMPORT_EXPORT_QUEUE[0]?.id ?? null
        : null
    );
  }, [open, widgetId]);

  useEffect(() => {
    if (!open) return;
    const onKey = (ev: KeyboardEvent) => {
      if (ev.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open || !widgetId) return null;

  const meta = PANEL_META[widgetId];
  const tabs = WIDGET_DETAIL_TABS[widgetId] ?? WIDGET_DETAIL_TABS.default;
  const selectable = ["active-loads", "employees", "inventory", "import-export"].includes(widgetId);

  return (
    <div
      className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center"
      style={{ background: "transparent" }}
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="w-full overflow-hidden flex flex-col"
        style={{
          maxWidth: isCompact ? "100%" : 1080,
          height: isCompact ? "90vh" : "min(780px, 88vh)",
          background: C.surface,
          border: `1px solid ${C.border}`,
          borderRadius: isCompact ? "16px 16px 0 0" : 12,
          boxShadow: `0 24px 60px ${C.text}14`,
          margin: isCompact ? 0 : 20,
        }}
      >
        <div
          className="flex-none flex items-center justify-between px-4 py-3"
          style={{ background: C.primary, color: C.primaryFg }}
        >
          <span style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 600, fontSize: 18 }}>
            {meta?.title ?? widgetId}
          </span>
          <button type="button" onClick={onClose} style={{ color: C.primaryFg, cursor: "pointer", lineHeight: 0 }}>
            <X size={18} />
          </button>
        </div>

        <div className={`flex-1 min-h-0 grid ${isCompact ? "grid-rows-2" : "grid-cols-[minmax(280px,0.95fr)_1.2fr]"}`}>
          {/* Left: original widget */}
          <div
            className="min-h-0 flex flex-col overflow-hidden"
            style={{ borderRight: isCompact ? "none" : `1px solid ${C.border}`, borderBottom: isCompact ? `1px solid ${C.border}` : "none" }}
          >
            <div className="flex-none px-4 py-2" style={{ background: C.surfaceAlt, borderBottom: `0.8px solid ${C.border}` }}>
              <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 10, color: C.textMuted, letterSpacing: "0.05em", textTransform: "uppercase" }}>
                {selectable ? "Select an item" : "Widget"}
              </span>
            </div>
            <div className="flex-1 min-h-0 overflow-hidden">
              <PanelContent
                id={widgetId}
                selectedKey={selectedKey}
                onSelect={selectable ? setSelectedKey : undefined}
              />
            </div>
          </div>

          {/* Right: related tabs */}
          <div className="min-h-0 flex flex-col overflow-hidden" style={{ background: C.bg }}>
            <div
              className="flex-none flex items-end gap-1 px-3 pt-2 overflow-x-auto"
              style={{ borderBottom: `1px solid ${C.border}`, background: C.surface }}
            >
              {tabs.map((t) => {
                const active = t.id === tabId;
                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setTabId(t.id)}
                    className="px-3 py-2 whitespace-nowrap"
                    style={{
                      fontFamily: "'DM Mono', monospace",
                      fontSize: 10,
                      letterSpacing: "0.04em",
                      textTransform: "uppercase",
                      color: active ? C.primary : C.textMuted,
                      borderBottom: active ? `2px solid ${C.primary}` : "2px solid transparent",
                      background: "transparent",
                      cursor: "pointer",
                    }}
                  >
                    {t.label}
                  </button>
                );
              })}
            </div>
            <div className="flex-1 min-h-0 overflow-y-auto" style={{ background: C.surface }}>
              <WidgetDetailTabBody widgetId={widgetId} tabId={tabId} selectedKey={selectedKey} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Bento Panel ──────────────────────────────────────────────────────────────
const EDGE_CURSORS: Record<ResizeEdge, string> = {
  n: "ns-resize", s: "ns-resize", e: "ew-resize", w: "ew-resize",
  ne: "nesw-resize", nw: "nwse-resize", se: "nwse-resize", sw: "nesw-resize",
};

function BentoPanel({
  panel,
  isEditing,
  isHovered,
  isGhosted,
  isDragging,
  onMouseEnter,
  onMouseLeave,
  onClick,
  onStartResize,
  onStartMove,
  onDelete,
}: {
  panel: PanelDef;
  isEditing:   boolean;
  isHovered:   boolean;
  isGhosted:   boolean;
  isDragging:  boolean;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
  onClick:     (e: React.MouseEvent) => void;
  onStartResize: (e: React.MouseEvent, id: string, edge: ResizeEdge) => void;
  onStartMove:   (e: React.MouseEvent, id: string) => void;
  onDelete:      (e: React.MouseEvent, id: string) => void;
}) {
  const { id, colStart, colSpan, rowStart, rowSpan } = panel;
  const isStat = id.startsWith("stat");
  const handleSize = 10;
  const corner = 14;

  const edgeStyle = (edge: ResizeEdge): React.CSSProperties => {
    const base: React.CSSProperties = {
      position: "absolute",
      zIndex: 25,
      cursor: EDGE_CURSORS[edge],
    };
    switch (edge) {
      case "n":  return { ...base, top: 0, left: corner, right: corner, height: handleSize };
      case "s":  return { ...base, bottom: 0, left: corner, right: corner, height: handleSize };
      case "e":  return { ...base, right: 0, top: corner, bottom: corner, width: handleSize };
      case "w":  return { ...base, left: 0, top: corner, bottom: corner, width: handleSize };
      case "ne": return { ...base, top: 0, right: 0, width: corner, height: corner };
      case "nw": return { ...base, top: 0, left: 0, width: corner, height: corner };
      case "se": return { ...base, bottom: 0, right: 0, width: corner, height: corner };
      case "sw": return { ...base, bottom: 0, left: 0, width: corner, height: corner };
    }
  };

  const grip = (horizontal: boolean) => (
    <div
      className="rounded-full pointer-events-none"
      style={{
        width: horizontal ? 36 : 4,
        height: horizontal ? 4 : 36,
        background: C.primary,
        opacity: 0.7,
        position: "absolute",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
      }}
    />
  );

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
        cursor: isEditing ? (isDragging ? "grabbing" : "grab") : "pointer",
        opacity:   isGhosted ? 0.35 : 1,
        filter:    isGhosted ? "saturate(0.3)" : "none",
        transform: isHovered && !isEditing ? "scale(1.008)" : "scale(1)",
        boxShadow: isHovered && !isEditing
          ? `0 6px 24px ${C.text}18, 0 0 0 1.5px ${C.border}`
          : isEditing
          ? `0 0 0 1px ${C.primary}22, inset 0 0 0 1000px ${C.primary}03`
          : "none",
        transition: isDragging
          ? "none"
          : "opacity 180ms ease, filter 180ms ease, transform 180ms ease, box-shadow 180ms ease, border 150ms ease",
        zIndex: isDragging ? 5 : isHovered ? 2 : 1,
      }}
    >
      {/* Drag surface in edit mode */}
      {isEditing && (
        <div
          onMouseDown={(e) => onStartMove(e, id)}
          className="absolute inset-0 z-10"
          style={{ cursor: isDragging ? "grabbing" : "grab" }}
        />
      )}

      {/* Panel header — not shown for stat cards */}
      {!isStat && <PanelHeader title={PANEL_META[id]?.title ?? id} />}

      {/* Content */}
      <div className="flex-1 min-h-0 overflow-hidden relative z-[1]">
        <PanelContent id={id} />
      </div>

      {/* ── Edit mode UI ── */}
      {isEditing && (
        <>
          <button
            type="button"
            className="absolute top-2 right-2 z-30 flex items-center justify-center rounded-full"
            style={{
              width: 22,
              height: 22,
              background: C.danger,
              border: "none",
              color: "#fff",
              cursor: "pointer",
              boxShadow: `0 1px 4px ${C.text}22`,
            }}
            title="Remove widget"
            onMouseDown={(e) => e.stopPropagation()}
            onClick={(e) => onDelete(e, id)}
          >
            <X size={12} strokeWidth={2.5} />
          </button>

          {(["n", "s", "e", "w", "ne", "nw", "se", "sw"] as ResizeEdge[]).map((edge) => (
            <div
              key={edge}
              onMouseDown={(e) => { e.stopPropagation(); onStartResize(e, id, edge); }}
              style={edgeStyle(edge)}
            >
              {(edge === "n" || edge === "s") && grip(true)}
              {(edge === "e" || edge === "w") && grip(false)}
              {(edge === "ne" || edge === "nw" || edge === "se" || edge === "sw") && (
                <div
                  className="rounded-sm pointer-events-none"
                  style={{
                    width: 8,
                    height: 8,
                    background: C.primary,
                    opacity: 0.85,
                    position: "absolute",
                    top: "50%",
                    left: "50%",
                    transform: "translate(-50%, -50%)",
                  }}
                />
              )}
            </div>
          ))}
        </>
      )}
    </div>
  );
}

function WidgetPickerCarousel({
  options,
  onPick,
  onClose,
}: {
  options: WidgetCatalogEntry[];
  onPick: (id: WidgetTypeId) => void;
  onClose: () => void;
}) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    setIndex(0);
  }, [options]);

  const goTo = (next: number) => {
    if (options.length < 1) return;
    setIndex(((next % options.length) + options.length) % options.length);
  };

  if (options.length === 0) {
    return (
      <div
        className="rounded-lg p-3 h-full flex flex-col justify-center"
        style={{ background: C.surface, border: `1px solid ${C.border}`, boxShadow: `0 12px 28px ${C.text}22` }}
        onClick={(e) => e.stopPropagation()}
      >
        <p style={{ fontFamily: "'Lato', sans-serif", fontSize: 12, color: C.textMuted }}>
          All widgets are already on the dashboard.
        </p>
        <button
          type="button"
          className="mt-2 self-start"
          style={{ fontFamily: "'DM Mono', monospace", fontSize: 10, color: C.primary, cursor: "pointer" }}
          onClick={onClose}
        >
          Close
        </button>
      </div>
    );
  }

  return (
    <div
      className="rounded-lg overflow-hidden flex flex-col h-full"
      style={{
        background: C.surface,
        border: `1px solid ${C.border}`,
        boxShadow: `0 14px 32px ${C.text}28`,
        width: "100%",
      }}
      onClick={(e) => e.stopPropagation()}
      onMouseDown={(e) => e.stopPropagation()}
    >
      <div
        className="flex-none flex items-center justify-between px-3 py-2"
        style={{ background: C.surfaceAlt, borderBottom: `0.8px solid ${C.border}` }}
      >
        <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 10, letterSpacing: "0.05em", color: C.text, textTransform: "uppercase" }}>
          Add widget
        </span>
        <button type="button" onClick={onClose} style={{ color: C.textMuted, cursor: "pointer", lineHeight: 0 }}>
          <X size={14} />
        </button>
      </div>

      <div className="flex-1 min-h-0 flex items-center gap-0.5 px-1 py-2">
        <button
          type="button"
          disabled={options.length < 2}
          onClick={() => goTo(index - 1)}
          style={{ color: C.primary, cursor: options.length < 2 ? "default" : "pointer", opacity: options.length < 2 ? 0.35 : 1, flexShrink: 0 }}
        >
          <ChevronLeft size={18} />
        </button>

        <div className="flex-1 min-w-0 overflow-hidden" style={{ height: "100%" }}>
          <div
            className="flex h-full"
            style={{
              width: `${options.length * 100}%`,
              transform: `translateX(-${(index * 100) / options.length}%)`,
              transition: "transform 380ms cubic-bezier(0.22, 1, 0.36, 1)",
            }}
          >
            {options.map((opt) => {
              const Icon = opt.Icon;
              return (
                <div
                  key={opt.id}
                  className="h-full px-0.5 box-border"
                  style={{ flex: `0 0 ${100 / options.length}%`, width: `${100 / options.length}%` }}
                >
                  <button
                    type="button"
                    className="w-full h-full flex flex-col items-start justify-center gap-1.5 p-2.5 rounded-md text-left"
                    style={{ background: C.bg, border: `0.8px solid ${C.border}`, cursor: "pointer" }}
                    onClick={() => onPick(opt.id)}
                  >
                    <div className="flex items-center gap-2 w-full">
                      <Icon size={15} color={C.primary} />
                      <span style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 600, fontSize: 12, color: C.text }}>
                        {opt.title}
                      </span>
                    </div>
                    <p style={{ fontFamily: "'Lato', sans-serif", fontSize: 11, color: C.textSub, lineHeight: 1.4 }}>
                      {opt.blurb}
                    </p>
                    <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 9, color: C.textMuted }}>
                      Default {opt.defaultColSpan}×{opt.defaultRowSpan}
                    </span>
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        <button
          type="button"
          disabled={options.length < 2}
          onClick={() => goTo(index + 1)}
          style={{ color: C.primary, cursor: options.length < 2 ? "default" : "pointer", opacity: options.length < 2 ? 0.35 : 1, flexShrink: 0 }}
        >
          <ChevronRight size={18} />
        </button>
      </div>

      <div className="flex-none flex items-center justify-center gap-1 pb-2.5 pt-0.5">
        {options.map((_, i) => (
          <button
            key={i}
            type="button"
            onClick={() => goTo(i)}
            style={{
              width: i === index ? 14 : 6,
              height: 6,
              borderRadius: 99,
              border: "none",
              background: i === index ? C.primary : C.border,
              cursor: "pointer",
              padding: 0,
              transition: "width 220ms cubic-bezier(0.22, 1, 0.36, 1), background 220ms ease",
            }}
          />
        ))}
      </div>
    </div>
  );
}

function EmptyCellAdd({
  col,
  row,
  isOpen,
  options,
  onOpen,
  onClose,
  onPick,
}: {
  col: number;
  row: number;
  isOpen: boolean;
  options: WidgetCatalogEntry[];
  onOpen: () => void;
  onClose: () => void;
  onPick: (id: WidgetTypeId) => void;
}) {
  const pinLeft = col <= 1;
  const pinRight = col >= COLS;
  const pinTop = row <= 1;
  const pinBottom = row >= ROWS;

  const pickerStyle: React.CSSProperties = {
    position: "absolute",
    width: `calc(200% + ${GAP}px)`,
    height: `calc(200% + ${GAP}px)`,
    zIndex: 50,
    left: pinLeft ? 0 : pinRight ? undefined : "50%",
    right: pinRight ? 0 : undefined,
    top: pinTop ? 0 : pinBottom ? undefined : "50%",
    bottom: pinBottom ? 0 : undefined,
    transform: `translate(${pinLeft || pinRight ? "0%" : "-50%"}, ${pinTop || pinBottom ? "0%" : "-50%"})`,
  };

  return (
    <div
      className="group relative flex items-center justify-center rounded-md"
      style={{
        gridColumn: col,
        gridRow: row,
        background: "transparent",
        zIndex: isOpen ? 40 : 2,
        cursor: isOpen ? "default" : "pointer",
      }}
      onClick={(e) => {
        e.stopPropagation();
        if (!isOpen) onOpen();
      }}
    >
      {!isOpen && (
        <span
          className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none"
          style={{ color: "#6f95c0", lineHeight: 0, display: "flex" }}
        >
          <Plus size={28} strokeWidth={2} />
        </span>
      )}

      {isOpen && (
        <div
          className="pointer-events-auto"
          style={pickerStyle}
          onClick={(e) => e.stopPropagation()}
        >
          <WidgetPickerCarousel options={options} onPick={onPick} onClose={onClose} />
        </div>
      )}
    </div>
  );
}

// ─── Taskbar Button ───────────────────────────────────────────────────────────
function DarkModeToggle({
  dark,
  onToggle,
}: {
  dark: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className="flex items-center gap-2 rounded-md px-2 py-1.5"
      style={{
        background: "transparent",
        border: "none",
        cursor: "pointer",
        color: C.textMuted,
      }}
      title={dark ? "Switch to light mode" : "Switch to dark mode"}
      aria-pressed={dark}
      aria-label="Dark mode"
    >
      {dark ? <Moon size={14} strokeWidth={1.8} /> : <Sun size={14} strokeWidth={1.8} />}
      <span
        style={{
          position: "relative",
          width: 36,
          height: 20,
          borderRadius: 10,
          background: dark ? C.primary : "#D8E3EE",
          border: dark ? "0.8px solid transparent" : `0.8px solid ${C.border}`,
          flexShrink: 0,
          transition: "background 160ms ease, border-color 160ms ease",
        }}
      >
        <span
          style={{
            position: "absolute",
            top: 2.8,
            left: dark ? 18.8 : 2.8,
            width: 14,
            height: 14,
            borderRadius: 7,
            background: "#fff",
            boxShadow: "0 1px 3px rgba(0,0,0,0.25)",
            transition: "left 160ms ease",
          }}
        />
      </span>
      <span
        style={{
          fontFamily: "'DM Mono', monospace",
          fontSize: 9,
          letterSpacing: "0.05em",
          textTransform: "uppercase",
          lineHeight: 1.3,
        }}
      >
        Dark
      </span>
    </button>
  );
}

function TaskbarBtn({
  icon: Icon,
  label,
  onClick,
  primary = false,
  active  = false,
  grow = false,
}: {
  icon: React.ElementType;
  label: string;
  onClick?: () => void;
  primary?: boolean;
  active?:  boolean;
  grow?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className="flex flex-col items-center justify-center gap-1 px-3 py-1.5 rounded-md transition-all"
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
        minWidth:   grow ? 0 : 68,
        flex:       grow ? 1 : undefined,
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

// ─── Compact (mobile / tablet) stacked layout ─────────────────────────────────
function CompactStatStrip() {
  return (
    <div
      className="grid grid-cols-2 sm:grid-cols-4 gap-2"
    >
      {STATS.map((s) => {
        const { Icon } = s;
        return (
          <div
            key={s.id}
            className="rounded-lg p-3 flex flex-col gap-1.5 min-w-0"
            style={{
              background: C.surface,
              border: `0.8px solid ${C.border}`,
            }}
          >
            <div className="flex items-center justify-between gap-1">
              <span
                className="truncate"
                style={{
                  fontFamily: "'Lato', sans-serif",
                  fontSize: 10,
                  color: C.textMuted,
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                }}
              >
                {s.label}
              </span>
              <Icon size={14} color={s.color} strokeWidth={1.8} className="shrink-0" />
            </div>
            <p style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 600, fontSize: 24, color: C.text, lineHeight: 1 }}>
              {s.value}
            </p>
            <p className="truncate" style={{ fontFamily: "'Lato', sans-serif", fontSize: 10, color: s.color }}>
              {s.sub}
            </p>
          </div>
        );
      })}
    </div>
  );
}

function CompactCollapsible({
  id,
  open,
  onToggle,
}: {
  id: MobileWidgetId;
  open: boolean;
  onToggle: () => void;
}) {
  const title = PANEL_META[id].title;
  return (
    <div
      className="rounded-lg overflow-hidden flex flex-col"
      style={{
        background: C.surface,
        border: `0.8px solid ${C.border}`,
      }}
    >
      <button
        type="button"
        onClick={onToggle}
        className="flex-none flex items-center justify-between gap-3 px-4 py-3 w-full text-left"
        style={{
          background: C.surfaceAlt,
          borderBottom: open ? `0.8px solid ${C.border}` : "none",
          cursor: "pointer",
          minHeight: 44,
        }}
        aria-expanded={open}
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
        <ChevronDown
          size={16}
          color={C.textMuted}
          strokeWidth={1.8}
          style={{
            transform: open ? "rotate(0deg)" : "rotate(-90deg)",
            transition: "transform 180ms ease",
            flexShrink: 0,
          }}
        />
      </button>
      <div
        style={{
          display: "grid",
          gridTemplateRows: open ? "1fr" : "0fr",
          transition: "grid-template-rows 220ms ease",
        }}
      >
        <div className="min-h-0 overflow-hidden">
          <div
            className="overflow-hidden"
            style={{
              maxHeight: id === "recent" || id === "tasks" ? 320 : id === "calendar" ? 360 : 280,
            }}
          >
            <div className="h-full" style={{ minHeight: id === "search" ? 180 : 200 }}>
              <PanelContent id={id} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function CompactDashboard() {
  const [openMap, setOpenMap] = useState<Record<MobileWidgetId, boolean>>(MOBILE_DEFAULT_OPEN);

  const toggle = (id: MobileWidgetId) =>
    setOpenMap((prev) => ({ ...prev, [id]: !prev[id] }));

  return (
    <div className="flex-1 min-h-0 overflow-y-auto px-3 pt-3 pb-3">
      <div className="flex flex-col gap-2.5 max-w-3xl mx-auto">
        <CompactStatStrip />
        {MOBILE_WIDGET_ORDER.map((id) => (
          <CompactCollapsible
            key={id}
            id={id}
            open={openMap[id]}
            onToggle={() => toggle(id)}
          />
        ))}
      </div>
    </div>
  );
}

type AddJobFormState = {
  jobNumber: string;
  customer: string;
  useBarCodeForm: string;
  externalJob: string;
  division: string;
  jobStatus: string;
  shipTo: string;
  billTo: string;
  jobTitle: string;
  projectYear: string;
  jobStructure: string;
  jobHours: string;
  jobLocation: string;
  jobEfficiency: string;
  jobCareOf: string;
  rfInterface: string;
  jobPo: string;
  jobRelease: string;
  defaultAdhesiveBarCodeLabelFormat: string;
  defaultLabelLaseFormat: string;
};

const INIT_JOB_FORM: AddJobFormState = {
  jobNumber: "092356",
  customer: "P2 Programs#P2PROG",
  useBarCodeForm: "P2 Programs#P2PROG",
  externalJob: "",
  division: "SHOP",
  jobStatus: "Open",
  shipTo: "",
  billTo: "",
  jobTitle: "Bal Harbour Shops - Expansion",
  projectYear: "",
  jobStructure: "",
  jobHours: "",
  jobLocation: "",
  jobEfficiency: "",
  jobCareOf: "",
  rfInterface: "PowerFab",
  jobPo: "",
  jobRelease: "",
  defaultAdhesiveBarCodeLabelFormat: "<None>",
  defaultLabelLaseFormat: "<None>",
};

const EXISTING_JOBS = [
  { number: "092356", customer: "P2PROG", name: "P2 Programs" },
  { number: "1234A", customer: "P2PROG", name: "P2 Programs" },
  { number: "1234B", customer: "P2PROG", name: "P2 Programs" },
  { number: "1234C", customer: "P2PROG", name: "P2 Programs" },
  { number: "1234D", customer: "P2PROG", name: "P2 Programs" },
  { number: "1234E", customer: "P2PROG", name: "P2 Programs" },
  { number: "1234F", customer: "P2PROG", name: "P2 Programs" },
  { number: "1234G", customer: "P2PROG", name: "P2 Programs" },
  { number: "1234H", customer: "P2PROG", name: "P2 Programs" },
  { number: "1234J", customer: "P2PROG", name: "P2 Programs" },
  { number: "1234_SHOP", customer: "P2PROG", name: "P2 Programs" },
  { number: "2247", customer: "P2PROG", name: "P2 Programs" },
  { number: "2255", customer: "P2PROG", name: "P2 Programs" },
  { number: "2310", customer: "P2PROG", name: "P2 Programs" },
  { number: "2319_PUSH", customer: "P2PROG", name: "P2 Programs" },
  { number: "2319_SHOP", customer: "P2PROG", name: "P2 Programs" },
  { number: "TEST", customer: "P2PROG", name: "P2 Programs" },
];

function AddNewJobModal({
  open,
  isCompact,
  onClose,
}: {
  open: boolean;
  isCompact: boolean;
  onClose: () => void;
}) {
  const [form, setForm] = useState<AddJobFormState>(INIT_JOB_FORM);
  const [selectedJob, setSelectedJob] = useState(EXISTING_JOBS[0]?.number ?? null);
  const [showClosed, setShowClosed] = useState(false);
  const [metricJob, setMetricJob] = useState(false);
  const [checks, setChecks] = useState({
    keepMinors: false,
    validateHeats: false,
    validatePipes: false,
    validateFittings: false,
  });

  useEffect(() => {
    if (!open) return;
    const onKey = (ev: KeyboardEvent) => {
      if (ev.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  const inputStyle: React.CSSProperties = {
    width: "100%",
    height: "100%",
    border: "none",
    background: "transparent",
    outline: "none",
    fontFamily: "'Lato', sans-serif",
    fontSize: 12,
    color: C.text,
  };

  const renderField = (
    key: keyof AddJobFormState,
    label: string,
    opts?: { select?: string[]; metric?: boolean; lbs?: boolean }
  ) => (
    <LoadInfoRow
      label={label}
      trailing={
        opts?.metric || opts?.lbs ? (
          <div className="flex items-center gap-2 shrink-0 whitespace-nowrap">
            {opts?.lbs && (
              <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 10, color: C.textMuted }}>lbs</span>
            )}
            {opts?.metric && (
              <label className="flex items-center gap-1.5" style={{ fontFamily: "'Lato', sans-serif", fontSize: 12, color: C.textSub }}>
                <input type="checkbox" checked={metricJob} onChange={(e) => setMetricJob(e.target.checked)} />
                Metric Job
              </label>
            )}
          </div>
        ) : undefined
      }
    >
      {opts?.select ? (
        <select
          style={{ ...inputStyle, cursor: "pointer" }}
          value={form[key]}
          onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
        >
          {opts.select.map((opt) => (
            <option key={opt || "__empty"} value={opt}>{opt || " "}</option>
          ))}
        </select>
      ) : (
        <input
          style={inputStyle}
          value={form[key]}
          onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
        />
      )}
    </LoadInfoRow>
  );

  return (
    <div
      className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center"
      style={{ background: "transparent" }}
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="w-full overflow-hidden flex flex-col"
        style={{
          maxWidth: isCompact ? "100%" : 1080,
          height: isCompact ? "90vh" : "min(780px, 88vh)",
          background: C.surface,
          border: `1px solid ${C.border}`,
          borderRadius: isCompact ? "16px 16px 0 0" : 12,
          boxShadow: `0 24px 60px ${C.text}14`,
          margin: isCompact ? 0 : 20,
        }}
      >
        <div
          className="flex-none flex items-center justify-between px-4 py-3"
          style={{ background: C.primary, color: C.primaryFg }}
        >
          <span style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 600, fontSize: 18 }}>
            Add New Job
          </span>
          <button type="button" onClick={onClose} style={{ color: C.primaryFg, cursor: "pointer", lineHeight: 0 }}>
            <X size={18} />
          </button>
        </div>

        <div className={`flex-1 min-h-0 grid ${isCompact ? "grid-rows-2" : "grid-cols-[minmax(280px,0.95fr)_1.2fr]"}`}>
          {/* Left: existing jobs */}
          <div
            className="min-h-0 flex flex-col overflow-hidden"
            style={{ borderRight: isCompact ? "none" : `1px solid ${C.border}`, borderBottom: isCompact ? `1px solid ${C.border}` : "none" }}
          >
            <div className="flex-none flex items-center justify-between gap-2 px-4 py-2" style={{ background: C.surfaceAlt, borderBottom: `0.8px solid ${C.border}` }}>
              <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 10, color: C.textMuted, letterSpacing: "0.05em", textTransform: "uppercase" }}>
                Edit Jobs
              </span>
              <label className="flex items-center gap-1.5" style={{ fontFamily: "'Lato', sans-serif", fontSize: 11, color: C.textSub }}>
                <input type="checkbox" checked={showClosed} onChange={(e) => setShowClosed(e.target.checked)} />
                Show Closed Jobs
              </label>
            </div>
            <div className="flex-none flex px-4 py-1.5" style={{ borderBottom: `0.8px solid ${C.border}`, background: C.surfaceAlt }}>
              {["Job Number", "Customer No.", "Name"].map((h) => (
                <div key={h} className="flex-1" style={{ fontFamily: "'DM Mono', monospace", fontSize: 9, color: C.textMuted, textTransform: "uppercase" }}>{h}</div>
              ))}
            </div>
            <div className="flex-1 min-h-0 overflow-y-auto">
              {EXISTING_JOBS.map((job, i) => {
                const selected = selectedJob === job.number;
                return (
                  <div
                    key={job.number}
                    role="button"
                    tabIndex={0}
                    onClick={() => {
                      setSelectedJob(job.number);
                      setForm((f) => ({ ...f, jobNumber: job.number, customer: `${job.name}#${job.customer}` }));
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        setSelectedJob(job.number);
                        setForm((f) => ({ ...f, jobNumber: job.number, customer: `${job.name}#${job.customer}` }));
                      }
                    }}
                    className="flex px-4 py-2"
                    style={{
                      borderBottom: `0.8px solid ${C.border}`,
                      background: selected ? `${C.primary}18` : i % 2 === 0 ? "transparent" : `${C.surfaceAlt}55`,
                      cursor: "pointer",
                      outline: selected ? `1px solid ${C.primary}44` : "none",
                    }}
                  >
                    <div className="flex-1" style={{ fontFamily: "'DM Mono', monospace", fontSize: 11, color: C.primary }}>{job.number}</div>
                    <div className="flex-1" style={{ fontFamily: "'DM Mono', monospace", fontSize: 11, color: C.textMuted }}>{job.customer}</div>
                    <div className="flex-1" style={{ fontFamily: "'Lato', sans-serif", fontSize: 12, color: C.text }}>{job.name}</div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right: new job fields (tab content area) */}
          <div className="min-h-0 flex flex-col overflow-hidden" style={{ background: C.bg }}>
            <div
              className="flex-none flex items-end gap-1 px-3 pt-2"
              style={{ borderBottom: `1px solid ${C.border}`, background: C.surface }}
            >
              <div
                className="px-3 py-2 whitespace-nowrap"
                style={{
                  fontFamily: "'DM Mono', monospace",
                  fontSize: 10,
                  letterSpacing: "0.04em",
                  textTransform: "uppercase",
                  color: C.primary,
                  borderBottom: `2px solid ${C.primary}`,
                }}
              >
                Job Information
              </div>
            </div>
            <form
              className="flex-1 min-h-0 overflow-y-auto p-4"
              style={{ background: C.surface }}
              onSubmit={(e) => {
                e.preventDefault();
                onClose();
              }}
            >
              <div className="flex flex-col gap-2 max-w-3xl">
                {renderField("jobNumber", "Job Number")}
                {renderField("customer", "Customer #")}
                {renderField("useBarCodeForm", "Use Bar Code Form")}
                {renderField("jobHours", "Job Weight", { lbs: true, metric: true })}
                {renderField("externalJob", "External Job #")}
                {renderField("division", "Division", { select: ["SHOP", "FIELD", "FAB"] })}
                {renderField("jobStatus", "Job Status", { select: ["Open", "Closed", "Hold"] })}
                {renderField("shipTo", "Ship To", { select: ["", "Main Yard", "Site A", "Site B"] })}
                {renderField("billTo", "Bill To", { select: ["", "Main Yard", "Site A", "Site B"] })}
                {renderField("jobTitle", "Job Title")}
                {renderField("projectYear", "Project Year")}
                {renderField("jobStructure", "Job Structure")}
                {renderField("jobHours", "Job Hours")}
                {renderField("jobLocation", "Job Location")}
                {renderField("jobEfficiency", "Job Efficiency")}
                {renderField("jobCareOf", "Job Care Of")}
                {renderField("rfInterface", "RF Interface", { select: ["PowerFab", "FieldOps"] })}
                {renderField("jobPo", "Job PO #")}
                {renderField("jobRelease", "Job Release #")}
                {renderField("defaultAdhesiveBarCodeLabelFormat", "Default Adhesive Bar Code Label Format #", { select: ["<None>", "STD-01", "STD-02"] })}
                {renderField("defaultLabelLaseFormat", "Default LabelLase Label Format #", { select: ["<None>", "LASER-A", "LASER-B"] })}

                <div className="mt-2 pt-3 grid grid-cols-1 sm:grid-cols-2 gap-2" style={{ borderTop: `1px solid ${C.border}` }}>
                  {([
                    ["keepMinors", "Keep Minors on Import (Prefix=No)"],
                    ["validateHeats", "Validate Heats"],
                    ["validatePipes", "Validate Pipes"],
                    ["validateFittings", "Validate Fittings"],
                  ] as const).map(([key, label]) => (
                    <label key={key} className="flex items-center gap-1.5" style={{ fontFamily: "'Lato', sans-serif", fontSize: 12, color: C.textSub }}>
                      <input
                        type="checkbox"
                        checked={checks[key]}
                        onChange={(e) => setChecks((c) => ({ ...c, [key]: e.target.checked }))}
                      />
                      {label}
                    </label>
                  ))}
                </div>

                <div className="flex flex-wrap justify-end gap-2 mt-4 pt-3" style={{ borderTop: `1px solid ${C.border}` }}>
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-3 py-1.5 rounded-sm"
                    style={{
                      fontFamily: "'Lato', sans-serif",
                      fontSize: 12,
                      minWidth: 110,
                      cursor: "pointer",
                      background: C.surfaceAlt,
                      color: C.textMuted,
                      border: `1px solid ${C.border}`,
                    }}
                  >
                    Close
                  </button>
                  <button
                    type="submit"
                    className="px-3 py-1.5 rounded-sm flex items-center justify-center gap-1.5"
                    style={{
                      fontFamily: "'Lato', sans-serif",
                      fontSize: 12,
                      minWidth: 110,
                      cursor: "pointer",
                      background: C.primary,
                      color: C.primaryFg,
                      border: `1px solid ${C.primary}`,
                    }}
                  >
                    <Plus size={12} /> Add Job
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── App ──────────────────────────────────────────────────────────────────────
export default function App() {
  const isCompact = useIsCompact();
  const [isEditing, setIsEditing] = useState(false);
  const [isDark, setIsDark] = useState(false);
  const [isAddJobOpen, setIsAddJobOpen] = useState(false);
  const [panels, setPanels]       = useState<PanelDef[]>(INIT);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [detailWidgetId, setDetailWidgetId] = useState<string | null>(null);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [pickerCell, setPickerCell] = useState<{ col: number; row: number } | null>(null);
  const gridRef = useRef<HTMLDivElement>(null);

  // Keep token object in sync with theme on the same render as the toggle.
  applyColorTokens(isDark);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", isDark);
  }, [isDark]);

  // Leave edit mode when switching to compact viewport
  useEffect(() => {
    if (isCompact && isEditing) {
      setIsEditing(false);
      setDraggingId(null);
      setHoveredId(null);
      setPickerCell(null);
    }
  }, [isCompact, isEditing]);

  const usedIds = new Set(panels.map((p) => p.id));
  const availableWidgets = WIDGET_CATALOG.filter((w) => !usedIds.has(w.id));
  const emptyCells = isEditing ? getEmptyCells(panels) : [];

  const handleDeletePanel = useCallback((e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setPanels((prev) => prev.filter((p) => p.id !== id));
    setPickerCell(null);
    setDetailWidgetId((prev) => (prev === id ? null : prev));
  }, []);

  const handleAddWidget = useCallback((widgetId: WidgetTypeId, col: number, row: number) => {
    setPanels((prev) => {
      if (prev.some((p) => p.id === widgetId)) return prev;
      const placed = fitNewPanel(prev, widgetId, col, row);
      return placed ? [...prev, placed] : prev;
    });
    setPickerCell(null);
  }, []);

  // Click: open widget detail popup
  const handlePanelClick = useCallback(
    (e: React.MouseEvent, id: string) => {
      if (isEditing) return;
      e.stopPropagation();
      setDetailWidgetId(id);
    },
    [isEditing]
  );

  const handleCloseDetail = useCallback(() => {
    setDetailWidgetId(null);
  }, []);

  // Click on grid background dismisses picker
  const handleGridClick = useCallback(() => {
    setPickerCell(null);
  }, []);

  // Drag to move panel anywhere on the 12×8 grid
  const startMove = useCallback(
    (e: React.MouseEvent, panelId: string) => {
      if (!isEditing) return;
      e.preventDefault();
      e.stopPropagation();

      const startPanel = panels.find((p) => p.id === panelId);
      if (!startPanel || !gridRef.current) return;

      const rect = gridRef.current.getBoundingClientRect();
      const originCol = nearestColLine(e.clientX - rect.left, rect.width);
      const originRow = nearestRowLine(e.clientY - rect.top, rect.height);
      const offsetCol = originCol - startPanel.colStart;
      const offsetRow = originRow - startPanel.rowStart;

      setDraggingId(panelId);

      const handleMove = (ev: MouseEvent) => {
        if (!gridRef.current) return;
        const r = gridRef.current.getBoundingClientRect();
        const colLine = nearestColLine(ev.clientX - r.left, r.width);
        const rowLine = nearestRowLine(ev.clientY - r.top, r.height);

        setPanels((prev) =>
          prev.map((p) => {
            if (p.id !== panelId) return p;
            const nextCol = clamp(colLine - offsetCol, 1, COLS - p.colSpan + 1);
            const nextRow = clamp(rowLine - offsetRow, 1, ROWS - p.rowSpan + 1);
            if (nextCol === p.colStart && nextRow === p.rowStart) return p;
            return { ...p, colStart: nextCol, rowStart: nextRow };
          })
        );
      };

      const handleUp = () => {
        setDraggingId(null);
        document.removeEventListener("mousemove", handleMove);
        document.removeEventListener("mouseup", handleUp);
      };
      document.addEventListener("mousemove", handleMove);
      document.addEventListener("mouseup", handleUp);
    },
    [isEditing, panels]
  );

  // Stretch from any edge / corner
  const startResize = useCallback(
    (e: React.MouseEvent, panelId: string, edge: ResizeEdge) => {
      e.preventDefault();
      e.stopPropagation();

      const startPanel = panels.find((p) => p.id === panelId);
      if (!startPanel) return;

      setDraggingId(panelId);

      const handleMove = (ev: MouseEvent) => {
        if (!gridRef.current) return;
        const rect = gridRef.current.getBoundingClientRect();
        const colLine = nearestColLine(ev.clientX - rect.left, rect.width);
        const rowLine = nearestRowLine(ev.clientY - rect.top, rect.height);

        setPanels((prev) =>
          prev.map((p) => (p.id === panelId ? applyResize(p, edge, colLine, rowLine) : p))
        );
      };

      const handleUp = () => {
        setDraggingId(null);
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
    setDetailWidgetId(null);
    setHoveredId(null);
    setDraggingId(null);
    setPickerCell(null);
  };

  const openAddJob = useCallback(() => {
    setIsAddJobOpen(true);
    setDetailWidgetId(null);
  }, []);

  const closeAddJob = useCallback(() => {
    setIsAddJobOpen(false);
  }, []);

  const anyHovered = hoveredId !== null;
  const isDetailOpen = detailWidgetId !== null;
  const isModalOpen = isDetailOpen || isAddJobOpen;

  return (
    <div
      className="h-screen flex flex-col select-none"
      style={{ background: C.bg }}
    >
      <div
        className="flex-1 min-h-0 flex flex-col"
        style={{
          opacity: isModalOpen ? 0.35 : 1,
          filter: isModalOpen ? "saturate(0.3)" : "none",
          transition: "opacity 180ms ease, filter 180ms ease",
          pointerEvents: isModalOpen ? "none" : undefined,
        }}
      >
      {isCompact ? (
        <CompactDashboard />
      ) : (
        /* Bento grid area — desktop */
        <div className="flex-1 min-h-0 overflow-hidden p-4 pb-3" onClick={handleGridClick}>
          <div
            ref={gridRef}
            className="relative grid h-full"
            style={{
              gridTemplateColumns: `repeat(${COLS}, minmax(0, 1fr))`,
              gridTemplateRows: `repeat(${ROWS}, minmax(0, 1fr))`,
              gap: GAP,
            }}
          >
            {isEditing && (
              <div
                className="absolute inset-0 grid pointer-events-none"
                style={{
                  gridTemplateColumns: `repeat(${COLS}, minmax(0, 1fr))`,
                  gridTemplateRows: `repeat(${ROWS}, minmax(0, 1fr))`,
                  gap: GAP,
                  zIndex: 0,
                }}
              >
                {Array.from({ length: COLS * ROWS }).map((_, i) => (
                  <div
                    key={i}
                    className="rounded-md"
                    style={{ background: `${C.primary}06`, border: `1px dashed ${C.primary}18` }}
                  />
                ))}
              </div>
            )}

            {isEditing && emptyCells.map(({ col, row }) => (
              <EmptyCellAdd
                key={`empty-${col}-${row}`}
                col={col}
                row={row}
                isOpen={pickerCell?.col === col && pickerCell?.row === row}
                options={availableWidgets}
                onOpen={() => setPickerCell({ col, row })}
                onClose={() => setPickerCell(null)}
                onPick={(id) => handleAddWidget(id, col, row)}
              />
            ))}

            {panels.map((panel) => {
              const isHovered = hoveredId === panel.id;
              const isGhosted = anyHovered && !isHovered && !isEditing;
              return (
                <BentoPanel
                  key={panel.id}
                  panel={panel}
                  isEditing={isEditing}
                  isHovered={isHovered}
                  isGhosted={isGhosted}
                  isDragging={draggingId === panel.id}
                  onMouseEnter={() => !isEditing && setHoveredId(panel.id)}
                  onMouseLeave={() => setHoveredId(null)}
                  onClick={(e) => handlePanelClick(e, panel.id)}
                  onStartResize={startResize}
                  onStartMove={startMove}
                  onDelete={handleDeletePanel}
                />
              );
            })}
          </div>
        </div>
      )}

      {/* Fixed taskbar */}
      <div
        className="flex-none flex items-center gap-2 px-3 sm:px-6"
        style={{
          height: 75,
          background: C.positiveBg,
          borderTop: `0.8px solid ${C.border}`,
        }}
      >
        {!isCompact && <div className="flex-1 min-w-0" />}
        <div className={`flex items-center justify-center gap-2 min-w-0 ${isCompact ? "flex-1" : ""}`}>
          {isCompact ? (
            <>
              <TaskbarBtn icon={HelpCircle} label="FAQ & Support" grow />
              <TaskbarBtn icon={ScanLine}   label="New Scan" primary grow onClick={openAddJob} />
              <TaskbarBtn icon={Settings}   label="Settings" grow />
            </>
          ) : (
            <>
              <TaskbarBtn icon={Settings}   label="Settings"      />
              <TaskbarBtn icon={HelpCircle} label="FAQ & Support" />
              <TaskbarBtn icon={Plus}       label="Add New Job"   primary onClick={openAddJob} />
              <TaskbarBtn icon={FileDown}   label="Report PDF"    />
              <TaskbarBtn
                icon={isEditing ? X : LayoutGrid}
                label={isEditing ? "Exit Edit" : "Edit Dashboard"}
                onClick={toggleEdit}
                active={isEditing}
              />
            </>
          )}
        </div>
        <div className={`flex justify-end shrink-0 ${isCompact ? "" : "flex-1 min-w-0"}`}>
          <DarkModeToggle dark={isDark} onToggle={() => setIsDark((v) => !v)} />
        </div>
      </div>
      </div>
      <AddNewJobModal open={isAddJobOpen} isCompact={isCompact} onClose={closeAddJob} />
      <WidgetDetailModal
        open={isDetailOpen}
        widgetId={detailWidgetId}
        isCompact={isCompact}
        onClose={handleCloseDetail}
      />
    </div>
  );
}
