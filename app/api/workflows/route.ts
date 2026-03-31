import { NextResponse } from "next/server";

import { requireSessionUserId } from "@/lib/api/session";
import { prisma } from "@/lib/prisma";

const DEFAULT_GRAPH = { nodes: [], edges: [] };

export async function POST(request: Request) {
  const userId = await requireSessionUserId();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
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
    typeof (body as { name: unknown }).name !== "string"
  ) {
    return NextResponse.json(
      { error: "Body must include a string `name`" },
      { status: 400 },
    );
  }

  const name = (body as { name: string }).name.trim();
  if (!name) {
    return NextResponse.json({ error: "`name` must be non-empty" }, { status: 400 });
  }

  const workflow = await prisma.workflow.create({
    data: {
      userId,
      name,
      graphJson: DEFAULT_GRAPH,
    },
  });

  return NextResponse.json(workflow);
}
