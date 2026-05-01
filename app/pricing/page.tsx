"use client";

import { useState } from "react";

import { Footer } from "@/components/layout/Footer";
import { Navbar } from "@/components/layout/Navbar";
import ParticleCanvas from "@/components/ui/ParticleCanvas";

type BillingCycle = "monthly" | "annual";

type Plan = {
  name: string;
  price: { monthly: number; annual: number };
  description: string;
  cta: string;
  href: string;
  featured: boolean;
  badge?: string;
  features: { text: string; included: boolean }[];
};

const plans: Plan[] = [
  {
    name: "Free",
    price: { monthly: 0, annual: 0 },
    description: "Perfect for exploring what's possible.",
    cta: "Get started",
    href: "/auth/signin",
    featured: false,
    features: [
      { text: "50 generations / month", included: true },
      { text: "720p max resolution", included: true },
      { text: "3 workflows", included: true },
      { text: "Community models only", included: true },
      { text: "Video generation", included: false },
      { text: "Custom model training", included: false },
      { text: "API access", included: false },
      { text: "Priority queue", included: false },
      { text: "Commercial license", included: false },
    ],
  },
  {
    name: "Pro",
    price: { monthly: 29, annual: 19 },
    description: "For creators who move fast and ship often.",
    cta: "Start free trial",
    href: "/auth/signin",
    featured: true,
    badge: "Most popular",
    features: [
      { text: "2,000 generations / month", included: true },
      { text: "4K max resolution", included: true },
      { text: "Unlimited workflows", included: true },
      { text: "All models including Flux Pro", included: true },
      { text: "Video generation", included: true },
      { text: "Custom model training", included: true },
      { text: "API access", included: true },
      { text: "Priority queue", included: true },
      { text: "Commercial license", included: true },
    ],
  },
  {
    name: "Enterprise",
    price: { monthly: 99, annual: 79 },
    description: "For teams building at scale.",
    cta: "Contact us",
    href: "mailto:hello@nexflow.ai",
    featured: false,
    features: [
      { text: "Unlimited generations", included: true },
      { text: "4K max resolution", included: true },
      { text: "Unlimited workflows", included: true },
      { text: "All models + early access", included: true },
      { text: "Video generation", included: true },
      { text: "Custom model training", included: true },
      { text: "API access", included: true },
      { text: "Priority queue", included: true },
      { text: "Commercial license", included: true },
    ],
  },
];

const faqs = [
  {
    q: "Can I cancel anytime?",
    a: "Yes. Cancel from your billing settings any time — no questions asked. You keep access until the end of your billing period.",
  },
  {
    q: "What counts as a generation?",
    a: "Each image, video frame set, or upscale job counts as one generation. Saving, downloading, and editing do not count.",
  },
  {
    q: "Do unused generations roll over?",
    a: "No, generations reset at the start of each billing cycle. Upgrade to Pro for a much higher limit.",
  },
  {
    q: "Can I use outputs commercially?",
    a: "Pro and Enterprise plans include a full commercial license. Free plan outputs are for personal use only.",
  },
  {
    q: "Do you offer refunds?",
    a: "We offer a full refund within 7 days of your first payment if you are not satisfied.",
  },
];

