import { useState, useRef, useCallback, useEffect } from "react";
import {
  Search, Plus, Settings, HelpCircle, FileDown, LayoutGrid, X,
  CheckCircle, AlertTriangle, XCircle, TrendingUp, BarChart3,
  ChevronLeft, ChevronRight, ChevronDown, Circle, Clock, ScanLine,
  Truck, Users, ArrowLeftRight, Package, Moon, Sun, LogOut,
  Briefcase, Database, ShieldAlert, FileText, Settings2, ClipboardList, Upload,
} from "lucide-react";
import { LoginPage } from "./LoginPage";
import {
  C,
  JEWEL,
  applyColorTokens,
  gradientBorderFill,
  metalFill,
  metalShadow,
  metalSpecular,
  type JewelMetal,
} from "./colorTokens";
import {
  ImportFilterForm,
  CustomerEditorPanel,
  CarrierEditorPanel,
  StatusCodesEditorPanel,
  RoutingCodesEditorPanel,
  EmployeeInfoEditor,
  EmployeeClassEditorPanel,
  PiecemarkEntryWorkbench,
  TokenCheckbox,
} from "./stsxPanels";

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

// ─── Grid ─────────────────────────────────────────────────────────────────────
const COLS = 12;
const ROWS = 8;
const GAP = 10;
const MIN_COL_SPAN = 1;
const MIN_ROW_SPAN = 1;

type PanelDef = {
  id: string;
  colStart: number; colSpan: number;
  rowStart: number; rowSpan: number;
};

type ResizeEdge = "n" | "s" | "e" | "w" | "ne" | "nw" | "se" | "sw";

type WidgetTypeId =
  | "stat1" | "stat2" | "stat3" | "stat4"
  | "recent" | "search" | "tasks" | "timelines" | "calendar"
  | "active-loads" | "employees" | "import-export" | "inventory"
  | "job-piecemark" | "piecemark-entry" | "reference-data"
  | "records-danger" | "reports-labels" | "admin-system";

type WidgetCatalogEntry = {
  id: WidgetTypeId;
  title: string;
  description: string;
  blurb: string;
  defaultColSpan: number;
  defaultRowSpan: number;
  Icon: React.ElementType;
  danger?: boolean;
};

