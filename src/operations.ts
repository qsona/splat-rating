import assert from 'assert'
import { sum, difference } from 'lodash'
import Aigle from 'aigle'
import { JoinableGame, Rating, JoinedUser, GameMatching, PlayingGame } from '@prisma/client'
import { prisma } from './prismaClient'
import { rate } from 'openskill'
import { SplatRuleSet } from './rules'

const BETA = 200
const INITIAL_SIGMA = 200

export const createNewGame = async (userId: string, discordChannelId: string, rule: SplatRuleSet, totalGameCount: number) => {
  const rating = await prisma.rating.findUnique({
    where: {
      userId_rule: { userId, rule },
    },
  })
  if (!rating) {
    return 'RATING_DOES_NOT_EXIST'
  }

  return await prisma.$transaction(async (prisma) => {
    let joinableGame: JoinableGame
    try {
      joinableGame = await prisma.joinableGame.create({
        data: {
          discordChannelId,
          creatorUserId: userId,
          rule,
          totalGameCount,
        },
      })
    } catch (e) {
      if ((e as any).code === 'P2002') {
        return 'JOINABLE_GAME_ALREADY_EXISTS'
      }
      throw e
    }
    const joinedUser = await prisma.joinedUser.create({
      data: {
        joinableGameId: joinableGame.id,
        userId,
      },
    })

    return { rating, joinableGame, joinedUser }
  })
}

export const joinGame = async (userId: string, discordChannelId: string) => {
  // TODO: acquire lock
  const joinableGame = await prisma.joinableGame.findUnique({
    where: { discordChannelId },
  })
  if (!joinableGame) {
    return 'JOINABLE_GAME_DOES_NOT_EXIST'
  }
  const { rule } = joinableGame
  const rating = await prisma.rating.findUnique({
    where: {
      userId_rule: { userId, rule },
    },
  })
  if (!rating) {
    return 'RATING_DOES_NOT_EXIST'
  }

  return await prisma.$transaction(async (prisma) => {
    let joinedUser: JoinedUser
    try {
      joinedUser = await prisma.joinedUser.create({
        data: {
          joinableGameId: joinableGame.id,
          userId,
        },
      })
    } catch (e) {
      if ((e as any).code === 'P2002') {
        return 'USER_ALREADY_JOINED'
      }
      throw e
    }

    const joinedUsers = await prisma.joinedUser.findMany({
      where: {
        joinableGameId: joinableGame.id,
      },
    })

    if (joinedUsers.length < 8) {
      return {
        status: 'joinable' as 'joinable',
        joinedUser,
        joinableGame,
        joinedUsersCount: joinedUsers.length,
        remainUsersCount: 8 - joinedUsers.length,
        rating,
      }
    }

    // matching
    assert.equal(joinedUsers.length, 8)

    const ratings = await prisma.rating.findMany({
      where: {
        userId: { in: joinedUsers.map((u) => u.userId) },
        rule,
      },
    })
    if (ratings.length !== joinedUsers.length) {
      throw new Error(`mismatch between ratings and joinedUsers`)
    }

    const { creatorUserId } = joinableGame

    // move creator rating to first
    const creatorRatingIndex = ratings.findIndex((r) => r.userId === creatorUserId)
    if (creatorRatingIndex < 0) {
      throw new Error(`rating of creator does not exist`)
    }
    const creatorRating = ratings[creatorRatingIndex]
    ratings.splice(creatorRatingIndex, 1)
    ratings.unshift(creatorRating)

    const playingGame = await prisma.playingGame.create({
      data: {
        id: joinableGame.id,
        discordChannelId,
        rule,
        creatorUserId,
        totalGameCount: joinableGame.totalGameCount,
        currentGameCount: 0,
      },
    })

    const gameMatching = await createGameMatching(playingGame.id, ratings)

    await prisma.joinedUser.deleteMany({ where: { joinableGameId: joinableGame.id } })
    await prisma.joinableGame.delete({ where: { id: joinableGame.id } })

    return {
      status: 'matched' as 'matched',
      playingGame,
      rating,
      gameMatching,
    }
  })
}

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
