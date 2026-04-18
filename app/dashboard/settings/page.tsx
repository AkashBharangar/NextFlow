import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

import { DashboardNav } from "@/app/dashboard/dashboard-nav";
import { SettingsShell } from "@/components/settings/SettingsShell";
import { authOptions } from "@/lib/auth";

export default async function DashboardSettingsPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/auth/signin");

  return (
    <div className="flex min-h-screen bg-[#080810]">
      <DashboardNav />

      <div className="ml-16 flex min-h-screen min-w-0 flex-1 flex-col">
        <div className="sticky top-0 z-40 flex items-center justify-between border-b border-white/[0.06] bg-[#080810]/80 px-8 py-4 backdrop-blur-xl">
          <h1 className="text-lg font-bold tracking-tight text-white">Settings</h1>
        </div>

        <SettingsShell
          user={{
            name: session.user.name,
            email: session.user.email,
          }}
        />
      </div>
    </div>
  );
}
