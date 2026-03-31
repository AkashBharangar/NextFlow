"use client";

import { useReactFlow } from "@xyflow/react";
import { useEffect, useRef } from "react";
import toast from "react-hot-toast";

import { useWorkflowStore } from "@/store/workflow-store";

function mapExecutionStatus(
  dbStatus: string,
): "idle" | "running" | "success" | "error" {
  if (dbStatus === "success") return "success";
  if (dbStatus === "failed") return "error";
  return "running";
}

type ApiRun = {
  status?: string;
  nodeExecutions?: {
    nodeId: string;
    status: string;
    outputs?: unknown;
    error?: string | null;
  }[];
};

export function useRunPoller(runId: string | null) {
  const { updateNodeData } = useReactFlow();
  const setRunId = useWorkflowStore((s) => s.setRunId);
  const setNodeStatus = useWorkflowStore((s) => s.setNodeStatus);

  const updateNodeDataRef = useRef(updateNodeData);
  useEffect(() => {
    updateNodeDataRef.current = updateNodeData;
  }, [updateNodeData]);

  const lastRunToastStatusRef = useRef<string | null>(null);
  const toastedNodeFailuresRef = useRef<Set<string>>(new Set());
  useEffect(() => {
    // Reset per-run toast tracking when run changes/clears.
    lastRunToastStatusRef.current = null;
    toastedNodeFailuresRef.current = new Set();
  }, [runId]);

  useEffect(() => {
    if (!runId) return;

    let cancelled = false;
    let intervalId: ReturnType<typeof setInterval> | null = null;

    const clearTimer = () => {
      if (intervalId !== null) {
        clearInterval(intervalId);
        intervalId = null;
      }
    };

    const poll = async () => {
      if (cancelled) return;
      try {
        const res = await fetch(`/api/runs/${runId}`);
        if (!res.ok || cancelled) return;
        const run = (await res.json()) as ApiRun;

        const execs = run.nodeExecutions ?? [];
        for (const ex of execs) {
          setNodeStatus(ex.nodeId, mapExecutionStatus(ex.status));
          if (ex.status === "failed" && typeof ex.error === "string" && ex.error.trim().length > 0) {
            const key = `${runId}:${ex.nodeId}:${ex.error}`;
            if (!toastedNodeFailuresRef.current.has(key)) {
              toastedNodeFailuresRef.current.add(key);
              toast.error(`Node failed: ${ex.error}`, { duration: 6000 });
            }
          }
          if (ex.status === "success") {
            // eslint-disable-next-line no-console
            console.log("[poller] node outputs", ex.nodeId, ex.outputs);
            updateNodeDataRef.current(ex.nodeId, {
              executionOutputs: ex.outputs as Record<string, unknown> | null | undefined,
            });
          }
        }

        if (run.status === "success" && lastRunToastStatusRef.current !== "success") {
          lastRunToastStatusRef.current = "success";
          toast.success("Workflow complete");
        }
        if (run.status === "failed" && lastRunToastStatusRef.current !== "failed") {
          lastRunToastStatusRef.current = "failed";
          toast.error("Workflow run failed");
        }

        if (run.status === "success" || run.status === "failed") {
          cancelled = true;
          clearTimer();
          setRunId(null);
        }
      } catch {
        /* retry on next interval */
      }
    };

    void poll();
    intervalId = setInterval(poll, 2000);

    return () => {
      cancelled = true;
      clearTimer();
    };
  }, [runId, setRunId, setNodeStatus]);
}
