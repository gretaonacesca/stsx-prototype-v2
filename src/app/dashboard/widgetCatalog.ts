import type { LucideIcon } from "lucide-react";
import {
  BarChart3, CheckCircle, AlertTriangle, TrendingUp, ScanLine,
  Truck, Users, ArrowLeftRight, Package,
} from "lucide-react";
import { JEWEL, type JewelMetal } from "../colorTokens";

export const COLS = 12;
export const ROWS = 8;
export const GAP = 10;
export const MIN_COL_SPAN = 1;
export const MIN_ROW_SPAN = 1;

export type VizWidgetId =
  | "stat1" | "stat2" | "stat3" | "stat4"
  | "recent" | "active-loads" | "employees" | "import-export" | "inventory";

export type PanelDef = {
  id: VizWidgetId;
  colStart: number;
  colSpan: number;
  rowStart: number;
  rowSpan: number;
};

export type ResizeEdge = "n" | "s" | "e" | "w" | "ne" | "nw" | "se" | "sw";

export type WidgetCatalogEntry = {
  id: VizWidgetId;
  title: string;
  blurb: string;
  defaultColSpan: number;
  defaultRowSpan: number;
  Icon: LucideIcon;
  jewel: JewelMetal;
};

export const VIZ_CATALOG: WidgetCatalogEntry[] = [
  { id: "stat1", title: "Active Jobs", blurb: "KPI — jobs in production", defaultColSpan: 2, defaultRowSpan: 2, Icon: BarChart3, jewel: JEWEL.viridian },
  { id: "stat2", title: "Scans Today", blurb: "KPI — daily scan volume", defaultColSpan: 2, defaultRowSpan: 2, Icon: CheckCircle, jewel: JEWEL.chrome },
  { id: "stat3", title: "Pending Reviews", blurb: "KPI — QC backlog", defaultColSpan: 2, defaultRowSpan: 2, Icon: AlertTriangle, jewel: JEWEL.indigo },
  { id: "stat4", title: "On-Time Rate", blurb: "KPI — delivery performance", defaultColSpan: 2, defaultRowSpan: 2, Icon: TrendingUp, jewel: JEWEL.lime },
  { id: "recent", title: "Recent Scans", blurb: "Live shop-floor scan feed", defaultColSpan: 4, defaultRowSpan: 4, Icon: ScanLine, jewel: JEWEL.viridian },
  { id: "active-loads", title: "Active Loads", blurb: "Loads in transit / staging", defaultColSpan: 4, defaultRowSpan: 3, Icon: Truck, jewel: JEWEL.viridian },
  { id: "employees", title: "Manage Employees", blurb: "Crew roster", defaultColSpan: 4, defaultRowSpan: 3, Icon: Users, jewel: JEWEL.indigo },
  { id: "import-export", title: "Import / Export Queue", blurb: "Pipeline status", defaultColSpan: 4, defaultRowSpan: 3, Icon: ArrowLeftRight, jewel: JEWEL.lime },
  { id: "inventory", title: "Stock & Inventory", blurb: "Levels and capacity", defaultColSpan: 4, defaultRowSpan: 3, Icon: Package, jewel: JEWEL.lime },
];

export const PANEL_META: Record<string, { title: string; blurb: string }> = Object.fromEntries(
  VIZ_CATALOG.map((w) => [w.id, { title: w.title, blurb: w.blurb }])
);

export function catalogEntry(id: string): WidgetCatalogEntry | undefined {
  return VIZ_CATALOG.find((w) => w.id === id);
}

export function panelJewel(id: string): JewelMetal {
  return catalogEntry(id)?.jewel ?? JEWEL.viridian;
}

