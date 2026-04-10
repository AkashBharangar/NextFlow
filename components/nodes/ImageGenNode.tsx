"use client";

import { Handle, Position, type NodeProps } from "@xyflow/react";
import { useEffect, useState, useCallback } from "react";
import { useReactFlow } from "@xyflow/react";
import {
  nodeStatusBorderClass,
  nodeStatusLabel,
} from "@/components/nodes/node-status-styles";
import { useWorkflowStore } from "@/store/workflow-store";

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null && !Array.isArray(v);
}

type ProviderOption = {
  slug: string;
  name: string;
  models: { id: string; label: string }[];
};

// Module-level cache so all nodes share one fetch per page load
let providersCache: ProviderOption[] | null = null;
let providersFetchPromise: Promise<ProviderOption[]> | null = null;

function fetchProviders(): Promise<ProviderOption[]> {
  if (providersCache) return Promise.resolve(providersCache);
  if (providersFetchPromise) return providersFetchPromise;
  providersFetchPromise = fetch("/api/providers")
    .then((r) => r.json())
    .then((data) => {
      providersCache = data as ProviderOption[];
      return providersCache;
    })
    .catch(() => {
      providersFetchPromise = null;
      return [] as ProviderOption[];
    });
  return providersFetchPromise;
}

export function ImageGenNode({ id, data }: NodeProps) {
  const status = useWorkflowStore((s) => s.nodeStatuses[id] ?? "idle");
  const { updateNodeData } = useReactFlow();

  const config = isRecord(data.config) ? data.config : {};

  const [providers, setProviders] = useState<ProviderOption[]>([]);
  const [selectedProvider, setSelectedProvider] = useState<string>(
    typeof config.provider === "string" && config.provider.trim()
      ? config.provider.trim()
      : "huggingface",
  );
  const [selectedModel, setSelectedModel] = useState<string>(
    typeof config.model === "string" && config.model.trim()
      ? config.model.trim()
      : "black-forest-labs/FLUX.1-schnell",
  );

  useEffect(() => {
    void fetchProviders().then((data) => {
      setProviders(data);
    });
  }, []);

  const currentProvider = providers.find((p) => p.slug === selectedProvider);
  const modelOptions = currentProvider?.models ?? [];

  const handleProviderChange = useCallback(
    (slug: string) => {
      setSelectedProvider(slug);
      // Reset model to first model of new provider
      const prov = providers.find((p) => p.slug === slug);
      const firstModel = prov?.models[0]?.id ?? "";
      setSelectedModel(firstModel);
      updateNodeData(id, {
        config: { ...config, provider: slug, model: firstModel },
      });
    },
    [id, config, providers, updateNodeData],
  );

  const handleModelChange = useCallback(
    (modelId: string) => {
      setSelectedModel(modelId);
      updateNodeData(id, {
        config: { ...config, provider: selectedProvider, model: modelId },
      });
    },
    [id, config, selectedProvider, updateNodeData],
  );

  const isRunning = status === "running" || status === "polling";

  return (
    <div
      className={`relative min-w-[220px] max-w-[300px] rounded-lg border-2 bg-zinc-900 p-3 pb-6 text-zinc-100 shadow-md ${nodeStatusBorderClass(status)}`}
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

      {/* Provider selector */}
      <div className="mb-2">
        <label className="mb-0.5 block text-[10px] font-medium text-zinc-500">
          Provider
        </label>
        <select
          disabled={isRunning || providers.length === 0}
          value={selectedProvider}
          onChange={(e) => handleProviderChange(e.target.value)}
          className="nodrag w-full rounded border border-zinc-700 bg-zinc-950 px-2 py-1 text-xs text-zinc-200 focus:outline-none focus:ring-1 focus:ring-cyan-500 disabled:opacity-50"
        >
          {providers.length === 0 ? (
            <option value={selectedProvider}>{selectedProvider}</option>
          ) : (
            providers.map((p) => (
              <option key={p.slug} value={p.slug}>
                {p.name}
              </option>
            ))
          )}
        </select>
      </div>

      {/* Model selector */}
      <div>
        <label className="mb-0.5 block text-[10px] font-medium text-zinc-500">
          Model
        </label>
        <select
          disabled={isRunning || modelOptions.length === 0}
          value={selectedModel}
          onChange={(e) => handleModelChange(e.target.value)}
          className="nodrag w-full rounded border border-zinc-700 bg-zinc-950 px-2 py-1 text-xs text-zinc-200 focus:outline-none focus:ring-1 focus:ring-cyan-500 disabled:opacity-50"
        >
          {modelOptions.length === 0 ? (
            <option value={selectedModel}>{selectedModel}</option>
          ) : (
            modelOptions.map((m) => (
              <option key={m.id} value={m.id}>
                {m.label}
              </option>
            ))
          )}
        </select>
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