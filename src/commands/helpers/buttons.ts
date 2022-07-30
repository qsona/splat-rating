import { ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js'
import { SplatRuleSet } from '../../rules'

export const createRegisterButton = (rule: SplatRuleSet) => {
  return new ActionRowBuilder<ButtonBuilder>().addComponents(
    new ButtonBuilder().setCustomId(`button-register-${rule}`).setLabel('登録').setStyle(ButtonStyle.Primary)
  )
}

export const createJoinButton = () => {
  return new ActionRowBuilder<ButtonBuilder>().addComponents(new ButtonBuilder().setCustomId('button-join').setLabel('参加').setStyle(ButtonStyle.Primary))
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
