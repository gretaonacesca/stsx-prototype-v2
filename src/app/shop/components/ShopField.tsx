import { useEffect, useRef, type CSSProperties, type ReactNode } from "react";
import { C } from "../../colorTokens";
import { FieldLabel } from "./FieldKeyBadge";
import { useShopKeysOptional } from "../keypad/ShopKeyScope";

const FIELD_H = 32;
const FIELD_W = "50vw";

const controlBase = (): CSSProperties => ({
  height: FIELD_H,
  width: FIELD_W,
  maxWidth: FIELD_W,
  flex: "0 0 auto",
  borderRadius: 4,
  padding: "0 8px",
  fontFamily: "'Lato', sans-serif",
  fontSize: 14,
  fontWeight: 400,
  color: C.text,
  minWidth: 0,
});

const focusRing = (focused: boolean): CSSProperties => ({
  outline: "none",
  border: focused ? `2px solid ${C.accent}` : `1.5px solid ${C.border}`,
  boxShadow: focused ? `0 0 0 1px ${C.accent}` : "none",
  background: focused ? C.surfaceAlt : C.surface,
  color: C.text,
});

export function ShopInput({
  label,
  letter,
  value,
  onChange,
  placeholder,
  fieldId,
}: {
  label: string;
  letter: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  fieldId?: string;
}) {
  const id = fieldId ?? letter.toLowerCase();
  const ctx = useShopKeysOptional();
  const ref = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!ctx || !el) return;
    ctx.registerField({ id, letter, el, setValue: onChange });
    return () => ctx.unregisterField(id);
  }, [ctx, id, letter, onChange]);

  return (
    <label className="flex items-start gap-2">
      <FieldLabel letter={letter}>{label}</FieldLabel>
      <input
        ref={ref}
        id={`shop-field-${id}`}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        style={{ ...controlBase(), ...focusRing(false) }}
        onFocus={(e) => Object.assign(e.currentTarget.style, focusRing(true))}
        onBlur={(e) => Object.assign(e.currentTarget.style, focusRing(false))}
      />
    </label>
  );
}

export function ShopSelect({
  label,
  letter,
  value,
  onChange,
  options,
  fieldId,
}: {
  label: string;
  letter: string;
  value: string;
  onChange: (v: string) => void;
  options: string[];
  fieldId?: string;
}) {
  const id = fieldId ?? letter.toLowerCase();
  const ctx = useShopKeysOptional();
  const ref = useRef<HTMLSelectElement | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!ctx || !el) return;
    ctx.registerField({ id, letter, el });
    return () => ctx.unregisterField(id);
  }, [ctx, id, letter]);

  return (
    <label className="flex items-start gap-2">
      <FieldLabel letter={letter}>{label}</FieldLabel>
      <select
        ref={ref}
        id={`shop-field-${id}`}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={{ ...controlBase(), ...focusRing(false) }}
        onFocus={(e) => Object.assign(e.currentTarget.style, focusRing(true))}
        onBlur={(e) => Object.assign(e.currentTarget.style, focusRing(false))}
      >
        {options.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
    </label>
  );
}

export function ShopReadonly({ label, value }: { label: string; value: string }) {
  return (
    <ShopValueRow label={label}>
      <span
        style={{
          fontFamily: "'Lato', sans-serif",
          fontSize: 14,
          fontWeight: 400,
          color: C.text,
        }}
      >
        {value === "" ? "—" : value}
      </span>
    </ShopValueRow>
  );
}

export function ShopValueRow({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div
      className="flex items-start gap-2 min-h-8"
      style={{ borderBottom: `1px solid ${C.border}` }}
    >
      <span
        className="flex-1 min-w-0 leading-tight"
        style={{
          fontFamily: "'DM Mono', monospace",
          fontSize: 12,
          fontWeight: 400,
          letterSpacing: "0.04em",
          textTransform: "uppercase",
          color: C.text,
        }}
      >
        {label}
      </span>
      <div className="flex-1 min-w-0">{children}</div>
    </div>
  );
}
