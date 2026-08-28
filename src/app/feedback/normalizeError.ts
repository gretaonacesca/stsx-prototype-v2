export type AppError = {
  code?: string;
  message: string;
};

/** Normalize thrown values into a consistent shape for UI feedback. */
export function normalizeError(err: unknown): AppError {
  if (err instanceof Error) {
    return { message: err.message, code: (err as Error & { code?: string }).code };
  }
  if (typeof err === "string") return { message: err };
  if (err && typeof err === "object" && "message" in err && typeof err.message === "string") {
    return {
      message: err.message,
      code: "code" in err && typeof err.code === "string" ? err.code : undefined,
    };
  }
  return { message: "Something went wrong. Please try again." };
}

export function delay(ms: number) {
  return new Promise<void>((r) => setTimeout(r, ms));
}
