import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { Check, Upload, ChevronDown } from "lucide-react";
import { EMPLOYEES, EXISTING_JOBS } from "./data/mock";

/** Theme CSS variables — stays in sync with light/dark via theme.css */
const T = {
  bg: "var(--background)",
  surface: "var(--card)",
  surfaceAlt: "var(--secondary)",
  border: "var(--border)",
  text: "var(--foreground)",
  textMuted: "var(--muted-foreground)",
  primary: "var(--primary)",
  primaryFg: "var(--primary-foreground)",
  danger: "var(--destructive)",
  dangerBg: "color-mix(in srgb, var(--destructive) 12%, var(--card))",
};

const labelStyle: CSSProperties = {
  fontFamily: "'Lato', sans-serif", fontWeight: 400,
  fontSize: 16,
  color: T.text,
  minWidth: 130,
  flexShrink: 0,
};

const inputStyle: CSSProperties = {
  height: 34,
  flex: 1,
  minWidth: 0,
  borderRadius: 6,
  border: `1.5px solid ${T.border}`,
  background: T.surface,
  padding: "0 10px",
  fontFamily: "'Lato', sans-serif", fontWeight: 400,
  fontSize: 16,
  color: T.text,
  outline: "none",
};

const hintStyle: CSSProperties = {
  fontFamily: "'Lato', sans-serif",
  fontSize: 14,
  color: T.textMuted,
  flexShrink: 0,
};

const btnPrimary: CSSProperties = {
  height: 34,
  padding: "0 14px",
  borderRadius: 6,
  border: "none",
  background: T.primary,
  color: T.primaryFg,
  fontFamily: "'Lato', sans-serif",
  fontSize: 16,
  cursor: "pointer",
};

const btnDark: CSSProperties = {
  height: 34,
  padding: "0 14px",
  borderRadius: 6,
  border: "none",
  background: T.text,
  color: T.surface,
  fontFamily: "'Lato', sans-serif",
  fontSize: 16,
  cursor: "pointer",
};

export function TokenCheckbox({
  checked,
  defaultChecked = false,
  onChange,
  disabled = false,
}: {
  checked?: boolean;
  defaultChecked?: boolean;
  onChange?: (next: boolean) => void;
  disabled?: boolean;
}) {
  const [internal, setInternal] = useState(defaultChecked);
  const isOn = checked !== undefined ? checked : internal;
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={isOn}
      disabled={disabled}
      onClick={() => {
        if (disabled) return;
        const next = !isOn;
        if (checked === undefined) setInternal(next);
        onChange?.(next);
      }}
      className="shrink-0 flex items-center justify-center"
      style={{
        width: 16,
        height: 16,
        borderRadius: 4,
        border: `1.5px solid ${isOn ? T.primary : T.border}`,
        background: isOn ? T.primary : T.surface,
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.5 : 1,
        padding: 0,
        lineHeight: 0,
      }}
    >
      {isOn && <Check size={10} strokeWidth={2.5} color={T.primaryFg} />}
    </button>
  );
}

function TokenRadio({
  checked,
  onChange,
  name,
}: {
  checked: boolean;
  onChange: () => void;
  name: string;
}) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={checked}
      name={name}
      onClick={onChange}
      className="shrink-0 flex items-center justify-center"
      style={{
        width: 16,
        height: 16,
        borderRadius: 99,
        border: `1.5px solid ${checked ? T.primary : T.border}`,
        background: T.surface,
        cursor: "pointer",
        padding: 0,
      }}
    >
      {checked && (
        <span style={{ width: 8, height: 8, borderRadius: 99, background: T.primary }} />
      )}
    </button>
  );
}

function FormRow({
  label,
  required,
  hint,
  trailing,
  children,
}: {
  label: string;
  required?: boolean;
  hint?: string;
  trailing?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="flex items-center gap-3">
      <span style={labelStyle}>
        {label}
        {required && " *"}
      </span>
      {children}
      {hint && <span style={hintStyle}>{hint}</span>}
      {trailing}
    </div>
  );
}

function TextInput({
  defaultValue = "",
  placeholder,
  value,
  onChange,
}: {
  defaultValue?: string;
  placeholder?: string;
  value?: string;
  onChange?: (v: string) => void;
}) {
  return (
    <input
      style={inputStyle}
      placeholder={placeholder}
      {...(onChange
        ? { value: value ?? "", onChange: (e) => onChange(e.target.value) }
        : { defaultValue })}
    />
  );
}

function SelectInput({
  options,
  defaultValue,
  value,
  onChange,
}: {
  options: string[];
  defaultValue?: string;
  value?: string;
  onChange?: (v: string) => void;
}) {
  return (
    <div className="relative flex-1 min-w-0">
      <select
        {...(onChange
          ? { value: value ?? options[0], onChange: (e) => onChange(e.target.value) }
          : { defaultValue: defaultValue ?? options[0] })}
        style={{ ...inputStyle, width: "100%", appearance: "none", paddingRight: 28, cursor: "pointer" }}
      >
        {options.map((o) => (
          <option key={o || "__empty"} value={o}>{o || " "}</option>
        ))}
      </select>
      <ChevronDown size={14} color={T.textMuted} className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
    </div>
  );
}

function FileUploadField({ acceptLabel }: { acceptLabel: string }) {
  return (
    <div
      className="flex flex-col items-center justify-center gap-2 py-6 px-4 rounded-md w-full"
      style={{ border: `2px dashed ${T.border}`, background: T.surfaceAlt }}
    >
      <Upload size={20} color={T.textMuted} />
      <span style={{ fontFamily: "'Lato', sans-serif", fontSize: 16, color: T.textMuted }}>
        Drop file or browse · {acceptLabel}
      </span>
      <button type="button" style={btnPrimary}>Choose File</button>
    </div>
  );
}

