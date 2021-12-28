import { CommandHandler } from '../../bot'

import { prisma } from '../prismaClient'
import { createRating } from '../operations'
import { SplatRuleSet, SPLAT_RULES_NAME_MAP } from '../rules'

const handler: CommandHandler = {
  commandName: 'sr-register',
  execute: async (interaction) => {
    const gachipower = interaction.options.getNumber('gachipower')
    const rule = interaction.options.getString('rule')
    const rulename = SPLAT_RULES_NAME_MAP.find((r) => r.code === rule)?.name
    if (!rulename) {
      throw new Error(`Unknown rule ${rule}`)
    }
    console.log(gachipower, rule)

    const { id, username } = interaction.user
    // const name = interaction.options.getString('name') || username
    // 名前指定どうしようかなあ、一旦discordの名前でいいことにしちゃう (だめ)
    const name = username
    let isNewUser = true
    try {
      await prisma.user.create({
        data: {
          id,
          name,
        },
      })
    } catch (e) {
      if ((e as any).code === 'P2002') {
        // just user is already registered
        isNewUser = false
      } else {
        throw e
      }
    }

    // register rating

    const messages = []
    if (isNewUser) {
      messages.push(`ユーザー ${name} が新しく登録されました。(ID: ${id})`)
    }

    try {
      await createRating(id, rule as SplatRuleSet, gachipower!)
      messages.push(`ユーザー ${name} の ${rulename} のレーティングが登録されました。 初期値: ${gachipower}`)
    } catch (e) {
      if ((e as any).code === 'P2002') {
        messages.push(`ユーザー ${name} の ${rulename} のレーティングはすでに登録されています。`)
      } else {
        throw e
      }
    }

    await interaction.reply(messages.join('\n'))
  },
}

export default handler
