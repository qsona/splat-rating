import { ActionRowBuilder, ModalBuilder, TextInputBuilder, SelectMenuBuilder, TextInputStyle } from 'discord.js'
import { SplatRuleSet, getRuleName } from '../../rules'

export const createRegisterAndJoinModal = (rule: SplatRuleSet) => {
  const ruleName = getRuleName(rule)
  const modal = new ModalBuilder().setCustomId(`modal-register-and-join-${rule}`).setTitle(`${ruleName} レーティング登録`)
  const gachiPowerInput = new TextInputBuilder()
    .setCustomId('gachipowerInput')
    .setLabel('ガチパワー (Xマッチでの平均的なパワー)')
    .setRequired(true)
    .setStyle(TextInputStyle.Short)
  const firstActionRow = new ActionRowBuilder<TextInputBuilder>().addComponents(gachiPowerInput)
  modal.addComponents(firstActionRow)
  return modal
}

export const createRegisterModal = (rule: SplatRuleSet) => {
  const ruleName = getRuleName(rule)
  const modal = new ModalBuilder().setCustomId(`modal-register-${rule}`).setTitle(`${ruleName} レーティング登録`)
  const gachiPowerInput = new TextInputBuilder()
    .setCustomId('gachipowerInput')
    .setLabel('ガチパワー (Xマッチでの平均的なパワー)')
    .setRequired(true)
    .setStyle(TextInputStyle.Short)
  const firstActionRow = new ActionRowBuilder<TextInputBuilder>().addComponents(gachiPowerInput)
  modal.addComponents(firstActionRow)
  return modal
}
