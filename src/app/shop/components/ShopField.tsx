import type { CSSProperties } from "react";
import { C } from "../../colorTokens";

const labelStyle: CSSProperties = {
  fontFamily: "'DM Mono', monospace",
  fontSize: 12,
  fontWeight: 400,
  letterSpacing: "0.04em",
  textTransform: "uppercase",
  color: C.text,
};

export function ShopInput({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span style={labelStyle}>{label}</span>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        style={{
          height: 48,
          borderRadius: 8,
          border: `1.5px solid ${C.border}`,
          background: C.surface,
          padding: "0 14px",
          fontFamily: "'Lato', sans-serif",
          fontSize: 16,
          fontWeight: 400,
          color: C.text,
          outline: "none",
        }}
      />
    </label>
  );
}

export function ShopReadonly({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-1">
      <span style={labelStyle}>{label}</span>
      <span
        style={{
          fontFamily: "'Lato', sans-serif",
          fontSize: 16,
          fontWeight: 400,
          color: C.text,
          minHeight: 24,
        }}
      >
        {value === "" ? "—" : value}
      </span>
    </div>
  );
}
