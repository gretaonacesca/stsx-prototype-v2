import { useEffect, useState } from "react";
import { Home, ClipboardCheck, Truck, Search, LogOut, Moon, Sun } from "lucide-react";
import { Toaster } from "sonner";
import { C } from "../colorTokens";
import { ShopHome, type ShopTab } from "./ShopHome";
import { FieldKeyBadge } from "./components/FieldKeyBadge";
import { LogActionPage } from "./LogActionPage";
import { MoveLoadPage } from "./MoveLoadPage";
import { LookupPage } from "./LookupPage";
import { InventoryPage } from "./InventoryPage";
import { BundlesPage } from "./BundlesPage";

const TABS: { id: ShopTab; label: string; Icon: typeof Home }[] = [
  { id: "home", label: "Home", Icon: Home },
  { id: "log", label: "Log", Icon: ClipboardCheck },
  { id: "move", label: "Move", Icon: Truck },
  { id: "lookup", label: "Lookup", Icon: Search },
];

const TITLES: Record<ShopTab, string> = {
  home: "Shop floor",
  log: "Log an Action",
  move: "Move a Load",
  lookup: "Look Up a Piece",
  inventory: "Inventory",
  bundles: "Bundles & Cutlists",
};

export function ShopApp({
  isDark,
  onToggleDark,
  onLogout,
}: {
  isDark: boolean;
  onToggleDark: (next: boolean) => void;
  onLogout: () => void;
}) {
  const [tab, setTab] = useState<ShopTab>("home");
  const [lastAction, setLastAction] = useState<string | null>("Inspection · B-1042-A");

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "F1") return;
      e.preventDefault();
      setTab("home");
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <div className="h-screen flex flex-col overflow-hidden" style={{ background: C.bg }}>
      <header
        className="flex-none flex items-center gap-2 px-3"
        style={{
          height: 52,
          background: C.surface,
          borderBottom: `1.5px solid ${C.border}`,
        }}
      >
        <p
          className="flex-1 min-w-0 truncate flex items-center gap-2"
          style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 400, fontSize: 18, color: C.text }}
        >
          {TITLES[tab]}
        </p>
        <button
          type="button"
          aria-label={isDark ? "Light mode" : "Dark mode"}
          onClick={() => onToggleDark(!isDark)}
          className="w-10 h-10 rounded-lg flex items-center justify-center"
          style={{ background: C.surfaceAlt, border: `1.5px solid ${C.border}`, color: C.text, cursor: "pointer" }}
        >
          {isDark ? <Sun size={18} /> : <Moon size={18} />}
        </button>
        <button
          type="button"
          aria-label="Log out"
          onClick={onLogout}
          className="w-10 h-10 rounded-lg flex items-center justify-center"
          style={{ background: C.surfaceAlt, border: `1.5px solid ${C.border}`, color: C.text, cursor: "pointer" }}
        >
          <LogOut size={18} />
        </button>
      </header>

      {tab === "home" && <ShopHome lastAction={lastAction} onGo={setTab} />}
      {tab === "log" && <LogActionPage onSaved={setLastAction} />}
      {tab === "move" && <MoveLoadPage onSaved={setLastAction} />}
      {tab === "lookup" && <LookupPage />}
      {tab === "inventory" && <InventoryPage onSaved={setLastAction} />}
      {tab === "bundles" && <BundlesPage onSaved={setLastAction} />}

      <nav
        className="flex-none grid grid-cols-4"
        style={{
          minHeight: 64,
          background: C.surface,
          borderTop: `1.5px solid ${C.border}`,
          paddingBottom: "env(safe-area-inset-bottom)",
        }}
      >
        {TABS.map((t) => {
          const on = t.id === tab;
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              className="flex flex-col items-center justify-center gap-0.5"
              style={{
                background: "transparent",
                border: "none",
                cursor: "pointer",
                color: on ? C.accent : C.text,
              }}
            >
              <t.Icon size={22} strokeWidth={on ? 2.4 : 1.8} />
              <span className="flex items-center gap-0.5" style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 400, fontSize: 11 }}>
                {t.id === "home" && <FieldKeyBadge letter="F1" />}
                {t.label}
              </span>
            </button>
          );
        })}
      </nav>
      <Toaster position="top-center" richColors />
    </div>
  );
}
