import {
  forwardRef, useCallback, useEffect, useRef, useState,
  type ReactNode, type DragEvent, type MouseEvent as ReactMouseEvent, type CSSProperties,
} from "react";
import { Plus, Trash2, Download, GripVertical, X } from "lucide-react";
import { C, JEWEL } from "../colorTokens";
import { VIZ_CATALOG, type VizWidgetId } from "../dashboard/widgetCatalog";
import {
  CompanyHeader, VizBody, VizPanelFrame, TimeRangeBar, StatCard,
} from "../viz/blocks";
import type { TimeRange } from "../data/mock";
import { exportPagesToPdf, type PageOrientation } from "./exportPdf";

/** PDF page content grid — portrait 6×12, landscape 12×6. */
export function gridDims(orientation: PageOrientation) {
  return orientation === "landscape"
    ? { cols: 12, rows: 6 }
    : { cols: 6, rows: 12 };
}

/** Outer page margin as % of A4 size */
export const PDF_MARGIN_PCT = 5.5;
const GRID_GAP_PX = 8;

const A4_PORTRAIT = { w: 794, h: 1123 };
const A4_LANDSCAPE = { w: 1123, h: 794 };

export type PdfBlockKind = VizWidgetId | "company-header";

export type PdfBlock = {
  id: string;
  kind: PdfBlockKind;
  col: number;
  row: number;
  colSpan: number;
  rowSpan: number;
};

export type PdfPage = {
  id: string;
  blocks: PdfBlock[];
};

function uid() {
  return Math.random().toString(36).slice(2, 10);
}

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

function defaultSpan(kind: PdfBlockKind, orientation: PageOrientation): { colSpan: number; rowSpan: number } {
  const { cols, rows } = gridDims(orientation);
  const full = cols;
  if (kind === "company-header") return { colSpan: full, rowSpan: 2 };
  if (kind.startsWith("stat")) return { colSpan: Math.min(3, cols), rowSpan: Math.min(3, rows) };
  if (kind === "kpi-hero") return { colSpan: Math.min(4, cols), rowSpan: Math.min(3, rows) };
  if (kind === "recent" || kind === "sankey" || kind === "story-strip") return { colSpan: full, rowSpan: Math.min(4, rows) };
  if (kind === "funnel" || kind === "yard-map") return { colSpan: Math.min(4, cols), rowSpan: Math.min(4, rows) };
  return { colSpan: full, rowSpan: Math.min(4, rows) };
}

function clampBlock(b: PdfBlock, orientation: PageOrientation): PdfBlock {
  const { cols, rows } = gridDims(orientation);
  const colSpan = clamp(b.colSpan, 1, cols);
  const rowSpan = clamp(b.rowSpan, 1, rows);
  const col = clamp(b.col, 1, cols - colSpan + 1);
  const row = clamp(b.row, 1, rows - rowSpan + 1);
  return { ...b, col, row, colSpan, rowSpan };
}

function makeBlock(kind: PdfBlockKind, orientation: PageOrientation, col = 1, row = 1): PdfBlock {
  const { colSpan, rowSpan } = defaultSpan(kind, orientation);
  return clampBlock({ id: uid(), kind, col, row, colSpan, rowSpan }, orientation);
}

/** Map pointer inside the grid element to a 1-based cell. */
function pointerToCell(
  clientX: number,
  clientY: number,
  gridEl: HTMLElement,
  orientation: PageOrientation
) {
  const { cols, rows } = gridDims(orientation);
  const rect = gridEl.getBoundingClientRect();
  const x = clientX - rect.left;
  const y = clientY - rect.top;
  const cellW = (rect.width - (cols - 1) * GRID_GAP_PX) / cols + GRID_GAP_PX;
  const cellH = (rect.height - (rows - 1) * GRID_GAP_PX) / rows + GRID_GAP_PX;
  const col = clamp(Math.floor(x / cellW) + 1, 1, cols);
  const row = clamp(Math.floor(y / cellH) + 1, 1, rows);
  return { col, row };
}

const PALETTE: { kind: PdfBlockKind; label: string }[] = [
  { kind: "company-header", label: "Company header" },
  ...VIZ_CATALOG.map((w) => ({ kind: w.id as PdfBlockKind, label: w.title })),
];

