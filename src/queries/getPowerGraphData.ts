import { prisma } from '../prismaClient'
import { User } from '@prisma/client'
import { SPLAT_RULES_NAME_MAP } from '../../src/rules'
import { Template } from '../../src/models/graphData'

export const getPowerGraphData = async (user: User) => {
  const gameResultRatings = await prisma.gameResultRating.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: 'asc' },
    include: { gameResult: true },
  })
  let powerGraphData = new Map()
  SPLAT_RULES_NAME_MAP.forEach(function (rule) {
    // do clone without npm clone module
    powerGraphData.set(rule.code, JSON.parse(JSON.stringify(Template)))
  })
  if (gameResultRatings) {
    gameResultRatings.forEach(function (gameResultRating) {
      let templateData = powerGraphData.get(gameResultRating.gameResult.rule)
      const formattedCreatedAt =
        gameResultRating.createdAt.getMonth() +
        1 +
        '/' +
        gameResultRating.createdAt.getDate() +
        ' ' +
        ('0' + gameResultRating.createdAt.getHours()).slice(-2) +
        ':' +
        ('0' + gameResultRating.createdAt.getMinutes()).slice(-2)
      templateData.data.labels.push(formattedCreatedAt)
      templateData.data.datasets[0].data.push(Math.floor(gameResultRating.muAfter))
    })
  }
  return powerGraphData
}
