import type { HTMLAttributes, ReactNode } from "react";

type SectionLabelProps = {
  children: ReactNode;
} & HTMLAttributes<HTMLParagraphElement>;

export function SectionLabel({ children, className = "", ...props }: SectionLabelProps) {
  const classes = [
    "text-xs uppercase tracking-widest font-semibold text-purple",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <p className={classes} {...props}>
      {children}
    </p>
  );
}

