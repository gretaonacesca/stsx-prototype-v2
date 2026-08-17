import { C } from "../../colorTokens";

export function EmptyState({ title, body }: { title: string; body: string }) {
  return (
    <div
      className="rounded-xl px-4 py-8 text-center"
      style={{ background: C.surface, border: `1.5px solid ${C.border}` }}
    >
      <p style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 400, fontSize: 16, color: C.text }}>
        {title}
      </p>
      <p
        className="mt-1"
        style={{ fontFamily: "'Lato', sans-serif", fontSize: 14, fontWeight: 400, color: C.textMuted }}
      >
        {body}
      </p>
    </div>
  );
}
