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
    <div className="flex-1 min-h-0 flex flex-col overflow-hidden px-3 py-2 gap-1.5">
      {lastAction && (
        <p
          className="flex-none px-3 py-1.5 rounded-lg"
          style={{
            background: C.surface,
            border: `1.5px solid ${C.border}`,
            fontFamily: "'Lato', sans-serif",
            fontSize: 13,
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
          className="flex items-center gap-3 px-3 py-2 rounded-lg text-left flex-1 min-h-0"
          style={{
            background: C.surface,
            border: `1.5px solid ${C.border}`,
            cursor: "pointer",
          }}
        >
          <FieldKeyBadge letter={t.num} />
          <span
            className="flex-none w-8 h-8 rounded-md flex items-center justify-center"
            style={{ background: `${C.accent}22`, color: C.accent }}
          >
            <t.Icon size={18} />
          </span>
          <span className="flex flex-col min-w-0">
            <span style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 400, fontSize: 16, color: C.text, lineHeight: 1.2 }}>
              {t.label}
            </span>
            <span style={{ fontFamily: "'Lato', sans-serif", fontSize: 12, fontWeight: 400, color: C.text, lineHeight: 1.2 }}>
              {t.blurb}
            </span>
          </span>
        </button>
      ))}
    </div>
  );
}
