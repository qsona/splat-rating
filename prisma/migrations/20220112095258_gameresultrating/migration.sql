-- AlterTable
ALTER TABLE "GameResult" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "rule" TEXT NOT NULL DEFAULT E'SplatZones';

-- AlterTable
ALTER TABLE "Matching" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "Rating" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- CreateTable
CREATE TABLE "GameResultRating" (
    "id" TEXT NOT NULL,
    "gameResultId" TEXT NOT NULL,
    "ratingId" TEXT NOT NULL,
    "isWinner" BOOLEAN NOT NULL,
    "betaBefore" DOUBLE PRECISION NOT NULL,
    "betaAfter" DOUBLE PRECISION NOT NULL,
    "sigmaBefore" DOUBLE PRECISION NOT NULL,
    "sigmaAfter" DOUBLE PRECISION NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "GameResultRating_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "GameResultRating_userId_createdAt_idx" ON "GameResultRating"("userId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "GameResultRating_gameResultId_ratingId_key" ON "GameResultRating"("gameResultId", "ratingId");

-- AddForeignKey
ALTER TABLE "GameResultRating" ADD CONSTRAINT "GameResultRating_gameResultId_fkey" FOREIGN KEY ("gameResultId") REFERENCES "GameResult"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GameResultRating" ADD CONSTRAINT "GameResultRating_ratingId_fkey" FOREIGN KEY ("ratingId") REFERENCES "Rating"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GameResultRating" ADD CONSTRAINT "GameResultRating_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
