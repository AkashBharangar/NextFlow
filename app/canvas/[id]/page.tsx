"use client";

import {
  addEdge,
  applyEdgeChanges,
  applyNodeChanges,
  Background,
  Controls,
  type Connection,
  Panel,
  ReactFlow,
  ReactFlowProvider,
  type Edge,
  type IsValidConnection,
  type EdgeChange,
  type Node,
  type NodeChange,
  type NodeProps,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useParams } from "next/navigation";

import { ImageGenNode } from "@/components/nodes/ImageGenNode";
import {
  nodeStatusBorderClass,
  nodeStatusLabel,
} from "@/components/nodes/node-status-styles";
import { OutputViewerNode } from "@/components/nodes/OutputViewerNode";
import { PromptInputNode } from "@/components/nodes/PromptInputNode";
import { useRunStream } from "@/hooks/useRunStream";
import { serializeWorkflowGraph } from "@/lib/canvas/serialize-workflow-graph";
import { useWorkflowStore } from "@/store/workflow-store";
import Link from "next/link";
import toast from "react-hot-toast";

function WorkflowRfNode({ id, data, type }: NodeProps) {
  const status = useWorkflowStore((s) => s.nodeStatuses[id] ?? "idle");
  const workflowType =
    typeof data.workflowType === "string" ? data.workflowType : type;
  return (
    <div
      className={`relative min-w-[120px] rounded-md border-2 bg-zinc-900 px-3 py-2 text-sm text-zinc-100 shadow-sm ${nodeStatusBorderClass(status)}`}
    >
      <span className="absolute right-1 top-1 rounded bg-zinc-800 px-1 py-0.5 text-[9px] font-medium uppercase text-zinc-400">
        {nodeStatusLabel(status)}
      </span>
      <div className="text-xs font-medium text-zinc-400">{workflowType}</div>
    </div>
  );
}

function graphJsonToNodes(raw: unknown): Node[] {
  if (!Array.isArray(raw)) return [];
  return raw.map((item: unknown) => {
    const n = item as Record<string, unknown>;
    const pos = n.position as { x?: unknown; y?: unknown } | undefined;
    const workflowType =
      typeof n.type === "string" && n.type.length > 0 ? n.type : "default";
    const rfType =
      workflowType === "prompt-input"
        ? "prompt-input"
        : workflowType === "image-gen"
          ? "image-gen"
          : workflowType === "output-viewer"
            ? "output-viewer"
            : "default";

    const executionOutputs =
      typeof n.executionOutputs === "object" &&
      n.executionOutputs !== null &&
      !Array.isArray(n.executionOutputs)
        ? (n.executionOutputs as Record<string, unknown>)
        : undefined;

    return {
      id: String(n.id),
      type: rfType,
      position: {
        x: typeof pos?.x === "number" ? pos.x : Number(pos?.x) || 0,
        y: typeof pos?.y === "number" ? pos.y : Number(pos?.y) || 0,
      },
      data: {
        workflowType,
        config: n.config,
        inputs: n.inputs,
        outputs: n.outputs,
        label: workflowType,
        ...(executionOutputs ? { executionOutputs } : {}),
      },
    } satisfies Node;
  });
}

function graphJsonToEdges(raw: unknown): Edge[] {
  if (!Array.isArray(raw)) return [];
  return raw.map((item: unknown) => {
    const e = item as Record<string, unknown>;
    return {
      id: String(e.id),
      source: String(e.source),
      target: String(e.target),
      sourceHandle:
        e.sourceHandle != null && e.sourceHandle !== ""
          ? String(e.sourceHandle)
          : undefined,
      targetHandle:
        e.targetHandle != null && e.targetHandle !== ""
          ? String(e.targetHandle)
          : undefined,
    } satisfies Edge;
  });
}

type PaletteNodeType = "prompt-input" | "image-gen" | "output-viewer";

function defaultConfigFor(type: PaletteNodeType): Record<string, unknown> {
  switch (type) {
    case "prompt-input":
      return { value: "" };
    case "image-gen":
      return { model: "stability-ai/sdxl" };
    case "output-viewer":
      return {};
    default: {
      const _exhaustive: never = type;
      return _exhaustive;
    }
  }
}

