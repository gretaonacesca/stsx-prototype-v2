import { useEffect, useMemo, useState, type ChangeEvent, type ReactNode } from "react";
import { CheckCircle, AlertTriangle, XCircle, FileDown } from "lucide-react";
import {
  C, JEWEL, metalFill, metalShadow, metalSpecular, gradientBorderFill, PRINT, type JewelMetal,
} from "../colorTokens";
import {
  STATS, SCANS, ACTIVE_LOADS, EMPLOYEES, IMPORT_EXPORT_QUEUE, INVENTORY_STOCK,
  filterScans, filterByTimeRange, TIME_RANGE_LABELS,
  type ScanStatusFilter, type TimeRange,
} from "../data/mock";
import { PANEL_META, panelJewel, type VizWidgetId } from "../dashboard/widgetCatalog";
import { StatusPill, loadStatusTone, queueStatusTone, PanelHeader } from "./chrome";
import { WidgetResourceBody, EmptyState } from "../feedback";
import {
  ThroughputFunnel, BottleneckSankey, BacklogBurndown, KpiHero,
  ExecutiveScorecard, StoryStrip, YardMapLite,
} from "./charts";
import logoUrl from "../../assets/stsx-logo.png";

function ImageSplashWidget({ isEditing }: { isEditing?: boolean }) {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    return () => {
      if (imageUrl) URL.revokeObjectURL(imageUrl);
    };
  }, [imageUrl]);

  const onFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!["image/jpeg", "image/png"].includes(file.type)) {
      setError("Use a JPEG or PNG image.");
      e.currentTarget.value = "";
      return;
    }
    setError(null);
    setImageUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return URL.createObjectURL(file);
    });
  };

  return (
    <div className="h-full w-full p-3 flex flex-col gap-2">
      {isEditing && (
        <label
          className="inline-flex items-center w-fit px-3 py-1.5 rounded-md"
          style={{
            background: C.surfaceAlt,
            border: `1.5px solid ${C.border}`,
            cursor: "pointer",
            fontFamily: "'Lato', sans-serif",
            fontSize: 13,
            color: C.text,
          }}
        >
          Upload image
          <input
            type="file"
            accept="image/jpeg,image/png"
            onChange={onFileChange}
            style={{ display: "none" }}
          />
        </label>
      )}

      <div
        className="flex-1 min-h-0 rounded-md overflow-hidden flex items-center justify-center"
        style={{ background: C.surfaceAlt, border: `1.5px solid ${C.border}` }}
      >
        {imageUrl ? (
          <img
            src={imageUrl}
            alt="Splash upload"
            className="w-full h-full object-cover"
          />
        ) : (
          <p style={{ fontFamily: "'Lato', sans-serif", fontSize: 14, color: C.textMuted }}>
            Upload a JPEG or PNG splash image
          </p>
        )}
      </div>
      {error && (
        <p style={{ fontFamily: "'Lato', sans-serif", fontSize: 12, color: C.danger }}>
          {error}
        </p>
      )}
    </div>
  );
}

export function StatCard({ id }: { id: string }) {
  const s = STATS.find((x) => x.id === id);
  if (!s) return null;
  const metal = s.metal;
  const Icon = s.Icon;
  return (
    <div
      className="relative h-full overflow-hidden rounded-[10px] p-4 flex flex-col justify-between"
      style={{ background: metalFill(metal), boxShadow: metalShadow(metal), color: metal.text }}
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-40"
        style={{ background: metalSpecular(metal) }}
      />
      <div className="relative z-[1] flex items-start justify-between">
        <span
          style={{
            fontFamily: "'DM Mono', monospace",
            fontSize: 14,
            fontWeight: 400,
            letterSpacing: "0.06em",
            textTransform: "uppercase",
            opacity: 0.92,
          }}
        >
          {s.label}
        </span>
        <Icon size={18} strokeWidth={2} />
      </div>
      <div className="relative z-[1]">
        <p style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 400, fontSize: 45, lineHeight: 1 }}>
          {s.value}
        </p>
        <p style={{ fontFamily: "'Lato', sans-serif", fontWeight: 400, fontSize: 14, marginTop: 7, opacity: 0.9 }}>
          {s.sub}
        </p>
      </div>
    </div>
  );
}

