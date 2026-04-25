import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

import ParticleWrapper from "@/app/dashboard/ParticleWrapper";
import { DashboardNav } from "@/app/dashboard/dashboard-nav";
import { NewWorkflowButton } from "@/app/dashboard/new-workflow-button";
import { WorkflowCard } from "@/app/dashboard/workflow-card";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

function formatRelativeTime(date: Date | string): string {
  const now = Date.now();
  const then = new Date(date).getTime();
  const diff = Math.floor((now - then) / 1000);
  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)} minutes ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} hours ago`;
  if (diff < 604800) return `${Math.floor(diff / 86400)} days ago`;
  return new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/auth/signin");

  const workflows = await prisma.workflow.findMany({
    where: { userId: session.user.id },
    orderBy: { updatedAt: "desc" },
  });

  return (
    <div className="min-h-screen bg-[#080810] flex">
      <ParticleWrapper />
      <DashboardNav />

      <div className="flex-1 ml-16 flex flex-col min-h-screen">
        <div className="sticky top-0 z-40 bg-[#080810]/80 backdrop-blur-xl border-b border-white/[0.06] px-8 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-lg font-bold text-white tracking-tight">
              My Workflows
            </h1>
            <p className="text-white/35 text-xs mt-0.5">
              {workflows.length} workflow{workflows.length !== 1 ? "s" : ""}
            </p>
          </div>
          <NewWorkflowButton />
        </div>

        <div className="flex-1 px-8 py-8">
          {workflows.length === 0 ? (
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
              <div className="w-20 h-20 rounded-3xl bg-purple-500/[0.08] border border-purple-500/20 flex items-center justify-center text-3xl text-purple-400/40 mb-6 shadow-[0_0_60px_rgba(124,92,252,0.1)]">
                ✦
              </div>
              <h2 className="text-xl font-semibold text-white mb-2">
                Your canvas is empty
              </h2>
              <p className="text-white/35 text-sm mb-8 max-w-xs leading-relaxed">
                Create your first workflow to start generating images, videos,
                and more with AI.
              </p>
              <NewWorkflowButton />
            </div>
          ) : (
            <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {workflows.map((workflow) => (
                <WorkflowCard
                  key={workflow.id}
                  id={workflow.id}
                  name={workflow.name}
                  updatedAtLabel={formatRelativeTime(workflow.updatedAt)}
                />
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
