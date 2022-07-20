/*
  Warnings:

  - Made the column `guildId` on table `Rating` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Rating" ALTER COLUMN "guildId" SET NOT NULL;
