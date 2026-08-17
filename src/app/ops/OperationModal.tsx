import type { ReactNode } from "react";
import { X } from "lucide-react";
import { C, JEWEL } from "../colorTokens";
import { findOperation, type OperationId } from "../nav/catalog";

export function OperationModal({
  opId,
  onClose,
  children,
}: {
  opId: OperationId;
  onClose: () => void;
  children: ReactNode;
}) {
  const found = findOperation(opId);
  const title = found?.leaf.label ?? opId;
  const danger = opId.startsWith("records-");

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
          border: `1.5px solid ${danger ? JEWEL.danger.base : JEWEL.indigo.base}`,
          boxShadow: `0 28px 64px ${danger ? JEWEL.danger.base : JEWEL.indigo.base}44`,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className="flex-none flex items-center justify-between px-4 py-3"
          style={{
            background: danger ? JEWEL.danger.base : JEWEL.indigo.base,
            color: "#fff",
          }}
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
        <div className="flex-1 min-h-0 overflow-y-auto">{children}</div>
      </div>
    </div>
  );
}
