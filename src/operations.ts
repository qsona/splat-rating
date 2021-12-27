import assert from 'assert'
import { sum, difference } from 'lodash'
import Aigle from 'aigle'
import { Rating } from '@prisma/client'
import { prisma } from './prismaClient'
import { rate } from 'openskill'

export type SplatRuleSet = 'SplatZones' | 'TowerControl' | 'Rainmaker' | 'ClamBlitz'

const BETA = 200
const INITIAL_SIGMA = 200

export const createRating = async (userId: string, rule: SplatRuleSet, estimatedGachiPower: number) => {
  const rating = await prisma.rating.create({
    data: {
      mu: estimatedGachiPower,
      sigma: INITIAL_SIGMA,
      userId: userId,
      rule,
    },
  })

  return rating
}

export const createGameMatching = async (ratings: Rating[]) => {
  assert.equal(ratings.length, 8)
  const teamsRatings = calculateMatchingWithMinRateDiff(ratings)

  const gameMatching = await prisma.gameMatching.create({
    data: {
      teamsRatingIds: teamsRatings.map((teamRatings) => teamRatings.map((r) => r.id)),
    },
  })
  return gameMatching
}

export const calculateMatchingWithMinRateDiff = (ratings: Rating[]) => {
  let minRateDiff = Number.POSITIVE_INFINITY
  let rates = ratings.map((r) => r.mu)
  let totalRate = sum(rates)
  let currentAlphaTeamIndexes: number[] = []

  for (let i = 1; i <= 5; i++) {
    for (let j = i + 1; j <= 6; j++) {
      for (let k = j + 1; k <= 7; k++) {
        const alphaTeamIndexes = [0, i, j, k]
        const alphaTeamTotalRate = sum(alphaTeamIndexes.map((i) => rates[i]))
        const bravoTeamTotalRate = totalRate - alphaTeamTotalRate
        const rateDiff = Math.abs(alphaTeamTotalRate - bravoTeamTotalRate)

        if (rateDiff < minRateDiff) {
          currentAlphaTeamIndexes = alphaTeamIndexes
          minRateDiff = rateDiff
        }
      }
    }
  }

  const decidedAlphaTeamIndexes = currentAlphaTeamIndexes
  const decidedBravoTeamIndexes = difference([0, 1, 2, 3, 4, 5, 6, 7], decidedAlphaTeamIndexes)
  return [decidedAlphaTeamIndexes, decidedBravoTeamIndexes].map((teamIndexes) => {
    return teamIndexes.map((index) => ratings[index])
  })
}

export const createGameResult = async (gameMatchingId: string, isAlphaWin: boolean) => {
  return await prisma.$transaction(async (prisma) => {
    const gameMatching = await prisma.gameMatching.findUnique({ where: { id: gameMatchingId }, rejectOnNotFound: true })
    const teamsRatings = await Aigle.map(gameMatching.teamsRatingIds as string[][], async (teamRatingIds) => {
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
    const [winnerTeamsRatings, loserTeamsRatings] = await Aigle.map(sortedTeamsRatings, async (teamRatings, teamIndex) => {
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
        winnerTeamsRatings,
        loserTeamsRatings,
      },
    })

    await prisma.gameMatching.delete({
      where: { id: gameMatchingId },
    })

    return gameResult
  })
}
