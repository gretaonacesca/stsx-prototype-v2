import type { ReactNode } from "react";
import { useResourceState } from "./useResourceState";
import { TableSkeleton } from "./TableSkeleton";
import { EmptyState } from "./EmptyState";
import { RetryBlock } from "./RetryBlock";

type WidgetResourceBodyProps<T> = {
  loader: () => Promise<T>;
  isEmpty?: (data: T) => boolean;
  simulateDelayMs?: number;
  deps?: readonly unknown[];
  emptyTitle: string;
  emptyBody: string;
  errorMessage?: string;
  children: (data: T) => ReactNode;
};

/** Dashboard widget wrapper — loading skeleton, empty, error retry, then content. */
export function WidgetResourceBody<T>({
  loader,
  isEmpty,
  simulateDelayMs = 400,
  deps,
  emptyTitle,
  emptyBody,
  errorMessage = "Could not load widget data.",
  children,
}: WidgetResourceBodyProps<T>) {
  const { status, data, refetch } = useResourceState(loader, { isEmpty, simulateDelayMs, deps });

  if (status === "loading") return <TableSkeleton rows={4} />;
  if (status === "error") {
    return <RetryBlock message={errorMessage} onRetry={() => void refetch()} />;
  }
  if (status === "empty") {
    return (
      <div className="p-3 h-full flex items-center justify-center">
        <EmptyState title={emptyTitle} body={emptyBody} />
      </div>
    );
  }
  if (data == null) return null;
  return <>{children(data)}</>;
}
