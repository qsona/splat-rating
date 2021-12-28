import { CommandHandler } from '../../bot'

import { createNewGame } from '../operations'
import { SplatRuleSet, getRuleName } from '../rules'

const handler: CommandHandler = {
  commandName: 'sr-newgame',
  execute: async (interaction) => {
    const { channelId } = interaction
    const { id, username } = interaction.user

    const rule = interaction.options.getString('rule') as SplatRuleSet
    const ruleName = getRuleName(rule)
    const gameCount = interaction.options.getInteger('gamecount')!

    const result = await createNewGame(id, channelId, rule, gameCount)

    if (result === 'JOINABLE_GAME_ALREADY_EXISTS') {
      await interaction.reply('すでにこのチャンネルに募集中のゲームがあります。')
      return
    }
    if (result === 'RATING_DOES_NOT_EXIST') {
      await interaction.reply(`${username} さんは ${ruleName} のレーティング登録がまだです。/sr-register コマンドで登録してください。`)
      return
    }

    await interaction.reply(`ゲーム募集 ${ruleName} ホスト: ${username} (R${result.rating.mu}) @7`)
  },
}

export default handler