function FilterChip({
  active,
  label,
  onClick,
}: {
  active: boolean;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="px-2 py-1 rounded"
      style={{
        fontFamily: "'Lato', sans-serif",
        fontSize: 13,
        fontWeight: 400,
        border: `1.5px solid ${active ? JEWEL.indigo.base : C.border}`,
        background: active ? JEWEL.indigo.base : C.surfaceAlt,
        color: active ? JEWEL.indigo.text : C.text,
        cursor: "pointer",
      }}
    >
      {label}
    </button>
  );
}

export function TimeRangeBar({
  value,
  onChange,
}: {
  value: TimeRange;
  onChange: (v: TimeRange) => void;
}) {
  return (
    <div className="flex flex-wrap gap-1.5 items-center">
      <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 11, color: C.text, textTransform: "uppercase" }}>
        Time
      </span>
      {(Object.keys(TIME_RANGE_LABELS) as TimeRange[]).map((k) => (
        <FilterChip key={k} active={value === k} label={TIME_RANGE_LABELS[k]} onClick={() => onChange(k)} />
      ))}
    </div>
  );
}

export function RecentScansTable({
  showFilters = true,
  timeRange = "all",
  onTimeRangeChange,
}: {
  showFilters?: boolean;
  timeRange?: TimeRange;
  onTimeRangeChange?: (v: TimeRange) => void;
}) {
  const [status, setStatus] = useState<ScanStatusFilter>("all");
  const [localRange, setLocalRange] = useState<TimeRange>(timeRange);
  const range = onTimeRangeChange ? timeRange : localRange;
  const setRange = onTimeRangeChange ?? setLocalRange;
  const rows = useMemo(() => filterScans(SCANS, status, range), [status, range]);

  return (
    <div className="flex flex-col h-full min-h-0 overflow-hidden">
      {showFilters && (
        <div className="flex-none flex flex-wrap gap-1.5 px-3 py-2" style={{ borderBottom: `1px solid ${C.border}` }}>
          {(["all", "passed", "review", "failed"] as ScanStatusFilter[]).map((s) => (
            <FilterChip
              key={s}
              active={status === s}
              label={s === "all" ? "All" : s[0].toUpperCase() + s.slice(1)}
              onClick={() => setStatus(s)}
            />
          ))}
          <div className="w-full mt-1">
            <TimeRangeBar value={range} onChange={setRange} />
          </div>
        </div>
      )}
      <div className="flex-none flex items-center py-1.5" style={{ borderBottom: `1.5px solid ${C.border}`, background: C.surfaceAlt }}>
        {(["Scan ID", "Part No.", "Description", "Qty", "Time", ""] as const).map((label, i) => (
          <div
            key={i}
            className={i === 2 ? "flex-1 px-2" : "shrink-0 px-2"}
            style={{
              width: [72, 74, undefined, 32, 42, 28][i],
              fontFamily: "'DM Mono', monospace",
              fontSize: 13,
              color: C.text,
              textTransform: "uppercase",
            }}
          >
            {label}
          </div>
        ))}
      </div>
      <div className="flex-1 overflow-y-auto" data-widget-scroll>
        {rows.length === 0 ? (
          <div className="p-3">
            <EmptyState title="No scans in this range" body="Try widening the time filter or changing the status filter." />
          </div>
        ) : (
          rows.map((s) => (
          <div key={s.id} className="flex items-center py-1.5" style={{ borderBottom: `1px solid ${C.border}` }}>
            <div className="w-[72px] shrink-0 px-2" style={{ fontFamily: "'DM Mono', monospace", fontSize: 13, fontWeight: 400, color: C.primary }}>{s.id}</div>
            <div className="w-[74px] shrink-0 px-2" style={{ fontFamily: "'DM Mono', monospace", fontSize: 13, fontWeight: 400, color: C.text }}>{s.part}</div>
            <div className="flex-1 px-2 truncate" style={{ fontFamily: "'Lato', sans-serif", fontSize: 14, fontWeight: 400, color: C.text }}>{s.desc}</div>
            <div className="w-[32px] shrink-0 px-2" style={{ fontFamily: "'DM Mono', monospace", fontSize: 13, color: C.text }}>{s.qty}</div>
            <div className="w-[42px] shrink-0 px-2" style={{ fontFamily: "'DM Mono', monospace", fontSize: 13, color: C.text }}>{s.time}</div>
            <div className="w-[28px] shrink-0 flex justify-center">
              {s.status === "passed" && <CheckCircle size={14} color={C.primary} />}
              {s.status === "review" && <AlertTriangle size={14} color={C.warning} />}
              {s.status === "failed" && <XCircle size={14} color={C.danger} />}
            </div>
          </div>
        ))
        )}
      </div>
    </div>
  );
}

