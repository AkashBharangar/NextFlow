import Link from "next/link";
import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth";

export async function DashboardNav() {
  const session = await getServerSession(authOptions);
  const name = session?.user?.name ?? session?.user?.email ?? "Account";

  return (
    <header className="flex items-center justify-between border-b border-zinc-800 bg-zinc-950 px-6 py-4">
      <Link href="/dashboard" className="text-lg font-semibold text-zinc-100">
        NextFlow
      </Link>
      <div className="flex items-center gap-4 text-sm text-zinc-300">
        <span className="text-zinc-400">{name}</span>
        <Link
          href="/api/auth/signout"
          className="rounded-md border border-zinc-700 px-3 py-1 text-zinc-300 hover:bg-zinc-900"
        >
          Sign out
        </Link>
      </div>
    </header>
  );
}
