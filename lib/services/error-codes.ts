export type JobErrorCode =
  | "RATE_LIMIT"
  | "TIMEOUT"
  | "INVALID_INPUT"
  | "PROVIDER_ERROR"
  | "UNKNOWN";

/**
 * Classifies an error into a JobErrorCode.
 * INVALID_INPUT errors are not retried — all others are.
 */
export function classifyError(error: unknown): JobErrorCode {
  const message =
    error instanceof Error ? error.message.toLowerCase() : String(error).toLowerCase();

  if (
    message.includes("429") ||
    message.includes("rate limit") ||
    message.includes("too many requests")
  ) {
    return "RATE_LIMIT";
  }

  if (
    message.includes("timeout") ||
    message.includes("timed out") ||
    message.includes("econnreset") ||
    message.includes("socket hang up")
  ) {
    return "TIMEOUT";
  }

  if (
    message.includes("invalid input") ||
    message.includes("non-empty") ||
    message.includes("requires a") ||
    message.includes("must be a")
  ) {
    return "INVALID_INPUT";
  }

  if (
    message.includes("inference failed") ||
    message.includes("provider") ||
    message.includes("huggingface") ||
    message.includes("replicate") ||
    message.includes("cloudinary")
  ) {
    return "PROVIDER_ERROR";
  }

  return "UNKNOWN";
}

/**
 * Returns true if the error should be retried.
 * INVALID_INPUT always fails immediately — no point retrying.
 */
export function isRetryable(code: JobErrorCode): boolean {
  return code !== "INVALID_INPUT";
}