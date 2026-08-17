import { C } from "../../colorTokens";

export function ModeChips<T extends string>({
  options,
  value,
  onChange,
}: {
  options: { id: T; label: string }[];
  value: T;
  onChange: (id: T) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((o) => {
        const on = o.id === value;
        return (
          <button
            key={o.id}
            type="button"
            onClick={() => onChange(o.id)}
            className="px-3 py-2.5 rounded-lg"
            style={{
              background: on ? C.accent : C.surface,
              color: on ? "#fff" : C.text,
              border: `1.5px solid ${on ? C.accent : C.border}`,
              cursor: "pointer",
              fontFamily: "'Outfit', sans-serif",
              fontWeight: 400,
              fontSize: 14,
              minHeight: 44,
            }}
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}

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
      className="w-full h-12 rounded-lg"
      style={{
        background: C.accent,
        color: "#fff",
        border: "none",
        cursor: busy ? "wait" : "pointer",
        fontFamily: "'Outfit', sans-serif",
        fontWeight: 400,
        fontSize: 16,
        opacity: busy ? 0.7 : 1,
      }}
    >
      {busy ? busyLabel : label}
    </button>
  );
}
