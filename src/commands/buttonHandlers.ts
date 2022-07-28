import { ActionRowBuilder, ButtonBuilder, ButtonInteraction, ButtonStyle } from 'discord.js'

export const execute = async (interaction: ButtonInteraction) => {
  if (interaction.customId === 'dash') {
    const rowJump = new ActionRowBuilder<ButtonBuilder>().addComponents(new ButtonBuilder().setCustomId('jump').setLabel('Jump!').setStyle(ButtonStyle.Primary))
    await interaction.reply({ content: 'Dash!!!!!!!', components: [rowJump] })
    return
  }
  if (interaction.customId === 'jump') {
    const rowDash = new ActionRowBuilder<ButtonBuilder>().addComponents(new ButtonBuilder().setCustomId('dash').setLabel('Dash!').setStyle(ButtonStyle.Danger))
    await interaction.reply({ content: '???????Jump', components: [rowDash] })
    return
  }
}
