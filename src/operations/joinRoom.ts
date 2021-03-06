import { JoinedUser } from '@prisma/client'
import { prisma } from '../prismaClient'

export const joinRoom = async (userId: string, discordChannelId: string, guildId: string) => {
  // TODO: acquire lock
  const room = await prisma.room.findUnique({
    where: { discordChannelId },
  })
  if (!room) {
    return { error: 'ROOM_DOES_NOT_EXIST' as const }
  }
  const { rule } = room
  const rating = await prisma.rating.findUnique({
    where: {
      userId_guildId_rule: { userId, guildId, rule },
    },
  })
  if (!rating) {
    return { error: 'RATING_DOES_NOT_EXIST' as const, room }
  }

  let joinedUsersCount = await prisma.joinedUser.count({
    where: {
      roomId: room.id,
    },
  })
  if (joinedUsersCount >= 10) {
    return { error: 'TOO_MANY_JOINED_USERS' as const }
  }

  let joinedUser: JoinedUser
  try {
    joinedUser = await prisma.joinedUser.create({
      data: {
        room: { connect: { id: room.id } },
        user: { connect: { id: userId } },
        rating: { connect: { id: rating.id } },
      },
    })
  } catch (e) {
    if ((e as any).code === 'P2002') {
      return { error: 'USER_ALREADY_JOINED' as const }
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
