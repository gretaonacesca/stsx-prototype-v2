import { useState } from "react";
import { toast } from "sonner";
import { delay, useAsyncAction } from "../feedback";
import { lookupByEntry, type PieceRecord } from "./mock";

export function useShopSave(onSaved?: (summary: string) => void) {
  const [result, setResult] = useState<PieceRecord | null>(null);
  const [notFound, setNotFound] = useState(false);

  const { run, busy } = useAsyncAction(
    async (entry: string, summary: (rec: PieceRecord) => string) => {
      if (!entry.trim()) {
        toast.error("Entry is required");
        throw new Error("Entry is required");
      }
      await delay(300);
      const rec = lookupByEntry(entry);
      if (!rec) {
        setNotFound(true);
        setResult(null);
        toast.error("Entry not found");
        throw new Error("Entry not found");
      }
      setNotFound(false);
      setResult(rec);
      toast.success("Scan saved");
      onSaved?.(summary(rec));
      return rec;
    },
    { toastError: false, toastSuccess: false },
  );

  const save = (entry: string, summary: (rec: PieceRecord) => string) =>
    run(entry, summary).catch(() => undefined);

  return { busy, result, notFound, save };
}
