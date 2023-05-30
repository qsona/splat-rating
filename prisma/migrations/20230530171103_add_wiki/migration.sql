-- CreateTable
CREATE TABLE "Wiki" (
    "id" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Wiki_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Wiki_userId_idx" ON "Wiki"("userId");

-- AddForeignKey
ALTER TABLE "Wiki" ADD CONSTRAINT "Wiki_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
