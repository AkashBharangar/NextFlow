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
    <li>
      <div
        className="relative rounded-lg border border-zinc-800 bg-zinc-900/50 p-4 transition hover:border-zinc-600 hover:bg-zinc-900"
      >
        <button
          type="button"
          className="absolute top-3 right-3 z-10 text-red-400 hover:text-red-300 text-sm"
          onClick={(e) => void onDelete(e)}
        >
          Delete
        </button>

        <Link href={`/canvas/${id}`} className="block">
          <div className="font-medium text-zinc-100">{name}</div>
          <div className="mt-1 text-xs text-zinc-500">{updatedAtLabel}</div>
        </Link>
      </div>
    </li>
  );
}

