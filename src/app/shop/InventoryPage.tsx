import { useState } from "react";
import { ScanBar } from "./components/ScanBar";
import { ShopInput } from "./components/ShopField";
import { ResultCard, ResultField } from "./components/ResultCard";
import { ModeChips, SubmitButton } from "./components/ModeChips";
import { useShopSave } from "./useShopSave";

export type InventoryMode = "receive" | "audit" | "move" | "status" | "sweep" | "tfs";

const MODES: { id: InventoryMode; label: string }[] = [
  { id: "receive", label: "ASN Receive" },
  { id: "audit", label: "Audit" },
  { id: "move", label: "Move" },
  { id: "status", label: "Status" },
  { id: "sweep", label: "Sweep" },
  { id: "tfs", label: "TFS" },
];

export function InventoryPage({ onSaved }: { onSaved?: (summary: string) => void }) {
  const [mode, setMode] = useState<InventoryMode>("receive");
  const [entry, setEntry] = useState("");
  const [location, setLocation] = useState("");
  const [asn, setAsn] = useState("");
  const [auditBc, setAuditBc] = useState("");
  const [sweepBc, setSweepBc] = useState("");
  const [copies, setCopies] = useState("1");
  const [bundled, setBundled] = useState("No");
  const [qty, setQty] = useState("");
  const [tfsJob, setTfsJob] = useState("");
  const [rtsJob, setRtsJob] = useState("");
  const [width, setWidth] = useState("");
  const [length, setLength] = useState("");
  const { busy, result, save } = useShopSave(onSaved);

  const showLocation = mode === "receive" || mode === "move" || mode === "tfs";

  return (
    <div className="flex-1 min-h-0 flex flex-col overflow-hidden">
      <ScanBar value={entry} onChange={setEntry} />
      <div className="flex-1 overflow-y-auto px-3 py-3 flex flex-col gap-4">
        <ModeChips options={MODES} value={mode} onChange={setMode} />

        <div className="flex flex-col gap-3">
          {mode === "audit" && (
            <ShopInput label="Audit barcode" value={auditBc} onChange={setAuditBc} />
          )}
          {mode === "sweep" && (
            <ShopInput label="Sweep barcode" value={sweepBc} onChange={setSweepBc} />
          )}
          <ShopInput label="ASN barcode" value={asn} onChange={setAsn} />
          {mode === "audit" && (
            <>
              <ShopInput label="Copies" value={copies} onChange={setCopies} />
              <ShopInput label="Bundled (Y/N)" value={bundled} onChange={setBundled} />
              <ShopInput label="Quantity" value={qty} onChange={setQty} />
            </>
          )}
          {mode === "tfs" && (
            <>
              <ShopInput label="Quantity" value={qty} onChange={setQty} />
              <ShopInput label="TFS job" value={tfsJob} onChange={setTfsJob} />
              <ShopInput label="Width" value={width} onChange={setWidth} />
              <ShopInput label="Length" value={length} onChange={setLength} />
              <ShopInput label="RTS job" value={rtsJob} onChange={setRtsJob} />
            </>
          )}
          {showLocation && (
            <ShopInput label="Location" value={location} onChange={setLocation} />
          )}
        </div>

        <SubmitButton label="Save inventory" busy={busy} onClick={() => save(entry, (r) => `${MODES.find((m) => m.id === mode)?.label} · ${r.material}`)} />

        {result && (
          <ResultCard title="Inventory">
            <ResultField label="Material" value={result.material} />
            {(mode === "receive" || mode === "move" || mode === "status") && (
              <ResultField label="Qty" value={result.qty} />
            )}
            <ResultField label="Item Length" value={result.itemLength} />
            {(mode === "receive" || mode === "move" || mode === "status") && (
              <ResultField label="Width" value={result.width} />
            )}
            {(mode === "receive" || mode === "move" || mode === "status") && (
              <ResultField label="Wt" value={result.wt} />
            )}
            {(mode === "audit" || mode === "tfs" || mode === "sweep") && (
              <ResultField label="Item Weight" value={result.itemWeight} />
            )}
            {(mode === "receive" || mode === "move" || mode === "status") && (
              <ResultField label="Job #" value={result.jobNumber} />
            )}
            <ResultField label="Grade" value={result.grade} />
            <ResultField label="Heat" value={result.heat} />
            <ResultField label="PO Number" value={result.poNumber} />
            {mode === "status" ? (
              <>
                <ResultField label="Location" value={result.location} />
                <ResultField label="Division" value={result.division} />
              </>
            ) : mode === "receive" || mode === "move" ? (
              <>
                <ResultField label="Prev Location" value={result.prevLocation} />
                <ResultField label="Division" value={result.division} />
              </>
            ) : (
              <>
                <ResultField label="Primary Location" value={result.primaryLocation} />
                <ResultField label="Secondary Location" value={result.secondaryLocation} />
              </>
            )}
            {mode === "audit" && (
              <>
                <ResultField label="Report Qty" value={result.reportQty} />
                <ResultField label="Remains" value={result.remains} />
              </>
            )}
            {mode === "sweep" && (
              <>
                <ResultField label="Quantity / Remaining" value={`${result.qty} / ${result.remains}`} />
                <ResultField label="Quantity Found" value={result.qtyFound} />
                <ResultField label="Qty Moved In/Out" value={`${result.qtyMovedIn} / ${result.qtyMovedOut}`} />
                <ResultField label="Sweep Complete" value={result.sweepComplete} />
              </>
            )}
          </ResultCard>
        )}
      </div>
    </div>
  );
}
