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

export function ImageGenNode({ id, data }: NodeProps) {
  const status = useWorkflowStore((s) => s.nodeStatuses[id] ?? "idle");
  const config = isRecord(data.config) ? data.config : {};
  const model =
    typeof config.model === "string" && config.model.length > 0
      ? config.model
      : "—";

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
        id="prompt"
        className="!h-3 !w-3 !border-2 !border-zinc-900 !bg-amber-500"
      />
      <div className="mb-2 mt-1 text-xs font-semibold tracking-wide text-zinc-400">
        Image generator
      </div>
      <div className="rounded border border-zinc-700 bg-zinc-950 px-2 py-1.5 text-xs text-zinc-300">
        <span className="text-zinc-500">Model</span>
        <div className="mt-0.5 font-mono text-[11px] text-zinc-200">{model}</div>
      </div>
      <Handle
        type="source"
        position={Position.Bottom}
        id="image_url"
        className="!h-3 !w-3 !border-2 !border-zinc-900 !bg-cyan-500"
      />
    </div>
  );
}
