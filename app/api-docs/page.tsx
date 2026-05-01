"use client";

import { useState } from "react";

import { Footer } from "@/components/layout/Footer";
import { Navbar } from "@/components/layout/Navbar";

export default function ApiDocsPage() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">(
    "idle",
  );
  const [errorMsg, setErrorMsg] = useState("");

  return (
    <div className="min-h-screen bg-[#080810] flex flex-col relative overflow-hidden">
      <Navbar />

      {/* Decorative blobs */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-purple-600/8 blur-[120px] rounded-full pointer-events-none" />

      {/* Content — vertically centered */}
      <div className="flex-1 flex flex-col items-center justify-center text-center px-6 relative z-10">
        {/* Icon */}
        <div className="w-16 h-16 rounded-3xl bg-gradient-to-br from-purple-600/20 to-pink-500/20 border border-purple-500/20 flex items-center justify-center text-2xl mb-8 shadow-[0_0_40px_rgba(124,92,252,0.15)]">
          ⌥
        </div>

        {/* Badge */}
        <div className="inline-flex items-center gap-2 bg-purple-500/[0.08] border border-purple-500/20 text-purple-400 text-xs px-4 py-2 rounded-full mb-6 font-medium tracking-wide">
          <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-pulse" />
          Coming soon
        </div>

        <h1 className="text-[clamp(32px,5vw,56px)] font-extrabold tracking-tight text-white mb-4 leading-tight">
          API access is
          <br />
          <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            on its way.
          </span>
        </h1>

        <p className="text-white/40 text-lg max-w-md leading-relaxed mb-10">
          Build on top of Nexflow programmatically. Generate images, trigger
          workflows, and retrieve results — all via a clean REST API.
        </p>

        {/* Feature pills */}
        <div className="flex flex-wrap justify-center gap-3 mb-12">
          {[
            "REST API",
            "Webhook support",
            "API keys",
            "SDKs",
            "Rate limiting",
            "Docs",
          ].map((f) => (
            <span
              key={f}
              className="text-sm text-white/50 bg-white/[0.04] border border-white/[0.08] px-4 py-2 rounded-full"
            >
              {f}
            </span>
          ))}
        </div>

        {/* Notify form — no backend, just UI */}
        <div className="flex items-center gap-2 w-full max-w-sm">
          <input
            type="email"
            placeholder="your@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={status === "loading" || status === "success"}
            className="flex-1 bg-white/[0.05] border border-white/[0.09] rounded-xl px-4 py-3 text-white text-sm placeholder:text-white/25 focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/30 disabled:opacity-50 transition-all"
          />
          <button
            onClick={async () => {
              if (!email || status === "loading" || status === "success") return;
              setStatus("loading");
              setErrorMsg("");
              try {
                const res = await fetch("/api/waitlist", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ email }),
                });
                const data = await res.json();
                if (!res.ok) {
                  setErrorMsg(data.error ?? "Something went wrong");
                  setStatus("error");
                } else {
                  setStatus("success");
                  setEmail("");
                }
              } catch {
                setErrorMsg("Network error — please try again");
                setStatus("error");
              }
            }}
            disabled={status === "loading" || status === "success" || !email}
            className="bg-gradient-to-r from-purple-600 to-pink-500 text-white font-semibold text-sm px-5 py-3 rounded-xl hover:from-purple-500 hover:to-pink-400 hover:shadow-[0_0_20px_rgba(124,92,252,0.4)] disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200 shrink-0 min-w-[100px]"
          >
            {status === "loading" ? (
              <svg className="animate-spin w-4 h-4 mx-auto" viewBox="0 0 24 24" fill="none">
                <circle
                  className="opacity-20"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8v8z"
                />
              </svg>
            ) : status === "success" ? (
              "✓ You're on the list"
            ) : (
              "Notify me"
            )}
          </button>
        </div>
        {status === "success" && (
          <p className="text-green-400 text-xs mt-3">
            ✓ Check your inbox — confirmation sent.
          </p>
        )}
        {status === "error" && (
          <p className="text-red-400 text-xs mt-3">{errorMsg}</p>
        )}
        {status !== "success" && (
          <p className="text-white/20 text-xs mt-3">
            We'll email you when the API is ready.
          </p>
        )}
      </div>

      <Footer />
    </div>
  );
}
