import { sumBy } from 'lodash'

export const inspectRating = (mu: number) => `R${Math.floor(mu)}`

export const inspectTeamUsers = (teamUsers: { mu: number; username: string }[]) => {
  //  const usersStr = teamUsers.map((ru) => `${ru.username} (R${ru.mu})`).join(' ')
  const usersStr = teamUsers.map((ru) => ru.username).join(' ')
  const ratingStr = `合計${inspectRating(sumBy(teamUsers, (ru) => ru.mu))} (${teamUsers.map((tu) => inspectRating(tu.mu)).join(', ')})`

  return `${usersStr} | ${ratingStr}`
}