const WIDGET_CATALOG: WidgetCatalogEntry[] = [
  { id: "stat1", title: "Active Jobs", blurb: "KPI — jobs in production", description: "Total number of jobs currently in production across all stages — from raw material cutting through to final QC sign-off. Includes jobs on hold.", defaultColSpan: 2, defaultRowSpan: 1, Icon: BarChart3 },
  { id: "stat2", title: "Scans Today", blurb: "KPI — daily scan volume", description: "Total barcodes and QR codes scanned today across all scanner units on the floor. The pass rate reflects first-pass quality without any re-scan events.", defaultColSpan: 2, defaultRowSpan: 1, Icon: CheckCircle },
  { id: "stat3", title: "Pending Reviews", blurb: "KPI — QC backlog", description: "Parts flagged for manual quality review before they can be signed off and moved to the next stage. Items marked overdue have exceeded their review deadline.", defaultColSpan: 2, defaultRowSpan: 1, Icon: AlertTriangle },
  { id: "stat4", title: "On-Time Rate", blurb: "KPI — delivery performance", description: "Percentage of jobs delivered on or before the scheduled completion date. Calculated over a rolling 30-day window and compared to the previous period.", defaultColSpan: 2, defaultRowSpan: 1, Icon: TrendingUp },
  { id: "recent", title: "Recent Scans", blurb: "Live shop-floor scan feed", description: "Live feed of the most recent part scans from all scanner units on the shop floor, sorted newest-first. Click any row to open the full scan record and traceability chain.", defaultColSpan: 4, defaultRowSpan: 2, Icon: ScanLine },
  { id: "search", title: "Quick Search", blurb: "Search jobs, parts, customers", description: "Search across all jobs, part numbers, customers, and scan records from one place. Use Find a Piecemark for floor lookups.", defaultColSpan: 4, defaultRowSpan: 2, Icon: Search },
  { id: "tasks", title: "Today's Tasks", blurb: "Personal daily checklist", description: "Your personal task list for the current working day. High-priority items are flagged in amber. Check off tasks as you complete them — progress is saved automatically.", defaultColSpan: 4, defaultRowSpan: 2, Icon: CheckCircle },
  { id: "timelines", title: "Project Timelines", blurb: "Job progress vs schedule", description: "Gantt-style progress view for all active jobs. Progress is calculated from scanned milestones against the planned schedule. At-risk jobs are tracking behind their baseline.", defaultColSpan: 4, defaultRowSpan: 2, Icon: BarChart3 },
  { id: "calendar", title: "Calendar", blurb: "Deadlines and events", description: "Monthly overview. Job deadlines, planned site visits, compliance review dates, and team events appear as marked days. Click any date to see what is scheduled.", defaultColSpan: 4, defaultRowSpan: 2, Icon: Circle },
  { id: "active-loads", title: "Active Loads", blurb: "Loads in transit / staging", description: "Track active outbound and inbound loads — staging status, destination, and estimated departure or arrival times across the yard.", defaultColSpan: 4, defaultRowSpan: 2, Icon: Truck },
  { id: "employees", title: "Manage Employees", blurb: "Crew roster and roles", description: "View shop-floor crew, shift assignments, and role coverage. Edit employee and class information from the detail tabs.", defaultColSpan: 4, defaultRowSpan: 2, Icon: Users },
  { id: "import-export", title: "Import / Export Queue", blurb: "Tekla, EJE, SDS, Excel", description: "Import pipelines for Tekla XSR, EJE delimited, SDS/XML, and Excel sources. Monitor queue status and run imports from the detail tabs.", defaultColSpan: 4, defaultRowSpan: 2, Icon: ArrowLeftRight },
  { id: "inventory", title: "Stock & Inventory", blurb: "Levels and capacity", description: "Current stock levels against warehouse capacity. Highlights materials below reorder point and bins approaching max fill.", defaultColSpan: 4, defaultRowSpan: 2, Icon: Package },
  { id: "job-piecemark", title: "Add and Edit Jobs", blurb: "Create and maintain jobs", description: "Add and edit jobs. Piecemark Entry is a separate floor widget for high-frequency daily use.", defaultColSpan: 4, defaultRowSpan: 3, Icon: Briefcase },
  { id: "piecemark-entry", title: "Piecemark Entry", blurb: "Floor — enter piecemarks", description: "High-frequency shop-floor piecemark entry. Standalone one-tap surface so floor work is not buried next to office admin tasks.", defaultColSpan: 4, defaultRowSpan: 3, Icon: ClipboardList },
  { id: "reference-data", title: "Edit Data", blurb: "Customers, carriers, codes", description: "Maintain customers, carriers, status codes, and routing codes used across jobs and loads.", defaultColSpan: 4, defaultRowSpan: 2, Icon: Database },
  { id: "records-danger", title: "Records — Danger Zone", blurb: "Delete / recall / purge", description: "Destructive record operations: delete active records, recall deleted records, and purge. Kept separate from Edit Data on purpose.", defaultColSpan: 4, defaultRowSpan: 2, Icon: ShieldAlert, danger: true },
  { id: "reports-labels", title: "Reports & Labels", blurb: "Foxfire, status, labels", description: "Foxfire reports, status reports, barcode ID labels, raw material labels, and label field reports.", defaultColSpan: 4, defaultRowSpan: 2, Icon: FileText },
  { id: "admin-system", title: "Admin & System", blurb: "Office employee preferences", description: "Preferences, printers, division/license, logon access, application permissions, and system logs. Office Employee persona.", defaultColSpan: 4, defaultRowSpan: 2, Icon: Settings2 },
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
const STATS: {
  id: string;
  label: string;
  value: string;
  sub: string;
  metal: JewelMetal;
  Icon: typeof BarChart3;
}[] = [
  { id: "stat1", label: "Active Jobs",     value: "47",    sub: "+3 since yesterday", metal: JEWEL.viridian, Icon: BarChart3 },
  { id: "stat2", label: "Scans Today",     value: "183",   sub: "94.0% pass rate",    metal: JEWEL.amber,    Icon: CheckCircle },
  { id: "stat3", label: "Pending Reviews", value: "12",    sub: "3 overdue",          metal: JEWEL.indigo,   Icon: AlertTriangle },
  { id: "stat4", label: "On-Time Rate",    value: "94.2%", sub: "↑ 2.1pp this week", metal: JEWEL.cherry,   Icon: TrendingUp },
];

function jewelForStat(id: string): JewelMetal {
  return STATS.find((s) => s.id === id)?.metal ?? JEWEL.indigo;
}

/** Per-widget jewel accent — ~equal viridian / amber / indigo; cherry only on records-danger. */
const PANEL_JEWEL: Record<string, JewelMetal> = {
  recent: JEWEL.viridian,
  timelines: JEWEL.viridian,
  calendar: JEWEL.viridian,
  "active-loads": JEWEL.viridian,
  tasks: JEWEL.amber,
  "import-export": JEWEL.amber,
  "piecemark-entry": JEWEL.amber,
  "admin-system": JEWEL.amber,
  inventory: JEWEL.amber,
  search: JEWEL.indigo,
  employees: JEWEL.indigo,
  "job-piecemark": JEWEL.indigo,
  "reports-labels": JEWEL.indigo,
  "reference-data": JEWEL.indigo,
  "records-danger": JEWEL.cherry,
};

function panelJewel(id: string): JewelMetal {
  return PANEL_JEWEL[id] ?? JEWEL.viridian;
}

function StatusPill({
  tone,
  children,
}: {
  tone: "ok" | "warn" | "danger";
  children: React.ReactNode;
}) {
  const styles =
    tone === "ok"
      ? { color: C.primary, background: `${C.primary}2E`, border: `1.5px solid ${C.primary}AA` }
      : tone === "warn"
      ? { color: C.warning, background: `${C.warning}33`, border: `1.5px solid ${C.warning}BB` }
      : { color: C.danger, background: `${C.danger}2E`, border: `1.5px solid ${C.danger}AA` };
  return (
    <span
      className="px-1.5 py-0.5 rounded"
      style={{
        fontFamily: "'DM Mono', monospace",
        fontSize: 10,
        fontWeight: 700,
        letterSpacing: "0.04em",
        ...styles,
      }}
    >
      {children}
    </span>
  );
}

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

/** Shared dim: hover sibling ghost ↔ dashboard behind modal (midpoint of the two extremes). */
const GHOST_OPACITY = 0.58;
const GHOST_SATURATE = "saturate(0.58)";

// ─── Panel content components ─────────────────────────────────────────────────

function PanelHeader({ title, accent }: { title: string; accent: string }) {
  return (
    <div
      className="flex-none flex items-center px-4 py-2.5"
      style={{
        background: C.surface,
        borderBottom: `1px solid ${C.border}`,
        minHeight: 36,
      }}
    >
      <span
        style={{
          fontFamily: "'DM Mono', monospace",
          fontSize: 13,
          fontWeight: 600,
          color: accent,
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
  const { Icon, metal } = s;
  return (
    <div className="flex flex-col justify-between h-full p-4 relative overflow-hidden">
      <div
        className="absolute top-0 left-0 right-0 h-px pointer-events-none"
        style={{ background: metalSpecular(metal) }}
      />
      <div className="flex items-start justify-between relative z-[1]">
        <span
          style={{
            fontFamily: "'Lato', sans-serif",
            fontSize: 13,
            color: metal.text,
            opacity: 0.8,
            textTransform: "uppercase",
            letterSpacing: "0.06em",
            fontWeight: 700,
          }}
        >
          {s.label}
        </span>
        <Icon size={16} color={metal.text} strokeWidth={1.8} style={{ opacity: 0.8 }} />
      </div>
      <div className="relative z-[1]">
        <p style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 700, fontSize: 44, color: metal.text, lineHeight: 1 }}>
          {s.value}
        </p>
        <p style={{ fontFamily: "'Lato', sans-serif", fontSize: 13, color: metal.text, marginTop: 7, opacity: 0.9 }}>
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
        style={{ borderBottom: `1.5px solid ${C.border}`, background: C.surfaceAlt }}
      >
        {(["Scan ID", "Part No.", "Description", "Qty", "Time", ""] as const).map((label, i) => (
          <div
            key={i}
            className={i === 2 ? "flex-1 px-2" : "shrink-0 px-2"}
            style={{
              width: [72, 74, undefined, 32, 42, 28][i],
              fontFamily: "'DM Mono', monospace",
              fontSize: 12,
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
            style={{ borderBottom: `1.5px solid ${C.border}`, background: i % 2 === 0 ? "transparent" : `${C.surfaceAlt}55` }}
          >
            <div className="w-[72px] shrink-0 px-2" style={{ fontFamily: "'DM Mono', monospace", fontSize: 12, color: C.primary }}>{s.id}</div>
            <div className="w-[74px] shrink-0 px-2" style={{ fontFamily: "'DM Mono', monospace", fontSize: 12, color: C.text }}>{s.part}</div>
            <div className="flex-1 px-2 truncate" style={{ fontFamily: "'Lato', sans-serif", fontSize: 13, color: C.textSub }}>{s.desc}</div>
            <div className="w-[32px] shrink-0 px-2" style={{ fontFamily: "'DM Mono', monospace", fontSize: 12, color: C.textMuted }}>{s.qty}</div>
            <div className="w-[42px] shrink-0 px-2" style={{ fontFamily: "'DM Mono', monospace", fontSize: 12, color: C.textMuted }}>{s.time}</div>
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
  const filters = ["All", "Job No.", "Part No.", "Customer", "Material", "Piecemark"];
  const recent  = ["PT-1042-A", "J-0912", "SC-2840", "PT-3301", "B-1042-A"];
  return (
    <div className="flex flex-col gap-4 p-4 h-full">
      <div
        className="flex items-center gap-3 px-4 rounded-md"
        style={{ background: C.surfaceAlt, border: `1.5px solid ${C.border}`, height: 42 }}
      >
        <Search size={15} color={C.textMuted} strokeWidth={1.8} />
        <input
          placeholder="Search by part, job, customer, piecemark or scan ID…"
          className="flex-1 bg-transparent outline-none"
          style={{ fontFamily: "'Lato', sans-serif", fontSize: 15, color: C.text }}
        />
      </div>
      <div className="flex items-center gap-2 flex-wrap">
        {filters.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className="px-3 py-1 rounded-full transition-all"
            style={{
              fontFamily: "'Lato', sans-serif",
              fontSize: 13,
              background: filter === f ? JEWEL.indigo.base : C.surfaceAlt,
              color:      filter === f ? JEWEL.indigo.text : C.textMuted,
              border:     `1.5px solid ${filter === f ? JEWEL.indigo.base : C.border}`,
              cursor: "pointer",
            }}
          >
            {f}
          </button>
        ))}
      </div>
      <div>
        <p className="mb-2" style={{ fontFamily: "'Lato', sans-serif", fontSize: 12, color: C.textMuted, textTransform: "uppercase", letterSpacing: "0.06em" }}>
          Recent searches
        </p>
        <div className="flex flex-wrap gap-2">
          {recent.map((r) => (
            <span
              key={r}
              className="px-3 py-1 rounded"
              style={{
                fontFamily: "'DM Mono', monospace",
                fontSize: 13,
                fontWeight: 600,
                color: JEWEL.indigo.base,
                background: `${JEWEL.indigo.base}1A`,
                border: `1.5px solid ${JEWEL.indigo.base}77`,
                cursor: "pointer",
              }}
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
        style={{ borderBottom: `1.5px solid ${C.border}`, background: C.surfaceAlt }}
      >
        <span style={{ fontFamily: "'Lato', sans-serif", fontSize: 13, color: C.textMuted }}>
          {tasks.filter((t) => t.status === "done").length}/{tasks.length} complete
        </span>
        <button
          className="flex items-center gap-1 px-2.5 py-1 rounded"
          style={{
            fontFamily: "'Lato', sans-serif",
            fontSize: 13,
            fontWeight: 600,
            color: JEWEL.amber.text,
            background: JEWEL.amber.base,
            border: "none",
            cursor: "pointer",
          }}
        >
          <Plus size={11} /> Add task
        </button>
      </div>
      <div className="flex-1 overflow-y-auto">
        {tasks.map((t) => {
          const isDone = t.status === "done";
          const isProgress = t.status === "progress";
          return (
            <div key={t.id} className="flex items-start gap-3 px-4 py-2.5" style={{ borderBottom: `1.5px solid ${C.border}` }}>
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
              <span style={{ fontFamily: "'Lato', sans-serif", fontSize: 14, color: isDone ? C.textMuted : C.text, textDecoration: isDone ? "line-through" : "none", flex: 1, lineHeight: 1.5 }}>
                {t.text}
              </span>
              {t.priority === "high" && !isDone && (
                <StatusPill tone="warn">HIGH</StatusPill>
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
        <div key={p.name} className="py-3" style={{ borderBottom: `1.5px solid ${C.border}` }}>
          <div className="flex items-center justify-between mb-2">
            <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 13, color: C.text }}>{p.name}</span>
            <div className="flex items-center gap-2">
              <span style={{ fontFamily: "'Lato', sans-serif", fontSize: 12, color: C.textMuted }}>Due {p.due}</span>
              <StatusPill tone={p.status === "at-risk" ? "warn" : "ok"}>
                {p.status === "at-risk" ? "AT RISK" : "ON TRACK"}
              </StatusPill>
            </div>
          </div>
          <div className="h-2 rounded-full overflow-hidden" style={{ background: C.surfaceAlt, border: `1.5px solid ${C.border}` }}>
            <div className="h-full rounded-full transition-all" style={{ width: `${p.progress}%`, background: p.status === "at-risk" ? C.warning : C.primary }} />
          </div>
          <div className="flex justify-between mt-1">
            {["0%", `${p.progress}%`, "100%"].map((v) => (
              <span key={v} style={{ fontFamily: "'DM Mono', monospace", fontSize: 10, color: C.textMuted }}>{v}</span>
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
        <span style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 600, fontSize: 15, color: C.text }}>August 2026</span>
        <button style={{ color: C.textMuted, cursor: "pointer" }}><ChevronRight size={14} /></button>
      </div>
      <div className="grid grid-cols-7">
        {days.map((d) => (
          <div key={d} className="text-center py-1" style={{ fontFamily: "'DM Mono', monospace", fontSize: 10, color: C.textMuted, textTransform: "uppercase", letterSpacing: "0.05em" }}>{d}</div>
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
                    fontSize: isToday ? 13 : 12,
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
              borderBottom: `1.5px solid ${C.border}`,
              background: selected ? `${C.primary}18` : i % 2 === 0 ? "transparent" : `${C.surfaceAlt}55`,
              cursor: onSelect ? "pointer" : "default",
              outline: selected ? `1.5px solid ${C.primary}44` : "none",
            }}
          >
            <Truck size={14} color={C.primary} />
            <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 13, color: C.primary, width: 64 }}>{l.id}</span>
            <span className="flex-1 truncate" style={{ fontFamily: "'Lato', sans-serif", fontSize: 14, color: C.text }}>{l.dest}</span>
            <StatusPill tone="ok">{l.status}</StatusPill>
            <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 12, color: C.textMuted }}>{l.eta}</span>
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
      <div className="flex-none flex px-4 py-1.5" style={{ borderBottom: `1.5px solid ${C.border}`, background: C.surfaceAlt }}>
        {["Name", "Role", "Station", "Shift"].map((h) => (
          <div key={h} className="flex-1" style={{ fontFamily: "'DM Mono', monospace", fontSize: 10, color: C.textMuted, textTransform: "uppercase" }}>{h}</div>
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
                borderBottom: `1.5px solid ${C.border}`,
                background: selected ? `${C.primary}18` : i % 2 === 0 ? "transparent" : `${C.surfaceAlt}55`,
                cursor: onSelect ? "pointer" : "default",
              }}
            >
              <div className="flex-1" style={{ fontFamily: "'Lato', sans-serif", fontSize: 14, color: C.text }}>{e.name}</div>
              <div className="flex-1" style={{ fontFamily: "'Lato', sans-serif", fontSize: 14, color: C.textSub }}>{e.role}</div>
              <div className="flex-1" style={{ fontFamily: "'DM Mono', monospace", fontSize: 13, color: C.textMuted }}>{e.station}</div>
              <div className="flex-1" style={{ fontFamily: "'DM Mono', monospace", fontSize: 13, color: C.primary }}>{e.shift}</div>
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
              borderBottom: `1.5px solid ${C.border}`,
              background: selected ? `${C.primary}18` : i % 2 === 0 ? "transparent" : `${C.surfaceAlt}55`,
              cursor: onSelect ? "pointer" : "default",
            }}
          >
            <ArrowLeftRight size={14} color={C.textMuted} />
            <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 12, color: C.primary, width: 52 }}>{q.id}</span>
            <span className="px-1.5 py-0.5 rounded" style={{ fontFamily: "'DM Mono', monospace", fontSize: 10, color: C.textMuted, background: C.surfaceAlt }}>{q.type}</span>
            <span className="flex-1 truncate" style={{ fontFamily: "'Lato', sans-serif", fontSize: 14, color: C.text }}>{q.name}</span>
            <StatusPill
              tone={q.status === "Failed" ? "danger" : q.status === "Running" ? "ok" : "warn"}
            >
              {q.status}
            </StatusPill>
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
              borderBottom: `1.5px solid ${C.border}`,
              background: selected ? `${C.primary}12` : "transparent",
              cursor: onSelect ? "pointer" : "default",
            }}
          >
            <div className="flex items-center justify-between mb-1.5">
              <div>
                <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 12, color: C.primary }}>{s.sku}</span>
                <span className="ml-2" style={{ fontFamily: "'Lato', sans-serif", fontSize: 14, color: C.text }}>{s.name}</span>
              </div>
              <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 12, color: low ? C.danger : high ? C.warning : C.textMuted }}>
                {s.level}/{s.capacity}
              </span>
            </div>
            <div className="h-1.5 rounded-full overflow-hidden" style={{ background: C.surfaceAlt, border: `1.5px solid ${C.border}` }}>
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

function SimpleActionListContent({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="flex-none px-4 py-2" style={{ background: C.surfaceAlt, borderBottom: `1.5px solid ${C.border}` }}>
        <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 12, color: C.textMuted, textTransform: "uppercase", letterSpacing: "0.05em" }}>
          {title}
        </span>
      </div>
      <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-1.5">
        {items.map((item) => (
          <div
            key={item}
            className="px-3 py-2.5 rounded-md"
            style={{ background: C.surfaceAlt, border: `1.5px solid ${C.border}`, fontFamily: "'Lato', sans-serif", fontSize: 15, color: C.text }}
          >
            {item}
          </div>
        ))}
      </div>
    </div>
  );
}

function ReferenceDataListContent() {
  const rows = ["Customers", "Carriers", "Status Codes", "Routing Codes"];
  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="flex-none px-4 py-2" style={{ background: C.surfaceAlt, borderBottom: `1.5px solid ${C.border}` }}>
        <span style={{ fontFamily: "'Lato', sans-serif", fontSize: 13, color: C.textMuted }}>
          Open to edit customers, carriers, and codes.
        </span>
      </div>
      <div className="flex-1 overflow-y-auto">
        {rows.map((r, i) => (
          <div
            key={r}
            className="px-4 py-3"
            style={{
              borderBottom: `1.5px solid ${C.border}`,
              background: i % 2 ? `${C.surfaceAlt}55` : "transparent",
              fontFamily: "'Outfit', sans-serif",
              fontWeight: 600,
              fontSize: 15,
              color: C.text,
            }}
          >
            {r}
          </div>
        ))}
      </div>
    </div>
  );
}

function DangerZoneListContent() {
  const rows = [
    { label: "Active records", tone: "warning" as const },
    { label: "Deleted (recoverable)", tone: "muted" as const },
    { label: "Purge queue", tone: "danger" as const },
  ];
  return (
    <div className="flex flex-col h-full overflow-hidden" style={{ background: C.dangerBg }}>
      <div className="flex-none flex items-center gap-2 px-4 py-2" style={{ background: `${C.danger}18`, borderBottom: `1.5px solid ${C.danger}44` }}>
        <ShieldAlert size={14} color={C.danger} />
        <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 12, color: C.danger, textTransform: "uppercase", letterSpacing: "0.06em" }}>
          Destructive operations
        </span>
      </div>
      <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-2">
        {rows.map((r) => (
          <div
            key={r.label}
            className="px-3 py-2.5 rounded-md"
            style={{
              border: `1.5px solid ${r.tone === "danger" ? C.danger : C.border}`,
              background: C.surface,
              fontFamily: "'Lato', sans-serif",
              fontSize: 15,
              color: r.tone === "danger" ? C.danger : C.text,
            }}
          >
            {r.label}
          </div>
        ))}
      </div>
    </div>
  );
}

