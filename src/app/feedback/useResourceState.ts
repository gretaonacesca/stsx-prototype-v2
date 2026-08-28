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
 */
export function useResourceState<T>(
  loader: () => Promise<T>,
  options: UseResourceStateOptions<T> = {},
) {
  const loaderRef = useRef(loader);
  loaderRef.current = loader;

  const [status, setStatus] = useState<ResourceStatus>("loading");
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<AppError | null>(null);
  const deps = options.deps ?? [];

  const load = useCallback(async () => {
    setStatus("loading");
    setError(null);
    try {
      if (options.simulateDelayMs) {
        await new Promise((r) => setTimeout(r, options.simulateDelayMs));
      }
      const result = await loaderRef.current();
      const empty = options.isEmpty?.(result) ?? false;
      setData(result);
      setStatus(empty ? "empty" : "ready");
      return result;
    } catch (err) {
      setError(normalizeError(err));
      setStatus("error");
      return null;
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps -- deps forwarded from caller
  }, [options.isEmpty, options.simulateDelayMs, ...deps]);

  useEffect(() => {
    void load();
  }, [load]);

  return { status, data, error, refetch: load };
}
