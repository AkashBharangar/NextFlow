import IORedis from "ioredis";

const IDEMPOTENCY_TTL_SECONDS = 60 * 60 * 24; // 24 hours

/**
 * Builds the idempotency key for a node execution attempt.
 * Format: idem:{runId}:{nodeId}:attempt:{attempt}
 */
export function buildIdempotencyKey(
  runId: string,
  nodeId: string,
  attempt: number,
): string {
  return `idem:${runId}:${nodeId}:attempt:${attempt}`;
}

/**
 * Returns the cached output if this exact attempt already succeeded.
 * Returns null if no cached result exists.
 */
export async function getCachedOutput(
  redis: IORedis,
  key: string,
): Promise<Record<string, unknown> | null> {
  const raw = await redis.get(key);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as Record<string, unknown>;
  } catch {
    return null;
  }
}

/**
 * Stores the output of a completed node execution in Redis.
 * Called after a node succeeds so retries can skip re-execution.
 */
export async function setCachedOutput(
  redis: IORedis,
  key: string,
  output: Record<string, unknown>,
): Promise<void> {
  await redis.set(key, JSON.stringify(output), "EX", IDEMPOTENCY_TTL_SECONDS);
}
const PENDING_COUNT_TTL_SECONDS = 60 * 60 * 2; // 2 hours

/**
 * Sets the pending node count for a run in Redis.
 * Called once when a run starts.
 */
export async function setPendingNodeCount(
  redis: IORedis,
  runId: string,
  count: number,
): Promise<void> {
  await redis.set(
    `pending:${runId}`,
    count,
    "EX",
    PENDING_COUNT_TTL_SECONDS,
  );
}

/**
 * Decrements the pending node count and returns the new value.
 * Returns null if the key does not exist.
 */
export async function decrementPendingNodeCount(
  redis: IORedis,
  runId: string,
): Promise<number | null> {
  const result = await redis.decr(`pending:${runId}`);
  return result;
}

/**
 * Deletes the pending node count key for a run.
 * Called when a run reaches a terminal state.
 */
export async function deletePendingNodeCount(
  redis: IORedis,
  runId: string,
): Promise<void> {
  await redis.del(`pending:${runId}`);
}