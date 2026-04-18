import type { HTMLAttributes } from "react";

type DividerProps = HTMLAttributes<HTMLDivElement>;

export function Divider({ className = "", ...props }: DividerProps) {
  const classes = [
    "mx-auto h-px w-full max-w-6xl bg-gradient-to-r from-transparent via-purple/45 to-transparent",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return <div className={classes} {...props} />;
}

