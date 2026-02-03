/*
  Warnings:

  - You are about to drop the column `email` on the `AuditLog` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "AuditLog_email_idx";

-- AlterTable
ALTER TABLE "AuditLog" DROP COLUMN "email";

-- CreateIndex
CREATE INDEX "AuditLog_actorEmail_idx" ON "AuditLog"("actorEmail");
