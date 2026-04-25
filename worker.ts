import { config as loadEnv } from "dotenv";
import http from "http";
import { resolve } from "node:path";

import { Worker, type Job } from "bullmq";
import IORedis from "ioredis";
import * as Sentry from "@sentry/nextjs";

import { nodeHandlers as engineHandlers, runDAG } from "@/lib/engine/dag-runner";
import { registry as adapterRegistry } from "@/lib/adapters";
import { nodeHandlers as libHandlers } from "@/lib/handlers";
import { prisma } from "@/lib/prisma";
import { getPollingQueue, type PollingJobData } from "@/lib/queues/polling-queue";
import { parseWorkflowGraph } from "@/lib/services/execution-service";
import {
  buildIdempotencyKey,
  getCachedOutput,
  setCachedOutput,
  setPendingNodeCount,
  decrementPendingNodeCount,
  deletePendingNodeCount,
} from "@/lib/services/idempotency";
import { classifyError, isRetryable } from "@/lib/services/error-codes";
import { isStorageConfigured } from "@/lib/storage/cloudinary-client";
import { saveOutputToStorage } from "@/lib/storage/storage-service";

loadEnv({ path: resolve(process.cwd(), ".env") });
loadEnv({ path: resolve(process.cwd(), ".env.local"), override: true });

// ─── Redis connection ─────────────────────────────────────────────────────────

const redisUrl = process.env.REDIS_URL?.trim();
if (!redisUrl) {
  console.error("REDIS_URL is not set");
  process.exit(1);
}

const connection = new IORedis(redisUrl, {
  maxRetriesPerRequest: null,
});

const publisher = new IORedis(redisUrl, {
  maxRetriesPerRequest: null,
  retryStrategy: (times) => Math.min(times * 500, 5000),
  reconnectOnError: () => true,
  enableOfflineQueue: true,
});

async function publishRunEvent(
  runId: string,
  payload: Record<string, unknown>,
): Promise<void> {
  const channel = `run:${runId}:events`;
  await publisher
    .publish(channel, JSON.stringify(payload))
    .catch((e) => console.error("[worker] publish failed", e));
}

// ─── Register node handlers ───────────────────────────────────────────────────

for (const [type, fn] of Object.entries(libHandlers)) {
  engineHandlers.set(
    type,
    async (node, inputs, ctx, nodeExecutionId) => {
      const attempt = 1; // dag-runner wave attempt — BullMQ tracks job-level retries
      const idemKey = buildIdempotencyKey(ctx.runId, node.id, attempt);

      // Return cached output if this node already succeeded
      const cached = await getCachedOutput(connection, idemKey);
      if (cached) {
        console.log("[worker] idempotency cache hit", { nodeId: node.id, idemKey });
        await publishRunEvent(ctx.runId, {
          type: "node_update",
          nodeId: node.id,
          status: "success",
          outputs: cached,
        });
        return cached;
      }

      const output = await fn(node.config, inputs, {
        nodeExecutionId,
        runId: ctx.runId,
        nodeId: node.id,
      });

     // Cache the output so retries skip this node
     await setCachedOutput(connection, idemKey, output);

     // Decrement the Redis pending counter
     const remaining = await decrementPendingNodeCount(connection, ctx.runId);
     console.log("[worker] node complete", {
       nodeId: node.id,
       remainingNodes: remaining,
     });

     // Publish node completion event for SSE clients
     await publishRunEvent(ctx.runId, {
       type: "node_update",
       nodeId: node.id,
       status: "success",
       outputs: output,
     });

     // Stamp idempotency key on the NodeExecution row
     await prisma.nodeExecution.update({
       where: { id: nodeExecutionId },
       data: { idempotencyKey: idemKey },
     });

     return output;
    },
  );
}

// ─── Job data type ────────────────────────────────────────────────────────────

type JobData = { runId: string; workflowId: string };

// ─── Worker ───────────────────────────────────────────────────────────────────