function JobListContent({
  selectedKey,
  onSelect,
}: {
  selectedKey?: string | null;
  onSelect?: (key: string) => void;
}) {
  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="flex-none flex px-4 py-1.5" style={{ borderBottom: `1.5px solid ${C.border}`, background: C.surfaceAlt }}>
        {["Job #", "Customer", "Name"].map((h) => (
          <div key={h} className="flex-1" style={{ fontFamily: "'DM Mono', monospace", fontSize: 10, color: C.textMuted, textTransform: "uppercase" }}>{h}</div>
        ))}
      </div>
      <div className="flex-1 overflow-y-auto">
        {EXISTING_JOBS.map((job, i) => {
          const selected = selectedKey === job.number;
          return (
            <div
              key={job.number}
              role={onSelect ? "button" : undefined}
              onClick={onSelect ? () => onSelect(job.number) : undefined}
              className="flex px-4 py-2"
              style={{
                borderBottom: `1.5px solid ${C.border}`,
                background: selected ? `${C.primary}18` : i % 2 === 0 ? "transparent" : `${C.surfaceAlt}55`,
                cursor: onSelect ? "pointer" : "default",
              }}
            >
              <div className="flex-1" style={{ fontFamily: "'DM Mono', monospace", fontSize: 13, color: C.primary }}>{job.number}</div>
              <div className="flex-1" style={{ fontFamily: "'DM Mono', monospace", fontSize: 13, color: C.textMuted }}>{job.customer}</div>
              <div className="flex-1" style={{ fontFamily: "'Lato', sans-serif", fontSize: 14, color: C.text }}>{job.name}</div>
            </div>
          );
        })}
      </div>
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
  if (id === "job-piecemark")  return <JobListContent selectedKey={selectedKey} onSelect={onSelect} />;
  if (id === "piecemark-entry") return <PiecemarkEntryWorkbench />;
  if (id === "reference-data") return <ReferenceDataListContent />;
  if (id === "records-danger") return <DangerZoneListContent />;
  if (id === "reports-labels") return <SimpleActionListContent title="Reports & Labels" items={["Foxfire", "Status", "Barcode ID", "Raw Material", "Label Fields"]} />;
  if (id === "admin-system")   return <SimpleActionListContent title="Admin & System" items={["Preferences", "Printers", "Licenses", "Access", "Permissions", "Logs"]} />;
  return null;
}

