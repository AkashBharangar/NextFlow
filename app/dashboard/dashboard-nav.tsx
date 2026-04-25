import Link from "next/link";
import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth";
import { SignOutButton } from "@/components/ui/SignOutButton";

export async function DashboardNav() {
  const session = await getServerSession(authOptions);
  const name = session?.user?.name ?? session?.user?.email ?? "Account";

  return (
    <nav
      className="fixed left-0 top-0 h-screen w-16 bg-[#0a0a18] border-r border-white/[0.06] flex flex-col items-center py-5 gap-2 z-50"
    >
      <div className="text-xl font-bold bg-gradient-to-b from-purple-400 to-pink-500 bg-clip-text text-transparent mb-4">
        ✦
      </div>

      <Link
        href="/dashboard"
        className="group relative flex items-center justify-center w-10 h-10 rounded-xl text-white/40 hover:text-white hover:bg-white/[0.06] transition-all duration-200"
      >
        <span className="text-lg leading-none">⊡</span>
        <span className="absolute left-16 bg-[#1a1a2e] text-white text-xs px-2 py-1 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
          Dashboard
        </span>
      </Link>

      <div className="flex-1" />

      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-600 to-pink-500 flex items-center justify-center text-white text-xs font-bold mb-2">
        {name[0]?.toUpperCase() ?? "?"}
      </div>

      <SignOutButton />
    </nav>
  );
}
