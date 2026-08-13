import {
  ResponsiveContainer, AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip,
  Sankey, Layer, Rectangle, FunnelChart, Funnel, LabelList, Cell,
} from "recharts";
import { C, JEWEL } from "../colorTokens";
import {
  FUNNEL_STAGES, SANKEY_NODES, SANKEY_LINKS, BURNDOWN, KPI_HERO,
  SCORECARD, STORY_STRIP, YARD_BAYS, yardKindColor,
} from "../data/chartsMock";

function tipStyle() {
  return {
    background: C.surface,
    border: `1.5px solid ${C.border}`,
    borderRadius: 8,
    fontFamily: "'Lato', sans-serif",
    fontWeight: 700,
    fontSize: 12,
    color: C.text,
  };
}

const FUNNEL_COLORS = [
  JEWEL.viridian.base,
  JEWEL.chrome.base,
  JEWEL.indigo.base,
  JEWEL.lime.base,
  JEWEL.viridian.dark,
  JEWEL.indigo.dark,
];

export function ThroughputFunnel() {
  return (
    <div className="h-full w-full min-h-0 p-2">
      <ResponsiveContainer width="100%" height="100%">
        <FunnelChart>
          <Tooltip contentStyle={tipStyle()} />
          <Funnel dataKey="value" data={FUNNEL_STAGES} isAnimationActive={false}>
            {FUNNEL_STAGES.map((_, i) => (
              <Cell key={i} fill={FUNNEL_COLORS[i % FUNNEL_COLORS.length]} />
            ))}
            <LabelList
              position="right"
              fill={C.text}
              stroke="none"
              dataKey="name"
              style={{ fontFamily: "'DM Mono', monospace", fontSize: 11, fontWeight: 700 }}
            />
            <LabelList
              position="center"
              fill="#fff"
              stroke="none"
              dataKey="value"
              style={{ fontFamily: "'Outfit', sans-serif", fontSize: 13, fontWeight: 700 }}
            />
          </Funnel>
        </FunnelChart>
      </ResponsiveContainer>
    </div>
  );
}

function SankeyNode(props: {
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  index?: number;
  payload?: { name?: string };
}) {
  const x = props.x ?? 0;
  const y = props.y ?? 0;
  const width = props.width ?? 0;
  const height = props.height ?? 0;
  const index = props.index ?? 0;
  const name = props.payload?.name ?? "";
  const colors = [
    JEWEL.viridian.base, JEWEL.chrome.base, JEWEL.indigo.base, JEWEL.lime.base,
    C.primary, C.accent, C.warning, C.danger,
  ];
  return (
    <Layer key={`sn-${index}`}>
      <Rectangle x={x} y={y} width={width} height={height} fill={colors[index % colors.length]} fillOpacity={0.92} radius={2} />
      <text
        x={x + width + 6}
        y={y + height / 2}
        dy="0.35em"
        fill={C.text}
        fontSize={11}
        fontFamily="'DM Mono', monospace"
        fontWeight={700}
      >
        {name}
      </text>
    </Layer>
  );
}

export function BottleneckSankey() {
  return (
    <div className="h-full w-full min-h-0 p-2">
      <ResponsiveContainer width="100%" height="100%">
        <Sankey
          data={{ nodes: SANKEY_NODES, links: SANKEY_LINKS }}
          nodeWidth={12}
          nodePadding={16}
          margin={{ left: 8, right: 96, top: 8, bottom: 8 }}
          link={{ stroke: C.accent, strokeOpacity: 0.3 }}
          node={SankeyNode as never}
          isAnimationActive={false}
        >
          <Tooltip contentStyle={tipStyle()} />
        </Sankey>
      </ResponsiveContainer>
    </div>
  );
}

