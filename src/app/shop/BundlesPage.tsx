import { useState } from "react";
import { ScanBar } from "./components/ScanBar";
import { ShopInput, ShopSelect } from "./components/ShopField";
import { ResultCard, ResultField } from "./components/ResultCard";
import { SubmitButton } from "./components/ModeChips";
import { ShopKeyScope } from "./keypad/ShopKeyScope";
import { useShopSave } from "./useShopSave";

export type BundlesMode = "build" | "checklist" | "status" | "cut";

const MODES: { id: BundlesMode; label: string }[] = [
  { id: "build", label: "Build" },
  { id: "checklist", label: "Checklist" },
  { id: "status", label: "Status" },
  { id: "cut", label: "Cut" },
];

export function BundlesPage({ onSaved }: { onSaved?: (summary: string) => void }) {
  const [mode, setMode] = useState<BundlesMode>("build");
  const [entry, setEntry] = useState("");
  const [station, setStation] = useState("");
  const [job, setJob] = useState("");
  const [bundle, setBundle] = useState("");
  const [location, setLocation] = useState("");
  const [prevId, setPrevId] = useState("");
  const [stockLoc, setStockLoc] = useState("");
  const [country, setCountry] = useState("");
  const [mill, setMill] = useState("");
  const [bol, setBol] = useState("");
  const [barcode, setBarcode] = useState("");
  const [bundled, setBundled] = useState("No");
  const [finalize, setFinalize] = useState("No");
  const [remarks, setRemarks] = useState("");
  const [copies, setCopies] = useState("1");
  const [heatSerial, setHeatSerial] = useState("");
  const [heat, setHeat] = useState("");
  const [qty, setQty] = useState("");
  const [cutListId, setCutListId] = useState("");
  const [strike, setStrike] = useState("Yes");
  const [printIds, setPrintIds] = useState("Yes");
  const [asn, setAsn] = useState("");
  const [width, setWidth] = useState("");
  const [length, setLength] = useState("");
  const { busy, result, save } = useShopSave(onSaved);

  const submit = () => save(entry, (r) => `${MODES.find((m) => m.id === mode)?.label} · ${r.material}`);

  return (
    <ShopKeyScope
      onSubmit={submit}
      submitLabel="Save"
      modeOptions={MODES}
      modeValue={mode}
      onModeChange={(id) => setMode(id as BundlesMode)}
    >
      <ScanBar value={entry} onChange={setEntry} />
      <div className="px-3 py-2 flex flex-col gap-1.5">
        {mode === "build" && (
          <>
            <ShopInput letter="S" label="Status / Station" value={station} onChange={setStation} />
            <ShopInput letter="J" label="Job Number" value={job} onChange={setJob} />
            <ShopInput letter="B" label="Bundle" value={bundle} onChange={setBundle} />
            <ShopInput letter="C" label="Location" value={location} onChange={setLocation} />
            <ShopInput letter="D" label="Previous ID" value={prevId} onChange={setPrevId} />
          </>
        )}
        {mode === "checklist" && (
          <>
            <ShopInput letter="C" label="Stock Location" value={stockLoc} onChange={setStockLoc} />
            <ShopInput letter="O" label="Country of origin" value={country} onChange={setCountry} />
            <ShopInput letter="M" label="Mill of origin" value={mill} onChange={setMill} />
            <ShopInput letter="L" label="BOL #" value={bol} onChange={setBol} />
            <ShopInput letter="K" label="Barcode" value={barcode} onChange={setBarcode} />
            <ShopSelect letter="B" label="Bundled (Y/N)" value={bundled} onChange={setBundled} options={["No", "Yes"]} />
            <ShopSelect letter="F" label="Finalize (Y/N)" value={finalize} onChange={setFinalize} options={["No", "Yes"]} />
            <ShopInput letter="R" label="Remarks" value={remarks} onChange={setRemarks} />
            <ShopInput letter="P" label="Copies" value={copies} onChange={setCopies} />
            <ShopInput letter="Y" label="Heat Serial #" value={heatSerial} onChange={setHeatSerial} />
            <ShopInput letter="H" label="Heat" value={heat} onChange={setHeat} />
            <ShopInput letter="Q" label="Quantity" value={qty} onChange={setQty} />
          </>
        )}
        {mode === "status" && (
          <ShopInput letter="K" label="Barcode" value={barcode} onChange={setBarcode} />
        )}
        {mode === "cut" && (
          <>
            <ShopInput letter="S" label="Status / Station" value={station} onChange={setStation} />
            <ShopInput letter="C" label="Location" value={location} onChange={setLocation} />
            <ShopInput letter="I" label="Cut list ID" value={cutListId} onChange={setCutListId} />
            <ShopSelect letter="T" label="Strike thrus" value={strike} onChange={setStrike} options={["Yes", "No"]} />
            <ShopSelect letter="P" label="Print cutlist IDs" value={printIds} onChange={setPrintIds} options={["Yes", "No"]} />
            <ShopInput letter="A" label="ASN barcode" value={asn} onChange={setAsn} />
            <ShopInput letter="Q" label="Quantity" value={qty} onChange={setQty} />
            <ShopInput letter="W" label="Width" value={width} onChange={setWidth} />
            <ShopInput letter="N" label="Length" value={length} onChange={setLength} />
          </>
        )}
        <SubmitButton label="Save" busy={busy} onClick={submit} />
        {result && mode === "build" && (
          <ResultCard title="Bundle">
            <ResultField label="Bndl Number #" value={result.bundleNumber} />
            <ResultField label="PS" value={result.ps} />
            <ResultField label="Wt" value={result.wt} />
            <ResultField label="Piecemark" value={result.piecemark} />
            <ResultField label="Material" value={result.material} />
            <ResultField label="Item Length" value={result.itemLength} />
            <ResultField label="Item Weight" value={result.itemWeight} />
          </ResultCard>
        )}
        {result && (mode === "checklist" || mode === "status") && (
          <ResultCard title="Checklist">
            {mode === "checklist" && (
              <>
                <ResultField label="ASN" value={result.asn} />
                <ResultField label="Last Quantity" value={result.lastQuantity} />
              </>
            )}
            <ResultField label="PO Number" value={result.poNumber} />
            <ResultField label="Ordered" value={result.ordered} />
            <ResultField label="Remains" value={result.remains} />
            <ResultField label="Material" value={result.material} />
            <ResultField label="Grade" value={result.grade} />
            <ResultField label="Item Length" value={result.itemLength} />
            <ResultField label="Item Weight" value={result.itemWeight} />
          </ResultCard>
        )}
        {result && mode === "cut" && (
          <ResultCard title="Cutlist">
            <ResultField label="Material" value={result.material} />
            <ResultField label="Grade" value={result.grade} />
            <ResultField label="Heat" value={result.heat} />
            <ResultField label="A Length" value={result.aLength} />
            <ResultField label="A Width" value={result.aWidth} />
            <ResultField label="Location" value={result.location} />
            <ResultField label="Associated Cuts" value={result.associatedCuts} />
          </ResultCard>
        )}
      </div>
    </ShopKeyScope>
  );
}
