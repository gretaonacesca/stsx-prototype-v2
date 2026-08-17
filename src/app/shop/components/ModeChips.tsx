import { C } from "../../colorTokens";
import { FieldKeyBadge } from "./FieldKeyBadge";

export function SubmitButton({
  label,
  busy,
  busyLabel = "Saving…",
  onClick,
}: {
  label: string;
  busy?: boolean;
  busyLabel?: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      disabled={busy}
      onClick={onClick}
      className="w-full h-8 rounded flex items-center justify-center gap-2"
      style={{
        background: C.accent,
        color: "#fff",
        border: "none",
        cursor: busy ? "wait" : "pointer",
        fontFamily: "'Outfit', sans-serif",
        fontWeight: 400,
        fontSize: 14,
        opacity: busy ? 0.7 : 1,
      }}
    >
      <FieldKeyBadge letter="F2" />
      {busy ? busyLabel : label}
    </button>
  );
}
