import type { NodeRuntimeStatus } from "@/store/workflow-store";

export function nodeStatusBorderClass(status: NodeRuntimeStatus): string {
  switch (status) {
    case "running":
      return "border-blue-400 shadow-[0_0_0_1px_rgba(96,165,250,0.8)] animate-pulse";
    case "success":
      return "border-green-400";
    case "error":
      return "border-red-400";
    default:
      return "border-zinc-600";
  }
}

export function nodeStatusLabel(status: NodeRuntimeStatus): string {
  return status;
}
