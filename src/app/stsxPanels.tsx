import { useState, type CSSProperties, type ReactNode } from "react";
import { Check, Upload, ChevronDown } from "lucide-react";

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
  fontFamily: "'Lato', sans-serif",
  fontSize: 13,
  color: T.text,
  minWidth: 130,
  flexShrink: 0,
};

const inputStyle: CSSProperties = {
  height: 34,
  flex: 1,
  minWidth: 0,
  borderRadius: 6,
  border: `1px solid ${T.border}`,
  background: T.surface,
  padding: "0 10px",
  fontFamily: "'Lato', sans-serif",
  fontSize: 13,
  color: T.text,
  outline: "none",
};

const hintStyle: CSSProperties = {
  fontFamily: "'Lato', sans-serif",
  fontSize: 11,
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
  fontSize: 13,
  cursor: "pointer",
};

const btnGhost: CSSProperties = {
  height: 34,
  padding: "0 14px",
  borderRadius: 6,
  border: `1px solid ${T.border}`,
  background: T.surfaceAlt,
  color: T.text,
  fontFamily: "'Lato', sans-serif",
  fontSize: 13,
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
  fontSize: 13,
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
        border: `0.8px solid ${isOn ? T.primary : T.border}`,
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
        border: `0.8px solid ${checked ? T.primary : T.border}`,
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
  children,
}: {
  label: string;
  required?: boolean;
  hint?: string;
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
    </div>
  );
}

function TextInput({ defaultValue = "", placeholder }: { defaultValue?: string; placeholder?: string }) {
  return <input style={inputStyle} defaultValue={defaultValue} placeholder={placeholder} />;
}

function SelectInput({ options, defaultValue }: { options: string[]; defaultValue?: string }) {
  return (
    <div className="relative flex-1 min-w-0">
      <select
        defaultValue={defaultValue ?? options[0]}
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
      style={{ border: `1.5px dashed ${T.border}`, background: T.surfaceAlt }}
    >
      <Upload size={20} color={T.textMuted} />
      <span style={{ fontFamily: "'Lato', sans-serif", fontSize: 13, color: T.textMuted }}>
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
    <div className="flex flex-wrap gap-1" style={{ borderBottom: `1px solid ${T.border}` }}>
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
              fontSize: 10,
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

function FormActions({
  primary,
  onClear,
  onClose,
  secondaryLabel = "Clear",
}: {
  primary?: { label: string; onClick?: () => void };
  onClear?: () => void;
  onClose?: () => void;
  secondaryLabel?: string;
}) {
  return (
    <div className="flex flex-wrap justify-end gap-2 pt-3 mt-auto" style={{ borderTop: `1px solid ${T.border}` }}>
      {primary && (
        <button type="button" style={btnPrimary} onClick={primary.onClick}>{primary.label}</button>
      )}
      {onClear && (
        <button type="button" style={btnDark} onClick={onClear}>{secondaryLabel}</button>
      )}
      {onClose && (
        <button type="button" style={btnDark} onClick={onClose}>Close</button>
      )}
    </div>
  );
}

const JOB_OPTIONS = ["092356", "1234A", "1234B", "2247", "2310", "TEST"];

type ImportKind = "kiss" | "tekla" | "eje" | "sds" | "excel";

const IMPORT_META: Record<ImportKind, { title: string; accept: string }> = {
  kiss: { title: "KISS Import", accept: ".kiss, .dat, .txt" },
  tekla: { title: "Tekla XSR Import", accept: ".xsr, .tekla" },
  eje: { title: "EJE Import", accept: ".csv, .txt, .eje" },
  sds: { title: "SDS/2 Import", accept: ".xml, .sds" },
  excel: { title: "Excel Import", accept: ".xlsx, .xls" },
};

/** Shared import filter form — KISS / Tekla / SDS / Excel / EJE variants */
export function ImportFilterForm({
  kind,
  onClose,
}: {
  kind: ImportKind;
  onClose?: () => void;
}) {
  const meta = IMPORT_META[kind];
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
          <label className="flex items-center gap-[7px] mt-1" style={{ fontFamily: "'Lato', sans-serif", fontSize: 13, color: T.text, cursor: "pointer" }}>
            <TokenCheckbox />
            Use KISS File Instead of PowerFab
          </label>
        )}

        {isEje && (
          <div
            className="mt-2 p-3 rounded-md flex flex-col gap-2"
            style={{ background: T.dangerBg, border: `1px solid ${T.danger}` }}
          >
            <span style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 600, fontSize: 13, color: T.danger }}>
              Import Options
            </span>
            <span style={{ fontFamily: "'Lato', sans-serif", fontWeight: 700, fontSize: 12, color: T.text }}>
              Item Wt Rounding
            </span>
            {([
              ["none", "No Rounding"],
              ["typical", "Typical Rounding"],
              ["up", "Always Round Up"],
            ] as const).map(([id, label]) => (
              <label key={id} className="flex items-center gap-[7px]" style={{ fontFamily: "'Lato', sans-serif", fontSize: 13, color: T.text, cursor: "pointer" }}>
                <TokenRadio name="rounding" checked={rounding === id} onChange={() => setRounding(id)} />
                {label}
              </label>
            ))}
          </div>
        )}

        <p style={{ fontFamily: "'Lato', sans-serif", fontSize: 11, color: T.textMuted, marginTop: 4 }}>
          * Multiple filter items may be separated by commas. i.e. 1,2,3
        </p>

        <FileUploadField acceptLabel={meta.accept} />
      </div>

      <FormActions onClear={() => {}} onClose={onClose} />
    </div>
  );
}

