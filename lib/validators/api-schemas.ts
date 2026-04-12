import { z } from "zod";

// ─── Shared primitives ────────────────────────────────────────────────────────

const nodeConfigSchema = z.record(z.string(), z.unknown()).refine(
  (config) => Object.keys(config).length <= 50,
  { message: "Node config must have at most 50 keys" },
);

const portSchema = z.object({
  handle: z.string().max(64),
  type: z.string().max(64),
  required: z.boolean().optional(),
  label: z.string().max(128),
});

const graphNodeSchema = z.object({
  id: z.string().uuid(),
  type: z.enum(["prompt-input", "image-gen", "output-viewer"]),
  position: z.object({
    x: z.number().finite(),
    y: z.number().finite(),
  }),
  config: nodeConfigSchema,
  inputs: z.array(portSchema).max(20),
  outputs: z.array(portSchema).max(20),
});

const graphEdgeSchema = z.object({
  id: z.string().max(128),
  source: z.string().uuid(),
  target: z.string().uuid(),
  sourceHandle: z.string().max(64),
  targetHandle: z.string().max(64),
});

// ─── Graph schema ─────────────────────────────────────────────────────────────

export const graphJsonSchema = z
  .object({
    nodes: z.array(graphNodeSchema).max(20, {
      message: "A workflow may have at most 20 nodes",
    }),
    edges: z.array(graphEdgeSchema).max(50, {
      message: "A workflow may have at most 50 edges",
    }),
  })
  .strict();

// ─── API body schemas ─────────────────────────────────────────────────────────

export const putWorkflowBodySchema = z.object({
  graphJson: graphJsonSchema,
});

export const patchWorkflowBodySchema = z.object({
  name: z
    .string()
    .min(1, { message: "Name must be non-empty" })
    .max(100, { message: "Name must be at most 100 characters" }),
});

export const createWorkflowBodySchema = z.object({
  name: z
    .string()
    .min(1)
    .max(100)
    .optional()
    .default("Untitled workflow"),
});