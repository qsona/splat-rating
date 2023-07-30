import assert from 'assert'

import { CommandHandler } from '../../bot'

import { joinRoom } from '../operations/joinRoom'
import { inspectR } from '../inspectors'
import { getUserFromMentionable } from './helpers/mentionable'
import { createRow, createJoinButton, createMatchButton, createLeaveButton } from './helpers/buttons'

const handler: CommandHandler = {
  commandName: 'sr-make-join',
  execute: async (interaction) => {
    const { channelId, guildId } = interaction
    assert(guildId)
    const mentionable = interaction.options.getMentionable('user')!
    const user = getUserFromMentionable(mentionable)
    if (!user) {
      console.log('Error mentionable:', mentionable)
      await interaction.reply('user にはユーザを指定してください')
      return
    }
    const { id, username } = user

    const result = await joinRoom(id, channelId, guildId)

    if (result.error === 'ROOM_DOES_NOT_EXIST') {
      await interaction.reply('このチャンネルに募集中のゲームは現在ありません。')
      return
    }
    if (result.error === 'RATING_DOES_NOT_EXIST') {
      await interaction.reply(`${username} さんはレーティング登録がまだです。/sr-register コマンドで登録してください。`)
      return
    }
    if (result.error === 'USER_ALREADY_JOINED') {
      await interaction.reply(`${username} さんはすでに参加しています。`)
      return
    }
    if (result.error === 'TOO_MANY_JOINED_USERS') {
      await interaction.reply('このチャンネルのゲームは定員を超えています。')
      return
    }

    const remainMinUsersCount = Math.max(result.remainMinUsersCount, 0)
    const { remainMaxUsersCount } = result
    const message = `${username} さんがゲームに参加しました。 (${inspectR(result.rating.mu)})\n@${remainMinUsersCount}~${remainMaxUsersCount}`

    const components = []

    if (remainMinUsersCount === 0) components.push(createRow(createMatchButton()))

    const userButtons = []
    if (remainMaxUsersCount !== 0) userButtons.push(createJoinButton())
    userButtons.push(createLeaveButton())
    components.push(createRow(...userButtons))

    await interaction.reply({ content: message, components })
  },
}

export default handler
