// Require the necessary discord.js classes
import { Client, Intents, CommandInteraction } from 'discord.js'

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

require('dotenv').config()

const token = process.env.DISCORD_TOKEN

// Create a new client instance
const client = new Client({ intents: [Intents.FLAGS.GUILDS] })

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
  execute: (interaction: CommandInteraction) => Promise<void>
}

const handlers = new Map<string, CommandHandler>()
const pingHandler: CommandHandler = {
  commandName: 'sr-ping',
  execute: async (interaction) => {
    await interaction.reply(`Pong! User: ${interaction.user.username} Server info: ${interaction.guild?.name} ${interaction.guild?.id}`)
  },
}
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
].forEach((handler) => {
  handlers.set(handler.commandName, handler)
})

client.on('interactionCreate', async (interaction) => {
  if (!interaction.isCommand()) {
    return
  }

  const { commandName } = interaction
  console.log(commandName)
  console.log(interaction.user)

  const handler = handlers.get(commandName)
  if (handler) {
    handler.execute(interaction)
  }
})
