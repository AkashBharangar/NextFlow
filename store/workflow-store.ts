import type { Edge, Node } from "@xyflow/react";
import { create } from "zustand";

export type NodeRuntimeStatus = "idle" | "running" | "success" | "error" | "polling";

type WorkflowStore = {
  nodes: Node[];
  edges: Edge[];
  workflowId: string | null;
  workflowName: string;
  runId: string | null;
  nodeStatuses: Record<string, NodeRuntimeStatus>;
  setNodes: (nodes: Node[] | ((prev: Node[]) => Node[])) => void;
  setEdges: (edges: Edge[] | ((prev: Edge[]) => Edge[])) => void;
  setWorkflowId: (id: string | null) => void;
  setWorkflowName: (name: string) => void;
  setRunId: (id: string | null) => void;
  setNodeStatus: (nodeId: string, status: NodeRuntimeStatus) => void;
};

export const useWorkflowStore = create<WorkflowStore>((set) => ({
  nodes: [],
  edges: [],
  workflowId: null,
  workflowName: "",
  runId: null,
  nodeStatuses: {},
  setNodes: (next) =>
    set((s) => ({
      nodes: typeof next === "function" ? next(s.nodes) : next,
    })),
  setEdges: (next) =>
    set((s) => ({
      edges: typeof next === "function" ? next(s.edges) : next,
    })),
  setWorkflowId: (workflowId) => set({ workflowId }),
  setWorkflowName: (workflowName) => set({ workflowName }),
  setRunId: (runId) => set({ runId }),
  setNodeStatus: (nodeId, status) =>
    set((s) => ({
      nodeStatuses: { ...s.nodeStatuses, [nodeId]: status },
    })),
}));
