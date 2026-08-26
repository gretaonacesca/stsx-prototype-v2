import { useState, type ReactNode } from "react";
import { C } from "../colorTokens";
import { ACTIVE_LOADS, INVENTORY_STOCK } from "../data/mock";
import { findPiece, piecesForJob } from "../shop/mock";
import type { OperationId } from "../nav/catalog";
import {
  ImportFilterForm,
  CustomerEditorPanel,
  CarrierEditorPanel,
  StatusCodesEditorPanel,
  RoutingCodesEditorPanel,
  EmployeeEditorPanel,
  EmployeeClassEditorPanel,
  PiecemarkEntryWorkbench,
  JobEditorPanel,
  FormActions,
  useFormEpoch,
  TokenCheckbox,
} from "../stsxPanels";

function Placeholder({ title, body }: { title: string; body: string }) {
  return (
    <div className="p-5 flex flex-col gap-3 max-w-xl mx-auto w-full">
      <p style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 400, fontSize: 18, color: C.text }}>{title}</p>
      <p style={{ fontFamily: "'Lato', sans-serif", fontSize: 15, fontWeight: 400, color: C.text, lineHeight: 1.6 }}>{body}</p>
      <FormActions primary={{ label: "Save" }} />
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
    <div className="p-5 flex flex-col gap-3 max-w-2xl mx-auto w-full">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
      <FormActions primary={{ label: "Save" }} />
    </div>
  );
}

function FindPiecemark() {
  const DEMO_MARK = "B-1042-A";
  const [mark, setMark] = useState("");
  const [job, setJob] = useState("");
  const [hits, setHits] = useState<ReturnType<typeof piecesForJob> | null>(null);
  const [single, setSingle] = useState<ReturnType<typeof findPiece>>(null);
  const [searched, setSearched] = useState(false);

  const run = (overrideMark?: string, overrideJob?: string) => {
    const m = (overrideMark ?? mark).trim();
    const j = (overrideJob ?? job).trim();
    setSearched(true);
    if (j && !m) {
      setHits(piecesForJob(j));
      setSingle(null);
      return;
    }
    // Prefer job+mark; if that misses, fall back to piecemark alone so demos always work
    let rec = findPiece({ piecemark: m, jobNumber: j || undefined });
    if (!rec && m) rec = findPiece({ piecemark: m });
    if (!rec && m) rec = findPiece({ entry: m });
    setSingle(rec);
    setHits(null);
  };

  return (
    <div className="p-5 flex flex-col gap-3 max-w-xl mx-auto w-full">
      <p style={{ fontFamily: "'Lato', sans-serif", fontSize: 14, fontWeight: 400, color: C.text, lineHeight: 1.5 }}>
        Demo search that always hits: piecemark <span style={{ fontFamily: "'DM Mono', monospace" }}>{DEMO_MARK}</span>
        {" "}(job 092356 optional).
      </p>
      <label className="flex flex-col gap-1">
        <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 11, color: C.text, textTransform: "uppercase" }}>Job Number</span>
        <input
          value={job}
          onChange={(e) => setJob(e.target.value)}
          placeholder="e.g. 092356 (optional)"
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
      <label className="flex flex-col gap-1">
        <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 11, color: C.text, textTransform: "uppercase" }}>Piecemark</span>
        <input
          value={mark}
          onChange={(e) => setMark(e.target.value)}
          placeholder={`e.g. ${DEMO_MARK}`}
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
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => run()}
          className="px-3 py-1.5 rounded-md"
          style={{ background: C.accent, color: "#fff", border: "none", fontFamily: "'DM Mono', monospace", fontSize: 13, fontWeight: 400, cursor: "pointer" }}
        >
          Find
        </button>
        <button
          type="button"
          onClick={() => {
            setMark(DEMO_MARK);
            setJob("092356");
            run(DEMO_MARK, "092356");
          }}
          className="px-3 py-1.5 rounded-md"
          style={{
            background: C.surfaceAlt,
            color: C.text,
            border: `1.5px solid ${C.border}`,
            fontFamily: "'DM Mono', monospace",
            fontSize: 12,
            fontWeight: 400,
            cursor: "pointer",
          }}
        >
          Fill demo {DEMO_MARK}
        </button>
      </div>

      {searched && single && (
        <div className="grid grid-cols-2 gap-2 pt-2" style={{ borderTop: `1px solid ${C.border}` }}>
          <Field label="Entry" value={single.entry} />
          <Field label="Piecemark" value={single.piecemark} />
          <Field label="Job #" value={single.jobNumber} />
          <Field label="Status" value={single.prevStatus} />
          <Field label="Location" value={single.location} />
          <Field label="Load" value={single.loadNumber} />
          <Field label="Material" value={single.material} />
          <Field label="Qty" value={single.qty} />
        </div>
      )}

      {searched && hits && (
        <div className="flex flex-col gap-1 pt-2" style={{ borderTop: `1px solid ${C.border}` }}>
          <p style={{ fontFamily: "'Lato', sans-serif", fontSize: 14, color: C.text }}>
            {hits.length} piecemark{hits.length === 1 ? "" : "s"} on job {job.trim() || "—"}
          </p>
          {hits.length === 0 ? (
            <p style={{ fontFamily: "'Lato', sans-serif", fontSize: 14, color: C.text }}>No pieces found.</p>
          ) : (
            hits.map((p) => (
              <button
                key={p.entry}
                type="button"
                onClick={() => {
                  setMark(p.piecemark);
                  setSingle(p);
                  setHits(null);
                }}
                className="text-left px-2 py-1.5 rounded"
                style={{
                  background: C.surfaceAlt,
                  border: `1px solid ${C.border}`,
                  cursor: "pointer",
                  fontFamily: "'Lato', sans-serif",
                  fontSize: 13,
                  color: C.text,
                }}
              >
                {p.piecemark} · {p.prevStatus} · {p.location} · {p.entry}
              </button>
            ))
          )}
        </div>
      )}

      {searched && !single && !hits && (
        <p style={{ fontFamily: "'Lato', sans-serif", fontSize: 14, color: C.text }}>
          No piece found. Try piecemark {DEMO_MARK}.
        </p>
      )}
    </div>
  );
}

