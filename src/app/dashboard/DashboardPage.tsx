import { useCallback, useEffect, useRef, useState, type MouseEvent as ReactMouseEvent } from "react";
import { Plus, X } from "lucide-react";
import { C } from "../colorTokens";
import {
  COLS, ROWS, GAP, DEFAULT_LAYOUT, VIZ_CATALOG, EDGE_CURSORS,
  clamp, getEmptyCells, fitNewPanel, nearestColLine, nearestRowLine, applyResize,
  type PanelDef, type VizWidgetId, type ResizeEdge,
} from "./widgetCatalog";
import { VizBody, VizPanelFrame, PdfHoverButton } from "../viz/blocks";
import { WidgetModal } from "./WidgetModal";

export function DashboardPage({
  isEditing,
  onAddToPdf,
}: {
  isEditing: boolean;
  onAddToPdf: (widgetId: VizWidgetId) => void;
}) {
  const [panels, setPanels] = useState<PanelDef[]>(DEFAULT_LAYOUT);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [pickerCell, setPickerCell] = useState<{ col: number; row: number } | null>(null);
  const [expandedId, setExpandedId] = useState<VizWidgetId | null>(null);
  const gridRef = useRef<HTMLDivElement>(null);

  const usedIds = new Set(panels.map((p) => p.id));
  const available = VIZ_CATALOG.filter((w) => !usedIds.has(w.id));
  const emptyCells = isEditing ? getEmptyCells(panels) : [];
  const anyHovered = hoveredId !== null && !isEditing;

  const handleAdd = (id: VizWidgetId, col: number, row: number) => {
    const next = fitNewPanel(id, col, row, panels);
    if (next) setPanels((p) => [...p, next]);
    setPickerCell(null);
  };

  const handleDelete = (id: VizWidgetId) => {
    setPanels((p) => p.filter((x) => x.id !== id));
  };

  const startMove = useCallback((e: ReactMouseEvent, id: VizWidgetId) => {
    if (!isEditing || !gridRef.current) return;
    e.preventDefault();
    e.stopPropagation();
    const panel = panels.find((p) => p.id === id);
    if (!panel) return;
    const rect = gridRef.current.getBoundingClientRect();
    const startColLine = nearestColLine(e.clientX - rect.left, rect.width);
    const startRowLine = nearestRowLine(e.clientY - rect.top, rect.height);
    const offsetCol = startColLine - panel.colStart;
    const offsetRow = startRowLine - panel.rowStart;
    setDraggingId(id);

    const handleMove = (ev: globalThis.MouseEvent) => {
      const r = gridRef.current!.getBoundingClientRect();
      const colLine = nearestColLine(ev.clientX - r.left, r.width);
      const rowLine = nearestRowLine(ev.clientY - r.top, r.height);
      setPanels((prev) =>
        prev.map((p) => {
          if (p.id !== id) return p;
          const nextCol = clamp(colLine - offsetCol, 1, COLS - p.colSpan + 1);
          const nextRow = clamp(rowLine - offsetRow, 1, ROWS - p.rowSpan + 1);
          return { ...p, colStart: nextCol, rowStart: nextRow };
        })
      );
    };
    const handleUp = () => {
      setDraggingId(null);
      document.removeEventListener("mousemove", handleMove);
      document.removeEventListener("mouseup", handleUp);
    };
    document.addEventListener("mousemove", handleMove);
    document.addEventListener("mouseup", handleUp);
  }, [isEditing, panels]);

  const startResize = useCallback((e: ReactMouseEvent, id: VizWidgetId, edge: ResizeEdge) => {
    if (!isEditing || !gridRef.current) return;
    e.preventDefault();
    e.stopPropagation();
    setDraggingId(id);
    const handleMove = (ev: globalThis.MouseEvent) => {
      const r = gridRef.current!.getBoundingClientRect();
      const colLine = nearestColLine(ev.clientX - r.left, r.width);
      const rowLine = nearestRowLine(ev.clientY - r.top, r.height);
      setPanels((prev) =>
        prev.map((p) => (p.id === id ? applyResize(p, edge, colLine, rowLine) : p))
      );
    };
    const handleUp = () => {
      setDraggingId(null);
      document.removeEventListener("mousemove", handleMove);
      document.removeEventListener("mouseup", handleUp);
    };
    document.addEventListener("mousemove", handleMove);
    document.addEventListener("mouseup", handleUp);
  }, [isEditing]);

  useEffect(() => {
    if (!isEditing) {
      setPickerCell(null);
      setDraggingId(null);
    }
  }, [isEditing]);

  return (
    <div className="flex-1 min-h-0 flex flex-col">
      <div className="flex-1 min-h-0 overflow-hidden p-4" onClick={() => setPickerCell(null)}>
        <div
          ref={gridRef}
          className="relative grid h-full"
          style={{
            gridTemplateColumns: `repeat(${COLS}, minmax(0, 1fr))`,
            gridTemplateRows: `repeat(${ROWS}, minmax(0, 1fr))`,
            gap: GAP,
          }}
        >
          {isEditing && emptyCells.map(({ col, row }) => (
            <EmptyCellAdd
              key={`empty-${col}-${row}`}
              col={col}
              row={row}
              isOpen={pickerCell?.col === col && pickerCell?.row === row}
              options={available}
              onOpen={() => setPickerCell({ col, row })}
              onClose={() => setPickerCell(null)}
              onPick={(id) => handleAdd(id, col, row)}
            />
          ))}

          {panels.map((panel) => {
            const isHovered = hoveredId === panel.id;
            const isGhosted = anyHovered && !isHovered;
            const isStat = panel.id.startsWith("stat") || panel.id === "kpi-hero";
            return (
              <div
                key={panel.id}
                className="group relative min-h-0"
                style={{
                  gridColumn: `${panel.colStart} / span ${panel.colSpan}`,
                  gridRow: `${panel.rowStart} / span ${panel.rowSpan}`,
                  opacity: isGhosted ? 0.58 : 1,
                  filter: isGhosted ? "saturate(0.58)" : "none",
                  transition: "opacity 180ms ease, filter 180ms ease",
                  zIndex: draggingId === panel.id ? 20 : 1,
                  cursor: isEditing ? "grab" : "pointer",
                  outline: isEditing ? `1.5px dashed ${C.accent}88` : undefined,
                  outlineOffset: 2,
                  borderRadius: 10,
                }}
                onMouseEnter={() => !isEditing && setHoveredId(panel.id)}
                onMouseLeave={() => setHoveredId(null)}
                onMouseDown={(e) => isEditing && startMove(e, panel.id)}
                onClick={() => {
                  if (!isEditing) setExpandedId(panel.id);
                }}
              >
                {!isEditing && <PdfHoverButton onClick={() => onAddToPdf(panel.id)} />}
                {isEditing && (
                  <button
                    type="button"
                    title="Remove"
                    className="absolute top-1 right-1 z-30 w-7 h-7 rounded-md flex items-center justify-center"
                    style={{ background: C.danger, color: "#fff", border: "none", cursor: "pointer" }}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(panel.id);
                    }}
                    onMouseDown={(e) => e.stopPropagation()}
                  >
                    <X size={14} />
                  </button>
                )}
                {isEditing && (Object.keys(EDGE_CURSORS) as ResizeEdge[]).map((edge) => (
                  <div
                    key={edge}
                    onMouseDown={(e) => startResize(e, panel.id, edge)}
                    style={{
                      position: "absolute",
                      zIndex: 25,
                      cursor: EDGE_CURSORS[edge],
                      ...(edge.includes("n") ? { top: 0, height: 8 } : {}),
                      ...(edge.includes("s") ? { bottom: 0, height: 8 } : {}),
                      ...(edge.includes("e") ? { right: 0, width: 8 } : {}),
                      ...(edge.includes("w") ? { left: 0, width: 8 } : {}),
                      ...(edge.length === 1 && (edge === "n" || edge === "s") ? { left: 8, right: 8 } : {}),
                      ...(edge.length === 1 && (edge === "e" || edge === "w") ? { top: 8, bottom: 8 } : {}),
                      ...(edge.length === 2 ? { width: 14, height: 14 } : {}),
                    }}
                  />
                ))}
                <div className="h-full w-full pointer-events-none">
                  <VizPanelFrame id={panel.id} isStat={isStat}>
                    <VizBody id={panel.id} isEditing={isEditing} />
                  </VizPanelFrame>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {expandedId && <WidgetModal widgetId={expandedId} onClose={() => setExpandedId(null)} />}
    </div>
  );
}

function EmptyCellAdd({
  col,
  row,
  isOpen,
  options,
  onOpen,
  onClose,
  onPick,
}: {
  col: number;
  row: number;
  isOpen: boolean;
  options: typeof VIZ_CATALOG;
  onOpen: () => void;
  onClose: () => void;
  onPick: (id: VizWidgetId) => void;
}) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      className="relative flex items-center justify-center group/empty"
      style={{ gridColumn: col, gridRow: row, zIndex: isOpen ? 30 : 2 }}
      onClick={(e) => e.stopPropagation()}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {(hovered || isOpen) && (
        <button
          type="button"
          onClick={onOpen}
          className="w-9 h-9 rounded-md flex items-center justify-center"
          style={{ background: `${C.accent}18`, border: `1.5px solid ${C.accent}`, color: C.accent, cursor: "pointer" }}
        >
          <Plus size={18} />
        </button>
      )}
      {isOpen && (
        <div
          className="absolute top-10 left-1/2 -translate-x-1/2 z-40 w-56 max-h-64 overflow-y-auto rounded-md shadow-xl p-1"
          style={{ background: C.surface, border: `1.5px solid ${C.border}` }}
        >
          {options.length === 0 ? (
            <p className="px-2 py-2" style={{ fontFamily: "'Lato', sans-serif", fontSize: 13, fontWeight: 400, color: C.text }}>
              All widgets placed
            </p>
          ) : (
            options.map((o) => (
              <button
                key={o.id}
                type="button"
                className="w-full text-left px-2 py-1.5 rounded flex items-center gap-2"
                style={{ background: "transparent", border: "none", cursor: "pointer" }}
                onClick={() => onPick(o.id)}
              >
                <o.Icon size={14} color={o.jewel.base} />
                <span style={{ fontFamily: "'Lato', sans-serif", fontSize: 13, fontWeight: 400, color: C.text }}>{o.title}</span>
              </button>
            ))
          )}
          <button type="button" className="w-full px-2 py-1 text-left" style={{ border: "none", background: "transparent", cursor: "pointer", fontFamily: "'DM Mono', monospace", fontSize: 11, color: C.text }} onClick={onClose}>
            Cancel
          </button>
        </div>
      )}
    </div>
  );
}
