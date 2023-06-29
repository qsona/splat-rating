import { ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js'

export const createJoinButton = () => {
  return new ActionRowBuilder<ButtonBuilder>().addComponents(new ButtonBuilder().setCustomId('button-join').setLabel('参加').setStyle(ButtonStyle.Primary))
}

export const createLeaveButton = () => {
  return new ActionRowBuilder<ButtonBuilder>().addComponents(new ButtonBuilder().setCustomId('button-leave').setLabel('抜ける').setStyle(ButtonStyle.Secondary))
}

export const createMatchButton = () => {
  return new ActionRowBuilder<ButtonBuilder>().addComponents(
    new ButtonBuilder().setCustomId('button-match').setLabel('チーム分け').setStyle(ButtonStyle.Primary)
  )
}

export const createWinButton = () => {
  return new ActionRowBuilder<ButtonBuilder>().addComponents(new ButtonBuilder().setCustomId('button-report-win').setLabel('Win!').setStyle(ButtonStyle.Danger))
}

export const createLoseButton = () => {
  return new ActionRowBuilder<ButtonBuilder>().addComponents(
    new ButtonBuilder().setCustomId('button-report-lose').setLabel('Lose...').setStyle(ButtonStyle.Success)
  )
}

export const createCancelButton = () => {
  return new ActionRowBuilder<ButtonBuilder>().addComponents(
    new ButtonBuilder().setCustomId('button-report-cancel').setLabel('Cancel').setStyle(ButtonStyle.Secondary)
  )
}

export const createSplatZonesRegisterButton = () => {
  return new ActionRowBuilder<ButtonBuilder>().addComponents(
    new ButtonBuilder().setCustomId('button-splat-zones-register').setLabel('レーティング登録').setStyle(ButtonStyle.Secondary)
  )
}
