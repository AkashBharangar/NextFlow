"use client";

import { useEffect, useRef } from "react";
import { useReactFlow } from "@xyflow/react";
import toast from "react-hot-toast";
import { useWorkflowStore } from "@/store/workflow-store";
import type { NodeRuntimeStatus } from "@/store/workflow-store";

function mapStatus(dbStatus: string): NodeRuntimeStatus {
  if (dbStatus === "polling") return "polling";
  if (dbStatus === "success") return "success";
  if (dbStatus === "failed") return "error";
  return "running";
}

type NodeExecution = {
  nodeId: string;
  status: string;
  outputs?: unknown;
  error?: string | null;
  errorCode?: string | null;
};

type SSEEvent =
  | {
      type: "snapshot";
      run: {
        status: string;
        nodeExecutions: NodeExecution[];
      };
    }
  | {
      type: "node_update";
      nodeId: string;
      status: string;
      outputs?: unknown;
    }
  | {
      type: "run_update";
      status: string;
    };

export function useRunStream(runId: string | null) {
  const { updateNodeData } = useReactFlow();
  const setRunId = useWorkflowStore((s) => s.setRunId);
  const setNodeStatus = useWorkflowStore((s) => s.setNodeStatus);

  const updateNodeDataRef = useRef(updateNodeData);
  useEffect(() => {
    updateNodeDataRef.current = updateNodeData;
  }, [updateNodeData]);

  const lastRunToastRef = useRef<string | null>(null);
  const toastedNodeFailuresRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    lastRunToastRef.current = null;
    toastedNodeFailuresRef.current = new Set();
  }, [runId]);

  useEffect(() => {
    if (!runId) return;

    let es: EventSource | null = null;
    let closed = false;

    const close = () => {
      if (closed) return;
      closed = true;
      es?.close();
      setRunId(null);
    };

    const handleNodeExecution = (ex: NodeExecution) => {
      setNodeStatus(ex.nodeId, mapStatus(ex.status));

      if (
        ex.status === "failed" &&
        typeof ex.error === "string" &&
        ex.error.trim().length > 0
      ) {
        const key = `${runId}:${ex.nodeId}:${ex.error}`;
        if (!toastedNodeFailuresRef.current.has(key)) {
          toastedNodeFailuresRef.current.add(key);
          toast.error(`Node failed: ${ex.error}`, { duration: 6000 });
        }
      }

      if (ex.status === "success" && ex.outputs) {
        updateNodeDataRef.current(ex.nodeId, {
          executionOutputs: ex.outputs as Record<string, unknown>,
        });
      }
    };

    es = new EventSource(`/api/runs/${runId}/stream`);

    es.onmessage = (event: MessageEvent<string>) => {
      if (closed) return;
      try {
        const payload = JSON.parse(event.data) as SSEEvent;

        if (payload.type === "snapshot") {
          for (const ex of payload.run.nodeExecutions) {
            handleNodeExecution(ex);
          }
          // If run is already terminal on first snapshot, close immediately
          const isTerminal =
            payload.run.status === "success" ||
            payload.run.status === "failed" ||
            payload.run.status === "cancelled";
          const hasPolling = payload.run.nodeExecutions.some(
            (n) => n.status === "polling",
          );
          if (isTerminal && !hasPolling) {
            if (payload.run.status === "success") {
              toast.success("Workflow complete");
            }
            close();
          }
        }

        if (payload.type === "node_update") {
          handleNodeExecution({
            nodeId: payload.nodeId,
            status: payload.status,
            outputs: payload.outputs,
          });
        }

        if (payload.type === "run_update") {
          if (
            payload.status === "success" &&
            lastRunToastRef.current !== "success"
          ) {
            lastRunToastRef.current = "success";
            toast.success("Workflow complete");
          }
          if (
            payload.status === "failed" &&
            lastRunToastRef.current !== "failed"
          ) {
            lastRunToastRef.current = "failed";
            toast.error("Workflow run failed");
          }
          const isTerminal =
            payload.status === "success" ||
            payload.status === "failed" ||
            payload.status === "cancelled";
          if (isTerminal) {
            close();
          }
        }
      } catch {
        // Malformed event — ignore
      }
    };

    es.onerror = () => {
      if (closed) return;
      // EventSource auto-reconnects — only close on explicit terminal events
      console.warn("[useRunStream] SSE connection error, will auto-reconnect");
    };

    return () => {
      close();
    };
  }, [runId, setRunId, setNodeStatus]);
}