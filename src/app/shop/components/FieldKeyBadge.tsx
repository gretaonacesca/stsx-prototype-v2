import { C } from "../../colorTokens";

/** Hardware key legend. Light: white on black. Dark: black on white. */
export function FieldKeyBadge({ letter }: { letter: string }) {
  return (
    <span
      aria-hidden
      className="shop-key-badge inline-flex items-center justify-center flex-none"
      style={{
        minWidth: 26,
        height: 26,
        padding: "0 6px",
        fontFamily: "'DM Mono', monospace",
        fontSize: 13,
        fontWeight: 600,
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
      className="flex items-center gap-1.5 min-w-0 w-[7.5rem] flex-none"
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
      <span className="truncate">{children}</span>
    </span>
  );
}
