import type { HTMLAttributes, ReactNode } from "react";

type GradientTextProps = {
  children: ReactNode;
} & HTMLAttributes<HTMLSpanElement>;

export function GradientText({ children, className = "", ...props }: GradientTextProps) {
  const classes = [
    "inline-block bg-[length:300%_300%] bg-gradient-to-r from-white via-purple to-pink-ai",
    "via-45% to-80% bg-clip-text text-transparent animate-gradient-flow",
    "[background-image:linear-gradient(90deg,#ffffff_0%,#7c5cfc_35%,#f43f8f_65%,#22d4fd_100%)]",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <span className={classes} {...props}>
      {children}
    </span>
  );
}