const SAMPLE_CUSTOMERS = [
  { id: "44", name: "44 Iron" },
  { id: "BCTEST", name: "Barcode Testing" },
  { id: "P2PROG", name: "P2 Programs" },
  { id: "TESTLGTH", name: "Test Length Corp" },
  { id: "TEST22", name: "test 22" },
];

const SAMPLE_CARRIERS = [
  { id: "TRK-04", name: "Brooks Freight" },
  { id: "TRK-18", name: "Ortiz Hauling" },
];

const SAMPLE_STATUS = [
  { process: "200", division: "SHOP", code: "ANGLELINE", desc: "TX - AngleLine" },
  { process: "210", division: "SHOP", code: "BANDSAW", desc: "Bandsaw" },
  { process: "700", division: "SHOP", code: "COMPLETED", desc: "Completed" },
  { process: "300", division: "SHOP", code: "ERECT", desc: "Erect" },
];

const SAMPLE_ROUTES = [
  "1- TFS", "10", "2", "2- PARTS-NO FAB-BLACK", "3- PARTS-NO FAB-PRIME",
  "5- PARTS-FAB-PRIME", "FABRICATION", "PAINTED", "PNT", "R0001", "STD", "UNPAINTED",
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
}: {
  title?: string;
  addLabel: string;
  headers: string[];
  rows: { key: string; cells: string[] }[];
  selectedKey: string | null;
  onSelect: (key: string) => void;
  showInactive?: boolean;
  onToggleInactive?: (v: boolean) => void;
}) {
  return (
    <div className="flex flex-col h-full min-h-0 overflow-hidden">
      <div className="flex-none flex items-center gap-3 px-3 py-2" style={{ borderBottom: `1px solid ${T.border}`, background: T.surfaceAlt }}>
        <button type="button" style={{ ...btnDark, height: 30, fontSize: 12 }}>{addLabel}</button>
        {onToggleInactive && (
          <label className="flex items-center gap-[7px]" style={{ fontFamily: "'Lato', sans-serif", fontSize: 12, color: T.text, cursor: "pointer" }}>
            <TokenCheckbox checked={!!showInactive} onChange={onToggleInactive} />
            Show InActive
          </label>
        )}
        {title && (
          <span className="ml-auto" style={{ fontFamily: "'DM Mono', monospace", fontSize: 9, color: T.textMuted, textTransform: "uppercase" }}>{title}</span>
        )}
      </div>
      <div className="flex-none flex px-3 py-1.5" style={{ borderBottom: `0.8px solid ${T.border}`, background: T.surfaceAlt }}>
        {headers.map((h) => (
          <div key={h} className="flex-1" style={{ fontFamily: "'DM Mono', monospace", fontSize: 9, color: T.textMuted, textTransform: "uppercase" }}>{h}</div>
        ))}
      </div>
      <div className="flex-1 overflow-y-auto">
        {rows.length === 0 ? (
          <p className="px-3 py-4" style={{ fontFamily: "'Lato', sans-serif", fontSize: 12, color: T.textMuted }}>No results found.</p>
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
                  borderBottom: `0.8px solid ${T.border}`,
                  background: on ? `color-mix(in srgb, ${T.primary} 14%, transparent)` : "transparent",
                }}
              >
                {r.cells.map((c, i) => (
                  <div key={i} className="flex-1 truncate" style={{ fontFamily: i === 0 ? "'DM Mono', monospace" : "'Lato', sans-serif", fontSize: 12, color: i === 0 ? T.primary : T.text }}>{c}</div>
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
      <div className="min-h-0 overflow-hidden" style={{ borderRight: `1px solid ${T.border}` }}>
        <ListPane
          addLabel="Add New Customer"
          headers={["Customer #", "Name"]}
          rows={SAMPLE_CUSTOMERS.map((c) => ({ key: c.id, cells: [c.id, c.name] }))}
          selectedKey={selected}
          onSelect={setSelected}
        />
      </div>
      <div className="min-h-0 flex flex-col overflow-hidden p-3 gap-3">
        <p style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 600, fontSize: 16, color: T.text }}>{cust.name}</p>
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
        <FormActions secondaryLabel="Edit" onClear={() => {}} onClose={() => {}} />
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
      <div className="min-h-0 overflow-hidden" style={{ borderRight: `1px solid ${T.border}` }}>
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
          <label className="flex items-center gap-[7px]" style={{ fontFamily: "'Lato', sans-serif", fontSize: 13, color: T.text, cursor: "pointer" }}>
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
        <FormActions primary={{ label: "Save" }} onClear={() => {}} onClose={() => {}} secondaryLabel="Cancel" />
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
      <div className="min-h-0 overflow-hidden" style={{ borderRight: `1px solid ${T.border}` }}>
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
          <div className="flex flex-col gap-2 mt-2 pt-2" style={{ borderTop: `1px solid ${T.border}` }}>
            {STATUS_FLAGS.map((f) => (
              <label key={f} className="flex items-center gap-[7px]" style={{ fontFamily: "'Lato', sans-serif", fontSize: 13, color: T.text, cursor: "pointer" }}>
                <TokenCheckbox
                  checked={!!flags[f]}
                  onChange={(v) => setFlags((prev) => ({ ...prev, [f]: v }))}
                />
                {f}
              </label>
            ))}
          </div>
        </div>
        <FormActions secondaryLabel="Edit" onClear={() => {}} onClose={() => {}} />
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
      <div className="min-h-0 overflow-hidden" style={{ borderRight: `1px solid ${T.border}` }}>
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
        <label className="flex items-center gap-[7px]" style={{ fontFamily: "'Lato', sans-serif", fontSize: 13, color: T.text, cursor: "pointer" }}>
          <TokenCheckbox defaultChecked /> Allow Additional Status Codes
        </label>
        <p style={{ fontFamily: "'Lato', sans-serif", fontSize: 11, color: T.textMuted }}>
          Select a code and then double-click to move to Select or deSelect.
        </p>
        <div className="flex-1 min-h-0 grid grid-cols-2 gap-3">
          {[
            { title: "Available Status Codes", items: available.filter((a) => !selectedCodes.includes(a)), target: "sel" as const },
            { title: "Selected Status Codes", items: selectedCodes, target: "avail" as const },
          ].map((box) => (
            <div key={box.title} className="flex flex-col min-h-0 rounded-md overflow-hidden" style={{ border: `1px solid ${T.border}` }}>
              <div className="px-2 py-1.5" style={{ background: T.surfaceAlt, fontFamily: "'DM Mono', monospace", fontSize: 9, color: T.textMuted, textTransform: "uppercase" }}>
                {box.title}
              </div>
              <div className="flex-1 overflow-y-auto">
                {box.items.map((item) => (
                  <button
                    key={item}
                    type="button"
                    className="w-full text-left px-2 py-1.5"
                    style={{ fontFamily: "'Lato', sans-serif", fontSize: 12, color: T.text, borderBottom: `0.8px solid ${T.border}`, background: "transparent", cursor: "pointer" }}
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
        <FormActions secondaryLabel="Edit" onClear={() => {}} onClose={() => {}} />
      </div>
    </div>
  );
}

export function EmployeeInfoEditor({
  emp,
}: {
  emp: { name: string; role: string; station: string; shift: string };
}) {
  const [tab, setTab] = useState("employee");
  const [first, last] = emp.name.includes(" ")
    ? [emp.name.split(" ")[0], emp.name.split(" ").slice(1).join(" ")]
    : [emp.name, ""];
  return (
    <div className="flex flex-col h-full min-h-0 p-3 gap-3">
      <p style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 600, fontSize: 16, color: T.text }}>{emp.name}</p>
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
            <FormRow label="Employee #" required><SelectInput options={["E-104", "E-201", "E-088"]} defaultValue="E-104" /></FormRow>
            <FormRow label="First" required><TextInput defaultValue={first} /></FormRow>
            <FormRow label="Middle"><TextInput /></FormRow>
            <FormRow label="Last" required><TextInput defaultValue={last} /></FormRow>
            <FormRow label="Division" required><SelectInput options={["SHOP", "FIELD", "FAB"]} defaultValue="SHOP" /></FormRow>
            <FormRow label="Employee Class ID"><SelectInput options={["Fabricator", "Welder", "QC"]} defaultValue={emp.role} /></FormRow>
            <FormRow label="3rd Party Login"><TextInput /></FormRow>
            <FormRow label="Email"><TextInput /></FormRow>
            <FormRow label="Phone"><TextInput /></FormRow>
            <label className="flex items-center gap-[7px]" style={{ fontFamily: "'Lato', sans-serif", fontSize: 13, color: T.text, cursor: "pointer" }}>
              <TokenCheckbox /> Activity Logging
            </label>
            <label className="flex items-center gap-[7px]" style={{ fontFamily: "'Lato', sans-serif", fontSize: 13, color: T.text, cursor: "pointer" }}>
              <TokenCheckbox defaultChecked /> Employee Active
            </label>
            <p style={{ fontFamily: "'Lato', sans-serif", fontSize: 12, color: T.textMuted }}>Login Name: Not associated</p>
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
      <FormActions secondaryLabel="Edit" onClear={() => {}} onClose={() => {}} />
    </div>
  );
}

export function EmployeeClassEditorPanel() {
  const classes = [
    { code: "FAB", desc: "Fabricator" },
    { code: "WELD", desc: "Welder" },
    { code: "QC", desc: "Quality Control" },
  ];
  const [selected, setSelected] = useState(classes[0].code);
  const row = classes.find((c) => c.code === selected) ?? classes[0];
  return (
    <div className="grid h-full min-h-0 grid-cols-1 md:grid-cols-[minmax(200px,0.85fr)_1.2fr]">
      <div className="min-h-0 overflow-hidden" style={{ borderRight: `1px solid ${T.border}` }}>
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
        <FormActions primary={{ label: "Save" }} onClear={() => {}} onClose={() => {}} secondaryLabel="Cancel" />
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
      <div className="flex-none flex flex-col gap-2 p-3" style={{ borderBottom: `1px solid ${T.border}`, background: T.surfaceAlt }}>
        <FormRow label="Job Number" required><SelectInput options={JOB_OPTIONS} /></FormRow>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          <FormRow label="Job Weight"><TextInput /></FormRow>
          <FormRow label="Customer #"><TextInput defaultValue="P2PROG" /></FormRow>
          <FormRow label="Customer Name"><TextInput defaultValue="P2 Programs" /></FormRow>
        </div>
      </div>
      <div className="flex-1 min-h-0 grid grid-cols-1 md:grid-cols-[minmax(200px,0.9fr)_1.2fr]">
        <div className="min-h-0 overflow-hidden flex flex-col" style={{ borderRight: `1px solid ${T.border}` }}>
          <div className="flex-none flex px-3 py-1.5" style={{ background: T.surfaceAlt, borderBottom: `0.8px solid ${T.border}` }}>
            {["ID serial #", "Sheet #", "Parent", "Piecemark"].map((h) => (
              <div key={h} className="flex-1" style={{ fontFamily: "'DM Mono', monospace", fontSize: 9, color: T.textMuted, textTransform: "uppercase" }}>{h}</div>
            ))}
          </div>
          <div className="flex-1 overflow-y-auto px-3 py-4">
            <p style={{ fontFamily: "'Lato', sans-serif", fontSize: 12, color: T.textMuted }}>No results found.</p>
          </div>
        </div>
        <div className="min-h-0 flex flex-col overflow-hidden p-3 gap-2">
          <NestedTabs tabs={PM_TABS} active={tab} onChange={setTab} />
          <div className="flex-1 overflow-y-auto flex flex-col gap-2 pt-1">
            {tab === "entry" && (
              <>
                <FormRow label="Load Number"><SelectInput options={["<None>", "LD-4412", "LD-4418"]} /></FormRow>
                <FormRow label="ID number"><TextInput /></FormRow>
                <FormRow label="Shop Order #"><SelectInput options={["<None>", "SO-100", "SO-220"]} /></FormRow>
                <FormRow label="Sheet #" required><TextInput /></FormRow>
                <FormRow label="Qty" required><TextInput defaultValue="1" /></FormRow>
                <FormRow label="# of Labels" required><TextInput defaultValue="1" /></FormRow>
                <FormRow label="Parent Piecemark" required><TextInput /></FormRow>
                <FormRow label="Piecemark" required><TextInput /></FormRow>
                <FormRow label="Material" required><SelectInput options={["W12x58", "PL 1/2", "L4x4x3/8"]} /></FormRow>
                <FormRow label="Sequence #"><SelectInput options={["<None>", "1", "2"]} /></FormRow>
                <FormRow label="Lot #"><SelectInput options={["<None>", "A", "B"]} /></FormRow>
                <FormRow label="Weight each"><TextInput /></FormRow>
                <FormRow label="Width"><TextInput placeholder={`(x)" (x)/(x)`} /></FormRow>
                <FormRow label="Item Length"><TextInput placeholder={`(x)'(x)" (x)/(x)`} /></FormRow>
                <FormRow label="Finish"><SelectInput options={["None", "Prime", "Paint"]} /></FormRow>
                <FormRow label="Grade"><SelectInput options={["A36", "A572", "A992"]} /></FormRow>
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
          <FormActions primary={{ label: "Add Piecemark" }} onClose={() => {}} />
        </div>
      </div>
    </div>
  );
}
