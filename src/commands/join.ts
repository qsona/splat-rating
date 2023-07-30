import { CommandHandler } from '../../bot'
import assert from 'assert'

import { joinRoom } from '../operations/joinRoom'
import { inspectR } from '../inspectors'
import { createRow, createMatchButton, createJoinButton, createLeaveButton } from './helpers/buttons'
import { createRegisterAndJoinModal } from './helpers/modals'
import { ButtonCommandHandler } from './buttonHandlers'
import { ButtonInteraction, ChatInputCommandInteraction } from 'discord.js'
import { SplatRuleSet } from '../rules'

const joinExecute = async (interaction: ButtonInteraction | ChatInputCommandInteraction) => {
  const { channelId, guildId } = interaction
  assert(guildId)
  const { id, username } = interaction.user

  const result = await joinRoom(id, channelId, guildId)

  if (result.error === 'ROOM_DOES_NOT_EXIST') {
    await interaction.reply('このチャンネルに募集中のゲームは現在ありません。')
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
  if (result.error === 'RATING_DOES_NOT_EXIST') {
    const rule = result.room.rule as SplatRuleSet
    await interaction.showModal(createRegisterAndJoinModal(rule))
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
}

const handler: CommandHandler = {
  commandName: 'sr-join',
  execute: joinExecute,
}

export default handler

export const joinButtonHandler: ButtonCommandHandler = {
  customId: 'button-join',
  execute: joinExecute,
}
