"use client";

import { motion } from "framer-motion";
import { useRouter } from "next/navigation";

import { HeroCanvasPreview } from "@/components/sections/HeroCanvasPreview";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { ClientParticleCanvas } from "@/components/ui/ClientParticleCanvas";
import { GradientText } from "@/components/ui/GradientText";

export function Hero() {
  const router = useRouter();

  return (
    <section className="relative flex min-h-screen items-center justify-center overflow-hidden px-4 pb-10 pt-[120px] sm:px-6 lg:px-8">
      <ClientParticleCanvas />

      <div className="relative z-10 mx-auto flex w-full max-w-6xl flex-col items-center text-center">
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
        >
          <Badge label="Now with real-time video generation" color="purple" />
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 26 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.12 }}
          className="mt-7 font-extrabold leading-[0.96] tracking-tight text-[clamp(48px,7vw,90px)]"
        >
          <GradientText>Create without limits.</GradientText>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.32 }}
          className="mt-6 max-w-[540px] text-base text-white/68 sm:text-lg"
        >
          Build visuals, animations, and cinematic ideas in one dark creative studio designed for
          rapid AI iteration.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: 0.42 }}
          className="mt-8 flex flex-wrap items-center justify-center gap-3"
        >
          <Button size="lg" onClick={() => router.push("/dashboard/generate")}>
            Open canvas -&gt;
          </Button>
          <Button size="lg" variant="secondary">
            ▶ Watch demo
          </Button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 22 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.65, delay: 0.5 }}
          className="mt-12 w-full"
        >
          <HeroCanvasPreview />
        </motion.div>
      </div>
    </section>
  );
}

