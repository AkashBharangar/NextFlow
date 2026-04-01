import { NextResponse } from "next/server";

import { requireSessionUserId } from "@/lib/api/session";
import { prisma } from "@/lib/prisma";

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return (
    typeof value === "object" &&
    value !== null &&
    !Array.isArray(value) &&
    Object.getPrototypeOf(value) === Object.prototype
  );
}

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

  if (
    typeof body !== "object" ||
    body === null ||
    !("graphJson" in body) ||
    !isPlainObject((body as { graphJson: unknown }).graphJson)
  ) {
    return NextResponse.json(
      { error: "Body must include `graphJson` as a plain object" },
      { status: 400 },
    );
  }

  const graphJson = (body as { graphJson: Record<string, unknown> }).graphJson;

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

  if (
    typeof body !== "object" ||
    body === null ||
    !("name" in body) ||
    typeof (body as { name?: unknown }).name !== "string"
  ) {
    return NextResponse.json(
      { error: "Body must include `name` as a string" },
      { status: 400 },
    );
  }

  const name = (body as { name: string }).name.trim();
  if (name.length === 0 || name.length > 100) {
    return NextResponse.json(
      { error: "Name must be non-empty and at most 100 characters" },
      { status: 400 },
    );
  }

  const workflow = await prisma.workflow.update({
    where: { id },
    data: { name },
  });

  return NextResponse.json(workflow);
}

// #region agent log
const DEBUG_INGEST_URL =
  "http://127.0.0.1:7590/ingest/2d1a0384-69ab-4a63-a787-09d6587de1c2";
const DEBUG_SESSION_ID = "9d1b9a";
// #endregion

export async function DELETE(_request: Request, context: RouteContext) {
  const userId = await requireSessionUserId();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await context.params;

  // #region agent log
  fetch(DEBUG_INGEST_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Debug-Session-Id": DEBUG_SESSION_ID,
    },
    body: JSON.stringify({
      sessionId: DEBUG_SESSION_ID,
      hypothesisId: "dashboard_delete_api",
      location: "runs/[id]/route.ts:DELETE",
      message: "delete handler entered",
      data: { hasWorkflowId: typeof id === "string" && id.length > 0 },
      timestamp: Date.now(),
    }),
  }).catch(() => {});
  // #endregion

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
  
  const runIds = runs.map((r) => r.id);

  // #region agent log
  fetch(DEBUG_INGEST_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Debug-Session-Id": DEBUG_SESSION_ID,
    },
    body: JSON.stringify({
      sessionId: DEBUG_SESSION_ID,
      hypothesisId: "dashboard_delete_api",
      location: "runs/[id]/route.ts:DELETE",
      message: "ownership verified, cascading deletes",
      data: { runCount: runIds.length },
      timestamp: Date.now(),
    }),
  }).catch(() => {});
  // #endregion

  if (runIds.length > 0) {
    const nodeExecutionDelete = await prisma.nodeExecution.deleteMany({
      where: { runId: { in: runIds } },
    });
    // #region agent log
    fetch(DEBUG_INGEST_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Debug-Session-Id": DEBUG_SESSION_ID,
      },
      body: JSON.stringify({
        sessionId: DEBUG_SESSION_ID,
        hypothesisId: "dashboard_delete_api",
        location: "runs/[id]/route.ts:DELETE",
        message: "deleted nodeExecutions",
        data: { count: nodeExecutionDelete.count },
        timestamp: Date.now(),
      }),
    }).catch(() => {});
    // #endregion
  }

  const workflowRunDelete = await prisma.workflowRun.deleteMany({
    where: { workflowId: id },
  });

  const workflowDelete = await prisma.workflow.delete({
    where: { id },
  });

  // #region agent log
  fetch(DEBUG_INGEST_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Debug-Session-Id": DEBUG_SESSION_ID,
    },
    body: JSON.stringify({
      sessionId: DEBUG_SESSION_ID,
      hypothesisId: "dashboard_delete_api",
      location: "runs/[id]/route.ts:DELETE",
      message: "delete complete",
      data: {
        workflowRunCountDeleted: workflowRunDelete.count,
        workflowCountDeleted: workflowDelete.id ? 1 : 0,
      },
      timestamp: Date.now(),
    }),
  }).catch(() => {});
  // #endregion

  return NextResponse.json({ success: true });
}
