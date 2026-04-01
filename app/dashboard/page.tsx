import Link from "next/link";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

import { DashboardNav } from "@/app/dashboard/dashboard-nav";
import { NewWorkflowButton } from "@/app/dashboard/new-workflow-button";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { WorkflowCard } from "@/app/dashboard/workflow-card";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    redirect("/auth/signin?callbackUrl=/dashboard");
  }

  const workflows: { id: string; name: string; updatedAt: Date }[] =
    await prisma.workflow.findMany({
    where: { userId: session.user.id },
    orderBy: { updatedAt: "desc" },
  });

  return (
    <div className="min-h-dvh bg-zinc-950 text-zinc-100">
      <DashboardNav />
      <main className="mx-auto max-w-5xl px-6 py-8">
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-zinc-100">Workflows</h1>
            <p className="mt-1 text-sm text-zinc-500">
              Open a canvas or create a new workflow.
            </p>
          </div>
          <NewWorkflowButton />
        </div>

        {workflows.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <p className="text-gray-400 text-sm">No workflows yet</p>
            <p className="text-gray-600 text-xs">
              Click &quot;New workflow&quot; to create your first one
            </p>
          </div>
        ) : (
          <ul className="grid gap-4 sm:grid-cols-2">
            {workflows.map((w: { id: string; name: string; updatedAt: Date }) => (
              <WorkflowCard
                key={w.id}
                id={w.id}
                name={w.name}
                updatedAtLabel={w.updatedAt.toLocaleString()}
              />
            ))}
          </ul>
        )}
      </main>
    </div>
  );
}
