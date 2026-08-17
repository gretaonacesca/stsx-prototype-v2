import { ClipboardCheck, Truck, Search, Package, Layers } from "lucide-react";
import { C } from "../colorTokens";

export type ShopTab = "home" | "log" | "move" | "lookup" | "inventory" | "bundles";

export function ShopHome({
  lastAction,
  onGo,
}: {
  lastAction: string | null;
  onGo: (tab: ShopTab) => void;
}) {
  const tiles: { id: ShopTab; label: string; blurb: string; Icon: typeof ClipboardCheck }[] = [
    { id: "log", label: "Log an Action", blurb: "Inspection, labor, saw, transaction", Icon: ClipboardCheck },
    { id: "move", label: "Move a Load", blurb: "Receive, ship, return, final ship", Icon: Truck },
    { id: "lookup", label: "Look Up a Piece", blurb: "Find piecemark and history", Icon: Search },
    { id: "inventory", label: "Inventory", blurb: "ASN receive, audit, move, sweep, TFS", Icon: Package },
    { id: "bundles", label: "Bundles & Cutlists", blurb: "Build, checklist, cut", Icon: Layers },
  ];

  return (
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
      {tiles.map((t) => (
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
  );
}
