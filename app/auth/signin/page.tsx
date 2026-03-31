"use client";

import { signIn } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";

function SignInForm() {
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") ?? "/dashboard";
  const [busy, setBusy] = useState(false);

  return (
    <div className="mx-auto flex min-h-dvh max-w-sm flex-col justify-center px-4">
      <h1 className="mb-2 text-2xl font-semibold text-zinc-100">Sign in to NextFlow</h1>
      <p className="mb-6 text-sm text-zinc-500">
        Use your Google account to manage workflows.
      </p>
      <button
        type="button"
        disabled={busy}
        onClick={() => {
          setBusy(true);
          void signIn("google", { callbackUrl });
        }}
        className="rounded-lg bg-white px-4 py-2.5 text-sm font-medium text-zinc-900 shadow hover:bg-zinc-100 disabled:opacity-50"
      >
        {busy ? "Redirecting…" : "Continue with Google"}
      </button>
    </div>
  );
}

export default function AuthSignInPage() {
  return (
    <div className="min-h-dvh bg-zinc-950">
      <Suspense
        fallback={
          <div className="flex min-h-dvh items-center justify-center text-zinc-500">
            Loading…
          </div>
        }
      >
        <SignInForm />
      </Suspense>
    </div>
  );
}
