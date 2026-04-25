import type { HTMLAttributes } from "react";

type SkeletonProps = HTMLAttributes<HTMLDivElement>;

export function Skeleton({ className = "", ...props }: SkeletonProps) {
  return (
    <div
      className={`relative overflow-hidden rounded-card bg-white/8 ${className}`}
      {...props}
    >
      <div className="absolute inset-0 -translate-x-full animate-gradient-flow bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.18),transparent)] [background-size:200%_100%]" />
    </div>
  );
}

