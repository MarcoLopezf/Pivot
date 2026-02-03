-- CreateEnum
CREATE TYPE "SourceType" AS ENUM ('GENKIT_AUTO', 'MANUAL_SEED', 'CRON_UPDATE');

-- CreateTable
CREATE TABLE "JobRole" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "displayName" TEXT NOT NULL,
    "searchTerms" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "JobRole_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MarketReport" (
    "id" TEXT NOT NULL,
    "roleId" TEXT NOT NULL,
    "region" TEXT NOT NULL DEFAULT 'GLOBAL',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "sourceType" "SourceType" NOT NULL DEFAULT 'GENKIT_AUTO',
    "data" JSONB NOT NULL,

    CONSTRAINT "MarketReport_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "JobRole_slug_key" ON "JobRole"("slug");

-- CreateIndex
CREATE INDEX "MarketReport_roleId_region_createdAt_idx" ON "MarketReport"("roleId", "region", "createdAt");

-- AddForeignKey
ALTER TABLE "MarketReport" ADD CONSTRAINT "MarketReport_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "JobRole"("id") ON DELETE CASCADE ON UPDATE CASCADE;
