import { NextResponse } from "next/server";

import { requireSessionUserId } from "@/lib/api/session";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

type RouteContext = { params: Promise<{ runId: string }> };

export async function GET(_request: Request, context: RouteContext) {
  const userId = await requireSessionUserId();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { runId } = await context.params;

  const run = await prisma.workflowRun.findFirst({
    where: { id: runId, workflow: { userId } },
    select: {
      id: true,
      status: true,
      nodeExecutions: {
        select: {
          nodeId: true,
          status: true,
          outputs: true,
          error: true,
        },
      },
    },
  });

  if (!run) {
    return NextResponse.json({ error: "Run not found" }, { status: 404 });
  }

  return NextResponse.json(run);
}
