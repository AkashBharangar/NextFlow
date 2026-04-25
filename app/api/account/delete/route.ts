import { NextResponse } from "next/server";
import { requireSessionUserId } from "@/lib/api/session";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export const runtime = "nodejs";

/**
 * DELETE /api/account/delete
 *
 * Permanently deletes the authenticated user and all their data:
 * - NodeExecution rows (via WorkflowRun cascade)
 * - FileAsset rows (via NodeExecution cascade)
 * - JobQueue rows (via NodeExecution cascade)
 * - WorkflowRun rows (via Workflow cascade)
 * - Workflow rows
 * - Account + Session rows (via User cascade)
 * - User row
 *
 * Prisma schema onDelete: Cascade handles the child rows automatically.
 */
export async function DELETE(_request: Request) {
  const userId = await requireSessionUserId();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Double-check the session is still valid before destructive action
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || session.user.id !== userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Cascade order handled by Prisma schema relations.
    // Deleting the User cascades to Account, Session,
    // Workflow → WorkflowRun → NodeExecution → FileAsset + JobQueue.
    await prisma.user.delete({
      where: { id: userId },
    });

    return NextResponse.json(
      { success: true, message: "Account and all data permanently deleted" },
      { status: 200 },
    );
  } catch (e) {
    console.error("[account/delete] failed to delete user", { userId, error: e });
    return NextResponse.json(
      { error: "Failed to delete account. Please try again." },
      { status: 500 },
    );
  }
}