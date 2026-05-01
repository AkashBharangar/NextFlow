"use client";

import { useState } from "react";

import ParticleCanvas from "@/components/ui/ParticleCanvas";

const USE_CASES = [
  {
    id: "art",
    icon: "✦",
    title: "Art & Illustration",
    desc: "Concept art, character design, creative exploration",
  },
  {
    id: "product",
    icon: "⊡",
    title: "Product Design",
    desc: "Mockups, prototypes, visual assets",
  },
  {
    id: "marketing",
    icon: "◈",
    title: "Marketing Content",
    desc: "Social posts, ads, banners, thumbnails",
  },
  {
    id: "personal",
    icon: "⊕",
    title: "Personal Projects",
    desc: "Experiments, hobbies, just for fun",
  },
];

const TEMPLATES = [
  {
    id: "txt2img",
    icon: "✦",
    title: "Text to Image",
    desc: "Describe anything, see it instantly",
    time: "~10 seconds",
  },
  {
    id: "img2video",
    icon: "▶",
    title: "Image to Video",
    desc: "Bring your stills to life with AI motion",
    time: "~45 seconds",
  },
  {
    id: "portrait",
    icon: "◉",
    title: "Portrait Enhancer",
    desc: "Upscale and beautify any portrait photo",
    time: "~20 seconds",
  },
];

const PROVIDERS = [
  {
    id: "openai",
    name: "OpenAI",
    desc: "DALL-E 3, GPT-4 Vision",
    placeholder: "sk-...",
  },
  {
    id: "replicate",
    name: "Replicate",
    desc: "Flux, SD3, and 1000+ models",
    placeholder: "r8_...",
  },
  {
    id: "stability",
    name: "Stability AI",
    desc: "Stable Diffusion 3 Ultra",
    placeholder: "sk-...",
  },
  {
    id: "fal",
    name: "Fal.ai",
    desc: "Fast inference, real-time models",
    placeholder: "fal-...",
  },
];

