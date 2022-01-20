import { CommandHandler } from '../../bot'

import { joinRoom } from '../operations/joinRoom'
import { inspectRating } from '../inspectors'

const handler: CommandHandler = {
  commandName: 'sr-join',
  execute: async (interaction) => {
    const { channelId } = interaction
    const { id, username } = interaction.user

    const result = await joinRoom(id, channelId)

    if (result === 'ROOM_DOES_NOT_EXIST') {
      await interaction.reply('このチャンネルに募集中のゲームは現在ありません。')
      return
    }
    if (result === 'RATING_DOES_NOT_EXIST') {
      await interaction.reply(`${username} さんはレーティング登録がまだです。/sr-register コマンドで登録してください。`)
      return
    }
    if (result === 'USER_ALREADY_JOINED') {
      await interaction.reply(`${username} さんはすでに参加しています。`)
      return
    }
    if (result === 'TOO_MANY_JOINED_USERS') {
      await interaction.reply('このチャンネルのゲームは定員を超えています。')
      return
    }

    const remainMinUsersCount = Math.max(result.remainMinUsersCount, 0)
    const { remainMaxUsersCount } = result
    const messages = [`${username} さんがゲームに参加しました。 (${inspectRating(result.rating.mu)})\n@${remainMinUsersCount}~${remainMaxUsersCount}`]

    if (result.remainMinUsersCount === 0) {
      messages.push('ホストは `/sr-match` でチーム分けしてください')
    }

    await interaction.reply(messages.join('\n'))
  },
}

export default handler