function inputPortsFor(type: PaletteNodeType): Record<string, unknown>[] {
  switch (type) {
    case "prompt-input":
      return [];
    case "image-gen":
      return [
        {
          handle: "prompt",
          type: "string",
          required: true,
          label: "Prompt",
        },
      ];
    case "output-viewer":
      return [
        {
          handle: "image",
          type: "image_url",
          required: true,
          label: "Image",
        },
      ];
    default: {
      const _exhaustive: never = type;
      return _exhaustive;
    }
  }
}

function outputPortsFor(type: PaletteNodeType): Record<string, unknown>[] {
  switch (type) {
    case "prompt-input":
      return [{ handle: "prompt", type: "string", label: "Prompt" }];
    case "image-gen":
      return [
        {
          handle: "image_url",
          type: "image_url",
          label: "Generated image",
        },
      ];
    case "output-viewer":
      return [];
    default: {
      const _exhaustive: never = type;
      return _exhaustive;
    }
  }
}

function addNode(
  type: PaletteNodeType,
  setNodes: ReturnType<typeof useWorkflowStore.getState>["setNodes"],
) {
  const id = crypto.randomUUID();
  const newNode: Node = {
    id,
    type,
    position: {
      x: 100 + Math.random() * 200,
      y: 100 + Math.random() * 200,
    },
    data: {
      workflowType: type,
      config: defaultConfigFor(type),
      inputs: inputPortsFor(type),
      outputs: outputPortsFor(type),
      executionOutputs: {} as Record<string, unknown>,
    },
  };
  setNodes((current) => [...current, newNode]);
}

function NodePalette() {
  const setNodes = useWorkflowStore((s) => s.setNodes);

  return (
    <aside className="flex w-56 shrink-0 flex-col border-r border-zinc-300 bg-white p-3">
      <div className="mb-2 text-xs font-semibold text-zinc-800">Add node</div>
      <div className="flex flex-col gap-2">
        <button
          type="button"
          onClick={() => addNode("prompt-input", setNodes)}
          className="rounded border border-zinc-400 bg-white px-3 py-2 text-left text-sm font-medium text-zinc-900 shadow-sm hover:bg-zinc-50"
        >
          Prompt input
        </button>
        <button
          type="button"
          onClick={() => addNode("image-gen", setNodes)}
          className="rounded border border-zinc-400 bg-white px-3 py-2 text-left text-sm font-medium text-zinc-900 shadow-sm hover:bg-zinc-50"
        >
          Image generator
        </button>
        <button
          type="button"
          onClick={() => addNode("output-viewer", setNodes)}
          className="rounded border border-zinc-400 bg-white px-3 py-2 text-left text-sm font-medium text-zinc-900 shadow-sm hover:bg-zinc-50"
        >
          Output viewer
        </button>
      </div>
    </aside>
  );
}

type SaveIndicator = "idle" | "saving" | "saved" | "error";

type FlowCanvasProps = {
  saveIndicator: SaveIndicator;
  onRun: () => void;
  runDisabled: boolean;
  runLabel: string;
};