// ─── Widget detail popup (left: widget, right: related tabs) ───────────────────
type DetailTab = { id: string; label: string };

const WIDGET_DETAIL_TABS: Record<string, DetailTab[]> = {
  "active-loads": [
    { id: "view-load", label: "View Load Information" },
  ],
  employees: [
    { id: "edit-info", label: "Edit Employee Information" },
    { id: "edit-class", label: "Edit Employee Class Info" },
  ],
  "import-export": [
    { id: "tekla", label: "Tekla XSR Import" },
    { id: "eje", label: "EJE Delimited Import" },
    { id: "sds", label: "SDS/XML Import" },
    { id: "excel", label: "Excel Import" },
  ],
  search: [
    { id: "find-piecemark", label: "Find a Piecemark" },
  ],
  "job-piecemark": [
    { id: "add-job", label: "Add New Job" },
    { id: "edit-job", label: "Edit Job Information" },
  ],
  "piecemark-entry": [
    { id: "enter", label: "Enter Piecemark" },
  ],
  "reference-data": [
    { id: "customers", label: "Edit Customer Information" },
    { id: "carriers", label: "Edit Carrier Information" },
    { id: "status-codes", label: "Edit Status Codes" },
    { id: "routing-codes", label: "Edit Routing Codes" },
  ],
  "records-danger": [
    { id: "delete", label: "Active Record Delete" },
    { id: "recall", label: "Recall Deleted Records" },
    { id: "purge", label: "Purge Deleted Records" },
  ],
  "reports-labels": [
    { id: "foxfire", label: "Foxfire Reports" },
    { id: "status-report", label: "Status Report" },
    { id: "barcode-labels", label: "Barcode ID Labels" },
    { id: "raw-labels", label: "Raw Material Labels" },
    { id: "label-fields", label: "Label Field Report" },
  ],
  "admin-system": [
    { id: "prefs", label: "Preferences" },
    { id: "printer-prefs", label: "Barcode Printer Preferences" },
    { id: "division", label: "Division & License Management" },
    { id: "logon", label: "Logon & Access Management" },
    { id: "permissions", label: "Application Permissions" },
    { id: "view-log", label: "View Log" },
    { id: "license-info", label: "View Logon License Info" },
  ],
  inventory: [
    { id: "item", label: "Item Detail" },
    { id: "reorder", label: "Reorder" },
    { id: "capacity", label: "Capacity" },
  ],
  recent: [
    { id: "scan", label: "Scan Detail" },
  ],
  tasks: [
    { id: "task", label: "Task Detail" },
  ],
  timelines: [
    { id: "schedule", label: "Schedule" },
  ],
  calendar: [
    { id: "events", label: "Day Events" },
  ],
  default: [
    { id: "overview", label: "Overview" },
  ],
};

