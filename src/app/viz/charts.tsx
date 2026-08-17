import {
  ResponsiveContainer, AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip,
  Sankey, Layer, Rectangle, FunnelChart, Funnel, LabelList, Cell,
} from "recharts";
import { C, PRINT, JEWEL, type ColorTokens } from "../colorTokens";
import {
  FUNNEL_STAGES, SANKEY_NODES, SANKEY_LINKS, BURNDOWN, KPI_HERO,
  SCORECARD, STORY_STRIP, YARD_BAYS,
} from "../data/chartsMock";

type VizOpts = { print?: boolean };

function tones(print?: boolean): ColorTokens {
  return print ? PRINT : C;
}

function tipStyle(T: ColorTokens) {
  return {
    background: T.surface,
    border: `1.5px solid ${T.border}`,
    borderRadius: 8,
    fontFamily: "'Lato', sans-serif",
    fontWeight: 400,
    fontSize: 12,
    color: T.text,
  };
}

function yardColor(kind: "dock" | "bay" | "staging" | "ship", T: ColorTokens): string {
  if (kind === "dock") return T.primary;
  if (kind === "bay") return T.accent;
  if (kind === "staging") return T.warning;
  return T.danger;
}

const FUNNEL_COLORS = [
  JEWEL.viridian.base,
  JEWEL.chrome.base,
  JEWEL.indigo.base,
  JEWEL.lime.base,
  JEWEL.viridian.light,
  JEWEL.indigo.light,
];

export function ThroughputFunnel({ print }: VizOpts = {}) {
  const T = tones(print);
  return (
    <div className="h-full w-full min-h-0 p-2" style={{ background: print ? T.surface : undefined }}>
      <ResponsiveContainer width="100%" height="100%">
        <FunnelChart>
          <Tooltip contentStyle={tipStyle(T)} />
          <Funnel dataKey="value" data={FUNNEL_STAGES} isAnimationActive={false}>
            {FUNNEL_STAGES.map((_, i) => (
              <Cell key={i} fill={FUNNEL_COLORS[i % FUNNEL_COLORS.length]} />
            ))}
            <LabelList
              position="right"
              fill={T.text}
              stroke="none"
              dataKey="name"
              style={{ fontFamily: "'DM Mono', monospace", fontSize: 11, fontWeight: 400 }}
            />
            <LabelList
              position="center"
              fill="#fff"
              stroke="none"
              dataKey="value"
              style={{ fontFamily: "'Outfit', sans-serif", fontSize: 13, fontWeight: 400 }}
            />
          </Funnel>
        </FunnelChart>
      </ResponsiveContainer>
    </div>
  );
}

export function BottleneckSankey({ print }: VizOpts = {}) {
  const T = tones(print);
  const nodeColors = [
    JEWEL.viridian.base, JEWEL.chrome.base, JEWEL.indigo.base, JEWEL.lime.base,
    T.primary, T.accent, T.warning, T.danger,
  ];

  function SankeyNode(props: {
    x?: number; y?: number; width?: number; height?: number; index?: number;
    payload?: { name?: string };
  }) {
    const x = props.x ?? 0;
    const y = props.y ?? 0;
    const width = props.width ?? 0;
    const height = props.height ?? 0;
    const index = props.index ?? 0;
    const name = props.payload?.name ?? "";
    return (
      <Layer key={`sn-${index}`}>
        <Rectangle x={x} y={y} width={width} height={height} fill={nodeColors[index % nodeColors.length]} fillOpacity={0.92} radius={2} />
        <text
          x={x + width + 6}
          y={y + height / 2}
          dy="0.35em"
          fill={T.text}
          fontSize={11}
          fontFamily="'DM Mono', monospace"
          fontWeight={400}
        >
          {name}
        </text>
      </Layer>
    );
  }

  return (
    <div className="h-full w-full min-h-0 p-2" style={{ background: print ? T.surface : undefined }}>
      <ResponsiveContainer width="100%" height="100%">
        <Sankey
          data={{ nodes: SANKEY_NODES, links: SANKEY_LINKS }}
          nodeWidth={12}
          nodePadding={16}
          margin={{ left: 8, right: 96, top: 8, bottom: 8 }}
          link={{ stroke: T.accent, strokeOpacity: print ? 0.35 : 0.3 }}
          node={SankeyNode as never}
          isAnimationActive={false}
        >
          <Tooltip contentStyle={tipStyle(T)} />
        </Sankey>
      </ResponsiveContainer>
    </div>
  );
}

