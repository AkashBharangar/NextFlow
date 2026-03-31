export interface Port {
  handle: string;
  type: string;
  required?: boolean;
  label: string;
}

export interface GraphNode {
  id: string;
  type: string;
  position: { x: number; y: number };
  config: Record<string, unknown>;
  inputs: Port[];
  outputs: Port[];
}

export interface GraphEdge {
  id: string;
  source: string;
  sourceHandle: string;
  target: string;
  targetHandle: string;
}

export interface WorkflowGraph {
  nodes: GraphNode[];
  edges: GraphEdge[];
}
