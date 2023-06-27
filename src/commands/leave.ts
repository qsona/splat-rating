import { ButtonInteraction, ChatInputCommandInteraction } from 'discord.js'
import { CommandHandler } from '../../bot'
import { leaveRoom } from '../operations/leaveRoom'
import { ButtonCommandHandler } from './buttonHandlers'

const leaveExecute = async (interaction: ButtonInteraction | ChatInputCommandInteraction) => {
  const { channelId } = interaction
  const { id, username } = interaction.user

  const result = await leaveRoom(id, channelId)

  if (result === 'ROOM_DOES_NOT_EXIST') {
    await interaction.reply('このチャンネルに募集中のゲームは現在ありません。')
    return
  }

  if (result === 'CREATOR_CANNOT_LEAVE') {
    await interaction.reply('ホストは抜けられません。やめるときは `/sr-break` コマンドでゲームを解散してください。')
    return
  }

  if (result === 'USER_NOT_JOINED') {
    await interaction.reply(`${username} はこのチャンネルのゲームに参加していません。`)
    return
  }

  // TODO: commonize this logic with join.ts
  const remainMinUsersCount = Math.max(result.remainMinUsersCount, 0)
  await interaction.reply(`${username} さんがゲームから抜けました。\n@${remainMinUsersCount}~${result.remainMaxUsersCount}`)
}

const handler: CommandHandler = {
  commandName: 'sr-leave',
  execute: leaveExecute,
}

export default handler

export const leaveButtonHandler: ButtonCommandHandler = {
  customId: 'button-leave',
  execute: leaveExecute,
}
