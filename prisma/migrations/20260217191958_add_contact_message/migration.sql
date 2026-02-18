-- CreateEnum
CREATE TYPE "InquiryType" AS ENUM ('FEEDBACK', 'BUG_REPORT', 'FEATURE_REQUEST', 'SUGGESTION', 'GENERAL_INQUIRY');

-- CreateTable
CREATE TABLE "ContactMessage" (
    "id" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "inquiryType" "InquiryType" NOT NULL,
    "message" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ContactMessage_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ContactMessage_createdAt_idx" ON "ContactMessage"("createdAt");

-- CreateIndex
CREATE INDEX "ContactMessage_inquiryType_idx" ON "ContactMessage"("inquiryType");