export default function PricingPage() {
  const [billingCycle, setBillingCycle] = useState<BillingCycle>("monthly");
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <div className="min-h-screen bg-[#080810] relative overflow-hidden">
      <ParticleCanvas />
      <Navbar />

      {/* Hero */}
      <section className="relative z-10 pt-36 pb-16 px-6 text-center">
        {/* Glow blob */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-purple-600/10 blur-[100px] rounded-full pointer-events-none" />

        <p className="text-purple-400 text-xs font-semibold uppercase tracking-[3px] mb-5">
          Pricing
        </p>

        <h1 className="text-[clamp(36px,5vw,60px)] font-extrabold tracking-tight text-white mb-4 leading-tight">
          Simple pricing.
          <br />
          <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            Unlimited creativity.
          </span>
        </h1>

        <p className="text-white/40 text-lg max-w-md mx-auto mb-10 leading-relaxed">
          Start free. Upgrade when you need more power.
        </p>

        {/* Billing toggle */}
        <div className="inline-flex items-center gap-3 bg-white/[0.04] border border-white/[0.08] rounded-full p-1.5">
          {(["monthly", "annual"] as const).map((cycle) => (
            <button
              key={cycle}
              onClick={() => setBillingCycle(cycle)}
              className={`px-5 py-2 rounded-full text-sm font-medium transition-all duration-200 flex items-center gap-2 ${
                billingCycle === cycle
                  ? "bg-white/[0.1] text-white shadow-sm"
                  : "text-white/40 hover:text-white/70"
              }`}
            >
              {cycle === "monthly" ? (
                "Monthly"
              ) : (
                <>
                  Annual{" "}
                  <span className="text-[11px] bg-green-500/15 text-green-400 border border-green-500/25 px-2 py-0.5 rounded-full font-semibold">
                    Save 20%
                  </span>
                </>
              )}
            </button>
          ))}
        </div>
      </section>

      {/* Pricing cards */}
      <section className="relative z-10 px-6 pb-24">
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-5 items-start">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`relative rounded-3xl p-8 transition-all duration-300 ${
                plan.featured
                  ? "bg-gradient-to-b from-purple-950/60 to-[#0d0d1e] border-2 border-purple-500/40 shadow-[0_0_60px_rgba(124,92,252,0.2)] scale-[1.03]"
                  : "bg-white/[0.03] border border-white/[0.08] hover:border-white/[0.14]"
              }`}
            >
              {/* Featured badge */}
              {plan.badge && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-gradient-to-r from-purple-600 to-pink-500 text-white text-xs font-bold px-4 py-1.5 rounded-full shadow-[0_0_20px_rgba(124,92,252,0.5)]">
                  {plan.badge}
                </div>
              )}

              {/* Plan name */}
              <p
                className={`text-sm font-semibold mb-1 ${
                  plan.featured ? "text-purple-300" : "text-white/50"
                }`}
              >
                {plan.name}
              </p>

              {/* Price */}
              <div className="flex items-end gap-1.5 mb-2">
                <span className="text-5xl font-extrabold tracking-tight text-white">
                  $
                  {billingCycle === "monthly"
                    ? plan.price.monthly
                    : plan.price.annual}
                </span>
                {plan.price.monthly > 0 && (
                  <span className="text-white/30 text-sm mb-2">/mo</span>
                )}
              </div>

              <p className="text-white/40 text-sm mb-8 leading-relaxed">
                {plan.description}
              </p>

              {/* CTA */}
              <a
                href={plan.href}
                className={`block w-full text-center font-semibold text-sm py-3 rounded-xl mb-8 transition-all duration-200 ${
                  plan.featured
                    ? "bg-gradient-to-r from-purple-600 to-pink-500 text-white hover:from-purple-500 hover:to-pink-400 hover:shadow-[0_0_30px_rgba(124,92,252,0.4)]"
                    : "bg-white/[0.06] border border-white/[0.1] text-white/80 hover:bg-white/[0.1]"
                }`}
              >
                {plan.cta}
              </a>

              {/* Divider */}
              <div className="h-px bg-white/[0.06] mb-6" />

              {/* Features */}
              <ul className="flex flex-col gap-3">
                {plan.features.map((f) => (
                  <li key={f.text} className="flex items-center gap-3">
                    <span
                      className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] shrink-0 ${
                        f.included
                          ? "bg-purple-500/20 text-purple-400"
                          : "bg-white/[0.04] text-white/20"
                      }`}
                    >
                      {f.included ? "✓" : "✕"}
                    </span>
                    <span
                      className={`text-sm ${
                        f.included
                          ? "text-white/70"
                          : "text-white/25 line-through"
                      }`}
                    >
                      {f.text}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section className="relative z-10 px-6 pb-32 max-w-2xl mx-auto">
        <h2 className="text-2xl font-bold text-white text-center mb-10 tracking-tight">
          Frequently asked questions
        </h2>
        <div className="flex flex-col">
          {faqs.map((faq, i) => (
            <div key={i} className="border-b border-white/[0.07]">
              <button
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
                className="w-full flex items-center justify-between py-5 text-left gap-4 group"
              >
                <span className="text-white/80 text-sm font-medium group-hover:text-white transition-colors">
                  {faq.q}
                </span>
                <span
                  className={`text-white/30 text-lg shrink-0 transition-transform duration-200 ${
                    openFaq === i ? "rotate-45" : ""
                  }`}
                >
                  +
                </span>
              </button>
              {openFaq === i && (
                <p className="text-white/40 text-sm pb-5 leading-relaxed pr-8">
                  {faq.a}
                </p>
              )}
            </div>
          ))}
        </div>
      </section>

      <Footer />
    </div>
  );
}
