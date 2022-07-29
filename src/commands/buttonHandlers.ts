import { ActionRowBuilder, ButtonBuilder, ButtonInteraction, ButtonStyle } from 'discord.js'
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
    const rowJump = new ActionRowBuilder<ButtonBuilder>().addComponents(new ButtonBuilder().setCustomId('jump').setLabel('Jump!').setStyle(ButtonStyle.Primary))
    await interaction.reply({ content: 'Dash!!!!!!!', components: [rowJump] })
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
