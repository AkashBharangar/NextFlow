import { NextResponse } from "next/server";

import { requireSessionUserId } from "@/lib/api/session";
import { prisma } from "@/lib/prisma";
import { triggerRun } from "@/lib/services/execution-service";

export const runtime = "nodejs";

type RouteContext = { params: Promise<{ id: string }> };

export async function POST(_request: Request, context: RouteContext) {
  const userId = await requireSessionUserId();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id: workflowId } = await context.params;

  const owned = await prisma.workflow.findFirst({
    where: { id: workflowId, userId },
  });
  if (!owned) {
    return NextResponse.json({ error: "Workflow not found" }, { status: 404 });
  }

  try {
    const runId = await triggerRun(workflowId);
    return NextResponse.json({ runId });
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);

    if (message === "Workflow not found") {
      return NextResponse.json({ error: message }, { status: 404 });
    }

    if (
      message.startsWith("Invalid workflow graph:") ||
      message.includes("Graph contains a cycle") ||
      message.includes("Type mismatch:")
    ) {
      return NextResponse.json({ error: message }, { status: 400 });
    }

    if (message === "REDIS_URL is not set") {
      return NextResponse.json({ error: message }, { status: 500 });
    }

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
