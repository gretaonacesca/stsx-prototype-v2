import { C } from "../colorTokens";

export function LoadingOverlay({ label = "Loading…" }: { label?: string }) {
  return (
    <div
      className="absolute inset-0 z-10 flex items-center justify-center"
      style={{ background: "rgba(255,255,255,0.72)" }}
      aria-busy
      aria-live="polite"
    >
      <p
        style={{
          fontFamily: "'DM Mono', monospace",
          fontSize: 13,
          fontWeight: 400,
          color: C.text,
          letterSpacing: "0.04em",
        }}
      >
        {label}
      </p>
    </div>
  );
}
