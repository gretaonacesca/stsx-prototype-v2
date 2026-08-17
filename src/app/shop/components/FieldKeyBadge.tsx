import { C } from "../../colorTokens";

/** Hardware key legend — black square, white letter. Unique per visible screen. */
export function FieldKeyBadge({ letter }: { letter: string }) {
  return (
    <span
      aria-hidden
      className="inline-flex items-center justify-center flex-none"
      style={{
        minWidth: 22,
        height: 22,
        padding: "0 5px",
        background: "#111111",
        color: "#FFFFFF",
        fontFamily: "'DM Mono', monospace",
        fontSize: 12,
        fontWeight: 400,
        letterSpacing: 0,
        borderRadius: 3,
        lineHeight: 1,
      }}
    >
      {letter}
    </span>
  );
}

export function FieldLabel({ letter, children }: { letter: string; children: string }) {
  return (
    <span
      className="flex items-center gap-2"
      style={{
        fontFamily: "'DM Mono', monospace",
        fontSize: 12,
        fontWeight: 400,
        letterSpacing: "0.04em",
        textTransform: "uppercase",
        color: C.text,
      }}
    >
      <FieldKeyBadge letter={letter} />
      {children}
    </span>
  );
}
