import { CommandHandler } from '../../bot'
import { leaveRoom } from '../operations/leaveRoom'

const handler: CommandHandler = {
  commandName: 'sr-leave',
  execute: async (interaction) => {
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
  },
}

export default handler
