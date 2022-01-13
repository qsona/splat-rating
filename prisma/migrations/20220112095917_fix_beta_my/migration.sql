/*
  Warnings:

  - You are about to drop the column `betaAfter` on the `GameResultRating` table. All the data in the column will be lost.
  - You are about to drop the column `betaBefore` on the `GameResultRating` table. All the data in the column will be lost.
  - Added the required column `muAfter` to the `GameResultRating` table without a default value. This is not possible if the table is not empty.
  - Added the required column `muBefore` to the `GameResultRating` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "GameResultRating" DROP COLUMN "betaAfter",
DROP COLUMN "betaBefore",
ADD COLUMN     "muAfter" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "muBefore" DOUBLE PRECISION NOT NULL;
