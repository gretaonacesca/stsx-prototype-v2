import { useEffect, useRef, type CSSProperties } from "react";
import { C } from "../../colorTokens";
import { FieldLabel } from "./FieldKeyBadge";
import { useShopKeysOptional } from "../keypad/ShopKeyScope";

const focusRing = (focused: boolean): CSSProperties => ({
  outline: "none",
  border: focused ? `3px solid ${C.warning}` : `1.5px solid ${C.border}`,
  boxShadow: focused ? `0 0 0 2px ${C.accent}` : "none",
  background: focused ? C.surfaceAlt : C.surface,
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
    <label className="flex flex-col gap-1.5">
      <FieldLabel letter={letter}>{label}</FieldLabel>
      <input
        ref={ref}
        id={`shop-field-${id}`}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        style={{
          height: 48,
          borderRadius: 8,
          padding: "0 14px",
          fontFamily: "'Lato', sans-serif",
          fontSize: 16,
          fontWeight: 400,
          color: C.text,
          ...focusRing(false),
        }}
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
    <label className="flex flex-col gap-1.5">
      <FieldLabel letter={letter}>{label}</FieldLabel>
      <select
        ref={ref}
        id={`shop-field-${id}`}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={{
          height: 48,
          borderRadius: 8,
          padding: "0 14px",
          fontFamily: "'Lato', sans-serif",
          fontSize: 16,
          fontWeight: 400,
          color: C.text,
          ...focusRing(false),
        }}
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
    <div className="flex flex-col gap-1">
      <span
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
