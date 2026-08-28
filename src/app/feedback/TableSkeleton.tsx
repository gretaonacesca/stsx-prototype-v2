import { Skeleton } from "../components/ui/skeleton";
import { C } from "../colorTokens";

export function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="flex flex-col gap-2 p-2" aria-busy aria-label="Loading table">
      {Array.from({ length: rows }, (_, i) => (
        <div
          key={i}
          className="flex items-center gap-2 px-2 py-2 rounded-md"
          style={{ background: C.surfaceAlt, border: `1px solid ${C.border}` }}
        >
          <Skeleton className="h-4 w-14 shrink-0" style={{ background: C.border }} />
          <Skeleton className="h-4 flex-1" style={{ background: C.border }} />
          <Skeleton className="h-4 w-16 shrink-0" style={{ background: C.border }} />
        </div>
      ))}
    </div>
  );
}
