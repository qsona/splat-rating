import { CommandHandler } from '../../bot'

import { createRoom } from '../operations/createRoom'
import { SplatRuleSet, getRuleName } from '../rules'
import { inspectRating } from '../inspectors'

const handler: CommandHandler = {
  commandName: 'sr-newgame',
  execute: async (interaction) => {
    const { channelId } = interaction
    const { id, username } = interaction.user

    const rule = interaction.options.getString('rule') as SplatRuleSet
    const ruleName = getRuleName(rule)

    const result = await createRoom(id, channelId, rule)

    if (result === 'ROOM_ALREADY_EXISTS') {
      await interaction.reply('すでにこのチャンネルに募集中のゲームがあります。')
      return
    }
    if (result === 'RATING_DOES_NOT_EXIST') {
      await interaction.reply(`${username} さんは ${ruleName} のレーティング登録がまだです。/sr-register コマンドで登録してください。`)
      return
    }

    await interaction.reply(`ゲーム募集 ${ruleName} ホスト: ${username} (${inspectRating(result.rating.mu)}) @7~9`)
  },
}

export default handler
