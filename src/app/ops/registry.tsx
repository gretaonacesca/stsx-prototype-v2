import { useState, type ReactNode } from "react";
import { C } from "../colorTokens";
import { ACTIVE_LOADS, INVENTORY_STOCK } from "../data/mock";
import { findPiece, piecesForJob } from "../shop/mock";
import type { OperationId } from "../nav/catalog";
import { delay, useAsyncAction, EmptyState } from "../feedback";
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

function Placeholder({
  title,
  body,
  bullets,
  primaryLabel = "Run",
}: {
  title: string;
  body: string;
  bullets?: string[];
  primaryLabel?: string;
}) {
  return (
    <div className="p-5 flex flex-col gap-3 max-w-xl mx-auto w-full">
      <p
        style={{
          fontFamily: "'DM Mono', monospace",
          fontSize: 11,
          fontWeight: 400,
          color: C.text,
          textTransform: "uppercase",
          letterSpacing: "0.06em",
        }}
      >
        Prototype stub
      </p>
      <p style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 400, fontSize: 18, color: C.text }}>{title}</p>
      <p style={{ fontFamily: "'Lato', sans-serif", fontSize: 15, fontWeight: 400, color: C.text, lineHeight: 1.6 }}>{body}</p>
      {bullets && bullets.length > 0 && (
        <ul className="flex flex-col gap-1.5 m-0 pl-5" style={{ fontFamily: "'Lato', sans-serif", fontSize: 14, fontWeight: 400, color: C.text, lineHeight: 1.5 }}>
          {bullets.map((b) => (
            <li key={b}>{b}</li>
          ))}
        </ul>
      )}
      <FormActions primary={{ label: primaryLabel }} />
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
  const DEMO_LOAD = "LD-4412";
  const [loadId, setLoadId] = useState("");
  const [hit, setHit] = useState<(typeof ACTIVE_LOADS)[number] | null>(null);
  const [searched, setSearched] = useState(false);

  const { run, busy } = useAsyncAction(
    async () => {
      await delay(200);
      const q = loadId.trim();
      if (!q) throw new Error("Enter a load number");
      const found =
        ACTIVE_LOADS.find((l) => l.id.toLowerCase() === q.toLowerCase()) ??
        ACTIVE_LOADS.find((l) => l.id.toLowerCase().includes(q.toLowerCase())) ??
        null;
      setSearched(true);
      setHit(found);
      return found;
    },
    { toastError: false },
  );

  return (
    <div className="p-5 flex flex-col gap-3 max-w-xl mx-auto w-full">
      <p style={{ fontFamily: "'Lato', sans-serif", fontSize: 14, fontWeight: 400, color: C.text, lineHeight: 1.5 }}>
        Demo search that always hits: load{" "}
        <span style={{ fontFamily: "'DM Mono', monospace" }}>{DEMO_LOAD}</span>
        {" "}(includes piecemark B-1042-A).
      </p>
      <label className="flex flex-col gap-1">
        <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 11, color: C.text, textTransform: "uppercase" }}>Load Number</span>
        <input
          value={loadId}
          onChange={(e) => setLoadId(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !busy) void run();
          }}
          disabled={busy}
          placeholder={`e.g. ${DEMO_LOAD}`}
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
            opacity: busy ? 0.7 : 1,
          }}
        />
      </label>
      <button
        type="button"
        onClick={() => void run()}
        disabled={busy}
        className="self-start px-3 py-1.5 rounded-md"
        style={{
          background: C.accent,
          color: "#fff",
          border: "none",
          fontFamily: "'DM Mono', monospace",
          fontSize: 13,
          fontWeight: 400,
          cursor: busy ? "wait" : "pointer",
          opacity: busy ? 0.7 : 1,
        }}
      >
        {busy ? "Finding…" : "Find"}
      </button>

      {searched && hit && (
        <div className="flex flex-col gap-3 pt-2" style={{ borderTop: `1px solid ${C.border}` }}>
          <div className="grid grid-cols-2 gap-2">
            <Field label="Load ID" value={hit.id} />
            <Field label="Destination" value={hit.dest} />
            <Field label="Status" value={hit.status} />
            <Field label="ETA" value={hit.eta} />
            <Field label="Ship from" value={hit.shipFrom} />
            <Field label="Truck" value={hit.truck} />
            <Field label="Driver" value={hit.driver} />
            <Field label="Weight" value={`${hit.weightLbs} lbs`} />
            <Field label="Pieces" value={String(hit.pieces)} />
            <div className="col-span-2">
              <Field label="Notes" value={hit.notes} />
            </div>
          </div>
          <div className="flex flex-col gap-1">
            <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 11, color: C.text, textTransform: "uppercase" }}>
              Piecemarks on load
            </span>
            {hit.piecemarks.map((p) => (
              <p
                key={p.mark}
                style={{ fontFamily: "'Lato', sans-serif", fontSize: 14, fontWeight: 400, color: C.text }}
              >
                <span style={{ fontFamily: "'DM Mono', monospace" }}>{p.mark}</span>
                {" · "}qty {p.qty} · {p.desc}
              </p>
            ))}
          </div>
        </div>
      )}

      {searched && !hit && (
        <p style={{ fontFamily: "'Lato', sans-serif", fontSize: 14, color: C.text }}>
          No load found. Try load {DEMO_LOAD}.
        </p>
      )}
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

  const { run, busy } = useAsyncAction(
    async () => {
      await delay(200);
      const m = mark.trim();
      const j = job.trim();
      setSearched(true);
      if (j && !m) {
        const list = piecesForJob(j);
        setHits(list);
        setSingle(null);
        return list;
      }
      if (!m && !j) throw new Error("Enter a piecemark or job number");
      let rec = findPiece({ piecemark: m, jobNumber: j || undefined });
      if (!rec && m) rec = findPiece({ piecemark: m });
      if (!rec && m) rec = findPiece({ entry: m });
      setSingle(rec);
      setHits(null);
      return rec;
    },
    { toastError: false },
  );

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
          onKeyDown={(e) => {
            if (e.key === "Enter" && !busy) void run();
          }}
          disabled={busy}
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
          onKeyDown={(e) => {
            if (e.key === "Enter" && !busy) void run();
          }}
          disabled={busy}
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
      <button
        type="button"
        onClick={() => void run()}
        disabled={busy}
        className="self-start px-3 py-1.5 rounded-md"
        style={{
          background: C.accent,
          color: "#fff",
          border: "none",
          fontFamily: "'DM Mono', monospace",
          fontSize: 13,
          fontWeight: 400,
          cursor: busy ? "wait" : "pointer",
          opacity: busy ? 0.7 : 1,
        }}
      >
        {busy ? "Finding…" : "Find"}
      </button>

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
  const [checked, setChecked] = useState(false);
  const { run, busy } = useAsyncAction(
    async () => {
      if (!checked) throw new Error("Confirm to continue");
      await delay(400);
    },
    { toastError: true, errorMessage: "Action failed — please try again" },
  );

  return (
    <div className="p-5 flex flex-col gap-3 max-w-xl mx-auto w-full" style={{ background: C.dangerBg }}>
      <p style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 400, fontSize: 18, color: C.danger }}>{title}</p>
      <p style={{ fontFamily: "'Lato', sans-serif", fontSize: 15, fontWeight: 400, color: C.text, lineHeight: 1.6 }}>{body}</p>
      <label key={epoch} className="flex items-center gap-2" style={{ fontFamily: "'Lato', sans-serif", fontSize: 15, fontWeight: 400, color: C.text }}>
        <TokenCheckbox checked={checked} onChange={setChecked} />
        I understand this cannot be undone
      </label>
      <FormActions
        primary={{
          label: "Confirm",
          busyLabel: "Working…",
          successMessage: "Successful save",
          onClick: run,
          onSaved: () => {
            setChecked(false);
            bump();
          },
        }}
      />
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
      return (
        <DangerConfirm
          title="Active Record Delete"
          body="Marks selected active records (jobs, piecemarks, loads, etc.) as deleted. They remain recoverable until purged — same soft-delete path as classic STS."
        />
      );
    case "records-recall":
      return (
        <DangerConfirm
          title="Recall Deleted Records"
          body="Restores previously soft-deleted records back into the active set. Prototype lists sample deleted entries; full product filters by type, date, and user."
        />
      );
    case "records-purge":
      return (
        <DangerConfirm
          title="Purge Deleted Records"
          body="Permanently removes soft-deleted records from the database. Irreversible — mirrors the classic STS purge step after review."
        />
      );
    case "foxfire":
      return (
        <Placeholder
          title="Foxfire Reports"
          body="Legacy Foxfire report runner from classic STS. Pick a canned report, set job/date filters, and preview or print."
          bullets={[
            "Sample reports: Job Status Summary, Piece Location, Shipping Schedule",
            "Output: screen preview, printer, or PDF export in the full product",
          ]}
          primaryLabel="Generate report"
        />
      );
    case "status-report":
      return (
        <Placeholder
          title="Status Report"
          body="Shop-floor status rollup by job, routing step, or date range — who worked what, and where pieces sit now."
          bullets={[
            "Filters: job 092356 / 2401, status code, employee, date",
            "Columns: piecemark, qty, status, location, last scan",
          ]}
          primaryLabel="Generate report"
        />
      );
    case "barcode-labels":
      return (
        <Placeholder
          title="Barcode ID Labels"
          body="Print piece / entry ID barcodes for shop scanning. Select job or piecemark range, label stock, and printer."
          bullets={[
            "Demo marks: B-1042-A, TR-210, SC-2847",
            "Uses Barcode Printer Preferences for device and darkness defaults",
          ]}
          primaryLabel="Print labels"
        />
      );
    case "raw-labels":
      return (
        <Placeholder
          title="Raw Material Labels"
          body="Labels for inbound plate, beam, and heat lots before they become piecemarks — heat number, size, and mill certs."
          bullets={[
            "Typical fields: heat, grade, size, length, PO / ASN",
            "Pairs with inventory receiving in the full product",
          ]}
          primaryLabel="Print labels"
        />
      );
    case "label-fields":
      return (
        <Placeholder
          title="Label Field Report"
          body="Diagnostic listing of which data fields map onto each label layout (Barcode ID vs Raw Material). Used when customizing label templates."
          bullets={[
            "Shows field name → label placeholder mapping",
            "Read-only reference in this prototype",
          ]}
          primaryLabel="Run report"
        />
      );
    case "prefs":
      return (
        <Placeholder
          title="Preferences"
          body="Office / shop defaults: company name on reports, default job, units, date format, and UI behavior carried over from classic STS Options."
          bullets={[
            "Default job for new piecemarks",
            "Auto-refresh intervals and confirm-on-save prompts",
          ]}
          primaryLabel="Save preferences"
        />
      );
    case "printer-prefs":
      return (
        <Placeholder
          title="Barcode Printer Preferences"
          body="Defaults for barcode printers used by Barcode ID and Raw Material label runs — device, stock size, darkness, and copies."
          bullets={[
            "Device: Zebra ZT410 (demo)",
            "Stock: 4×2 thermal, darkness 18, 1 copy",
            "Applies shop-wide until overridden at print time",
          ]}
          primaryLabel="Save printer prefs"
        />
      );
    case "division":
      return (
        <Placeholder
          title="Division & License Management"
          body="Manage shop divisions (FAB, PAINT, SHIP, etc.) and which licensed modules each division may use."
          bullets={[
            "Demo divisions: SHOP, YARD, OFFICE",
            "License seats shown as read-only counts in the prototype",
          ]}
          primaryLabel="Save"
        />
      );
    case "logon":
      return (
        <Placeholder
          title="Logon & Access Management"
          body="Create and disable user accounts, reset passwords, and assign employees to logon IDs — the classic STS user admin screen."
          bullets={[
            "Demo users: shop.floor, office.admin, qc.lead",
            "Links to Application Permissions for role grants",
          ]}
          primaryLabel="Save users"
        />
      );
    case "permissions":
      return (
        <Placeholder
          title="Application Permissions"
          body="Grant or revoke which menu operations each role may open (import, jobs, shipping, reports, admin, records)."
          bullets={[
            "Roles: Shop Operator, Office Clerk, Supervisor, Admin",
            "Mirrors the sidebar catalog visibility in production",
          ]}
          primaryLabel="Save permissions"
        />
      );
    case "view-log":
      return (
        <Placeholder
          title="View Log"
          body="Audit trail of imports, status changes, deletes, and admin edits. Filter by date, user, and operation type."
          bullets={[
            "Sample: KISS import job 092356 · M. Ortiz · today 09:14",
            "Sample: Status update B-1042-A → STAGED · J. Brooks",
          ]}
          primaryLabel="Refresh log"
        />
      );
    case "license-info":
      return (
        <Placeholder
          title="View Logon License Info"
          body="Shows concurrent license seats in use, who is logged on, and which workstation holds each seat — useful when users cannot log in."
          bullets={[
            "Demo: 4 of 8 seats in use",
            "Sessions: office.admin (PC-12), shop.floor (TABLET-3)",
          ]}
          primaryLabel="Refresh"
        />
      );
    default:
      return (
        <div className="p-5 max-w-xl mx-auto w-full">
          <EmptyState
            title="Operation unavailable"
            body="This menu item could not be loaded. Close the window and try again from the sidebar."
          />
        </div>
      );
  }
}
