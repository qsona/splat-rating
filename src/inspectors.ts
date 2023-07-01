import { TksRating, TksTeam } from '@prisma/client'
import { sumBy } from 'lodash'
import { tksTeamRatingInfo } from './models/TksTeam'

export const inspectR = (r: number) => `R${Math.floor(r)}`

export const inspectTeamUsers = (teamUsers: { mu: number; username: string }[]) => {
  //  const usersStr = teamUsers.map((ru) => `${ru.username} (R${ru.mu})`).join(' ')
  const usersStr = teamUsers.map((ru) => ru.username).join(' ')
  const ratingStr = `合計${inspectR(sumBy(teamUsers, (ru) => ru.mu))} (${teamUsers.map((tu) => inspectR(tu.mu)).join(', ')})`

  return `${usersStr} | ${ratingStr}`
}

export const inspectTksTeam = (team: TksTeam, rating: TksRating) => {
  const { rank, rate, isTentative } = tksTeamRatingInfo(team, rating)
  const rateText = isTentative ? `[計測中 ${rating.winCount}/5] (推定${inspectR(rate)})` : `${rank.iconText} (${inspectR(rate)})`
  return `${rateText} | ${team.name || '(チーム名未設定)'}`
}
