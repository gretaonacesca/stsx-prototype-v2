import { WifiOff, X } from "lucide-react";
import { C } from "../colorTokens";

export function StatusBanner({
  message,
  variant = "warning",
  onDismiss,
}: {
  message: string;
  variant?: "warning" | "error" | "info";
  onDismiss?: () => void;
}) {
  const bg = variant === "error" ? C.dangerBg : variant === "info" ? C.surfaceAlt : C.warningBg;
  const color = variant === "error" ? C.danger : C.text;
  const border = variant === "error" ? C.danger : C.warning;

  return (
    <div
      role="status"
      className="flex-none flex items-center gap-2 px-4 py-2"
      style={{
        background: bg,
        borderBottom: `1.5px solid ${border}`,
        color,
      }}
    >
      <WifiOff size={16} className="shrink-0" />
      <p
        className="flex-1 min-w-0"
        style={{ fontFamily: "'Lato', sans-serif", fontSize: 14, fontWeight: 400 }}
      >
        {message}
      </p>
      {onDismiss && (
        <button
          type="button"
          onClick={onDismiss}
          aria-label="Dismiss"
          style={{ background: "none", border: "none", cursor: "pointer", color, lineHeight: 0 }}
        >
          <X size={16} />
        </button>
      )}
    </div>
  );
}
