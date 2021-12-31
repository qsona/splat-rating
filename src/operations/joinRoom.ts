import { JoinedUser } from '@prisma/client'
import { prisma } from '../prismaClient'

export const joinRoom = async (userId: string, discordChannelId: string) => {
  // TODO: acquire lock
  const room = await prisma.room.findUnique({
    where: { discordChannelId },
  })
  if (!room) {
    return 'ROOM_DOES_NOT_EXIST'
  }
  const { rule } = room
  const rating = await prisma.rating.findUnique({
    where: {
      userId_rule: { userId, rule },
    },
  })
  if (!rating) {
    return 'RATING_DOES_NOT_EXIST'
  }

  let joinedUsersCount = await prisma.joinedUser.count({
    where: {
      roomId: room.id,
    },
  })
  if (joinedUsersCount >= 10) {
    return 'TOO_MANY_JOINED_USERS'
  }

  let joinedUser: JoinedUser
  try {
    joinedUser = await prisma.joinedUser.create({
      data: {
        room: { connect: { id: room.id } },
        user: { connect: { id: userId } },
      },
    })
  } catch (e) {
    if ((e as any).code === 'P2002') {
      return 'USER_ALREADY_JOINED'
    }
    throw e
  }
  joinedUsersCount += 1

  return {
    joinedUser,
    room,
    joinedUsersCount: joinedUsersCount,
    remainMinUsersCount: 8 - joinedUsersCount,
    remainMaxUsersCount: 10 - joinedUsersCount,
    rating,
  }
}
