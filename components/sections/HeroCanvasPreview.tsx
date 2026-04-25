"use client";

import { useEffect, useMemo, useState } from "react";

const toolModes = ["Generate", "Edit", "Animate", "Upscale"];
const styleChips = ["Cinematic", "Neon", "3D", "Analog", "Surreal"];

export function HeroCanvasPreview() {
  const [isHovering, setIsHovering] = useState(false);
  const [rotation, setRotation] = useState({ x: 18, y: -4 });

  useEffect(() => {
    const handleMove = (event: MouseEvent) => {
      if (isHovering) return;

      const centerX = window.innerWidth / 2;
      const centerY = window.innerHeight / 2;
      const offsetX = (event.clientX - centerX) / centerX;
      const offsetY = (event.clientY - centerY) / centerY;

      const rotateY = Math.max(-6, Math.min(6, offsetX * 6));
      const rotateX = Math.max(-6, Math.min(6, -offsetY * 6)) + 12;

      setRotation({ x: rotateX, y: rotateY });
    };

    window.addEventListener("mousemove", handleMove);
    return () => window.removeEventListener("mousemove", handleMove);
  }, [isHovering]);

  const transform = useMemo(() => {
    const rotateX = isHovering ? 6 : rotation.x;
    const rotateY = isHovering ? 0 : rotation.y;
    return `rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
  }, [isHovering, rotation.x, rotation.y]);

  return (
    <div className="w-full max-w-6xl [perspective:1200px]">
      <div
        className="relative mx-auto w-full overflow-hidden rounded-[20px] border border-[rgba(124,92,252,0.25)] bg-[#0b0b15] shadow-[0_55px_110px_rgba(0,0,0,0.62),0_30px_90px_rgba(124,92,252,0.28)] transition-transform duration-500 ease-out"
        style={{ transform }}
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
      >
        <div className="flex h-[min(65vh,560px)] w-full">
          <div className="flex w-16 flex-col items-center gap-3 border-r border-white/10 bg-[#0e0f1a] py-4">
            {["+", "[]", "<>", "o", "~", "*"].map((icon) => (
              <div
                key={icon}
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-xs text-white/70"
              >
                {icon}
              </div>
            ))}
          </div>

          <div className="flex min-w-0 flex-1 flex-col">
            <div className="flex items-center justify-between border-b border-white/10 bg-[#121324] px-4 py-3">
              <div className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-red-400/90" />
                <span className="h-2.5 w-2.5 rounded-full bg-amber-300/90" />
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-400/90" />
              </div>
              <div className="flex items-center gap-2">
                {toolModes.map((mode, idx) => (
                  <div
                    key={mode}
                    className={`rounded-pill px-3 py-1 text-[11px] ${
                      idx === 0
                        ? "bg-gradient-to-r from-purple to-pink-ai text-white"
                        : "border border-white/15 bg-white/5 text-white/70"
                    }`}
                  >
                    {mode}
                  </div>
                ))}
              </div>
            </div>

            <div className="grid min-h-0 flex-1 grid-cols-[1fr_280px]">
              <div className="relative overflow-hidden border-r border-white/10 bg-[#0f1020]">
                <div className="absolute inset-0 [background-image:radial-gradient(rgba(255,255,255,0.11)_1px,transparent_1px)] [background-size:16px_16px] opacity-30" />
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_15%,rgba(124,92,252,0.2),transparent_45%),radial-gradient(circle_at_80%_80%,rgba(34,212,253,0.14),transparent_44%)]" />
                <div className="absolute left-1/2 top-1/2 h-52 w-52 -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-white/20 bg-[conic-gradient(from_240deg,#7c5cfc,#f43f8f,#22d4fd,#ff6b35,#7c5cfc)] shadow-[0_0_80px_rgba(124,92,252,0.55)]" />

                <div className="pointer-events-none absolute bottom-5 left-1/2 w-[82%] -translate-x-1/2 rounded-pill border border-white/15 bg-[#111224]/90 px-4 py-3 shadow-2xl backdrop-blur-xl">
                  <p className="text-xs text-white/45">Describe your scene...</p>
                </div>
              </div>

              <aside className="flex flex-col gap-4 bg-[#0d0e18] p-4">
                <div className="rounded-xl border border-white/10 bg-white/[0.04] p-3">
                  <p className="text-[11px] uppercase tracking-widest text-white/45">Model</p>
                  <div className="mt-2 rounded-lg border border-purple/40 bg-purple/10 px-3 py-2 text-sm text-white">
                    Flux Pro Ultra
                  </div>
                </div>

                <div className="rounded-xl border border-white/10 bg-white/[0.04] p-3">
                  <p className="text-[11px] uppercase tracking-widest text-white/45">Style</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {styleChips.map((chip, idx) => (
                      <span
                        key={chip}
                        className={`rounded-pill px-2.5 py-1 text-[11px] ${
                          idx === 0
                            ? "bg-white/18 text-white"
                            : "border border-white/15 bg-white/5 text-white/65"
                        }`}
                      >
                        {chip}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="rounded-xl border border-white/10 bg-white/[0.04] p-3">
                  <p className="text-[11px] uppercase tracking-widest text-white/45">Parameters</p>
                  <div className="mt-3 space-y-3">
                    {["Prompt Strength", "Creativity", "Detail Boost"].map((label, idx) => (
                      <div key={label}>
                        <div className="mb-1 flex items-center justify-between text-[11px] text-white/55">
                          <span>{label}</span>
                          <span>{idx === 0 ? "78%" : idx === 1 ? "64%" : "86%"}</span>
                        </div>
                        <div className="h-1.5 rounded-full bg-white/12">
                          <div
                            className="h-full rounded-full bg-gradient-to-r from-purple via-pink-ai to-cyan-ai"
                            style={{ width: idx === 0 ? "78%" : idx === 1 ? "64%" : "86%" }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </aside>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

