import type { Edge, Node } from "@xyflow/react";

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null && !Array.isArray(v);
}

/** Persisted graph shape (matches `types/workflow` + API expectations). */
export type SerializedWorkflowGraph = {
  nodes: Record<string, unknown>[];
  edges: Record<string, unknown>[];
};

export function serializeWorkflowGraph(
  nodes: Node[],
  edges: Edge[],
): SerializedWorkflowGraph {
  const sn = nodes.map((node) => {
    const d = node.data as Record<string, unknown> | null | undefined;
    const workflowType =
      typeof d?.workflowType === "string" && d.workflowType.length > 0
        ? d.workflowType
        : typeof node.type === "string" && node.type !== "default"
          ? node.type
          : "default";

    const config =
      d?.config &&
      typeof d.config === "object" &&
      !Array.isArray(d.config) &&
      !(d.config instanceof Date)
        ? (d.config as Record<string, unknown>)
        : {};

    const inputs = Array.isArray(d?.inputs) ? d.inputs : [];
    const outputs = Array.isArray(d?.outputs) ? d.outputs : [];
    const executionOutputs = isRecord(d?.executionOutputs)
      ? d.executionOutputs
      : undefined;

    return {
      id: node.id,
      type: workflowType,
      position: { x: node.position.x, y: node.position.y },
      config,
      inputs,
      outputs,
      ...(executionOutputs ? { executionOutputs } : {}),
    };
  });

  const se = edges.map((e) => ({
    id: e.id,
    source: e.source,
    target: e.target,
    sourceHandle: e.sourceHandle ?? "",
    targetHandle: e.targetHandle ?? "",
  }));

  return { nodes: sn, edges: se };
}
