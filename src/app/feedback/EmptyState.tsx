import type { ReactNode } from "react";
import { C } from "../colorTokens";

export function EmptyState({
  title,
  body,
  actionLabel,
  onAction,
  icon,
}: {
  title: string;
  body: string;
  actionLabel?: string;
  onAction?: () => void;
  icon?: ReactNode;
}) {
  return (
    <div
      className="rounded-xl px-4 py-8 text-center flex flex-col items-center gap-2"
      style={{ background: C.surface, border: `1.5px solid ${C.border}` }}
    >
      {icon && <div className="mb-1">{icon}</div>}
      <p style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 400, fontSize: 16, color: C.text }}>
        {title}
      </p>
      <p style={{ fontFamily: "'Lato', sans-serif", fontSize: 14, fontWeight: 400, color: C.textMuted, maxWidth: 320 }}>
        {body}
      </p>
      {actionLabel && onAction && (
        <button
          type="button"
          onClick={onAction}
          className="mt-2 px-3 py-1.5 rounded-md"
          style={{
            background: C.accent,
            color: "#fff",
            border: "none",
            cursor: "pointer",
            fontFamily: "'DM Mono', monospace",
            fontSize: 13,
            fontWeight: 400,
          }}
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}
