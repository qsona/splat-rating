/*
  Warnings:

  - Added the required column `ratingId` to the `JoinedUser` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "JoinedUser" ADD COLUMN     "ratingId" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "JoinedUser" ADD CONSTRAINT "JoinedUser_ratingId_fkey" FOREIGN KEY ("ratingId") REFERENCES "Rating"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