function DangerConfirm({ title, body }: { title: string; body: string }) {
  const [epoch, bump] = useFormEpoch();
  return (
    <div className="p-5 flex flex-col gap-3 max-w-xl mx-auto w-full" style={{ background: C.dangerBg }}>
      <p style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 400, fontSize: 18, color: C.danger }}>{title}</p>
      <p style={{ fontFamily: "'Lato', sans-serif", fontSize: 15, fontWeight: 400, color: C.text, lineHeight: 1.6 }}>{body}</p>
      <label key={epoch} className="flex items-center gap-2" style={{ fontFamily: "'Lato', sans-serif", fontSize: 15, fontWeight: 400, color: C.text }}>
        <TokenCheckbox />
        I understand this cannot be undone
      </label>
      <FormActions primary={{ label: "Confirm", successMessage: "Successful save", onSaved: bump }} />
    </div>
  );
}

function InventoryOp({ kind }: { kind: "item" | "reorder" | "capacity" }) {
  const item = INVENTORY_STOCK[0];
  const pct = Math.round((item.level / item.capacity) * 100);
  if (kind === "reorder") {
    return (
      <div className="p-5 flex flex-col gap-3 max-w-xl mx-auto w-full">
        <p style={{ fontFamily: "'Lato', sans-serif", fontSize: 15, fontWeight: 400, color: C.text }}>
          Reorder point: {Math.round(item.capacity * 0.25)}. Suggested order: {Math.max(0, Math.round(item.capacity * 0.6) - item.level)} units for {item.sku}.
        </p>
        <FormActions primary={{ label: "Create PO", successMessage: "Successful save" }} />
      </div>
    );
  }
  if (kind === "capacity") {
    return (
      <div className="p-5 max-w-xl mx-auto w-full">
        <p style={{ fontFamily: "'Lato', sans-serif", fontSize: 15, fontWeight: 400, color: C.text }}>
          Bin capacity utilization for {item.name} is {pct}%.
        </p>
      </div>
    );
  }
  return (
    <div className="p-5 flex flex-col gap-3 max-w-xl mx-auto w-full">
      <div className="grid grid-cols-2 gap-3">
        <Field label="SKU" value={item.sku} />
        <Field label="Name" value={item.name} />
        <Field label="Level" value={String(item.level)} />
        <Field label="Capacity" value={String(item.capacity)} />
      </div>
      <FormActions primary={{ label: "Save" }} />
    </div>
  );
}

/** Master–detail ops need a working height; compact forms size to content. */
const SPLIT_H = "h-[min(72vh,620px)]";

export function renderOperation(opId: OperationId): ReactNode {
  switch (opId) {
    case "add-job":
      return <JobEditorPanel mode="add" />;
    case "edit-job":
      return <JobEditorPanel mode="edit" />;
    case "enter-piecemark":
      return <div className={SPLIT_H}><PiecemarkEntryWorkbench /></div>;
    case "find-piecemark":
      return <FindPiecemark />;
    case "view-load":
      return <LoadForm />;
    case "edit-employee":
      return <div className={SPLIT_H}><EmployeeEditorPanel /></div>;
    case "edit-employee-class":
      return <div className={SPLIT_H}><EmployeeClassEditorPanel /></div>;
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
      return <div className={SPLIT_H}><CustomerEditorPanel /></div>;
    case "carriers":
      return <div className={SPLIT_H}><CarrierEditorPanel /></div>;
    case "status-codes":
      return <div className={SPLIT_H}><StatusCodesEditorPanel /></div>;
    case "routing-codes":
      return <div className={SPLIT_H}><RoutingCodesEditorPanel /></div>;
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
