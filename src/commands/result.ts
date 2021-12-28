import assert from 'assert'
import { prisma } from '../prismaClient'
import { CommandHandler } from '../../bot'
import { createGameResult, RatingResult } from '../operations'

const handler: CommandHandler = {
  commandName: 'sr-report',
  execute: async (interaction) => {
    console.log('aaaaaaaaaaaaaaaaaaaaa')
    const { channelId } = interaction
    const { id, username } = interaction.user
    const isAlphaWin = !!interaction.options.getBoolean('win')

    const playingGame = await prisma.playingGame.findUnique({
      where: {
        discordChannelId_creatorUserId: {
          creatorUserId: id,
          discordChannelId: channelId,
        },
      },
    })
    if (!playingGame) {
      await interaction.reply(`${username} がホストしているゲームは、現在このチャンネルにはありません。`)
      return
    }

    const res = await createGameResult(playingGame, isAlphaWin)
    const { gameResult } = res

    const winnerTeamsRatings = gameResult.winnerTeamsRatings as RatingResult[]
    const loserTeamsRatings = gameResult.loserTeamsRatings as RatingResult[]

    const ratingsWithUser = await prisma.rating.findMany({
      where: {
        id: { in: [winnerTeamsRatings, loserTeamsRatings].flatMap((rs) => rs.map((r) => r.ratingId)) },
      },
      include: { user: true },
    })

    const inspectTeamUsers = (teamRatings: RatingResult[]) => {
      return teamRatings
        .map((ratingResult) => {
          const ratingWithUser = ratingsWithUser.find((ru) => ru.id === ratingResult.ratingId)
          assert(ratingWithUser, `Rating not found. id: ${ratingResult.ratingId}`)
          return `${ratingWithUser.user.name} (R${Math.floor(ratingResult.before.mu)}=>${Math.floor(ratingResult.after.mu)})`
        })
        .join(' ')
    }
    const messages = [`Winners: ${inspectTeamUsers(winnerTeamsRatings)}`, `Losers: ${inspectTeamUsers(loserTeamsRatings)}`]

    if (res.isFinished) {
      await interaction.reply(messages.join('\n'))
      return
    }
  },
}

export default handler
