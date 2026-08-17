import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { C } from "../../colorTokens";
import { FieldKeyBadge } from "../components/FieldKeyBadge";

type Focusable = HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement | HTMLButtonElement;

type FieldReg = {
  id: string;
  letter: string;
  el: Focusable;
  setValue?: (v: string) => void;
};

type ActionReg = {
  key: string;
  label: string;
  run: () => void;
};

type ShopKeyCtx = {
  registerField: (reg: FieldReg) => void;
  unregisterField: (id: string) => void;
  registerAction: (reg: ActionReg) => void;
  unregisterAction: (key: string) => void;
  injectScan: (code: string) => void;
  submit: () => void;
};

const Ctx = createContext<ShopKeyCtx | null>(null);

export function useShopKeys() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useShopKeys must be used inside ShopKeyScope");
  return ctx;
}

export function useShopKeysOptional() {
  return useContext(Ctx);
}

function isTypingTarget(el: EventTarget | null) {
  if (!(el instanceof HTMLElement)) return false;
  const tag = el.tagName;
  return tag === "INPUT" || tag === "SELECT" || tag === "TEXTAREA";
}

function fieldIdOf(el: Element | null, fields: Map<string, FieldReg>) {
  if (!el) return null;
  for (const f of fields.values()) {
    if (f.el === el) return f.id;
  }
  return null;
}

