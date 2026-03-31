import type { WorkflowGraph } from "@/types/workflow";

function detectCycle(graph: WorkflowGraph): boolean {
  const nodeIds = new Set(graph.nodes.map((n) => n.id));
  const inDegree = new Map<string, number>();
  const adj = new Map<string, string[]>();

  for (const id of nodeIds) {
    inDegree.set(id, 0);
    adj.set(id, []);
  }

  for (const e of graph.edges) {
    if (!nodeIds.has(e.source) || !nodeIds.has(e.target)) {
      continue;
    }
    adj.get(e.source)!.push(e.target);
    inDegree.set(e.target, (inDegree.get(e.target) ?? 0) + 1);
  }

  const queue: string[] = [];
  for (const id of nodeIds) {
    if (inDegree.get(id) === 0) {
      queue.push(id);
    }
  }

  let processed = 0;
  while (queue.length > 0) {
    const u = queue.shift()!;
    processed++;
    for (const v of adj.get(u) ?? []) {
      const next = (inDegree.get(v) ?? 0) - 1;
      inDegree.set(v, next);
      if (next === 0) {
        queue.push(v);
      }
    }
  }

  return processed !== nodeIds.size;
}

function typeCheckErrors(graph: WorkflowGraph): string[] {
  const errors: string[] = [];
  const nodeById = new Map(graph.nodes.map((n) => [n.id, n]));

  for (const e of graph.edges) {
    const sourceNode = nodeById.get(e.source);
    const targetNode = nodeById.get(e.target);
    const outPort = sourceNode?.outputs.find((p) => p.handle === e.sourceHandle);
    const inPort = targetNode?.inputs.find((p) => p.handle === e.targetHandle);

    const outLabel = outPort?.type
      ? outPort.type
      : sourceNode
        ? `missing port '${e.sourceHandle}'`
        : "node not found";

    const inLabel = inPort?.type
      ? inPort.type
      : targetNode
        ? `missing port '${e.targetHandle}'`
        : "node not found";

    const ok =
      sourceNode !== undefined &&
      targetNode !== undefined &&
      outPort !== undefined &&
      inPort !== undefined &&
      outPort.type === inPort.type;

    if (!ok) {
      errors.push(
        `Type mismatch: node ${e.source} output ${outLabel} cannot connect to node ${e.target} input ${inLabel}`,
      );
    }
  }

  return errors;
}

export function validateDAG(graph: WorkflowGraph): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (detectCycle(graph)) {
    errors.push("Graph contains a cycle");
  }

  errors.push(...typeCheckErrors(graph));

  return { valid: errors.length === 0, errors };
}