const worker = new Worker<JobData>(
  "workflow-runs",
  async (job: Job<JobData>) => {
    const { runId } = job.data;

    const run = await prisma.workflowRun.findUnique({ where: { id: runId } });
    if (!run) throw new Error(`WorkflowRun not found: ${runId}`);

    await prisma.workflowRun.update({
      where: { id: runId },
      data: { status: "running", startedAt: new Date() },
    });

    const graph = parseWorkflowGraph(run.snapshotJson);

     // Initialise the Redis pending node counter before the DAG starts
     await setPendingNodeCount(connection, runId, graph.nodes.length);
     console.log("[worker] run started", {
       runId,
       totalNodes: graph.nodes.length,
     });

     await runDAG(graph.nodes, graph.edges, runId);

     // Clean up the Redis counter on success
     await deletePendingNodeCount(connection, runId);

     await prisma.workflowRun.update({
       where: { id: runId },
       data: { status: "success", finishedAt: new Date() },
     });
     await publishRunEvent(runId, { type: "run_update", status: "success" });
  },
  { connection },
);

// ─── Completed event ──────────────────────────────────────────────────────────

worker.on("completed", (job) => {
  console.log("[worker] job completed", job.id);
});

// ─── Failed event (fires on every failed attempt) ────────────────────────────

worker.on("failed", async (job, err) => {
  if (!job) return;

  const { runId } = job.data;
  const errorCode = classifyError(err);
  const isLastAttempt = job.attemptsMade >= (job.opts.attempts ?? 3);

  console.error("[worker] job failed", {
    jobId: job.id,
    runId,
    attempt: job.attemptsMade,
    errorCode,
    isLastAttempt,
    error: err.message,
  });

  Sentry.captureException(err, {
    tags: {
      jobId: job.id ?? "unknown",
      runId,
      errorCode,
      isLastAttempt: String(isLastAttempt),
    },
  });

  // On INVALID_INPUT: fail immediately, do not wait for max attempts
  const shouldMarkDead = isLastAttempt || !isRetryable(errorCode);

  if (shouldMarkDead) {
    console.error("[worker] marking run as permanently failed (dead)", { runId, errorCode });

     // Clean up the Redis counter on permanent failure
     await deletePendingNodeCount(connection, runId).catch(() => null);
    // Mark the WorkflowRun failed
    await prisma.workflowRun.update({
      where: { id: runId },
      data: { status: "failed", finishedAt: new Date() },
    }).catch((e) => console.error("[worker] failed to update WorkflowRun", e));
    await publishRunEvent(runId, { type: "run_update", status: "failed" });

    // Find the first failed node execution to anchor the dead-letter record
    const failedNode = await prisma.nodeExecution.findFirst({
      where: { runId, status: "failed" },
      orderBy: { startedAt: "asc" },
    }).catch(() => null);

    if (failedNode) {
      await prisma.jobQueue.upsert({
        where: { nodeExecutionId: failedNode.id },
        create: {
          nodeExecutionId: failedNode.id,
          status: "dead",
          attempt: job.attemptsMade,
          maxAttempts: job.opts.attempts ?? 3,
          errorCode,
          errorMessage: err.message,
          queuedAt: new Date(job.timestamp),
          completedAt: new Date(),
        },
        update: {
          status: "dead",
          attempt: job.attemptsMade,
          errorCode,
          errorMessage: err.message,
          completedAt: new Date(),
        },
      }).catch((e) => console.error("[worker] failed to write JobQueue dead entry", e));
    }

    // Mark all running NodeExecutions under this run as failed
    await prisma.nodeExecution.updateMany({
      where: { runId, status: "running" },
      data: {
        status: "failed",
        error: err.message,
        errorCode,
        finishedAt: new Date(),
      },
    }).catch((e) => console.error("[worker] failed to update NodeExecutions", e));
  } else {
    console.log("[worker] will retry", {
      runId,
      attempt: job.attemptsMade,
      nextAttemptIn: `~${Math.pow(2, job.attemptsMade) * 2}s`,
    });
  }
});

// ─── Polling worker (for async providers like Replicate) ─────────────────────

