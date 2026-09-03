import { useCallback, useEffect, useRef, useState } from "react";
import { normalizeError, type AppError } from "./normalizeError";

export type ResourceStatus = "loading" | "ready" | "error" | "empty";

export type UseResourceStateOptions<T> = {
  /** When true, empty arrays / null resolve as status "empty". */
  isEmpty?: (data: T) => boolean;
  /** Simulated fetch delay for prototype skeleton demos. */
  simulateDelayMs?: number;
  /** Re-run loader when these values change. */
  deps?: readonly unknown[];
};

/**
 * Wrap async data loaders for lists/widgets. Backend replaces loader with fetch.
 * Stable across parent re-renders — only reloads when `deps` change or refetch() is called.
 */
export function useResourceState<T>(
  loader: () => Promise<T>,
  options: UseResourceStateOptions<T> = {},
) {
  const loaderRef = useRef(loader);
  loaderRef.current = loader;
  const isEmptyRef = useRef(options.isEmpty);
  isEmptyRef.current = options.isEmpty;
  const delayRef = useRef(options.simulateDelayMs);
  delayRef.current = options.simulateDelayMs;

  const [status, setStatus] = useState<ResourceStatus>("loading");
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<AppError | null>(null);

  // Serialize deps so identity doesn't thrash when callers pass a new array literal.
  const depsKey = JSON.stringify(options.deps ?? []);

  const load = useCallback(async (opts?: { soft?: boolean }) => {
    // Soft refetch keeps prior content visible (no skeleton flash).
    if (!opts?.soft) setStatus("loading");
    setError(null);
    try {
      const ms = delayRef.current;
      if (ms) await new Promise((r) => setTimeout(r, ms));
      const result = await loaderRef.current();
      const empty = isEmptyRef.current?.(result) ?? false;
      setData(result);
      setStatus(empty ? "empty" : "ready");
      return result;
    } catch (err) {
      setError(normalizeError(err));
      setStatus("error");
      return null;
    }
  }, [depsKey]);

  useEffect(() => {
    void load();
  }, [load]);

  const refetch = useCallback(() => load({ soft: true }), [load]);

  return { status, data, error, refetch };
}
