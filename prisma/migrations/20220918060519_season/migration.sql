-- AlterTable
ALTER TABLE "GameResult" ADD COLUMN     "seasonId" TEXT;

-- AlterTable
ALTER TABLE "Matching" ADD COLUMN     "seasonId" TEXT;

-- CreateTable
CREATE TABLE "Season" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "guildId" TEXT NOT NULL,
    "startAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Season_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SeasonRecord" (
    "id" TEXT NOT NULL,
    "seasonId" TEXT NOT NULL,
    "ratingId" TEXT NOT NULL,
    "mu" DOUBLE PRECISION NOT NULL,
    "sigma" DOUBLE PRECISION NOT NULL,
    "rankPoint" DOUBLE PRECISION NOT NULL,
    "winCount" INTEGER NOT NULL,
    "loseCount" INTEGER NOT NULL,

    CONSTRAINT "SeasonRecord_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RatingChangedHistory" (
    "id" TEXT NOT NULL,
    "ratingId" TEXT NOT NULL,
    "seasonId" TEXT,
    "muBefore" DOUBLE PRECISION NOT NULL,
    "muAfter" DOUBLE PRECISION NOT NULL,
    "sigmaBefore" DOUBLE PRECISION NOT NULL,
    "sigmaAfter" DOUBLE PRECISION NOT NULL,
    "reason" TEXT,

    CONSTRAINT "RatingChangedHistory_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Season_guildId_startAt_idx" ON "Season"("guildId", "startAt");

-- CreateIndex
CREATE INDEX "SeasonRecord_seasonId_rankPoint_idx" ON "SeasonRecord"("seasonId", "rankPoint");

-- CreateIndex
CREATE UNIQUE INDEX "SeasonRecord_ratingId_seasonId_key" ON "SeasonRecord"("ratingId", "seasonId");

-- CreateIndex
CREATE INDEX "RatingChangedHistory_ratingId_seasonId_idx" ON "RatingChangedHistory"("ratingId", "seasonId");

-- CreateIndex
CREATE INDEX "RatingChangedHistory_seasonId_idx" ON "RatingChangedHistory"("seasonId");

-- AddForeignKey
ALTER TABLE "GameResult" ADD CONSTRAINT "GameResult_seasonId_fkey" FOREIGN KEY ("seasonId") REFERENCES "Season"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Matching" ADD CONSTRAINT "Matching_seasonId_fkey" FOREIGN KEY ("seasonId") REFERENCES "Season"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SeasonRecord" ADD CONSTRAINT "SeasonRecord_seasonId_fkey" FOREIGN KEY ("seasonId") REFERENCES "Season"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SeasonRecord" ADD CONSTRAINT "SeasonRecord_ratingId_fkey" FOREIGN KEY ("ratingId") REFERENCES "Rating"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RatingChangedHistory" ADD CONSTRAINT "RatingChangedHistory_ratingId_fkey" FOREIGN KEY ("ratingId") REFERENCES "Rating"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RatingChangedHistory" ADD CONSTRAINT "RatingChangedHistory_seasonId_fkey" FOREIGN KEY ("seasonId") REFERENCES "Season"("id") ON DELETE SET NULL ON UPDATE CASCADE;
