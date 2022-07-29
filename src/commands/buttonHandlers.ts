import { ActionRowBuilder, ButtonBuilder, ButtonInteraction, ButtonStyle, ModalBuilder, TextInputBuilder, TextInputStyle } from 'discord.js'
import { joinButtonHandler } from './join'

export type ButtonCommandHandler = {
  customId: string
  execute: (interaction: ButtonInteraction) => Promise<void>
}

const handlers = new Map<string, ButtonCommandHandler>()

export const execute = async (interaction: ButtonInteraction) => {
  const { customId } = interaction
  console.log('Button command customId:', customId)
  console.log('user:', interaction.user)

  const handler = handlers.get(customId)
  if (handler) {
    await handler.execute(interaction)
  }
  return
}

const dashHandler: ButtonCommandHandler = {
  customId: 'dash',
  execute: async (interaction) => {
    const modal = new ModalBuilder().setCustomId('modal-dash').setTitle('Dash!')
    const countInput = new TextInputBuilder().setCustomId('countInput').setLabel('count?').setStyle(TextInputStyle.Short)

    const firstActionRow = new ActionRowBuilder<TextInputBuilder>().addComponents(countInput)
    modal.addComponents(firstActionRow)
    await interaction.showModal(modal)
  },
}
const jumpHandler: ButtonCommandHandler = {
  customId: 'dash',
  execute: async (interaction) => {
    const rowDash = new ActionRowBuilder<ButtonBuilder>().addComponents(new ButtonBuilder().setCustomId('dash').setLabel('Dash!').setStyle(ButtonStyle.Danger))
    await interaction.reply({ content: '???????Jump', components: [rowDash] })
  },
}

;[joinButtonHandler, dashHandler, jumpHandler].forEach((handler) => handlers.set(handler.customId, handler))
