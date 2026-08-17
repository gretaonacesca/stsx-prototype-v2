import { useState } from "react";
import { ScanBar } from "./components/ScanBar";
import { ShopInput, ShopSelect } from "./components/ShopField";
import { ResultCard, ResultField } from "./components/ResultCard";
import { SubmitButton } from "./components/ModeChips";
import { ShopKeyScope } from "./keypad/ShopKeyScope";
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
  const submit = () => save(entry, (r) => `${MODES.find((m) => m.id === mode)?.label} · ${r.material}`);

  return (
    <ShopKeyScope
      onSubmit={submit}
      submitLabel="Save"
      modeOptions={MODES}
      modeValue={mode}
      onModeChange={(id) => setMode(id as InventoryMode)}
    >
      <ScanBar value={entry} onChange={setEntry} />
      <div className="px-3 py-2 flex flex-col gap-1.5">
        {mode === "audit" && (
          <ShopInput letter="I" label="Audit barcode" value={auditBc} onChange={setAuditBc} />
        )}
        {mode === "sweep" && (
          <ShopInput letter="K" label="Sweep barcode" value={sweepBc} onChange={setSweepBc} />
        )}
        <ShopInput letter="A" label="ASN barcode" value={asn} onChange={setAsn} />
        {mode === "audit" && (
          <>
            <ShopInput letter="P" label="Copies" value={copies} onChange={setCopies} />
            <ShopSelect letter="B" label="Bundled (Y/N)" value={bundled} onChange={setBundled} options={["No", "Yes"]} />
            <ShopInput letter="Q" label="Quantity" value={qty} onChange={setQty} />
          </>
        )}
        {mode === "tfs" && (
          <>
            <ShopInput letter="Q" label="Quantity" value={qty} onChange={setQty} />
            <ShopInput letter="T" label="TFS job" value={tfsJob} onChange={setTfsJob} />
            <ShopInput letter="W" label="Width" value={width} onChange={setWidth} />
            <ShopInput letter="N" label="Length" value={length} onChange={setLength} />
            <ShopInput letter="R" label="RTS job" value={rtsJob} onChange={setRtsJob} />
          </>
        )}
        {showLocation && (
          <ShopInput letter="C" label="Location" value={location} onChange={setLocation} />
        )}
        <SubmitButton label="Save inventory" busy={busy} onClick={submit} />
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
    </ShopKeyScope>
  );
}