export function BacklogBurndown({ print }: VizOpts = {}) {
  const T = tones(print);
  const gradId = print ? "burnFillPrint" : "burnFill";
  return (
    <div className="h-full w-full min-h-0 p-2 flex flex-col" style={{ background: print ? T.surface : undefined }}>
      <p className="px-1 pb-1" style={{ fontFamily: "'Lato', sans-serif", fontSize: 12, fontWeight: 400, color: T.text }}>
        Remaining jobs (week)
      </p>
      <div className="flex-1 min-h-0">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={BURNDOWN} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={T.accent} stopOpacity={0.4} />
                <stop offset="100%" stopColor={T.accent} stopOpacity={0.04} />
              </linearGradient>
            </defs>
            <XAxis dataKey="day" tick={{ fill: T.text, fontSize: 11, fontFamily: "'DM Mono', monospace" }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: T.text, fontSize: 11, fontFamily: "'DM Mono', monospace" }} axisLine={false} tickLine={false} width={32} />
            <Tooltip contentStyle={tipStyle(T)} />
            <Area type="monotone" dataKey="remaining" stroke={T.accent} strokeWidth={2} fill={`url(#${gradId})`} isAnimationActive={false} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export function KpiHero() {
  const k = KPI_HERO;
  return (
    <div
      className="h-full w-full rounded-[10px] p-4 flex flex-col justify-between overflow-hidden"
      style={{
        background: `linear-gradient(135deg, ${JEWEL.indigo.dark}, ${JEWEL.indigo.base} 55%, ${JEWEL.viridian.base})`,
        color: "#fff",
      }}
    >
      <div>
        <p style={{ fontFamily: "'DM Mono', monospace", fontSize: 12, fontWeight: 400, letterSpacing: "0.08em", textTransform: "uppercase", opacity: 0.9 }}>
          {k.label}
        </p>
        <div className="flex items-end gap-3 mt-1">
          <span style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 400, fontSize: 48, lineHeight: 1 }}>
            {k.value}
            <span style={{ fontSize: 20, marginLeft: 4, opacity: 0.85 }}>{k.unit}</span>
          </span>
          <span
            className="mb-1 px-2 py-0.5 rounded"
            style={{
              background: k.deltaPositive ? "rgba(255,255,255,0.22)" : "rgba(0,0,0,0.25)",
              fontFamily: "'DM Mono', monospace",
              fontSize: 13,
              fontWeight: 400,
            }}
          >
            {k.delta}
          </span>
        </div>
      </div>
      <div className="h-[72px] mt-2">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={k.spark} margin={{ top: 4, right: 0, left: 0, bottom: 0 }}>
            <Area type="monotone" dataKey="v" stroke="#fff" strokeWidth={2} fill="rgba(255,255,255,0.2)" isAnimationActive={false} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export function ExecutiveScorecard({ print }: VizOpts = {}) {
  const T = tones(print);
  return (
    <div className="h-full w-full p-2 grid grid-cols-2 grid-rows-2 gap-2 min-h-0" style={{ background: print ? T.surface : undefined }}>
      {SCORECARD.map((s) => {
        const accent = s.tone === "warn" ? T.warning : T.primary;
        return (
          <div
            key={s.id}
            className="rounded-md p-3 flex flex-col justify-between min-h-0"
            style={{
              background: print ? "#F7F9FC" : T.surfaceAlt,
              border: `1.5px solid ${accent}88`,
            }}
          >
            <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 11, fontWeight: 400, color: accent, textTransform: "uppercase" }}>
              {s.label}
            </span>
            <span style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 400, fontSize: 28, color: T.text, lineHeight: 1.1 }}>
              {s.value}
            </span>
            <span style={{ fontFamily: "'Lato', sans-serif", fontSize: 12, fontWeight: 400, color: T.textSub }}>
              {s.sub}
            </span>
          </div>
        );
      })}
    </div>
  );
}

