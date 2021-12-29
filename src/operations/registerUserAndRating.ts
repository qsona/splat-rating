import { SplatRuleSet } from '../rules'
import { prisma } from '../prismaClient'
import { Rating, User } from '@prisma/client'

export const INITIAL_SIGMA = 200

export const registerUserAndRating = async (userId: string, username: string, rule: SplatRuleSet, estimatedGachiPower: number) => {
  let isNewUser = true
  let user: User | null = null
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

  let rating: Rating
  try {
    rating = await prisma.rating.create({
      data: {
        mu: estimatedGachiPower,
        sigma: INITIAL_SIGMA,
        user: { connect: { id: userId } },
        rule,
      },
    })
  } catch (e) {
    if ((e as any).code === 'P2002') {
      return 'RATING_ALREADY_REGISTERED'
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
