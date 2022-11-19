// Require the necessary discord.js classes
import { Client, GatewayIntentBits, CommandInteraction, InteractionType, Interaction, ChatInputCommandInteraction } from 'discord.js'

import registerHandler from './src/commands/register'
import newgameHandler from './src/commands/newgame'
import joinHandler from './src/commands/join'
import leaveHandler from './src/commands/leave'
import breakHandler from './src/commands/break'
import matchHandler from './src/commands/match'
import resultHandler from './src/commands/report'
import makeRegisterHandler from './src/commands/make-register'
import makeJoinHandler from './src/commands/make-join'
import makeLeaveHandler from './src/commands/make-leave'
import displayHandler from './src/commands/display'
import pingHandler from './src/commands/ping'
import separateHandler from './src/commands/separate'
import separationResetHandler from './src/commands/separation-reset'

import { tksPartyHandler, tksRecruitHandler } from './src/commands/tks'

import { execute as executeButtonHandlers } from './src/commands/buttonHandlers'
import { execute as executeModalHandlers } from './src/commands/modalHandlers'

require('dotenv').config()

const token = process.env.DISCORD_TOKEN

// Create a new client instance
const client = new Client({ intents: [GatewayIntentBits.Guilds] })

// When the client is ready, run this code (only once)
client.once('ready', () => {
  console.log('Ready!')
})

// Login to Discord with your client's token
if (token) {
  client.login(token)
} else {
  console.log('DISCORD_TOKEN is not set')
}

export interface CommandHandler {
  commandName: string
  execute: (interaction: ChatInputCommandInteraction) => Promise<void>
}

const handlers = new Map<string, CommandHandler>()

const helpHandler: CommandHandler = {
  commandName: 'sr-help',
  execute: async (interaction) => {
    await interaction.reply('参加する人は /sr-register でレーティング登録をして /sr-join で参加してね! \n参考URL: https://qsona.github.io/splat-rating/')
  },
}

;[
  registerHandler,
  newgameHandler,
  joinHandler,
  leaveHandler,
  matchHandler,
  breakHandler,
  resultHandler,
  makeRegisterHandler,
  makeJoinHandler,
  makeLeaveHandler,
  displayHandler,
  pingHandler,
  helpHandler,
  separateHandler,
  separationResetHandler,
  tksRecruitHandler,
  tksPartyHandler,
].forEach((handler) => {
  handlers.set(handler.commandName, handler)
})

client.on('interactionCreate', async (interaction) => {
  // if (interaction.type !== InteractionType.ApplicationCommand) {
  if (interaction.isChatInputCommand()) {
    const { commandName } = interaction
    console.log(commandName)
    console.log(interaction.user)

    const handler = handlers.get(commandName)
    if (handler) {
      await handler.execute(interaction)
    }
    return
  }

  if (interaction.isButton()) {
    await executeButtonHandlers(interaction)
    return
  }

  if (interaction.type === InteractionType.ModalSubmit) {
    await executeModalHandlers(interaction)
    return
  }
})
