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
  { id: "stat1", label: "Active Jobs", value: "62", sub: "+5 since yesterday", metal: JEWEL.viridian, Icon: BarChart3 },
  { id: "stat2", label: "Scans Today", value: "246", sub: "93.5% pass rate", metal: JEWEL.chrome, Icon: CheckCircle },
  { id: "stat3", label: "Pending Reviews", value: "18", sub: "5 overdue", metal: JEWEL.indigo, Icon: AlertTriangle },
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
  { id: "SC-2847", part: "B-1042-A", desc: "W12×58 Beam Flange", qty: 24, time: "09:41", status: "passed", hoursAgo: 1 },
  { id: "SC-2846", part: "W-0837-B", desc: "Web Plate 12 mm", qty: 12, time: "09:38", status: "passed", hoursAgo: 2 },
  { id: "SC-2845", part: "A-2201", desc: "Angle Brace L75", qty: 8, time: "09:22", status: "review", hoursAgo: 5 },
  { id: "SC-2844", part: "EP-0442", desc: "End Plate 20 mm", qty: 16, time: "09:15", status: "passed", hoursAgo: 8 },
  { id: "SC-2843", part: "C-1199", desc: "Column Cap Plate", qty: 4, time: "08:57", status: "passed", hoursAgo: 12 },
  { id: "SC-2842", part: "GP-0672", desc: "Gusset Plate", qty: 32, time: "08:43", status: "passed", hoursAgo: 20 },
  { id: "SC-2841", part: "PT-3301", desc: "Purlin Z200", qty: 48, time: "08:30", status: "failed", hoursAgo: 30 },
  { id: "SC-2840", part: "B-1042-B", desc: "Beam Flange Cut", qty: 24, time: "08:21", status: "passed", hoursAgo: 48 },
  { id: "SC-2839", part: "W-0837-A", desc: "Web Plate 10 mm", qty: 12, time: "08:18", status: "passed", hoursAgo: 72 },
  { id: "SC-2838", part: "BP-4401", desc: "Baseplate 25 mm", qty: 6, time: "08:05", status: "review", hoursAgo: 96 },
  { id: "SC-2837", part: "SP-2890", desc: "Splice Plate", qty: 20, time: "07:52", status: "passed", hoursAgo: 120 },
  { id: "SC-2836", part: "ST-0109", desc: "Stiffener Plate", qty: 28, time: "07:41", status: "passed", hoursAgo: 200 },
  { id: "SC-2835", part: "CL-5510", desc: "Clip Angle L4×4", qty: 60, time: "14:12", status: "passed", hoursAgo: 3 },
  { id: "SC-2834", part: "BR-8821", desc: "Brace Rod Ø1\"", qty: 18, time: "13:55", status: "passed", hoursAgo: 6 },
  { id: "SC-2833", part: "PL-2208", desc: "Plate 16 mm pack", qty: 40, time: "13:40", status: "review", hoursAgo: 9 },
  { id: "SC-2832", part: "HB-1001", desc: "HSS 6×6×⅜", qty: 10, time: "12:18", status: "passed", hoursAgo: 14 },
  { id: "SC-2831", part: "CH-774", desc: "Channel C10×15.3", qty: 14, time: "11:47", status: "passed", hoursAgo: 18 },
  { id: "SC-2830", part: "FB-330", desc: "Flat Bar ½×4", qty: 80, time: "11:02", status: "failed", hoursAgo: 22 },
  { id: "SC-2829", part: "W16-67", desc: "W16×67 Beam", qty: 6, time: "10:33", status: "passed", hoursAgo: 26 },
  { id: "SC-2828", part: "CAP-09", desc: "Cap Plate ¾\"", qty: 12, time: "16:20", status: "passed", hoursAgo: 40 },
  { id: "SC-2827", part: "TIE-44", desc: "Tie Rod Assembly", qty: 22, time: "15:48", status: "review", hoursAgo: 55 },
  { id: "SC-2826", part: "TR-210", desc: "Truss Chord", qty: 8, time: "15:01", status: "passed", hoursAgo: 70 },
  { id: "SC-2825", part: "PAD-12", desc: "Bearing Pad", qty: 30, time: "09:10", status: "passed", hoursAgo: 100 },
  { id: "SC-2824", part: "RAIL-3", desc: "Crane Rail Seat", qty: 4, time: "08:44", status: "failed", hoursAgo: 140 },
  { id: "SC-2823", part: "LUG-88", desc: "Lift Lug", qty: 16, time: "08:02", status: "passed", hoursAgo: 180 },
  { id: "SC-2822", part: "GRT-01", desc: "Grating Frame", qty: 9, time: "07:30", status: "passed", hoursAgo: 220 },
  { id: "SC-2821", part: "STA-15", desc: "Stair Stringer", qty: 2, time: "17:05", status: "review", hoursAgo: 260 },
  { id: "SC-2820", part: "HAN-02", desc: "Handrail Post", qty: 36, time: "16:40", status: "passed", hoursAgo: 300 },
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
      { mark: "EP-0442", qty: 16, desc: "End Plate" },
    ],
    notes: "Hold for QC sign-off before release.", hoursAgo: 4,
  },
  {
    id: "LD-4418", dest: "Yard Bay 3", status: "Loading", eta: "15:05",
    shipFrom: "Cut Line", truck: "TRK-04", driver: "J. Brooks", weightLbs: "18,240", pieces: 56,
    piecemarks: [
      { mark: "W12-58", qty: 12, desc: "W12×58 Beam" },
      { mark: "CL-5510", qty: 40, desc: "Clip Angle" },
    ],
    notes: "Internal transfer — no BOL required.", hoursAgo: 10,
  },
  {
    id: "LD-4421", dest: "Port Melbourne Yard", status: "In transit", eta: "16:40",
    shipFrom: "Yard Bay 1", truck: "TRK-22", driver: "A. Nguyen", weightLbs: "61,100", pieces: 210,
    piecemarks: [
      { mark: "COL-C1", qty: 8, desc: "Column Cap" },
      { mark: "W16-67", qty: 6, desc: "W16×67 Beam" },
    ],
    notes: "Customer delivery window 16:00–17:30.", hoursAgo: 36,
  },
  {
    id: "LD-4427", dest: "Shop Dock B", status: "Arriving", eta: "13:55",
    shipFrom: "Supplier — Apex Steel", truck: "EXT-903", driver: "External", weightLbs: "9,640", pieces: 32,
    piecemarks: [{ mark: "IN-HEAT", qty: 32, desc: "Inbound plate pack" }],
    notes: "Verify heat certs on arrival.", hoursAgo: 80,
  },
  {
    id: "LD-4430", dest: "Riverside Tower", status: "On hold", eta: "Tomorrow",
    shipFrom: "Paint Booth", truck: "TRK-11", driver: "L. Chen", weightLbs: "27,400", pieces: 74,
    piecemarks: [
      { mark: "TR-210", qty: 8, desc: "Truss Chord" },
      { mark: "HAN-02", qty: 36, desc: "Handrail Post" },
    ],
    notes: "Paint cure incomplete — do not release.", hoursAgo: 12,
  },
  {
    id: "LD-4433", dest: "Harbor Crane Pad", status: "Delivered", eta: "Done",
    shipFrom: "Shop Dock A", truck: "TRK-07", driver: "S. Patel", weightLbs: "14,900", pieces: 41,
    piecemarks: [{ mark: "RAIL-3", qty: 4, desc: "Crane Rail Seat" }],
    notes: "Signed BOL on file.", hoursAgo: 50,
  },
  {
    id: "LD-4438", dest: "Midtown Garage P3", status: "Staging", eta: "11:30",
    shipFrom: "Yard Bay 2", truck: "TRK-18", driver: "M. Ortiz", weightLbs: "33,200", pieces: 96,
    piecemarks: [
      { mark: "STA-15", qty: 2, desc: "Stair Stringer" },
      { mark: "GRT-01", qty: 9, desc: "Grating Frame" },
    ],
    notes: "Sequence ship — stringers first.", hoursAgo: 2,
  },
  {
    id: "LD-4441", dest: "North Plant Expansion", status: "Loading", eta: "17:15",
    shipFrom: "Fit Bay 4", truck: "TRK-04", driver: "J. Brooks", weightLbs: "52,010", pieces: 155,
    piecemarks: [
      { mark: "HB-1001", qty: 10, desc: "HSS Column" },
      { mark: "BR-8821", qty: 18, desc: "Brace Rod" },
    ],
    notes: "Oversize escort booked.", hoursAgo: 7,
  },
  {
    id: "LD-4445", dest: "Shop Dock C", status: "Arriving", eta: "10:05",
    shipFrom: "Mill — Nucor", truck: "EXT-441", driver: "External", weightLbs: "78,000", pieces: 1,
    piecemarks: [{ mark: "MILL-COIL", qty: 1, desc: "Coil plate lot" }],
    notes: "ASN ASN-2290 — match heat H-9901.", hoursAgo: 1,
  },
  {
    id: "LD-4450", dest: "Westfield Arena", status: "In transit", eta: "19:00",
    shipFrom: "Final Ship Dock", truck: "TRK-22", driver: "A. Nguyen", weightLbs: "39,600", pieces: 112,
    piecemarks: [
      { mark: "C-1199", qty: 4, desc: "Column Cap" },
      { mark: "SP-2890", qty: 20, desc: "Splice Plate" },
    ],
    notes: "Night gate code 4412.", hoursAgo: 15,
  },
];

