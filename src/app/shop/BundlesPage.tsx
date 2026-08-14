import { useState } from "react";
import { ScanBar } from "./components/ScanBar";
import { ShopInput } from "./components/ShopField";
import { ResultCard, ResultField } from "./components/ResultCard";
import { ModeChips, SubmitButton } from "./components/ModeChips";
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

  return (
    <div className="flex-1 min-h-0 flex flex-col overflow-hidden">
      <ScanBar value={entry} onChange={setEntry} />
      <div className="flex-1 overflow-y-auto px-3 py-3 flex flex-col gap-4">
        <ModeChips options={MODES} value={mode} onChange={setMode} />

        <div className="flex flex-col gap-3">
          {mode === "build" && (
            <>
              <ShopInput label="Status / Station" value={station} onChange={setStation} />
              <ShopInput label="Job Number" value={job} onChange={setJob} />
              <ShopInput label="Bundle" value={bundle} onChange={setBundle} />
              <ShopInput label="Location" value={location} onChange={setLocation} />
              <ShopInput label="Previous ID" value={prevId} onChange={setPrevId} />
            </>
          )}
          {mode === "checklist" && (
            <>
              <ShopInput label="Stock Location" value={stockLoc} onChange={setStockLoc} />
              <ShopInput label="Country of origin" value={country} onChange={setCountry} />
              <ShopInput label="Mill of origin" value={mill} onChange={setMill} />
              <ShopInput label="BOL #" value={bol} onChange={setBol} />
              <ShopInput label="Barcode" value={barcode} onChange={setBarcode} />
              <ShopInput label="Bundled (Y/N)" value={bundled} onChange={setBundled} />
              <ShopInput label="Finalize (Y/N)" value={finalize} onChange={setFinalize} />
              <ShopInput label="Remarks" value={remarks} onChange={setRemarks} />
              <ShopInput label="Copies" value={copies} onChange={setCopies} />
              <ShopInput label="Heat Serial #" value={heatSerial} onChange={setHeatSerial} />
              <ShopInput label="Heat" value={heat} onChange={setHeat} />
              <ShopInput label="Quantity" value={qty} onChange={setQty} />
            </>
          )}
          {mode === "status" && (
            <ShopInput label="Barcode" value={barcode} onChange={setBarcode} />
          )}
          {mode === "cut" && (
            <>
              <ShopInput label="Status / Station" value={station} onChange={setStation} />
              <ShopInput label="Location" value={location} onChange={setLocation} />
              <ShopInput label="Cut list ID" value={cutListId} onChange={setCutListId} />
              <ShopInput label="Strike thrus" value={strike} onChange={setStrike} />
              <ShopInput label="Print cutlist IDs" value={printIds} onChange={setPrintIds} />
              <ShopInput label="ASN barcode" value={asn} onChange={setAsn} />
              <ShopInput label="Quantity" value={qty} onChange={setQty} />
              <ShopInput label="Width" value={width} onChange={setWidth} />
              <ShopInput label="Length" value={length} onChange={setLength} />
            </>
          )}
        </div>

        <SubmitButton
          label="Save"
          busy={busy}
          onClick={() => save(entry, (r) => `${MODES.find((m) => m.id === mode)?.label} · ${r.material}`)}
        />

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
    </div>
  );
}
