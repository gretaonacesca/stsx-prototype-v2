import type { ReactNode } from "react";
import { Minus, X } from "lucide-react";
import { C } from "../colorTokens";
import { findOperation, toneForOperation, type OperationId } from "../nav/catalog";

export function OperationModal({
  opId,
  onClose,
  onMinimize,
  children,
}: {
  opId: OperationId;
  onClose: () => void;
  onMinimize?: () => void;
  children: ReactNode;
}) {
  const found = findOperation(opId);
  const title = found?.leaf.label ?? opId;
  const tone = toneForOperation(opId);

  return (
    <div
      className="fixed inset-0 z-[300] flex items-center justify-center p-4"
      style={{ background: "rgba(15,21,32,0.35)" }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-4xl max-h-[88vh] flex flex-col overflow-hidden"
        style={{
          background: C.surface,
          borderRadius: 12,
          border: `1.5px solid ${tone.border}`,
          boxShadow: `0 28px 64px ${tone.base}44`,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className="flex-none flex items-center justify-between px-4 py-3"
          style={{
            background: tone.base,
            color: tone.text,
          }}
        >
          <span style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 400, fontSize: 20 }}>{title}</span>
          <div className="flex items-center gap-2">
            {onMinimize && (
              <button
                type="button"
                onClick={onMinimize}
                className="w-8 h-8 rounded-md flex items-center justify-center"
                style={{ background: "rgba(255,255,255,0.15)", border: "none", cursor: "pointer", color: "#fff" }}
                aria-label="Minimize window"
                title="Minimize"
              >
                <Minus size={16} />
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 rounded-md flex items-center justify-center"
              style={{ background: "rgba(255,255,255,0.15)", border: "none", cursor: "pointer", color: "#fff" }}
              aria-label="Close window"
              title="Close"
            >
              <X size={16} />
            </button>
          </div>
        </div>
        <div className="flex-1 min-h-0 overflow-y-auto">{children}</div>
      </div>
    </div>
  );
}
