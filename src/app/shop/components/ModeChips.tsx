import { C } from "../../colorTokens";
import { FieldKeyBadge } from "./FieldKeyBadge";

export function SubmitButton({
  label,
  busy,
  busyLabel = "Saving…",
  onClick,
  disabled,
}: {
  label: string;
  busy?: boolean;
  busyLabel?: string;
  onClick: () => void;
  disabled?: boolean;
}) {
  const off = disabled || busy;
  return (
    <button
      type="button"
      disabled={off}
      onClick={onClick}
      className="w-full h-8 rounded flex items-center justify-center gap-2"
      style={{
        background: C.accent,
        color: "#fff",
        border: "none",
        cursor: off ? "not-allowed" : "pointer",
        fontFamily: "'Outfit', sans-serif",
        fontWeight: 400,
        fontSize: 14,
        opacity: off ? 0.5 : 1,
      }}
    >
      <FieldKeyBadge letter="F2" />
      {busy ? busyLabel : label}
    </button>
  );
}