export function ActiveLoadsTable({ timeRange = "all" }: { timeRange?: TimeRange }) {
  return (
    <WidgetResourceBody
      loader={async () => filterByTimeRange(ACTIVE_LOADS, timeRange ?? "all")}
      isEmpty={(rows) => rows.length === 0}
      deps={[timeRange]}
      simulateDelayMs={300}
      emptyTitle="No active loads"
      emptyBody="No loads match the selected time range."
    >
      {(rows) => (
    <div className="flex flex-col h-full min-h-0 overflow-hidden">
      <div className="flex-1 overflow-y-auto p-2 flex flex-col gap-1.5" data-widget-scroll>
        {rows.map((l) => (
          <div
            key={l.id}
            className="flex items-center gap-2 px-2 py-2 rounded-md"
            style={{ background: C.surfaceAlt, border: `1.5px solid ${C.border}` }}
          >
            <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 14, fontWeight: 400, color: C.primary, width: 64 }}>{l.id}</span>
            <span className="flex-1 truncate" style={{ fontFamily: "'Lato', sans-serif", fontSize: 15, fontWeight: 400, color: C.text }}>{l.dest}</span>
            <StatusPill tone={loadStatusTone(l.status)}>{l.status}</StatusPill>
            <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 13, color: C.text }}>{l.eta}</span>
          </div>
        ))}
      </div>
    </div>
      )}
    </WidgetResourceBody>
  );
}

export function EmployeesTable() {
  return (
    <WidgetResourceBody
      loader={async () => EMPLOYEES}
      isEmpty={(rows) => rows.length === 0}
      simulateDelayMs={300}
      emptyTitle="No employees"
      emptyBody="Employee roster will appear here when loaded."
    >
      {(employees) => (
    <div className="flex flex-col h-full min-h-0 overflow-hidden">
      <div className="flex-none flex px-3 py-1.5" style={{ borderBottom: `1.5px solid ${C.border}`, background: C.surfaceAlt }}>
        {["Name", "Role", "Station", "Shift"].map((h) => (
          <div key={h} className="flex-1" style={{ fontFamily: "'DM Mono', monospace", fontSize: 11, color: C.text, textTransform: "uppercase" }}>{h}</div>
        ))}
      </div>
      <div className="flex-1 overflow-y-auto" data-widget-scroll>
        {employees.map((e) => (
          <div key={e.name} className="flex px-3 py-2" style={{ borderBottom: `1px solid ${C.border}` }}>
            <div className="flex-1" style={{ fontFamily: "'Lato', sans-serif", fontSize: 15, fontWeight: 400, color: C.text }}>{e.name}</div>
            <div className="flex-1" style={{ fontFamily: "'Lato', sans-serif", fontSize: 15, fontWeight: 400, color: C.text }}>{e.role}</div>
            <div className="flex-1" style={{ fontFamily: "'DM Mono', monospace", fontSize: 14, fontWeight: 400, color: C.text }}>{e.station}</div>
            <div className="flex-1" style={{ fontFamily: "'DM Mono', monospace", fontSize: 14, fontWeight: 400, color: C.primary }}>{e.shift}</div>
          </div>
        ))}
      </div>
    </div>
      )}
    </WidgetResourceBody>
  );
}