function FlowCanvas({ saveIndicator, onRun, runDisabled, runLabel }: FlowCanvasProps) {
  const runId = useWorkflowStore((s) => s.runId);
  useRunStream(runId);

  const nodes = useWorkflowStore((s) => s.nodes);
  const edges = useWorkflowStore((s) => s.edges);
  const setNodes = useWorkflowStore((s) => s.setNodes);
  const setEdges = useWorkflowStore((s) => s.setEdges);
  const workflowId = useWorkflowStore((s) => s.workflowId);
  const workflowName = useWorkflowStore((s) => s.workflowName);
  const setWorkflowName = useWorkflowStore((s) => s.setWorkflowName);

  const nodeTypes = useMemo(
    () => ({
      default: WorkflowRfNode,
      "prompt-input": PromptInputNode,
      "image-gen": ImageGenNode,
      "output-viewer": OutputViewerNode,
    }),
    [],
  );

  const onNodesChange = useCallback(
    (changes: NodeChange[]) => {
      setNodes((nds) => applyNodeChanges(changes, nds));
    },
    [setNodes],
  );

  const onEdgesChange = useCallback(
    (changes: EdgeChange[]) => {
      setEdges((eds) => applyEdgeChanges(changes, eds));
    },
    [setEdges],
  );

  const onConnect = useCallback(
    (connection: Connection) => {
      setEdges((eds) => addEdge(connection, eds));
    },
    [setEdges],
  );

  const isValidConnection = useCallback<IsValidConnection>(
    (connection: Edge | Connection) => {
      const invalid = () => {
        toast.error("Cannot connect: incompatible port types", {
          duration: 3000,
          id: "invalid-connection",
        });
        return false;
      };

      const { source, target, sourceHandle: sh, targetHandle: th } = connection;
      const sourceHandle = sh ?? null;
      const targetHandle = th ?? null;
      if (!source || !target || sourceHandle == null || targetHandle == null)
        return invalid();
      if (sourceHandle === "" || targetHandle === "") return invalid();
      const srcNode = nodes.find((n) => n.id === source);
      const tgtNode = nodes.find((n) => n.id === target);
      if (!srcNode || !tgtNode) return true;
      const srcData = srcNode.data as Record<string, unknown>;
      const tgtData = tgtNode.data as Record<string, unknown>;
      const outs = Array.isArray(srcData.outputs)
        ? (srcData.outputs as { handle?: string; type?: string }[])
        : [];
      const ins = Array.isArray(tgtData.inputs)
        ? (tgtData.inputs as { handle?: string; type?: string }[])
        : [];
      const outP = outs.find((p) => p.handle === String(sourceHandle));
      const inP = ins.find((p) => p.handle === String(targetHandle));
      if (!outP || !inP) return true;
      if (outP.type !== inP.type) return invalid();
      return true;
    },
    [nodes],
  );

  const saveText =
    saveIndicator === "saving"
      ? "Saving..."
      : saveIndicator === "saved"
        ? "Saved"
        : saveIndicator === "error"
          ? "Save failed"
          : "";

  const [isEditingWorkflowName, setIsEditingWorkflowName] = useState(false);
  const [draftWorkflowName, setDraftWorkflowName] = useState(workflowName);
  const [originalWorkflowName, setOriginalWorkflowName] = useState(workflowName);
  const [savingWorkflowName, setSavingWorkflowName] = useState(false);
  const escapeRevertedRef = useRef(false);
  const saveInFlightRef = useRef(false);

  useEffect(() => {
    if (!isEditingWorkflowName) {
      setDraftWorkflowName(workflowName);
      setOriginalWorkflowName(workflowName);
    }
  }, [workflowName, isEditingWorkflowName]);

  const commitWorkflowName = useCallback(async () => {
    const prevName = originalWorkflowName;
    const trimmed = draftWorkflowName.trim();

    if (saveInFlightRef.current || savingWorkflowName) return;

    if (!workflowId) {
      setDraftWorkflowName(prevName);
      setIsEditingWorkflowName(false);
      return;
    }

    if (trimmed.length === 0 || trimmed.length > 100) {
      // Client-side validation: server will enforce as well.
      setDraftWorkflowName(prevName);
      setIsEditingWorkflowName(false);
      return;
    }

    if (trimmed === prevName) {
      setIsEditingWorkflowName(false);
      return;
    }

    saveInFlightRef.current = true;
    setSavingWorkflowName(true);
    try {
      const res = await fetch(`/api/workflows/${workflowId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: trimmed }),
      });
      if (!res.ok) throw new Error("Failed to update workflow name");

      const updated = (await res.json()) as { name?: unknown };
      const nextName =
        typeof updated.name === "string" ? updated.name : trimmed;

      setWorkflowName(nextName);
      setDraftWorkflowName(nextName);
      setOriginalWorkflowName(nextName);
      setIsEditingWorkflowName(false);
    } catch {
      toast.error("Failed to rename workflow");
      setWorkflowName(prevName);
      setDraftWorkflowName(prevName);
      setOriginalWorkflowName(prevName);
      setIsEditingWorkflowName(false);
    } finally {
      saveInFlightRef.current = false;
      setSavingWorkflowName(false);
    }
  }, [
    draftWorkflowName,
    originalWorkflowName,
    savingWorkflowName,
    setWorkflowName,
    workflowId,
  ]);

  const startEditingWorkflowName = useCallback(() => {
    escapeRevertedRef.current = false;
    setOriginalWorkflowName(workflowName);
    setDraftWorkflowName(workflowName);
    setIsEditingWorkflowName(true);
  }, [workflowName]);

  const displayedWorkflowName =
    workflowName && workflowName.trim().length > 0
      ? workflowName
      : "Untitled workflow";

  return (
    <div className="relative h-full w-full bg-zinc-950">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        isValidConnection={isValidConnection}
        fitView
        className="h-full w-full bg-zinc-950"
      >
        <Background gap={16} />
        <Controls className="bg-zinc-900 border border-zinc-700" />
        <Panel
          position="top-left"
          className="m-0 rounded-md border border-zinc-700 bg-zinc-900/95 px-3 py-1.5 text-xs text-zinc-300 shadow"
        >
          <div className="flex items-center">
            <Link
              href="/dashboard"
              className="text-gray-400 hover:text-white text-xs mr-3"
            >
              ← Dashboard
            </Link>

            {isEditingWorkflowName ? (
              <input
                autoFocus
                className="bg-transparent border-b border-white text-white font-medium text-sm outline-none"
                value={draftWorkflowName}
                onChange={(e) => setDraftWorkflowName(e.target.value)}
                onBlur={() => {
                  if (escapeRevertedRef.current) {
                    escapeRevertedRef.current = false;
                    return;
                  }
                  void commitWorkflowName();
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    void commitWorkflowName();
                  }
                  if (e.key === "Escape") {
                    e.preventDefault();
                    escapeRevertedRef.current = true;
                    setDraftWorkflowName(originalWorkflowName);
                    setIsEditingWorkflowName(false);
                  }
                }}
              />
            ) : (
              <button
                type="button"
                className="text-white font-medium text-sm cursor-pointer hover:opacity-70"
                onClick={startEditingWorkflowName}
              >
                <span>{displayedWorkflowName}</span>
                <svg
                  viewBox="0 0 24 24"
                  width="12"
                  height="12"
                  className="ml-1 inline-block opacity-70"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M12 20h9" />
                  <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z" />
                </svg>
              </button>
            )}
          </div>
        </Panel>
        <Panel position="top-right" className="m-0 flex gap-2">
          <button
            type="button"
            onClick={onRun}
            disabled={runDisabled}
            className="rounded-md bg-cyan-600 px-3 py-1.5 text-xs font-semibold text-white shadow disabled:cursor-not-allowed disabled:opacity-50 hover:bg-cyan-500"
          >
            {runLabel}
          </button>
          <span className="text-zinc-500 self-center text-xs">
            {saveText ? saveText : "Ready"}
          </span>
        </Panel>
      </ReactFlow>

      {nodes.length === 0 ? (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
          <div className="text-center">
            <p className="text-gray-400 text-sm font-medium">
              Add a node to get started
            </p>
            <p className="text-gray-600 text-xs mt-1">
              Use the panel on the left to add nodes
            </p>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function CanvasEditor({ routeId }: { routeId: string }) {
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastSavedSerialized = useRef<string | null>(null);
  const hydratedRef = useRef(false);

  const [saveIndicator, setSaveIndicator] = useState<SaveIndicator>("idle");
  const [runSubmitting, setRunSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const nodes = useWorkflowStore((s) => s.nodes);
  const edges = useWorkflowStore((s) => s.edges);
  const workflowId = useWorkflowStore((s) => s.workflowId);
  const setWorkflowName = useWorkflowStore((s) => s.setWorkflowName);
  const nodeStatuses = useWorkflowStore((s) => s.nodeStatuses);
  const setRunId = useWorkflowStore((s) => s.setRunId);

  useEffect(() => {
    let cancelled = false;
    hydratedRef.current = false;
    lastSavedSerialized.current = null;
    setIsLoading(true);

    (async () => {
      try {
        const res = await fetch(`/api/workflows/${routeId}`);
        if (!res.ok || cancelled) return;
        const workflow = (await res.json()) as {
          id: string;
          graphJson?: unknown;
          name: string;
        };
        if (cancelled) return;

        const gj = workflow.graphJson as
          | { nodes?: unknown; edges?: unknown }
          | undefined;

        const nextNodes = graphJsonToNodes(gj?.nodes);
        const nextEdges = graphJsonToEdges(gj?.edges);

        useWorkflowStore.setState({
          workflowId: workflow.id,
          runId: null,
          nodeStatuses: {},
          nodes: nextNodes,
          edges: nextEdges,
        });
        setWorkflowName(workflow.name);

        lastSavedSerialized.current = JSON.stringify(
          serializeWorkflowGraph(nextNodes, nextEdges),
        );
        hydratedRef.current = true;
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [routeId, setWorkflowName]);

  useEffect(() => {
    if (!hydratedRef.current || !workflowId) return;

    const graph = serializeWorkflowGraph(nodes, edges);
    const serialized = JSON.stringify(graph);
    if (serialized === lastSavedSerialized.current) return;

    if (saveTimerRef.current) {
      clearTimeout(saveTimerRef.current);
    }
    setSaveIndicator("saving");

    saveTimerRef.current = setTimeout(async () => {
      try {
        const res = await fetch(`/api/workflows/${workflowId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ graphJson: graph }),
        });
        if (!res.ok) {
          setSaveIndicator("error");
          return;
        }
        lastSavedSerialized.current = serialized;
        setSaveIndicator("saved");
        setTimeout(() => setSaveIndicator("idle"), 2000);
      } catch {
        setSaveIndicator("error");
        toast.error("Failed to save workflow");
      }
    }, 1000);

    return () => {
      if (saveTimerRef.current) {
        clearTimeout(saveTimerRef.current);
        saveTimerRef.current = null;
      }
    };
  }, [nodes, edges, workflowId]);

  const anyNodeRunning = useMemo(
    () => Object.values(nodeStatuses).some((s) => s === "running"),
    [nodeStatuses],
  );

  const runDisabled = anyNodeRunning || runSubmitting;
  const runLabel =
    runSubmitting || anyNodeRunning ? "Running..." : "Run workflow";

  const handleRun = useCallback(async () => {
    if (!workflowId || runDisabled) return;
    setRunSubmitting(true);
    try {
      const res = await fetch(`/api/workflows/${workflowId}/run`, {
        method: "POST",
      });
      if (!res.ok) return;
      const data = (await res.json()) as { runId?: string };
      if (data.runId) setRunId(data.runId);
    } finally {
      setRunSubmitting(false);
    }
  }, [workflowId, runDisabled, setRunId]);

  return (
    <div className="flex h-full w-full min-h-0">
      <NodePalette />
      {isLoading ? (
        <div className="flex-1 flex items-center justify-center bg-gray-950">
          <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin" />
            <p className="text-gray-400 text-sm">Loading workflow...</p>
          </div>
        </div>
      ) : (
        <div className="min-h-0 min-w-0 flex-1">
          <FlowCanvas
            saveIndicator={saveIndicator}
            onRun={handleRun}
            runDisabled={runDisabled}
            runLabel={runLabel}
          />
        </div>
      )}
    </div>
  );
}

export default function CanvasPage() {
  const params = useParams();
  const id = typeof params.id === "string" ? params.id : null;

  if (!id) {
    return (
      <div className="flex h-dvh w-full items-center justify-center text-zinc-400">
        Missing workflow id
      </div>
    );
  }

  return (
    <div className="h-dvh w-full">
      <ReactFlowProvider>
        <CanvasEditor routeId={id} />
      </ReactFlowProvider>
    </div>
  );
}
