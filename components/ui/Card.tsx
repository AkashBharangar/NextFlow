import type { HTMLAttributes, ReactNode } from "react";

type CardVariant = "default" | "glow" | "glass";

type CardProps = {
  children: ReactNode;
  variant?: CardVariant;
} & HTMLAttributes<HTMLDivElement>;

const baseClasses =
  "rounded-card border border-white/8 bg-bg3 p-6 text-white transition-all duration-300";

const variantClasses: Record<CardVariant, string> = {
  default: "",
  glow: "hover:shadow-glow-purple hover:border-purple/40",
  glass: "bg-white/5 backdrop-blur-xl",
};

export function Card({
  children,
  className = "",
  variant = "default",
  ...props
}: CardProps) {
  const classes = [baseClasses, variantClasses[variant], className].filter(Boolean).join(" ");

  return (
    <div className={classes} {...props}>
      {children}
    </div>
  );
}