export function ImportQueueTable({ timeRange = "all" }: { timeRange?: TimeRange }) {
  return (
    <WidgetResourceBody
      loader={async () => filterByTimeRange(IMPORT_EXPORT_QUEUE, timeRange ?? "all")}
      isEmpty={(rows) => rows.length === 0}
      deps={[timeRange]}
      simulateDelayMs={300}
      emptyTitle="No import/export jobs"
      emptyBody="The queue is empty for this time range."
    >
      {(rows) => (
    <div className="flex flex-col h-full min-h-0 overflow-y-auto p-2 gap-1.5" data-widget-scroll>
      {rows.map((q) => (
        <div key={q.id} className="flex items-center gap-2 px-2 py-2 rounded-md" style={{ background: C.surfaceAlt, border: `1.5px solid ${C.border}` }}>
          <ArrowLeftRightIcon />
          <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 13, fontWeight: 400, color: C.primary, width: 52 }}>{q.id}</span>
          <StatusPill tone="muted">{q.type}</StatusPill>
          <span className="flex-1 truncate" style={{ fontFamily: "'Lato', sans-serif", fontSize: 15, fontWeight: 400, color: C.text }}>{q.name}</span>
          <StatusPill tone={queueStatusTone(q.status)}>{q.status}</StatusPill>
        </div>
      ))}
    </div>
      )}
    </WidgetResourceBody>
  );
}

function ArrowLeftRightIcon() {
  return <span style={{ color: C.text, display: "inline-flex" }}>⇄</span>;
}

export function InventoryPanel() {
  return (
    <div className="flex flex-col h-full min-h-0 overflow-y-auto p-3 gap-3" data-widget-scroll>
      {INVENTORY_STOCK.map((s) => {
        const pct = Math.round((s.level / s.capacity) * 100);
        const tone = pct < 25 ? C.danger : pct < 50 ? C.warning : C.primary;
        return (
          <div key={s.sku}>
            <div className="flex items-center justify-between mb-1">
              <div>
                <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 13, fontWeight: 400, color: C.primary }}>{s.sku}</span>
                <span className="ml-2" style={{ fontFamily: "'Lato', sans-serif", fontSize: 15, fontWeight: 400, color: C.text }}>{s.name}</span>
              </div>
              <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 13, color: C.text }}>
                {s.level}/{s.capacity}
              </span>
            </div>
            <div className="h-2 rounded-full overflow-hidden" style={{ background: C.surfaceAlt }}>
              <div className="h-full rounded-full" style={{ width: `${pct}%`, background: tone }} />
            </div>
          </div>
        );
      })}
    </div>
  );
}

