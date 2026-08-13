import { BarChart3, CheckCircle, AlertTriangle, TrendingUp } from "lucide-react";
import { JEWEL, type JewelMetal } from "../colorTokens";

export type TimeRange = "24h" | "7d" | "30d" | "all";

export const TIME_RANGE_LABELS: Record<TimeRange, string> = {
  "24h": "Past 24h",
  "7d": "Past 1 week",
  "30d": "Past 30 days",
  all: "All time",
};

export const STATS: {
  id: string;
  label: string;
  value: string;
  sub: string;
  metal: JewelMetal;
  Icon: typeof BarChart3;
}[] = [
  { id: "stat1", label: "Active Jobs", value: "47", sub: "+3 since yesterday", metal: JEWEL.viridian, Icon: BarChart3 },
  { id: "stat2", label: "Scans Today", value: "183", sub: "94.0% pass rate", metal: JEWEL.chrome, Icon: CheckCircle },
  { id: "stat3", label: "Pending Reviews", value: "12", sub: "3 overdue", metal: JEWEL.indigo, Icon: AlertTriangle },
  { id: "stat4", label: "On-Time Rate", value: "94.2%", sub: "↑ 2.1pp this week", metal: JEWEL.lime, Icon: TrendingUp },
];

export type ScanRow = {
  id: string;
  part: string;
  desc: string;
  qty: number;
  time: string;
  status: "passed" | "review" | "failed";
  /** Hours ago — for time-cap filtering in the toy */
  hoursAgo: number;
};

export const SCANS: ScanRow[] = [
  { id: "SC-2847", part: "PT-1042-A", desc: "Beam Flange Cut", qty: 24, time: "09:41", status: "passed", hoursAgo: 1 },
  { id: "SC-2846", part: "PT-0837-B", desc: "Web Plate 12 mm", qty: 12, time: "09:38", status: "passed", hoursAgo: 2 },
  { id: "SC-2845", part: "PT-2201", desc: "Angle Brace L75", qty: 8, time: "09:22", status: "review", hoursAgo: 5 },
  { id: "SC-2844", part: "PT-0442", desc: "End Plate 20 mm", qty: 16, time: "09:15", status: "passed", hoursAgo: 8 },
  { id: "SC-2843", part: "PT-1199-C", desc: "Column Cap Plate", qty: 4, time: "08:57", status: "passed", hoursAgo: 12 },
  { id: "SC-2842", part: "PT-0672", desc: "Gusset Plate", qty: 32, time: "08:43", status: "passed", hoursAgo: 20 },
  { id: "SC-2841", part: "PT-3301", desc: "Purlin Z200", qty: 48, time: "08:30", status: "failed", hoursAgo: 30 },
  { id: "SC-2840", part: "PT-1042-B", desc: "Beam Flange Cut", qty: 24, time: "08:21", status: "passed", hoursAgo: 48 },
  { id: "SC-2839", part: "PT-0837-A", desc: "Web Plate 10 mm", qty: 12, time: "08:18", status: "passed", hoursAgo: 72 },
  { id: "SC-2838", part: "PT-4401", desc: "Baseplate 25 mm", qty: 6, time: "08:05", status: "review", hoursAgo: 96 },
  { id: "SC-2837", part: "PT-2890", desc: "Splice Plate", qty: 20, time: "07:52", status: "passed", hoursAgo: 120 },
  { id: "SC-2836", part: "PT-0109", desc: "Stiffener Plate", qty: 28, time: "07:41", status: "passed", hoursAgo: 200 },
];

export type ActiveLoad = {
  id: string;
  dest: string;
  status: string;
  eta: string;
  shipFrom: string;
  truck: string;
  driver: string;
  weightLbs: string;
  pieces: number;
  piecemarks: { mark: string; qty: number; desc: string }[];
  notes: string;
  hoursAgo: number;
};

