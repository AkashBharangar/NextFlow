import { NextResponse } from "next/server";
import { requireSessionUserId } from "@/lib/api/session";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

export async function GET() {
  const userId = await requireSessionUserId();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const providers = await prisma.modelProvider.findMany({
    where: { isActive: true },
    select: {
      slug: true,
      name: true,
      baseUrl: true,
    },
    orderBy: { name: "asc" },
  });

  // Always include built-in providers even if the DB is empty.
  // These match the adapter registry entries from Sessions 3 and 5.
  const builtIn = [
    { slug: "huggingface", name: "Hugging Face", models: [
      { id: "black-forest-labs/FLUX.1-schnell", label: "FLUX.1 Schnell (fast)" },
      { id: "black-forest-labs/FLUX.1-dev", label: "FLUX.1 Dev" },
    ]},
    { slug: "replicate", name: "Replicate", models: [
      { id: "black-forest-labs/flux-schnell", label: "FLUX Schnell" },
      { id: "stability-ai/sdxl", label: "Stable Diffusion XL" },
    ]},
  ];

  // Merge DB rows into builtIn (DB rows win on name if slug matches)
  const dbSlugs = new Set(providers.map((p) => p.slug));
  const merged = builtIn.map((b) => {
    if (dbSlugs.has(b.slug)) {
      const dbRow = providers.find((p) => p.slug === b.slug)!;
      return { ...b, name: dbRow.name };
    }
    return b;
  });

  return NextResponse.json(merged);
}