import { useState } from "react";
import {
  ChevronDown, ChevronRight, LayoutGrid, FileDown, Moon, Sun, LogOut, X,
} from "lucide-react";
import { C } from "../colorTokens";
import { NAV_CATEGORIES, findOperation, type OperationId } from "../nav/catalog";

export function Sidebar({
  activeOp,
  onOpenOp,
  collapsed,
}: {
  activeOp: OperationId | null;
  onOpenOp: (id: OperationId) => void;
  collapsed?: boolean;
}) {
  const [openCats, setOpenCats] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(NAV_CATEGORIES.map((c) => [c.id, c.id === "jobs"]))
  );

  if (collapsed) return null;

  return (
    <aside
      className="flex-none flex flex-col h-full overflow-hidden"
      style={{
        width: 260,
        background: C.surface,
        borderRight: `1.5px solid ${C.border}`,
      }}
    >
      <div className="px-4 py-3" style={{ borderBottom: `1.5px solid ${C.border}` }}>
        <p style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 700, fontSize: 18, color: C.text }}>STSX</p>
        <p style={{ fontFamily: "'DM Mono', monospace", fontSize: 11, color: C.text, textTransform: "uppercase", letterSpacing: "0.06em" }}>
          Operations
        </p>
      </div>
      <nav className="flex-1 overflow-y-auto py-2">
        {NAV_CATEGORIES.map((cat) => {
          const open = openCats[cat.id];
          const Icon = cat.Icon;
          return (
            <div key={cat.id} className="mb-1">
              <button
                type="button"
                className="w-full flex items-center gap-2 px-3 py-2"
                style={{ background: "transparent", border: "none", cursor: "pointer", color: C.text }}
                onClick={() => setOpenCats((p) => ({ ...p, [cat.id]: !p[cat.id] }))}
              >
                <Icon size={16} color={C.accent} />
                <span className="flex-1 text-left" style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 700, fontSize: 14 }}>
                  {cat.label}
                </span>
                {open ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
              </button>
              {open && (
                <div className="pb-1">
                  {cat.children.map((leaf) => {
                    const active = activeOp === leaf.id;
                    return (
                      <button
                        key={leaf.id}
                        type="button"
                        onClick={() => onOpenOp(leaf.id)}
                        className="w-full text-left px-3 py-1.5 pl-9"
                        style={{
                          background: active ? `${C.accent}18` : "transparent",
                          border: "none",
                          borderLeft: active ? `3px solid ${C.accent}` : "3px solid transparent",
                          cursor: "pointer",
                          fontFamily: "'Lato', sans-serif",
                          fontWeight: 700,
                          fontSize: 13,
                          color: C.text,
                        }}
                      >
                        {leaf.label}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </nav>
    </aside>
  );
}

export function TopBar({
  crumbs,
  isEditing,
  isDark,
  onToggleEdit,
  onOpenPdf,
  onToggleDark,
  onLogout,
  pdfMode,
  onExitPdf,
}: {
  crumbs: string[];
  isEditing: boolean;
  isDark: boolean;
  onToggleEdit: () => void;
  onOpenPdf: () => void;
  onToggleDark: () => void;
  onLogout: () => void;
  pdfMode: boolean;
  onExitPdf: () => void;
}) {
  return (
    <header
      className="flex-none flex items-center gap-3 px-4"
      style={{
        height: 56,
        background: C.surface,
        borderBottom: `1.5px solid ${C.border}`,
      }}
    >
      <div className="flex-1 min-w-0 flex items-center gap-2 overflow-x-auto">
        {crumbs.map((c, i) => (
          <span key={`${c}-${i}`} className="flex items-center gap-2 shrink-0">
            {i > 0 && <span style={{ color: C.text, opacity: 0.4 }}>/</span>}
            <span
              style={{
                fontFamily: i === crumbs.length - 1 ? "'Outfit', sans-serif" : "'Lato', sans-serif",
                fontWeight: 700,
                fontSize: i === crumbs.length - 1 ? 16 : 14,
                color: C.text,
              }}
            >
              {c}
            </span>
          </span>
        ))}
      </div>

      <div className="flex items-center gap-2 shrink-0">
        {pdfMode ? (
          <TopBtn icon={X} label="Back to Dashboard" onClick={onExitPdf} />
        ) : (
          <>
            <TopBtn
              icon={LayoutGrid}
              label={isEditing ? "Exit Edit" : "Edit Dashboard"}
              onClick={onToggleEdit}
              active={isEditing}
            />
            <TopBtn icon={FileDown} label="Report PDF" onClick={onOpenPdf} primary />
          </>
        )}
        <TopBtn icon={isDark ? Sun : Moon} label={isDark ? "Light" : "Dark"} onClick={onToggleDark} />
        <TopBtn icon={LogOut} label="Log Out" onClick={onLogout} />
      </div>
    </header>
  );
}

function TopBtn({
  icon: Icon,
  label,
  onClick,
  primary,
  active,
}: {
  icon: typeof FileDown;
  label: string;
  onClick: () => void;
  primary?: boolean;
  active?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md"
      style={{
        background: primary ? C.accent : active ? `${C.accent}22` : C.surfaceAlt,
        color: primary ? "#fff" : C.text,
        border: `1.5px solid ${primary ? C.accent : active ? C.accent : C.border}`,
        cursor: "pointer",
        fontFamily: "'DM Mono', monospace",
        fontSize: 12,
        fontWeight: 700,
      }}
    >
      <Icon size={14} />
      <span className="hidden sm:inline">{label}</span>
    </button>
  );
}

export function crumbsFor(op: OperationId | null, pdfMode: boolean): string[] {
  if (pdfMode) return ["Report PDF"];
  if (!op) return ["Dashboard"];
  const found = findOperation(op);
  if (!found) return ["Dashboard"];
  return [found.category.label, found.leaf.label];
}