function detailField(label: string, value: string) {
  return (
    <div className="flex flex-col gap-1">
      <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 10, color: C.textMuted, textTransform: "uppercase", letterSpacing: "0.05em" }}>
        {label}
      </span>
      <span style={{ fontFamily: "'Lato', sans-serif", fontSize: 15, color: C.text }}>{value || "—"}</span>
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
          fontSize: 14,
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
            border: `1.5px solid ${C.border}`,
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
        fontSize: 14,
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
        fontSize: 14,
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
    fontSize: 14,
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
            <label className="flex items-center gap-[7px] shrink-0 whitespace-nowrap" style={fieldStyle}>
              <TokenCheckbox checked={hideEmpty} onChange={setHideEmpty} />
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
            <label className="flex items-center gap-[7px] shrink-0 whitespace-nowrap" style={fieldStyle}>
              <TokenCheckbox checked={includeMinor} onChange={setIncludeMinor} />
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

          <div className="flex flex-col gap-1.5 pb-1 min-w-[200px]" style={{ fontFamily: "'Lato', sans-serif", fontSize: 14, color: C.textSub }}>
            <div className="flex justify-between gap-4"><span>Bar Code ID Numbers:</span><span style={{ fontFamily: "'DM Mono', monospace" }}>{totalMarks}</span></div>
            <div className="flex justify-between gap-4"><span>Total Pieces:</span><span style={{ fontFamily: "'DM Mono', monospace" }}>{totalPieces}</span></div>
            <div className="flex justify-between gap-4"><span>Total Weight:</span><span style={{ fontFamily: "'DM Mono', monospace" }}>{load.weightLbs}</span></div>
            <div className="flex justify-between gap-4"><span>Number of Piece Marks:</span><span style={{ fontFamily: "'DM Mono', monospace" }}>{totalMarks}</span></div>
          </div>
        </div>

        <div className="flex flex-wrap justify-end gap-2 mt-4 pt-3" style={{ borderTop: `1.5px solid ${C.border}` }}>
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
                fontSize: 14,
                minWidth: 110,
                cursor: "pointer",
                background: btn.primary ? C.primary : C.surfaceAlt,
                color: btn.primary ? C.primaryFg : C.textMuted,
                border: `1.5px solid ${btn.primary ? C.primary : C.border}`,
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

function stubForm(fields: { label: string; value?: string }[], cta = "Save") {
  return (
    <div className="flex flex-col gap-3 p-4 max-w-lg">
      {fields.map((f) => (
        <label key={f.label} className="flex flex-col gap-1">
          <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 10, color: C.textMuted, textTransform: "uppercase" }}>{f.label}</span>
          <input
            defaultValue={f.value ?? ""}
            style={{ height: 36, borderRadius: 6, border: `1.5px solid ${C.border}`, background: C.surfaceAlt, padding: "0 10px", fontFamily: "'Lato', sans-serif", fontSize: 15, color: C.text }}
          />
        </label>
      ))}
      <button type="button" className="self-start px-3 py-1.5 rounded-md" style={{ background: C.primary, color: C.primaryFg, border: "none", fontFamily: "'DM Mono', monospace", fontSize: 12, cursor: "pointer" }}>
        {cta}
      </button>
    </div>
  );
}

