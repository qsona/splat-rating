-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "JoinableGame" (
    "id" TEXT NOT NULL,
    "discordChannelId" TEXT NOT NULL,
    "rule" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "creatorUserId" TEXT NOT NULL,
    "totalGameCount" INTEGER NOT NULL,

    CONSTRAINT "JoinableGame_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "JoinedUser" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "joinableGameId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "JoinedUser_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PlayingGame" (
    "id" TEXT NOT NULL,
    "discordChannelId" TEXT NOT NULL,
    "rule" TEXT NOT NULL,
    "creatorUserId" TEXT NOT NULL,
    "totalGameCount" INTEGER NOT NULL,
    "currentGameCount" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PlayingGame_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Rating" (
    "id" TEXT NOT NULL,
    "mu" DOUBLE PRECISION NOT NULL,
    "sigma" DOUBLE PRECISION NOT NULL,
    "userId" TEXT NOT NULL,
    "rule" TEXT NOT NULL,

    CONSTRAINT "Rating_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GameResult" (
    "id" TEXT NOT NULL,
    "winnerTeamsRatings" JSONB NOT NULL,
    "loserTeamsRatings" JSONB NOT NULL,
    "beta" DOUBLE PRECISION NOT NULL,
    "metadata" JSONB,

    CONSTRAINT "GameResult_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GameMatching" (
    "id" TEXT NOT NULL,
    "teamsRatingIds" JSONB NOT NULL,
    "metadata" JSONB,
    "playingGameId" TEXT NOT NULL,

    CONSTRAINT "GameMatching_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "JoinableGame_discordChannelId_key" ON "JoinableGame"("discordChannelId");

-- CreateIndex
CREATE UNIQUE INDEX "JoinedUser_joinableGameId_userId_key" ON "JoinedUser"("joinableGameId", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "PlayingGame_discordChannelId_creatorUserId_key" ON "PlayingGame"("discordChannelId", "creatorUserId");

-- CreateIndex
CREATE UNIQUE INDEX "Rating_userId_rule_key" ON "Rating"("userId", "rule");

-- CreateIndex
CREATE UNIQUE INDEX "GameMatching_playingGameId_key" ON "GameMatching"("playingGameId");

-- AddForeignKey
ALTER TABLE "JoinableGame" ADD CONSTRAINT "JoinableGame_creatorUserId_fkey" FOREIGN KEY ("creatorUserId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JoinedUser" ADD CONSTRAINT "JoinedUser_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JoinedUser" ADD CONSTRAINT "JoinedUser_joinableGameId_fkey" FOREIGN KEY ("joinableGameId") REFERENCES "JoinableGame"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlayingGame" ADD CONSTRAINT "PlayingGame_creatorUserId_fkey" FOREIGN KEY ("creatorUserId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Rating" ADD CONSTRAINT "Rating_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
