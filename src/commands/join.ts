import assert from 'assert'
import { ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js'
import { CommandHandler } from '../../bot'

import { joinRoom } from '../operations/joinRoom'
import { inspectRating } from '../inspectors'

const handler: CommandHandler = {
  commandName: 'sr-join',
  execute: async (interaction) => {
    const { channelId, guildId } = interaction
    assert(guildId)
    const { id, username } = interaction.user

    const result = await joinRoom(id, channelId, guildId)

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

    const row = new ActionRowBuilder<ButtonBuilder>().addComponents(new ButtonBuilder().setCustomId('join').setLabel('参加').setStyle(ButtonStyle.Primary))

    await interaction.reply({ content: messages.join('\n'), components: [row] })
  },
}

export default handler
