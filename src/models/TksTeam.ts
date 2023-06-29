import { TksTeam, TksRating } from '@prisma/client'
import hash from 'object-hash'

export const calcTeamId = (userIds: string[]) => {
  return hash(userIds, { unorderedArrays: true })
}

type TksTeamRank = {
  minRate: number
  color: string
  iconText: string
}

const teamRanks: TksTeamRank[] = [
  {
    minRate: 2600,
    color: 'heart',
    iconText: ':heart:',
  },
  {
    minRate: 2500,
    color: 'orange',
    iconText: ':orange_heart:',
  },
  {
    minRate: 2400,
    color: 'yellow',
    iconText: ':yellow_heart:',
  },
  {
    minRate: 2300,
    color: 'green',
    iconText: ':green_heart:',
  },
  {
    minRate: 2200,
    color: 'blue',
    iconText: ':blue_heart:',
  },
  {
    minRate: 2100,
    color: 'purple',
    iconText: ':purple_heart:',
  },
  {
    minRate: 2000,
    color: 'black',
    iconText: ':black_heart:',
  },
  {
    minRate: 1900,
    color: 'white',
    iconText: ':white_heart:',
  },
  {
    minRate: -Infinity,
    color: 'brown',
    iconText: ':brown_heart:',
  },
]

export const calcRate = (rating: TksRating) => rating.mu - rating.sigma
export const getRank = (rate: number) => teamRanks.find((r) => rate >= r.minRate)!

export const teamDisplayName = (team: TksTeam, rating: TksRating) => {
  const rank = getRank(calcRate(rating))
  return `${rank.iconText} ${team.name || '(チーム名未設定)'}`
}
