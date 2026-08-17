import { useEffect, useRef } from "react";
import { C } from "../../colorTokens";
import { MOCK_SCAN_ID } from "../mock";
import { FieldLabel } from "./FieldKeyBadge";
import { useShopKeysOptional } from "../keypad/ShopKeyScope";

export function ScanBar({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  const ctx = useShopKeysOptional();
  const ref = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!ctx || !el) return;
    ctx.registerField({ id: "entry", letter: "E", el, setValue: onChange });
    return () => ctx.unregisterField("entry");
  }, [ctx, onChange]);

  const focused = {
    outline: "none",
    border: `3px solid ${C.warning}`,
    boxShadow: `0 0 0 2px ${C.accent}`,
    background: C.surfaceAlt,
  };
  const idle = {
    outline: "none",
    border: `1.5px solid ${C.accent}`,
    boxShadow: "none",
    background: C.surfaceAlt,
  };

  return (
    <div
      className="flex-none sticky top-0 z-10 flex items-end gap-2 px-3 py-2"
      style={{ background: C.surface, borderBottom: `1.5px solid ${C.border}` }}
    >
      <label className="flex-1 flex flex-col gap-1.5 min-w-0">
        <FieldLabel letter="E">Entry</FieldLabel>
        <input
          ref={ref}
          id="shop-field-entry"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Entry / barcode"
          aria-label="Entry"
          style={{
            width: "100%",
            height: 48,
            borderRadius: 8,
            padding: "0 14px",
            fontFamily: "'DM Mono', monospace",
            fontSize: 16,
            fontWeight: 400,
            color: C.text,
            ...idle,
          }}
          onFocus={(e) => Object.assign(e.currentTarget.style, focused)}
          onBlur={(e) => Object.assign(e.currentTarget.style, idle)}
        />
      </label>
      <button
        type="button"
        title="Prototype: simulates yellow scan trigger (keyboard wedge)"
        onClick={() => ctx?.injectScan(MOCK_SCAN_ID)}
        className="flex-none h-12 px-3 rounded-lg"
        style={{
          background: C.warning,
          color: "#111",
          border: "none",
          cursor: "pointer",
          fontFamily: "'DM Mono', monospace",
          fontSize: 12,
        }}
      >
        SCAN
      </button>
    </div>
  );
}
