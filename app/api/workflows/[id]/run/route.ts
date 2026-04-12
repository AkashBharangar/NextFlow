import { NextResponse } from "next/server";

import { requireSessionUserId } from "@/lib/api/session";
import { prisma } from "@/lib/prisma";
import { triggerRun } from "@/lib/services/execution-service";
import { getRunRateLimiter } from "@/lib/services/rate-limiter";

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

  // Rate limit: 5 runs per user per 60 seconds
  try {
    const limiter = getRunRateLimiter();
    const { success, limit, remaining, reset } = await limiter.limit(userId);
    if (!success) {
      return NextResponse.json(
        {
          error: "Too many workflow runs. Please wait before running again.",
          limit,
          remaining,
          reset,
        },
        {
          status: 429,
          headers: {
            "Retry-After": String(Math.ceil((reset - Date.now()) / 1000)),
            "X-RateLimit-Limit": String(limit),
            "X-RateLimit-Remaining": String(remaining),
          },
        },
      );
    }
  } catch (rateLimitError) {
    // If rate limiting fails (e.g. Redis unavailable), log and allow the
    // request through — do not block legitimate users on infra failure.
    console.error("[run] rate limit check failed, allowing request", rateLimitError);
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
