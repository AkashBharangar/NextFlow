import type { HTMLAttributes } from "react";

type BadgeColor = "purple" | "cyan" | "green" | "orange";

type BadgeProps = {
  label: string;
  color?: BadgeColor;
} & HTMLAttributes<HTMLSpanElement>;

const colorClasses: Record<BadgeColor, { dot: string; shell: string }> = {
  purple: { dot: "bg-purple", shell: "border-purple/35 bg-purple/10 text-purple" },
  cyan: { dot: "bg-cyan-ai", shell: "border-cyan-ai/35 bg-cyan-ai/10 text-cyan-ai" },
  green: { dot: "bg-emerald-400", shell: "border-emerald-400/35 bg-emerald-400/10 text-emerald-300" },
  orange: { dot: "bg-orange-ai", shell: "border-orange-ai/35 bg-orange-ai/10 text-orange-ai" },
};

export function Badge({ label, color = "purple", className = "", ...props }: BadgeProps) {
  const palette = colorClasses[color];
  const classes = [
    "inline-flex items-center gap-2 rounded-pill border px-3 py-1 text-xs font-medium",
    "tracking-wide uppercase",
    palette.shell,
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <span className={classes} {...props}>
      <span className={`h-2 w-2 rounded-full animate-pulse-dot ${palette.dot}`} aria-hidden="true" />
      {label}
    </span>
  );
}

