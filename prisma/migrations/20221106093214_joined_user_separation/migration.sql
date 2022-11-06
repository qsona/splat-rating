-- CreateTable
CREATE TABLE "JoinedUsersSeparation" (
    "id" TEXT NOT NULL,
    "roomId" TEXT NOT NULL,
    "firstJoinedUserId" TEXT NOT NULL,
    "secondJoinedUserId" TEXT NOT NULL,

    CONSTRAINT "JoinedUsersSeparation_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "JoinedUsersSeparation" ADD CONSTRAINT "JoinedUsersSeparation_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "Room"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JoinedUsersSeparation" ADD CONSTRAINT "JoinedUsersSeparation_firstJoinedUserId_fkey" FOREIGN KEY ("firstJoinedUserId") REFERENCES "JoinedUser"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JoinedUsersSeparation" ADD CONSTRAINT "JoinedUsersSeparation_secondJoinedUserId_fkey" FOREIGN KEY ("secondJoinedUserId") REFERENCES "JoinedUser"("id") ON DELETE CASCADE ON UPDATE CASCADE;