export function CompanyHeader({ showEditPencil = false }: { showEditPencil?: boolean }) {
  const [stubOpen, setStubOpen] = useState(false);
  return (
    <div
      className="flex items-center gap-4 px-4 py-3 rounded-md relative"
      style={{ background: C.surface, border: `1.5px solid ${C.border}` }}
    >
      <div className="relative">
        <img src={logoUrl} alt="STSX" className="h-12 w-auto object-contain" />
        {showEditPencil && (
          <button
            type="button"
            title="Edit logo"
            onClick={() => setStubOpen((v) => !v)}
            className="absolute -right-2 -bottom-2 w-7 h-7 rounded-full flex items-center justify-center"
            style={{ background: C.accent, color: "#fff", border: `2px solid ${C.surface}`, cursor: "pointer" }}
          >
            ✎
          </button>
        )}
        {stubOpen && (
          <div
            className="absolute left-0 top-full mt-2 z-10 px-3 py-2 rounded-md shadow-lg"
            style={{ background: C.surface, border: `1.5px solid ${C.border}`, whiteSpace: "nowrap" }}
          >
            <p style={{ fontFamily: "'Lato', sans-serif", fontSize: 13, fontWeight: 400, color: C.text }}>
              Edit logo — coming soon
            </p>
          </div>
        )}
      </div>
      <div>
        <p style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 400, fontSize: 22, color: C.text }}>STSX Fabrication</p>
        <p style={{ fontFamily: "'Lato', sans-serif", fontSize: 14, fontWeight: 400, color: C.text }}>Operations report</p>
      </div>
    </div>
  );
}

const ADMIN_GRAPHITE = "#2F343D";

export function PdfHoverButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      title="Add to PDF report"
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      className="absolute top-2 right-2 z-20 w-9 h-9 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
      style={{
        background: ADMIN_GRAPHITE,
        color: "#fff",
        border: `2px solid ${C.surface}`,
        boxShadow: `0 4px 14px ${ADMIN_GRAPHITE}55`,
        cursor: "pointer",
      }}
    >
      <FileDown size={16} strokeWidth={2.2} />
    </button>
  );
}

export function VizBody({
  id,
  isEditing,
  timeRange,
  print,
}: {
  id: VizWidgetId;
  isEditing?: boolean;
  timeRange?: TimeRange;
  print?: boolean;
}) {
  if (id.startsWith("stat")) return <StatCard id={id} />;
  if (id === "recent") return <RecentScansTable timeRange={timeRange} />;
  if (id === "active-loads") return <ActiveLoadsTable timeRange={timeRange} />;
  if (id === "employees") return <EmployeesTable />;
  if (id === "import-export") return <ImportQueueTable timeRange={timeRange} />;
  if (id === "inventory") return <InventoryPanel />;
  if (id === "funnel") return <ThroughputFunnel print={print} />;
  if (id === "sankey") return <BottleneckSankey print={print} />;
  if (id === "burndown") return <BacklogBurndown print={print} />;
  if (id === "kpi-hero") return <KpiHero />;
  if (id === "scorecard") return <ExecutiveScorecard print={print} />;
  if (id === "story-strip") return <StoryStrip print={print} />;
  if (id === "yard-map") return <YardMapLite print={print} />;
  if (id === "image-splash") return <ImageSplashWidget isEditing={isEditing} />;
  return null;
}

export function VizPanelFrame({
  id,
  children,
  isStat,
  print,
  onHeaderClick,
}: {
  id: VizWidgetId;
  children: ReactNode;
  isStat?: boolean;
  print?: boolean;
  onHeaderClick?: () => void;
}) {
  const jewel = panelJewel(id);
  const title = PANEL_META[id]?.title ?? id;
  if (isStat || id.startsWith("stat") || id === "kpi-hero") {
    return <div className="h-full w-full">{children}</div>;
  }
  const surface = print ? PRINT.surface : C.surface;
  return (
    <div
      className="h-full w-full flex flex-col overflow-hidden rounded-[10px]"
      style={{
        background: gradientBorderFill(surface, jewel.base),
        border: "1.5px solid transparent",
        boxShadow: print ? "none" : `0 1px 0 ${jewel.light}22 inset`,
      }}
    >
      <PanelHeader title={title} accent={JEWEL.indigo.base} print={print} onClick={onHeaderClick} />
      <div className="flex-1 min-h-0 overflow-hidden" style={{ background: print ? PRINT.surface : undefined }}>
        {children}
      </div>
    </div>
  );
}

export type { JewelMetal };
