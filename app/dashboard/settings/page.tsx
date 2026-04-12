"use client";

import { signOut } from "next-auth/react";
import { useState } from "react";
import toast from "react-hot-toast";
import Link from "next/link";

export default function SettingsPage() {
  const [confirming, setConfirming] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleDeleteAccount = async () => {
    if (!confirming) {
      setConfirming(true);
      return;
    }

    setDeleting(true);
    try {
      const res = await fetch("/api/account/delete", { method: "DELETE" });
      if (!res.ok) {
        const data = (await res.json()) as { error?: string };
        toast.error(data.error ?? "Failed to delete account");
        setDeleting(false);
        setConfirming(false);
        return;
      }
      toast.success("Account deleted");
      await signOut({ callbackUrl: "/" });
    } catch {
      toast.error("Something went wrong. Please try again.");
      setDeleting(false);
      setConfirming(false);
    }
  };

  return (
    <div className="min-h-dvh bg-zinc-950 text-zinc-100">
      <div className="mx-auto max-w-lg px-4 py-16">
        <div className="mb-8">
          <Link
            href="/dashboard"
            className="text-xs text-zinc-500 hover:text-zinc-300"
          >
            ← Back to dashboard
          </Link>
        </div>

        <h1 className="mb-8 text-2xl font-semibold">Account settings</h1>

        {/* Danger zone */}
        <div className="rounded-lg border border-red-900 bg-zinc-900 p-6">
          <h2 className="mb-1 text-base font-medium text-red-400">
            Danger zone
          </h2>
          <p className="mb-4 text-sm text-zinc-400">
            Permanently delete your account and all associated workflows,
            runs, and generated images. This action cannot be undone.
          </p>

          {confirming ? (
            <div className="space-y-3">
              <p className="text-sm font-medium text-red-400">
                Are you sure? This will delete everything permanently.
              </p>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => void handleDeleteAccount()}
                  disabled={deleting}
                  className="rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-500 disabled:opacity-50"
                >
                  {deleting ? "Deleting..." : "Yes, delete my account"}
                </button>
                <button
                  type="button"
                  onClick={() => setConfirming(false)}
                  disabled={deleting}
                  className="rounded-md border border-zinc-700 px-4 py-2 text-sm font-medium text-zinc-300 hover:bg-zinc-800 disabled:opacity-50"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => void handleDeleteAccount()}
              className="rounded-md border border-red-800 px-4 py-2 text-sm font-medium text-red-400 hover:bg-red-950"
            >
              Delete my account
            </button>
          )}
        </div>
      </div>
    </div>
  );
}