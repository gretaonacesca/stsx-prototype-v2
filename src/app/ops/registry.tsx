import type { ReactNode } from "react";
import { C } from "../colorTokens";
import { ACTIVE_LOADS, EMPLOYEES, EXISTING_JOBS, INVENTORY_STOCK } from "../data/mock";
import type { OperationId } from "../nav/catalog";
import {
  ImportFilterForm,
  CustomerEditorPanel,
  CarrierEditorPanel,
  StatusCodesEditorPanel,
  RoutingCodesEditorPanel,
  EmployeeInfoEditor,
  EmployeeClassEditorPanel,
  PiecemarkEntryWorkbench,
  TokenCheckbox,
} from "../stsxPanels";

function Placeholder({ title, body }: { title: string; body: string }) {
  return (
    <div className="p-5 flex flex-col gap-3">
      <p style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 400, fontSize: 18, color: C.text }}>{title}</p>
      <p style={{ fontFamily: "'Lato', sans-serif", fontSize: 15, fontWeight: 400, color: C.text, lineHeight: 1.6 }}>{body}</p>
      <button
        type="button"
        className="self-start px-3 py-1.5 rounded-md"
        style={{ background: C.primary, color: C.primaryFg, border: "none", fontFamily: "'DM Mono', monospace", fontSize: 13, fontWeight: 400, cursor: "pointer" }}
      >
        Continue
      </button>
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-1">
      <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 11, color: C.text, textTransform: "uppercase" }}>{label}</span>
      <span style={{ fontFamily: "'Lato', sans-serif", fontSize: 15, fontWeight: 400, color: C.text }}>{value || "—"}</span>
    </div>
  );
}

function LoadForm() {
  const load = ACTIVE_LOADS[0];
  return (
    <div className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
      <Field label="Load ID" value={load.id} />
      <Field label="Destination" value={load.dest} />
      <Field label="Status" value={load.status} />
      <Field label="ETA" value={load.eta} />
      <Field label="Ship from" value={load.shipFrom} />
      <Field label="Truck" value={load.truck} />
      <Field label="Driver" value={load.driver} />
      <Field label="Weight" value={`${load.weightLbs} lbs`} />
      <div className="sm:col-span-2">
        <Field label="Notes" value={load.notes} />
      </div>
    </div>
  );
}

function JobForm({ mode }: { mode: "add" | "edit" }) {
  const job = EXISTING_JOBS[0];
  return (
    <div className="p-5 flex flex-col gap-3">
      <p style={{ fontFamily: "'Lato', sans-serif", fontSize: 14, fontWeight: 400, color: C.text }}>
        {mode === "add" ? "Create a new job (prototype form)." : `Editing job ${job.number} — ${job.name}.`}
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {[
          ["Job Number", mode === "add" ? "" : job.number],
          ["Customer", job.customer],
          ["Job Title", job.name],
          ["Division", "SHOP"],
          ["Status", "Open"],
          ["Location", ""],
        ].map(([label, value]) => (
          <label key={label} className="flex flex-col gap-1">
            <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 11, color: C.text, textTransform: "uppercase" }}>{label}</span>
            <input
              defaultValue={value}
              style={{
                height: 36,
                borderRadius: 6,
                border: `1.5px solid ${C.border}`,
                background: C.surfaceAlt,
                padding: "0 10px",
                fontFamily: "'Lato', sans-serif",
                fontSize: 15,
                fontWeight: 400,
                color: C.text,
              }}
            />
          </label>
        ))}
      </div>
      <button
        type="button"
        className="self-start px-3 py-1.5 rounded-md mt-2"
        style={{ background: C.primary, color: C.primaryFg, border: "none", fontFamily: "'DM Mono', monospace", fontSize: 13, fontWeight: 400, cursor: "pointer" }}
      >
        {mode === "add" ? "Create Job" : "Save Changes"}
      </button>
    </div>
  );
}

function FindPiecemark() {
  return (
    <div className="p-5 flex flex-col gap-3">
      <label className="flex flex-col gap-1">
        <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 11, color: C.text, textTransform: "uppercase" }}>Piecemark</span>
        <input
          placeholder="e.g. B-1042-A"
          style={{
            height: 36,
            borderRadius: 6,
            border: `1.5px solid ${C.border}`,
            background: C.surfaceAlt,
            padding: "0 10px",
            fontFamily: "'Lato', sans-serif",
            fontSize: 15,
            fontWeight: 400,
            color: C.text,
          }}
        />
      </label>
      <button
        type="button"
        className="self-start px-3 py-1.5 rounded-md"
        style={{ background: C.accent, color: "#fff", border: "none", fontFamily: "'DM Mono', monospace", fontSize: 13, fontWeight: 400, cursor: "pointer" }}
      >
        Find
      </button>
    </div>
  );
}