export const EMPLOYEES = [
  { name: "A. Nguyen", role: "Fitter", station: "Bay 2", shift: "Day" },
  { name: "M. Ortiz", role: "Welder", station: "Bay 5", shift: "Day" },
  { name: "S. Patel", role: "QC", station: "Inspect", shift: "Day" },
  { name: "J. Brooks", role: "Crane", station: "Yard", shift: "Swing" },
  { name: "L. Chen", role: "Saw", station: "Cut line", shift: "Day" },
  { name: "R. Diaz", role: "Welder", station: "Bay 3", shift: "Night" },
  { name: "K. Singh", role: "Painter", station: "Paint booth", shift: "Day" },
  { name: "T. Walsh", role: "Fitter", station: "Bay 4", shift: "Swing" },
  { name: "H. Okonkwo", role: "Material Handler", station: "Receiving", shift: "Day" },
  { name: "E. Morales", role: "QC", station: "Inspect", shift: "Night" },
  { name: "P. Berg", role: "Layout", station: "Detail", shift: "Day" },
  { name: "N. Park", role: "Saw", station: "Bandsaw", shift: "Swing" },
];

export const IMPORT_EXPORT_QUEUE = [
  { id: "IE-901", type: "Import", name: "Nesting batch 14 — Job 092356", status: "Queued", hoursAgo: 2 },
  { id: "IE-902", type: "Export", name: "ERP job sync", status: "Running", hoursAgo: 6 },
  { id: "IE-903", type: "Import", name: "Heat certs PDF pack", status: "Failed", hoursAgo: 28 },
  { id: "IE-904", type: "Export", name: "Label batch L-22", status: "Queued", hoursAgo: 50 },
  { id: "IE-905", type: "Import", name: "Tekla XSR — Riverside Tower", status: "Running", hoursAgo: 1 },
  { id: "IE-906", type: "Import", name: "KISS — Midtown Garage", status: "Queued", hoursAgo: 4 },
  { id: "IE-907", type: "Export", name: "Status push → Foxfire", status: "Queued", hoursAgo: 8 },
  { id: "IE-908", type: "Import", name: "Excel BOM — Harbor Crane", status: "Failed", hoursAgo: 16 },
  { id: "IE-909", type: "Export", name: "ASN outbound LD-4445", status: "Running", hoursAgo: 3 },
  { id: "IE-910", type: "Import", name: "SDS/XML — Westfield Arena", status: "Queued", hoursAgo: 22 },
];

