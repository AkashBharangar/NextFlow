"use client";

import { useState } from "react";

type SettingsSection =
  | "profile"
  | "api-keys"
  | "notifications"
  | "appearance"
  | "billing"
  | "danger";

const NAV_ITEMS: { id: SettingsSection; label: string }[] = [
  { id: "profile", label: "Profile" },
  { id: "api-keys", label: "API Keys" },
  { id: "notifications", label: "Notifications" },
  { id: "appearance", label: "Appearance" },
  { id: "billing", label: "Billing" },
  { id: "danger", label: "Danger Zone" },
];

const INPUT_CLASS =
  "w-full bg-white/[0.05] border border-white/[0.09] rounded-xl px-4 py-3 text-white text-sm placeholder:text-white/25 focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/30 focus:bg-white/[0.07] transition-all duration-200";

const LABEL_CLASS =
  "block text-white/50 text-xs font-medium mb-1.5 tracking-wide";

const PROVIDERS = [
  "OpenAI",
  "Replicate",
  "Stability AI",
  "Fal.ai",
] as const;

type SettingsShellProps = {
  user: {
    name?: string | null;
    email?: string | null;
  };
};

export function SettingsShell({ user }: SettingsShellProps) {
  const displayName = user.name ?? user.email ?? "User";
  const initial = (displayName.trim()[0] ?? "?").toUpperCase();

  const [activeSection, setActiveSection] =
    useState<SettingsSection>("profile");

  const [fullName, setFullName] = useState(user.name ?? "");
  const [username, setUsername] = useState(() => {
    const e = user.email?.split("@")[0];
    return e ?? "";
  });
  const [bio, setBio] = useState("");

  const [apiKeys, setApiKeys] = useState<Record<string, string>>(() =>
    Object.fromEntries(PROVIDERS.map((p) => [p, ""])),
  );
  const [apiVisible, setApiVisible] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(PROVIDERS.map((p) => [p, false])),
  );
  const [apiConnected, setApiConnected] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(PROVIDERS.map((p) => [p, false])),
  );

  const [notifGeneration, setNotifGeneration] = useState(true);
  const [notifJobFailed, setNotifJobFailed] = useState(true);
  const [notifWeekly, setNotifWeekly] = useState(false);
  const [notifProduct, setNotifProduct] = useState(false);
  const [notifBilling, setNotifBilling] = useState(true);

  const [theme, setTheme] = useState<"dark" | "light" | "system">("dark");
  const ACCENTS = [
    "#7c5cfc",
    "#f43f8f",
    "#22d4fd",
    "#ff6b35",
    "#22c55e",
    "#ffffff",
  ] as const;
  const [accent, setAccent] = useState<(typeof ACCENTS)[number]>(ACCENTS[0]);

  const [deleteInput, setDeleteInput] = useState("");

  function navClass(id: SettingsSection) {
    const base =
      "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm cursor-pointer transition-all";
    if (activeSection === id) {
      return `${base} text-white bg-purple-500/[0.12] border-l-2 border-purple-500`;
    }
    return `${base} text-white/45 hover:text-white hover:bg-white/[0.04]`;
  }

  function Toggle({
    on,
    onToggle,
  }: {
    on: boolean;
    onToggle: () => void;
  }) {
    return (
      <button
        type="button"
        role="switch"
        aria-checked={on}
        onClick={onToggle}
        className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${
          on ? "bg-purple-600" : "bg-white/10"
        }`}
      >
        <span
          className={`absolute top-1 h-4 w-4 rounded-full bg-white transition-transform ${
            on ? "translate-x-6" : "translate-x-1"
          }`}
        />
      </button>
    );
  }

  return (
    <div className="flex min-h-0 min-w-0 flex-1">
      <nav className="flex w-56 shrink-0 flex-col gap-1 p-6">
        {NAV_ITEMS.map((item) => (
          <div
            key={item.id}
            role="button"
            tabIndex={0}
            className={navClass(item.id)}
            onClick={() => setActiveSection(item.id)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                setActiveSection(item.id);
              }
            }}
          >
            {item.label}
          </div>
        ))}
      </nav>

      <div className="max-w-3xl flex-1 p-8">
        {activeSection === "profile" && (
          <div>
            <div className="group relative mx-auto mb-8 h-20 w-20 cursor-pointer">
              <div className="flex h-full w-full items-center justify-center rounded-full bg-gradient-to-br from-purple-600 to-pink-500 text-2xl font-bold text-white">
                {initial}
              </div>
              <div className="pointer-events-none absolute inset-0 flex items-center justify-center rounded-full bg-black/50 text-xs text-white/80 opacity-0 transition-opacity group-hover:opacity-100">
                Change photo
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className={LABEL_CLASS} htmlFor="fullName">
                  Full name
                </label>
                <input
                  id="fullName"
                  className={INPUT_CLASS}
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                />
              </div>
              <div>
                <label className={LABEL_CLASS} htmlFor="username">
                  Username
                </label>
                <input
                  id="username"
                  className={INPUT_CLASS}
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
              </div>
              <div>
                <label className={LABEL_CLASS} htmlFor="email">
                  Email
                </label>
                <input
                  id="email"
                  readOnly
                  className={`${INPUT_CLASS} cursor-not-allowed text-white/45`}
                  value={user.email ?? ""}
                />
              </div>
              <div>
                <label className={LABEL_CLASS} htmlFor="bio">
                  Bio
                </label>
                <textarea
                  id="bio"
                  rows={3}
                  className={INPUT_CLASS}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Tell us about yourself"
                />
              </div>
            </div>

            <div className="mt-8 flex justify-end">
              <button
                type="button"
                className="rounded-xl bg-gradient-to-r from-purple-600 to-pink-500 px-6 py-2.5 text-sm font-semibold text-white hover:from-purple-500 hover:to-pink-400"
              >
                Save
              </button>
            </div>
          </div>
        )}

        {activeSection === "api-keys" && (
          <div>
            <p className="mb-6 text-sm text-white/40">
              Connect your own provider keys to use your own credits.
            </p>
            <div className="flex flex-col gap-3">
              {PROVIDERS.map((provider) => {
                const connected = apiConnected[provider];
                return (
                  <div
                    key={provider}
                    className="rounded-2xl border border-white/[0.07] bg-[#0d0d1e] p-5"
                  >
                    <div className="mb-4 flex items-center justify-between gap-3">
                      <span className="text-sm font-semibold text-white">
                        {provider}
                      </span>
                      <span
                        className={`rounded-full border px-2.5 py-0.5 text-xs ${
                          connected
                            ? "border-green-500/20 bg-green-500/10 text-green-400"
                            : "border-white/10 bg-white/5 text-white/30"
                        }`}
                      >
                        {connected ? "Connected" : "Not connected"}
                      </span>
                    </div>
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                      <div className="relative flex-1">
                        <input
                          type={apiVisible[provider] ? "text" : "password"}
                          className={`${INPUT_CLASS} pr-10 font-mono`}
                          placeholder="sk-••••••••••••••••"
                          value={apiKeys[provider]}
                          onChange={(e) =>
                            setApiKeys((k) => ({
                              ...k,
                              [provider]: e.target.value,
                            }))
                          }
                        />
                        <button
                          type="button"
                          className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-white/40 hover:bg-white/[0.06] hover:text-white"
                          aria-label={
                            apiVisible[provider] ? "Hide key" : "Show key"
                          }
                          onClick={() =>
                            setApiVisible((v) => ({
                              ...v,
                              [provider]: !v[provider],
                            }))
                          }
                        >
                          {apiVisible[provider] ? (
                            <svg
                              className="h-4 w-4"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                            >
                              <path d="M3 3l18 18M10.5 10.5a3 3 0 004 4M9.88 9.88A3 3 0 0112 5c4 0 7.33 3 9 7a15.5 15.5 0 01-3.12 4.5M6.1 6.1C3.78 7.67 2 10 2 12c2 4 6 7 10 7a9.8 9.8 0 004.24-1" />
                            </svg>
                          ) : (
                            <svg
                              className="h-4 w-4"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                            >
                              <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7S1 12 1 12z" />
                              <circle cx="12" cy="12" r="3" />
                            </svg>
                          )}
                        </button>
                      </div>
                      <button
                        type="button"
                        className="shrink-0 rounded-xl bg-gradient-to-r from-purple-600 to-pink-500 px-4 py-2.5 text-sm font-semibold text-white hover:from-purple-500 hover:to-pink-400"
                        onClick={() =>
                          setApiConnected((c) => ({
                            ...c,
                            [provider]: true,
                          }))
                        }
                      >
                        Save
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {activeSection === "notifications" && (
          <div>
            {[
              {
                label: "Generation complete",
                desc: "When a run finishes successfully.",
                on: notifGeneration,
                set: setNotifGeneration,
              },
              {
                label: "Job failed",
                desc: "When a node or workflow errors.",
                on: notifJobFailed,
                set: setNotifJobFailed,
              },
              {
                label: "Weekly digest",
                desc: "Summary of activity each week.",
                on: notifWeekly,
                set: setNotifWeekly,
              },
              {
                label: "Product updates",
                desc: "New features and improvements.",
                on: notifProduct,
                set: setNotifProduct,
              },
              {
                label: "Billing alerts",
                desc: "Payment issues and invoices.",
                on: notifBilling,
                set: setNotifBilling,
              },
            ].map((row) => (
              <div
                key={row.label}
                className="flex items-center justify-between border-b border-white/[0.06] py-4"
              >
                <div>
                  <p className="text-sm text-white">{row.label}</p>
                  <p className="mt-0.5 text-xs text-white/35">{row.desc}</p>
                </div>
                <Toggle on={row.on} onToggle={() => row.set((v) => !v)} />
              </div>
            ))}
          </div>
        )}

        {activeSection === "appearance" && (
          <div className="space-y-8">
            <div>
              <p className={LABEL_CLASS}>Theme</p>
              <div className="mt-2 grid grid-cols-1 gap-3 sm:grid-cols-3">
                <button
                  type="button"
                  onClick={() => setTheme("dark")}
                  className={`rounded-xl border p-4 text-center text-sm ${
                    theme === "dark"
                      ? "border-purple-500/50 bg-purple-500/10 text-white"
                      : "border-white/[0.07] bg-white/[0.02] text-white/40"
                  }`}
                >
                  Dark
                </button>
                <div className="relative rounded-xl border border-white/[0.07] bg-white/[0.02] p-4 text-center text-sm text-white/40">
                  <span>Light</span>
                  <span className="ml-1 rounded bg-white/5 px-1.5 py-0.5 text-[10px] text-white/50">
                    Coming soon
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setTheme("system")}
                  className={`rounded-xl border p-4 text-center text-sm ${
                    theme === "system"
                      ? "border-purple-500/50 bg-purple-500/10 text-white"
                      : "border-white/[0.07] bg-white/[0.02] text-white/40"
                  }`}
                >
                  System
                </button>
              </div>
            </div>

            <div>
              <p className={LABEL_CLASS}>Accent color</p>
              <div className="mt-3 flex flex-wrap gap-3">
                {ACCENTS.map((c) => {
                  const active = accent === c;
                  return (
                    <button
                      key={c}
                      type="button"
                      aria-label={`Accent ${c}`}
                      onClick={() => setAccent(c)}
                      className={`h-8 w-8 cursor-pointer rounded-full ring-offset-2 ring-offset-[#080810] transition-transform ${
                        active ? "scale-110 ring-2 ring-white" : ""
                      }`}
                      style={{ backgroundColor: c }}
                    />
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {activeSection === "billing" && (
          <div>
            <div className="mb-8 rounded-2xl border border-purple-500/20 bg-[#0d0d1e] p-6">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-lg font-semibold text-white">Pro Plan</h2>
                <span className="rounded-full border border-purple-500/30 bg-purple-500/15 px-2 py-0.5 text-xs text-purple-300">
                  Current
                </span>
              </div>
              <p className="mt-2 text-2xl font-bold text-white">
                $29<span className="text-base font-normal text-white/40">/mo</span>
              </p>
              <p className="mt-1 text-sm text-white/35">
                Renews on March 12, 2026
              </p>
              <button
                type="button"
                className="mt-5 rounded-xl border border-white/[0.12] bg-white/[0.05] px-4 py-2 text-sm text-white/80 hover:bg-white/[0.09]"
              >
                Manage billing →
              </button>
            </div>

            <div>
              <div className="mb-2 flex items-center justify-between text-sm">
                <span className="text-white/70">Generations this month</span>
                <span className="text-white/50">1,247 / 5,000</span>
              </div>
              <div className="h-2 w-full rounded-full bg-white/[0.06]">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-purple-600 to-pink-500"
                  style={{ width: `${(1247 / 5000) * 100}%` }}
                />
              </div>
              <p className="mt-2 text-xs text-white/30">
                1,247 / 5,000 generations
              </p>
            </div>

            <table className="mt-6 w-full text-sm">
              <thead>
                <tr>
                  <th className="pb-3 text-left text-xs font-normal uppercase tracking-wider text-white/30">
                    Date
                  </th>
                  <th className="pb-3 text-left text-xs font-normal uppercase tracking-wider text-white/30">
                    Amount
                  </th>
                  <th className="pb-3 text-left text-xs font-normal uppercase tracking-wider text-white/30">
                    Status
                  </th>
                  <th className="pb-3 text-right text-xs font-normal uppercase tracking-wider text-white/30">
                    Download
                  </th>
                </tr>
              </thead>
              <tbody>
                {[
                  { date: "Apr 1, 2026", amount: "$29.00" },
                  { date: "Mar 1, 2026", amount: "$29.00" },
                  { date: "Feb 1, 2026", amount: "$29.00" },
                ].map((inv) => (
                  <tr key={inv.date}>
                    <td className="border-t border-white/[0.05] py-3 text-white/70">
                      {inv.date}
                    </td>
                    <td className="border-t border-white/[0.05] py-3 text-white/70">
                      {inv.amount}
                    </td>
                    <td className="border-t border-white/[0.05] py-3">
                      <span className="rounded-full border border-green-500/25 bg-green-500/10 px-2 py-0.5 text-xs text-green-400">
                        Paid
                      </span>
                    </td>
                    <td className="border-t border-white/[0.05] py-3 text-right">
                      <button
                        type="button"
                        className="text-purple-400 hover:text-purple-300"
                      >
                        PDF
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeSection === "danger" && (
          <div className="rounded-2xl border border-red-500/20 bg-red-950/10 p-6">
            <h2 className="font-semibold text-red-400">Delete account</h2>
            <p className="mt-1 text-sm text-white/40">
              Permanently remove your account and all associated workflows. This
              cannot be undone.
            </p>
            <div className="mt-5">
              <label className={LABEL_CLASS} htmlFor="deleteConfirm">
                Confirm
              </label>
              <input
                id="deleteConfirm"
                className={`${INPUT_CLASS} focus:border-red-500/50 focus:ring-red-500/30`}
                placeholder='Type "DELETE" to confirm'
                value={deleteInput}
                onChange={(e) => setDeleteInput(e.target.value)}
              />
            </div>
            <button
              type="button"
              disabled={deleteInput !== "DELETE"}
              className="mt-5 rounded-xl bg-red-600/80 px-5 py-2.5 text-sm text-white hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-30"
            >
              Delete account
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
