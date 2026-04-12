import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

/**
 * Single shared Redis client for rate limiting.
 * Uses the same REDIS_URL as BullMQ but via the Upstash REST client
 * which works correctly in both Node.js and Edge runtimes.
 */
function getRateLimitRedis(): Redis {
  const url = process.env.UPSTASH_REDIS_REST_URL?.trim();
  const token = process.env.UPSTASH_REDIS_REST_TOKEN?.trim();

  if (!url || !token) {
    throw new Error(
      "UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN must be set for rate limiting",
    );
  }

  return new Redis({ url, token });
}

/**
 * 5 workflow runs per user per 60 seconds.
 * Adjust the values here as your pricing model evolves.
 */
export function getRunRateLimiter(): Ratelimit {
  return new Ratelimit({
    redis: getRateLimitRedis(),
    limiter: Ratelimit.slidingWindow(5, "60 s"),
    prefix: "rl:run",
    analytics: false,
  });
}

/**
 * 20 workflow create/save operations per user per 60 seconds.
 */
export function getWorkflowRateLimiter(): Ratelimit {
  return new Ratelimit({
    redis: getRateLimitRedis(),
    limiter: Ratelimit.slidingWindow(20, "60 s"),
    prefix: "rl:workflow",
    analytics: false,
  });
}