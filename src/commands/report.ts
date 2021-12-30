import assert from 'assert'
import { prisma } from '../prismaClient'
import { CommandHandler } from '../../bot'
import { inspectRating } from '../inspectors'
import { reportMatching, RatingResult } from '../operations/reportMatching'
import { cancelMatching } from '../operations/cancelMatching'

const handler: CommandHandler = {
  commandName: 'sr-report',
  execute: async (interaction) => {
    const { channelId } = interaction
    const { id, username } = interaction.user
    const result = interaction.options.getString('result') as 'win' | 'lose' | 'cancel'

    if (result === 'cancel') {
      const cancelMatchingResult = await cancelMatching(channelId)
      if (cancelMatchingResult === 'ROOM_DOES_NOT_EXIST') {
        await interaction.reply(`現在このチャンネルにゲームはありません。`)
        return
      }
      if (cancelMatchingResult === 'MATCHING_DOES_NOT_EXIST') {
        await interaction.reply(`マッチングされていません。`)
        return
      }

      await interaction.reply(`マッチングをキャンセルしました。`)
      return
    }

    assert(result === 'win' || result === 'lose', result)

    const reportMatchingResult = await reportMatching(id, channelId, result === 'win')

    if (reportMatchingResult === 'ROOM_DOES_NOT_EXIST') {
      await interaction.reply(`現在このチャンネルにゲームはありません。`)
      return
    }

    if (reportMatchingResult === 'MATCHING_DOES_NOT_EXIST') {
      await interaction.reply(`マッチングされていません。`)
      return
    }

    if (reportMatchingResult === 'USER_IS_NOT_CREATOR') {
      await interaction.reply(`${username} はホストではありません。ホストが報告を行ってください。`)
      return
    }

    const { gameResult } = reportMatchingResult

    const winnerTeamsRatings = gameResult.winnerTeamRatings as RatingResult[]
    const loserTeamsRatings = gameResult.loserTeamRatings as RatingResult[]

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
          return `${ratingWithUser.user.name} (${inspectRating(ratingResult.before.mu)}=>${inspectRating(ratingResult.after.mu)})`
        })
        .join(' ')
    }
    const messages = [`Winners: ${inspectTeamUsers(winnerTeamsRatings)}`, `Losers: ${inspectTeamUsers(loserTeamsRatings)}`]

    await interaction.reply(messages.join('\n'))
  },
}

export default handler
