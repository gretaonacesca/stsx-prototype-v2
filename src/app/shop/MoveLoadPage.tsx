import { useState } from "react";
import { ScanBar } from "./components/ScanBar";
import { ShopInput } from "./components/ShopField";
import { ResultCard, ResultField } from "./components/ResultCard";
import { ModeChips, SubmitButton } from "./components/ModeChips";
import { useShopSave } from "./useShopSave";

export type MoveMode = "receive" | "ship" | "return" | "sequence" | "final";

const MODES: { id: MoveMode; label: string }[] = [
  { id: "receive", label: "Receive" },
  { id: "ship", label: "Ship" },
  { id: "return", label: "Return" },
  { id: "sequence", label: "Ship by Sequence" },
  { id: "final", label: "Final Ship" },
];

export function MoveLoadPage({ onSaved }: { onSaved?: (summary: string) => void }) {
  const [mode, setMode] = useState<MoveMode>("ship");
  const [entry, setEntry] = useState("");
  const [station, setStation] = useState("");
  const [job, setJob] = useState("");
  const [load, setLoad] = useState("");
  const [location, setLocation] = useState("");
  const [prevId, setPrevId] = useState("");
  const [sequence, setSequence] = useState("");
  const { busy, result, save } = useShopSave(onSaved);

  return (
    <div className="flex-1 min-h-0 flex flex-col overflow-hidden">
      <ScanBar value={entry} onChange={setEntry} />
      <div className="flex-1 overflow-y-auto px-3 py-3 flex flex-col gap-4">
        <ModeChips options={MODES} value={mode} onChange={setMode} />

        <div className="flex flex-col gap-3">
          <ShopInput label="Status / Station" value={station} onChange={setStation} />
          <ShopInput label="Job Number" value={job} onChange={setJob} />
          {mode === "sequence" && (
            <ShopInput label="Sequence Number" value={sequence} onChange={setSequence} />
          )}
          <ShopInput label="Load Number" value={load} onChange={setLoad} />
          <ShopInput label="Location" value={location} onChange={setLocation} />
          {mode !== "final" && (
            <ShopInput label="Previous ID" value={prevId} onChange={setPrevId} />
          )}
        </div>

        <SubmitButton
          label="Save load"
          busy={busy}
          onClick={() => save(entry, (r) => `${MODES.find((m) => m.id === mode)?.label} · ${r.loadNumber}`)}
        />

        {result && (
          <ResultCard title="Load">
            <ResultField label="Ct" value={result.ct} />
            <ResultField label="Wt" value={result.wt} />
            {mode !== "final" && (
              <>
                <ResultField label="Sheet #" value={result.sheet} />
                <ResultField label="Sequence #" value={result.sequence} />
                <ResultField label="Piecemark" value={result.piecemark} />
                <ResultField label="Material" value={result.material} />
                <ResultField label="Item Length" value={result.itemLength} />
                <ResultField label="Item Weight" value={result.itemWeight} />
                <ResultField label="Shop Order" value={result.shopOrder} />
                <ResultField label="PS" value={result.ps} />
              </>
            )}
          </ResultCard>
        )}
      </div>
    </div>
  );
}
