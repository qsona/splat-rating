import { sum, difference } from 'lodash'
import { Rating } from '@prisma/client'
import { prisma } from '../prismaClient'

export const createMatching = async (userId: string, channelId: string) => {
  // TODO: acquire lock
  const room = await prisma.room.findUnique({
    where: { discordChannelId: channelId },
  })
  if (!room) {
    return 'ROOM_DOES_NOT_EXIST'
  }
  const { rule } = room

  // TODO: who can create matching?
  const matchingExists = !!(await prisma.matching.count({
    where: {
      roomId: room.id,
    },
  }))

  if (matchingExists) {
    return 'MATCHING_EXISTS'
  }

  const joinedUsers = await prisma.joinedUser.findMany({
    where: {
      roomId: room.id,
    },
  })

  if (joinedUsers.length !== 8) {
    return 'JOINED_USERS_NOT_ENOUGH'
  }

  const joinedUserIds = joinedUsers.map((u) => u.userId)
  const ratings = await prisma.rating.findMany({
    where: {
      userId: { in: joinedUserIds },
      rule,
    },
  })
  if (ratings.length !== joinedUsers.length) {
    throw new Error(`mismatch between ratings and joinedUsers. userIds: ${joinedUserIds}`)
  }

  const { creatorUserId } = room

  // move creator rating to first
  const creatorRatingIndex = ratings.findIndex((r) => r.userId === creatorUserId)
  if (creatorRatingIndex < 0) {
    throw new Error(`rating of creator does not exist`)
  }
  const creatorRating = ratings[creatorRatingIndex]
  ratings.splice(creatorRatingIndex, 1)
  ratings.unshift(creatorRating)

  const teamsRatings = calculateMatchingWithMinRateDiff(ratings)

  const matching = await prisma.matching.create({
    data: {
      room: { connect: { id: room.id } },
      teamsRatingIds: teamsRatings.map((teamRatings) => teamRatings.map((r) => r.id)),
    },
  })
  return { matching }
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
