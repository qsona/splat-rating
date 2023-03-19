import { SplatRuleSet } from '../rules'
import { prisma } from '../prismaClient'
import { Rating, User } from '@prisma/client'

export const INITIAL_SIGMA = 200

export const registerUserAndRating = async (userId: string, username: string, guildId: string, rule: SplatRuleSet, estimatedGachiPower: number) => {
  let isNewUser = true
  let user: User | null = await prisma.user.findUnique({
    where: {
      id: userId,
    },
  })
  if (user) {
    isNewUser = false
  } else {
    try {
      user = await prisma.user.create({
        data: {
          id: userId,
          name: username,
        },
      })
    } catch (e) {
      if ((e as any).code === 'P2002') {
        // just user is already registered
        isNewUser = false
      } else {
        throw e
      }
    }
  }

  let rating: Rating | null = await prisma.rating.findUnique({
    where: {
      userId_guildId_rule: {
        userId,
        guildId,
        rule,
      },
    },
  })
  if (rating) {
    return 'RATING_ALREADY_REGISTERED' as const
  }

  try {
    rating = await prisma.rating.create({
      data: {
        guildId,
        mu: estimatedGachiPower,
        sigma: INITIAL_SIGMA,
        user: { connect: { id: userId } },
        rule,
      },
    })
  } catch (e) {
    if ((e as any).code === 'P2002') {
      return 'RATING_ALREADY_REGISTERED' as const
    }
    throw e
  }

  if (isNewUser) {
    return {
      isNewUser: true as true,
      user: user!,
      rating,
    }
  } else {
    return {
      isNewUser: false as false,
      rating,
    }
  }
}
