import { Room } from '@prisma/client'
import { prisma } from '../prismaClient'
import { SplatRuleSet } from '../rules'

export const createRoom = async (creatorUserId: string, discordChannelId: string, rule: SplatRuleSet) => {
  const rating = await prisma.rating.findUnique({
    where: {
      userId_rule: { userId: creatorUserId, rule },
    },
  })
  if (!rating) {
    return 'RATING_DOES_NOT_EXIST'
  }

  return await prisma.$transaction(async (prisma) => {
    let room: Room
    try {
      room = await prisma.room.create({
        data: {
          discordChannelId,
          creatorUserId: creatorUserId,
          rule,
        },
      })
    } catch (e) {
      if ((e as any).code === 'P2002') {
        return 'ROOM_ALREADY_EXISTS'
      }
      throw e
    }
    const joinedUser = await prisma.joinedUser.create({
      data: {
        room: { connect: { id: room.id } },
        user: { connect: { id: creatorUserId } },
      },
    })

    return { rating, room, joinedUser }
  })
}
