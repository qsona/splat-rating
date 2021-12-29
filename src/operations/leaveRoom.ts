import { prisma } from '../prismaClient'

export const leaveRoom = async (userId: string, discordChannelId: string) => {
  // TODO: acquire lock
  const room = await prisma.room.findUnique({
    where: { discordChannelId },
  })
  if (!room) {
    return 'ROOM_DOES_NOT_EXIST'
  }

  if (room.creatorUserId === userId) {
    return 'CREATOR_CANNOT_LEAVE'
  }

  const joinedUser = await prisma.joinedUser.findUnique({
    where: {
      roomId_userId: {
        roomId: room.id,
        userId,
      },
    },
  })
  if (!joinedUser) {
    return 'USER_NOT_JOINED'
  }

  await prisma.joinedUser.delete({
    where: {
      id: joinedUser.id,
    },
  })

  const joinedUsersCount = await prisma.joinedUser.count({
    where: {
      roomId: room.id,
    },
  })

  return {
    room,
    joinedUsersCount: joinedUsersCount,
    remainUsersCount: 8 - joinedUsersCount,
  }
}
