import { useState } from "react";
import { C } from "../colorTokens";
import { ScanBar } from "./components/ScanBar";
import { ShopInput } from "./components/ShopField";
import { ResultCard, ResultField } from "./components/ResultCard";
import { ModeChips, SubmitButton } from "./components/ModeChips";
import { useShopSave } from "./useShopSave";
import { StatusPill } from "../viz/chrome";

export type LogMode = "inspection" | "labor" | "saw" | "transaction";

const MODES: { id: LogMode; label: string }[] = [
  { id: "inspection", label: "Inspection" },
  { id: "labor", label: "Labor" },
  { id: "saw", label: "Saw" },
  { id: "transaction", label: "Transaction" },
];

export function LogActionPage({ onSaved }: { onSaved?: (summary: string) => void }) {
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
  const { busy, result, save } = useShopSave(onSaved);

  return (
    <div className="flex-1 min-h-0 flex flex-col overflow-hidden">
      <ScanBar value={entry} onChange={setEntry} />
      <div className="flex-1 overflow-y-auto px-3 py-3 flex flex-col gap-4">
        <ModeChips options={MODES} value={mode} onChange={setMode} />

        <div className="flex flex-col gap-3">
          <ShopInput label="Status / Station" value={station} onChange={setStation} />
          <ShopInput label="Location" value={location} onChange={setLocation} />
          <ShopInput label="Workers" value={workers} onChange={setWorkers} />
          <ShopInput label="Previous ID" value={prevId} onChange={setPrevId} />
          {mode === "labor" && (
            <>
              <ShopInput label="Revision" value={revision} onChange={setRevision} />
              <ShopInput label="Percent Today" value={percent} onChange={setPercent} />
            </>
          )}
          {mode === "saw" && (
            <>
              <ShopInput label="Grade" value={grade} onChange={setGrade} />
              <ShopInput label="Heat" value={heat} onChange={setHeat} />
            </>
          )}
        </div>

        <SubmitButton
          label="Save action"
          busy={busy}
          onClick={() => save(entry, (r) => `${MODES.find((m) => m.id === mode)?.label} · ${r.piecemark}`)}
        />

        {result && (
          <ResultCard title="Piece">
            <ResultField label="Locn Pcs" value={result.locnPcs} />
            <ResultField label="Locn Wt" value={result.locnWt} />
            <ResultField label="Piecemark" value={result.piecemark} />
            {mode === "labor" && <ResultField label="Percent Complete" value={result.percentComplete} />}
            <ResultField label="Job #" value={result.jobNumber} />
            <ResultField label="Sequence #" value={result.sequence} />
            <ResultField label="Lot #" value={result.lot} />
            <div className="flex flex-col gap-1">
              <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 12, fontWeight: 400, letterSpacing: "0.04em", textTransform: "uppercase", color: C.text }}>
                Prev Status
              </span>
              <StatusPill tone="accent">{result.prevStatus}</StatusPill>
            </div>
            <ResultField label="Prev Location" value={result.prevLocation} />
            <ResultField label="PcsW/Status" value={result.pcsWStatus} />
            <ResultField label="Item Weight" value={result.itemWeight} />
            <ResultField label="Item Length" value={result.itemLength} />
          </ResultCard>
        )}
      </div>
    </div>
  );
}
