-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
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

    CONSTRAINT "GameMatching_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Rating_userId_rule_key" ON "Rating"("userId", "rule");

-- AddForeignKey
ALTER TABLE "Rating" ADD CONSTRAINT "Rating_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
