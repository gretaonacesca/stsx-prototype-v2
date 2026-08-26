import { X } from "lucide-react";
import { C, JEWEL } from "../colorTokens";
import { PANEL_META, type VizWidgetId } from "./widgetCatalog";
import { VizBody, VizPanelFrame } from "../viz/blocks";

export function WidgetModal({
  widgetId,
  onClose,
}: {
  widgetId: VizWidgetId;
  onClose: () => void;
}) {
  const meta = PANEL_META[widgetId];
  const title = meta?.title ?? widgetId;
  const isStat = widgetId.startsWith("stat") || widgetId === "kpi-hero";
  const indigo = JEWEL.indigo.base;

  return (
    <div
      className="fixed inset-0 z-[300] flex items-center justify-center p-4"
      style={{ background: "rgba(15,21,32,0.35)" }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-5xl h-[min(88vh,820px)] flex flex-col overflow-hidden"
        style={{
          background: C.surface,
          borderRadius: 12,
          border: `1.5px solid ${indigo}`,
          boxShadow: `0 28px 64px ${indigo}44`,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className="flex-none flex items-center justify-between px-4 py-3"
          style={{ background: indigo, color: "#fff" }}
        >
          <span style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 400, fontSize: 20 }}>{title}</span>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-md flex items-center justify-center"
            style={{ background: "rgba(255,255,255,0.15)", border: "none", cursor: "pointer", color: "#fff" }}
          >
            <X size={16} />
          </button>
        </div>
        <div className="flex-1 min-h-0 overflow-hidden p-4">
          <div className="h-full min-h-0">
            <VizPanelFrame id={widgetId} isStat={isStat}>
              <VizBody id={widgetId} />
            </VizPanelFrame>
          </div>
        </div>
      </div>
    </div>
  );
}
