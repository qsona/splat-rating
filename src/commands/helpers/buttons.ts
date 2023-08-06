import { ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js'

export const createRow = (...components: ButtonBuilder[]) => {
  return new ActionRowBuilder<ButtonBuilder>().addComponents(...components)
}

export const createJoinButton = () => {
  return new ButtonBuilder().setCustomId('button-join').setLabel('参加').setStyle(ButtonStyle.Primary)
}

export const createLeaveButton = () => {
  return new ButtonBuilder().setCustomId('button-leave').setLabel('抜ける').setStyle(ButtonStyle.Secondary)
}

export const createMatchButton = () => {
  return new ButtonBuilder().setCustomId('button-match').setLabel('チーム分け').setStyle(ButtonStyle.Primary)
}

export const createWinButton = () => {
  return new ButtonBuilder().setCustomId('button-report-win').setLabel('Win!').setStyle(ButtonStyle.Danger)
}

export const createLoseButton = () => {
  return new ButtonBuilder().setCustomId('button-report-lose').setLabel('Lose...').setStyle(ButtonStyle.Success)
}

export const createCancelButton = () => {
  return new ButtonBuilder().setCustomId('button-report-cancel').setLabel('Cancel').setStyle(ButtonStyle.Secondary)
}

export const createSplatZonesRegisterButton = () => {
  return new ActionRowBuilder<ButtonBuilder>().addComponents(
    new ButtonBuilder().setCustomId('button-splat-zones-register').setLabel('レーティング登録').setStyle(ButtonStyle.Secondary)
  )
}

export const createUpdateUsernameButton = () => {
  return new ButtonBuilder().setCustomId('button-update-username').setLabel('ユーザ名変更').setStyle(ButtonStyle.Secondary)
}
