import { useEffect } from "react";
import { ClipboardCheck, Truck, Search, Package, Layers } from "lucide-react";
import { C } from "../colorTokens";
import { FieldKeyBadge } from "./components/FieldKeyBadge";

export type ShopTab = "home" | "log" | "move" | "lookup" | "inventory" | "bundles";

const TILES: { id: ShopTab; num: string; label: string; blurb: string; Icon: typeof ClipboardCheck }[] = [
  { id: "log", num: "1", label: "Log an Action", blurb: "Inspection, labor, saw, transaction", Icon: ClipboardCheck },
  { id: "move", num: "2", label: "Move a Load", blurb: "Receive, ship, return, final ship", Icon: Truck },
  { id: "lookup", num: "3", label: "Look Up a Piece", blurb: "Find piecemark and history", Icon: Search },
  { id: "inventory", num: "4", label: "Inventory", blurb: "ASN receive, audit, move, sweep, TFS", Icon: Package },
  { id: "bundles", num: "5", label: "Bundles & Cutlists", blurb: "Build, checklist, cut", Icon: Layers },
];

export function ShopHome({
  lastAction,
  onGo,
}: {
  lastAction: string | null;
  onGo: (tab: ShopTab) => void;
}) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.altKey || e.metaKey) return;
      if (e.key === "F1" || e.key === "F2" || e.key === "F3") return;
      const byNum = TILES.find((t) => t.num === e.key);
      if (byNum) {
        e.preventDefault();
        onGo(byNum.id);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onGo]);

  return (
    <div className="flex-1 min-h-0 flex flex-col overflow-hidden">
      <div className="flex-1 min-h-0 overflow-y-auto px-3 py-4 flex flex-col gap-3">
        {lastAction && (
          <p
            className="px-3 py-2 rounded-lg"
            style={{
              background: C.surface,
              border: `1.5px solid ${C.border}`,
              fontFamily: "'Lato', sans-serif",
              fontSize: 14,
              fontWeight: 400,
              color: C.text,
            }}
          >
            Last action: {lastAction}
          </p>
        )}
        {TILES.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => onGo(t.id)}
            className="flex items-center gap-4 px-4 py-5 rounded-xl text-left"
            style={{
              background: C.surface,
              border: `1.5px solid ${C.border}`,
              cursor: "pointer",
              minHeight: 88,
            }}
          >
            <FieldKeyBadge letter={t.num} />
            <span
              className="flex-none w-12 h-12 rounded-lg flex items-center justify-center"
              style={{ background: `${C.accent}22`, color: C.accent }}
            >
              <t.Icon size={24} />
            </span>
            <span className="flex flex-col gap-0.5">
              <span style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 400, fontSize: 18, color: C.text }}>
                {t.label}
              </span>
              <span style={{ fontFamily: "'Lato', sans-serif", fontSize: 14, fontWeight: 400, color: C.text }}>
                {t.blurb}
              </span>
            </span>
          </button>
        ))}
      </div>
      <div
        className="flex-none flex flex-wrap gap-x-3 gap-y-1 px-3 py-1.5"
        style={{
          background: C.surfaceAlt,
          borderTop: `1.5px solid ${C.border}`,
          fontFamily: "'DM Mono', monospace",
          fontSize: 11,
          color: C.text,
        }}
      >
        <span className="flex items-center gap-1"><FieldKeyBadge letter="F1" /> Home</span>
        <span className="flex items-center gap-1"><FieldKeyBadge letter="1–5" /> Open</span>
      </div>
    </div>
  );
}
