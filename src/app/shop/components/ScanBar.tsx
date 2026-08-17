import { useEffect, useRef } from "react";
import { C, JEWEL } from "../../colorTokens";
import { MOCK_SCAN_ID } from "../mock";
import { FieldLabel } from "./FieldKeyBadge";
import { useShopKeysOptional } from "../keypad/ShopKeyScope";

const LIME = JEWEL.lime.base;

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
    border: `2px solid ${LIME}`,
    boxShadow: `0 0 0 1px ${C.accent}`,
    background: `${LIME}44`,
  };
  const idle = {
    outline: "none",
    border: `1.5px solid ${LIME}`,
    boxShadow: "none",
    background: `${LIME}33`,
  };

  return (
    <div
      className="flex-none sticky top-0 z-10 flex items-center gap-2 px-3 py-1.5"
      style={{ background: C.surface, borderBottom: `1.5px solid ${C.border}` }}
    >
      <label className="flex-1 flex items-center gap-2 min-w-0">
        <FieldLabel letter="E">Entry</FieldLabel>
        <input
          ref={ref}
          id="shop-field-entry"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Entry / barcode"
          aria-label="Entry"
          style={{
            flex: 1,
            minWidth: 0,
            height: 32,
            borderRadius: 4,
            padding: "0 8px",
            fontFamily: "'DM Mono', monospace",
            fontSize: 14,
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
        className="flex-none px-3 rounded"
        style={{
          height: 32,
          background: LIME,
          color: "#111",
          border: "none",
          cursor: "pointer",
          fontFamily: "'DM Mono', monospace",
          fontSize: 12,
          fontWeight: 600,
        }}
      >
        SCAN
      </button>
    </div>
  );
}
