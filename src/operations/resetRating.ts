import { prisma } from '../prismaClient'
import { INITIAL_SIGMA } from './registerUserAndRating'
import { getCurrentSeason } from '../models/season'

export const resetSigmaAllInGuild = async (guildId: string) => {
  const season = await getCurrentSeason(guildId)
  await prisma.$transaction(async (prisma) => {
    const ratings = await prisma.rating.findMany({ where: { guildId } })
    await prisma.rating.updateMany({
      where: { id: { in: ratings.map((r) => r.id) } },
      data: { sigma: INITIAL_SIGMA },
    })

    await prisma.ratingChangedHistory.createMany({
      data: ratings.map((rating) => {
        return {
          ratingId: rating.id,
          muBefore: rating.mu,
          muAfter: rating.mu,
          sigmaBefore: rating.sigma,
          sigmaAfter: INITIAL_SIGMA,
          seasonId: season?.id,
          reason: 'RESET_SIGMA_ALL_IN_GUILD',
        }
      }),
    })
  })
}

export const resetRating = async (ratingId: string, mu: number) => {
  const rating = await prisma.rating.findUnique({ where: { id: ratingId } })
  if (!rating) {
    return 'RATING_NOT_FOUND'
  }
  const season = await getCurrentSeason(rating.guildId)

  await prisma.$transaction(async (prisma) => {
    await prisma.rating.update({
      where: { id: rating.id },
      data: { mu, sigma: INITIAL_SIGMA },
    })

    await prisma.ratingChangedHistory.create({
      data: {
        ratingId: rating.id,
        muBefore: rating.mu,
        muAfter: mu,
        sigmaBefore: rating.sigma,
        sigmaAfter: INITIAL_SIGMA,
        seasonId: season?.id,
        reason: 'RESET_RATING',
      },
    })
  })
}
