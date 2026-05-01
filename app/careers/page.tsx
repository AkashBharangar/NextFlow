"use client";

import { Footer } from "@/components/layout/Footer";
import { Navbar } from "@/components/layout/Navbar";

export default function CareersPage() {
  return (
    <div className="min-h-screen bg-[#080810] flex flex-col relative overflow-hidden">
      <Navbar />

      {/* Decorative blobs */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-purple-600/8 blur-[120px] rounded-full pointer-events-none" />

      {/* Content — vertically centered */}
      <div className="flex-1 flex flex-col items-center justify-center text-center px-6 pt-40 relative z-10">
        {/* Icon */}
        <div className=" bg-gradient-to-br from-purple-600/20 to-pink-500/20 border border-purple-500/20 flex items-center justify-center text-2xl mb-8 shadow-[0_0_40px_rgba(124,92,252,0.15)]">
           
        </div>

        {/* Badge */}
        <div className="inline-flex items-center gap-2 bg-purple-500/[0.08] border border-purple-500/20 text-purple-400 text-xs px-4 py-2 rounded-full mb-8 font-medium tracking-wide">
          <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-pulse" />
          We're hiring
        </div>

        <h1 className="text-[clamp(32px,5vw,56px)] font-extrabold tracking-tight text-white mb-4 leading-tight">
          Build the future of
          <br />
          <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            AI creativity.
          </span>
        </h1>

        <p className="text-white/40 text-lg max-w-md leading-relaxed mb-10">
          We're a small team building tools that help creators do more with AI.
          If that excites you, we'd love to hear from you.
        </p>

        {/* Feature pills */}
        <div className="flex flex-wrap justify-center gap-3 mb-12">
          {[
            "Full-stack Engineer",
            "ML Engineer",
            "Product Designer",
            "Developer Advocate",
            "Growth",
          ].map((f) => (
            <span
              key={f}
              className="text-sm text-white/50 bg-white/[0.04] border border-white/[0.08] px-4 py-2 rounded-full"
            >
              {f}
            </span>
          ))}
        </div>

        <a
          href="mailto:careers@nexflow.ai"
          className="bg-gradient-to-r from-purple-600 to-pink-500 text-white font-semibold text-sm px-6 py-3 rounded-xl hover:from-purple-500 hover:to-pink-400 hover:shadow-[0_0_20px_rgba(124,92,252,0.4)] transition-all duration-200"
        >
          Send us your work →
        </a>
        <p className="text-white/20 text-xs mt-3">
          No formal job openings yet — but we read every email.
        </p>
      </div>

      <Footer />
    </div>
  );
}
