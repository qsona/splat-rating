import Aigle from 'aigle'
import { rate } from 'openskill'
import { prisma } from '../prismaClient'

const BETA = 200
const MINIMUM_SIGMA = 120

export type RatingResult = {
  ratingId: string
  userId: string
  before: { mu: number; sigma: number }
  after: { mu: number; sigma: number }
}

export const reportMatching = async (userId: string, discordChannelId: string, isAlphaWin: boolean) => {
  const room = await prisma.room.findUnique({
    where: { discordChannelId },
  })
  if (!room) {
    return 'ROOM_DOES_NOT_EXIST'
  }

  const matching = await prisma.matching.findUnique({ where: { roomId: room.id } })
  if (!matching) {
    return 'MATCHING_DOES_NOT_EXIST'
  }

  if (room.creatorUserId !== userId) {
    return 'USER_IS_NOT_CREATOR'
  }

  const { seasonId } = matching
  const teamsRatingIds = matching.teamsRatingIds as string[][]

  return await prisma.$transaction(async (prisma) => {
    const teamsRatings = await Aigle.map(teamsRatingIds, async (teamRatingIds) => {
      const teamRatings = await prisma.rating.findMany({
        where: { id: { in: teamRatingIds } },
      })
      return teamRatingIds.map((teamRatingId) => {
        const rating = teamRatings.find((r) => r.id === teamRatingId)
        if (!rating) {
          throw new Error(`rating not found. id: ${teamRatingId}`)
        }
        return rating
      })
    })

    const sortedTeamsRatings = isAlphaWin ? [teamsRatings[0], teamsRatings[1]] : [teamsRatings[1], teamsRatings[0]]
    const newTeamsRatings = rate(sortedTeamsRatings, { beta: BETA })
    console.log('win', newTeamsRatings[0])
    console.log('lose', newTeamsRatings[1])
    const [winnerTeamRatings, loserTeamRatings]: RatingResult[][] = await Aigle.map(sortedTeamsRatings, async (teamRatings, teamIndex) => {
      const isWinner = teamIndex === 0
      return await Aigle.map(teamRatings, async (rating, ratingIndex) => {
        const newRating = newTeamsRatings[teamIndex][ratingIndex]
        newRating.sigma = Math.max(newRating.sigma, MINIMUM_SIGMA)
        const updateData = {
          mu: newRating.mu,
          sigma: newRating.sigma,
        }
        const winLoseCountCreateData = { winCount: isWinner ? 1 : 0, loseCount: isWinner ? 0 : 1 }
        const winLoseCountUpdateData = isWinner ? { winCount: { increment: 1 } } : { loseCount: { increment: 1 } }

        await prisma.rating.update({
          where: {
            id: rating.id,
          },
          data: { ...updateData, ...winLoseCountUpdateData },
        })

        if (seasonId) {
          const rankPoint = updateData.mu - 3 * updateData.sigma
          const seasonUpdateData = {
            ...updateData,
            rankPoint,
          }
          await prisma.seasonRecord.upsert({
            where: { ratingId_seasonId: { ratingId: rating.id, seasonId } },
            update: { ...seasonUpdateData, ...winLoseCountUpdateData },
            create: {
              seasonId,
              ratingId: rating.id,
              ...seasonUpdateData,
              ...winLoseCountCreateData,
            },
          })
        }

        return {
          ratingId: rating.id,
          userId: rating.userId,
          before: {
            mu: rating.mu,
            sigma: rating.sigma,
          },
          after: {
            mu: newRating.mu,
            sigma: newRating.sigma,
          },
        }
      })
    })

    const gameResult = await prisma.gameResult.create({
      data: {
        beta: BETA,
        rule: room.rule,
        winnerTeamRatings,
        loserTeamRatings,
        seasonId,
      },
    })

    await prisma.gameResultRating.createMany({
      data: [
        ...winnerTeamRatings.map((r) => {
          return {
            ratingId: r.ratingId,
            muBefore: r.before.mu,
            sigmaBefore: r.before.sigma,
            muAfter: r.after.mu,
            sigmaAfter: r.after.sigma,
            isWinner: true,
            userId: r.userId,
            gameResultId: gameResult.id,
          }
        }),
        ...loserTeamRatings.map((r) => {
          return {
            ratingId: r.ratingId,
            muBefore: r.before.mu,
            sigmaBefore: r.before.sigma,
            muAfter: r.after.mu,
            sigmaAfter: r.after.sigma,
            isWinner: false,
            userId: r.userId,
            gameResultId: gameResult.id,
          }
        }),
      ],
    })

    await prisma.matching.delete({ where: { id: matching.id } })

    return { gameResult }
  })
}
