/** Extra mock series for advanced viz widgets. */
import { C } from "../colorTokens";

export const FUNNEL_STAGES = [
  { name: "Released", value: 420 },
  { name: "Cut", value: 380 },
  { name: "Fit", value: 310 },
  { name: "Weld", value: 265 },
  { name: "QC", value: 240 },
  { name: "Ship", value: 210 },
];

/** Sankey nodes + links for status-code transitions */
export const SANKEY_NODES = [
  { name: "ANGLELINE" },
  { name: "BANDSAW" },
  { name: "FIT" },
  { name: "WELD" },
  { name: "QC" },
  { name: "PAINT" },
  { name: "SHIP" },
  { name: "HOLD" },
];

export const SANKEY_LINKS = [
  { source: 0, target: 2, value: 48 },
  { source: 1, target: 2, value: 62 },
  { source: 2, target: 3, value: 90 },
  { source: 3, target: 4, value: 78 },
  { source: 4, target: 5, value: 52 },
  { source: 4, target: 6, value: 18 },
  { source: 5, target: 6, value: 44 },
  { source: 2, target: 7, value: 12 },
  { source: 3, target: 7, value: 8 },
  { source: 7, target: 4, value: 14 },
];

export const BURNDOWN = [
  { day: "Mon", remaining: 186 },
  { day: "Tue", remaining: 172 },
  { day: "Wed", remaining: 158 },
  { day: "Thu", remaining: 149 },
  { day: "Fri", remaining: 131 },
  { day: "Sat", remaining: 128 },
  { day: "Sun", remaining: 118 },
];

export const KPI_HERO = {
  label: "Tons shipped (WTD)",
  value: "412",
  unit: "t",
  delta: "+18.4%",
  deltaPositive: true,
  spark: [
    { d: "M", v: 48 },
    { d: "T", v: 52 },
    { d: "W", v: 61 },
    { d: "T", v: 58 },
    { d: "F", v: 71 },
    { d: "S", v: 44 },
    { d: "S", v: 78 },
  ],
};

export const SCORECARD = [
  { id: "safety", label: "Safety", value: "0", sub: "LTIs this month", tone: "ok" as const },
  { id: "quality", label: "Quality", value: "97.2%", sub: "First-pass yield", tone: "ok" as const },
  { id: "delivery", label: "Delivery", value: "94.2%", sub: "On-time rate", tone: "warn" as const },
  { id: "cost", label: "Cost", value: "−3.1%", sub: "vs plan scrap $", tone: "ok" as const },
];

export const STORY_STRIP = {
  caption:
    "Cut line recovered mid-week; QC backlog cleared before Friday ship window. Watch paint booth dwell into next week.",
  charts: [
    {
      title: "Scans",
      data: [
        { n: "M", v: 140 },
        { n: "T", v: 162 },
        { n: "W", v: 155 },
        { n: "T", v: 178 },
        { n: "F", v: 190 },
      ],
    },
    {
      title: "Tons",
      data: [
        { n: "M", v: 52 },
        { n: "T", v: 61 },
        { n: "W", v: 48 },
        { n: "T", v: 70 },
        { n: "F", v: 81 },
      ],
    },
    {
      title: "OTD %",
      data: [
        { n: "M", v: 91 },
        { n: "T", v: 93 },
        { n: "W", v: 92 },
        { n: "T", v: 95 },
        { n: "F", v: 94 },
      ],
    },
  ],
};

export type YardBay = {
  id: string;
  label: string;
  x: number;
  y: number;
  w: number;
  h: number;
  loads: number;
  kind: "dock" | "bay" | "staging" | "ship";
};

export const YARD_BAYS: YardBay[] = [
  { id: "dock-a", label: "Dock A", x: 4, y: 8, w: 28, h: 22, loads: 4, kind: "dock" },
  { id: "dock-b", label: "Dock B", x: 4, y: 36, w: 28, h: 22, loads: 2, kind: "dock" },
  { id: "dock-c", label: "Dock C", x: 4, y: 62, w: 28, h: 16, loads: 1, kind: "dock" },
  { id: "bay-1", label: "Bay 1", x: 38, y: 8, w: 26, h: 24, loads: 5, kind: "bay" },
  { id: "bay-2", label: "Bay 2", x: 68, y: 8, w: 26, h: 24, loads: 3, kind: "bay" },
  { id: "bay-3", label: "Bay 3", x: 38, y: 36, w: 26, h: 20, loads: 2, kind: "bay" },
  { id: "stage", label: "Staging", x: 68, y: 36, w: 26, h: 20, loads: 4, kind: "staging" },
  { id: "hold", label: "Hold", x: 38, y: 60, w: 26, h: 18, loads: 2, kind: "staging" },
  { id: "gate", label: "Ship gate", x: 68, y: 60, w: 26, h: 18, loads: 3, kind: "ship" },
];

/** Age-of-stock helper — unused in yard map after print tones refactor; keep export for consumers. */
export function yardKindColor(kind: YardBay["kind"]): string {
  if (kind === "dock") return C.primary;
  if (kind === "bay") return C.accent;
  if (kind === "staging") return C.warning;
  return C.danger;
}
