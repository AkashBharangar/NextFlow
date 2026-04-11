import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";
import { config as loadEnv } from "dotenv";
import { resolve } from "node:path";

loadEnv({ path: resolve(process.cwd(), ".env") });
loadEnv({ path: resolve(process.cwd(), ".env.local"), override: true });

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  throw new Error("DATABASE_URL is required for seeding");
}

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: databaseUrl }),
});

async function main() {
  const user = await prisma.user.upsert({
    where: { email: "dev@test.com" },
    update: { name: "Dev User" },
    create: { email: "dev@test.com", name: "Dev User" },
  });

  const existing = await prisma.workflow.findFirst({
    where: { userId: user.id, name: "My first workflow" },
  });

  if (!existing) {
    await prisma.workflow.create({
      data: {
        userId: user.id,
        name: "My first workflow",
        graphJson: { nodes: [], edges: [] },
      },
    });
  }

  const providers = [
    {
      id: "provider_huggingface",
      name: "Hugging Face",
      slug: "huggingface",
      baseUrl: "https://router.huggingface.co",
      isActive: true,
    },
    {
      id: "provider_replicate",
      name: "Replicate",
      slug: "replicate",
      baseUrl: "https://api.replicate.com",
      isActive: true,
    },
    {
      id: "provider_stability",
      name: "Stability AI",
      slug: "stability",
      baseUrl: "https://api.stability.ai",
      isActive: false,
    },
  ];

  for (const p of providers) {
    await prisma.modelProvider.upsert({
      where: { slug: p.slug },
      update: { name: p.name, baseUrl: p.baseUrl, isActive: p.isActive },
      create: p,
    });
    console.log(`Seeded provider: ${p.slug}`);
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
