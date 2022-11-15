import { prisma } from '../prismaClient'
import { User } from '@prisma/client'
import { SPLAT_RULES_NAME_MAP } from '../../src/rules'
import { getCurrentSeason } from '../models/season'

const SPLAT_ROOM_GUILD_ID = '853262631837630484';

export const getRankingData = async (user: User) => {
  const rankingData = new Map()

  const season = await getCurrentSeason(SPLAT_ROOM_GUILD_ID)
  if (!season) {
    return null;
  }

  // NOTE: 下記で取得したかったが、ruleを紐づけるクエリが複雑になるため既存処理を流用
  // var seasonRecords = await prisma.seasonRecord.findMany({
  //   where: { seasonId: season.id },
  //   orderBy: { rankPoint: 'desc' },
  //   include: { rating: { select: { user: true } } }
  // })
  // seasonRecords.map(k => ({ name: k.rating.user.name, rankPoint: k.rankPoint, mu: k.mu }))

  for (var i = 0; i < SPLAT_RULES_NAME_MAP.length; i++) {
    const rule = SPLAT_RULES_NAME_MAP[i];
    const ratings = await prisma.rating.findMany({
      where: {
        guildId: SPLAT_ROOM_GUILD_ID,
        rule: rule.code,
        seasonRecords: {
          some: {
            seasonId: season.id
          }
        }
      },
      include: {
        seasonRecords:true
      },
      orderBy: {
        mu: 'desc'
      }
    })
    const simpleRank = ratings.findIndex((r) => r.userId === user.id) + 1
    if (simpleRank !== 0) {
      let mu3SigmaRatings = ratings.map(function(value, idx, map) {
        return {
          userId: value.userId,
          score: value.mu - (3 * value.sigma)
        }
      })
      mu3SigmaRatings.sort(function (a, b) {
        // sort by score desc
        if (a.score < b.score) {
          return 1
        }
        if (b.score < a.score) {
          return -1
        }
        return 0
      })
      const mu3SigmaRank = mu3SigmaRatings.findIndex((r) => r.userId === user.id) + 1
      rankingData.set(rule.code, {
        simpleRank: simpleRank,
        mu3SigmaRank: mu3SigmaRank,
        count: ratings.length
      })
    }
  }
  return rankingData
}
