import { NextResponse } from "next/server";

import { requireSessionUserId } from "@/lib/api/session";
import { prisma } from "@/lib/prisma";
import { putWorkflowBodySchema, patchWorkflowBodySchema } from "@/lib/validators/api-schemas";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_request: Request, context: RouteContext) {
  const userId = await requireSessionUserId();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await context.params;

  const workflow = await prisma.workflow.findFirst({
    where: { id, userId },
  });

  if (!workflow) {
    return NextResponse.json({ error: "Workflow not found" }, { status: 404 });
  }

  return NextResponse.json(workflow);
}

export async function PUT(request: Request, context: RouteContext) {
  const userId = await requireSessionUserId();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await context.params;

  const existing = await prisma.workflow.findFirst({
    where: { id, userId },
  });

  if (!existing) {
    return NextResponse.json({ error: "Workflow not found" }, { status: 404 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const putParsed = putWorkflowBodySchema.safeParse(body);
  if (!putParsed.success) {
    return NextResponse.json(
      { error: putParsed.error.issues[0]?.message ?? "Invalid request body" },
      { status: 400 },
    );
  }
  const { graphJson } = putParsed.data;

  const workflow = await prisma.workflow.update({
    where: { id },
    data: { graphJson: graphJson as unknown as object },
  });

  return NextResponse.json(workflow);
}

export async function PATCH(request: Request, context: RouteContext) {
  const userId = await requireSessionUserId();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await context.params;

  const existing = await prisma.workflow.findFirst({
    where: { id, userId },
    select: { id: true },
  });

  if (!existing) {
    return NextResponse.json({ error: "Workflow not found" }, { status: 404 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const patchParsed = patchWorkflowBodySchema.safeParse(body);
  if (!patchParsed.success) {
    return NextResponse.json(
      { error: patchParsed.error.issues[0]?.message ?? "Invalid request body" },
      { status: 400 },
    );
  }
  const { name } = patchParsed.data;

  const workflow = await prisma.workflow.update({
    where: { id },
    data: { name },
  });

  return NextResponse.json(workflow);
}

export async function DELETE(_request: Request, context: RouteContext) {
  const userId = await requireSessionUserId();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await context.params;

  const existing = await prisma.workflow.findFirst({
    where: { id, userId },
    select: { id: true },
  });

  if (!existing) {
    return NextResponse.json({ error: "Workflow not found" }, { status: 404 });
  }

  const runs: { id: string }[] = await prisma.workflowRun.findMany({
    where: { workflowId: id },
    select: { id: true },
  });

  const runIds = runs.map((r: { id: string }) => r.id);

  if (runIds.length > 0) {
    await prisma.nodeExecution.deleteMany({
      where: { runId: { in: runIds } },
    });
  }

  await prisma.workflowRun.deleteMany({
    where: { workflowId: id },
  });

  await prisma.workflow.delete({
    where: { id },
  });

  return NextResponse.json({ success: true });
}