export function PdfBuilderPage({ seedKind }: { seedKind?: PdfBlockKind | null }) {
  const [orientation, setOrientation] = useState<PageOrientation>("portrait");
  const [pages, setPages] = useState<PdfPage[]>(() => [{
    id: uid(),
    blocks: seedKind ? [makeBlock(seedKind, "portrait", 1, 1)] : [],
  }]);
  const [activePage, setActivePage] = useState(0);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState<TimeRange>("7d");
  const [exporting, setExporting] = useState(false);
  const pageRefs = useRef<(HTMLDivElement | null)[]>([]);
  const gridRefs = useRef<(HTMLDivElement | null)[]>([]);

  const page = pages[activePage];
  const { cols: gridCols, rows: gridRows } = gridDims(orientation);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.key === "Delete" || e.key === "Backspace") && selectedId) {
        const tag = (e.target as HTMLElement)?.tagName;
        if (tag === "INPUT" || tag === "TEXTAREA") return;
        e.preventDefault();
        setPages((prev) =>
          prev.map((pg, i) =>
            i !== activePage ? pg : { ...pg, blocks: pg.blocks.filter((b) => b.id !== selectedId) }
          )
        );
        setSelectedId(null);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [selectedId, activePage]);

  const changeOrientation = (orient: PageOrientation) => {
    if (orient === orientation) return;
    setOrientation(orient);
    setPages((prev) =>
      prev.map((pg) => ({
        ...pg,
        blocks: pg.blocks.map((b) => clampBlock(b, orient)),
      }))
    );
  };

  const addPage = () => {
    setPages((p) => [...p, { id: uid(), blocks: [] }]);
    setActivePage(pages.length);
  };

  const removePage = (idx: number) => {
    if (pages.length <= 1) {
      setPages([{ id: uid(), blocks: [] }]);
      setActivePage(0);
      setSelectedId(null);
      return;
    }
    setPages((p) => p.filter((_, i) => i !== idx));
    setActivePage((a) => Math.max(0, Math.min(a === idx ? a - 1 : a, pages.length - 2)));
    setSelectedId(null);
  };

  const updateBlock = (blockId: string, patch: Partial<PdfBlock>) => {
    setPages((prev) =>
      prev.map((pg, i) =>
        i !== activePage
          ? pg
          : {
              ...pg,
              blocks: pg.blocks.map((b) =>
                b.id === blockId ? clampBlock({ ...b, ...patch }, orientation) : b
              ),
            }
      )
    );
  };

  const removeBlock = (blockId: string) => {
    setPages((prev) =>
      prev.map((pg, i) =>
        i !== activePage ? pg : { ...pg, blocks: pg.blocks.filter((b) => b.id !== blockId) }
      )
    );
    setSelectedId(null);
  };

  const placeBlockAt = (kind: PdfBlockKind, col: number, row: number) => {
    const block = makeBlock(kind, orientation, col, row);
    setPages((prev) =>
      prev.map((pg, i) => (i === activePage ? { ...pg, blocks: [...pg.blocks, block] } : pg))
    );
    setSelectedId(block.id);
  };

  const onDragStartPalette = (e: DragEvent, kind: PdfBlockKind) => {
    e.dataTransfer.setData("application/x-stsx-block", kind);
    e.dataTransfer.effectAllowed = "copy";
  };

  const onDropCanvas = (e: DragEvent) => {
    e.preventDefault();
    const kind = e.dataTransfer.getData("application/x-stsx-block") as PdfBlockKind;
    if (!kind) return;
    const grid = gridRefs.current[activePage];
    if (!grid) return;
    const { col, row } = pointerToCell(e.clientX, e.clientY, grid, orientation);
    placeBlockAt(kind, col, row);
  };

  const startMoveBlock = (e: ReactMouseEvent, block: PdfBlock) => {
    if ((e.target as HTMLElement).closest("[data-block-chrome]")) return;
    e.preventDefault();
    e.stopPropagation();
    setSelectedId(block.id);
    const grid = gridRefs.current[activePage];
    if (!grid) return;
    const origin = pointerToCell(e.clientX, e.clientY, grid, orientation);
    const offsetCol = origin.col - block.col;
    const offsetRow = origin.row - block.row;

    const onMove = (ev: globalThis.MouseEvent) => {
      const cell = pointerToCell(ev.clientX, ev.clientY, grid, orientation);
      updateBlock(block.id, {
        col: cell.col - offsetCol,
        row: cell.row - offsetRow,
      });
    };
    const onUp = () => {
      document.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseup", onUp);
    };
    document.addEventListener("mousemove", onMove);
    document.addEventListener("mouseup", onUp);
  };

  const startResizeBlock = (e: ReactMouseEvent, block: PdfBlock) => {
    e.preventDefault();
    e.stopPropagation();
    setSelectedId(block.id);
    const grid = gridRefs.current[activePage];
    if (!grid) return;

    const onMove = (ev: globalThis.MouseEvent) => {
      const cell = pointerToCell(ev.clientX, ev.clientY, grid, orientation);
      updateBlock(block.id, {
        colSpan: cell.col - block.col + 1,
        rowSpan: cell.row - block.row + 1,
      });
    };
    const onUp = () => {
      document.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseup", onUp);
    };
    document.addEventListener("mousemove", onMove);
    document.addEventListener("mouseup", onUp);
  };

  const handleExport = useCallback(async () => {
    setExporting(true);
    try {
      const els = pageRefs.current.filter(Boolean) as HTMLElement[];
      const orients = pages.map(() => orientation);
      await exportPagesToPdf(els, orients);
    } finally {
      setExporting(false);
    }
  }, [pages, orientation]);

  const renderBlocks = (pg: PdfPage, interactive: boolean) =>
    pg.blocks.map((b) => (
      <div
        key={b.id}
        onMouseDown={interactive ? (e) => startMoveBlock(e, b) : undefined}
        onClick={
          interactive
            ? (e) => {
                e.stopPropagation();
                setSelectedId(b.id);
              }
            : undefined
        }
        style={{
          gridColumn: `${b.col} / span ${b.colSpan}`,
          gridRow: `${b.row} / span ${b.rowSpan}`,
          outline: interactive && selectedId === b.id ? `2px solid ${C.accent}` : "none",
          outlineOffset: 1,
          cursor: interactive ? "move" : "default",
          overflow: "hidden",
          background: C.surface,
          borderRadius: 6,
          position: "relative",
          minHeight: 0,
          minWidth: 0,
        }}
      >
        <BlockPreview kind={b.kind} timeRange={timeRange} />
        {interactive && selectedId === b.id && (
          <>
            <button
              type="button"
              data-block-chrome
              title="Delete module"
              onClick={(e) => {
                e.stopPropagation();
                removeBlock(b.id);
              }}
              onMouseDown={(e) => e.stopPropagation()}
              className="absolute top-1 right-1 z-10 w-7 h-7 rounded-md flex items-center justify-center"
              style={{ background: C.danger, color: "#fff", border: "none", cursor: "pointer" }}
            >
              <X size={14} />
            </button>
            <div
              data-block-chrome
              onMouseDown={(e) => startResizeBlock(e, b)}
              style={{
                position: "absolute",
                right: 0,
                bottom: 0,
                width: 16,
                height: 16,
                background: C.accent,
                cursor: "nwse-resize",
                borderRadius: "2px 0 0 0",
                zIndex: 10,
              }}
            />
          </>
        )}
      </div>
    ));

  return (
    <div className="flex-1 min-h-0 flex overflow-hidden" style={{ background: C.bg }}>
      <aside
        className="flex-none flex flex-col overflow-hidden"
        style={{ width: 240, background: C.surface, borderRight: `1.5px solid ${C.border}` }}
      >
        <div className="px-3 py-3" style={{ borderBottom: `1.5px solid ${C.border}` }}>
          <p style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 700, fontSize: 16, color: C.text }}>Blocks</p>
          <p style={{ fontFamily: "'Lato', sans-serif", fontSize: 12, fontWeight: 700, color: C.text }}>
            Snap to {gridCols}×{gridRows} grid
          </p>
        </div>
        <div className="flex-1 overflow-y-auto p-2 flex flex-col gap-1.5">
          {PALETTE.map((item) => (
            <div
              key={item.kind}
              draggable
              onDragStart={(e) => onDragStartPalette(e, item.kind)}
              onDoubleClick={() => placeBlockAt(item.kind, 1, 1)}
              className="flex items-center gap-2 px-2 py-2 rounded-md cursor-grab"
              style={{ background: C.surfaceAlt, border: `1.5px solid ${C.border}` }}
            >
              <GripVertical size={14} color={C.text} />
              <span style={{ fontFamily: "'Lato', sans-serif", fontSize: 13, fontWeight: 700, color: C.text }}>
                {item.label}
              </span>
            </div>
          ))}
        </div>
        <div className="p-3 flex flex-col gap-2" style={{ borderTop: `1.5px solid ${C.border}` }}>
          <TimeRangeBar value={timeRange} onChange={setTimeRange} />
          <button
            type="button"
            onClick={handleExport}
            disabled={exporting}
            className="flex items-center justify-center gap-2 px-3 py-2 rounded-md"
            style={{
              background: JEWEL.indigo.base,
              color: "#fff",
              border: "none",
              cursor: exporting ? "wait" : "pointer",
              fontFamily: "'DM Mono', monospace",
              fontSize: 13,
              fontWeight: 700,
            }}
          >
            <Download size={14} />
            {exporting ? "Exporting…" : "Download PDF"}
          </button>
        </div>
      </aside>

      <div className="flex-1 min-w-0 flex flex-col overflow-hidden">
        <div
          className="flex-none flex items-center gap-2 px-4 py-2"
          style={{ background: C.surface, borderBottom: `1.5px solid ${C.border}` }}
        >
          {pages.map((pg, i) => (
            <div key={pg.id} className="flex items-center gap-0.5">
              <button
                type="button"
                onClick={() => setActivePage(i)}
                className="px-2.5 py-1 rounded-l-md"
                style={{
                  background: i === activePage ? C.accent : C.surfaceAlt,
                  color: i === activePage ? "#fff" : C.text,
                  border: `1.5px solid ${i === activePage ? C.accent : C.border}`,
                  borderRight: "none",
                  cursor: "pointer",
                  fontFamily: "'DM Mono', monospace",
                  fontSize: 12,
                  fontWeight: 700,
                }}
              >
                Page {i + 1}
              </button>
              <button
                type="button"
                title="Delete page"
                onClick={() => removePage(i)}
                className="px-1.5 py-1 rounded-r-md"
                style={{
                  background: i === activePage ? C.accent : C.surfaceAlt,
                  color: i === activePage ? "#fff" : C.danger,
                  border: `1.5px solid ${i === activePage ? C.accent : C.border}`,
                  cursor: "pointer",
                }}
              >
                <Trash2 size={12} />
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={addPage}
            className="px-2 py-1 rounded-md flex items-center gap-1"
            style={{
              background: C.surfaceAlt,
              border: `1.5px dashed ${C.border}`,
              cursor: "pointer",
              color: C.text,
              fontFamily: "'DM Mono', monospace",
              fontSize: 12,
              fontWeight: 700,
            }}
          >
            <Plus size={12} /> A4 page
          </button>

          <div className="flex items-center gap-1 ml-2">
            {(["portrait", "landscape"] as PageOrientation[]).map((o) => (
              <button
                key={o}
                type="button"
                onClick={() => changeOrientation(o)}
                className="px-2 py-1 rounded-md"
                style={{
                  background: orientation === o ? C.accent : C.surfaceAlt,
                  color: orientation === o ? "#fff" : C.text,
                  border: `1.5px solid ${orientation === o ? C.accent : C.border}`,
                  cursor: "pointer",
                  fontFamily: "'DM Mono', monospace",
                  fontSize: 12,
                  fontWeight: 700,
                  textTransform: "capitalize",
                }}
              >
                {o}
              </button>
            ))}
          </div>
          {selectedId && (
            <button
              type="button"
              onClick={() => removeBlock(selectedId)}
              className="ml-auto px-2 py-1 rounded-md flex items-center gap-1"
              style={{
                background: C.dangerBg,
                color: C.danger,
                border: `1.5px solid ${C.danger}`,
                cursor: "pointer",
                fontFamily: "'DM Mono', monospace",
                fontSize: 12,
                fontWeight: 700,
              }}
            >
              <Trash2 size={12} /> Delete module
            </button>
          )}
        </div>

        <div className="flex-1 overflow-auto p-6 flex flex-col items-center gap-6">
          <A4Page
            ref={(el) => {
              pageRefs.current[activePage] = el;
            }}
            orientation={orientation}
            gridCols={gridCols}
            gridRows={gridRows}
            onDragOver={(e) => e.preventDefault()}
            onDrop={onDropCanvas}
            onClickBlank={() => setSelectedId(null)}
            gridRef={(el) => {
              gridRefs.current[activePage] = el;
            }}
            showGrid
          >
            {page && renderBlocks(page, true)}
          </A4Page>

          {pages.map((pg, i) =>
            i === activePage ? null : (
              <div key={pg.id} className="sr-only" aria-hidden>
                <A4Page
                  ref={(el) => {
                    pageRefs.current[i] = el;
                  }}
                  orientation={orientation}
                  gridCols={gridCols}
                  gridRows={gridRows}
                  gridRef={(el) => {
                    gridRefs.current[i] = el;
                  }}
                >
                  {renderBlocks(pg, false)}
                </A4Page>
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
}

function BlockPreview({ kind, timeRange }: { kind: PdfBlockKind; timeRange: TimeRange }) {
  if (kind === "company-header") return <CompanyHeader showEditPencil />;
  if (kind.startsWith("stat")) return <StatCard id={kind} />;
  if (kind === "kpi-hero") return <VizBody id="kpi-hero" timeRange={timeRange} />;
  return (
    <VizPanelFrame id={kind as VizWidgetId} print>
      <VizBody id={kind as VizWidgetId} timeRange={timeRange} print />
    </VizPanelFrame>
  );
}

const A4Page = forwardRef<
  HTMLDivElement,
  {
    children?: ReactNode;
    orientation?: PageOrientation;
    gridCols: number;
    gridRows: number;
    onDragOver?: (e: DragEvent) => void;
    onDrop?: (e: DragEvent) => void;
    onClickBlank?: () => void;
    gridRef?: (el: HTMLDivElement | null) => void;
    showGrid?: boolean;
  }
>(function A4Page({
  children,
  orientation = "portrait",
  gridCols,
  gridRows,
  onDragOver,
  onDrop,
  onClickBlank,
  gridRef,
  showGrid,
}, ref) {
  const size = orientation === "landscape" ? A4_LANDSCAPE : A4_PORTRAIT;
  const gridStyle: CSSProperties = {
    display: "grid",
    gridTemplateColumns: `repeat(${gridCols}, minmax(0, 1fr))`,
    gridTemplateRows: `repeat(${gridRows}, minmax(0, 1fr))`,
    gap: GRID_GAP_PX,
  };

  return (
    <div
      ref={ref}
      data-a4
      data-orientation={orientation}
      onClick={onClickBlank}
      className="relative shrink-0 shadow-xl"
      style={{
        width: size.w,
        height: size.h,
        background: "#fff",
        border: `1px solid ${C.border}`,
      }}
    >
      <div
        className="absolute"
        style={{
          top: `${PDF_MARGIN_PCT}%`,
          left: `${PDF_MARGIN_PCT}%`,
          width: `${100 - PDF_MARGIN_PCT * 2}%`,
          height: `${100 - PDF_MARGIN_PCT * 2}%`,
        }}
      >
        {showGrid && (
          <div className="absolute inset-0 pointer-events-none" style={gridStyle} aria-hidden>
            {Array.from({ length: gridCols * gridRows }).map((_, i) => (
              <div
                key={i}
                className="rounded-sm"
                style={{ border: `1px dashed ${C.border}99`, background: `${C.accent}06` }}
              />
            ))}
          </div>
        )}
        <div
          ref={gridRef}
          data-pdf-grid
          onDragOver={onDragOver}
          onDrop={onDrop}
          className="absolute inset-0"
          style={gridStyle}
        >
          {children}
        </div>
      </div>
    </div>
  );
});
