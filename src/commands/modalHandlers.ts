import { ModalSubmitInteraction } from 'discord.js'
import { registerUserAndRating } from '../operations/registerUserAndRating'
import { SplatRuleSet, getRuleName, SPLAT_RULES_NAME_MAP } from '../rules'

export type ModalCommandHandler = {
  customId: string
  execute: (interaction: ModalSubmitInteraction) => Promise<void>
}

const handlers = new Map<string, ModalCommandHandler>()

export const execute = async (interaction: ModalSubmitInteraction) => {
  const { customId } = interaction
  console.log('Modal command customId:', customId)
  console.log('user:', interaction.user)

  const handler = handlers.get(customId)
  if (handler) {
    await handler.execute(interaction)
  }
  return
}

const dashHandler: ModalCommandHandler = {
  customId: 'modal-dash',
  execute: async (interaction) => {
    const countStr = interaction.fields.getTextInputValue('countInput')
    const count = Math.min(Math.max(Math.trunc(Number(countStr)) || 0, 0), 100)
    await interaction.reply(`Dash! ⊂${'二'.repeat(count)}（ ＾ω＾）${'二'.repeat(count)}⊃`)
  },
}

const createRegisterModalHandler = (rule: SplatRuleSet): ModalCommandHandler => {
  return {
    customId: `modal-register-${rule}`,
    execute: async (interaction) => {
      const { guildId, guild } = interaction
      if (!guildId) {
        console.log(`guildId not found. interaction: ${interaction.toJSON()}`)
        await interaction.reply('guildId が存在しません。管理者にご連絡ください。')
        return
      }
      const gachipowerStr = interaction.fields.getTextInputValue('gachipowerInput')
      const gachipower = Math.trunc(Number(gachipowerStr)) || 0
      if (gachipower < 600 || 3200 < gachipower) {
        await interaction.reply('gachipower には 600 から 3200 までの値を入力してください')
        return
      }
      const rulename = getRuleName(rule)

      const { id, username } = interaction.user
      const name = username

      // register rating
      const result = await registerUserAndRating(id, username, guildId, rule, gachipower)
      if (result === 'RATING_ALREADY_REGISTERED') {
        await interaction.reply(`${guild?.name} において ユーザー ${name} の ${rulename} のレーティングはすでに登録されています。`)
        return
      }

      const messages = []
      if (result.isNewUser) {
        messages.push(`ユーザー ${name} が新しく登録されました。(ID: ${id})`)
      }

      messages.push(`ユーザー ${name} の ${rulename} のレーティングが登録されました。 初期値: ${gachipower}`)

      await interaction.reply(messages.join('\n'))
    },
  }
}

const registerModalHandlers = SPLAT_RULES_NAME_MAP.map(({ code }) => createRegisterModalHandler(code))

;[...registerModalHandlers, dashHandler].forEach((handler) => handlers.set(handler.customId, handler))
