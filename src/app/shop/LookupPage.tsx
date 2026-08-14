import { useState } from "react";
import { toast } from "sonner";
import { C } from "../colorTokens";
import { ScanBar } from "./components/ScanBar";
import { ShopInput } from "./components/ShopField";
import { ResultCard, ResultField } from "./components/ResultCard";
import { SubmitButton } from "./components/ModeChips";
import { EmptyState } from "./components/EmptyState";
import { findPiece, type PieceRecord } from "./mock";
import { StatusPill } from "../viz/chrome";

export function LookupPage() {
  const [entry, setEntry] = useState("");
  const [job, setJob] = useState("");
  const [mark, setMark] = useState("");
  const [busy, setBusy] = useState(false);
  const [searched, setSearched] = useState(false);
  const [result, setResult] = useState<PieceRecord | null>(null);
  const [full, setFull] = useState(false);

  const submit = async () => {
    if (!entry.trim() && !job.trim() && !mark.trim()) {
      toast.error("Enter a barcode, job #, or piecemark");
      return;
    }
    setBusy(true);
    setFull(false);
    await new Promise((r) => setTimeout(r, 300));
    const rec = findPiece({ entry, jobNumber: job, piecemark: mark });
    setResult(rec);
    setSearched(true);
    setBusy(false);
    if (rec) toast.success("Piece found");
    else toast.error("No piece found");
  };

  return (
    <div className="flex-1 min-h-0 flex flex-col overflow-hidden">
      <ScanBar value={entry} onChange={setEntry} />
      <div className="flex-1 overflow-y-auto px-3 py-3 flex flex-col gap-4">
        <ShopInput label="Job Number" value={job} onChange={setJob} />
        <ShopInput label="Piecemark" value={mark} onChange={setMark} />
        <SubmitButton label="Look up" busy={busy} busyLabel="Looking…" onClick={submit} />

        {searched && !result && (
          <EmptyState title="No piece found" body="Try SC-2847, job 092356, or piecemark B-1042-A." />
        )}

        {result && (
          <>
            <ResultCard title={result.piecemark}>
              <ResultField label="Material" value={result.material} />
              <ResultField label="Qty" value={result.qty} />
              <ResultField label="Job #" value={result.jobNumber} />
              <ResultField label="Location" value={result.location} />
              <div className="flex flex-col gap-1">
                <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 12, fontWeight: 700, letterSpacing: "0.04em", textTransform: "uppercase", color: C.text }}>
                  Status
                </span>
                <StatusPill tone={result.onHold === "Yes" ? "warn" : "ok"}>
                  {result.onHold === "Yes" ? "On hold" : result.prevStatus}
                </StatusPill>
              </div>
              <ResultField label="Load Number" value={result.loadNumber} />
            </ResultCard>

            <button
              type="button"
              onClick={() => setFull((v) => !v)}
              className="self-start px-3 py-2 rounded-lg"
              style={{
                background: C.surface,
                border: `1.5px solid ${C.border}`,
                cursor: "pointer",
                fontFamily: "'Outfit', sans-serif",
                fontWeight: 700,
                fontSize: 14,
                color: C.text,
              }}
            >
              {full ? "Hide full history" : "View full history"}
            </button>

            {full && (
              <ResultCard title="History">
                <ResultField label="Item Length" value={result.itemLength} />
                <ResultField label="Bundled" value={result.bundled} />
                <ResultField label="Locn Pcs" value={result.locnPcs} />
                <ResultField label="Locn Wt" value={result.locnWt} />
                <ResultField label="Width" value={result.width} />
                <ResultField label="Wt" value={result.wt} />
                <ResultField label="Grade" value={result.grade} />
                <ResultField label="Heat" value={result.heat} />
                <ResultField label="PO Number" value={result.poNumber} />
                <ResultField label="Division" value={result.division} />
                <ResultField label="Route code" value={result.route} />
                <ResultField label="Lot Number" value={result.lot} />
                <ResultField label="Sheet Number" value={result.sheet} />
                <ResultField label="Finish" value={result.finish} />
                <ResultField label="Create Date" value={result.createDate} />
                <ResultField label="On Hold Flag" value={result.onHold} />
                <ResultField label="On Hold Date" value={result.onHoldDate} />
                <ResultField label="Off Hold Date" value={result.offHoldDate} />
              </ResultCard>
            )}
          </>
        )}
      </div>
    </div>
  );
}
