import { ActionRowBuilder, ButtonBuilder, ButtonInteraction, ButtonStyle, ModalBuilder, TextInputBuilder, TextInputStyle } from 'discord.js'
import { joinButtonHandler } from './join'
import { leaveButtonHandler } from './leave'
import { reportWinButtonHandler, reportLoseButtonHandler, reportCancelButtonHandler } from './report'
import { matchButtonHandler } from './match'
import { splatZonesRegisterButtonHandler } from './register'
import { updateUsernameButtonHandler } from './updateUsername'

import {
  tksRoomJoinButtonHandler,
  tksLeaveRoomButtonHandler,
  tksBreakRoomButtonHandler,
  tksSetTeamNameButtonHandler,
  tksBreakPartyButtonHandler,
  tksFindOpponentButtonHandler,
  tksMatchButtonHandler,
  tksReportButtonHandler,
} from './tks'

export type ButtonCommandHandler = {
  customId: string
  execute: (interaction: ButtonInteraction) => Promise<void>
}

export type ButtonCommandWithDataHandler = {
  customId: string
  execute: (interaction: ButtonInteraction, data: string) => Promise<void>
}

const handlers = new Map<string, ButtonCommandHandler>()
const withDataHandlers = new Map<string, ButtonCommandWithDataHandler>()

export const execute = async (interaction: ButtonInteraction) => {
  const { customId } = interaction
  console.log('Button command customId:', customId)
  console.log('user:', interaction.user)

  const handler = handlers.get(customId)
  if (handler) {
    await handler.execute(interaction)
  }

  // customId@data
  const result = customId.match(/(.+?)@(.+)/)
  if (result) {
    const handler = withDataHandlers.get(result[1])
    if (handler) {
      await handler.execute(interaction, result[2])
    }
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
  customId: 'jump',
  execute: async (interaction) => {
    const rowDash = new ActionRowBuilder<ButtonBuilder>().addComponents(new ButtonBuilder().setCustomId('dash').setLabel('Dash!').setStyle(ButtonStyle.Danger))
    await interaction.reply({ content: '???????Jump', components: [rowDash], ephemeral: true })
  },
}

;[
  joinButtonHandler,
  leaveButtonHandler,
  reportWinButtonHandler,
  reportLoseButtonHandler,
  reportCancelButtonHandler,
  matchButtonHandler,
  splatZonesRegisterButtonHandler,
  updateUsernameButtonHandler,
  dashHandler,
  jumpHandler,
].forEach((handler) => handlers.set(handler.customId, handler))
;[
  tksRoomJoinButtonHandler,
  tksLeaveRoomButtonHandler,
  tksBreakRoomButtonHandler,
  tksSetTeamNameButtonHandler,
  tksBreakPartyButtonHandler,
  tksFindOpponentButtonHandler,
  tksMatchButtonHandler,
  tksReportButtonHandler,
].forEach((handler) => withDataHandlers.set(handler.customId, handler))
