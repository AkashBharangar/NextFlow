"use client";

import { useState, type MouseEvent } from "react";
import { motion } from "framer-motion";

import { Card } from "@/components/ui/Card";
import { SectionLabel } from "@/components/ui/SectionLabel";

const features = [
  {
    title: "Real-time generation",
    description: "Create visual outputs in seconds with live refinement as prompts evolve.",
    color: "purple",
    icon: "⚡",
  },
  {
    title: "Generative canvas",
    description: "Compose ideas in layers with prompt regions, masks, and iterative controls.",
    color: "pink",
    icon: "✦",
  },
  {
    title: "Video generation",
    description: "Turn still concepts into dynamic clips with smooth motion-aware rendering.",
    color: "cyan",
    icon: "▶",
  },
  {
    title: "4K upscaling",
    description: "Enhance details and clarity for production-grade exports in one click.",
    color: "orange",
    icon: "⬚",
  },
  {
    title: "Custom model training",
    description: "Fine-tune style-specific models to match your brand and creative direction.",
    color: "yellow",
    icon: "◎",
  },
  {
    title: "Node workflows",
    description: "Build reusable visual pipelines that automate generation, edits, and exports.",
    color: "green",
    icon: "⌘",
  },
] as const;

const iconColorMap: Record<(typeof features)[number]["color"], string> = {
  purple: "from-purple/35 to-purple/10 text-purple border-purple/35",
  pink: "from-pink-ai/35 to-pink-ai/10 text-pink-ai border-pink-ai/35",
  cyan: "from-cyan-ai/35 to-cyan-ai/10 text-cyan-ai border-cyan-ai/35",
  orange: "from-orange-ai/35 to-orange-ai/10 text-orange-ai border-orange-ai/35",
  yellow: "from-yellow-300/35 to-yellow-300/10 text-yellow-200 border-yellow-300/35",
  green: "from-emerald-400/35 to-emerald-400/10 text-emerald-300 border-emerald-400/35",
};

export function Features() {
  return (
    <section className="px-4 py-20 sm:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-6xl">
        <div className="text-center">
          <SectionLabel>Everything you need</SectionLabel>
          <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-white sm:text-5xl">
            One canvas. Infinite possibilities.
          </h2>
        </div>

        <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, index) => (
            <FeatureCard key={feature.title} index={index} {...feature} />
          ))}
        </div>
      </div>
    </section>
  );
}

function FeatureCard({
  title,
  description,
  color,
  icon,
  index,
}: (typeof features)[number] & { index: number }) {
  const [tilt, setTilt] = useState({ x: 0, y: 0 });

  const onMove = (event: MouseEvent<HTMLDivElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const px = (event.clientX - rect.left) / rect.width;
    const py = (event.clientY - rect.top) / rect.height;
    setTilt({
      x: Math.max(-10, Math.min(10, (0.5 - py) * 20)),
      y: Math.max(-10, Math.min(10, (px - 0.5) * 20)),
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 26 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.25 }}
      transition={{ duration: 0.55, delay: index * 0.08 }}
      style={{
        transform: `perspective(1000px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`,
      }}
      onMouseMove={onMove}
      onMouseLeave={() => setTilt({ x: 0, y: 0 })}
      className="-translate-y-0 transition-transform duration-200 ease-out hover:-translate-y-2"
    >
      <Card variant="glow" className="h-full">
        <div
          className={`mb-4 inline-flex h-11 w-11 items-center justify-center rounded-xl border bg-gradient-to-b text-lg ${iconColorMap[color]}`}
        >
          {icon}
        </div>
        <h3 className="text-lg font-bold text-white">{title}</h3>
        <p className="mt-2 text-sm leading-relaxed text-white/65">{description}</p>
      </Card>
    </motion.div>
  );
}

