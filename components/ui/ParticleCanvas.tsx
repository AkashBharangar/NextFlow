"use client";

import { useEffect, useRef } from "react";

const N = 120;
const COLORS = [
  { r: 124, g: 92, b: 252, a: 0.7 },
  { r: 244, g: 63, b: 143, a: 0.6 },
  { r: 34, g: 212, b: 253, a: 0.6 },
  { r: 255, g: 255, b: 255, a: 0.4 },
] as const;

type Particle = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  driftVx: number;
  driftVy: number;
  r: number;
  color: (typeof COLORS)[number];
  phase: number;
  pulseSpeed: number;
};

function createParticles(width: number, height: number): Particle[] {
  const out: Particle[] = [];
  for (let i = 0; i < N; i++) {
    const c = COLORS[Math.floor(Math.random() * COLORS.length)]!;
    out.push({
      x: Math.random() * width,
      y: height + 8 + Math.random() * 24,
      vx: 0,
      vy: 0,
      driftVx: (Math.random() - 0.5) * 0.3,
      driftVy: -0.3 - Math.random() * 0.5,
      r: 1 + Math.random() * 1.5,
      color: c,
      phase: Math.random() * Math.PI * 2,
      pulseSpeed: 0.015 + Math.random() * 0.025,
    });
  }
  return out;
}

function clampMag(vx: number, vy: number, max: number) {
  const m = Math.hypot(vx, vy);
  if (m > max && m > 0) {
    return { vx: (vx / m) * max, vy: (vy / m) * max };
  }
  return { vx, vy };
}

export default function ParticleCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let W = window.innerWidth;
    let H = window.innerHeight;
    let particles = createParticles(W, H);
    const mouse = { x: 0, y: 0, active: false };
    let rafId = 0;

    function syncSize() {
      W = window.innerWidth;
      H = window.innerHeight;
      if (!canvas) return;
      canvas.width = W;
      canvas.height = H;
      particles = createParticles(W, H);
    }

    function onMouseMove(e: MouseEvent) {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
      mouse.active = true;
    }

    function onBlur() {
      mouse.active = false;
    }

    function onResize() {
      syncSize();
    }

    syncSize();

    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("blur", onBlur);
    window.addEventListener("resize", onResize);

    const t0 = performance.now();

    const animate = () => {
      const t = (performance.now() - t0) / 1000;
      ctx.clearRect(0, 0, W, H);

      for (const p of particles) {
        if (mouse.active) {
          const dx = p.x - mouse.x;
          const dy = p.y - mouse.y;
          const dist = Math.hypot(dx, dy);
          if (dist < 50 && dist > 0.001) {
            const strength = (50 - dist) * 0.06;
            p.vx += (dx / dist) * strength;
            p.vy += (dy / dist) * strength;
          }
        }

        p.vx = p.vx * 0.96 + p.driftVx * 0.04;
        p.vy = p.vy * 0.96 + p.driftVy * 0.04;

        const capped = clampMag(p.vx, p.vy, 6);
        p.vx = capped.vx;
        p.vy = capped.vy;

        p.x += p.vx;
        p.y += p.vy;

        if (p.y < -10) {
          p.y = H + 10;
          p.x = Math.random() * W;
        }
      }

      type Edge = { i: number; j: number; d: number };
      const edges: Edge[] = [];
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const a = particles[i]!;
          const b = particles[j]!;
          const d = Math.hypot(a.x - b.x, a.y - b.y);
          if (d < 90) edges.push({ i, j, d });
        }
      }
      edges.sort((a, b) => a.d - b.d);
      const connCount = new Array(particles.length).fill(0);
      ctx.lineWidth = 0.5;
      for (const e of edges) {
        if (connCount[e.i]! >= 3 || connCount[e.j]! >= 3) continue;
        const op = (1 - e.d / 90) * 0.25;
        ctx.strokeStyle = `rgba(124,92,252,${op})`;
        ctx.beginPath();
        ctx.moveTo(particles[e.i]!.x, particles[e.i]!.y);
        ctx.lineTo(particles[e.j]!.x, particles[e.j]!.y);
        ctx.stroke();
        connCount[e.i] = connCount[e.i]! + 1;
        connCount[e.j] = connCount[e.j]! + 1;
      }

      for (const p of particles) {
        const pulse = 0.55 + 0.45 * Math.sin(t * p.pulseSpeed + p.phase);
        const a = p.color.a * pulse;
        ctx.fillStyle = `rgba(${p.color.r},${p.color.g},${p.color.b},${a})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
      }

      rafId = requestAnimationFrame(animate);
    };

    rafId = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("blur", onBlur);
      window.removeEventListener("resize", onResize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none fixed inset-0 z-0 h-screen w-screen"
      aria-hidden
    />
  );
}
