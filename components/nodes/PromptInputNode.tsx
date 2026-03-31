"use client";

import { Handle, Position, useReactFlow, type NodeProps } from "@xyflow/react";

import {
  nodeStatusBorderClass,
  nodeStatusLabel,
} from "@/components/nodes/node-status-styles";
import { useWorkflowStore } from "@/store/workflow-store";

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null && !Array.isArray(v);
}

export function PromptInputNode({ id, data }: NodeProps) {
  const { updateNodeData } = useReactFlow();
  const status = useWorkflowStore((s) => s.nodeStatuses[id] ?? "idle");
  const config = isRecord(data.config) ? data.config : {};
  const value =
    typeof config.value === "string" ? config.value : String(config.value ?? "");

  return (
    <div
      className={`relative min-w-[200px] max-w-[280px] rounded-lg border-2 bg-zinc-900 p-3 text-zinc-100 shadow-md ${nodeStatusBorderClass(status)}`}
    >
      <span className="absolute right-2 top-2 rounded bg-zinc-800 px-1.5 py-0.5 text-[10px] font-medium uppercase text-zinc-400">
        {nodeStatusLabel(status)}
      </span>
      <div className="mb-2 text-xs font-semibold tracking-wide text-zinc-400">
        Prompt input
      </div>
      <textarea
        className="nodrag nopan w-full resize-y rounded border border-zinc-700 bg-zinc-950 px-2 py-1.5 text-sm text-zinc-100 outline-none focus:border-zinc-500"
        rows={4}
        value={value}
        onChange={(e) => {
          const next = e.target.value;
          updateNodeData(id, (node) => {
            const prevConfig = isRecord(node.data.config) ? node.data.config : {};
            return {
              config: { ...prevConfig, value: next },
            };
          });
        }}
      />
      <Handle
        type="source"
        position={Position.Bottom}
        id="prompt"
        className="!h-3 !w-3 !border-2 !border-zinc-900 !bg-cyan-500"
      />
    </div>
  );
}
