import { Room } from '@prisma/client'
import { prisma } from '../prismaClient'
import { SplatRuleSet } from '../rules'

export const createRoom = async (creatorUserId: string, discordChannelId: string, rule: SplatRuleSet, guildId: string) => {
  const rating = await prisma.rating.findUnique({
    where: {
      userId_guildId_rule: { userId: creatorUserId, guildId, rule },
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
          guildId,
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
        rating: { connect: { id: rating.id } },
      },
    })

    return { rating, room, joinedUser }
  })
}
