import { prisma } from '../prismaClient'

export const getCurrentSeason = async (guildId: string) => {
  const season = await prisma.season.findFirst({
    where: {
      guildId,
      startAt: { lte: new Date() },
    },
    orderBy: {
      startAt: 'desc',
    },
  })
  return season
}
