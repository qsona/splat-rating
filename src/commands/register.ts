import { CommandHandler } from '../../bot'

import { prisma } from '../prismaClient'
import { SplatRuleSet, createRating } from '../operations'

export const SPLAT_RULES_NAME_MAP: { code: SplatRuleSet; name: string }[] = [
  { code: 'SplatZones', name: 'ガチエリア' },
  { code: 'TowerControl', name: 'ガチヤグラ' },
  { code: 'Rainmaker', name: 'ガチホコバトル' },
  { code: 'ClamBlitz', name: 'ガチアサリ' },
]

const handler: CommandHandler = {
  commandName: 'sr-register',
  execute: async (interaction) => {
    const { id, username } = interaction.user
    let isNewUser = true
    try {
      await prisma.user.create({
        data: {
          id,
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
    const gachipower = interaction.options.getNumber('gachipower')
    const rule = interaction.options.getString('rule')
    const rulename = SPLAT_RULES_NAME_MAP.find((r) => r.code === rule)?.name
    if (!rulename) {
      throw new Error(`Unknown rule ${rule}`)
    }
    console.log(gachipower, rule)

    const messages = []
    if (isNewUser) {
      messages.push(`ユーザー ${username} が新しく登録されました。(ID: ${id})`)
    }

    try {
      await createRating(id, rule as SplatRuleSet, gachipower!)
      messages.push(`ユーザー ${username} の ${rulename} のレーティングが登録されました。 初期値: ${gachipower}`)
    } catch (e) {
      if ((e as any).code === 'P2002') {
        messages.push(`ユーザー ${username} の ${rulename} のレーティングはすでに登録されています。`)
      } else {
        throw e
      }
    }

    await interaction.reply(messages.join('\n'))
  },
}

export default handler
