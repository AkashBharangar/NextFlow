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
      className="rounded-lg bg-cyan-600 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-cyan-500 disabled:opacity-50"
    >
      {loading ? "Creating…" : "New workflow"}
    </button>
  );
}
