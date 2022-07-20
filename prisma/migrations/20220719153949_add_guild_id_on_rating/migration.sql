/*
  Warnings:

  - A unique constraint covering the columns `[userId,guildId,rule]` on the table `Rating` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "Rating_userId_rule_key";

-- AlterTable
ALTER TABLE "Rating" ADD COLUMN     "guildId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Rating_userId_guildId_rule_key" ON "Rating"("userId", "guildId", "rule");