export const DEFAULT_LAYOUT: PanelDef[] = [
  { id: "stat1", colStart: 1, colSpan: 2, rowStart: 1, rowSpan: 2 },
  { id: "stat2", colStart: 3, colSpan: 2, rowStart: 1, rowSpan: 2 },
  { id: "stat3", colStart: 5, colSpan: 2, rowStart: 1, rowSpan: 2 },
  { id: "stat4", colStart: 7, colSpan: 2, rowStart: 1, rowSpan: 2 },
  { id: "recent", colStart: 1, colSpan: 4, rowStart: 3, rowSpan: 6 },
  { id: "active-loads", colStart: 5, colSpan: 4, rowStart: 3, rowSpan: 3 },
  { id: "inventory", colStart: 5, colSpan: 4, rowStart: 6, rowSpan: 3 },
  { id: "employees", colStart: 9, colSpan: 4, rowStart: 1, rowSpan: 4 },
  { id: "import-export", colStart: 9, colSpan: 4, rowStart: 5, rowSpan: 4 },
];

export function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

function rectsOverlap(
  a: { colStart: number; colSpan: number; rowStart: number; rowSpan: number },
  b: { colStart: number; colSpan: number; rowStart: number; rowSpan: number }
) {
  const aColEnd = a.colStart + a.colSpan;
  const aRowEnd = a.rowStart + a.rowSpan;
  const bColEnd = b.colStart + b.colSpan;
  const bRowEnd = b.rowStart + b.rowSpan;
  return a.colStart < bColEnd && aColEnd > b.colStart && a.rowStart < bRowEnd && aRowEnd > b.rowStart;
}

export function isRectFree(
  candidate: { colStart: number; colSpan: number; rowStart: number; rowSpan: number },
  panels: PanelDef[],
  ignoreId?: string
) {
  if (candidate.colStart < 1 || candidate.rowStart < 1) return false;
  if (candidate.colStart + candidate.colSpan - 1 > COLS || candidate.rowStart + candidate.rowSpan - 1 > ROWS) return false;
  return panels.every((p) => p.id === ignoreId || !rectsOverlap(candidate, p));
}

export function getEmptyCells(panels: PanelDef[]) {
  const occupied = new Set<string>();
  for (const p of panels) {
    for (let r = p.rowStart; r < p.rowStart + p.rowSpan; r++) {
      for (let c = p.colStart; c < p.colStart + p.colSpan; c++) {
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

export function fitNewPanel(
  id: VizWidgetId,
  col: number,
  row: number,
  panels: PanelDef[]
): PanelDef | null {
  const entry = catalogEntry(id);
  if (!entry) return null;
  let colSpan = Math.min(entry.defaultColSpan, COLS - col + 1);
  let rowSpan = Math.min(entry.defaultRowSpan, ROWS - row + 1);
  while (colSpan >= MIN_COL_SPAN && rowSpan >= MIN_ROW_SPAN) {
    const candidate = { id, colStart: col, colSpan, rowStart: row, rowSpan };
    if (isRectFree(candidate, panels)) return candidate;
    if (colSpan > MIN_COL_SPAN) colSpan--;
    else if (rowSpan > MIN_ROW_SPAN) rowSpan--;
    else break;
  }
  return null;
}

export function nearestColLine(relX: number, gridW: number) {
  const cell = (gridW - (COLS - 1) * GAP) / COLS + GAP;
  return clamp(Math.round(relX / cell) + 1, 1, COLS + 1);
}

export function nearestRowLine(relY: number, gridH: number) {
  const cell = (gridH - (ROWS - 1) * GAP) / ROWS + GAP;
  return clamp(Math.round(relY / cell) + 1, 1, ROWS + 1);
}

export function applyResize(
  panel: PanelDef,
  edge: ResizeEdge,
  colLine: number,
  rowLine: number
): PanelDef {
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

export const EDGE_CURSORS: Record<ResizeEdge, string> = {
  n: "ns-resize", s: "ns-resize", e: "ew-resize", w: "ew-resize",
  ne: "nesw-resize", nw: "nwse-resize", se: "nwse-resize", sw: "nesw-resize",
};
