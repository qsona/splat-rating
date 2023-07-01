import { prisma } from '../prismaClient'
import { SplatRuleSet } from '../rules'

const rule: SplatRuleSet = 'SplatZones'
const BETA = 50

export const tksReport = async (userId: string, matchId: string, primaryWinCount: number, opponentWinCount: number, isInterrupted: boolean) => {
  const match = await prisma.tksMatch.findUnique({
    where: { id: matchId },
    include: {
      primaryTeam: { include: { tksTeamUsers: { include: { user: true } } } },
      opponentTeam: { include: { tksTeamUsers: { include: { user: true } } } },
    },
  })
  if (!match) {
    return { error: 'MATCH_NOT_FOUND' as const }
  }
  if (!match.primaryTeam.tksTeamUsers.some((tu) => tu.userId === userId)) {
    return { error: 'USER_NOT_IN_PRIMARY_TEAM' as const, match }
  }

  if (primaryWinCount < 0 || opponentWinCount < 0) {
    return { error: 'INVALID_WIN_COUNT' as const, match }
  }
  if (primaryWinCount > match.winCountOfMatch || opponentWinCount > match.winCountOfMatch) {
    return { error: 'WIN_COUNT_GREATER_THAN_WIN_COUNT_OF_MATCH' as const, match }
  }
  if (primaryWinCount === match.winCountOfMatch && opponentWinCount === match.winCountOfMatch) {
    return { error: 'BOTH_WIN_COUNT_ARE_WIN_COUNT_OF_MATCH' as const, match }
  }
  if (!isInterrupted && primaryWinCount !== match.winCountOfMatch && opponentWinCount !== match.winCountOfMatch) {
    return { error: 'BOTH_WIN_COUNT_ARE_NOT_WIN_COUNT_OF_MATCH' as const, match }
  }

  const { primaryTeamId, opponentTeamId, winCountOfMatch, rule } = match
  const tksMatchResult = await prisma.$transaction(async (prisma) => {
    await prisma.tksMatch.delete({ where: { id: matchId } })
    const tksMatchResult = await prisma.tksMatchResult.create({
      data: {
        primaryTeamId,
        opponentTeamId,
        winCountOfMatch,
        primaryWinCount,
        opponentWinCount,
        matchStartedAt: match.createdAt,
        rule,
      },
    })
    return tksMatchResult
  })
  return { tksMatchResult, deletedMatch: match }
}
