"use client";

import { signIn } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";

import ParticleCanvas from "@/components/ui/ParticleCanvas";

function SignInForm() {
  const searchParams = useSearchParams();
  const rawCallback = searchParams.get("callbackUrl") ?? "";
  // Only allow relative paths that start with a single slash.
  // This blocks open redirects to external domains (e.g. //evil.com or https://evil.com).
  const callbackUrl =
    typeof rawCallback === "string" &&
    rawCallback.startsWith("/") &&
    !rawCallback.startsWith("//")
      ? rawCallback
      : "/dashboard";
  const [busy, setBusy] = useState(false);

  return (
    <div className="relative z-10 w-full max-w-[420px] mx-4 bg-white/[0.04] backdrop-blur-2xl border border-white/[0.09] rounded-3xl p-10 shadow-[0_40px_80px_rgba(0,0,0,0.6),0_0_0_1px_rgba(255,255,255,0.03)]">
      <div className="flex flex-col items-center mb-8">
        <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-purple-600 to-pink-500 flex items-center justify-center text-white text-xl font-bold shadow-[0_0_30px_rgba(124,92,252,0.5)] mb-4">
          ✦
        </div>
        <span className="text-sm text-white/30 font-medium tracking-wide">
          NEXFLOW
        </span>
      </div>
      <h1 className="text-2xl font-bold text-white text-center tracking-tight">
        Sign in to NextFlow
      </h1>
      <p className="text-white/40 text-sm text-center mt-2 mb-8">
        Use your Google account to manage workflows.
      </p>
      <button
        type="button"
        disabled={busy}
        onClick={() => {
          setBusy(true);
          void signIn("google", { callbackUrl });
        }}
        className="w-full bg-white/[0.05] border border-white/[0.09] rounded-xl py-3 text-sm text-white/70 hover:bg-white/[0.09] hover:text-white hover:border-white/20 transition-all duration-200 flex items-center justify-center gap-3"
      >
        {busy ? "Redirecting…" : "Continue with Google"}
      </button>
    </div>
  );
}

export default function AuthSignInPage() {
  return (
    <div className="min-h-screen bg-[#080810] flex items-center justify-center relative overflow-hidden">
      <ParticleCanvas />
      <div className="absolute -top-32 -left-32 w-[500px] h-[500px] rounded-full bg-purple-600/15 blur-[120px] pointer-events-none z-0" />
      <div className="absolute -bottom-32 -right-32 w-[400px] h-[400px] rounded-full bg-pink-600/10 blur-[120px] pointer-events-none z-0" />
      <Suspense
        fallback={
          <div className="relative z-10 flex min-h-screen items-center justify-center text-white/40">
            Loading…
          </div>
        }
      >
        <SignInForm />
      </Suspense>
    </div>
  );
}
