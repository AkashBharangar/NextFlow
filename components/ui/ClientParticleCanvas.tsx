"use client";

import dynamic from "next/dynamic";

const ParticleCanvas = dynamic(
  () => import("@/components/ui/ParticleCanvas"),
  { ssr: false },
);

export function ClientParticleCanvas() {
  return <ParticleCanvas />;
}