function NestedTabs({
  tabs,
  active,
  onChange,
}: {
  tabs: { id: string; label: string }[];
  active: string;
  onChange: (id: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-1" style={{ borderBottom: `1.5px solid ${T.border}` }}>
      {tabs.map((t) => {
        const on = t.id === active;
        return (
          <button
            key={t.id}
            type="button"
            onClick={() => onChange(t.id)}
            className="px-3 py-2"
            style={{
              fontFamily: "'DM Mono', monospace",
              fontSize: 13,
              letterSpacing: "0.04em",
              textTransform: "uppercase",
              cursor: "pointer",
              border: "none",
              background: on ? T.text : T.surfaceAlt,
              color: on ? T.surface : T.textMuted,
              borderRadius: "6px 6px 0 0",
            }}
          >
            {t.label}
          </button>
        );
      })}
    </div>
  );
}

/** Primary action only — modal chrome already has Close. Shows a fading success cue. */
export function FormActions({
  primary,
}: {
  primary: { label: string; onClick?: () => void; successMessage?: string };
}) {
  const [toastOn, setToastOn] = useState(false);
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => {
    if (hideTimer.current) clearTimeout(hideTimer.current);
  }, []);

  const flash = () => {
    primary.onClick?.();
    setToastOn(true);
    if (hideTimer.current) clearTimeout(hideTimer.current);
    hideTimer.current = setTimeout(() => setToastOn(false), 1800);
  };

  return (
    <div className="relative flex flex-wrap justify-end gap-2 pt-3 mt-auto" style={{ borderTop: `1.5px solid ${T.border}` }}>
      <div
        role="status"
        aria-live="polite"
        className="absolute left-0 right-0 bottom-full mb-2 flex justify-center pointer-events-none"
        style={{
          opacity: toastOn ? 1 : 0,
          transform: toastOn ? "translateY(0)" : "translateY(4px)",
          transition: "opacity 0.35s ease, transform 0.35s ease",
        }}
      >
        <span
          className="px-3 py-1.5 rounded-md"
          style={{
            background: T.primary,
            color: T.primaryFg,
            fontFamily: "'Lato', sans-serif",
            fontSize: 14,
            fontWeight: 400,
            boxShadow: "0 6px 18px color-mix(in srgb, var(--foreground) 18%, transparent)",
          }}
        >
          {primary.successMessage ?? "Successful save"}
        </span>
      </div>
      <button type="button" style={btnPrimary} onClick={flash}>
        {primary.label}
      </button>
    </div>
  );
}

const JOB_OPTIONS = [
  "092356", "1234A", "1234B", "2247", "2310", "2401", "2418", "2502", "2511", "2520", "2533", "2540",
];

type ImportKind = "kiss" | "tekla" | "eje" | "sds" | "excel";

const IMPORT_ACCEPT: Record<ImportKind, string> = {
  kiss: ".kiss, .dat, .txt",
  tekla: ".xsr, .tekla",
  eje: ".csv, .txt, .eje",
  sds: ".xml, .sds",
  excel: ".xlsx, .xls",
};

/** Shared import filter form — KISS / Tekla / SDS / Excel / EJE variants */
export function ImportFilterForm({
  kind,
}: {
  kind: ImportKind;
}) {
  const accept = IMPORT_ACCEPT[kind];
  const [rounding, setRounding] = useState<"none" | "typical" | "up">("none");
  const isEje = kind === "eje";
  const showLot = !isEje;
  const showExtra = !isEje;

  return (
    <div className="flex flex-col gap-3 h-full min-h-0 p-4 overflow-y-auto">
      <div className="flex flex-col gap-2.5 max-w-2xl">
        <FormRow label="Job #" required>
          <SelectInput options={JOB_OPTIONS} defaultValue="092356" />
        </FormRow>
        <FormRow label="Sequence #" hint='Use {} for empty sequence'>
          <TextInput />
        </FormRow>
        {showLot && (
          <FormRow label="Lot #" hint='Use {} for empty lot'>
            <TextInput />
          </FormRow>
        )}
        <FormRow label="Sheet #">
          <TextInput />
        </FormRow>
        <FormRow label="Piecemark">
          <TextInput />
        </FormRow>
        {showExtra && (
          <>
            <FormRow label="Category #">
              <TextInput />
            </FormRow>
            <FormRow label="Work Package #">
              <TextInput />
            </FormRow>
          </>
        )}

        {kind === "kiss" && (
          <label className="flex items-center gap-[7px] mt-1" style={{  fontFamily: "'Lato', sans-serif", fontWeight: 400, fontSize: 16, color: T.text, cursor: "pointer" }}>
            <TokenCheckbox />
            Use KISS File Instead of PowerFab
          </label>
        )}

        {isEje && (
          <div
            className="mt-2 p-3 rounded-md flex flex-col gap-2"
            style={{ background: T.dangerBg, border: `1.5px solid ${T.danger}` }}
          >
            <span style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 400, fontSize: 16, color: T.danger }}>
              Import Options
            </span>
            <span style={{ fontFamily: "'Lato', sans-serif", fontWeight: 400, fontSize: 15, color: T.text }}>
              Item Wt Rounding
            </span>
            {([
              ["none", "No Rounding"],
              ["typical", "Typical Rounding"],
              ["up", "Always Round Up"],
            ] as const).map(([id, label]) => (
              <label key={id} className="flex items-center gap-[7px]" style={{  fontFamily: "'Lato', sans-serif", fontWeight: 400, fontSize: 16, color: T.text, cursor: "pointer" }}>
                <TokenRadio name="rounding" checked={rounding === id} onChange={() => setRounding(id)} />
                {label}
              </label>
            ))}
          </div>
        )}

        <p style={{ fontFamily: "'Lato', sans-serif", fontSize: 14, color: T.textMuted, marginTop: 4 }}>
          * Multiple filter items may be separated by commas. i.e. 1,2,3
        </p>

        <FileUploadField acceptLabel={accept} />
      </div>

      <FormActions primary={{ label: "Import", successMessage: "Successful save" }} />
    </div>
  );
}

const SAMPLE_CUSTOMERS = [
  { id: "44IRON", name: "44 Iron" },
  { id: "BCTEST", name: "Barcode Testing" },
  { id: "P2PROG", name: "P2 Programs" },
  { id: "TESTLGTH", name: "Test Length Corp" },
  { id: "RIVRSD", name: "Riverside Development" },
  { id: "MIDTWN", name: "Midtown Parking LLC" },
  { id: "HARBR", name: "Harbor Crane Co" },
  { id: "NPLANT", name: "North Plant Ops" },
  { id: "WFIELD", name: "Westfield Arena" },
  { id: "APEX", name: "Apex Steel Supply" },
];

