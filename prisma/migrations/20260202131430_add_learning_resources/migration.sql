-- CreateEnum
CREATE TYPE "ResourceType" AS ENUM ('VIDEO', 'ARTICLE', 'COURSE');

-- CreateTable
CREATE TABLE "LearningResource" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "thumbnailUrl" TEXT,
    "channelName" TEXT,
    "duration" TEXT,
    "type" "ResourceType" NOT NULL DEFAULT 'VIDEO',
    "tags" TEXT[],
    "votes" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LearningResource_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "LearningResource_url_key" ON "LearningResource"("url");

-- CreateIndex
CREATE INDEX "LearningResource_tags_idx" ON "LearningResource"("tags");
