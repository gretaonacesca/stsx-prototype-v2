import { RefreshCw } from "lucide-react";
import { C } from "../colorTokens";

export function RetryBlock({
  message,
  onRetry,
}: {
  message: string;
  onRetry: () => void;
}) {
  return (
    <div
      className="flex flex-col items-center justify-center gap-3 p-6 text-center h-full min-h-[120px]"
      style={{ background: C.surfaceAlt, borderRadius: 8 }}
    >
      <p style={{ fontFamily: "'Lato', sans-serif", fontSize: 14, fontWeight: 400, color: C.text, maxWidth: 280 }}>
        {message}
      </p>
      <button
        type="button"
        onClick={onRetry}
        className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md"
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
        <RefreshCw size={14} />
        Retry
      </button>
    </div>
  );
}