export function ShopKeyScope({
  children,
  onSubmit,
  submitLabel = "Save",
  modeOptions,
  modeValue,
  onModeChange,
}: {
  children: ReactNode;
  onSubmit: () => void;
  submitLabel?: string;
  modeOptions?: { id: string; label: string }[];
  modeValue?: string;
  onModeChange?: (id: string) => void;
}) {
  const fieldsRef = useRef(new Map<string, FieldReg>());
  const orderRef = useRef<string[]>([]);
  const actionsRef = useRef(new Map<string, ActionReg>());
  const submitRef = useRef(onSubmit);
  submitRef.current = onSubmit;
  const modeRef = useRef({ modeOptions, modeValue, onModeChange });
  modeRef.current = { modeOptions, modeValue, onModeChange };
  const [, bump] = useState(0);

  const registerField = useCallback((reg: FieldReg) => {
    const map = fieldsRef.current;
    map.set(reg.id, reg);
    if (!orderRef.current.includes(reg.id)) orderRef.current.push(reg.id);
    orderRef.current = orderRef.current.filter((id) => map.has(id));
  }, []);

  const unregisterField = useCallback((id: string) => {
    fieldsRef.current.delete(id);
    orderRef.current = orderRef.current.filter((x) => x !== id);
  }, []);

  const registerAction = useCallback((reg: ActionReg) => {
    actionsRef.current.set(reg.key, reg);
    bump((n) => n + 1);
  }, []);

  const unregisterAction = useCallback((key: string) => {
    actionsRef.current.delete(key);
    bump((n) => n + 1);
  }, []);

  const visibleFields = useCallback(() => {
    return orderRef.current
      .map((id) => fieldsRef.current.get(id))
      .filter((f): f is FieldReg => !!f && !f.el.disabled && f.el.offsetParent !== null);
  }, []);

  const focusField = useCallback((f: FieldReg) => {
    f.el.focus();
    if ("select" in f.el && typeof f.el.select === "function" && f.el instanceof HTMLInputElement) {
      f.el.select();
    }
  }, []);

  const advanceOrSubmit = useCallback(() => {
    const list = visibleFields();
    if (list.length === 0) {
      submitRef.current();
      return;
    }
    const currentId = fieldIdOf(document.activeElement, fieldsRef.current);
    const idx = currentId ? list.findIndex((f) => f.id === currentId) : -1;
    if (idx === -1) {
      focusField(list[0]);
      return;
    }
    const current = list[idx];
    if (current.el instanceof HTMLButtonElement) {
      current.el.click();
      return;
    }
    if (idx >= list.length - 1) {
      submitRef.current();
      return;
    }
    focusField(list[idx + 1]);
  }, [focusField, visibleFields]);

  const injectScan = useCallback(
    (code: string) => {
      const list = visibleFields();
      const currentId = fieldIdOf(document.activeElement, fieldsRef.current);
      const target =
        (currentId ? list.find((f) => f.id === currentId) : null) ??
        list.find((f) => f.id === "entry") ??
        list[0];
      if (!target) return;
      if (target.setValue) target.setValue(code);
      else if (target.el instanceof HTMLInputElement) {
        target.el.value = code;
        target.el.dispatchEvent(new Event("input", { bubbles: true }));
      }
      focusField(target);
      queueMicrotask(() => advanceOrSubmit());
    },
    [advanceOrSubmit, focusField, visibleFields]
  );

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.altKey || e.metaKey) return;

      if (e.key === "F1" || e.key === "F2" || e.key === "F3" || e.key === "F4") {
        const action = actionsRef.current.get(e.key);
        if (action) {
          e.preventDefault();
          action.run();
        }
        return;
      }

      if (e.key === "Enter") {
        if (isTypingTarget(e.target) || fieldIdOf(e.target as Element, fieldsRef.current)) {
          e.preventDefault();
          advanceOrSubmit();
        }
        return;
      }

      const { modeOptions: opts, onModeChange: setMode } = modeRef.current;

      if (opts && setMode && /^[1-9]$/.test(e.key) && !isTypingTarget(e.target)) {
        const i = Number(e.key) - 1;
        if (opts[i]) {
          e.preventDefault();
          setMode(opts[i].id);
        }
        return;
      }

      if (e.key.length !== 1 || e.shiftKey) return;
      const letter = e.key.toUpperCase();
      if (!/[A-Z]/.test(letter)) return;

      const list = visibleFields();
      const match = list.find((f) => f.letter.toUpperCase() === letter);
      if (!match) return;

      const currentId = fieldIdOf(document.activeElement, fieldsRef.current);
      if (currentId === match.id && isTypingTarget(e.target)) return;

      e.preventDefault();
      focusField(match);
    };

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [advanceOrSubmit, focusField, visibleFields]);

  useEffect(() => {
    registerAction({ key: "F2", label: submitLabel, run: () => submitRef.current() });
    return () => unregisterAction("F2");
  }, [registerAction, unregisterAction, submitLabel]);

  useEffect(() => {
    const opts = modeOptions;
    const setMode = onModeChange;
    if (!opts?.length || !setMode) return;
    registerAction({
      key: "F3",
      label: "Cycle mode",
      run: () => {
        const i = Math.max(0, opts.findIndex((o) => o.id === modeValue));
        setMode(opts[(i + 1) % opts.length].id);
      },
    });
    return () => unregisterAction("F3");
  }, [modeOptions, modeValue, onModeChange, registerAction, unregisterAction]);

  const ctx = useMemo<ShopKeyCtx>(
    () => ({
      registerField,
      unregisterField,
      registerAction,
      unregisterAction,
      injectScan,
      submit: () => submitRef.current(),
    }),
    [injectScan, registerAction, registerField, unregisterAction, unregisterField]
  );

  return (
    <Ctx.Provider value={ctx}>
      <div className="flex-1 min-h-0 flex flex-col overflow-hidden">
        {modeOptions && modeValue && onModeChange && (
          <ModeKeyBar options={modeOptions} value={modeValue} onChange={onModeChange} />
        )}
        <div className="flex-1 min-h-0 overflow-y-auto">{children}</div>
      </div>
    </Ctx.Provider>
  );
}

function ModeKeyBar({
  options,
  value,
  onChange,
}: {
  options: { id: string; label: string }[];
  value: string;
  onChange: (id: string) => void;
}) {
  return (
    <div
      className="flex-none px-2 py-1 flex flex-wrap items-center gap-1"
      style={{ background: C.surface, borderBottom: `1.5px solid ${C.border}` }}
    >
      {options.map((o, i) => {
        const on = o.id === value;
        return (
          <button
            key={o.id}
            type="button"
            onClick={() => onChange(o.id)}
            className="flex items-center gap-1 px-1.5 rounded flex-none"
            style={{
              background: on ? C.accent : C.surfaceAlt,
              color: on ? "#fff" : C.text,
              border: `1.5px solid ${on ? C.accent : C.border}`,
              cursor: "pointer",
              fontFamily: "'Outfit', sans-serif",
              fontSize: 12,
              height: 32,
            }}
          >
            <FieldKeyBadge letter={String(i + 1)} />
            {o.label}
          </button>
        );
      })}
    </div>
  );
}
