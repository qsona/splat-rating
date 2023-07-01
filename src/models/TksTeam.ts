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
    minRate: 2500,
    color: 'heart',
    iconText: ':heart:',
  },
  {
    minRate: 2400,
    color: 'orange',
    iconText: ':orange_heart:',
  },
  {
    minRate: 2300,
    color: 'yellow',
    iconText: ':yellow_heart:',
  },
  {
    minRate: 2200,
    color: 'green',
    iconText: ':green_heart:',
  },
  {
    minRate: 2100,
    color: 'blue',
    iconText: ':blue_heart:',
  },
  {
    minRate: 2000,
    color: 'purple',
    iconText: ':purple_heart:',
  },
  {
    minRate: 1900,
    color: 'black',
    iconText: ':black_heart:',
  },
  {
    minRate: 1800,
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
  const { rank, rate, isTentative } = tksTeamRatingInfo(team, rating)
  const rateText = isTentative ? `[計測中 ${rating.winCount}/5] (推定R${rate})` : `${rank.iconText} (R${rate})`
  return `${rateText} | ${team.name || '(チーム名未設定)'}`
}

export const tksTeamRatingInfo = (team: TksTeam, rating: TksRating) => {
  const rate = calcRate(rating)
  const rank = getRank(rate)
  const isTentative = rating.winCount < 5
  return {
    rank,
    rate,
    isTentative,
    team,
    rating,
  }
}
