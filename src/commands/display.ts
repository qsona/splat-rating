import { CommandHandler } from '../../bot'

import { prisma } from '../prismaClient'
import { inspectR } from '../inspectors'
import assert from 'assert'
import { createJoinButton } from './helpers/buttons'

const handler: CommandHandler = {
  commandName: 'sr-display',
  execute: async (interaction) => {
    const { channelId } = interaction

    const room = await prisma.room.findUnique({ where: { discordChannelId: channelId } })

    if (!room) {
      await interaction.reply('このチャンネルに募集中のゲームは現在ありません。')
      return
    }

    const joinedUsers = await prisma.joinedUser.findMany({ where: { roomId: room.id }, include: { user: true } })
    const ratings = await prisma.rating.findMany({ where: { id: { in: joinedUsers.map((ju) => ju.ratingId) } } })

    // TODO: commonize logic
    const remainMinUsersCount = Math.max(8 - joinedUsers.length, 0)
    const remainMaxUsersCount = 10 - joinedUsers.length

    const usersInfo = joinedUsers.map((ju) => {
      const name = ju.user.name
      const rating = ratings.find((r) => r.id === ju.ratingId)
      assert(rating)
      return { rating, name }
    })
    const isJoinable = remainMaxUsersCount > 0
    const messages = [
      isJoinable ? `ゲーム募集中@${remainMinUsersCount}~${remainMaxUsersCount}` : 'ゲーム中(満員)',
      usersInfo.map((u) => `${u.name} (${inspectR(u.rating.mu)})`).join(' '),
    ]
    const components = isJoinable ? [createJoinButton()] : []

    await interaction.reply({ content: messages.join('\n'), components })
  },
}

export default handler
