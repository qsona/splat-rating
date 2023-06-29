-- CreateTable
CREATE TABLE "TksRating" (
    "id" TEXT NOT NULL,
    "mu" DOUBLE PRECISION NOT NULL,
    "sigma" DOUBLE PRECISION NOT NULL,
    "teamId" TEXT NOT NULL,
    "rule" TEXT NOT NULL,
    "playCount" INTEGER NOT NULL DEFAULT 0,
    "winCount" INTEGER NOT NULL DEFAULT 0,
    "loseCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TksRating_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "TksRating_teamId_rule_key" ON "TksRating"("teamId", "rule");

-- AddForeignKey
ALTER TABLE "TksRating" ADD CONSTRAINT "TksRating_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "TksTeam"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