function DangerConfirmPanel({
  title,
  body,
  confirmLabel,
}: {
  title: string;
  body: string;
  confirmLabel: string;
}) {
  const [armed, setArmed] = useState(false);
  return (
    <div className="flex flex-col gap-4 p-4 max-w-lg" style={{ background: C.dangerBg }}>
      <div className="flex items-start gap-2">
        <ShieldAlert size={18} color={C.danger} className="mt-0.5 shrink-0" />
        <div>
          <p style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 600, fontSize: 17, color: C.danger }}>{title}</p>
          <p className="mt-1" style={{ fontFamily: "'Lato', sans-serif", fontSize: 15, color: C.textSub, lineHeight: 1.6 }}>{body}</p>
        </div>
      </div>
      <label className="flex items-center gap-[7px]" style={{ fontFamily: "'Lato', sans-serif", fontSize: 15, color: C.text, cursor: "pointer" }}>
        <TokenCheckbox checked={armed} onChange={setArmed} />
        I understand this cannot be undone without recall / backup
      </label>
      <button
        type="button"
        disabled={!armed}
        className="self-start px-3 py-1.5 rounded-md"
        style={{
          background: armed ? C.danger : C.border,
          color: C.primaryFg,
          border: "none",
          fontFamily: "'DM Mono', monospace",
          fontSize: 12,
          cursor: armed ? "pointer" : "not-allowed",
          opacity: armed ? 1 : 0.6,
        }}
      >
        {confirmLabel}
      </button>
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
  const needsSelection =
    (widgetId === "active-loads" || widgetId === "inventory") ||
    (widgetId === "employees" && tabId === "edit-info") ||
    (widgetId === "job-piecemark" && tabId === "edit-job");
  if (needsSelection && !selectedKey) {
    return (
      <div className="flex items-center justify-center h-full px-6 text-center">
        <p style={{ fontFamily: "'Lato', sans-serif", fontSize: 15, color: C.textMuted, lineHeight: 1.6 }}>
          Select an item in the list on the left to view and edit related details here.
        </p>
      </div>
    );
  }

  if (widgetId === "active-loads") {
    const load = ACTIVE_LOADS.find((l) => l.id === selectedKey);
    if (!load) return null;
    if (tabId === "view-load") return <ActiveLoadInformationForm load={load} />;
  }

  if (widgetId === "employees") {
    if (tabId === "edit-class") return <EmployeeClassEditorPanel />;
    const emp = EMPLOYEES.find((e) => e.name === selectedKey);
    if (!emp) return null;
    if (tabId === "edit-info") return <EmployeeInfoEditor emp={emp} />;
  }

  if (widgetId === "inventory") {
    const item = INVENTORY_STOCK.find((s) => s.sku === selectedKey);
    if (!item) return null;
    const pct = Math.round((item.level / item.capacity) * 100);
    if (tabId === "item") return <div className="grid grid-cols-2 gap-4 p-4">{detailField("SKU", item.sku)}{detailField("Name", item.name)}{detailField("On hand", String(item.level))}{detailField("Capacity", String(item.capacity))}{detailField("Fill", `${pct}%`)}</div>;
    if (tabId === "reorder") return <div className="p-4 flex flex-col gap-3"><p style={{ fontFamily: "'Lato', sans-serif", fontSize: 15, color: C.textSub }}>Reorder point: {Math.round(item.capacity * 0.25)}. Suggested order: {Math.max(0, Math.round(item.capacity * 0.6) - item.level)} units.</p><button type="button" className="self-start px-3 py-1.5 rounded-md" style={{ background: C.primary, color: C.primaryFg, fontFamily: "'DM Mono', monospace", fontSize: 12, border: "none", cursor: "pointer" }}>Create PO</button></div>;
    return <div className="p-4"><p style={{ fontFamily: "'Lato', sans-serif", fontSize: 15, color: C.textSub }}>Bin capacity utilization is {pct}%.</p></div>;
  }

  if (widgetId === "import-export") {
    if (tabId === "tekla") return <ImportFilterForm kind="tekla" />;
    if (tabId === "eje") return <ImportFilterForm kind="eje" />;
    if (tabId === "sds") return <ImportFilterForm kind="sds" />;
    if (tabId === "excel") return <ImportFilterForm kind="excel" />;
  }

  if (widgetId === "search" && tabId === "find-piecemark") {
    return stubForm([
      { label: "Piecemark", value: "" },
      { label: "Job Number", value: "" },
      { label: "Drawing", value: "" },
    ], "Find Piecemark");
  }

  if (widgetId === "job-piecemark") {
    if (tabId === "add-job") return <AddNewJobForm mode="add" selectedJobNumber={null} />;
    if (tabId === "edit-job") return <AddNewJobForm mode="edit" selectedJobNumber={selectedKey} />;
  }

  if (widgetId === "piecemark-entry") {
    return <PiecemarkEntryWorkbench />;
  }

  if (widgetId === "reference-data") {
    if (tabId === "customers") return <CustomerEditorPanel />;
    if (tabId === "carriers") return <CarrierEditorPanel />;
    if (tabId === "status-codes") return <StatusCodesEditorPanel />;
    if (tabId === "routing-codes") return <RoutingCodesEditorPanel />;
  }

  if (widgetId === "records-danger") {
    if (tabId === "delete") {
      return <DangerConfirmPanel title="Active Record Delete" body="Permanently marks the selected active record as deleted. It can still be recalled until purged." confirmLabel="Delete Active Record" />;
    }
    if (tabId === "recall") {
      return stubForm([{ label: "Deleted Record ID", value: "" }, { label: "Reason", value: "" }], "Recall Record");
    }
    if (tabId === "purge") {
      return <DangerConfirmPanel title="Purge Deleted Records" body="Irreversibly removes deleted records from the database. This is the Danger Zone operation — confirm carefully." confirmLabel="Purge Forever" />;
    }
  }

  if (widgetId === "reports-labels") {
    const titles: Record<string, string> = {
      foxfire: "Foxfire Reports",
      "status-report": "Status Report",
      "barcode-labels": "Barcode ID Labels",
      "raw-labels": "Raw Material Labels",
      "label-fields": "Label Field Report",
    };
    return (
      <div className="flex flex-col gap-3 p-4 max-w-lg">
        <p style={{ fontFamily: "'Lato', sans-serif", fontSize: 15, color: C.textSub }}>{titles[tabId] ?? "Report"}</p>
        {stubForm([{ label: "Job Number", value: "" }, { label: "Date Range", value: "This week" }], "Generate")}
      </div>
    );
  }

  if (widgetId === "admin-system") {
    return stubForm([
      { label: "Setting", value: tabId },
      { label: "Value", value: "" },
    ], "Apply");
  }

  const meta = PANEL_META[widgetId];
  return (
    <div className="p-4 flex flex-col gap-3">
      <p style={{ fontFamily: "'Lato', sans-serif", fontSize: 15, color: C.textSub, lineHeight: 1.7 }}>
        {meta?.description ?? "Related details for this widget."}
      </p>
      {selectedKey && detailField("Selected", selectedKey)}
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
        : widgetId === "job-piecemark" ? EXISTING_JOBS[0]?.number ?? null
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
  const selectable = ["active-loads", "employees", "inventory", "job-piecemark"].includes(widgetId);
  const isDanger = WIDGET_CATALOG.find((w) => w.id === widgetId)?.danger === true;
  const headerJewel = panelJewel(widgetId);
  /** Full-window editors — no left preview/list pane */
  const fullWindow = widgetId === "reference-data" || widgetId === "piecemark-entry";
  const showTabs = tabs.length > 1;

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
          border: `1.5px solid ${C.border}`,
          borderRadius: isCompact ? "16px 16px 0 0" : 12,
          boxShadow: `0 24px 60px ${C.text}14`,
          margin: isCompact ? 0 : 20,
        }}
      >
        <div
          className="flex-none flex items-center justify-between px-4 py-3"
          style={{
            background: headerJewel.base,
            color: "#FFFFFF",
          }}
        >
          <span className="flex items-center gap-2" style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 600, fontSize: 21 }}>
            {isDanger && <ShieldAlert size={18} />}
            {meta?.title ?? widgetId}
          </span>
          <button type="button" onClick={onClose} style={{ color: C.primaryFg, cursor: "pointer", lineHeight: 0 }}>
            <X size={18} />
          </button>
        </div>

        <div
          className={`flex-1 min-h-0 ${
            fullWindow
              ? "flex flex-col"
              : `grid ${isCompact ? "grid-rows-2" : "grid-cols-[minmax(280px,0.95fr)_1.2fr]"}`
          }`}
        >
          {!fullWindow && (
            <div
              className="min-h-0 flex flex-col overflow-hidden"
              style={{ borderRight: isCompact ? "none" : `1.5px solid ${C.border}`, borderBottom: isCompact ? `1.5px solid ${C.border}` : "none" }}
            >
              <div className="flex-none px-4 py-2" style={{ background: C.surfaceAlt, borderBottom: `1.5px solid ${C.border}` }}>
                <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 12, color: C.textMuted, letterSpacing: "0.05em", textTransform: "uppercase" }}>
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
          )}

          <div className="min-h-0 flex flex-col overflow-hidden flex-1" style={{ background: C.bg }}>
            {showTabs && (
              <div
                className="flex-none flex items-end gap-1 px-3 pt-2 overflow-x-auto"
                style={{ borderBottom: `1.5px solid ${C.border}`, background: C.surface }}
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
                        fontSize: 12,
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
            )}
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
  const isDanger = WIDGET_CATALOG.find((w) => w.id === id)?.danger === true;
  const handleSize = 10;
  const corner = 14;
  const metal = isStat ? jewelForStat(id) : null;
  const jewel = metal ?? panelJewel(id);

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
        background: C.accent,
        opacity: 0.7,
        position: "absolute",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
      }}
    />
  );

  const chromeBg = metal
    ? metalFill(metal)
    : isEditing || isDanger
    ? C.surface
    : gradientBorderFill(C.surface, jewel.base);

  const chromeBorder = isEditing
    ? `2px dashed ${C.accent}`
    : isDanger
    ? `1.5px solid ${C.danger}66`
    : "1.5px solid transparent";

  const chromeShadow = isHovered && !isEditing
    ? metal
      ? `0 6px 20px ${metal.base}40, 0 1px 0 ${metal.light}55 inset`
      : `0 4px 16px ${jewel.base}18`
    : isEditing
    ? `0 0 0 1px ${C.accent}22, inset 0 0 0 1000px ${C.accent}06`
    : isDanger
    ? `inset 0 0 0 1000px ${C.danger}08`
    : metal
    ? metalShadow(metal)
    : `0 2px 10px ${jewel.base}10`;

  return (
    <div
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      onClick={onClick}
      style={{
        gridColumn: `${colStart} / ${colStart + colSpan}`,
        gridRow:    `${rowStart} / ${rowStart + rowSpan}`,
        background: chromeBg,
        border: chromeBorder,
        borderRadius: 12,
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        position: "relative",
        cursor: isEditing ? (isDragging ? "grabbing" : "grab") : "pointer",
        opacity:   isGhosted ? GHOST_OPACITY : 1,
        filter:    isGhosted ? GHOST_SATURATE : "none",
        transform: isHovered && !isEditing ? "scale(1.002)" : "scale(1)",
        boxShadow: chromeShadow,
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
      {!isStat && <PanelHeader title={PANEL_META[id]?.title ?? id} accent={jewel.base} />}

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
                    background: C.accent,
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

function WidgetPickerDropdown({
  options,
  onPick,
  onClose,
}: {
  options: WidgetCatalogEntry[];
  onPick: (id: WidgetTypeId) => void;
  onClose: () => void;
}) {
  if (options.length === 0) {
    return (
      <div
        className="rounded-lg p-3"
        style={{ background: C.surface, border: `1.5px solid ${C.border}`, boxShadow: `0 12px 28px ${C.text}22`, minWidth: 220 }}
        onClick={(e) => e.stopPropagation()}
      >
        <p style={{ fontFamily: "'Lato', sans-serif", fontSize: 14, color: C.textMuted }}>
          All widgets are already on the dashboard.
        </p>
        <button
          type="button"
          className="mt-2 self-start"
          style={{ fontFamily: "'DM Mono', monospace", fontSize: 12, color: C.primary, cursor: "pointer" }}
          onClick={onClose}
        >
          Close
        </button>
      </div>
    );
  }

  return (
    <div
      className="rounded-lg overflow-hidden flex flex-col"
      style={{
        background: C.surface,
        border: `1.5px solid ${C.border}`,
        boxShadow: `0 14px 32px ${C.text}28`,
        width: 260,
        maxHeight: 320,
      }}
      onClick={(e) => e.stopPropagation()}
      onMouseDown={(e) => e.stopPropagation()}
    >
      <div
        className="flex-none flex items-center justify-between px-3 py-2"
        style={{ background: C.surfaceAlt, borderBottom: `1.5px solid ${C.border}` }}
      >
        <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 12, letterSpacing: "0.05em", color: C.text, textTransform: "uppercase" }}>
          Add widget
        </span>
        <button type="button" onClick={onClose} style={{ color: C.textMuted, cursor: "pointer", lineHeight: 0 }}>
          <X size={14} />
        </button>
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto py-1">
        {options.map((opt) => {
          const Icon = opt.Icon;
          return (
            <button
              key={opt.id}
              type="button"
              className="w-full flex items-start gap-2.5 px-3 py-2 text-left"
              style={{ background: "transparent", border: "none", cursor: "pointer" }}
              onMouseEnter={(e) => { e.currentTarget.style.background = C.surfaceAlt; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}
              onClick={() => onPick(opt.id)}
            >
              <Icon size={15} color={C.primary} className="mt-0.5 shrink-0" />
              <span className="min-w-0 flex-1">
                <span
                  className="block"
                  style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 600, fontSize: 14, color: C.text }}
                >
                  {opt.title}
                </span>
                <span
                  className="block"
                  style={{ fontFamily: "'Lato', sans-serif", fontSize: 13, color: C.textSub, lineHeight: 1.35 }}
                >
                  {opt.blurb}
                </span>
              </span>
            </button>
          );
        })}
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
  const pinRight = col >= COLS - 1;
  const pinBottom = row >= ROWS - 2;

  const pickerStyle: React.CSSProperties = {
    position: "absolute",
    zIndex: 50,
    left: pinRight ? undefined : 0,
    right: pinRight ? 0 : undefined,
    top: pinBottom ? undefined : "100%",
    bottom: pinBottom ? "100%" : undefined,
    marginTop: pinBottom ? undefined : 4,
    marginBottom: pinBottom ? 4 : undefined,
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
          <WidgetPickerDropdown options={options} onPick={onPick} onClose={onClose} />
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
        color: C.taskbarFg,
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
          background: dark ? "rgba(255,255,255,0.28)" : "rgba(255,255,255,0.18)",
          border: "1.5px solid rgba(255,255,255,0.35)",
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
            borderRadius: "50%",
            background: C.taskbarFg,
            boxShadow: "0 1px 3px rgba(0,0,0,0.25)",
            transition: "left 160ms ease",
          }}
        />
      </span>
      <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 10, letterSpacing: "0.04em", textTransform: "uppercase" }}>
        {dark ? "Dark" : "Light"}
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
        background: active  ? "rgba(255,255,255,0.22)"
                  : primary ? "rgba(255,255,255,0.16)"
                  : "transparent",
        color:      C.taskbarFg,
        border:     active || primary
                  ? "1.5px solid rgba(255,255,255,0.45)"
                  : "1.5px solid transparent",
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
        const { Icon, metal } = s;
        return (
          <div
            key={s.id}
            className="rounded-lg p-3 flex flex-col gap-1.5 min-w-0 relative overflow-hidden"
            style={{
              background: metalFill(metal),
              border: "1.5px solid transparent",
              borderRadius: 12,
              boxShadow: metalShadow(metal),
            }}
          >
            <div
              className="absolute top-0 left-0 right-0 h-px pointer-events-none"
              style={{ background: metalSpecular(metal) }}
            />
            <div className="flex items-center justify-between gap-1 relative z-[1]">
              <span
                className="truncate"
                style={{
                  fontFamily: "'Lato', sans-serif",
                  fontSize: 12,
                  color: metal.text,
                  opacity: 0.8,
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                  fontWeight: 700,
                }}
              >
                {s.label}
              </span>
              <Icon size={14} color={metal.text} strokeWidth={1.8} className="shrink-0" style={{ opacity: 0.8 }} />
            </div>
            <p style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 700, fontSize: 28, color: metal.text, lineHeight: 1 }} className="relative z-[1]">
              {s.value}
            </p>
            <p className="truncate relative z-[1]" style={{ fontFamily: "'Lato', sans-serif", fontSize: 12, color: metal.text, opacity: 0.9 }}>
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
  const jewel = panelJewel(id);
  return (
    <div
      className="rounded-lg overflow-hidden flex flex-col"
      style={{
        background: gradientBorderFill(C.surface, jewel.base),
        border: "1.5px solid transparent",
        borderRadius: 12,
        boxShadow: `0 2px 10px ${jewel.base}10`,
      }}
    >
      <button
        type="button"
        onClick={onToggle}
        className="flex-none flex items-center justify-between gap-3 px-4 py-3 w-full text-left"
        style={{
          background: C.surface,
          borderBottom: open ? `1px solid ${C.border}` : "none",
          cursor: "pointer",
          minHeight: 44,
        }}
        aria-expanded={open}
      >
        <span
          style={{
            fontFamily: "'DM Mono', monospace",
            fontSize: 13,
            fontWeight: 600,
            color: jewel.base,
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

function AddNewJobForm({
  mode,
  selectedJobNumber,
}: {
  mode: "add" | "edit";
  selectedJobNumber: string | null;
}) {
  const job = EXISTING_JOBS.find((j) => j.number === selectedJobNumber);
  const [form, setForm] = useState<AddJobFormState>(() => ({
    ...INIT_JOB_FORM,
    ...(job ? { jobNumber: job.number, customer: `${job.name}#${job.customer}` } : {}),
  }));
  const [metricJob, setMetricJob] = useState(false);
  const [checks, setChecks] = useState({
    keepMinors: false,
    validateHeats: false,
    validatePipes: false,
    validateFittings: false,
  });

  useEffect(() => {
    if (mode !== "edit" || !job) return;
    setForm((f) => ({
      ...f,
      jobNumber: job.number,
      customer: `${job.name}#${job.customer}`,
    }));
  }, [mode, job]);

  const inputStyle: React.CSSProperties = {
    width: "100%",
    height: "100%",
    border: "none",
    background: "transparent",
    outline: "none",
    fontFamily: "'Lato', sans-serif",
    fontSize: 14,
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
              <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 12, color: C.textMuted }}>lbs</span>
            )}
            {opts?.metric && (
              <label className="flex items-center gap-[7px]" style={{ fontFamily: "'Lato', sans-serif", fontSize: 14, color: C.textSub }}>
                <TokenCheckbox checked={metricJob} onChange={setMetricJob} />
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
    <form
      className="h-full overflow-y-auto p-4"
      style={{ background: C.surface }}
      onSubmit={(e) => e.preventDefault()}
    >
      <div className="flex flex-col gap-2 max-w-3xl">
        <p style={{ fontFamily: "'DM Mono', monospace", fontSize: 12, color: C.textMuted, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 4 }}>
          {mode === "add" ? "Add New Job" : `Edit Job${job ? ` — ${job.number}` : ""}`}
        </p>
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

        <div className="mt-2 pt-3 grid grid-cols-1 sm:grid-cols-2 gap-2" style={{ borderTop: `1.5px solid ${C.border}` }}>
          {([
            ["keepMinors", "Keep Minors on Import (Prefix=No)"],
            ["validateHeats", "Validate Heats"],
            ["validatePipes", "Validate Pipes"],
            ["validateFittings", "Validate Fittings"],
          ] as const).map(([key, label]) => (
            <label key={key} className="flex items-center gap-[7px]" style={{ fontFamily: "'Lato', sans-serif", fontSize: 14, color: C.textSub }}>
              <TokenCheckbox
                checked={checks[key]}
                onChange={(next) => setChecks((c) => ({ ...c, [key]: next }))}
              />
              {label}
            </label>
          ))}
        </div>

        <div className="flex flex-wrap justify-end gap-2 mt-4 pt-3" style={{ borderTop: `1.5px solid ${C.border}` }}>
          <button
            type="submit"
            className="px-3 py-1.5 rounded-sm flex items-center justify-center gap-1.5"
            style={{
              fontFamily: "'Lato', sans-serif",
              fontSize: 14,
              minWidth: 110,
              cursor: "pointer",
              background: C.primary,
              color: C.primaryFg,
              border: `1.5px solid ${C.primary}`,
            }}
          >
            {mode === "add" ? <><Plus size={12} /> Add Job</> : "Save Job"}
          </button>
        </div>
      </div>
    </form>
  );
}

function KissImportModal({
  open,
  isCompact,
  onClose,
}: {
  open: boolean;
  isCompact: boolean;
  onClose: () => void;
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (ev: KeyboardEvent) => {
      if (ev.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

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
          maxWidth: isCompact ? "100%" : 640,
          maxHeight: isCompact ? "92vh" : "85vh",
          background: C.surface,
          border: `1.5px solid ${C.border}`,
          borderRadius: isCompact ? "16px 16px 0 0" : 12,
          boxShadow: `0 24px 60px ${C.text}14`,
          margin: isCompact ? 0 : 20,
        }}
      >
        <div className="flex-none flex items-center justify-between px-4 py-3" style={{ background: C.primary, color: C.primaryFg }}>
          <span style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 600, fontSize: 21 }}>KISS Import</span>
          <button type="button" onClick={onClose} style={{ color: C.primaryFg, cursor: "pointer", lineHeight: 0 }}>
            <X size={18} />
          </button>
        </div>
        <div className="flex-1 min-h-0 overflow-hidden">
          <ImportFilterForm kind="kiss" onClose={onClose} />
        </div>
      </div>
    </div>
  );
}