export const ACTIVE_LOADS: ActiveLoad[] = [
  {
    id: "LD-4412", dest: "Bal Harbour Site", status: "Staging", eta: "14:20",
    shipFrom: "Shop Dock A", truck: "TRK-18", driver: "M. Ortiz", weightLbs: "42,800", pieces: 128,
    piecemarks: [
      { mark: "B-1042-A", qty: 24, desc: "Beam Flange" },
      { mark: "GP-0672", qty: 40, desc: "Gusset Plate" },
    ],
    notes: "Hold for QC sign-off before release.", hoursAgo: 4,
  },
  {
    id: "LD-4418", dest: "Yard Bay 3", status: "Loading", eta: "15:05",
    shipFrom: "Cut Line", truck: "TRK-04", driver: "J. Brooks", weightLbs: "18,240", pieces: 56,
    piecemarks: [{ mark: "W12-58", qty: 12, desc: "W12×58 Beam" }],
    notes: "Internal transfer — no BOL required.", hoursAgo: 10,
  },
  {
    id: "LD-4421", dest: "Port Melbourne", status: "In transit", eta: "16:40",
    shipFrom: "Yard Bay 1", truck: "TRK-22", driver: "A. Nguyen", weightLbs: "61,100", pieces: 210,
    piecemarks: [{ mark: "COL-C1", qty: 8, desc: "Column Cap" }],
    notes: "Customer delivery window 16:00–17:30.", hoursAgo: 36,
  },
  {
    id: "LD-4427", dest: "Shop Dock B", status: "Arriving", eta: "13:55",
    shipFrom: "Supplier — Apex Steel", truck: "EXT-903", driver: "External", weightLbs: "9,640", pieces: 32,
    piecemarks: [{ mark: "IN-HEAT", qty: 32, desc: "Inbound plate pack" }],
    notes: "Verify heat certs on arrival.", hoursAgo: 80,
  },
];

export const EMPLOYEES = [
  { name: "A. Nguyen", role: "Fitter", station: "Bay 2", shift: "Day" },
  { name: "M. Ortiz", role: "Welder", station: "Bay 5", shift: "Day" },
  { name: "S. Patel", role: "QC", station: "Inspect", shift: "Day" },
  { name: "J. Brooks", role: "Crane", station: "Yard", shift: "Swing" },
  { name: "L. Chen", role: "Saw", station: "Cut line", shift: "Day" },
];

export const IMPORT_EXPORT_QUEUE = [
  { id: "IE-901", type: "Import", name: "Nesting batch 14", status: "Queued", hoursAgo: 2 },
  { id: "IE-902", type: "Export", name: "ERP job sync", status: "Running", hoursAgo: 6 },
  { id: "IE-903", type: "Import", name: "Heat certs PDF", status: "Failed", hoursAgo: 28 },
  { id: "IE-904", type: "Export", name: "Label batch L-22", status: "Queued", hoursAgo: 50 },
];

export const INVENTORY_STOCK = [
  { sku: "PLT-20", name: "Plate 20 mm", level: 72, capacity: 100 },
  { sku: "IBEAM-W12", name: "W12×58 Beam", level: 18, capacity: 40 },
  { sku: "BOLT-M20", name: "M20 Bolt kit", level: 9, capacity: 120 },
  { sku: "GUSSET-A", name: "Gusset A", level: 54, capacity: 60 },
];

export const EXISTING_JOBS = [
  { number: "092356", customer: "P2PROG", name: "P2 Programs" },
  { number: "1234A", customer: "P2PROG", name: "P2 Programs" },
  { number: "1234B", customer: "P2PROG", name: "P2 Programs" },
  { number: "2247", customer: "44 Iron", name: "44 Iron" },
  { number: "2310", customer: "BCTEST", name: "Barcode Testing" },
];

export function maxHoursForRange(range: TimeRange): number | null {
  if (range === "24h") return 24;
  if (range === "7d") return 24 * 7;
  if (range === "30d") return 24 * 30;
  return null;
}

export function filterByTimeRange<T extends { hoursAgo: number }>(rows: T[], range: TimeRange): T[] {
  const max = maxHoursForRange(range);
  if (max == null) return rows;
  return rows.filter((r) => r.hoursAgo <= max);
}

export type ScanStatusFilter = "all" | "passed" | "review" | "failed";

export function filterScans(rows: ScanRow[], status: ScanStatusFilter, range: TimeRange): ScanRow[] {
  let next = filterByTimeRange(rows, range);
  if (status !== "all") next = next.filter((r) => r.status === status);
  return next;
}
