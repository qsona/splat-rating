-- CreateTable
CREATE TABLE "TksRecruitingRoom" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "creatorUserId" TEXT NOT NULL,

    CONSTRAINT "TksRecruitingRoom_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TksRecruitingRoomUser" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "recruitingRoomId" TEXT NOT NULL,

    CONSTRAINT "TksRecruitingRoomUser_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TksTeam" (
    "id" TEXT NOT NULL,
    "name" TEXT,

    CONSTRAINT "TksTeam_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TksTeamUser" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "teamId" TEXT NOT NULL,

    CONSTRAINT "TksTeamUser_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TksParty" (
    "id" TEXT NOT NULL,
    "teamId" TEXT NOT NULL,

    CONSTRAINT "TksParty_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TksFindingOpponent" (
    "id" TEXT NOT NULL,
    "partyId" TEXT NOT NULL,
    "rule" TEXT NOT NULL,
    "winCountOfMatch" INTEGER NOT NULL,
    "description" TEXT,

    CONSTRAINT "TksFindingOpponent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TksMatch" (
    "id" TEXT NOT NULL,
    "primaryTeamId" TEXT NOT NULL,
    "opponentTeamId" TEXT NOT NULL,
    "rule" TEXT NOT NULL,
    "winCountOfMatch" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TksMatch_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TksMatchResult" (
    "id" TEXT NOT NULL,
    "primaryTeamId" TEXT NOT NULL,
    "opponentTeamId" TEXT NOT NULL,
    "rule" TEXT NOT NULL,
    "winCountOfMatch" INTEGER NOT NULL,
    "primaryWinCount" INTEGER NOT NULL,
    "opponentWinCount" INTEGER NOT NULL,
    "matchStartedAt" TIMESTAMP(3) NOT NULL,
    "matchEndedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TksMatchResult_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "TksRecruitingRoomUser_userId_key" ON "TksRecruitingRoomUser"("userId");

-- CreateIndex
CREATE INDEX "TksTeamUser_teamId_idx" ON "TksTeamUser"("teamId");

-- CreateIndex
CREATE UNIQUE INDEX "TksTeamUser_userId_teamId_key" ON "TksTeamUser"("userId", "teamId");

-- CreateIndex
CREATE UNIQUE INDEX "TksParty_teamId_key" ON "TksParty"("teamId");

-- CreateIndex
CREATE UNIQUE INDEX "TksFindingOpponent_partyId_key" ON "TksFindingOpponent"("partyId");

-- AddForeignKey
ALTER TABLE "TksRecruitingRoom" ADD CONSTRAINT "TksRecruitingRoom_creatorUserId_fkey" FOREIGN KEY ("creatorUserId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TksRecruitingRoomUser" ADD CONSTRAINT "TksRecruitingRoomUser_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TksRecruitingRoomUser" ADD CONSTRAINT "TksRecruitingRoomUser_recruitingRoomId_fkey" FOREIGN KEY ("recruitingRoomId") REFERENCES "TksRecruitingRoom"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TksTeamUser" ADD CONSTRAINT "TksTeamUser_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TksTeamUser" ADD CONSTRAINT "TksTeamUser_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "TksTeam"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TksParty" ADD CONSTRAINT "TksParty_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "TksTeam"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TksFindingOpponent" ADD CONSTRAINT "TksFindingOpponent_partyId_fkey" FOREIGN KEY ("partyId") REFERENCES "TksParty"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TksMatch" ADD CONSTRAINT "TksMatch_primaryTeamId_fkey" FOREIGN KEY ("primaryTeamId") REFERENCES "TksTeam"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TksMatch" ADD CONSTRAINT "TksMatch_opponentTeamId_fkey" FOREIGN KEY ("opponentTeamId") REFERENCES "TksTeam"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TksMatchResult" ADD CONSTRAINT "TksMatchResult_primaryTeamId_fkey" FOREIGN KEY ("primaryTeamId") REFERENCES "TksTeam"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TksMatchResult" ADD CONSTRAINT "TksMatchResult_opponentTeamId_fkey" FOREIGN KEY ("opponentTeamId") REFERENCES "TksTeam"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
