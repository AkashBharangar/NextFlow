import { NextRequest } from "next/server";
import IORedis from "ioredis";
import { requireSessionUserId } from "@/lib/api/session";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

type RouteContext = { params: Promise<{ runId: string }> };

export async function GET(request: NextRequest, context: RouteContext) {
  const userId = await requireSessionUserId();
  if (!userId) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  const { runId } = await context.params;

  // Verify the run belongs to this user
  const run = await prisma.workflowRun.findFirst({
    where: { id: runId, workflow: { userId } },
    select: { id: true, status: true },
  });

  if (!run) {
    return new Response(JSON.stringify({ error: "Run not found" }), {
      status: 404,
      headers: { "Content-Type": "application/json" },
    });
  }

  const redisUrl = process.env.REDIS_URL?.trim();
  if (!redisUrl) {
    return new Response(JSON.stringify({ error: "REDIS_URL not set" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }

  const channel = `run:${runId}:events`;

  const stream = new ReadableStream({
    async start(controller) {
      // Send an immediate snapshot of current run state so the
      // client does not have to wait for the first event
      try {
        const snapshot = await prisma.workflowRun.findFirst({
          where: { id: runId },
          select: {
            status: true,
            nodeExecutions: {
              select: {
                nodeId: true,
                status: true,
                outputs: true,
                error: true,
                errorCode: true,
              },
            },
          },
        });
        if (snapshot) {
          const data = `data: ${JSON.stringify({ type: "snapshot", run: snapshot })}\n\n`;
          controller.enqueue(new TextEncoder().encode(data));
        }
      } catch {
        // Non-fatal — client will receive events shortly
      }

      // Subscribe to Redis pub/sub for live events
      const subscriber = new IORedis(redisUrl, {
        maxRetriesPerRequest: null,
        retryStrategy: (times) => Math.min(times * 500, 5000),
      });

      const heartbeatId = setInterval(() => {
        try {
          controller.enqueue(new TextEncoder().encode(": heartbeat\n\n"));
        } catch {
          clearInterval(heartbeatId);
        }
      }, 15000);

      subscriber.on("message", (_ch: string, message: string) => {
        try {
          const data = `data: ${message}\n\n`;
          controller.enqueue(new TextEncoder().encode(data));

          // Close the stream on terminal run events
          const parsed = JSON.parse(message) as { type?: string; status?: string };
          if (
            parsed.type === "run_update" &&
            (parsed.status === "success" ||
              parsed.status === "failed" ||
              parsed.status === "cancelled")
          ) {
            clearInterval(heartbeatId);
            subscriber.quit().catch(() => null);
            controller.close();
          }
        } catch {
          // Malformed message — ignore
        }
      });

      subscriber.on("error", () => {
        clearInterval(heartbeatId);
        try { controller.close(); } catch { /* already closed */ }
      });

      await subscriber.subscribe(channel);

      // Clean up if the client disconnects
      request.signal.addEventListener("abort", () => {
        clearInterval(heartbeatId);
        subscriber.quit().catch(() => null);
        try { controller.close(); } catch { /* already closed */ }
      });
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
    },
  });
}