const pollingWorker = new Worker<PollingJobData>(
  "polling-jobs",
  async (job) => {
    const {
      runId,
      nodeId,
      nodeExecutionId,
      provider,
      model,
      externalId,
      pollAttempt,
      maxPollAttempts,
    } = job.data;

    console.log("[polling-worker] checking status", {
      provider,
      externalId,
      pollAttempt,
    });

    const adapter = adapterRegistry.get(provider);
    const status = await adapter.getStatus(externalId);

    // Still running — re-enqueue with delay if under the limit
    if (status === "running") {
      if (pollAttempt >= maxPollAttempts) {
        // Timeout — mark node and run as failed
        await prisma.nodeExecution.update({
          where: { id: nodeExecutionId },
          data: {
            status: "failed",
            error: `Polling timeout after ${maxPollAttempts} attempts`,
            errorCode: "TIMEOUT",
            finishedAt: new Date(),
          },
        });
        await prisma.workflowRun.update({
          where: { id: runId },
          data: { status: "failed", finishedAt: new Date() },
        });
        console.error("[polling-worker] timeout", { externalId, nodeId });
        Sentry.captureMessage(
          `Polling timeout after ${maxPollAttempts} attempts`,
          {
            level: "error",
            tags: { externalId, nodeId, runId, provider },
          },
        );
        return;
      }

      await getPollingQueue().add(
        "poll",
        { ...job.data, pollAttempt: pollAttempt + 1 },
        {
          delay: 5000,
          attempts: 1,
          removeOnComplete: { count: 100 },
          removeOnFail: { count: 100 },
        },
      );
      console.log("[polling-worker] still running, re-enqueued", {
        externalId,
        pollAttempt: pollAttempt + 1,
      });
      return;
    }

    // Failed at provider level
    if (status === "failed") {
      await prisma.nodeExecution.update({
        where: { id: nodeExecutionId },
        data: {
          status: "failed",
          error: `Provider reported failure for externalId: ${externalId}`,
          errorCode: "PROVIDER_ERROR",
          finishedAt: new Date(),
        },
      });
      await prisma.workflowRun.update({
        where: { id: runId },
        data: { status: "failed", finishedAt: new Date() },
      });
      console.error("[polling-worker] provider reported failure", { externalId });
      Sentry.captureMessage("Provider reported polling failure", {
        level: "error",
        tags: { externalId, nodeId, runId, provider },
      });
      return;
    }

    // Succeeded — fetch output, upload to storage, update DB
    const replicateAdapter = adapterRegistry.get(provider) as typeof adapter & {
      getOutput?: (id: string) => Promise<{ cdnUrl?: string; dataUri?: string; metadata?: Record<string, unknown> }>;
    };

    const rawOutput =
      typeof replicateAdapter.getOutput === "function"
        ? await replicateAdapter.getOutput(externalId)
        : adapter.formatOutput(null);

    let finalUrl: string | null = rawOutput.cdnUrl ?? null;

    // If the adapter returned a dataUri, upload it to Cloudinary
    if (!finalUrl && rawOutput.dataUri && isStorageConfigured()) {
      finalUrl = await saveOutputToStorage(
        nodeExecutionId,
        rawOutput.dataUri,
        runId,
        nodeId,
      );
    }

    // Write outputs back to the NodeExecution
    await prisma.nodeExecution.update({
      where: { id: nodeExecutionId },
      data: {
        status: "success",
        outputs: { image_url: finalUrl },
        finishedAt: new Date(),
        error: null,
      },
    });

    // Mark the WorkflowRun complete
    await prisma.workflowRun.update({
      where: { id: runId },
      data: { status: "success", finishedAt: new Date() },
    });
    await publishRunEvent(runId, {
      type: "node_update",
      nodeId,
      status: "success",
      outputs: { image_url: finalUrl },
    });
    await publishRunEvent(runId, { type: "run_update", status: "success" });

    console.log("[polling-worker] completed", { externalId, finalUrl });
  },
  { connection },
);

pollingWorker.on("completed", (job) => {
  console.log("[polling-worker] job completed", job.id);
});

pollingWorker.on("failed", (job, err) => {
  console.error("[polling-worker] job failed", job?.id, err.message);
  Sentry.captureException(err, {
    tags: { jobId: job?.id ?? "unknown" },
  });
});

console.log("[worker] listening on queue workflow-runs");

// ─── Health check server (keeps Render alive) ─────────────────────────────────

const PORT = Number(process.env.PORT) || 3001;

http
  .createServer((req, res) => {
    res.writeHead(200);
    res.end("worker ok");
  })
  .listen(PORT, "0.0.0.0", () => {
    console.log(`[worker] health check listening on port ${PORT}`);
  });