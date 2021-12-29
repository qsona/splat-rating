import Aigle from 'aigle'
import { rate } from 'openskill'
import { prisma } from '../prismaClient'

const BETA = 200

export type RatingResult = {
  ratingId: string
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

  return await prisma.$transaction(async (prisma) => {
    const teamsRatings = await Aigle.map(matching.teamsRatingIds as string[][], async (teamRatingIds) => {
      const teamRatings = await prisma.rating.findMany({ where: { id: { in: teamRatingIds } } })
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
      return await Aigle.map(teamRatings, async (rating, ratingIndex) => {
        const newRating = newTeamsRatings[teamIndex][ratingIndex]
        await prisma.rating.update({
          where: {
            id: rating.id,
          },
          data: {
            mu: newRating.mu,
            sigma: newRating.sigma,
          },
        })

        return {
          ratingId: rating.id,
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
        winnerTeamRatings,
        loserTeamRatings,
      },
    })

    await prisma.matching.delete({
      where: { id: matching.id },
    })

    return {
      gameResult,
    }
  })
}
