import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { GradientText } from "@/components/ui/GradientText";
import { SectionLabel } from "@/components/ui/SectionLabel";

export function CTA() {
  return (
    <section className="px-4 py-24 sm:px-6 lg:px-8">
      <div className="relative mx-auto w-full max-w-[780px]">
        <div className="pointer-events-none absolute inset-x-16 -top-10 -z-10 h-52 rounded-full bg-purple/30 blur-[80px] animate-float" />

        <Card variant="glass" className="relative rounded-[32px] border-purple/30 p-10 text-center sm:p-12">
          <SectionLabel>Start creating now</SectionLabel>
          <h2 className="mt-4 text-4xl font-extrabold tracking-tight sm:text-5xl">
            <GradientText>Build your next visual idea in minutes.</GradientText>
          </h2>
          <p className="mx-auto mt-4 max-w-[560px] text-white/70">
            Generate, iterate, and ship creative assets with a workflow built for speed and
            precision.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Button size="lg">Open canvas -&gt;</Button>
            <Button size="lg" variant="secondary">
              View pricing
            </Button>
          </div>
        </Card>
      </div>
    </section>
  );
}

