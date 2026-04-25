"use client";

import { motion } from "framer-motion";

import { SectionLabel } from "@/components/ui/SectionLabel";

const cards = [
  {
    label: "Neon City Portrait",
    model: "Flux Pro",
    gradient:
      "bg-[radial-gradient(circle_at_20%_20%,rgba(124,92,252,0.55),transparent_45%),radial-gradient(circle_at_75%_80%,rgba(34,212,253,0.42),transparent_40%),linear-gradient(145deg,#171728,#0d0f1c)]",
    base: "rotateY(12deg) rotateX(-5deg) scale(0.94)",
  },
  {
    label: "Dreamscape Motion",
    model: "Kling 1.6",
    gradient:
      "bg-[radial-gradient(circle_at_30%_30%,rgba(244,63,143,0.5),transparent_45%),radial-gradient(circle_at_80%_70%,rgba(124,92,252,0.52),transparent_42%),linear-gradient(145deg,#181627,#0d0f1b)]",
    base: "rotateY(0deg) rotateX(-3deg) translateZ(40px) scale(1)",
  },
  {
    label: "Solar Drift Sequence",
    model: "Runway Gen",
    gradient:
      "bg-[radial-gradient(circle_at_70%_25%,rgba(255,107,53,0.52),transparent_45%),radial-gradient(circle_at_20%_75%,rgba(34,212,253,0.4),transparent_40%),linear-gradient(145deg,#171626,#0d0e1a)]",
    base: "rotateY(-12deg) rotateX(-5deg) scale(0.94)",
  },
] as const;

export function Showcase() {
  return (
    <section className="px-4 py-20 sm:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-6xl">
        <div className="text-center">
          <SectionLabel>Showcase</SectionLabel>
          <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-white sm:text-5xl">
            Made on nexflow
          </h2>
        </div>

        <div className="mt-14 [perspective:1400px]">
          <div className="grid gap-6 lg:grid-cols-3">
            {cards.map((card, index) => (
              <motion.div
                key={card.label}
                initial={{ opacity: 0, y: 26 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.25 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className={`${index === 1 ? "lg:z-20" : ""}`}
              >
                <div
                  className={`group relative h-[390px] overflow-hidden rounded-card border border-white/15 ${card.gradient} shadow-card transition-all duration-500 [transform-style:preserve-3d] hover:z-50 hover:[transform:rotateX(0deg)_rotateY(0deg)_translateZ(60px)_scale(1.05)] hover:shadow-[0_70px_120px_rgba(0,0,0,0.58),0_0_55px_rgba(124,92,252,0.42)]`}
                  style={{ transform: card.base }}
                >
                  <div className="absolute inset-0 opacity-80">
                    <span className="absolute left-[20%] top-[22%] h-20 w-20 animate-float rounded-full bg-white/12 blur-sm" />
                    <span className="absolute right-[18%] top-[30%] h-14 w-14 animate-float rounded-full bg-purple/35 blur-sm [animation-delay:0.7s]" />
                    <span className="absolute bottom-[20%] left-[35%] h-16 w-16 animate-float rounded-full bg-cyan-ai/30 blur-sm [animation-delay:1.1s]" />
                  </div>

                  <div className="absolute inset-x-0 bottom-0 border-t border-white/15 bg-black/35 p-4 backdrop-blur-md">
                    <p className="text-sm font-semibold text-white">{card.label}</p>
                    <p className="mt-1 text-xs text-white/65">{card.model}</p>
                  </div>

                  <div className="pointer-events-none absolute inset-0 transition-all duration-500 group-hover:shadow-[inset_0_0_120px_rgba(124,92,252,0.2)]" />
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