function DangerConfirm({ title, body }: { title: string; body: string }) {
  return (
    <div className="p-5 flex flex-col gap-3" style={{ background: C.dangerBg }}>
      <p style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 400, fontSize: 18, color: C.danger }}>{title}</p>
      <p style={{ fontFamily: "'Lato', sans-serif", fontSize: 15, fontWeight: 400, color: C.text, lineHeight: 1.6 }}>{body}</p>
      <label className="flex items-center gap-2" style={{ fontFamily: "'Lato', sans-serif", fontSize: 15, fontWeight: 400, color: C.text }}>
        <TokenCheckbox />
        I understand this cannot be undone
      </label>
      <button
        type="button"
        className="self-start px-3 py-1.5 rounded-md"
        style={{ background: C.danger, color: "#fff", border: "none", fontFamily: "'DM Mono', monospace", fontSize: 13, fontWeight: 400, cursor: "pointer" }}
      >
        Confirm
      </button>
    </div>
  );
}

function InventoryOp({ kind }: { kind: "item" | "reorder" | "capacity" }) {
  const item = INVENTORY_STOCK[0];
  const pct = Math.round((item.level / item.capacity) * 100);
  if (kind === "reorder") {
    return (
      <div className="p-5 flex flex-col gap-3">
        <p style={{ fontFamily: "'Lato', sans-serif", fontSize: 15, fontWeight: 400, color: C.text }}>
          Reorder point: {Math.round(item.capacity * 0.25)}. Suggested order: {Math.max(0, Math.round(item.capacity * 0.6) - item.level)} units for {item.sku}.
        </p>
        <button type="button" className="self-start px-3 py-1.5 rounded-md" style={{ background: C.primary, color: C.primaryFg, border: "none", fontFamily: "'DM Mono', monospace", fontSize: 13, fontWeight: 400, cursor: "pointer" }}>
          Create PO
        </button>
      </div>
    );
  }
  if (kind === "capacity") {
    return (
      <div className="p-5">
        <p style={{ fontFamily: "'Lato', sans-serif", fontSize: 15, fontWeight: 400, color: C.text }}>
          Bin capacity utilization for {item.name} is {pct}%.
        </p>
      </div>
    );
  }
  return (
    <div className="p-5 grid grid-cols-2 gap-3">
      <Field label="SKU" value={item.sku} />
      <Field label="Name" value={item.name} />
      <Field label="Level" value={String(item.level)} />
      <Field label="Capacity" value={String(item.capacity)} />
    </div>
  );
}

export function renderOperation(opId: OperationId): ReactNode {
  switch (opId) {
    case "add-job":
      return <JobForm mode="add" />;
    case "edit-job":
      return <JobForm mode="edit" />;
    case "enter-piecemark":
      return <div className="h-[520px]"><PiecemarkEntryWorkbench /></div>;
    case "find-piecemark":
      return <FindPiecemark />;
    case "view-load":
      return <LoadForm />;
    case "edit-employee":
      return (
        <div className="p-4">
          <EmployeeInfoEditor emp={EMPLOYEES[0]} />
        </div>
      );
    case "edit-employee-class":
      return <div className="p-4"><EmployeeClassEditorPanel /></div>;
    case "inventory-item":
      return <InventoryOp kind="item" />;
    case "inventory-reorder":
      return <InventoryOp kind="reorder" />;
    case "inventory-capacity":
      return <InventoryOp kind="capacity" />;
    case "kiss-import":
      return <ImportFilterForm kind="kiss" />;
    case "tekla":
      return <ImportFilterForm kind="tekla" />;
    case "eje":
      return <ImportFilterForm kind="eje" />;
    case "sds":
      return <ImportFilterForm kind="sds" />;
    case "excel":
      return <ImportFilterForm kind="excel" />;
    case "customers":
      return <CustomerEditorPanel />;
    case "carriers":
      return <CarrierEditorPanel />;
    case "status-codes":
      return <StatusCodesEditorPanel />;
    case "routing-codes":
      return <RoutingCodesEditorPanel />;
    case "records-delete":
      return <DangerConfirm title="Active Record Delete" body="Marks selected records as deleted. They can still be recalled until purged." />;
    case "records-recall":
      return <DangerConfirm title="Recall Deleted Records" body="Restores previously deleted records back into the active set." />;
    case "records-purge":
      return <DangerConfirm title="Purge Deleted Records" body="Irreversibly removes deleted records from the database." />;
    case "foxfire":
    case "status-report":
    case "barcode-labels":
    case "raw-labels":
    case "label-fields":
      return <Placeholder title="Report / label run" body="Prototype stub — configure filters and generate output in the full product." />;
    case "prefs":
    case "printer-prefs":
    case "division":
    case "logon":
    case "permissions":
    case "view-log":
    case "license-info":
      return <Placeholder title="Admin setting" body="Prototype stub for office-employee system preferences and access controls." />;
    default:
      return null;
  }
}
