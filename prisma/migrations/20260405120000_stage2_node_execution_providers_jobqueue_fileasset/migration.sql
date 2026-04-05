-- AlterTable NodeExecution (Stage 2 extensions)
ALTER TABLE "NodeExecution" ADD COLUMN     "errorCode" TEXT,
ADD COLUMN     "attempt" INTEGER NOT NULL DEFAULT 1,
ADD COLUMN     "maxAttempts" INTEGER NOT NULL DEFAULT 3,
ADD COLUMN     "idempotencyKey" TEXT,
ADD COLUMN     "externalJobId" TEXT,
ADD COLUMN     "storageKey" TEXT;

ALTER TABLE "NodeExecution" ALTER COLUMN "status" SET DEFAULT 'pending';

-- CreateIndex
CREATE UNIQUE INDEX "NodeExecution_idempotencyKey_key" ON "NodeExecution"("idempotencyKey");

-- CreateIndex
CREATE INDEX "NodeExecution_externalJobId_idx" ON "NodeExecution"("externalJobId");

-- CreateTable
CREATE TABLE "ModelProvider" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "baseUrl" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ModelProvider_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ModelProvider_slug_key" ON "ModelProvider"("slug");

-- CreateTable
CREATE TABLE "FileAsset" (
    "id" TEXT NOT NULL,
    "nodeExecutionId" TEXT NOT NULL,
    "s3Key" TEXT NOT NULL,
    "cdnUrl" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "sizeBytes" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FileAsset_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "FileAsset_nodeExecutionId_idx" ON "FileAsset"("nodeExecutionId");

-- AddForeignKey
ALTER TABLE "FileAsset" ADD CONSTRAINT "FileAsset_nodeExecutionId_fkey" FOREIGN KEY ("nodeExecutionId") REFERENCES "NodeExecution"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- CreateTable
CREATE TABLE "JobQueue" (
    "id" TEXT NOT NULL,
    "nodeExecutionId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "idempotencyKey" TEXT,
    "externalJobId" TEXT,
    "attempt" INTEGER NOT NULL DEFAULT 1,
    "maxAttempts" INTEGER NOT NULL DEFAULT 3,
    "errorCode" TEXT,
    "errorMessage" TEXT,
    "queuedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "startedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),

    CONSTRAINT "JobQueue_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "JobQueue_nodeExecutionId_key" ON "JobQueue"("nodeExecutionId");

-- CreateIndex
CREATE UNIQUE INDEX "JobQueue_idempotencyKey_key" ON "JobQueue"("idempotencyKey");

-- CreateIndex
CREATE INDEX "JobQueue_status_idx" ON "JobQueue"("status");

-- CreateIndex
CREATE INDEX "JobQueue_externalJobId_idx" ON "JobQueue"("externalJobId");

-- AddForeignKey
ALTER TABLE "JobQueue" ADD CONSTRAINT "JobQueue_nodeExecutionId_fkey" FOREIGN KEY ("nodeExecutionId") REFERENCES "NodeExecution"("id") ON DELETE CASCADE ON UPDATE CASCADE;
