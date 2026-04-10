import { Prisma } from "@prisma/client";
import { Queue } from "bullmq";
import IORedis from "ioredis";

import { prisma } from "@/lib/prisma";
import { validateDAG } from "@/lib/validators/dag-validator";
import type { GraphEdge, GraphNode, WorkflowGraph } from "@/types/workflow";

export function parseWorkflowGraph(json: unknown): WorkflowGraph {
  if (typeof json !== "object" || json === null || Array.isArray(json)) {
    throw new Error("Invalid workflow graph: root must be a plain object");
  }
  const o = json as Record<string, unknown>;
  if (!Array.isArray(o.nodes) || !Array.isArray(o.edges)) {
    throw new Error("Invalid workflow graph: nodes and edges must be arrays");
  }
  return {
    nodes: o.nodes as GraphNode[],
    edges: o.edges as GraphEdge[],
  };
}

const globalForBull = globalThis as unknown as {
  workflowRunsRedis?: IORedis;
  workflowRunsQueue?: Queue;
};

function getWorkflowRunsRedis(): IORedis {
  const url = process.env.REDIS_URL?.trim();
  if (!url) {
    throw new Error("REDIS_URL is not set");
  }
  if (!globalForBull.workflowRunsRedis) {
    globalForBull.workflowRunsRedis = new IORedis(url, {
      maxRetriesPerRequest: null,
    });
  }
  return globalForBull.workflowRunsRedis;
}

function getWorkflowRunsQueue(): Queue {
  if (!globalForBull.workflowRunsQueue) {
    globalForBull.workflowRunsQueue = new Queue("workflow-runs", {
      connection: getWorkflowRunsRedis(),
    });
  }
  return globalForBull.workflowRunsQueue;
}

export async function triggerRun(workflowId: string): Promise<string> {
  const workflow = await prisma.workflow.findUnique({
    where: { id: workflowId },
  });

  if (!workflow) {
    throw new Error("Workflow not found");
  }

  const graph = parseWorkflowGraph(workflow.graphJson);
  const { valid, errors } = validateDAG(graph);
  if (!valid) {
    throw new Error(errors.join("; "));
  }

  const run = await prisma.workflowRun.create({
    data: {
      workflowId,
      status: "pending",
      snapshotJson: workflow.graphJson as Prisma.InputJsonValue,
    },
  });

  const queue = getWorkflowRunsQueue();
  await queue.add(
    "workflow-run",
    { runId: run.id, workflowId },
    {
      attempts: 3,
      backoff: {
        type: "exponential",
        delay: 2000,
      },
      removeOnComplete: { count: 100 },
      removeOnFail: { count: 200 },
    },
  );

  return run.id;
}
