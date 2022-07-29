import { ModalSubmitInteraction } from 'discord.js'

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
    const count = Math.trunc(Number(countStr)) || 0
    await interaction.reply(`Dash! ⊂${'二'.repeat(count)}（ ＾ω＾）${'二'.repeat(count)}⊃`)
  },
}

;[dashHandler].forEach((handler) => handlers.set(handler.customId, handler))
