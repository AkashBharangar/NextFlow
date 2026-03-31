import { config as loadEnv } from "dotenv";
import { Worker } from "bullmq";
import IORedis from "ioredis";
import { resolve } from "node:path";

import { nodeHandlers as engineHandlers, runDAG } from "@/lib/engine/dag-runner";
import { nodeHandlers as libHandlers } from "@/lib/handlers";
import { prisma } from "@/lib/prisma";
import { parseWorkflowGraph } from "@/lib/services/execution-service";

loadEnv({ path: resolve(process.cwd(), ".env") });
loadEnv({ path: resolve(process.cwd(), ".env.local"), override: true });

for (const [type, fn] of Object.entries(libHandlers)) {
  engineHandlers.set(type, async (node, inputs, _ctx) => fn(node.config, inputs));
}

const redisUrl = process.env.REDIS_URL?.trim();
if (!redisUrl) {
  console.error("REDIS_URL is not set");
  process.exit(1);
}

type JobData = { runId: string; workflowId: string };

const connection = new IORedis(redisUrl, {
  maxRetriesPerRequest: null,
});

const worker = new Worker<JobData>(
  "workflow-runs",
  async (job) => {
    const { runId } = job.data;

    const run = await prisma.workflowRun.findUnique({
      where: { id: runId },
    });

    if (!run) {
      throw new Error(`WorkflowRun not found: ${runId}`);
    }

    await prisma.workflowRun.update({
      where: { id: runId },
      data: {
        status: "running",
        startedAt: new Date(),
      },
    });

    try {
      const graph = parseWorkflowGraph(run.snapshotJson);
      await runDAG(graph.nodes, graph.edges, runId);

      await prisma.workflowRun.update({
        where: { id: runId },
        data: {
          status: "success",
          finishedAt: new Date(),
        },
      });
    } catch (e) {
      console.error("[worker] workflow run failed", { runId, error: e });
      await prisma.workflowRun.update({
        where: { id: runId },
        data: {
          status: "failed",
          finishedAt: new Date(),
        },
      });
    }
  },
  { connection },
);

worker.on("completed", (job) => {
  console.log("[worker] job completed", job.id);
});

worker.on("failed", (job, err) => {
  console.error("[worker] job failed", job?.id, err);
});

console.log("[worker] listening on queue workflow-runs");
