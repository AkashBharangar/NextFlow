"use client";

import { Handle, Position, type NodeProps } from "@xyflow/react";

import {
  nodeStatusBorderClass,
  nodeStatusLabel,
} from "@/components/nodes/node-status-styles";
import { useWorkflowStore } from "@/store/workflow-store";

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null && !Array.isArray(v);
}

export function OutputViewerNode({ id, data }: NodeProps) {
  const status = useWorkflowStore((s) => s.nodeStatuses[id] ?? "idle");

  const exec = isRecord(data.executionOutputs) ? data.executionOutputs : undefined;
  const rawOut = isRecord(data.outputs) ? data.outputs : undefined;

  const imageUrl =
    (exec?.image_url as string | undefined) ||
    (exec?.image as string | undefined) ||
    (rawOut?.image_url as string | undefined) ||
    (rawOut?.image as string | undefined) ||
    null;

  return (
    <div
      className={`relative min-w-[200px] max-w-[280px] rounded-lg border-2 bg-zinc-900 p-3 pb-6 text-zinc-100 shadow-md ${nodeStatusBorderClass(status)}`}
    >
      <span className="absolute right-2 top-2 rounded bg-zinc-800 px-1.5 py-0.5 text-[10px] font-medium uppercase text-zinc-400">
        {nodeStatusLabel(status)}
      </span>
      <Handle
        type="target"
        position={Position.Top}
        id="image"
        className="!h-3 !w-3 !border-2 !border-zinc-900 !bg-amber-500"
      />
      <div className="mb-2 text-xs font-semibold tracking-wide text-zinc-400">
        Output
      </div>
      {imageUrl ? (
        <img
          src={imageUrl}
          alt="Generated output"
          className="w-full rounded"
        />
      ) : status === "running" ? (
        <div className="h-32 w-full bg-gray-900 rounded flex items-center justify-center gap-2">
          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          <span className="text-gray-400 text-xs">Generating...</span>
        </div>
      ) : (
        <div className="h-32 w-full bg-gray-100 rounded flex items-center justify-center text-sm text-gray-400">
          No image
        </div>
      )}
    </div>
  );
}
