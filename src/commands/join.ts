import { CommandHandler } from '../../bot'

import { joinRoom } from '../operations/joinRoom'

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

    const isPlayable = result.remainUsersCount === 0

    if (isPlayable) {
      const messages = [`ゲーム参加 ${username} (R${result.rating.mu}) @うまり`, '`/sr-match` でチーム分けしてください']
      await interaction.reply(messages.join('\n'))
      return
    }

    await interaction.reply(`${username} さんがゲームに参加しました。 (R${result.rating.mu})\n@${result.remainUsersCount}`)
  },
}

export default handler
