import { useState } from "react";
import { ScanBar } from "./components/ScanBar";
import { ShopInput } from "./components/ShopField";
import { ResultCard, ResultField } from "./components/ResultCard";
import { SubmitButton } from "./components/ModeChips";
import { ShopKeyScope } from "./keypad/ShopKeyScope";
import { useShopSave } from "./useShopSave";
import { EmptyState } from "./components/EmptyState";

export type MoveMode = "receive" | "ship" | "return" | "sequence" | "final";

const MODES: { id: MoveMode; label: string }[] = [
  { id: "receive", label: "Receive" },
  { id: "ship", label: "Ship" },
  { id: "return", label: "Return" },
  { id: "sequence", label: "Ship by Sequence" },
  { id: "final", label: "Final Ship" },
];

export function MoveLoadPage({ onSaved, online = true }: { onSaved?: (summary: string) => void; online?: boolean }) {
  const [mode, setMode] = useState<MoveMode>("ship");
  const [entry, setEntry] = useState("");
  const [station, setStation] = useState("");
  const [job, setJob] = useState("");
  const [load, setLoad] = useState("");
  const [location, setLocation] = useState("");
  const [prevId, setPrevId] = useState("");
  const [sequence, setSequence] = useState("");
  const { busy, result, notFound, save } = useShopSave(onSaved);

  const submit = () => save(entry, (r) => `${MODES.find((m) => m.id === mode)?.label} · ${r.loadNumber}`);

  return (
    <ShopKeyScope
      onSubmit={submit}
      submitLabel="Save"
      modeOptions={MODES}
      modeValue={mode}
      onModeChange={(id) => setMode(id as MoveMode)}
    >
      <ScanBar value={entry} onChange={setEntry} />
      <div className="px-3 py-2 flex flex-col gap-1.5">
        <ShopInput letter="S" label="Status / Station" value={station} onChange={setStation} />
        <ShopInput letter="J" label="Job Number" value={job} onChange={setJob} />
        {mode === "sequence" && (
          <ShopInput letter="U" label="Sequence Number" value={sequence} onChange={setSequence} />
        )}
        <ShopInput letter="L" label="Load Number" value={load} onChange={setLoad} />
        <ShopInput letter="C" label="Location" value={location} onChange={setLocation} />
        {mode !== "final" && (
          <ShopInput letter="D" label="Previous ID" value={prevId} onChange={setPrevId} />
        )}
        <SubmitButton label="Save load" busy={busy} disabled={!online} onClick={submit} />
        {notFound && (
          <EmptyState title="Entry not found" body="No piece matches that scan. Try SC-2847 or B-1042-A." />
        )}
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
    </ShopKeyScope>
  );
}
