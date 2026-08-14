import { useState } from "react";
import { toast } from "sonner";
import { lookupByEntry, type PieceRecord } from "./mock";

export function delay(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

export function useShopSave(onSaved?: (summary: string) => void) {
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<PieceRecord | null>(null);

  const save = async (entry: string, summary: (rec: PieceRecord) => string) => {
    if (!entry.trim()) {
      toast.error("Entry is required");
      return;
    }
    setBusy(true);
    await delay(300);
    const rec = lookupByEntry(entry);
    setResult(rec);
    setBusy(false);
    toast.success("Scan saved");
    onSaved?.(summary(rec));
  };

  return { busy, result, save };
}
