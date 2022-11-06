import assert from 'assert'
import { sum, difference } from 'lodash'
import { Rating } from '@prisma/client'
import { prisma } from '../prismaClient'
import { getCurrentSeason } from '../models/season'

export const createMatching = async (userId: string, channelId: string) => {
  // TODO: acquire lock
  const room = await prisma.room.findUnique({
    where: { discordChannelId: channelId },
  })
  if (!room) {
    return 'ROOM_DOES_NOT_EXIST'
  }

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

  if (joinedUsers.length < 8) {
    return 'JOINED_USERS_NOT_ENOUGH'
  }

  const joinedUserRatingIds = joinedUsers.map((u) => u.ratingId)
  const ratings = await prisma.rating.findMany({
    where: {
      id: { in: joinedUserRatingIds },
    },
  })
  if (ratings.length !== joinedUsers.length) {
    throw new Error(`mismatch between ratings and joinedUsers. ratingIds: ${joinedUserRatingIds}`)
  }

  const { guildId, creatorUserId, watchedUserIds } = room
  const season = await getCurrentSeason(guildId)

  // move creator rating to first
  const creatorRatingIndex = ratings.findIndex((r) => r.userId === creatorUserId)
  if (creatorRatingIndex < 0) {
    throw new Error(`rating of creator does not exist`)
  }
  const creatorRating = ratings[creatorRatingIndex]
  // temporarily remove creator
  ratings.splice(creatorRatingIndex, 1)

  // Decide watching (kansen) members
  const watchingUserRatings: Rating[] = []
  assert(ratings.length >= 7)

  const watchingExcludingUserIds = watchedUserIds.slice(-4)
  while (ratings.length > 7) {
    // pick watching user randomly except creator
    const watchingUserIndex = Math.floor(Math.random() * ratings.length)

    // temporary logic: avoid selecting users who watched last
    if (watchingExcludingUserIds.includes(ratings[watchingUserIndex].userId)) {
      continue
    }

    watchingUserRatings.push(ratings[watchingUserIndex])
    ratings.splice(watchingUserIndex, 1)
  }

  // put creator to head
  ratings.unshift(creatorRating)

  const joinedUsersSeparations = await prisma.joinedUsersSeparation.findMany({
    where: { roomId: room.id },
    include: { firstJoinedUser: true, secondJoinedUser: true },
  })
  const separations = joinedUsersSeparations.map((jus) => ({ firstUserId: jus.firstJoinedUser.userId, secondUserId: jus.secondJoinedUserId }))

  const teamsRatings = calculateMatchingWithMinRateDiff(ratings, separations)

  const watchingUserIds = watchingUserRatings.map((r) => r.userId)

  const matching = await prisma.matching.create({
    data: {
      roomId: room.id,
      teamsRatingIds: teamsRatings.map((teamRatings) => teamRatings.map((r) => r.id)),
      metadata: { watchingUserIds },
      seasonId: season?.id,
    },
  })
  await prisma.room.update({
    where: { id: room.id },
    data: {
      watchedUserIds: {
        push: watchingUserIds,
      },
    },
  })
  return { matching, watchingUserIds }
}

// the first element of ratings must be creator's rating
export const calculateMatchingWithMinRateDiff = (ratings: Rating[], separations: { firstUserId: string; secondUserId: string }[] = []) => {
  assert.equal(ratings.length, 8)
  let minRateDiff = Number.POSITIVE_INFINITY
  let rates = ratings.map((r) => r.mu)
  let totalRate = sum(rates)
  let currentAlphaTeamIndexes: number[] = []

  const isSeparated = (alphaTeamIndexes: [number, number, number, number]): boolean => {
    const alphaTeamUserIds: string[] = []
    const bravoTeamUserIds: string[] = []
    ratings.forEach(({ userId }, index) => (alphaTeamIndexes.includes(index) ? alphaTeamUserIds : bravoTeamUserIds).push(userId))

    return separations.every(({ firstUserId, secondUserId }): boolean => {
      if (alphaTeamUserIds.includes(firstUserId) && alphaTeamUserIds.includes(secondUserId)) return false
      if (bravoTeamUserIds.includes(firstUserId) && bravoTeamUserIds.includes(secondUserId)) return false
      return true
    })
  }

  for (let i = 1; i <= 5; i++) {
    for (let j = i + 1; j <= 6; j++) {
      for (let k = j + 1; k <= 7; k++) {
        const alphaTeamIndexes: [number, number, number, number] = [0, i, j, k]

        if (!isSeparated(alphaTeamIndexes)) continue

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
