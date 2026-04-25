"use client";

import { useEffect, useState } from "react";

export function ScrollToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 400);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  if (!visible) return null;

  return (
    <button
      type="button"
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      className="fixed bottom-6 right-6 z-50 rounded-pill border border-white/15 bg-[#0d0d1e]/80 px-4 py-2 text-sm text-white/85 backdrop-blur-xl transition hover:bg-[#141428] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple/60"
    >
      ↑ Top
    </button>
  );
}

