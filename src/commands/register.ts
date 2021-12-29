import { CommandHandler } from '../../bot'

import { prisma } from '../prismaClient'
import { SplatRuleSet, getRuleName } from '../rules'

const handler: CommandHandler = {
  commandName: 'sr-register',
  execute: async (interaction) => {
    const gachipower = interaction.options.getNumber('gachipower')
    const rule = interaction.options.getString('rule') as SplatRuleSet
    const rulename = getRuleName(rule)

    const { id, username } = interaction.user
    const name = username

    // register rating

    const messages = []
    if (isNewUser) {
      messages.push(`ユーザー ${name} が新しく登録されました。(ID: ${id})`)
    }

    try {
      messages.push(`ユーザー ${name} の ${rulename} のレーティングが登録されました。 初期値: ${gachipower}`)
    } catch (e) {
      messages.push(`ユーザー ${name} の ${rulename} のレーティングはすでに登録されています。`)
    }

    await interaction.reply(messages.join('\n'))
  },
}

export default handler
