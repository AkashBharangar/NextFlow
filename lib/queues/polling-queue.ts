import { Queue } from "bullmq";
import IORedis from "ioredis";

const globalForPolling = globalThis as unknown as {
  pollingRedis?: IORedis;
  pollingQueue?: Queue;
};

export type PollingJobData = {
  runId: string;
  nodeId: string;
  nodeExecutionId: string;
  provider: string;
  model: string;
  externalId: string;
  pollAttempt: number;
  maxPollAttempts: number;
};

function getPollingRedis(): IORedis {
  const url = process.env.REDIS_URL?.trim();
  if (!url) throw new Error("REDIS_URL is not set");
  if (!globalForPolling.pollingRedis) {
    globalForPolling.pollingRedis = new IORedis(url, {
      maxRetriesPerRequest: null,
    });
  }
  return globalForPolling.pollingRedis;
}

export function getPollingQueue(): Queue<PollingJobData> {
  if (!globalForPolling.pollingQueue) {
    globalForPolling.pollingQueue = new Queue<PollingJobData>("polling-jobs", {
      connection: getPollingRedis(),
    });
  }
  return globalForPolling.pollingQueue;
}