export function StoryStrip({ print }: VizOpts = {}) {
  const T = tones(print);
  const barColors = [JEWEL.viridian.base, JEWEL.indigo.base, JEWEL.lime.base];
  return (
    <div className="h-full w-full min-h-0 p-2 flex flex-col gap-2" style={{ background: print ? T.surface : undefined }}>
      <div className="flex-1 min-h-0 grid grid-cols-3 gap-2">
        {STORY_STRIP.charts.map((c, i) => (
          <div
            key={c.title}
            className="min-h-0 flex flex-col rounded-md p-1.5"
            style={{ background: print ? "#F7F9FC" : T.surfaceAlt, border: print ? `1px solid ${T.border}` : undefined }}
          >
            <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 10, fontWeight: 400, color: T.text, textTransform: "uppercase" }}>
              {c.title}
            </span>
            <div className="flex-1 min-h-0">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={c.data} margin={{ top: 4, right: 2, left: -20, bottom: 0 }}>
                  <XAxis dataKey="n" tick={{ fill: T.text, fontSize: 9 }} axisLine={false} tickLine={false} />
                  <Bar dataKey="v" fill={barColors[i % barColors.length]} radius={[3, 3, 0, 0]} isAnimationActive={false} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        ))}
      </div>
      <p
        className="flex-none px-2 py-2 rounded-md"
        style={{
          background: print ? "#EEF1FB" : `${T.accent}14`,
          border: `1.5px solid ${T.accent}55`,
          fontFamily: "'Lato', sans-serif",
          fontSize: 13,
          fontWeight: 400,
          color: T.text,
          lineHeight: 1.45,
        }}
      >
        {STORY_STRIP.caption}
      </p>
    </div>
  );
}

export function YardMapLite({ print }: VizOpts = {}) {
  const T = tones(print);
  return (
    <div className="h-full w-full min-h-0 p-2 flex flex-col gap-1" style={{ background: print ? T.surface : undefined }}>
      <div
        className="relative flex-1 min-h-0 rounded-md overflow-hidden"
        style={{ background: print ? "#F7F9FC" : T.surfaceAlt, border: `1.5px solid ${T.border}` }}
      >
        <div className="absolute left-[34%] top-0 bottom-0 w-[3%]" style={{ background: `${T.border}` }} />
        <div className="absolute left-0 right-0 top-[38%] h-[3%]" style={{ background: `${T.border}` }} />
        {YARD_BAYS.map((b) => {
          const color = yardColor(b.kind, T);
          return (
            <div
              key={b.id}
              className="absolute rounded-md flex flex-col items-center justify-center gap-0.5"
              style={{
                left: `${b.x}%`,
                top: `${b.y}%`,
                width: `${b.w}%`,
                height: `${b.h}%`,
                background: `${color}18`,
                border: `1.5px solid ${color}`,
              }}
            >
              <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 10, fontWeight: 400, color: T.text, textTransform: "uppercase" }}>
                {b.label}
              </span>
              <span style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 400, fontSize: 20, color, lineHeight: 1 }}>
                {b.loads}
              </span>
              <span style={{ fontFamily: "'Lato', sans-serif", fontSize: 10, fontWeight: 400, color: T.textMuted }}>loads</span>
            </div>
          );
        })}
      </div>
      <div className="flex gap-3 px-1">
        {(["dock", "bay", "staging", "ship"] as const).map((k) => (
          <span key={k} className="flex items-center gap-1" style={{ fontFamily: "'DM Mono', monospace", fontSize: 10, fontWeight: 400, color: T.text, textTransform: "uppercase" }}>
            <span className="inline-block w-2.5 h-2.5 rounded-sm" style={{ background: yardColor(k, T) }} />
            {k}
          </span>
        ))}
      </div>
    </div>
  );
}
