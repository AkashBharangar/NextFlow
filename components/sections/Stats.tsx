"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";

import { GradientText } from "@/components/ui/GradientText";

type CountUpOptions = {
  end: number;
  duration?: number;
  decimals?: number;
};

function useCountUp({ end, duration = 1300, decimals = 0 }: CountUpOptions) {
  const [value, setValue] = useState(0);
  const [hasStarted, setHasStarted] = useState(false);
  const targetRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const node = targetRef.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setHasStarted(true);
          observer.disconnect();
        }
      },
      { threshold: 0.35 },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!hasStarted) return;

    let frame = 0;
    const start = performance.now();
    const step = (now: number) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(end * eased);
      if (progress < 1) {
        frame = requestAnimationFrame(step);
      }
    };

    frame = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frame);
  }, [duration, end, hasStarted]);

  const formatted = useMemo(() => value.toFixed(decimals), [decimals, value]);
  return { formatted, targetRef, hasStarted };
}

const stats = [
  { prefix: "", value: 2, suffix: "M+", label: "Creators", decimals: 1 },
  { prefix: "", value: 500, suffix: "M", label: "Images generated", decimals: 0 },
  { prefix: "<", value: 1, suffix: "s", label: "Latency", decimals: 1 },
  { prefix: "", value: 40, suffix: "+", label: "AI models", decimals: 0 },
] as const;

export function Stats() {
  return (
    <section className="px-4 py-20 sm:px-6 lg:px-8">
      <div className="mx-auto grid w-full max-w-6xl gap-8 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, index) => (
          <StatItem key={stat.label} index={index} {...stat} />
        ))}
      </div>
    </section>
  );
}

type StatItemProps = (typeof stats)[number] & {
  index: number;
};

function StatItem({ prefix, value, suffix, label, decimals, index }: StatItemProps) {
  const { formatted, targetRef, hasStarted } = useCountUp({ end: value, decimals });
  return (
    <motion.div
      ref={targetRef}
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.35 }}
      transition={{ duration: 0.55, delay: index * 0.1 }}
      className="text-center"
    >
      <p className="text-4xl font-extrabold tracking-tight sm:text-5xl">
        <GradientText>
          {prefix}
          {hasStarted ? formatted : "0"}
          {suffix}
        </GradientText>
      </p>
      <p className="mt-2 text-sm text-white/62">{label}</p>
    </motion.div>
  );
}

