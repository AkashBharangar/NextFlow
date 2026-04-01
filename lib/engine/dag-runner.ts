import type { Prisma } from "@prisma/client";

import { prisma } from "@/lib/prisma";
import type { GraphEdge, GraphNode } from "@/types/workflow";

export type ExecutionContext = {
  runId: string;
  outputs: Map<string, Record<string, unknown>>;
};

export type NodeHandler = (
  node: GraphNode,
  inputs: Record<string, unknown>,
  ctx: ExecutionContext,
) => Promise<Record<string, unknown>>;

/** Register handlers by `GraphNode.type` before running the DAG. */
export const nodeHandlers = new Map<string, NodeHandler>();

async function markNodeRunning(
  ctx: ExecutionContext,
  node: GraphNode,
  inputs: Record<string, unknown>,
): Promise<void> {
  const existing = await prisma.nodeExecution.findFirst({
    where: { runId: ctx.runId, nodeId: node.id },
  });

  if (existing) {
    await prisma.nodeExecution.update({
      where: { id: existing.id },
      data: {
        status: "running",
        startedAt: new Date(),
        nodeType: node.type,
        inputs: inputs as Prisma.InputJsonValue,
      },
    });
  } else {
    await prisma.nodeExecution.create({
      data: {
        runId: ctx.runId,
        nodeId: node.id,
        nodeType: node.type,
        status: "running",
        startedAt: new Date(),
        inputs: inputs as Prisma.InputJsonValue,
      },
    });
  }
}

async function markNodeComplete(
  node: GraphNode,
  ctx: ExecutionContext,
): Promise<void> {
  const outputs = ctx.outputs.get(node.id);
  const updated = await prisma.nodeExecution.updateMany({
    where: { runId: ctx.runId, nodeId: node.id },
    data: {
      status: "success",
      outputs: (outputs ?? {}) as Prisma.InputJsonValue,
      finishedAt: new Date(),
      error: null,
    },
  });

  if (updated.count === 0) {
    await prisma.nodeExecution.create({
      data: {
        runId: ctx.runId,
        nodeId: node.id,
        nodeType: node.type,
        status: "success",
        outputs: (outputs ?? {}) as Prisma.InputJsonValue,
        finishedAt: new Date(),
      },
    });
  }
}

async function markNodeFailed(
  ctx: ExecutionContext,
  node: GraphNode,
  error: unknown,
): Promise<void> {
  const message = error instanceof Error ? error.message : String(error);
  console.error("[dag-runner] markNodeFailed", {
    runId: ctx.runId,
    nodeId: node.id,
    error,
  });

  const updated = await prisma.nodeExecution.updateMany({
    where: { runId: ctx.runId, nodeId: node.id },
    data: {
      status: "failed",
      error: message,
      finishedAt: new Date(),
    },
  });

  if (updated.count === 0) {
    await prisma.nodeExecution.create({
      data: {
        runId: ctx.runId,
        nodeId: node.id,
        nodeType: node.type,
        status: "failed",
        error: message,
        finishedAt: new Date(),
      },
    });
  }
}

export async function executeNode(
  node: GraphNode,
  edges: GraphEdge[],
  ctx: ExecutionContext,
): Promise<void> {
  const inputs: Record<string, unknown> = {};
  for (const e of edges) {
    if (e.target !== node.id) continue;
    const upstream = ctx.outputs.get(e.source);
    inputs[e.targetHandle] = upstream?.[e.sourceHandle];
  }

  await markNodeRunning(ctx, node, inputs);

  const handler = nodeHandlers.get(node.type);
  if (!handler) {
    throw new Error(`No handler registered for node type: ${node.type}`);
  }

  const outputs = await handler(node, inputs, ctx);
  ctx.outputs.set(node.id, outputs);
  await markNodeComplete(node, ctx);
}

export async function runDAG(
  nodes: GraphNode[],
  edges: GraphEdge[],
  runId: string,
): Promise<void> {
  const nodeIds = new Set(nodes.map((n) => n.id));
  const inDegree = new Map<string, number>();
  const dependents = new Map<string, string[]>();

  for (const id of nodeIds) {
    inDegree.set(id, 0);
    dependents.set(id, []);
  }

  for (const e of edges) {
    if (!nodeIds.has(e.source) || !nodeIds.has(e.target)) continue;
    inDegree.set(e.target, (inDegree.get(e.target) ?? 0) + 1);
    dependents.get(e.source)!.push(e.target);
  }

  const idToNode = new Map(nodes.map((n) => [n.id, n] as const));
  let waveIds = [...nodeIds].filter((id) => inDegree.get(id) === 0);

  let processed = 0;
  const ctx: ExecutionContext = { runId, outputs: new Map() };

  while (waveIds.length > 0) {
    const waveNodes = waveIds.map((id) => idToNode.get(id)!);
    const results = await Promise.allSettled(
      waveNodes.map((node) => executeNode(node, edges, ctx)),
    );

    const failures: { node: GraphNode; reason: unknown }[] = [];
    for (let i = 0; i < results.length; i++) {
      const r = results[i]!;
      if (r.status === "rejected") {
        failures.push({ node: waveNodes[i]!, reason: r.reason });
      }
    }

    if (failures.length > 0) {
      for (const { node, reason } of failures) {
        await markNodeFailed(ctx, node, reason);
      }
      const first = failures[0]!.reason;
      throw first instanceof Error ? first : new Error(String(first));
    }

    processed += waveNodes.length;

    const nextWaveIds: string[] = [];
    for (const node of waveNodes) {
      for (const v of dependents.get(node.id) ?? []) {
        const next = (inDegree.get(v) ?? 0) - 1;
        inDegree.set(v, next);
        if (next === 0) {
          nextWaveIds.push(v);
        }
      }
    }
    waveIds = nextWaveIds;
  }

  if (processed !== nodes.length) {
    throw new Error("Cycle detected");
  }
}
