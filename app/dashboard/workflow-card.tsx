"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

const DEBUG_INGEST_URL =
  "http://127.0.0.1:7590/ingest/2d1a0384-69ab-4a63-a787-09d6587de1c2";
const DEBUG_SESSION_ID = "9d1b9a";

export function WorkflowCard({
  id,
  name,
  updatedAtLabel,
}: {
  id: string;
  name: string;
  updatedAtLabel: string;
}) {
  const router = useRouter();

  async function onDelete(e: React.MouseEvent<HTMLButtonElement>) {
    e.preventDefault();
    e.stopPropagation();

    const ok = window.confirm(
      "Delete this workflow? This cannot be undone.",
    );
    if (!ok) return;

    // #region agent log
    fetch(DEBUG_INGEST_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Debug-Session-Id": DEBUG_SESSION_ID,
      },
      body: JSON.stringify({
        sessionId: DEBUG_SESSION_ID,
        hypothesisId: "dashboard_delete_button",
        location: "workflow-card.tsx:onDelete",
        message: "starting delete request",
        data: { hasWorkflowId: typeof id === "string" && id.length > 0 },
        timestamp: Date.now(),
      }),
    }).catch(() => {});
    // #endregion

    const res = await fetch(`/api/workflows/${id}`, { method: "DELETE" });
    if (res.ok) {
      // #region agent log
      fetch(DEBUG_INGEST_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Debug-Session-Id": DEBUG_SESSION_ID,
        },
        body: JSON.stringify({
          sessionId: DEBUG_SESSION_ID,
          hypothesisId: "dashboard_delete_button",
          location: "workflow-card.tsx:onDelete",
          message: "delete request ok; refreshing list",
          data: { status: res.status },
          timestamp: Date.now(),
        }),
      }).catch(() => {});
      // #endregion
      router.refresh();
      return;
    }

    // #region agent log
    fetch(DEBUG_INGEST_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Debug-Session-Id": DEBUG_SESSION_ID,
      },
      body: JSON.stringify({
        sessionId: DEBUG_SESSION_ID,
        hypothesisId: "dashboard_delete_button",
        location: "workflow-card.tsx:onDelete",
        message: "delete request failed",
        data: { ok: res.ok, status: res.status },
        timestamp: Date.now(),
      }),
    }).catch(() => {});
    // #endregion
  }

  return (
    <li
      className="group relative bg-[#0d0d1e] border border-white/[0.07] rounded-2xl overflow-hidden hover:-translate-y-1 hover:border-purple-500/25 hover:shadow-[0_20px_60px_rgba(0,0,0,0.5),0_0_30px_rgba(124,92,252,0.08)] transition-all duration-300 cursor-pointer"
    >
      <Link href={`/canvas/${id}`} className="block w-full">
        <div className="aspect-video w-full bg-gradient-to-br from-purple-900/30 via-[#1a0a3e]/50 to-[#0d0d1e] flex items-center justify-center relative overflow-hidden">
          <span className="text-4xl text-white/10">✦</span>
          <div className="absolute inset-0 bg-gradient-to-br from-purple-600/5 to-transparent" />
        </div>

        <div className="p-4">
          <span className="font-semibold text-white text-sm leading-tight line-clamp-1">
            {name}
          </span>
          <p className="text-white/35 text-xs mt-1">{updatedAtLabel}</p>
        </div>
      </Link>

      <button
        type="button"
        className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 w-7 h-7 rounded-lg bg-red-500/[0.12] border border-red-500/20 text-red-400 hover:bg-red-500/25 transition-all duration-200 flex items-center justify-center text-xs"
        onClick={(e) => void onDelete(e)}
      >
        ✕
      </button>
    </li>
  );
}
