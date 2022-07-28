import { ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js'
import { CommandHandler } from '../../bot'

const handler: CommandHandler = {
  commandName: 'sr-ping',
  execute: async (interaction) => {
    const rowDash = new ActionRowBuilder<ButtonBuilder>().addComponents(new ButtonBuilder().setCustomId('dash').setLabel('Dash!').setStyle(ButtonStyle.Danger))
    const rowJump = new ActionRowBuilder<ButtonBuilder>().addComponents(new ButtonBuilder().setCustomId('jump').setLabel('Jump!').setStyle(ButtonStyle.Primary))
    const message = `Pong! User: ${interaction.user.username} Server info: ${interaction.guild?.name} ${interaction.guild?.id}`
    await interaction.reply({ content: message, components: [rowDash, rowJump] })
  },
}

export default handler