const SAMPLE_CARRIERS = [
  { id: "TRK-04", name: "Brooks Freight" },
  { id: "TRK-18", name: "Ortiz Hauling" },
  { id: "TRK-07", name: "Patel Logistics" },
  { id: "TRK-11", name: "Chen Transport" },
  { id: "TRK-22", name: "Nguyen Heavy Haul" },
  { id: "EXT-903", name: "Apex Inbound" },
  { id: "EXT-441", name: "Nucor Mill Haul" },
];

const SAMPLE_STATUS = [
  { process: "100", division: "SHOP", code: "RECV", desc: "Receive / ASN" },
  { process: "200", division: "SHOP", code: "ANGLELINE", desc: "TX - AngleLine" },
  { process: "210", division: "SHOP", code: "BANDSAW", desc: "Bandsaw" },
  { process: "220", division: "SHOP", code: "CUT", desc: "Cut / nest" },
  { process: "300", division: "SHOP", code: "FIT", desc: "Fit-up" },
  { process: "310", division: "SHOP", code: "WELD", desc: "Weld" },
  { process: "400", division: "SHOP", code: "QC", desc: "Quality inspect" },
  { process: "500", division: "SHOP", code: "PAINT", desc: "Paint / finish" },
  { process: "550", division: "SHOP", code: "HOLD", desc: "On hold" },
  { process: "600", division: "SHOP", code: "SHIP", desc: "Ship / load" },
  { process: "650", division: "FIELD", code: "ERECT", desc: "Erect" },
  { process: "700", division: "SHOP", code: "COMPLETED", desc: "Completed" },
];

const SAMPLE_ROUTES = [
  "1- TFS", "10", "2", "2- PARTS-NO FAB-BLACK", "3- PARTS-NO FAB-PRIME",
  "5- PARTS-FAB-PRIME", "FABRICATION", "PAINTED", "PNT", "R0001", "STD", "UNPAINTED",
  "GALV", "PRIME-ONLY", "FIELD-BOLT",
];

const STATUS_FLAGS = [
  "Worker Employee # Required",
  "Percentage Scan",
  "Allow Multiple Scans",
  "MTR PDF Required at this Status Point",
  "Allow Start if Prior Code Not Complete",
  "Push Transaction to Third Party",
  "Prompt for 100% Complete",
  "Status Code Active",
];

