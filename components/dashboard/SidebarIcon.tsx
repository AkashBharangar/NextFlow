"use client";

import Link from "next/link";

type SidebarIconProps = {
  icon: string;
  label: string;
  href: string;
  isActive?: boolean;
};

export function SidebarIcon({ icon, label, href, isActive = false }: SidebarIconProps) {
  return (
    <Link
      href={href}
      className={`group relative flex h-10 w-10 items-center justify-center rounded-xl transition ${
        isActive ? "bg-purple/30 text-white" : "text-white/50 hover:bg-white/5 hover:text-white/80"
      }`}
      aria-label={label}
    >
      <span className="text-base">{icon}</span>
      <span className="pointer-events-none absolute left-12 top-1/2 z-50 -translate-y-1/2 rounded-md border border-white/10 bg-[#121325] px-2 py-1 text-xs whitespace-nowrap text-white/80 opacity-0 shadow-lg transition group-hover:opacity-100">
        {label}
      </span>
    </Link>
  );
}