export default function OnboardingPage() {
  const [step, setStep] = useState(0);
  const [useCases, setUseCases] = useState<string[]>([]);
  const [template, setTemplate] = useState<string | null>(null);
  const [apiKeys, setApiKeys] = useState<Record<string, string>>({});
  const [showKey, setShowKey] = useState<Record<string, boolean>>({});

  return (
    <div className="min-h-screen bg-[#080810] flex flex-col items-center justify-center px-6 py-12 relative overflow-hidden">
      <ParticleCanvas />

      {/* Glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[500px] h-[300px] bg-purple-600/8 blur-[120px] rounded-full pointer-events-none" />

      {/* Card */}
      <div className="relative z-10 w-full max-w-[560px] bg-white/[0.03] backdrop-blur-2xl border border-white/[0.08] rounded-3xl p-10 shadow-[0_40px_80px_rgba(0,0,0,0.6)]">
        {/* Logo */}
        <div className="flex items-center justify-center gap-2 mb-8">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-purple-600 to-pink-500 flex items-center justify-center text-white font-bold text-sm">
            ✦
          </div>
          <span className="font-bold text-white text-base">Nexflow</span>
        </div>

        {/* Step dots */}
        <div className="flex items-center justify-center gap-2 mb-10">
          {[0, 1, 2, 3].map((i) => (
            <div
              key={i}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                i === step
                  ? "w-6 bg-purple-500"
                  : i < step
                    ? "w-3 bg-purple-500/50"
                    : "w-3 bg-white/[0.1]"
              }`}
            />
          ))}
        </div>

        {/* STEP 0 — Use cases */}
        {step === 0 && (
          <div>
            <h2 className="text-2xl font-bold text-white text-center tracking-tight mb-2">
              What will you create?
            </h2>
            <p className="text-white/40 text-sm text-center mb-8 leading-relaxed">
              Pick everything that applies. We'll tailor your experience.
            </p>
            <div className="grid grid-cols-2 gap-3 mb-8">
              {USE_CASES.map((uc) => (
                <button
                  key={uc.id}
                  onClick={() =>
                    setUseCases((prev) =>
                      prev.includes(uc.id)
                        ? prev.filter((x) => x !== uc.id)
                        : [...prev, uc.id],
                    )
                  }
                  className={`flex flex-col items-start gap-2 p-4 rounded-2xl border text-left transition-all duration-200 ${
                    useCases.includes(uc.id)
                      ? "bg-purple-500/[0.12] border-purple-500/50 scale-[1.02] shadow-[0_0_20px_rgba(124,92,252,0.15)]"
                      : "bg-white/[0.03] border-white/[0.08] hover:border-white/[0.16] hover:bg-white/[0.05]"
                  }`}
                >
                  <span
                    className={`text-xl ${
                      useCases.includes(uc.id) ? "text-purple-400" : "text-white/30"
                    }`}
                  >
                    {uc.icon}
                  </span>
                  <span className="text-sm font-semibold text-white">
                    {uc.title}
                  </span>
                  <span className="text-xs text-white/35 leading-relaxed">
                    {uc.desc}
                  </span>
                </button>
              ))}
            </div>
            <button
              onClick={() => setStep(1)}
              disabled={useCases.length === 0}
              className="w-full bg-gradient-to-r from-purple-600 to-pink-500 text-white font-semibold py-3 rounded-xl text-sm hover:from-purple-500 hover:to-pink-400 hover:shadow-[0_0_30px_rgba(124,92,252,0.4)] disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-200"
            >
              Continue →
            </button>
          </div>
        )}

        {/* STEP 1 — Template */}
        {step === 1 && (
          <div>
            <h2 className="text-2xl font-bold text-white text-center tracking-tight mb-2">
              Pick your first template
            </h2>
            <p className="text-white/40 text-sm text-center mb-8">
              You can always switch later.
            </p>
            <div className="flex flex-col gap-3 mb-8">
              {TEMPLATES.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setTemplate(t.id)}
                  className={`flex items-center gap-4 p-4 rounded-2xl border text-left transition-all duration-200 ${
                    template === t.id
                      ? "bg-purple-500/[0.12] border-purple-500/50 shadow-[0_0_20px_rgba(124,92,252,0.12)]"
                      : "bg-white/[0.03] border-white/[0.08] hover:border-white/[0.14]"
                  }`}
                >
                  <div
                    className={`w-11 h-11 rounded-xl flex items-center justify-center text-xl shrink-0 ${
                      template === t.id
                        ? "bg-purple-500/20 text-purple-400"
                        : "bg-white/[0.05] text-white/30"
                    }`}
                  >
                    {t.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-white">{t.title}</p>
                    <p className="text-xs text-white/40 mt-0.5">{t.desc}</p>
                  </div>
                  <span className="text-[11px] text-white/25 shrink-0 bg-white/[0.04] px-2 py-1 rounded-lg">
                    {t.time}
                  </span>
                </button>
              ))}
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setStep(0)}
                className="px-5 py-3 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white/50 text-sm hover:text-white hover:bg-white/[0.08] transition-all"
              >
                ← Back
              </button>
              <button
                onClick={() => setStep(2)}
                disabled={!template}
                className="flex-1 bg-gradient-to-r from-purple-600 to-pink-500 text-white font-semibold py-3 rounded-xl text-sm hover:from-purple-500 hover:to-pink-400 disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-200"
              >
                Continue →
              </button>
            </div>
          </div>
        )}

        {/* STEP 2 — API Keys */}
        {step === 2 && (
          <div>
            <h2 className="text-2xl font-bold text-white text-center tracking-tight mb-2">
              Connect your providers
            </h2>
            <p className="text-white/40 text-sm text-center mb-8 leading-relaxed">
              Optional — skip to use Nexflow credits instead.
            </p>
            <div className="flex flex-col gap-3 mb-8">
              {PROVIDERS.map((p) => (
                <div
                  key={p.id}
                  className="bg-white/[0.03] border border-white/[0.07] rounded-2xl p-4"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <p className="text-sm font-semibold text-white">{p.name}</p>
                      <p className="text-xs text-white/35 mt-0.5">{p.desc}</p>
                    </div>
                    <span
                      className={`text-[11px] px-2.5 py-1 rounded-full border font-medium ${
                        apiKeys[p.id]
                          ? "bg-green-500/10 border-green-500/25 text-green-400"
                          : "bg-white/[0.04] border-white/[0.09] text-white/30"
                      }`}
                    >
                      {apiKeys[p.id] ? "Connected" : "Not connected"}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <input
                        type={showKey[p.id] ? "text" : "password"}
                        placeholder={p.placeholder}
                        value={apiKeys[p.id] || ""}
                        onChange={(e) =>
                          setApiKeys((prev) => ({ ...prev, [p.id]: e.target.value }))
                        }
                        className="w-full bg-black/30 border border-white/[0.08] rounded-xl px-3 py-2.5 text-white text-xs font-mono placeholder:text-white/20 focus:outline-none focus:border-purple-500/40 transition-all"
                      />
                      <button
                        onClick={() =>
                          setShowKey((prev) => ({ ...prev, [p.id]: !prev[p.id] }))
                        }
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-white/25 hover:text-white/60 text-xs transition-colors"
                      >
                        {showKey[p.id] ? "Hide" : "Show"}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setStep(1)}
                className="px-5 py-3 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white/50 text-sm hover:text-white hover:bg-white/[0.08] transition-all"
              >
                ← Back
              </button>
              <button
                onClick={() => setStep(3)}
                className="flex-1 bg-gradient-to-r from-purple-600 to-pink-500 text-white font-semibold py-3 rounded-xl text-sm hover:from-purple-500 hover:to-pink-400 transition-all duration-200"
              >
                Continue →
              </button>
            </div>
            <button
              onClick={() => setStep(3)}
              className="w-full mt-3 text-white/25 text-sm hover:text-white/50 transition-colors py-2"
            >
              Skip for now
            </button>
          </div>
        )}

        {/* STEP 3 — Done */}
        {step === 3 && (
          <div className="text-center">
            <div className="relative inline-flex items-center justify-center mb-8">
              <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-purple-600 to-pink-500 flex items-center justify-center text-white text-3xl shadow-[0_0_60px_rgba(124,92,252,0.5)] animate-[float_3s_ease-in-out_infinite]">
                ✦
              </div>
              <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-purple-600/30 to-pink-500/30 blur-xl animate-pulse" />
            </div>
            <h2 className="text-2xl font-bold text-white tracking-tight mb-3">
              Your canvas is ready.
            </h2>
            <p className="text-white/40 text-sm mb-2 leading-relaxed">
              You're set up for{" "}
              <span className="text-purple-400 font-medium">
                {USE_CASES.filter((u) => useCases.includes(u.id))
                  .map((u) => u.title)
                  .join(", ")}
              </span>
            </p>
            <p className="text-white/30 text-sm mb-10">
              Starting with{" "}
              <span className="text-white/60 font-medium">
                {TEMPLATES.find((t) => t.id === template)?.title}
              </span>
            </p>
            <a
              href="/dashboard"
              className="block w-full bg-gradient-to-r from-purple-600 to-pink-500 text-white font-semibold py-3.5 rounded-xl text-sm text-center hover:from-purple-500 hover:to-pink-400 hover:shadow-[0_0_40px_rgba(124,92,252,0.5)] hover:scale-[1.02] transition-all duration-200"
            >
              Open my canvas →
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
