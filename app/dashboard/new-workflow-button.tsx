"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function NewWorkflowButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleClick() {
    setLoading(true);
    try {
      const res = await fetch("/api/workflows", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: "Untitled workflow" }),
      });
      if (!res.ok) return;
      const workflow = (await res.json()) as { id: string };
      router.push(`/canvas/${workflow.id}`);
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={loading}
      className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-pink-500 hover:from-purple-500 hover:to-pink-400 text-white font-semibold text-sm rounded-full px-5 py-2.5 hover:scale-105 hover:shadow-[0_0_30px_rgba(124,92,252,0.45)] disabled:opacity-50 disabled:scale-100 disabled:shadow-none transition-all duration-200"
    >
      {loading ? (
        <>
          <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
            <circle
              className="opacity-25"
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
          Creating…
        </>
      ) : (
        <>
          <span className="text-base leading-none">✦</span>
          New workflow
        </>
      )}
    </button>
  );
}
