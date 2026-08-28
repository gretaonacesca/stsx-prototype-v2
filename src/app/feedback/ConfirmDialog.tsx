import { C } from "../colorTokens";

export function ConfirmDialog({
  open,
  title,
  body,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  onConfirm,
  onCancel,
  danger,
}: {
  open: boolean;
  title: string;
  body: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
  danger?: boolean;
}) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[400] flex items-center justify-center p-4"
      style={{ background: "rgba(15,21,32,0.45)" }}
      onClick={onCancel}
    >
      <div
        className="w-full max-w-md rounded-xl p-5 flex flex-col gap-4"
        style={{ background: C.surface, border: `1.5px solid ${C.border}` }}
        onClick={(e) => e.stopPropagation()}
        role="alertdialog"
        aria-labelledby="confirm-title"
        aria-describedby="confirm-body"
      >
        <p id="confirm-title" style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 400, fontSize: 18, color: C.text }}>
          {title}
        </p>
        <p id="confirm-body" style={{ fontFamily: "'Lato', sans-serif", fontSize: 15, fontWeight: 400, color: C.text, lineHeight: 1.5 }}>
          {body}
        </p>
        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="px-3 py-1.5 rounded-md"
            style={{
              background: C.surfaceAlt,
              border: `1.5px solid ${C.border}`,
              cursor: "pointer",
              fontFamily: "'DM Mono', monospace",
              fontSize: 13,
              color: C.text,
            }}
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="px-3 py-1.5 rounded-md"
            style={{
              background: danger ? C.danger : C.accent,
              border: "none",
              cursor: "pointer",
              fontFamily: "'DM Mono', monospace",
              fontSize: 13,
              color: "#fff",
            }}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
