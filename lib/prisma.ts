import { config as loadEnv } from "dotenv";
import { resolve } from "node:path";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";

// Scripts (e.g. worker) import this module before their body runs; Next.js injects env for the app.
if (!process.env.DATABASE_URL?.trim()) {
  loadEnv({ path: resolve(process.cwd(), ".env") });
  loadEnv({ path: resolve(process.cwd(), ".env.local"), override: true });
}

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function createPrismaClient(): PrismaClient {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error("DATABASE_URL is not set");
  }
  return new PrismaClient({
    adapter: new PrismaPg({ connectionString: url }),
  });
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
