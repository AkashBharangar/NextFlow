"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  useEffect(() => {
    function onScroll() {
      setIsScrolled(window.scrollY > 20);
    }
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!isMobileOpen) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setIsMobileOpen(false);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isMobileOpen]);

  return (
    <nav
      className={`fixed left-0 right-0 top-0 z-50 transition-all duration-300 ${
        isScrolled
          ? "border-b border-white/[0.06] bg-[#080810]/90 backdrop-blur-xl"
          : "bg-transparent"
      }`}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        <Link
          href="/"
          className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-lg font-bold text-transparent"
        >
          ✦ Nexflow
        </Link>

        <div className="hidden items-center gap-8 md:flex">
          {["Generate", "Explore", "Pricing"].map((link) => (
            <Link
              key={link}
              href={
                link === "Generate"
                  ? "/auth/signin"
                  : link === "Explore"
                    ? "#features"
                    : "/pricing"
              }
              className="text-sm text-white/50 transition-colors hover:text-white"
            >
              {link}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/auth/signin"
            className="hidden text-sm text-white/50 transition-colors hover:text-white md:block"
          >
            Sign in
          </Link>
          <Link
            href="/auth/signin"
            className="rounded-full bg-gradient-to-r from-purple-600 to-pink-500 px-4 py-2 text-sm font-semibold text-white transition-all duration-200 hover:scale-105 hover:shadow-[0_0_20px_rgba(124,92,252,0.4)]"
          >
            Start creating →
          </Link>

          <button
            type="button"
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/[0.08] bg-white/[0.04] text-lg text-white/90 md:hidden"
            aria-expanded={isMobileOpen}
            aria-label={isMobileOpen ? "Close menu" : "Open menu"}
            onClick={() => setIsMobileOpen((o) => !o)}
          >
            {isMobileOpen ? "✕" : "☰"}
          </button>
        </div>
      </div>

      {isMobileOpen ? (
        <div className="border-b border-white/[0.06] bg-[#080810]/95 px-6 py-4 backdrop-blur-xl md:hidden">
          <div className="mx-auto flex max-w-7xl flex-col gap-3">
            {["Generate", "Explore", "Pricing"].map((link) => (
              <Link
                key={link}
                href={
                  link === "Generate"
                    ? "/auth/signin"
                    : link === "Explore"
                      ? "#features"
                      : "/pricing"
                }
                className="text-sm text-white/70 transition-colors hover:text-white"
                onClick={() => setIsMobileOpen(false)}
              >
                {link}
              </Link>
            ))}
            <Link
              href="/auth/signin"
              className="text-sm text-white/50 transition-colors hover:text-white"
              onClick={() => setIsMobileOpen(false)}
            >
              Sign in
            </Link>
          </div>
        </div>
      ) : null}
    </nav>
  );
}
