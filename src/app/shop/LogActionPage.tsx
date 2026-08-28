import { useState } from "react";
import { ScanBar } from "./components/ScanBar";
import { ShopInput, ShopValueRow } from "./components/ShopField";
import { ResultCard, ResultField } from "./components/ResultCard";
import { SubmitButton } from "./components/ModeChips";
import { ShopKeyScope } from "./keypad/ShopKeyScope";
import { useShopSave } from "./useShopSave";
import { EmptyState } from "./components/EmptyState";
import { StatusPill } from "../viz/chrome";

export type LogMode = "inspection" | "labor" | "saw" | "transaction";

const MODES: { id: LogMode; label: string }[] = [
  { id: "inspection", label: "Inspection" },
  { id: "labor", label: "Labor" },
  { id: "saw", label: "Saw" },
  { id: "transaction", label: "Transaction" },
];

export function LogActionPage({ onSaved, online = true }: { onSaved?: (summary: string) => void; online?: boolean }) {
  const [mode, setMode] = useState<LogMode>("inspection");
  const [entry, setEntry] = useState("");
  const [station, setStation] = useState("");
  const [location, setLocation] = useState("");
  const [workers, setWorkers] = useState("");
  const [prevId, setPrevId] = useState("");
  const [revision, setRevision] = useState("");
  const [percent, setPercent] = useState("");
  const [grade, setGrade] = useState("");
  const [heat, setHeat] = useState("");
  const { busy, result, notFound, save } = useShopSave(onSaved);

  const submit = () => save(entry, (r) => `${MODES.find((m) => m.id === mode)?.label} · ${r.piecemark}`);

  return (
    <ShopKeyScope
      onSubmit={submit}
      submitLabel="Save"
      modeOptions={MODES}
      modeValue={mode}
      onModeChange={(id) => setMode(id as LogMode)}
    >
      <ScanBar value={entry} onChange={setEntry} />
      <div className="px-3 py-2 flex flex-col gap-1.5">
        <ShopInput letter="S" label="Status / Station" value={station} onChange={setStation} />
        <ShopInput letter="C" label="Location" value={location} onChange={setLocation} />
        <ShopInput letter="W" label="Workers" value={workers} onChange={setWorkers} />
        <ShopInput letter="D" label="Previous ID" value={prevId} onChange={setPrevId} />
        {mode === "labor" && (
          <>
            <ShopInput letter="V" label="Revision" value={revision} onChange={setRevision} />
            <ShopInput letter="R" label="Percent Today" value={percent} onChange={setPercent} />
          </>
        )}
        {mode === "saw" && (
          <>
            <ShopInput letter="G" label="Grade" value={grade} onChange={setGrade} />
            <ShopInput letter="H" label="Heat" value={heat} onChange={setHeat} />
          </>
        )}
        <SubmitButton label="Save action" busy={busy} disabled={!online} onClick={submit} />
        {notFound && (
          <EmptyState
            title="Entry not found"
            body="No piece matches that scan. Try SC-2847 or B-1042-A."
          />
        )}
        {result && (
          <ResultCard title="Piece">
            <ResultField label="Locn Pcs" value={result.locnPcs} />
            <ResultField label="Locn Wt" value={result.locnWt} />
            <ResultField label="Piecemark" value={result.piecemark} />
            {mode === "labor" && <ResultField label="Percent Complete" value={result.percentComplete} />}
            <ResultField label="Job #" value={result.jobNumber} />
            <ResultField label="Sequence #" value={result.sequence} />
            <ResultField label="Lot #" value={result.lot} />
            <ShopValueRow label="Prev Status">
              <StatusPill tone="accent">{result.prevStatus}</StatusPill>
            </ShopValueRow>
            <ResultField label="Prev Location" value={result.prevLocation} />
            <ResultField label="PcsW/Status" value={result.pcsWStatus} />
            <ResultField label="Item Weight" value={result.itemWeight} />
            <ResultField label="Item Length" value={result.itemLength} />
          </ResultCard>
        )}
      </div>
    </ShopKeyScope>
  );
}
