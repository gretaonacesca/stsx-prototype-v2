import { Camera } from "lucide-react";
import { C } from "../../colorTokens";
import { MOCK_SCAN_ID } from "../mock";

export function ScanBar({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div
      className="flex-none flex items-center gap-2 px-3 py-2"
      style={{ background: C.surface, borderBottom: `1.5px solid ${C.border}` }}
    >
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Entry / barcode"
        aria-label="Entry"
        style={{
          flex: 1,
          height: 48,
          borderRadius: 8,
          border: `1.5px solid ${C.accent}`,
          background: C.surfaceAlt,
          padding: "0 14px",
          fontFamily: "'DM Mono', monospace",
          fontSize: 16,
          fontWeight: 400,
          color: C.text,
          outline: "none",
        }}
      />
      <button
        type="button"
        title="Scan (prototype)"
        onClick={() => onChange(MOCK_SCAN_ID)}
        className="flex-none w-12 h-12 rounded-lg flex items-center justify-center"
        style={{
          background: C.accent,
          color: "#fff",
          border: "none",
          cursor: "pointer",
        }}
      >
        <Camera size={22} strokeWidth={2.2} />
      </button>
    </div>
  );
}
