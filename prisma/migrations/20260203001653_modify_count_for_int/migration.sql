/*
  Warnings:

  - The `count` column on the `LoginAttempt` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "LoginAttempt" DROP COLUMN "count",
ADD COLUMN     "count" INTEGER NOT NULL DEFAULT 0;
