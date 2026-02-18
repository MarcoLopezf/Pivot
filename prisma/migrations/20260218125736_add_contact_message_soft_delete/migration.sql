-- AlterTable
ALTER TABLE "ContactMessage" ADD COLUMN     "deletedAt" TIMESTAMP(3);

-- CreateIndex
CREATE INDEX "ContactMessage_email_idx" ON "ContactMessage"("email");
