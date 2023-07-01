import { rate } from 'openskill'
import { prisma } from '../prismaClient'

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
  const primaryTeamRating = await prisma.tksRating.findUniqueOrThrow({ where: { teamId_rule: { teamId: primaryTeamId, rule } } })
  const opponentTeamRating = await prisma.tksRating.findUniqueOrThrow({ where: { teamId_rule: { teamId: opponentTeamId, rule } } })

  const result = await prisma.$transaction(async (prisma) => {
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
    if (isInterrupted) {
      return { isInterrupted: true as const, tksMatchResult, deletedMatch: match }
    }

    const isPrimaryWin = primaryWinCount === winCountOfMatch
    const primary = { mu: primaryTeamRating.mu, sigma: primaryTeamRating.sigma }
    const opponent = { mu: opponentTeamRating.mu, sigma: opponentTeamRating.sigma }
    const [winNew, loseNew] = rate(isPrimaryWin ? [[primary], [opponent]] : [[opponent], [primary]], { beta: BETA })
    const [primaryNew, opponentNew] = isPrimaryWin ? [winNew[0], loseNew[0]] : [loseNew[0], winNew[0]]
    const primaryNewRating = await prisma.tksRating.update({
      where: { id: primaryTeamRating.id },
      data: {
        mu: primaryNew.mu,
        sigma: primaryNew.sigma,
        playCount: { increment: 1 },
        winCount: { increment: isPrimaryWin ? 1 : 0 },
        loseCount: { increment: isPrimaryWin ? 0 : 1 },
      },
    })
    const opponentNewRating = await prisma.tksRating.update({
      where: { id: opponentTeamRating.id },
      data: {
        mu: opponentNew.mu,
        sigma: opponentNew.sigma,
        playCount: { increment: 1 },
        winCount: { increment: isPrimaryWin ? 0 : 1 },
        loseCount: { increment: isPrimaryWin ? 1 : 0 },
      },
    })
    return { isInterrupted: false as const, tksMatchResult, deletedMatch: match, primaryNewRating, opponentNewRating }
  })
  return { error: false as const, ...result }
}
