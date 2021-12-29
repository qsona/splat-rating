import assert from 'assert'
import { sum, difference } from 'lodash'
import Aigle from 'aigle'
import { Rating, JoinedUser, PlayingGame } from '@prisma/client'
import { prisma } from './prismaClient'
import { rate } from 'openskill'
import { SplatRuleSet } from './rules'

const BETA = 200
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

export const createGameMatching = async (playingGameId: string, ratings: Rating[]) => {
  assert.equal(ratings.length, 8)
  const teamsRatings = calculateMatchingWithMinRateDiff(ratings)

  const gameMatching = await prisma.gameMatching.create({
    data: {
      playingGameId,
      teamsRatingIds: teamsRatings.map((teamRatings) => teamRatings.map((r) => r.id)),
    },
  })
  return gameMatching
}

export type RatingResult = {
  ratingId: string
  before: { mu: number; sigma: number }
  after: { mu: number; sigma: number }
}

export const createGameResult = async (playingGame: PlayingGame, isAlphaWin: boolean) => {
  const gameMatching = await prisma.gameMatching.findUnique({ where: { playingGameId: playingGame.id }, rejectOnNotFound: true })

  return await prisma.$transaction(async (prisma) => {
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
    const [winnerTeamsRatings, loserTeamsRatings]: RatingResult[][] = await Aigle.map(sortedTeamsRatings, async (teamRatings, teamIndex) => {
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
      where: { id: gameMatching.id },
    })

    const isFinishing = playingGame.currentGameCount + 1 === playingGame.totalGameCount

    if (isFinishing) {
      await prisma.playingGame.delete({
        where: { id: playingGame.id },
      })
      return {
        isFinished: true as true,
        gameResult,
      }
    }

    const previousRatingIds = gameMatching.teamsRatingIds as string[][]

    // create next match
    // TODO
    // const nextGameMatching = await createGameMatching(playingGame.id, [])

    return {
      isFinished: false as false,
      gameResult,
      // nextGameMatching,
    }
  })
}