export const INVENTORY_STOCK = [
  { sku: "PLT-20", name: "Plate 20 mm A36", level: 72, capacity: 100 },
  { sku: "IBEAM-W12", name: "W12×58 Beam", level: 18, capacity: 40 },
  { sku: "BOLT-M20", name: "M20 Bolt kit", level: 9, capacity: 120 },
  { sku: "GUSSET-A", name: "Gusset A plate", level: 54, capacity: 60 },
  { sku: "PLT-16", name: "Plate 16 mm A572", level: 41, capacity: 80 },
  { sku: "HSS-66", name: "HSS 6×6×⅜", level: 12, capacity: 30 },
  { sku: "ANGLE-L4", name: "L4×4×⅜ Angle", level: 88, capacity: 100 },
  { sku: "CHAN-C10", name: "C10×15.3 Channel", level: 22, capacity: 50 },
  { sku: "PRIMER-5G", name: "Shop primer 5gal", level: 4, capacity: 24 },
  { sku: "WELD-WIRE", name: "ER70S-6 wire spool", level: 15, capacity: 40 },
  { sku: "PLT-25", name: "Plate 25 mm A36", level: 8, capacity: 35 },
  { sku: "PURLIN-Z", name: "Z200 Purlin stock", level: 60, capacity: 120 },
];

export const EXISTING_JOBS = [
  { number: "092356", customer: "P2PROG", name: "P2 Programs — Bal Harbour" },
  { number: "1234A", customer: "P2PROG", name: "P2 Programs — Phase A" },
  { number: "1234B", customer: "P2PROG", name: "P2 Programs — Phase B" },
  { number: "2247", customer: "44IRON", name: "44 Iron — Yard Canopy" },
  { number: "2310", customer: "BCTEST", name: "Barcode Testing Lot" },
  { number: "2401", customer: "RIVRSD", name: "Riverside Tower Steel" },
  { number: "2418", customer: "MIDTWN", name: "Midtown Garage P3" },
  { number: "2502", customer: "HARBR", name: "Harbor Crane Pad" },
  { number: "2511", customer: "NPLANT", name: "North Plant Expansion" },
  { number: "2520", customer: "WFIELD", name: "Westfield Arena Roof" },
  { number: "2533", customer: "APEX", name: "Apex Steel Stock Job" },
  { number: "2540", customer: "TESTLGTH", name: "Test Length Corp Demo" },
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
