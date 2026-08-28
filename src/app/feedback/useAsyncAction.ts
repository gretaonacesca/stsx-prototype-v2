import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { normalizeError, type AppError } from "./normalizeError";

export type AsyncStatus = "idle" | "loading" | "success" | "error";

export type UseAsyncActionOptions<T> = {
  onSuccess?: (data: T) => void;
  onError?: (error: AppError) => void;
  successMessage?: string;
  errorMessage?: string;
  /** Auto-reset success/error back to idle after ms. */
  resetMs?: number;
  toastSuccess?: boolean;
  toastError?: boolean;
};

/**
 * Wrap async mutations. Pass a Promise-returning fn — swap mock for API calls later.
 */
export function useAsyncAction<T, A extends unknown[] = []>(
  fn: (...args: A) => Promise<T>,
  options: UseAsyncActionOptions<T> = {},
) {
  const fnRef = useRef(fn);
  fnRef.current = fn;

  const [status, setStatus] = useState<AsyncStatus>("idle");
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<AppError | null>(null);
  const resetTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => {
    if (resetTimer.current) clearTimeout(resetTimer.current);
  }, []);

  const reset = useCallback(() => {
    setStatus("idle");
    setError(null);
  }, []);

  const run = useCallback(async (...args: A) => {
    if (resetTimer.current) clearTimeout(resetTimer.current);
    setStatus("loading");
    setError(null);
    try {
      const result = await fnRef.current(...args);
      setData(result);
      setStatus("success");
      options.onSuccess?.(result);
      if (options.toastSuccess !== false && options.successMessage) {
        toast.success(options.successMessage);
      }
      if (options.resetMs) {
        resetTimer.current = setTimeout(reset, options.resetMs);
      }
      return result;
    } catch (err) {
      const normalized = normalizeError(err);
      setError(normalized);
      setStatus("error");
      options.onError?.(normalized);
      const msg = options.errorMessage ?? normalized.message;
      if (options.toastError !== false) toast.error(msg);
      throw normalized;
    }
  }, [options, reset]);

  return {
    run,
    status,
    data,
    error,
    busy: status === "loading",
    reset,
  };
}
