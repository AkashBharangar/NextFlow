"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";

import { SectionLabel } from "@/components/ui/SectionLabel";

const tools = [
  {
    icon: "🖼",
    name: "Text to Image",
    description: "Generate polished visuals from prompts with instant style controls.",
    badge: "LIVE",
    badgeClass: "bg-emerald-400/15 text-emerald-300 border-emerald-400/35",
  },
  {
    icon: "🧩",
    name: "Inpainting",
    description: "Select and regenerate regions while preserving the original composition.",
    badge: "LIVE",
    badgeClass: "bg-emerald-400/15 text-emerald-300 border-emerald-400/35",
  },
  {
    icon: "🎬",
    name: "Image to Video",
    description: "Animate still images into cinematic clips with camera and motion guidance.",
    badge: "BETA",
    badgeClass: "bg-cyan-ai/15 text-cyan-ai border-cyan-ai/35",
  },
  {
    icon: "🔎",
    name: "Real-ESRGAN Upscale",
    description: "Enhance detail and sharpness for high-resolution creative delivery.",
    badge: "LIVE",
    badgeClass: "bg-emerald-400/15 text-emerald-300 border-emerald-400/35",
  },
  {
    icon: "🧠",
    name: "LoRA Training",
    description: "Train lightweight custom styles from your own references and identity packs.",
    badge: "NEW",
    badgeClass: "bg-purple/15 text-purple border-purple/35",
  },
] as const;

const statusCycle = ["◌ Generating...", "✦ Complete", "◌ Upscaling...", "✓ Ready"] as const;

export function Tools() {
  const [statusIndex, setStatusIndex] = useState(0);

  useEffect(() => {
    const interval = window.setInterval(() => {
      setStatusIndex((prev) => (prev + 1) % statusCycle.length);
    }, 2200);
    return () => window.clearInterval(interval);
  }, []);

  return (
    <section id="tools" className="px-4 py-20 sm:px-6 lg:px-8">
      <div className="mx-auto grid w-full max-w-[1100px] gap-10 lg:grid-cols-[1fr_1.05fr] lg:items-center">
        <div>
          <SectionLabel>Toolset</SectionLabel>
          <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-white sm:text-5xl">
            Every tool you need, nothing you don&apos;t.
          </h2>
          <p className="mt-4 max-w-xl text-white/70">
            Move from concept to polished output with focused tools tuned for AI-first creative
            workflows.
          </p>

          <div className="mt-8 space-y-2">
            {tools.map((tool) => (
              <div
                key={tool.name}
                className="group relative rounded-2xl border border-white/8 bg-bg3/60 px-4 py-4 transition-all duration-300 hover:translate-x-[5px] hover:border-purple/35"
              >
                <span className="absolute left-0 top-2 h-[calc(100%-16px)] w-[3px] origin-top scale-y-0 rounded-r-full bg-gradient-to-b from-purple to-pink-ai transition-transform duration-300 group-hover:scale-y-100" />
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-base">
                    {tool.icon}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-semibold text-white">{tool.name}</p>
                      <span
                        className={`rounded-pill border px-2 py-0.5 text-[10px] font-semibold tracking-wider ${tool.badgeClass}`}
                      >
                        {tool.badge}
                      </span>
                    </div>
                    <p className="mt-1 text-sm text-white/62">{tool.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6 }}
          className="[perspective:1200px]"
        >
          <div className="group rounded-card border border-purple/35 bg-[#0d0f1b] p-4 shadow-[0_55px_120px_rgba(0,0,0,0.56),0_0_52px_rgba(124,92,252,0.3)] transition-transform duration-500 [transform:rotateY(-12deg)_rotateX(5deg)] hover:[transform:rotateY(-5deg)_rotateX(2deg)]">
            <div className="rounded-2xl border border-white/10 bg-[#111328] p-3">
              <div className="rounded-xl border border-white/10 bg-[#0d1021] px-3 py-2 text-sm text-white/70">
                Prompt: Futuristic racing car in neon rain, cinematic lighting
              </div>

              <div className="relative mt-3 h-56 overflow-hidden rounded-xl border border-white/10 bg-[radial-gradient(circle_at_25%_25%,rgba(124,92,252,0.45),transparent_45%),radial-gradient(circle_at_75%_70%,rgba(244,63,143,0.35),transparent_45%),linear-gradient(145deg,#171a31,#0f1223)]">
                <div className="absolute inset-0 animate-gradient-flow bg-[length:200%_200%] [background-image:linear-gradient(120deg,rgba(255,255,255,0.04),rgba(255,255,255,0)_40%,rgba(255,255,255,0.04))]" />
                <div className="absolute bottom-3 left-3 rounded-pill border border-white/20 bg-black/30 px-3 py-1 text-xs text-white/80 backdrop-blur-sm">
                  {statusCycle[statusIndex]}
                </div>
              </div>

              <div className="mt-3 grid grid-cols-3 gap-2 text-xs text-white/60">
                <div className="rounded-lg border border-white/10 bg-white/5 p-2">Mode: Flux</div>
                <div className="rounded-lg border border-white/10 bg-white/5 p-2">Steps: 28</div>
                <div className="rounded-lg border border-white/10 bg-white/5 p-2">CFG: 7.5</div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

