/*
  Warnings:

  - A unique constraint covering the columns `[recruitingRoomId,userId]` on the table `TksRecruitingRoomUser` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "TksRecruitingRoomUser_userId_key";

-- CreateIndex
CREATE INDEX "TksRecruitingRoomUser_userId_idx" ON "TksRecruitingRoomUser"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "TksRecruitingRoomUser_recruitingRoomId_userId_key" ON "TksRecruitingRoomUser"("recruitingRoomId", "userId");