function ListPane({
  title,
  addLabel,
  headers,
  rows,
  selectedKey,
  onSelect,
  showInactive,
  onToggleInactive,
  inactiveLabel = "Show InActive",
}: {
  title?: string;
  addLabel: string;
  headers: string[];
  rows: { key: string; cells: (string | ReactNode)[] }[];
  selectedKey: string | null;
  onSelect: (key: string) => void;
  showInactive?: boolean;
  onToggleInactive?: (v: boolean) => void;
  inactiveLabel?: string;
}) {
  return (
    <div className="flex flex-col h-full min-h-0 overflow-hidden">
      <div className="flex-none flex items-center gap-3 px-3 py-2" style={{ borderBottom: `1.5px solid ${T.border}`, background: T.surfaceAlt }}>
        <button type="button" style={{ ...btnDark, height: 30, fontSize: 15 }}>{addLabel}</button>
        {onToggleInactive && (
          <label className="flex items-center gap-[7px]" style={{  fontFamily: "'Lato', sans-serif", fontWeight: 400, fontSize: 15, color: T.text, cursor: "pointer" }}>
            <TokenCheckbox checked={!!showInactive} onChange={onToggleInactive} />
            {inactiveLabel}
          </label>
        )}
        {title && (
          <span className="ml-auto" style={{ fontFamily: "'DM Mono', monospace", fontSize: 11, color: T.textMuted, textTransform: "uppercase" }}>{title}</span>
        )}
      </div>
      <div className="flex-none flex px-3 py-1.5" style={{ borderBottom: `1.5px solid ${T.border}`, background: T.surfaceAlt }}>
        {headers.map((h) => (
          <div key={h} className="flex-1" style={{ fontFamily: "'DM Mono', monospace", fontSize: 11, color: T.textMuted, textTransform: "uppercase" }}>{h}</div>
        ))}
      </div>
      <div className="flex-1 overflow-y-auto">
        {rows.length === 0 ? (
          <p className="px-3 py-4" style={{ fontFamily: "'Lato', sans-serif", fontSize: 15, color: T.textMuted }}>No results found.</p>
        ) : (
          rows.map((r) => {
            const on = selectedKey === r.key;
            return (
              <div
                key={r.key}
                role="button"
                onClick={() => onSelect(r.key)}
                className="flex px-3 py-2 cursor-pointer"
                style={{
                  borderBottom: `1.5px solid ${T.border}`,
                  background: on ? `color-mix(in srgb, ${T.primary} 14%, transparent)` : "transparent",
                }}
              >
                {r.cells.map((c, i) => (
                  <div key={i} className="flex-1 truncate" style={{ fontFamily: i === 0 ? "'DM Mono', monospace" : "'Lato', sans-serif", fontSize: 15, color: i === 0 ? T.primary : T.text }}>{c}</div>
                ))}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

export function CustomerEditorPanel() {
  const [selected, setSelected] = useState(SAMPLE_CUSTOMERS[0].id);
  const [tab, setTab] = useState("customer");
  const cust = SAMPLE_CUSTOMERS.find((c) => c.id === selected) ?? SAMPLE_CUSTOMERS[0];
  return (
    <div className="grid h-full min-h-0 grid-cols-1 md:grid-cols-[minmax(220px,0.9fr)_1.2fr]">
      <div className="min-h-0 overflow-hidden" style={{ borderRight: `1.5px solid ${T.border}` }}>
        <ListPane
          addLabel="Add New Customer"
          headers={["Customer #", "Name"]}
          rows={SAMPLE_CUSTOMERS.map((c) => ({ key: c.id, cells: [c.id, c.name] }))}
          selectedKey={selected}
          onSelect={setSelected}
        />
      </div>
      <div className="min-h-0 flex flex-col overflow-hidden p-3 gap-3">
        <p style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 400, fontSize: 19, color: T.text }}>{cust.name}</p>
        <NestedTabs
          tabs={[
            { id: "customer", label: "Customer" },
            { id: "barcode", label: "Bar Code Structure" },
            { id: "accounting", label: "Accounting" },
            { id: "addresses", label: "Addresses" },
          ]}
          active={tab}
          onChange={setTab}
        />
        <div className="flex-1 overflow-y-auto flex flex-col gap-2.5 pt-2">
          {tab === "customer" && (
            <>
              <FormRow label="Customer #" required><SelectInput options={SAMPLE_CUSTOMERS.map((c) => c.id)} defaultValue={cust.id} /></FormRow>
              <FormRow label="Corporation Name" required><TextInput defaultValue={cust.name} /></FormRow>
              <FormRow label="Bar Code Prefix" required><TextInput defaultValue={cust.id} /></FormRow>
              <FormRow label="Representative"><TextInput /></FormRow>
              <FormRow label="Email"><TextInput /></FormRow>
              <FormRow label="Fax #"><TextInput /></FormRow>
              <FormRow label="Phone #"><TextInput /></FormRow>
              <FormRow label="Phone #1"><TextInput /></FormRow>
              <FormRow label="Phone #2"><TextInput /></FormRow>
              <FormRow label="Phone #3"><TextInput /></FormRow>
              <FormRow label="Web URL"><TextInput /></FormRow>
            </>
          )}
          {tab === "barcode" && (
            <>
              <FormRow label="Prefix"><TextInput defaultValue={cust.id} /></FormRow>
              <FormRow label="Structure"><TextInput defaultValue="{JOB}-{PM}-{SEQ}" /></FormRow>
            </>
          )}
          {tab === "accounting" && (
            <>
              <FormRow label="Account #"><TextInput /></FormRow>
              <FormRow label="Terms"><SelectInput options={["Net 30", "Net 60", "COD"]} /></FormRow>
            </>
          )}
          {tab === "addresses" && (
            <>
              <FormRow label="Line 1"><TextInput /></FormRow>
              <FormRow label="Line 2"><TextInput /></FormRow>
              <FormRow label="City"><TextInput /></FormRow>
              <FormRow label="State"><TextInput /></FormRow>
              <FormRow label="ZIP"><TextInput /></FormRow>
            </>
          )}
        </div>
        <FormActions primary={{ label: "Save" }} />
      </div>
    </div>
  );
}

export function CarrierEditorPanel() {
  const [selected, setSelected] = useState(SAMPLE_CARRIERS[0]?.id ?? null);
  const [showInactive, setShowInactive] = useState(true);
  const carrier = SAMPLE_CARRIERS.find((c) => c.id === selected);
  return (
    <div className="grid h-full min-h-0 grid-cols-1 md:grid-cols-[minmax(220px,0.9fr)_1.2fr]">
      <div className="min-h-0 overflow-hidden" style={{ borderRight: `1.5px solid ${T.border}` }}>
        <ListPane
          addLabel="Add New Carrier"
          headers={["Carrier Number", "Carrier Name"]}
          rows={SAMPLE_CARRIERS.map((c) => ({ key: c.id, cells: [c.id, c.name] }))}
          selectedKey={selected}
          onSelect={setSelected}
          showInactive={showInactive}
          onToggleInactive={setShowInactive}
        />
      </div>
      <div className="min-h-0 flex flex-col overflow-hidden p-3 gap-2.5">
        <div className="flex-1 overflow-y-auto flex flex-col gap-2.5">
          <FormRow label="Carrier #" required><SelectInput options={SAMPLE_CARRIERS.map((c) => c.id)} defaultValue={carrier?.id} /></FormRow>
          <FormRow label="Carrier Name"><TextInput defaultValue={carrier?.name} /></FormRow>
          <label className="flex items-center gap-[7px]" style={{  fontFamily: "'Lato', sans-serif", fontWeight: 400, fontSize: 16, color: T.text, cursor: "pointer" }}>
            <TokenCheckbox defaultChecked /> Active
          </label>
          <FormRow label="Line1"><TextInput /></FormRow>
          <FormRow label="Line2"><TextInput /></FormRow>
          <FormRow label="ZIP Code"><TextInput /></FormRow>
          <FormRow label="City"><SelectInput options={["Houston", "Dallas", "Miami"]} /></FormRow>
          <FormRow label="State"><TextInput defaultValue="TX" /></FormRow>
          <FormRow label="Carrier Contact"><TextInput /></FormRow>
          <FormRow label="Carrier Email"><TextInput /></FormRow>
          <FormRow label="Carrier Cell Phone"><TextInput /></FormRow>
          <FormRow label="Carrier Main Phone"><TextInput /></FormRow>
          <FormRow label="Carrier Phone #2"><TextInput /></FormRow>
          <FormRow label="Carrier Phone #3"><TextInput /></FormRow>
          <FormRow label="Carrier Fax"><TextInput /></FormRow>
        </div>
        <FormActions primary={{ label: "Save" }} />
      </div>
    </div>
  );
}

export function StatusCodesEditorPanel() {
  const [selected, setSelected] = useState(SAMPLE_STATUS[0].code);
  const [showInactive, setShowInactive] = useState(false);
  const row = SAMPLE_STATUS.find((s) => s.code === selected) ?? SAMPLE_STATUS[0];
  const [flags, setFlags] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(STATUS_FLAGS.map((f) => [f, f === "Status Code Active"]))
  );
  return (
    <div className="grid h-full min-h-0 grid-cols-1 md:grid-cols-[minmax(240px,1fr)_1.15fr]">
      <div className="min-h-0 overflow-hidden" style={{ borderRight: `1.5px solid ${T.border}` }}>
        <ListPane
          addLabel="Add Code"
          headers={["Process ID", "Division", "Status Code"]}
          rows={SAMPLE_STATUS.map((s) => ({ key: s.code, cells: [s.process, s.division, s.code] }))}
          selectedKey={selected}
          onSelect={setSelected}
          showInactive={showInactive}
          onToggleInactive={setShowInactive}
        />
      </div>
      <div className="min-h-0 flex flex-col overflow-hidden p-3 gap-2">
        <div className="flex-1 overflow-y-auto flex flex-col gap-2.5">
          <FormRow label="Division" required><SelectInput options={["SHOP", "FIELD", "FAB"]} defaultValue={row.division} /></FormRow>
          <FormRow label="Status" required><SelectInput options={SAMPLE_STATUS.map((s) => s.code)} defaultValue={row.code} /></FormRow>
          <FormRow label="STS Process #" required><TextInput defaultValue={row.process} /></FormRow>
          <FormRow label="Description"><TextInput defaultValue={row.desc} /></FormRow>
          <FormRow label="Process" required><SelectInput options={["Fab Cut", "Fit", "Paint", "Ship"]} defaultValue="Fab Cut" /></FormRow>
          <FormRow label="End For Status"><SelectInput options={["<None>", "COMPLETED"]} defaultValue="<None>" /></FormRow>
          <FormRow label="Req Xfer Status"><SelectInput options={["<None>"]} /></FormRow>
          <FormRow label="Req Bundle Status"><SelectInput options={["<None>"]} /></FormRow>
          <FormRow label="Accounting Code"><TextInput /></FormRow>
          <FormRow label="3rd Party Station Name"><TextInput /></FormRow>
          <FormRow label="Employee Class Codes"><SelectInput options={["<None>", "Fabricator", "Welder"]} /></FormRow>
          <div className="flex flex-col gap-2 mt-2 pt-2" style={{ borderTop: `1.5px solid ${T.border}` }}>
            {STATUS_FLAGS.map((f) => (
              <label key={f} className="flex items-center gap-[7px]" style={{  fontFamily: "'Lato', sans-serif", fontWeight: 400, fontSize: 16, color: T.text, cursor: "pointer" }}>
                <TokenCheckbox
                  checked={!!flags[f]}
                  onChange={(v) => setFlags((prev) => ({ ...prev, [f]: v }))}
                />
                {f}
              </label>
            ))}
          </div>
        </div>
        <FormActions primary={{ label: "Save" }} />
      </div>
    </div>
  );
}

export function RoutingCodesEditorPanel() {
  const [selected, setSelected] = useState(SAMPLE_ROUTES[0]);
  const available = [
    "SHOP, ANGLELINE", "SHOP, BANDSAW", "SHOP, BEAMLINE", "SHOP, BNDL",
    "SHOP, COMPLETED", "SHOP, CUT", "SHOP, ERECT", "SHOP, FIT",
  ];
  const [selectedCodes, setSelectedCodes] = useState<string[]>([]);
  return (
    <div className="grid h-full min-h-0 grid-cols-1 md:grid-cols-[minmax(180px,0.75fr)_1.4fr]">
      <div className="min-h-0 overflow-hidden" style={{ borderRight: `1.5px solid ${T.border}` }}>
        <ListPane
          addLabel="Add Route"
          headers={["Route Code"]}
          rows={SAMPLE_ROUTES.map((r) => ({ key: r, cells: [r] }))}
          selectedKey={selected}
          onSelect={setSelected}
        />
      </div>
      <div className="min-h-0 flex flex-col overflow-hidden p-3 gap-3">
        <FormRow label="Route code" required>
          <SelectInput options={SAMPLE_ROUTES} defaultValue={selected} />
        </FormRow>
        <FormRow label="Description">
          <TextInput defaultValue="Imported Route Code." />
        </FormRow>
        <label className="flex items-center gap-[7px]" style={{  fontFamily: "'Lato', sans-serif", fontWeight: 400, fontSize: 16, color: T.text, cursor: "pointer" }}>
          <TokenCheckbox defaultChecked /> Allow Additional Status Codes
        </label>
        <p style={{ fontFamily: "'Lato', sans-serif", fontSize: 14, color: T.textMuted }}>
          Select a code and then double-click to move to Select or deSelect.
        </p>
        <div className="flex-1 min-h-0 grid grid-cols-2 gap-3">
          {[
            { title: "Available Status Codes", items: available.filter((a) => !selectedCodes.includes(a)), target: "sel" as const },
            { title: "Selected Status Codes", items: selectedCodes, target: "avail" as const },
          ].map((box) => (
            <div key={box.title} className="flex flex-col min-h-0 rounded-md overflow-hidden" style={{ border: `1.5px solid ${T.border}` }}>
              <div className="px-2 py-1.5" style={{ background: T.surfaceAlt, fontFamily: "'DM Mono', monospace", fontSize: 11, color: T.textMuted, textTransform: "uppercase" }}>
                {box.title}
              </div>
              <div className="flex-1 overflow-y-auto">
                {box.items.map((item) => (
                  <button
                    key={item}
                    type="button"
                    className="w-full text-left px-2 py-1.5"
                    style={{  fontFamily: "'Lato', sans-serif", fontWeight: 400, fontSize: 15, color: T.text, borderBottom: `1.5px solid ${T.border}`, background: "transparent", cursor: "pointer" }}
                    onDoubleClick={() => {
                      if (box.target === "sel") setSelectedCodes((s) => [...s, item]);
                      else setSelectedCodes((s) => s.filter((x) => x !== item));
                    }}
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
        <FormActions primary={{ label: "Save" }} />
      </div>
    </div>
  );
}

type EmpRow = {
  key: string;
  first: string;
  last: string;
  number: string;
  division: string;
  bsc: boolean;
  role: string;
  station: string;
  shift: string;
};

function buildEmployeeRows(): EmpRow[] {
  return EMPLOYEES.map((e, i) => {
    const parts = e.name.split(" ");
    const first = parts[0] ?? e.name;
    const last = parts.slice(1).join(" ") || "—";
    return {
      key: `E-${100 + i}`,
      first,
      last,
      number: `E-${100 + i}`,
      division: e.station === "Yard" || e.station === "Receiving" ? "YARD" : "SHOP",
      bsc: i === 2,
      role: e.role,
      station: e.station,
      shift: e.shift,
    };
  });
}

export function EmployeeEditorPanel() {
  const rows = buildEmployeeRows();
  const [selected, setSelected] = useState(rows[0]?.key ?? null);
  const [showInactive, setShowInactive] = useState(false);
  const emp = rows.find((r) => r.key === selected) ?? rows[0];
  return (
    <div className="grid h-full min-h-0 grid-cols-1 md:grid-cols-[minmax(260px,1fr)_1.15fr]">
      <div className="min-h-0 overflow-hidden" style={{ borderRight: `1.5px solid ${T.border}` }}>
        <ListPane
          addLabel="Add New Employee"
          inactiveLabel="Show InActive Employees"
          headers={["First Name", "Last Name", "Employee Number", "Employee Division", "BSC Logon"]}
          rows={rows.map((r) => ({
            key: r.key,
            cells: [
              r.first,
              r.last,
              r.number,
              r.division,
              <span key="bsc" className="inline-flex items-center">
                <TokenCheckbox checked={r.bsc} disabled />
              </span>,
            ],
          }))}
          selectedKey={selected}
          onSelect={setSelected}
          showInactive={showInactive}
          onToggleInactive={setShowInactive}
        />
      </div>
      <div className="min-h-0 overflow-hidden">
        {emp && <EmployeeInfoEditor key={emp.key} emp={emp} />}
      </div>
    </div>
  );
}

export function EmployeeInfoEditor({
  emp,
}: {
  emp: { first: string; last: string; number: string; division: string; role: string };
}) {
  const [tab, setTab] = useState("employee");
  return (
    <div className="flex flex-col h-full min-h-0 p-3 gap-3">
      <p style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 400, fontSize: 19, color: T.text }}>
        {emp.first} {emp.last}
      </p>
      <NestedTabs
        tabs={[
          { id: "employee", label: "Employee" },
          { id: "personal", label: "Personal" },
          { id: "addresses", label: "Addresses" },
          { id: "login", label: "Login Accounts" },
        ]}
        active={tab}
        onChange={setTab}
      />
      <div className="flex-1 overflow-y-auto flex flex-col gap-2.5 pt-1">
        {tab === "employee" && (
          <>
            <FormRow label="Employee #" required>
              <SelectInput options={[emp.number, "E-104", "E-201", "E-088"]} defaultValue={emp.number} />
            </FormRow>
            <FormRow label="First" required><TextInput defaultValue={emp.first} /></FormRow>
            <FormRow label="Middle"><TextInput /></FormRow>
            <FormRow label="Last" required><TextInput defaultValue={emp.last} /></FormRow>
            <FormRow label="Division" required>
              <SelectInput options={["SHOP", "FIELD", "FAB", "YARD"]} defaultValue={emp.division} />
            </FormRow>
            <p style={{ fontFamily: "'Lato', sans-serif", fontSize: 15, color: T.textMuted }}>Login Name: Not associated</p>
            <label className="flex items-center gap-[7px]" style={{  fontFamily: "'Lato', sans-serif", fontWeight: 400, fontSize: 16, color: T.text, cursor: "pointer" }}>
              <TokenCheckbox /> Activity Logging
            </label>
            <label className="flex items-center gap-[7px]" style={{  fontFamily: "'Lato', sans-serif", fontWeight: 400, fontSize: 16, color: T.text, cursor: "pointer" }}>
              <TokenCheckbox defaultChecked /> Employee Active
            </label>
            <FormRow label="Employee Class ID">
              <SelectInput options={["<None>", "Fabricator", "Welder", "QC", "Fitter", "Painter", "Saw", "Crane", "Layout", "Material Handler"]} defaultValue={emp.role} />
            </FormRow>
            <FormRow label="3rd Party Login"><TextInput /></FormRow>
            <FormRow label="3rd Party Password"><TextInput /></FormRow>
            <FormRow label="Email"><TextInput /></FormRow>
            <FormRow label="Work Phone"><TextInput /></FormRow>
            <FormRow label="Mobile Phone"><TextInput /></FormRow>
            <FormRow label="Phone #1"><TextInput /></FormRow>
            <FormRow label="Phone #2"><TextInput /></FormRow>
          </>
        )}
        {tab === "personal" && (
          <>
            <FormRow label="DOB"><TextInput /></FormRow>
            <FormRow label="Emergency Contact"><TextInput /></FormRow>
            <FormRow label="Emergency Phone"><TextInput /></FormRow>
          </>
        )}
        {tab === "addresses" && (
          <>
            <FormRow label="Line 1"><TextInput /></FormRow>
            <FormRow label="City"><TextInput /></FormRow>
            <FormRow label="State"><TextInput /></FormRow>
            <FormRow label="ZIP"><TextInput /></FormRow>
          </>
        )}
        {tab === "login" && (
          <>
            <FormRow label="Username"><TextInput /></FormRow>
            <FormRow label="Role"><SelectInput options={["Floor", "Office", "Admin"]} /></FormRow>
          </>
        )}
      </div>
      <FormActions primary={{ label: "Save" }} />
    </div>
  );
}

export function EmployeeClassEditorPanel() {
  const classes = [
    { code: "FAB", desc: "Fabricator" },
    { code: "WELD", desc: "Welder" },
    { code: "QC", desc: "Quality Control" },
    { code: "SAW", desc: "Saw / Cut" },
    { code: "CRANE", desc: "Crane Operator" },
    { code: "PAINT", desc: "Painter" },
    { code: "MH", desc: "Material Handler" },
    { code: "LAYOUT", desc: "Layout / Detail" },
  ];
  const [selected, setSelected] = useState(classes[0].code);
  const row = classes.find((c) => c.code === selected) ?? classes[0];
  return (
    <div className="grid h-full min-h-0 grid-cols-1 md:grid-cols-[minmax(200px,0.85fr)_1.2fr]">
      <div className="min-h-0 overflow-hidden" style={{ borderRight: `1.5px solid ${T.border}` }}>
        <ListPane
          addLabel="Add Class"
          headers={["Class Code", "Description"]}
          rows={classes.map((c) => ({ key: c.code, cells: [c.code, c.desc] }))}
          selectedKey={selected}
          onSelect={setSelected}
        />
      </div>
      <div className="min-h-0 flex flex-col overflow-hidden p-3 gap-2.5">
        <div className="flex-1 overflow-y-auto flex flex-col gap-2.5">
          <FormRow label="Class Code" required><SelectInput options={classes.map((c) => c.code)} defaultValue={row.code} /></FormRow>
          <FormRow label="Class Description"><TextInput defaultValue={row.desc} /></FormRow>
          <FormRow label="Class Order #"><SelectInput options={["1", "2", "3", "4"]} /></FormRow>
          <FormRow label="Class UOM"><TextInput defaultValue="HR" /></FormRow>
          <FormRow label="Class Value #"><TextInput /></FormRow>
        </div>
        <FormActions primary={{ label: "Save" }} />
      </div>
    </div>
  );
}

const PM_TABS = [
  { id: "entry", label: "Piecemark Entry" },
  { id: "job", label: "Job Info" },
  { id: "pm", label: "Piecemark Info" },
  { id: "id", label: "ID Info" },
];

export function PiecemarkEntryWorkbench() {
  const [tab, setTab] = useState("entry");
  return (
    <div className="flex flex-col h-full min-h-0 overflow-hidden">
      <div className="flex-none flex flex-col gap-2 p-3" style={{ borderBottom: `1.5px solid ${T.border}`, background: T.surfaceAlt }}>
        <FormRow label="Job Number" required><SelectInput options={JOB_OPTIONS} /></FormRow>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          <FormRow label="Job Weight"><TextInput /></FormRow>
          <FormRow label="Customer #"><TextInput defaultValue="P2PROG" /></FormRow>
          <FormRow label="Customer Name"><TextInput defaultValue="P2 Programs" /></FormRow>
        </div>
      </div>
      <div className="flex-1 min-h-0 grid grid-cols-1 md:grid-cols-[minmax(200px,0.9fr)_1.2fr]">
        <div className="min-h-0 overflow-hidden flex flex-col" style={{ borderRight: `1.5px solid ${T.border}` }}>
          <div className="flex-none flex px-3 py-1.5" style={{ background: T.surfaceAlt, borderBottom: `1.5px solid ${T.border}` }}>
            {["ID serial #", "Sheet #", "Parent", "Piecemark"].map((h) => (
              <div key={h} className="flex-1" style={{ fontFamily: "'DM Mono', monospace", fontSize: 11, color: T.textMuted, textTransform: "uppercase" }}>{h}</div>
            ))}
          </div>
          <div className="flex-1 overflow-y-auto px-3 py-4">
            <p style={{ fontFamily: "'Lato', sans-serif", fontSize: 15, color: T.textMuted }}>No results found.</p>
          </div>
        </div>
        <div className="min-h-0 flex flex-col overflow-hidden p-3 gap-2">
          <NestedTabs tabs={PM_TABS} active={tab} onChange={setTab} />
          <div className="flex-1 overflow-y-auto flex flex-col gap-2 pt-1">
            {tab === "entry" && (
              <>
                <FormRow label="Load Number"><SelectInput options={["<None>", "LD-4412", "LD-4418"]} /></FormRow>
                <FormRow label="Shop Order #"><SelectInput options={["<None>", "SO-100", "SO-220"]} /></FormRow>
                <FormRow label="ID number"><TextInput /></FormRow>
                <FormRow label="Sheet #" required><TextInput /></FormRow>
                <FormRow label="Qty" required><TextInput defaultValue="1" /></FormRow>
                <FormRow label="# of Labels" required><TextInput defaultValue="1" /></FormRow>
                <FormRow label="Parent Piecemark" required><TextInput /></FormRow>
                <FormRow label="Piecemark" required><TextInput /></FormRow>
                <FormRow label="Material" required><SelectInput options={["W12x58", "PL 1/2", "L4x4x3/8"]} /></FormRow>
                <FormRow label="Sequence #"><SelectInput options={["<None>", "1", "2"]} /></FormRow>
                <FormRow label="Lot #"><TextInput /></FormRow>
                <FormRow label="Finish"><SelectInput options={["None", "Prime", "Paint"]} /></FormRow>
                <FormRow label="Grade"><SelectInput options={["A36", "A572", "A992"]} /></FormRow>
                <FormRow label="Weight each"><TextInput /></FormRow>
                <FormRow label="Width"><TextInput placeholder={`(x)" (x)/(x)`} /></FormRow>
                <FormRow label="Item Length"><TextInput placeholder={`(x)'(x)" (x)/(x)`} /></FormRow>
                <FormRow label="Description"><TextInput /></FormRow>
                <FormRow label="Routing code"><SelectInput options={["STD", "FABRICATION", "PAINTED"]} /></FormRow>
              </>
            )}
            {tab === "job" && (
              <>
                <FormRow label="Job Title"><TextInput defaultValue="Bal Harbour Shops - Expansion" /></FormRow>
                <FormRow label="Division"><SelectInput options={["SHOP", "FIELD"]} /></FormRow>
                <FormRow label="Status"><SelectInput options={["Open", "Closed"]} /></FormRow>
              </>
            )}
            {tab === "pm" && (
              <>
                <FormRow label="Piecemark"><TextInput /></FormRow>
                <FormRow label="Qty"><TextInput /></FormRow>
                <FormRow label="Description"><TextInput /></FormRow>
              </>
            )}
            {tab === "id" && (
              <>
                <FormRow label="ID serial #"><TextInput /></FormRow>
                <FormRow label="Barcode"><TextInput /></FormRow>
              </>
            )}
          </div>
          <FormActions primary={{ label: "Add Piecemark" }} />
        </div>
      </div>
    </div>
  );
}

type JobFormState = {
  jobNumber: string;
  customer: string;
  useBarCodeForm: string;
  jobWeight: string;
  externalJob: string;
  division: string;
  jobStatus: string;
  shipTo: string;
  billTo: string;
  jobTitle: string;
  projectYear: string;
  jobStructure: string;
  jobHours: string;
  jobLocation: string;
  jobEfficiency: string;
  jobCareOf: string;
  rfInterface: string;
  jobPo: string;
  jobRelease: string;
  defaultAdhesiveBarCodeLabelFormat: string;
  defaultLabelLaseFormat: string;
};

const INIT_JOB_FORM: JobFormState = {
  jobNumber: "092356",
  customer: "P2 Programs#P2PROG",
  useBarCodeForm: "P2 Programs#P2PROG",
  jobWeight: "",
  externalJob: "",
  division: "SHOP",
  jobStatus: "Open",
  shipTo: "",
  billTo: "",
  jobTitle: "Bal Harbour Shops - Expansion",
  projectYear: "",
  jobStructure: "",
  jobHours: "",
  jobLocation: "",
  jobEfficiency: "",
  jobCareOf: "",
  rfInterface: "PowerFab",
  jobPo: "",
  jobRelease: "",
  defaultAdhesiveBarCodeLabelFormat: "<None>",
  defaultLabelLaseFormat: "<None>",
};

function formFromJob(job: (typeof EXISTING_JOBS)[number] | undefined): JobFormState {
  if (!job) return { ...INIT_JOB_FORM };
  return {
    ...INIT_JOB_FORM,
    jobNumber: job.number,
    customer: `${job.name.split(" — ")[0] ?? job.name}#${job.customer}`,
    useBarCodeForm: `${job.name.split(" — ")[0] ?? job.name}#${job.customer}`,
    jobTitle: job.name,
  };
}

/** Restored v1 Add New Job / Edit Job Information field set */
export function JobEditorPanel({ mode }: { mode: "add" | "edit" }) {
  const [selectedJob, setSelectedJob] = useState(EXISTING_JOBS[0]?.number ?? "");
  const [form, setForm] = useState<JobFormState>(() =>
    mode === "edit" ? formFromJob(EXISTING_JOBS[0]) : { ...INIT_JOB_FORM, jobNumber: "", customer: "", useBarCodeForm: "", jobTitle: "" }
  );
  const [metricJob, setMetricJob] = useState(false);
  const [checks, setChecks] = useState({
    keepMinors: false,
    validateHeats: false,
    validatePipes: false,
    validateFittings: false,
  });

  useEffect(() => {
    if (mode !== "edit") return;
    const job = EXISTING_JOBS.find((j) => j.number === selectedJob);
    setForm(formFromJob(job));
  }, [mode, selectedJob]);

  const set = (key: keyof JobFormState, value: string) => setForm((f) => ({ ...f, [key]: value }));

  return (
    <div className="flex flex-col h-full min-h-0 p-4 gap-3 overflow-y-auto">
      <div className="flex flex-col gap-2.5 max-w-3xl">
        {mode === "edit" && (
          <FormRow label="Select Job">
            <SelectInput
              options={EXISTING_JOBS.map((j) => j.number)}
              value={selectedJob}
              onChange={setSelectedJob}
            />
          </FormRow>
        )}
        <FormRow label="Job Number"><TextInput value={form.jobNumber} onChange={(v) => set("jobNumber", v)} /></FormRow>
        <FormRow label="Customer #"><TextInput value={form.customer} onChange={(v) => set("customer", v)} /></FormRow>
        <FormRow label="Use Bar Code Form"><TextInput value={form.useBarCodeForm} onChange={(v) => set("useBarCodeForm", v)} /></FormRow>
        <FormRow
          label="Job Weight"
          trailing={
            <div className="flex items-center gap-2 shrink-0">
              <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 12, color: T.textMuted }}>lbs</span>
              <label className="flex items-center gap-[7px]" style={{ fontFamily: "'Lato', sans-serif", fontSize: 15, color: T.text, cursor: "pointer" }}>
                <TokenCheckbox checked={metricJob} onChange={setMetricJob} />
                Metric Job
              </label>
            </div>
          }
        >
          <TextInput value={form.jobWeight} onChange={(v) => set("jobWeight", v)} />
        </FormRow>
        <FormRow label="External Job #"><TextInput value={form.externalJob} onChange={(v) => set("externalJob", v)} /></FormRow>
        <FormRow label="Division">
          <SelectInput options={["SHOP", "FIELD", "FAB"]} value={form.division} onChange={(v) => set("division", v)} />
        </FormRow>
        <FormRow label="Job Status">
          <SelectInput options={["Open", "Closed", "Hold"]} value={form.jobStatus} onChange={(v) => set("jobStatus", v)} />
        </FormRow>
        <FormRow label="Ship To">
          <SelectInput options={["", "Main Yard", "Site A", "Site B"]} value={form.shipTo} onChange={(v) => set("shipTo", v)} />
        </FormRow>
        <FormRow label="Bill To">
          <SelectInput options={["", "Main Yard", "Site A", "Site B"]} value={form.billTo} onChange={(v) => set("billTo", v)} />
        </FormRow>
        <FormRow label="Job Title"><TextInput value={form.jobTitle} onChange={(v) => set("jobTitle", v)} /></FormRow>
        <FormRow label="Project Year"><TextInput value={form.projectYear} onChange={(v) => set("projectYear", v)} /></FormRow>
        <FormRow label="Job Structure"><TextInput value={form.jobStructure} onChange={(v) => set("jobStructure", v)} /></FormRow>
        <FormRow label="Job Hours"><TextInput value={form.jobHours} onChange={(v) => set("jobHours", v)} /></FormRow>
        <FormRow label="Job Location"><TextInput value={form.jobLocation} onChange={(v) => set("jobLocation", v)} /></FormRow>
        <FormRow label="Job Efficiency"><TextInput value={form.jobEfficiency} onChange={(v) => set("jobEfficiency", v)} /></FormRow>
        <FormRow label="Job Care Of"><TextInput value={form.jobCareOf} onChange={(v) => set("jobCareOf", v)} /></FormRow>
        <FormRow label="RF Interface">
          <SelectInput options={["PowerFab", "FieldOps"]} value={form.rfInterface} onChange={(v) => set("rfInterface", v)} />
        </FormRow>
        <FormRow label="Job PO #"><TextInput value={form.jobPo} onChange={(v) => set("jobPo", v)} /></FormRow>
        <FormRow label="Job Release #"><TextInput value={form.jobRelease} onChange={(v) => set("jobRelease", v)} /></FormRow>
        <FormRow label="Default Adhesive Bar Code Label Format #">
          <SelectInput
            options={["<None>", "STD-01", "STD-02"]}
            value={form.defaultAdhesiveBarCodeLabelFormat}
            onChange={(v) => set("defaultAdhesiveBarCodeLabelFormat", v)}
          />
        </FormRow>
        <FormRow label="Default LabelLase Label Format #">
          <SelectInput
            options={["<None>", "LASER-A", "LASER-B"]}
            value={form.defaultLabelLaseFormat}
            onChange={(v) => set("defaultLabelLaseFormat", v)}
          />
        </FormRow>

        <div className="mt-2 pt-3 grid grid-cols-1 sm:grid-cols-2 gap-2" style={{ borderTop: `1.5px solid ${T.border}` }}>
          {([
            ["keepMinors", "Keep Minors on Import (Prefix=No)"],
            ["validateHeats", "Validate Heats"],
            ["validatePipes", "Validate Pipes"],
            ["validateFittings", "Validate Fittings"],
          ] as const).map(([key, label]) => (
            <label key={key} className="flex items-center gap-[7px]" style={{ fontFamily: "'Lato', sans-serif", fontSize: 15, color: T.text, cursor: "pointer" }}>
              <TokenCheckbox
                checked={checks[key]}
                onChange={(v) => setChecks((c) => ({ ...c, [key]: v }))}
              />
              {label}
            </label>
          ))}
        </div>

        <FormActions
          primary={{ label: mode === "add" ? "Add Job" : "Save Job" }}
        />
      </div>
    </div>
  );
}
