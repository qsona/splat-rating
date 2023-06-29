import assert from 'assert'
import { prisma } from '../prismaClient'
import { calcTeamId } from '../models/TksTeam'
import { SplatRuleSet } from '../rules'
import { Rating } from '@prisma/client'

const rule: SplatRuleSet = 'SplatZones'
const INITIAL_SIGMA = 100

export const tksCreateParty = async (userIds: string[]) => {
  assert(userIds.length === 4, 'userIds.length must be 4')

  const teamId = calcTeamId(userIds)

  let team = await prisma.tksTeam.findUnique({ where: { id: teamId } })
  let teamRating = team ? await prisma.tksRating.findUnique({ where: { teamId_rule: { teamId, rule } } }) : null
  let userRatings: Rating[]
  if (!teamRating) {
    userRatings = await prisma.rating.findMany({ where: { userId: { in: userIds } } })
    if (userRatings.length !== 4) {
      const ratingUnregisteredUserIds = userIds.filter((userId) => !userRatings.find((userRating) => userRating.userId === userId))
      return {
        error: 'RATING_NOT_REGISTERED' as const,
        ratingUnregisteredUserIds,
      }
    }
  }

  const { party } = await prisma.$transaction(async (prisma) => {
    // register team
    if (!team) {
      // create だとなぜか id が渡せない...
      team = await prisma.tksTeam.upsert({
        where: { id: teamId },
        update: {},
        create: {
          id: teamId,
          tksTeamUsers: {
            create: userIds.map((userId) => ({
              userId,
            })),
          },
        },
      })
    }
    if (!teamRating) {
      const mu = userRatings.reduce((sum, userRating) => sum + userRating.mu, 0) / 4
      teamRating = await prisma.tksRating.create({
        data: {
          teamId,
          rule,
          mu,
          sigma: INITIAL_SIGMA,
        },
      })
    }
    const party = await prisma.tksParty.create({ data: { teamId } })
    return { party }
  })

  assert(team)
  assert(teamRating)
  return { team, teamRating, party }
}
