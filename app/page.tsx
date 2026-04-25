"use client";

import { Footer } from "@/components/layout/Footer";
import { Navbar } from "@/components/layout/Navbar";
import ParticleCanvas from "@/components/ui/ParticleCanvas";

export default function HomePage() {
  return (
    <main className="min-h-screen overflow-x-hidden bg-[#080810]">
      <ParticleCanvas />
      <Navbar />

      <section className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-6 pb-16 pt-24 text-center">
        <div className="pointer-events-none absolute left-1/2 top-1/4 h-[400px] w-[800px] -translate-x-1/2 rounded-full bg-purple-600/10 blur-[140px]" />
        <div className="pointer-events-none absolute bottom-0 right-0 h-[400px] w-[400px] rounded-full bg-pink-600/10 blur-[120px]" />

        <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-purple-500/20 bg-purple-500/[0.08] px-4 py-2 text-xs text-white/60 backdrop-blur-sm">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-purple-400" />
          Now with real-time video generation
        </div>

        <h1 className="mb-6 max-w-4xl text-[clamp(48px,7vw,88px)] font-extrabold leading-[1.02] tracking-[-3px]">
          <span className="text-white">Create without</span>
          <br />
          <span className="animate-gradFlow bg-gradient-to-r from-white via-purple-300 to-pink-400 bg-[length:200%_200%] bg-clip-text text-transparent">
            limits.
          </span>
        </h1>

        <p className="mb-10 max-w-[500px] text-lg leading-relaxed text-white/45">
          The AI-powered creative canvas where imagination meets execution.
          Generate, edit, and animate — in real time.
        </p>

        <div className="mb-20 flex flex-wrap items-center justify-center gap-3">
          <a
            href="/auth/signin"
            className="rounded-full bg-gradient-to-r from-purple-600 to-pink-500 px-8 py-3.5 text-base font-semibold text-white transition-all duration-200 hover:scale-105 hover:shadow-[0_0_40px_rgba(124,92,252,0.5)]"
          >
            Open canvas →
          </a>
          <button
            type="button"
            className="rounded-full border border-white/[0.1] bg-white/[0.05] px-7 py-3.5 text-base text-white/75 transition-all duration-200 hover:border-white/20 hover:bg-white/[0.09]"
          >
            ▶ Watch demo
          </button>
        </div>

        <div className="relative z-10 w-full max-w-5xl perspective-[1200px]">
          <div className="overflow-hidden rounded-2xl border border-purple-500/[0.18] bg-[#0d0d1e] shadow-[0_80px_160px_rgba(0,0,0,0.85),0_0_80px_rgba(124,92,252,0.12),inset_0_1px_0_rgba(255,255,255,0.06)] transition-transform duration-700 ease-out [transform:rotateX(16deg)_rotateY(-3deg)] hover:[transform:rotateX(6deg)_rotateY(0deg)]">
            <div className="flex items-center gap-3 border-b border-white/[0.05] bg-white/[0.03] px-4 py-3">
              <div className="flex gap-1.5">
                <span className="h-3 w-3 rounded-full bg-[#ff5f57]" />
                <span className="h-3 w-3 rounded-full bg-[#febc2e]" />
                <span className="h-3 w-3 rounded-full bg-[#28c840]" />
              </div>
              <div className="flex flex-1 justify-center gap-1.5">
                {["Generate", "Edit", "Animate", "Upscale"].map((m, i) => (
                  <span
                    key={m}
                    className={`rounded-full border px-3 py-1 text-xs transition-colors ${
                      i === 0
                        ? "border-purple-500/40 bg-purple-500/20 text-white"
                        : "border-white/[0.08] bg-white/[0.04] text-white/40"
                    }`}
                  >
                    {m}
                  </span>
                ))}
              </div>
              <span className="text-xs text-white/20">⌘K</span>
            </div>

            <div className="flex h-[340px]">
              <div className="flex w-12 flex-col items-center gap-2 border-r border-white/[0.05] bg-white/[0.02] py-3">
                {["✦", "⊡", "✎", "⊕", "◈"].map((ic, i) => (
                  <div
                    key={i}
                    className={`flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg text-sm transition-colors ${
                      i === 0
                        ? "bg-purple-500/25 text-white"
                        : "text-white/30 hover:bg-white/[0.06]"
                    }`}
                  >
                    {ic}
                  </div>
                ))}
              </div>

              <div className="relative flex-1 overflow-hidden bg-[#08081a]">
                <div
                  className="absolute inset-0 opacity-100"
                  style={{
                    backgroundImage:
                      "radial-gradient(circle, rgba(124,92,252,0.12) 1px, transparent 1px)",
                    backgroundSize: "32px 32px",
                  }}
                />
                <div className="absolute left-1/2 top-1/2 h-44 w-44 -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-2xl shadow-[0_0_60px_rgba(124,92,252,0.5),0_0_120px_rgba(244,63,143,0.2)]">
                  <div className="h-full w-full bg-gradient-to-br from-[#1a0a3e] via-[#7c1fa8] to-[#f43f8f]" />
                </div>
                <div className="absolute bottom-4 left-1/2 flex w-80 -translate-x-1/2 items-center gap-3 rounded-full border border-white/[0.09] bg-[#0a0a18]/90 px-4 py-2.5 backdrop-blur-xl">
                  <span className="text-sm text-purple-400">✦</span>
                  <span className="flex-1 text-xs text-white/40">
                    Cosmic nebula, bioluminescent…
                  </span>
                  <span className="rounded-full bg-gradient-to-r from-purple-600 to-pink-500 px-3 py-1 text-[11px] font-semibold text-white">
                    Generate
                  </span>
                </div>
              </div>

              <div className="flex w-52 flex-col gap-4 border-l border-white/[0.05] bg-white/[0.02] p-3">
                <div>
                  <p className="mb-2 text-[10px] uppercase tracking-widest text-white/25">
                    Model
                  </p>
                  <div className="rounded-xl border border-purple-500/20 bg-purple-500/10 p-2.5">
                    <p className="text-xs font-semibold text-purple-300">
                      Flux Pro 1.1
                    </p>
                    <p className="mt-0.5 text-[11px] text-white/30">Best quality</p>
                  </div>
                </div>
                <div>
                  <p className="mb-2 text-[10px] uppercase tracking-widest text-white/25">
                    Style
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {["Cinematic", "Anime", "3D", "Photo"].map((s, i) => (
                      <span
                        key={s}
                        className={`rounded-full border px-2 py-1 text-[11px] ${
                          i === 0
                            ? "border-purple-500/35 bg-purple-500/15 text-purple-300"
                            : "border-white/[0.08] bg-white/[0.04] text-white/35"
                        }`}
                      >
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="mb-2 text-[10px] uppercase tracking-widest text-white/25">
                    Steps
                  </p>
                  <div className="flex items-center gap-2">
                    <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/[0.07]">
                      <div className="h-full w-[70%] rounded-full bg-gradient-to-r from-purple-600 to-pink-500" />
                    </div>
                    <span className="text-xs font-semibold text-white/60">28</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="px-6 py-20">
        <div className="mx-auto flex max-w-4xl flex-wrap justify-center gap-16">
          {(
            [
              ["2M+", "Creators worldwide"],
              ["500M", "Images generated"],
              ["<1s", "Generation latency"],
              ["40+", "AI models"],
            ] as const
          ).map(([num, label]) => (
            <div key={label} className="text-center">
              <div className="bg-gradient-to-b from-white to-white/30 bg-clip-text text-5xl font-extrabold tracking-tight text-transparent">
                {num}
              </div>
              <div className="mt-2 text-sm text-white/35">{label}</div>
            </div>
          ))}
        </div>
      </section>

      <section id="features" className="px-6 py-24">
        <div className="mx-auto max-w-6xl">
          <div className="mb-16 text-center">
            <p className="mb-4 text-xs font-semibold uppercase tracking-[3px] text-purple-400">
              Everything you need
            </p>
            <h2 className="text-[clamp(32px,4vw,52px)] font-extrabold tracking-tight text-white">
              One canvas.
              <br />
              Infinite possibilities.
            </h2>
          </div>
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
            {(
              [
                {
                  icon: "✦",
                  title: "Real-time generation",
                  desc: "Results update as you type. No waiting, no refresh — pure flow.",
                },
                {
                  icon: "◈",
                  title: "Generative canvas",
                  desc: "Paint with AI. Inpaint, outpaint, transform any region.",
                },
                {
                  icon: "▶",
                  title: "Video generation",
                  desc: "Bring stills to life with cinematic AI motion.",
                },
                {
                  icon: "⊡",
                  title: "4K upscaling",
                  desc: "Real-ESRGAN upscaling that adds genuine detail.",
                },
                {
                  icon: "⊕",
                  title: "Custom model training",
                  desc: "Train LoRAs on your style. Your AI, your aesthetic.",
                },
                {
                  icon: "⬡",
                  title: "Node workflows",
                  desc: "Chain models into visual pipelines. Automate creativity.",
                },
              ] as const
            ).map((f) => (
              <div
                key={f.title}
                className="group cursor-pointer rounded-2xl border border-white/[0.07] bg-white/[0.03] p-7 transition-all duration-300 hover:-translate-y-2 hover:border-purple-500/25 hover:shadow-[0_40px_80px_rgba(0,0,0,0.4)]"
              >
                <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-2xl bg-purple-500/10 text-xl transition-colors group-hover:bg-purple-500/20">
                  {f.icon}
                </div>
                <h3 className="mb-2 font-bold text-white">{f.title}</h3>
                <p className="text-sm leading-relaxed text-white/40">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="px-6 py-32">
        <div className="relative mx-auto max-w-3xl">
          <div className="pointer-events-none absolute inset-0 rounded-3xl bg-purple-600/10 blur-[80px]" />
          <div className="relative rounded-[2rem] border border-purple-500/[0.18] bg-white/[0.03] p-16 text-center shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]">
            <p className="mb-5 text-xs font-semibold uppercase tracking-[3px] text-purple-400">
              Get started free
            </p>
            <h2 className="mb-5 text-[clamp(32px,4vw,52px)] font-extrabold tracking-tight text-white">
              Your ideas deserve
              <br />
              <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                a better canvas.
              </span>
            </h2>
            <p className="mx-auto mb-10 max-w-md text-base leading-relaxed text-white/40">
              Join 2 million creators already building the impossible. No credit
              card required.
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <a
                href="/auth/signin"
                className="rounded-full bg-gradient-to-r from-purple-600 to-pink-500 px-8 py-3.5 font-semibold text-white transition-all duration-200 hover:scale-105 hover:shadow-[0_0_40px_rgba(124,92,252,0.5)]"
              >
                Start for free →
              </a>
              <a
                href="/pricing"
                className="rounded-full border border-white/[0.1] bg-white/[0.05] px-7 py-3.5 text-white/70 transition-all duration-200 hover:bg-white/[0.09]"
              >
                See pricing
              </a>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