export function BacklogBurndown() {
  return (
    <div className="h-full w-full min-h-0 p-2 flex flex-col">
      <p className="px-1 pb-1" style={{ fontFamily: "'Lato', sans-serif", fontSize: 12, fontWeight: 700, color: C.text }}>
        Remaining jobs (week)
      </p>
      <div className="flex-1 min-h-0">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={BURNDOWN} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="burnFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={C.accent} stopOpacity={0.45} />
                <stop offset="100%" stopColor={C.accent} stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <XAxis dataKey="day" tick={{ fill: C.text, fontSize: 11, fontFamily: "'DM Mono', monospace" }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: C.text, fontSize: 11, fontFamily: "'DM Mono', monospace" }} axisLine={false} tickLine={false} width={32} />
            <Tooltip contentStyle={tipStyle()} />
            <Area type="monotone" dataKey="remaining" stroke={C.accent} strokeWidth={2} fill="url(#burnFill)" isAnimationActive={false} />
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
        <p style={{ fontFamily: "'DM Mono', monospace", fontSize: 12, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", opacity: 0.9 }}>
          {k.label}
        </p>
        <div className="flex items-end gap-3 mt-1">
          <span style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 700, fontSize: 48, lineHeight: 1 }}>
            {k.value}
            <span style={{ fontSize: 20, marginLeft: 4, opacity: 0.85 }}>{k.unit}</span>
          </span>
          <span
            className="mb-1 px-2 py-0.5 rounded"
            style={{
              background: k.deltaPositive ? "rgba(255,255,255,0.22)" : "rgba(0,0,0,0.25)",
              fontFamily: "'DM Mono', monospace",
              fontSize: 13,
              fontWeight: 700,
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

export function ExecutiveScorecard() {
  return (
    <div className="h-full w-full p-2 grid grid-cols-2 grid-rows-2 gap-2 min-h-0">
      {SCORECARD.map((s) => {
        const accent = s.tone === "warn" ? C.warning : C.primary;
        return (
          <div
            key={s.id}
            className="rounded-md p-3 flex flex-col justify-between min-h-0"
            style={{ background: C.surfaceAlt, border: `1.5px solid ${accent}66` }}
          >
            <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 11, fontWeight: 700, color: accent, textTransform: "uppercase" }}>
              {s.label}
            </span>
            <span style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 700, fontSize: 28, color: C.text, lineHeight: 1.1 }}>
              {s.value}
            </span>
            <span style={{ fontFamily: "'Lato', sans-serif", fontSize: 12, fontWeight: 700, color: C.text }}>
              {s.sub}
            </span>
          </div>
        );
      })}
    </div>
  );
}

export function StoryStrip() {
  return (
    <div className="h-full w-full min-h-0 p-2 flex flex-col gap-2">
      <div className="flex-1 min-h-0 grid grid-cols-3 gap-2">
        {STORY_STRIP.charts.map((c) => (
          <div key={c.title} className="min-h-0 flex flex-col rounded-md p-1.5" style={{ background: C.surfaceAlt }}>
            <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 10, fontWeight: 700, color: C.text, textTransform: "uppercase" }}>
              {c.title}
            </span>
            <div className="flex-1 min-h-0">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={c.data} margin={{ top: 4, right: 2, left: -20, bottom: 0 }}>
                  <XAxis dataKey="n" tick={{ fill: C.text, fontSize: 9 }} axisLine={false} tickLine={false} />
                  <Bar dataKey="v" fill={C.accent} radius={[3, 3, 0, 0]} isAnimationActive={false} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        ))}
      </div>
      <p
        className="flex-none px-2 py-2 rounded-md"
        style={{
          background: `${C.accent}14`,
          border: `1.5px solid ${C.accent}44`,
          fontFamily: "'Lato', sans-serif",
          fontSize: 13,
          fontWeight: 700,
          color: C.text,
          lineHeight: 1.45,
        }}
      >
        {STORY_STRIP.caption}
      </p>
    </div>
  );
}

export function YardMapLite() {
  return (
    <div className="h-full w-full min-h-0 p-2 flex flex-col gap-1">
      <div
        className="relative flex-1 min-h-0 rounded-md overflow-hidden"
        style={{ background: C.surfaceAlt, border: `1.5px solid ${C.border}` }}
      >
        <div className="absolute left-[34%] top-0 bottom-0 w-[3%]" style={{ background: `${C.border}88` }} />
        <div className="absolute left-0 right-0 top-[38%] h-[3%]" style={{ background: `${C.border}88` }} />
        {YARD_BAYS.map((b) => (
          <div
            key={b.id}
            className="absolute rounded-md flex flex-col items-center justify-center gap-0.5"
            style={{
              left: `${b.x}%`,
              top: `${b.y}%`,
              width: `${b.w}%`,
              height: `${b.h}%`,
              background: `${yardKindColor(b.kind)}22`,
              border: `1.5px solid ${yardKindColor(b.kind)}`,
            }}
          >
            <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 10, fontWeight: 700, color: C.text, textTransform: "uppercase" }}>
              {b.label}
            </span>
            <span style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 700, fontSize: 20, color: yardKindColor(b.kind), lineHeight: 1 }}>
              {b.loads}
            </span>
            <span style={{ fontFamily: "'Lato', sans-serif", fontSize: 10, fontWeight: 700, color: C.text }}>loads</span>
          </div>
        ))}
      </div>
      <div className="flex gap-3 px-1">
        {(["dock", "bay", "staging", "ship"] as const).map((k) => (
          <span key={k} className="flex items-center gap-1" style={{ fontFamily: "'DM Mono', monospace", fontSize: 10, fontWeight: 700, color: C.text, textTransform: "uppercase" }}>
            <span className="inline-block w-2.5 h-2.5 rounded-sm" style={{ background: yardKindColor(k) }} />
            {k}
          </span>
        ))}
      </div>
    </div>
  );
}