// ─── App ──────────────────────────────────────────────────────────────────────
export default function App() {
  const isCompact = useIsCompact();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isDark, setIsDark] = useState(false);
  const [isKissImportOpen, setIsKissImportOpen] = useState(false);
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

  const openKissImport = useCallback(() => {
    setIsKissImportOpen(true);
    setDetailWidgetId(null);
  }, []);

  const anyHovered = hoveredId !== null;
  const isDetailOpen = detailWidgetId !== null;
  const isModalOpen = isDetailOpen || isKissImportOpen;

  if (!isLoggedIn) {
    applyColorTokens(false);
    return <LoginPage C={C} onLogin={() => setIsLoggedIn(true)} />;
  }

  return (
    <div
      className="h-screen flex flex-col select-none"
      style={{ background: C.bg }}
    >
      <div
        className="flex-1 min-h-0 flex flex-col"
        style={{
          opacity: isModalOpen ? GHOST_OPACITY : 1,
          filter: isModalOpen ? GHOST_SATURATE : "none",
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
                    style={{ background: `${C.accent}06`, border: `1px dashed ${C.accent}28` }}
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
          background: C.taskbarBg,
          borderTop: `1.5px solid ${JEWEL.indigo.dark}`,
        }}
      >
        <div className={`flex justify-start shrink-0 ${isCompact ? "" : "flex-1 min-w-0"}`}>
          <DarkModeToggle dark={isDark} onToggle={() => setIsDark((v) => !v)} />
        </div>
        <div className={`flex items-center justify-center gap-2 min-w-0 ${isCompact ? "flex-1" : ""}`}>
          {isCompact ? (
            <>
              <TaskbarBtn icon={HelpCircle} label="FAQ & Support" grow />
              <TaskbarBtn icon={ScanLine}   label="New Scan" primary grow onClick={openKissImport} />
              <TaskbarBtn icon={Settings}   label="Settings" grow />
            </>
          ) : (
            <>
              <TaskbarBtn icon={Settings}   label="Settings"      />
              <TaskbarBtn icon={HelpCircle} label="FAQ & Support" />
              <TaskbarBtn icon={Upload}     label="KISS Import"   primary onClick={openKissImport} />
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
          <TaskbarBtn
            icon={LogOut}
            label="Log Out"
            onClick={() => {
              setIsLoggedIn(false);
              setIsEditing(false);
              setDetailWidgetId(null);
              setIsKissImportOpen(false);
            }}
          />
        </div>
      </div>
      </div>
      <KissImportModal open={isKissImportOpen} isCompact={isCompact} onClose={() => setIsKissImportOpen(false)} />
      <WidgetDetailModal
        open={isDetailOpen}
        widgetId={detailWidgetId}
        isCompact={isCompact}
        onClose={handleCloseDetail}
      />
    </div>
  );
}
